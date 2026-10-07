import { filter, orderBy, useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BusinessBreakdownDaily, BusinessBreakdownSeason, BusinessDaily, BusinessEvents, BusinessHourly, RecentSales, SalesPulse, SeasonDaily, SeasonLanding,
  SeasonPlan, StockOutlook,
} from "../../queries/live.query";
import type {
  BreakdownDim, BreakdownRow, BusinessBridge, BusinessChannel, BusinessDay, BusinessEvent, BusinessEventKind, BusinessMix, BusinessPart, BusinessPeriod,
  BusinessPulse, BusinessSale, BusinessSeason, BusinessSeasonDay, BusinessStock, BusinessStockLine, BusinessTotals, BusinessViewModel,
} from "../pages/business/model";
import { type Clock, COUNTRIES, type CountryCode, countryName, inScope, type Scope, type StoreFormat, VARIETIES, type Variety } from "../types";
import { bool, iso, type LivePage, n0, nOrNull, oneOf, POLL, positional, ROW_CAP, safely, sOrNull, useLive, whole, ymd } from "./live";

/*
 * Business: eleven queries on the business cadence (2 minutes) and the live sales (sales_pulse and
 * recent_sales) every 10 seconds. The headline numbers are the Library metrics on daily_store_sales (see
 * BusinessDaily); the region and country are applied here, so switching them never waits for a query
 * (only the newest sales are narrowed by the query itself). Each part of the view model loads and fails on
 * its own.
 *
 * Today's revenue: daily_store_sales refreshes every 2 minutes, sales_pulse every 10 seconds. The totals
 * stay on daily_store_sales, so every comparison and ratio is made of figures read together; the pulse
 * carries how far today's live revenue and pumpkins are ahead of them (`revenueAhead`, `unitsAhead`), which
 * only the hero's two numerals add, so they climb together between refreshes (never down: a fresher daily
 * figure wins).
 */

/** BusinessDaily's columns: its five breakouts, then its aggregations, in order. */
const DAILY = [
  "country", "daysAgo", "date", "weekend", "variety",
  "revenue", "plan", "ly", "grossMargin", "units", "lost", "lostLate", "shrink", "delivery",
  "lostShortage", "lostDemand", "shrinkTransit", "markdown", "online",
  "requested", "planUnits", "lyUnits", "planGrossMargin", "lyGrossMargin",
] as const;
/** BusinessBreakdownDaily's columns (BusinessBreakdownSeason: the same without daysAgo and date). */
const BREAKDOWN = [
  "country", "city", "cityName", "format", "daysAgo", "date",
  "revenue", "plan", "ly", "grossMargin", "planGrossMargin", "lyGrossMargin", "units", "planUnits", "lyUnits", "lost",
] as const;
const BREAKDOWN_SEASON = BREAKDOWN.filter(c => c !== "daysAgo" && c !== "date");
/** BusinessHourly's columns. */
const HOURLY = ["country", "daysAgo", "hour", "revenue"] as const;
/** SeasonLanding's columns. */
const LANDING = ["country", "mid", "low", "high"] as const;
/** StockOutlook's columns. */
const STOCK = [
  "country", "variety",
  "store", "hub", "transit", "harvest", "expected", "leftover", "low", "high", "cost", "retail", "markdown", "endUnits", "endCost", "november",
] as const;

/** An aggregated result, as the readers take it. */
type Data = { columns: unknown[]; rawRows: unknown[][]; rowCount: number | null } | null;

/** The sums every grouping adds up: daily_store_sales measures. */
type Sums = {
  revenue: number; plan: number; ly: number; grossMargin: number; planGrossMargin: number; lyGrossMargin: number;
  units: number; planUnits: number; lyUnits: number; lost: number;
};
type DailyRow = Sums & {
  country: CountryCode; daysAgo: number; date: string; weekend: boolean; variety: Variety | null;
  lostLate: number; shrink: number; delivery: number; lostShortage: number; lostDemand: number; shrinkTransit: number;
  markdown: number; online: number; requested: number;
};
type BreakdownLine = Sums & { country: CountryCode; city: string; cityName: string; format: StoreFormat | null; daysAgo: number; date: string };

const PERIODS: BusinessPeriod[] = ["today", "7d", "season"];
const inPeriod = (period: BusinessPeriod, daysAgo: number) => period === "today" ? daysAgo === 0 : period === "7d" ? daysAgo >= 0 && daysAgo <= 6 : true;
const CHART_DAYS = 28;
/** At most this many of the newest sales are asked for (the hero's live line shows the first, Live sales up to all). */
const RECENT = 20;
const FORMATS: StoreFormat[] = ["flagship", "standard", "express"];
const FORMAT_LABEL: Record<StoreFormat, string> = { flagship: "Flagship", standard: "Standard", express: "Express" };
const CHANNEL_LABEL: Record<BusinessChannel, string> = { in_store: "In store", online: "Online" };
const EVENT_KINDS: BusinessEventKind[] = ["storm", "breakdown", "ventilation", "hub_shortage"];
const isCountry = (v: unknown): v is CountryCode => COUNTRIES.some(c => c.code === v);
const sumOf = <R,>(rows: R[], key: keyof R) => rows.reduce((s, r) => s + (r[key] as number), 0);
const per = <T,>(make: (period: BusinessPeriod) => T) => Object.fromEntries(PERIODS.map(p => [p, make(p)])) as Record<BusinessPeriod, T>;
const sumsOf = <R extends Sums>(rows: R[]): Sums => ({
  revenue: sumOf(rows, "revenue"), plan: sumOf(rows, "plan"), ly: sumOf(rows, "ly"), grossMargin: sumOf(rows, "grossMargin"),
  planGrossMargin: sumOf(rows, "planGrossMargin"), lyGrossMargin: sumOf(rows, "lyGrossMargin"), units: sumOf(rows, "units"),
  planUnits: sumOf(rows, "planUnits"), lyUnits: sumOf(rows, "lyUnits"), lost: sumOf(rows, "lost"),
});
/** Rows grouped by a key, in the order the keys first appear. */
const groupBy = <R, K>(rows: R[], key: (row: R) => K) => {
  const out = new Map<K, R[]>();
  for (const r of rows) { const k = key(r); const list = out.get(k); if (list) list.push(r); else out.set(k, [r]); }
  return out;
};

/* ── Reading ─────────────────────────────────────────────── */

function readDaily(data: Data): DailyRow[] {
  return (positional(whole(data, ROW_CAP.aggregated), DAILY) ?? []).flatMap(r => {
    if (!isCountry(r.country)) return [];
    return [{
      country: r.country, daysAgo: n0(r.daysAgo), date: ymd(r.date), weekend: bool(r.weekend), variety: oneOf(r.variety, VARIETIES),
      revenue: n0(r.revenue), plan: n0(r.plan), ly: n0(r.ly), grossMargin: n0(r.grossMargin), units: n0(r.units),
      lost: n0(r.lost), lostLate: n0(r.lostLate), shrink: n0(r.shrink), delivery: n0(r.delivery),
      lostShortage: n0(r.lostShortage), lostDemand: n0(r.lostDemand), shrinkTransit: n0(r.shrinkTransit),
      markdown: n0(r.markdown), online: n0(r.online), requested: n0(r.requested), planUnits: n0(r.planUnits), lyUnits: n0(r.lyUnits),
      planGrossMargin: n0(r.planGrossMargin), lyGrossMargin: n0(r.lyGrossMargin),
    }];
  });
}

function readBreakdown(data: Data, season: boolean): BreakdownLine[] {
  const rows = season ? positional(whole(data, ROW_CAP.aggregated), BREAKDOWN_SEASON) : positional(whole(data, ROW_CAP.aggregated), BREAKDOWN);
  return (rows ?? []).flatMap(r => {
    if (!isCountry(r.country) || r.city == null) return [];
    const daysAgo = "daysAgo" in r ? n0(r.daysAgo) : 0, date = "date" in r ? ymd(r.date) : "";
    return [{
      country: r.country, city: String(r.city), cityName: sOrNull(r.cityName) ?? String(r.city), format: oneOf(r.format, FORMATS), daysAgo, date,
      revenue: n0(r.revenue), plan: n0(r.plan), ly: n0(r.ly), grossMargin: n0(r.grossMargin), planGrossMargin: n0(r.planGrossMargin),
      lyGrossMargin: n0(r.lyGrossMargin), units: n0(r.units), planUnits: n0(r.planUnits), lyUnits: n0(r.lyUnits), lost: n0(r.lost),
    }];
  });
}

type HourlyRow = { country: CountryCode; daysAgo: number; hour: number; revenue: number };

function readHourly(data: Data): HourlyRow[] {
  return (positional(whole(data, ROW_CAP.aggregated), HOURLY) ?? []).flatMap(r =>
    isCountry(r.country) ? [{ country: r.country, daysAgo: n0(r.daysAgo), hour: n0(r.hour), revenue: n0(r.revenue) }] : []);
}

const HOUR_FORMAT = new Map<string, Intl.DateTimeFormat>();
/** The local hour (0–23) of an instant in a zone. */
function localHour(at: Date, tz: string): number {
  let f = HOUR_FORMAT.get(tz);
  if (!f) HOUR_FORMAT.set(tz, f = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }));
  return Number(f.formatToParts(at).find(p => p.type === "hour")?.value ?? 0);
}

/**
 * Today's previous period: last week's revenue up to the same local time, per country, at `asOf` (the
 * simulated time today's revenue was read). The hours before the current local hour count in full, the
 * current hour for the share of it that has passed (the zones are all whole hours off UTC), later hours not
 * at all. A country with no sale yet today has not opened: it adds nothing.
 */
function prevToday(rows: HourlyRow[], countries: CountryCode[], asOf: number): number {
  const at = new Date(asOf);
  const partial = Math.min(1, (at.getUTCMinutes() + at.getUTCSeconds() / 60) / 60);
  let total = 0;
  for (const cc of countries) {
    if (!rows.some(r => r.country === cc && r.daysAgo === 0)) continue;
    const hour = localHour(at, COUNTRIES.find(c => c.code === cc)!.tz);
    for (const r of rows) {
      if (r.country !== cc || r.daysAgo !== 7 || r.hour > hour) continue;
      total += r.revenue * (r.hour < hour ? 1 : partial);
    }
  }
  return total;
}

/* ── Totals, days, mix, bridge ───────────────────────────── */

function totalsOf(rows: DailyRow[], period: BusinessPeriod, prevRevenue: number | null): BusinessTotals {
  const p = rows.filter(r => inPeriod(period, r.daysAgo));
  const shrink = sumOf(p, "shrink"), transit = sumOf(p, "shrinkTransit");
  const before = period === "7d" ? rows.filter(r => r.daysAgo >= 7 && r.daysAgo <= 13) : null;
  return {
    revenue: sumOf(p, "revenue"),
    revenueToday: sumOf(rows.filter(r => r.daysAgo === 0), "revenue"),
    planRevenue: sumOf(p, "plan"),
    lyRevenue: sumOf(p, "ly"),
    prevRevenue,
    grossMargin: sumOf(p, "grossMargin"),
    planGrossMargin: sumOf(p, "planGrossMargin"),
    lyGrossMargin: sumOf(p, "lyGrossMargin"),
    unitsSold: sumOf(p, "units"),
    unitsRequested: sumOf(p, "requested"),
    planUnits: sumOf(p, "planUnits"),
    lyUnits: sumOf(p, "lyUnits"),
    lostRevenue: sumOf(p, "lost"),
    lostByCause: { late_delivery: sumOf(p, "lostLate"), hub_shortage: sumOf(p, "lostShortage"), demand_above_plan: sumOf(p, "lostDemand") },
    shrinkTransit: transit,
    // The Shrink metric is the whole; what did not happen in transit happened on the shelf.
    shrinkShelf: Math.max(0, shrink - transit),
    deliveryCost: sumOf(p, "delivery"),
    markdown: sumOf(p, "markdown"),
    prev: before && {
      revenue: sumOf(before, "revenue"), grossMargin: sumOf(before, "grossMargin"), unitsSold: sumOf(before, "units"),
      deliveryCost: sumOf(before, "delivery"), shrink: sumOf(before, "shrink"),
    },
  };
}

/*
 * The chart's columns are local calendar dates: a store's sales count on its own local date, so in the UTC
 * evening Japan's Thursday sits under Thursday while Europe and North America are still on Wednesday. The
 * periods (today, 7 days, season) stay on days_ago: each store's own local today.
 */

const DAY_MS = 86_400_000;
/** A local date ("2026-10-28") moved by `days`. */
const addDays = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
/** Saturday or Sunday, for a date that has no row (the rows carry is_weekend). */
const weekendOf = (date: string) => { const dow = new Date(`${date}T00:00:00Z`).getUTCDay(); return dow === 0 || dow === 6; };

/**
 * The chart's 28 local dates, oldest first, ending on the latest date with revenue or plan in these rows: a
 * country whose new day has begun but whose stores have not opened (no sales, its plan paced to zero) adds
 * no empty column. Fewer early in the season.
 */
function chartDates(rows: { date: string; revenue: number; plan: number }[]): string[] {
  let first = "", last = "";
  for (const r of rows) {
    if (!r.date) continue;
    if (!first || r.date < first) first = r.date;
    if ((r.revenue > 0 || r.plan > 0) && r.date > last) last = r.date;
  }
  if (!last) return [];
  return Array.from({ length: CHART_DAYS }, (_, i) => addDays(last, i - (CHART_DAYS - 1))).filter(date => date >= first);
}

/** Each country's local today: the local_date of its days_ago 0. */
function todaysOf(rows: { country: CountryCode; daysAgo: number; date: string }[]): Map<CountryCode, string> {
  const out = new Map<CountryCode, string>();
  for (const r of rows) if (r.daysAgo === 0 && r.date) out.set(r.country, r.date);
  return out;
}

/**
 * The scope's local today, for "vs last Thursday": the latest local today in scope where the day has begun
 * (revenue or plan), else the latest local today.
 */
function todayOf(rows: DailyRow[]): string | undefined {
  let active = "", any = "";
  for (const r of rows) {
    if (r.daysAgo !== 0 || !r.date) continue;
    if (r.date > any) any = r.date;
    if ((r.revenue > 0 || r.plan > 0) && r.date > active) active = r.date;
  }
  return active || any || undefined;
}

/**
 * Daily revenue's columns, oldest first: each local date's sums over the stores in scope. A date is partial
 * (so far) when a store in scope is on it as its local today.
 */
function daysOf(rows: DailyRow[]): BusinessDay[] {
  const byDate = groupBy(rows, r => r.date);
  return chartDates(rows).map(date => {
    const day = byDate.get(date) ?? [];
    return {
      date,
      revenue: sumOf(day, "revenue"),
      planRevenue: sumOf(day, "plan"),
      lyRevenue: sumOf(day, "ly"),
      grossMargin: sumOf(day, "grossMargin"),
      unitsSold: sumOf(day, "units"),
      deliveryCost: sumOf(day, "delivery"),
      shrink: sumOf(day, "shrink"),
      lostRevenue: sumOf(day, "lost"),
      isWeekend: day.length ? day[0].weekend : weekendOf(date),
      isPartial: day.some(r => r.daysAgo === 0),
    };
  });
}

function mixOf(rows: DailyRow[], period: BusinessPeriod): BusinessMix {
  const p = rows.filter(r => inPeriod(period, r.daysAgo));
  const revenue = sumOf(p, "revenue"), online = sumOf(p, "online");
  return {
    varieties: VARIETIES.map(variety => {
      const v = p.filter(r => r.variety === variety);
      return { variety, revenue: sumOf(v, "revenue"), grossMargin: sumOf(v, "grossMargin"), lyRevenue: sumOf(v, "ly"), units: sumOf(v, "units") };
    }),
    // No unit count by channel: the "each" note is left out.
    channels: [
      { channel: "in_store", revenue: Math.max(0, revenue - online), units: null },
      { channel: "online", revenue: online, units: null },
    ],
  };
}

/**
 * Plan to actual (model.ts BusinessBridge): volume prices the demand above or below plan at the plan's
 * average price; mix is what is left of demand at plan prices; then the lost sales by cause.
 */
function bridgeOf(rows: DailyRow[], period: BusinessPeriod): BusinessBridge {
  const p = rows.filter(r => inPeriod(period, r.daysAgo));
  const plan = sumOf(p, "plan"), planUnits = sumOf(p, "planUnits"), requested = sumOf(p, "requested");
  const revenue = sumOf(p, "revenue"), lost = sumOf(p, "lost");
  const volume = planUnits ? (requested - planUnits) * plan / planUnits : 0;
  return {
    plan,
    volume,
    mix: revenue + lost - plan - volume,
    lostByCause: { late_delivery: sumOf(p, "lostLate"), hub_shortage: sumOf(p, "lostShortage"), demand_above_plan: sumOf(p, "lostDemand") },
    actual: revenue,
  };
}

/* ── Breakdown ───────────────────────────────────────────── */

type TrendRow = { country: CountryCode; date: string; revenue: number; plan: number };

/**
 * Where a row's trend runs on the chart's dates, by the same rule as the chart's columns: it ends on the
 * row's latest date with revenue or plan, so a date its stores have not reached, or a new day they have not
 * opened yet, is a gap (NaN), not a fall to zero. The first date that is a local today of the row's stores
 * starts the partial part.
 */
function trendSpan(rows: TrendRow[], dates: string[], todays: Map<CountryCode, string>): { reached: (date: string) => boolean; partialFrom?: number } {
  let end = "";
  for (const r of rows) if ((r.revenue > 0 || r.plan > 0) && r.date > end) end = r.date;
  const own = new Set([...new Set(rows.map(r => r.country))].map(c => todays.get(c)).filter((d): d is string => !!d));
  const reached = (date: string) => !end || date <= end;
  const from = dates.findIndex(date => own.has(date) && reached(date));
  return { reached, ...(from >= 0 ? { partialFrom: from } : {}) };
}

/** A Breakdown row's numbers: the period's sums and each metric on the chart's local dates. */
function rowNumbers(sums: Sums, trendRows: (Sums & TrendRow)[], dates: string[], todays: Map<CountryCode, string>): Pick<BreakdownRow, "values" | "lostShare" | "trend" | "partialFrom"> {
  const byDate = groupBy(trendRows, r => r.date);
  const { reached, partialFrom } = trendSpan(trendRows, dates, todays);
  const daily = dates.map(date => reached(date) ? sumsOf(byDate.get(date) ?? []) : null);
  const series = (pick: (s: Sums) => number) => daily.map(s => s ? pick(s) : NaN);
  return {
    values: {
      revenue: { value: sums.revenue, plan: sums.plan, ly: sums.ly },
      margin: { value: sums.grossMargin, plan: sums.planGrossMargin, ly: sums.lyGrossMargin },
      units: { value: sums.units, plan: sums.planUnits, ly: sums.lyUnits },
      lost: { value: sums.lost, plan: null, ly: null },
    },
    lostShare: sums.revenue + sums.lost ? sums.lost / (sums.revenue + sums.lost) : null,
    trend: { revenue: series(s => s.revenue), margin: series(s => s.grossMargin), units: series(s => s.units), lost: series(s => s.lost) },
    ...(partialFrom != null ? { partialFrom } : {}),
  };
}

/**
 * The Breakdown table per dimension and period. Country rows hold every country of the scope's region;
 * the other dimensions are narrowed to the scope. Country, variety and channel come from BusinessDaily;
 * city and store format from the two breakdown queries. Trends run on the chart's local dates (Daily
 * revenue's, for the countries the table covers).
 */
function breakdownOf(all: DailyRow[], scoped: CountryCode[], regional: CountryCode[], bdDaily: BreakdownLine[], bdSeason: BreakdownLine[]): Record<BreakdownDim, Record<BusinessPeriod, BreakdownRow[]>> {
  const todays = todaysOf(all);
  const mine = all.filter(r => scoped.includes(r.country));
  const dates = chartDates(mine), regionDates = chartDates(all.filter(r => regional.includes(r.country)));
  const cityRows = bdDaily.filter(r => scoped.includes(r.country)), citySeason = bdSeason.filter(r => scoped.includes(r.country));
  const linesFor = (period: BusinessPeriod) => period === "season" ? citySeason : cityRows.filter(r => inPeriod(period, r.daysAgo));

  return {
    country: per(period => regional.map(code => {
      const rows = all.filter(r => r.country === code);
      const meta = COUNTRIES.find(c => c.code === code)!;
      return { key: code, label: meta.name, country: { code, region: meta.region }, ...rowNumbers(sumsOf(rows.filter(r => inPeriod(period, r.daysAgo))), rows, regionDates, todays) };
    })),
    city: per(period => [...groupBy(linesFor(period), r => r.city)].map(([city, rows]) => ({
      key: city, label: rows[0].cityName, sublabel: countryName(rows[0].country), countryCode: rows[0].country, cityKey: city,
      ...rowNumbers(sumsOf(rows), cityRows.filter(r => r.city === city), dates, todays),
    }))),
    format: per(period => [...groupBy(linesFor(period).filter(r => r.format), r => r.format as StoreFormat)].map(([format, rows]) => ({
      key: format, label: FORMAT_LABEL[format], format,
      ...rowNumbers(sumsOf(rows), cityRows.filter(r => r.format === format), dates, todays),
    }))),
    variety: per(period => VARIETIES.flatMap(variety => {
      const rows = mine.filter(r => r.variety === variety);
      return rows.length ? [{ key: variety, label: variety, ...rowNumbers(sumsOf(rows.filter(r => inPeriod(period, r.daysAgo))), rows, dates, todays) }] : [];
    })),
    channel: per(period => {
      if (!mine.length) return [];
      const p = mine.filter(r => inPeriod(period, r.daysAgo));
      const online = sumOf(p, "online"), revenue = sumOf(p, "revenue");
      const byDate = groupBy(mine, r => r.date);
      const { reached, partialFrom } = trendSpan(mine, dates, todays);
      const trend = (pick: (day: DailyRow[]) => number) => dates.map(date => reached(date) ? pick(byDate.get(date) ?? []) : NaN);
      const row = (channel: BusinessChannel, value: number, series: number[]): BreakdownRow => ({
        key: channel, label: CHANNEL_LABEL[channel], values: { revenue: { value, plan: null, ly: null } }, lostShare: null, trend: { revenue: series },
        ...(partialFrom != null ? { partialFrom } : {}),
      });
      return [
        row("in_store", Math.max(0, revenue - online), trend(day => Math.max(0, sumOf(day, "revenue") - sumOf(day, "online")))),
        row("online", online, trend(day => sumOf(day, "online"))),
      ];
    }),
  };
}

/* ── Season, stock, pulse, events ────────────────────────── */

/** season_daily over the scope: a day's actual counts only once every country in scope has reached it. */
function curveOf(data: { rows: Record<string, unknown>[] }, scoped: CountryCode[]): BusinessSeasonDay[] {
  const rows = data.rows.filter(r => scoped.includes(sOrNull(r.country_code) as CountryCode));
  return [...groupBy(rows, r => ymd(r.local_date))].sort((a, b) => a[0].localeCompare(b[0])).map(([date, day]) => {
    const actual = day.map(r => nOrNull(r.cum_revenue_usd));
    return {
      date,
      cumPlan: day.reduce((s, r) => s + n0(r.cum_plan_revenue_usd), 0),
      cumLy: day.reduce((s, r) => s + n0(r.cum_ly_revenue_usd), 0),
      cumRevenue: actual.every((v): v is number => v != null) && day.length === scoped.length ? actual.reduce((s, v) => s + v, 0) : null,
      isToday: day.some(r => bool(r.is_today)),
      daysToHalloween: n0(day[0].days_to_halloween),
    };
  });
}

const STOCK_KEYS = ["storeUnits", "hubUnits", "transitUnits", "harvestPlan", "expectedSales", "leftover", "leftoverLow", "leftoverHigh", "leftoverCost",
  "leftoverRetail", "markdownExposure", "seasonEndUnits", "seasonEndCost", "novemberSales"] as const;
const emptyLine = (): Required<BusinessStockLine> => Object.fromEntries(STOCK_KEYS.map(k => [k, 0])) as Required<BusinessStockLine>;

/** stock_outlook over the scope: each variety added up over the countries, then the varieties added up. */
function stockOf(data: Data, scoped: CountryCode[]): BusinessStock {
  const rows = (positional(whole(data, ROW_CAP.aggregated), STOCK) ?? []).filter(r => scoped.includes(r.country as CountryCode));
  const lineOf = (r: (typeof rows)[number]): Required<BusinessStockLine> => ({
    storeUnits: n0(r.store), hubUnits: n0(r.hub), transitUnits: n0(r.transit), harvestPlan: n0(r.harvest), expectedSales: n0(r.expected),
    leftover: n0(r.leftover), leftoverLow: n0(r.low), leftoverHigh: n0(r.high), leftoverCost: n0(r.cost), leftoverRetail: n0(r.retail),
    markdownExposure: n0(r.markdown), seasonEndUnits: n0(r.endUnits), seasonEndCost: n0(r.endCost), novemberSales: n0(r.november),
  });
  const add = (a: Required<BusinessStockLine>, b: Required<BusinessStockLine>) =>
    Object.fromEntries(STOCK_KEYS.map(k => [k, a[k] + b[k]])) as Required<BusinessStockLine>;
  const varieties = VARIETIES.map(variety => ({ variety, ...rows.filter(r => r.variety === variety).map(lineOf).reduce(add, emptyLine()) }));
  return { varieties, total: varieties.reduce<Required<BusinessStockLine>>((t, { variety: _, ...line }) => add(t, line), emptyLine()) };
}

function saleOf(r: Record<string, unknown>): BusinessSale | null {
  const countryCode = sOrNull(r.country_code), variety = oneOf(r.variety_name, VARIETIES), channel = oneOf(r.channel, ["in_store", "online"] as const);
  if (!isCountry(countryCode) || !variety || !channel) return null;
  return {
    id: String(r.sale_id), soldAt: iso(r.sold_at) ?? "", secondsAgo: n0(r.seconds_ago), storeId: n0(r.store_id), storeName: String(r.store_name ?? ""),
    cityName: String(r.city_name ?? ""), countryCode, variety, channel, units: n0(r.units), amount: n0(r.amount_usd),
  };
}

/** One business_events row; it sits on the Daily revenue column of its own local_date. */
function eventOf(r: Record<string, unknown>): BusinessEvent | null {
  const countryCode = sOrNull(r.country_code), kind = oneOf(r.kind, EVENT_KINDS);
  if (!isCountry(countryCode) || !kind) return null;
  return {
    id: String(r.event_id), kind, date: ymd(r.local_date),
    startedAt: iso(r.started_at) ?? "", endedAt: iso(r.ended_at), countryCode, title: String(r.title ?? ""), detail: String(r.detail ?? ""),
    lostRevenue: n0(r.lost_revenue_usd), truckId: sOrNull(r.truck_id), hubId: sOrNull(r.hub_id),
  };
}

/* ── Hook ────────────────────────────────────────────────── */

/** The scope each newest-sales result was first seen under (results outlive a page through useLive's session cache). */
const RECENT_SCOPE = new WeakMap<object, string>();
/** The second wave of the page's queries starts this long after the page at the latest (ms). */
const WAVE_MS = 2_500;

/** A part read from one or more results: its value, or the error of the first that failed. */
type Read<T> = { value: T | null; error: string | null };
const none = <T,>(): Read<T> => ({ value: null, error: null });

export function useBusinessData(scope: Scope, clock?: Clock): LivePage<BusinessViewModel> {
  const q = POLL.business;
  /*
   * Two waves. The top of the page (its figures, tiles, Daily revenue, Plan to actual, Mix and the live line) asks
   * first; the season curve, stock at risk, events and the breakdown follow once the daily sales are in (or after
   * WAVE_MS whatever happens). Thirteen queries at once (with the shell's) made each of them slow, and some failed
   * for want of a database connection, then waited out their retries.
   */
  const daily = useLive(useMetabaseQuery(BusinessDaily), "daily", q, "sales");
  const [waited, setWaited] = useState(false);
  useEffect(() => { const id = setTimeout(() => setWaited(true), WAVE_MS); return () => clearTimeout(id); }, []);
  const second = useMemo(() => ({ enabled: waited || daily.data != null }), [waited, daily.data != null]);
  const hourly = useLive(useMetabaseQuery(BusinessHourly), "hourly", q, "hourly sales");
  const plan = useLive(useMetabaseQuery(SeasonPlan), "season", q, "the season plan");
  const seasonDaily = useLive(useMetabaseQuery(SeasonDaily, second), "season-daily", q, "the season curve");
  const landing = useLive(useMetabaseQuery(SeasonLanding), "landing", q, "the season landing");
  const stock = useLive(useMetabaseQuery(StockOutlook, second), "stock", q, "stock at risk");
  const events = useLive(useMetabaseQuery(BusinessEvents, second), "events", q, "events");
  const bdDaily = useLive(useMetabaseQuery(BusinessBreakdownDaily, second), "breakdown-daily", q, "the breakdown");
  const bdSeason = useLive(useMetabaseQuery(BusinessBreakdownSeason, second), "breakdown-season", q, "the breakdown");
  const pulse = useLive(useMetabaseQuery(SalesPulse), "pulse", POLL.pulse, "live sales");
  // The newest sales of the scope. The key stays the same across scopes: the hook narrows the kept rows too,
  // so while a new scope loads the line shows the newest sale of the old rows that are in it.
  const recentFor = useMemo(() => {
    const f = RecentSales.source.fields;
    return {
      filters: scope.country ? [filter(f.countryCode, "=", scope.country)] : scope.region !== "all" ? [filter(f.regionCode, "=", scope.region)] : [],
      orderBys: [orderBy(f.soldAt, "desc")],
      limit: RECENT,
    };
  }, [scope.country, scope.region]);
  const recent = useLive(useMetabaseQuery(RecentSales, recentFor), "recent", POLL.pulse, "live sales");

  /*
   * Each result is read once when it arrives, then narrowed to the scope; each part is its own memo. The live
   * sales arrive every 10 seconds and only rebuild the pulse, so the rest of the page keeps its objects (and
   * its sections skip the re-render).
   */
  const scopeKey = `${scope.region}|${scope.country ?? ""}`;
  const scoped = useMemo(() => COUNTRIES.filter(c => inScope(scope, c.region, c.code)).map(c => c.code), [scope.region, scope.country]);
  const regional = useMemo(() => COUNTRIES.filter(c => inScope({ ...scope, country: null }, c.region)).map(c => c.code), [scope.region]);

  const allRead = useMemo(() => daily.data ? safely(() => readDaily(daily.data), "sales") : none<DailyRow[]>(), [daily.data]);
  const hourlyRead = useMemo(() => hourly.data ? safely(() => readHourly(hourly.data), "hourly sales") : none<HourlyRow[]>(), [hourly.data]);
  const bdDailyRead = useMemo(() => bdDaily.data ? safely(() => readBreakdown(bdDaily.data, false), "the breakdown") : none<BreakdownLine[]>(), [bdDaily.data]);
  const bdSeasonRead = useMemo(() => bdSeason.data ? safely(() => readBreakdown(bdSeason.data, true), "the breakdown") : none<BreakdownLine[]>(), [bdSeason.data]);
  const all = allRead.value;
  const dailyError = daily.error ?? allRead.error;
  const rows = useMemo(() => all?.filter(r => scoped.includes(r.country)) ?? null, [all, scoped]);

  // The simulated clock runs at real speed: its offset from the client clock dates when today's revenue was
  // read, so "vs last Wednesday" compares the same minutes and only moves when the daily figures do.
  const now = clock?.now;
  const simOffset = useMemo(() => now ? Date.parse(now) - Date.now() : null, [now]);
  const asOf = daily.receivedAt != null && simOffset != null && Number.isFinite(simOffset) ? Math.floor((daily.receivedAt + simOffset) / 60_000) * 60_000 : null;
  const prev = useMemo(() => hourlyRead.value && asOf != null ? prevToday(hourlyRead.value, scoped, asOf) : null, [hourlyRead.value, scoped, asOf]);

  // daily_store_sales: totals, days, mix, bridge (and the country, variety and channel rows of the breakdown)
  const totals = useMemo(() => rows ? per(period => totalsOf(rows, period,
    period === "today" ? prev : period === "7d" ? sumOf(rows.filter(r => r.daysAgo >= 7 && r.daysAgo <= 13), "revenue") : null)) : undefined, [rows, prev]);
  const days = useMemo(() => rows ? daysOf(rows) : undefined, [rows]);
  const today = useMemo(() => rows ? todayOf(rows) : undefined, [rows]);
  const mix = useMemo(() => rows ? per(period => mixOf(rows, period)) : undefined, [rows]);
  const bridge = useMemo(() => rows ? per(period => bridgeOf(rows, period)) : undefined, [rows]);

  // season_plan + season_landing + season_daily
  const landingRead = useMemo(() => landing.data ? safely(() => positional(whole(landing.data, ROW_CAP.aggregated), LANDING) ?? [], "the season landing") : none<Record<(typeof LANDING)[number], unknown>[]>(), [landing.data]);
  const curveRead = useMemo(() => seasonDaily.data ? safely(() => whole(seasonDaily.data, ROW_CAP.rows), "the season curve") : none<{ rows: Record<string, unknown>[] }>(), [seasonDaily.data]);
  const season = useMemo((): Read<BusinessSeason> => {
    if (!plan.data) return none();
    const p = plan.data.rows.filter(r => scoped.includes(sOrNull(r.country_code) as CountryCode));
    const sum = (key: string) => p.reduce((s, r) => s + n0(r[key as keyof typeof r]), 0);
    const land = landingRead.value?.filter(r => scoped.includes(r.country as CountryCode));
    const curve = curveRead.value ? safely(() => curveOf(curveRead.value!, scoped), "the season curve") : none<BusinessSeasonDay[]>();
    return {
      value: {
        revenueToDate: sum("revenue_to_date_usd"),
        planToDate: sum("plan_to_date_revenue_usd"),
        seasonPlan: sum("season_plan_revenue_usd"),
        lySeason: sum("ly_season_revenue_usd"),
        lyToDate: sum("ly_to_date_revenue_usd"),
        daysLeft: Math.max(0, ...plan.data.rows.map(r => n0(r.days_left))),
        landing: land?.length ? {
          mid: land.reduce((s, r) => s + n0(r.mid), 0),
          low: land.reduce((s, r) => s + n0(r.low), 0),
          high: land.reduce((s, r) => s + n0(r.high), 0),
        } : null,
        curve: curve.value ?? undefined,
      },
      error: landingRead.error ?? curve.error,
    };
  }, [plan.data, landingRead, curveRead, scoped]);

  // stock_outlook
  const stockRead = useMemo(() => stock.data ? safely(() => stockOf(stock.data, scoped), "stock at risk") : none<BusinessStock>(), [stock.data, scoped]);

  // business_events, each on its own local date
  const eventsRead = useMemo(() => {
    const data = events.data;
    if (!data) return none<BusinessEvent[]>();
    return safely(() => whole(data, ROW_CAP.rows).rows.filter(r => scoped.includes(sOrNull(r.country_code) as CountryCode))
      .flatMap(r => { const e = eventOf(r); return e ? [e] : []; }), "events");
  }, [events.data, scoped]);

  // The breakdown: country, variety and channel from daily_store_sales; city and format from the breakdown queries.
  const breakdown = useMemo(() => all && bdDailyRead.value && bdSeasonRead.value
    ? safely(() => breakdownOf(all, scoped, regional, bdDailyRead.value!, bdSeasonRead.value!), "the breakdown")
    : none<Record<BreakdownDim, Record<BusinessPeriod, BreakdownRow[]>>>(), [all, bdDailyRead.value, bdSeasonRead.value, scoped, regional]);

  // Each country's revenue and pumpkins so far today in daily_store_sales, with its local date: what the pulse is ahead of.
  const dailyToday = useMemo(() => {
    const out = new Map<CountryCode, { date: string; revenue: number; units: number }>();
    for (const r of all ?? []) {
      if (r.daysAgo !== 0) continue;
      const t = out.get(r.country);
      if (t) { t.revenue += r.revenue; t.units += r.units; } else out.set(r.country, { date: r.date, revenue: r.revenue, units: r.units });
    }
    return out;
  }, [all]);

  // The scope the newest sales were asked for: until the new scope's arrive, the kept rows may not hold any
  // of its sales, and "No sales" would be wrong.
  // Kept by result, not by mount: the session cache (useLive) brings back the last scope's rows on a new visit.
  if (recent.data && !RECENT_SCOPE.has(recent.data)) RECENT_SCOPE.set(recent.data, scopeKey);
  const recentStale = recent.data != null && RECENT_SCOPE.get(recent.data) !== scopeKey;

  // sales_pulse + recent_sales, narrowed to the scope: every 10 seconds.
  const pulsePart = useMemo((): BusinessPulse | undefined => {
    if (!pulse.data || !recent.data) return undefined;
    const pulseRows = pulse.data.rows.filter(r => scoped.includes(sOrNull(r.country_code) as CountryCode));
    const sales = recent.data.rows.flatMap(r => {
      const sale = saleOf(r);
      return sale && scoped.includes(sale.countryCode) ? [sale] : [];
    }).sort((a, b) => a.secondsAgo - b.secondsAgo).slice(0, RECENT);
    if (!sales.length && recentStale) return undefined;
    // Today's revenue and pumpkins the pulse has and daily_store_sales does not yet, country by country, while
    // both are on the same local day (never below zero: a fresher daily figure wins). units_today joined
    // SalesPulse after the rest: a saved question synced before it has no such column, and the pumpkins then
    // wait for the daily refresh.
    const hasUnits = pulse.data.columns.some(c => c.name === "units_today");
    let ahead = 0, unitsAhead = 0;
    for (const r of pulseRows) {
      const today = dailyToday.get(r.country_code as CountryCode);
      if (!today || ymd(r.local_date) !== today.date) continue;
      ahead += Math.max(0, n0(r.revenue_today_usd) - today.revenue);
      if (hasUnits) unitsAhead += Math.max(0, n0(r.units_today) - today.units);
    }
    // revenue_last_hour_usd joined SalesPulse later than the other columns: a saved question synced before it
    // has no such column, and the count then shows alone.
    const hasHourRevenue = pulse.data.columns.some(c => c.name === "revenue_last_hour_usd");
    return {
      revenueToday: pulseRows.reduce((s, r) => s + n0(r.revenue_today_usd), 0),
      revenueAhead: ahead,
      unitsAhead,
      salesLastHour: pulseRows.reduce((s, r) => s + n0(r.sales_last_hour), 0),
      revenueLastHour: hasHourRevenue ? pulseRows.reduce((s, r) => s + n0(r.revenue_last_hour_usd), 0) : null,
      recent: sales,
      receivedAt: recent.receivedAt ?? Date.now(),
    };
  }, [pulse.data, recent.data, recent.receivedAt, scoped, recentStale, dailyToday]);

  const failed = useMemo(() => {
    const out: Partial<Record<BusinessPart, string>> = {};
    if (dailyError) for (const part of ["totals", "days", "mix", "bridge"] as const) out[part] = dailyError;
    const pulseError = pulse.error ?? recent.error;
    if (pulseError) out.pulse = pulseError;
    const seasonError = plan.error ?? seasonDaily.error ?? landing.error ?? season.error;
    if (seasonError) out.season = seasonError;
    if (stock.error ?? stockRead.error) out.stock = (stock.error ?? stockRead.error)!;
    if (events.error ?? eventsRead.error) out.events = (events.error ?? eventsRead.error)!;
    const bdError = dailyError ?? bdDaily.error ?? bdSeason.error ?? bdDailyRead.error ?? bdSeasonRead.error ?? breakdown.error;
    if (bdError) out.breakdown = bdError;
    return Object.keys(out).length ? out : undefined;
  }, [dailyError, pulse.error, recent.error, plan.error, seasonDaily.error, landing.error, season.error, stock.error, stockRead.error,
    events.error, eventsRead.error, bdDaily.error, bdSeason.error, bdDailyRead.error, bdSeasonRead.error, breakdown.error]);

  // A part is as fresh as the oldest of the results it is built from.
  const updatedAt = useMemo(() => {
    const out: Partial<Record<BusinessPart, number>> = {};
    const at = (part: BusinessPart, ready: unknown, ...times: (number | null)[]) => {
      const known = times.filter((t): t is number => t != null);
      if (ready && known.length) out[part] = Math.min(...known);
    };
    for (const part of ["totals", "days", "mix", "bridge"] as const) at(part, rows, daily.receivedAt);
    at("season", season.value, plan.receivedAt, landing.receivedAt, seasonDaily.receivedAt);
    at("stock", stockRead.value, stock.receivedAt);
    at("events", eventsRead.value, events.receivedAt);
    at("breakdown", breakdown.value, daily.receivedAt, bdDaily.receivedAt, bdSeason.receivedAt);
    at("pulse", pulsePart, recent.receivedAt, pulse.receivedAt);
    return out;
  }, [rows, daily.receivedAt, season.value, plan.receivedAt, landing.receivedAt, seasonDaily.receivedAt, stockRead.value, stock.receivedAt,
    eventsRead.value, events.receivedAt, breakdown.value, bdDaily.receivedAt, bdSeason.receivedAt, pulsePart, recent.receivedAt, pulse.receivedAt]);

  // The 2-minute queries: the live sales poll every 10 seconds on their own and never dim the page.
  const slow = [daily, hourly, plan, seasonDaily, landing, stock, events, bdDaily, bdSeason];
  // Every refetch is stable (useLive), so the list is the same functions on every render.
  const refetches = [...slow, pulse, recent].map(l => l.refetch);
  const retry = useCallback(() => { for (const refetch of refetches) refetch(); }, refetches);

  const vm = useMemo((): BusinessViewModel => ({
    totals,
    season: season.value ?? undefined,
    days,
    today,
    pulse: pulsePart,
    events: eventsRead.value ?? undefined,
    bridge,
    stock: stockRead.value ?? undefined,
    breakdown: breakdown.value ?? undefined,
    mix,
    updatedAt,
    failed,
    retry,
  }), [totals, season.value, days, today, pulsePart, eventsRead.value, bridge, stockRead.value, breakdown.value, mix, updatedAt, failed, retry]);
  return { vm, refreshing: slow.some(l => l.refreshing), retry };
}
