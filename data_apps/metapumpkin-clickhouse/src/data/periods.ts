/*
 * The time switch's figures and charts (City and Store pages), built from rows already narrowed to one city or
 * one store. Pure, with no SDK: the live hook (useStoresData.ts) and the fixtures (src/fixtures/drill.ts) build
 * the same shapes with it, so the preview shows what the live page will.
 *
 * Hours and days are the place's own: local_hour and local_date, with days_ago counted on the simulated clock.
 * "Now" is the shell's clock (sim_now), read in the place's zone.
 */
import { time } from "../format";
import { DRILL_PERIOD, type DrillPeriod, type PeriodColumn, type PeriodFigures, type PeriodSeries, type PeriodTotals } from "../types";

/** One store's sales on one local day: daily_store_sales summed over the varieties. */
export type DayRow = PeriodFigures & { storeId: number; daysAgo: number; date: string; planUsd: number | null };
/** One store's sales in one local hour: hourly_store_sales. `isCurrent` is is_current_hour (today only). */
export type HourRow = PeriodFigures & { storeId: number; hour: number; isCurrent?: boolean };

export const NO_SALES: PeriodFigures = { soldUnits: 0, revenueUsd: 0, lostUnits: 0, lostUsd: 0 };
const plus = (a: PeriodFigures, b: PeriodFigures): PeriodFigures => ({
  soldUnits: a.soldUnits + b.soldUnits, revenueUsd: a.revenueUsd + b.revenueUsd, lostUnits: a.lostUnits + b.lostUnits, lostUsd: a.lostUsd + b.lostUsd,
});
const figuresOf = (r: PeriodFigures): PeriodFigures => ({ soldUnits: r.soldUnits, revenueUsd: r.revenueUsd, lostUnits: r.lostUnits, lostUsd: r.lostUsd });

/* ── Dates ───────────────────────────────────────────────── */

/** "2026-10-28" moved by whole days. */
export function shiftDate(ymd: string, days: number): string {
  const t = Date.parse(`${ymd}T00:00:00Z`);
  return Number.isFinite(t) ? new Date(t + days * 864e5).toISOString().slice(0, 10) : ymd;
}
/** The local date of an instant in a zone: "2026-10-28". */
export function localYmd(at: string, tz: string): string {
  try {
    const p: Record<string, string> = {};
    for (const part of new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(at))) p[part.type] = part.value;
    return p.year && p.month && p.day ? `${p.year}-${p.month}-${p.day}` : "";
  } catch { return ""; }
}
/** Hours and minutes after local midnight, or null. */
const clockOf = (at: string | null | undefined, tz: string) => {
  if (!at) return null;
  const [h, m] = time(at, tz).split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? { h, m } : null;
};

/* ── Where now is in the opening day ─────────────────────── */

/** Today's opening day as of now, in the place's zone. */
export type DayClock = {
  /** The local date today ("" when unknown). */
  today: string;
  /** The hour running now while the place is open, else null. */
  hour: number | null;
  /** Hours before this one have started; from it on they are not reached yet (24 once the day is over). */
  reached: number;
  /** The day is still running: open now, or opening later today. */
  running: boolean;
};

/**
 * Where now sits in today's opening day. `opensAt` is store_now's: this opening while open, the next one while
 * closed, so a closed place whose next opening is today has not opened yet; otherwise its day is over (closed
 * for the evening, or a day it does not open, Sundays in Germany). null without a clock.
 */
export function dayClock(now: string | undefined, tz: string, place: { isOpen: boolean; opensAt: string | null }): DayClock | null {
  const at = clockOf(now, tz);
  if (!now || !at) return null;
  const today = localYmd(now, tz);
  if (place.isOpen) return { today, hour: at.h, reached: at.h + 1, running: true };
  const later = place.opensAt != null && localYmd(place.opensAt, tz) === today;
  return later ? { today, hour: null, reached: at.h + 1, running: true } : { today, hour: null, reached: 24, running: false };
}

/** Without a clock: the hour flagged is_current_hour is the one running, and nothing after the last hour with sales is reached. */
export function rowsClock(rows: HourRow[], today: string): DayClock {
  const current = rows.find(r => r.isCurrent)?.hour ?? null;
  const last = rows.reduce((max, r) => Math.max(max, r.hour), -1);
  return { today, hour: current, reached: (current ?? last) + 1, running: true };
}

/**
 * The local hours a place opens, [first, end): the earliest opening and the latest closing of store_now's
 * opens_at and closes_at (only their clock times count, whichever day they fall on). 21:00 ends at 21, 20:30 at 21.
 */
export function openSpan(places: { opensAt: string | null; closesAt: string | null }[], tz: string): [number, number] | null {
  let first = 24, end = 0;
  for (const p of places) {
    const open = clockOf(p.opensAt, tz), close = clockOf(p.closesAt, tz);
    if (open) first = Math.min(first, open.h);
    if (close) end = Math.max(end, close.m > 0 ? close.h + 1 : close.h || 24);
  }
  return first < end ? [first, end] : null;
}

/* ── Figures ─────────────────────────────────────────────── */

/** Whether a day row falls in a period. */
export const inPeriod = (daysAgo: number, period: DrillPeriod) => daysAgo >= DRILL_PERIOD[period].daysAgo[0] && daysAgo <= DRILL_PERIOD[period].daysAgo[1];

/** Day rows added up over a period; the plan is null when no row has one. */
export function totalsOf(rows: DayRow[], period: DrillPeriod): PeriodTotals {
  let figures = NO_SALES, plan: number | null = null;
  for (const r of rows) {
    if (!inPeriod(r.daysAgo, period)) continue;
    figures = plus(figures, r);
    if (r.planUsd != null) plan = (plan ?? 0) + r.planUsd;
  }
  return { ...figures, planUsd: plan };
}

/** The same, by store: every store in `storeIds` has an entry (zero without sales), plus any store with rows. */
export function totalsByStore(rows: DayRow[], period: DrillPeriod, storeIds: number[] = []): Record<number, PeriodTotals> {
  const byStore = new Map<number, DayRow[]>(storeIds.map(id => [id, []]));
  for (const r of rows) {
    const own = byStore.get(r.storeId);
    if (own) own.push(r); else byStore.set(r.storeId, [r]);
  }
  return Object.fromEntries([...byStore].map(([id, own]) => [id, totalsOf(own, period)]));
}

/* ── Charts ──────────────────────────────────────────────── */

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * By hour: one column per local hour of the opening day (`span`, widened to any hour with sales), each the sum
 * of the stores' rows. With `clock` (today) the running hour is current and later hours are placeholders at
 * zero; without it (yesterday) every hour is past. A day with no rows and no hour still to come (the place did
 * not open: Sundays in Germany) has no columns, so the page shows its empty state rather than a row of zeros.
 */
export function hourSeries(rows: HourRow[], { span, date, clock }: { span: [number, number] | null; date: string; clock?: DayClock | null }): PeriodSeries {
  if (!rows.length && !clock?.running) return { by: "hour", columns: [] };
  const byHour = new Map<number, PeriodFigures>();
  for (const r of rows) byHour.set(r.hour, plus(byHour.get(r.hour) ?? NO_SALES, r));
  const hours = [...byHour.keys()];
  const first = Math.min(span?.[0] ?? 24, ...hours), end = Math.max(span?.[1] ?? 0, ...hours.map(h => h + 1));
  const columns: PeriodColumn[] = [];
  for (let hour = first; hour < end; hour++) {
    const isFuture = clock != null && hour >= clock.reached;
    columns.push({
      key: `h${pad2(hour)}`, hour, date, isCurrent: clock?.hour === hour, isFuture,
      ...(isFuture ? NO_SALES : figuresOf(byHour.get(hour) ?? NO_SALES)),
    });
  }
  return { by: "hour", columns };
}

/**
 * By day: one column per day of the period (7 or 30), oldest first, each the sum of the stores' rows. A day's
 * date is its rows' local_date, else counted back from `today`. Today's column is current while `running`.
 */
export function daySeries(rows: DayRow[], period: DrillPeriod, { today, running }: { today: string; running: boolean }): PeriodSeries {
  const [newest, oldest] = DRILL_PERIOD[period].daysAgo;
  const byDay = new Map<number, { date: string; figures: PeriodFigures }>();
  for (const r of rows) {
    if (!inPeriod(r.daysAgo, period)) continue;
    const day = byDay.get(r.daysAgo);
    byDay.set(r.daysAgo, { date: day?.date || r.date, figures: plus(day?.figures ?? NO_SALES, r) });
  }
  // Any dated row pins the calendar when the clock is not known yet.
  const anchor = rows.find(r => r.date);
  const base = today || (anchor ? shiftDate(anchor.date, anchor.daysAgo) : "");
  const columns: PeriodColumn[] = [];
  for (let d = oldest; d >= newest; d--) {
    const day = byDay.get(d);
    const date = day?.date || (base ? shiftDate(base, -d) : "");
    columns.push({ key: date || `d${d}`, hour: null, date, isCurrent: d === 0 && running, isFuture: false, isToday: d === 0, ...(day?.figures ?? NO_SALES) });
  }
  return { by: "day", columns };
}
