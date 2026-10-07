/*
 * Sales histories for the City and Store fixtures, so the time switch (Today · Yesterday · 7 days · 30 days) has
 * something to show in the preview. Each store keeps today's figures exactly as the mockups print them; the days
 * before run up to Halloween (about 43% of yesterday's sales 30 days ago, weekends busier), with fixed wiggles
 * instead of randomness, so every run is the same. The figures and charts are built with src/data/periods.ts, as
 * the live hook builds them, and the stores' week and season numbers are summed from the same days.
 */
import { type DayClock, dayClock, type DayRow, daySeries, type HourRow, hourSeries, shiftDate, totalsByStore, totalsOf } from "../data/periods";
import { DRILL_PERIODS, type DrillPeriod, type PeriodSeries, type PeriodTotals } from "../types";

/** How one store's season went, as far as the fixtures need it. */
export type StoreStory = {
  storeId: number;
  /** The local date today. */
  today: string;
  /** The local opening hours, [first, end). */
  span: [number, number];
  /** Today so far, as the mockup prints it (store_now's today columns), with the plan paced to now. */
  todayTotals: PeriodTotals;
  /** Today's started hours, [hour, sold, lost, lost USD], adding up to todayTotals; revenue is spread by units sold. */
  todayHours?: [number, number, number, number][];
  /** Pumpkins sold yesterday, a full day: the scale of the run-up. */
  yesterdayUnits: number;
  /** Average price of a pumpkin. */
  price: number;
  /** Revenue against plan on a usual day (−0.15: 15% under plan). */
  vsPlan: number;
  /** Earlier days that lost sales to a stockout: days_ago → [units, USD]. */
  lost?: Record<number, [number, number]>;
  /** Yesterday's lost sales by hour, [hour, units, USD], adding up to lost[1]. */
  lostHours?: [number, number, number][];
  /** Phase of the wiggles, so stores do not move in lockstep. */
  seed: number;
};

/** A store's daily rows (today first, the whole season), today's hours and yesterday's hours. */
export type StoreHistory = { storeId: number; days: DayRow[]; today: HourRow[]; yesterday: HourRow[] };

/** Days back to Sep 1, the season's first day. */
const SEASON_DAYS = 58;
const WEEKDAY = [1.1, 0.94, 1, 1, 1, 1.06, 1.18]; // Sun..Sat
const weekday = (ymd: string) => WEEKDAY[new Date(`${ymd}T12:00:00Z`).getUTCDay()];
/** The run-up to Halloween: yesterday is 1, a month back about 0.43. */
const runUp = (daysAgo: number) => 0.3 + 0.7 * Math.exp(-0.06 * (daysAgo - 1));
const round2 = (v: number) => Math.round(v * 100) / 100;

/** Whole parts of `total` in proportion to `weights` (largest remainders get the leftovers). */
function apportion(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map(w => total * w / sum);
  const parts = raw.map(Math.floor);
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0, left = total - parts.reduce((a, b) => a + b, 0); k < left; k++) parts[order[k % order.length][1]]++;
  return parts;
}

/** A day's revenue over its hours, by units sold; the last hour takes the rounding. */
function spreadRevenue(units: number[], revenue: number): number[] {
  const total = units.reduce((a, b) => a + b, 0);
  const out = units.map(u => total ? round2(revenue * u / total) : 0);
  if (out.length) out[out.length - 1] = round2(revenue - out.slice(0, -1).reduce((a, b) => a + b, 0));
  return out;
}

/** Hour rows from [hour, sold, lost, lost USD], with the day's revenue spread over them by units sold. */
export function hourRowsOf(storeId: number, rows: [number, number, number, number][], revenueUsd: number): HourRow[] {
  const revenue = spreadRevenue(rows.map(r => r[1]), revenueUsd);
  return rows.map(([hour, soldUnits, lostUnits, lostUsd], i) => ({ storeId, hour, soldUnits, revenueUsd: revenue[i], lostUnits, lostUsd }));
}

/** The store's season, day by day, and its hours today and yesterday. */
export function historyOf(s: StoreStory): StoreHistory {
  const { seed } = s;
  const days: DayRow[] = [{ storeId: s.storeId, daysAgo: 0, date: s.today, ...s.todayTotals }];
  const scale = s.yesterdayUnits / (runUp(1) * weekday(shiftDate(s.today, -1)) * (1 + 0.05 * Math.sin(seed + 2.1)));
  for (let d = 1; d < SEASON_DAYS; d++) {
    const date = shiftDate(s.today, -d);
    const soldUnits = Math.round(scale * runUp(d) * weekday(date) * (1 + 0.05 * Math.sin(seed + 2.1 * d)));
    const revenueUsd = Math.round(soldUnits * s.price * (1 + 0.02 * Math.sin(seed * 0.7 + d)));
    const planUsd = Math.round(revenueUsd / (1 + s.vsPlan) * (1 + 0.035 * Math.sin(seed * 1.9 + 1.3 * d)));
    const [lostUnits, lostUsd] = s.lost?.[d] ?? [0, 0];
    days.push({ storeId: s.storeId, daysAgo: d, date, soldUnits, revenueUsd, lostUnits, lostUsd, planUsd });
  }

  const today = hourRowsOf(s.storeId, s.todayHours ?? [], s.todayTotals.revenueUsd);

  // Yesterday's units over its open hours: a slow morning, the busiest stretch late in the afternoon.
  const [first, end] = s.span, n = end - first;
  const units = apportion(days[1].soldUnits, Array.from({ length: n }, (_, i) => 0.55 + 0.6 * Math.sin(Math.PI * (i + 0.5) / n) + 0.25 * i / n));
  const revenue = spreadRevenue(units, days[1].revenueUsd);
  const lostAt = new Map((s.lostHours ?? []).map(([hour, u, usd]) => [hour, [u, usd] as const]));
  const yesterday: HourRow[] = units.map((soldUnits, i) => {
    const [lostUnits, lostUsd] = lostAt.get(first + i) ?? [0, 0];
    return { storeId: s.storeId, hour: first + i, soldUnits, revenueUsd: revenue[i], lostUnits, lostUsd };
  });
  return { storeId: s.storeId, days, today, yesterday };
}

/** One option of the switch, as the live hook fills it. */
export type FixturePeriod = { totals: PeriodTotals; byStore: Record<number, PeriodTotals>; chart: PeriodSeries };

/**
 * Every option of the switch from stores' histories. `todayHours` replaces the stores' own hours on the Today
 * chart (the City mockup has the city's hours, not each store's).
 */
export function periodsOf(histories: StoreHistory[], { span, clock, todayHours }: { span: [number, number]; clock: DayClock; todayHours?: HourRow[] }): Record<DrillPeriod, FixturePeriod> {
  // The live query reads 30 days.
  const days = histories.flatMap(h => h.days).filter(d => d.daysAgo <= 29);
  const ids = histories.map(h => h.storeId);
  const today = clock.today;
  const charts: Record<DrillPeriod, PeriodSeries> = {
    today: hourSeries(todayHours ?? histories.flatMap(h => h.today), { span, date: today, clock }),
    yesterday: hourSeries(histories.flatMap(h => h.yesterday), { span, date: shiftDate(today, -1), clock: null }),
    "7d": daySeries(days, "7d", { today, running: clock.running }),
    "30d": daySeries(days, "30d", { today, running: clock.running }),
  };
  return Object.fromEntries(DRILL_PERIODS.map(p => [p, { totals: totalsOf(days, p), byStore: totalsByStore(days, p, ids), chart: charts[p] }])) as Record<DrillPeriod, FixturePeriod>;
}

/** A store's last 7 days with today (store_now's revenue_7d_usd, plan_7d_usd). */
export const weekOf = (h: StoreHistory): PeriodTotals => totalsOf(h.days, "7d");
/** A store's whole season so far, Sep 1 to today (store_now's revenue_season_usd, plan_season_usd). */
export function seasonOf(h: StoreHistory): PeriodTotals {
  let revenueUsd = 0, planUsd = 0;
  for (const d of h.days) { revenueUsd += d.revenueUsd; planUsd += d.planUsd ?? 0; }
  return { ...totalsOf(h.days, "30d"), revenueUsd, planUsd };
}

/** Today's opening day at the shell fixture's clock; a day already over if the clock says nothing. */
export const clockAt = (now: string, tz: string, place: { isOpen: boolean; opensAt: string | null }): DayClock =>
  dayClock(now, tz, place) ?? { today: "", hour: null, reached: 24, running: false };

/* ── The fixture stores ──────────────────────────────────── */

/*
 * New York, Wed 28 Oct at 14:20 EDT (the City mockup): open 09:00–21:00. Today's figures are the mockup's. Astoria
 * lost Carving on Sat 24 Oct and Mini on Thu 22 Oct (its Stockouts list); Park Slope ran short of Carving last
 * evening. Vs plan follows the stores' old 7-day figures: Astoria well under, Chelsea over.
 */
const NY_TODAY = "2026-10-28";
const NY_SPAN: [number, number] = [9, 21];

export const ASTORIA: StoreStory = {
  storeId: 13, today: NY_TODAY, span: NY_SPAN, seed: 1,
  todayTotals: { soldUnits: 520, revenueUsd: 3400, lostUnits: 300, lostUsd: 1940, planUsd: 3850 },
  todayHours: [[9, 50, 0, 0], [10, 70, 0, 0], [11, 95, 0, 0], [12, 110, 0, 0], [13, 120, 130, 840], [14, 75, 170, 1100]],
  yesterdayUnits: 1000, price: 6.54, vsPlan: -0.15,
  lost: { 4: [140, 910], 6: [35, 87], 12: [60, 392], 19: [22, 144] },
};
export const PARK_SLOPE: StoreStory = {
  storeId: 14, today: NY_TODAY, span: NY_SPAN, seed: 2.4,
  todayTotals: { soldUnits: 470, revenueUsd: 3060, lostUnits: 0, lostUsd: 0, planUsd: 3020 },
  yesterdayUnits: 900, price: 6.51, vsPlan: -0.03,
  lost: { 1: [24, 156], 9: [46, 300] }, lostHours: [[19, 14, 91], [20, 10, 65]],
};
export const HARLEM: StoreStory = {
  storeId: 15, today: NY_TODAY, span: NY_SPAN, seed: 3.7,
  todayTotals: { soldUnits: 450, revenueUsd: 2900, lostUnits: 0, lostUsd: 0, planUsd: 2840 },
  yesterdayUnits: 860, price: 6.44, vsPlan: 0.024,
  lost: { 15: [30, 193] },
};
export const CHELSEA: StoreStory = {
  storeId: 16, today: NY_TODAY, span: NY_SPAN, seed: 5.2,
  todayTotals: { soldUnits: 400, revenueUsd: 2540, lostUnits: 0, lostUsd: 0, planUsd: 2450 },
  yesterdayUnits: 760, price: 6.35, vsPlan: 0.038,
};

/** Greenwich, London, Wed 28 Oct at 18:20 GMT: open 09:00–20:00, a quiet day nearly done, a little over plan. */
export const GREENWICH: StoreStory = {
  storeId: 44, today: "2026-10-28", span: [9, 20], seed: 0.6,
  todayTotals: { soldUnits: 360, revenueUsd: 2484, lostUnits: 0, lostUsd: 0, planUsd: 2420 },
  todayHours: [[9, 22, 0, 0], [10, 30, 0, 0], [11, 41, 0, 0], [12, 48, 0, 0], [13, 44, 0, 0], [14, 38, 0, 0], [15, 35, 0, 0], [16, 40, 0, 0], [17, 46, 0, 0], [18, 16, 0, 0]],
  yesterdayUnits: 370, price: 6.9, vsPlan: 0.024,
  lost: { 11: [18, 124] },
};

/**
 * Yanaka, Tokyo, Thu 29 Oct at 03:20 JST: not open yet today (09:00–21:00). Carving ran out last evening at 19:40
 * (its ongoing stockout: 45 lost, $330).
 */
export const YANAKA: StoreStory = {
  storeId: 88, today: "2026-10-29", span: [9, 21], seed: 4.4,
  todayTotals: { soldUnits: 0, revenueUsd: 0, lostUnits: 0, lostUsd: 0, planUsd: 0 },
  yesterdayUnits: 300, price: 7.25, vsPlan: -0.035,
  lost: { 1: [45, 330] }, lostHours: [[19, 12, 88], [20, 33, 242]],
};
