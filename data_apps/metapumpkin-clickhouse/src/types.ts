/**
 * Shared types and the fixed world (regions, countries). Names and codes follow the data contract
 * (`pumpkin_live.*`): a comment on each type names the view and columns it is read from.
 */

/** countries.region_code */
export type RegionCode = "NA" | "EU" | "APAC";
/** The region control's value: every region, or one. */
export type RegionFilter = "all" | RegionCode;
/** countries.country_code */
export type CountryCode = "US" | "CA" | "GB" | "DE" | "JP";

/** What the shell filters every page by. `country` narrows inside `region` (it is cleared when the region changes). */
export type Scope = { region: RegionFilter; country: CountryCode | null };
export const ALL_SCOPE: Scope = { region: "all", country: null };

/** countries: region_code, region_name (sorted NA, EU, APAC). */
export const REGIONS: { code: RegionCode; name: string }[] = [
  { code: "NA", name: "North America" },
  { code: "EU", name: "Europe" },
  { code: "APAC", name: "Asia-Pacific" },
];
/** countries: country_code, country_name, region_code, tz (in `sort` order). */
export const COUNTRIES: { code: CountryCode; name: string; region: RegionCode; tz: string }[] = [
  { code: "US", name: "United States", region: "NA", tz: "America/New_York" },
  { code: "CA", name: "Canada", region: "NA", tz: "America/Toronto" },
  { code: "GB", name: "United Kingdom", region: "EU", tz: "Europe/London" },
  { code: "DE", name: "Germany", region: "EU", tz: "Europe/Berlin" },
  { code: "JP", name: "Japan", region: "APAC", tz: "Asia/Tokyo" },
];
export const regionName = (code: RegionFilter) => code === "all" ? "All regions" : REGIONS.find(r => r.code === code)?.name ?? code;
export const countryName = (code: string) => COUNTRIES.find(c => c.code === code)?.name ?? code;
/** "All regions", "Europe" or "Germany": the label of the current scope. */
export const scopeLabel = (scope: Scope) => scope.country ? countryName(scope.country) : regionName(scope.region);
/** True when a row tagged with this region and country belongs to the scope. */
export const inScope = (scope: Scope, region: string, country?: string) =>
  (scope.region === "all" || scope.region === region) && (!scope.country || !country || scope.country === country);

/** varieties.variety_name */
export type Variety = "Carving" | "Cooking" | "Mini";
export const VARIETIES: Variety[] = ["Carving", "Cooking", "Mini"];
/** stores.store_format */
export type StoreFormat = "flagship" | "standard" | "express";

/** store_now.stock_status (low = a variety runs out before the next van can restock it). */
export type StockStatus = "out" | "low" | "ok";
/** daily_store_sales.lost_late_usd / lost_shortage_usd / lost_demand_usd; stockouts.cause; store_now.out_cause. */
export type LostCause = "late_delivery" | "hub_shortage" | "demand_above_plan";
export const LOST_CAUSE_LABEL: Record<LostCause, string> = {
  late_delivery: "Late deliveries",
  hub_shortage: "Hub ran short",
  demand_above_plan: "Demand above plan",
};

/** deliveries.delay_cause, fleet_now.delay_cause */
export type DelayCause = "traffic" | "late_departure" | "breakdown" | "storm" | "ventilation";
export const DELAY_CAUSE_LABEL: Record<DelayCause, string> = {
  traffic: "Traffic",
  late_departure: "Late departure",
  breakdown: "Breakdown",
  storm: "Storm",
  ventilation: "Ventilation",
};
/**
 * How late a van is and why. deliveries / fleet_now / store_now.next_*: late_minutes (estimate while on
 * the way, final once arrived), delay_cause, delay_note (a short fact, e.g. "Traffic on I-278").
 */
export type LateInfo = { minutes: number; cause: DelayCause | null; note: string | null };
/** deliveries.is_late: 15 minutes or more behind plan. */
export const LATE_MINUTES = 15;
/** The four looks of a delivery status chip. */
export type ChipStatus = "on_schedule" | "late" | "severe" | "delivered";
/** Late from 15 minutes; severe from an hour, or for any breakdown or storm. */
export function lateStatus(late: Pick<LateInfo, "minutes" | "cause"> | null | undefined): Exclude<ChipStatus, "delivered"> {
  if (!late || late.minutes < LATE_MINUTES) return "on_schedule";
  return late.minutes >= 60 || late.cause === "breakdown" || late.cause === "storm" ? "severe" : "late";
}

/** deliveries.status */
export type TripStatus = "loading" | "driving" | "stopped" | "unloading" | "returning" | "done";
/** fleet_now.status */
export type TruckStatus = "at_hub" | "loading" | "driving" | "stopped" | "unloading" | "returning" | "workshop";
/** fleet_now.service_status */
export type ServiceStatus = "ok" | "due_soon" | "overdue" | "in_workshop";
/** fleet_now.open_fault_severity, truck_faults.severity */
export type FaultSeverity = "warning" | "critical";
/** hub_now.harvest_status */
export type HarvestStatus = "picking" | "done" | "not_started" | "rain_stop";
/** trip_timeline.state */
export type TimelineState = "done" | "now" | "next";

/** sim_status: sim_now, mode, days_to_halloween. Drives the clock pill and the Business banner chip. */
export type Clock = { now: string; mode: "live" | "shifted"; daysToHalloween: number | null };

/* ── The time switch (City and Store pages) ──────────────── */

/**
 * The top bar's time switch on the City and Store pages (in place of the region control: a city or a store is
 * already one place). It drives the "sold and lost" figures, the store table's Sold / Lost / Revenue / vs plan
 * and the chart; what is on the shelf and on the way is always right now. App.tsx holds it, default "today".
 */
export type DrillPeriod = "today" | "yesterday" | "7d" | "30d";
/** The switch's options, in order. */
export const DRILL_PERIODS: readonly DrillPeriod[] = ["today", "yesterday", "7d", "30d"];
export type DrillPeriodInfo = {
  /** On the switch: "7 days". */
  label: string;
  /** Names the figures: "Last 7 days" (the band prints it in small caps). */
  title: string;
  /** The chart's title: "Last 7 days by day". */
  chart: string;
  /** Today and Yesterday chart by local hour, 7 and 30 days by local day. */
  by: "hour" | "day";
  /** The days_ago it covers, inclusive: [newest, oldest]. Today is [0, 0]; 7 days is [0, 6], today included. */
  daysAgo: readonly [number, number];
};
export const DRILL_PERIOD: Record<DrillPeriod, DrillPeriodInfo> = {
  today: { label: "Today", title: "Today", chart: "Today by hour", by: "hour", daysAgo: [0, 0] },
  yesterday: { label: "Yesterday", title: "Yesterday", chart: "Yesterday by hour", by: "hour", daysAgo: [1, 1] },
  "7d": { label: "7 days", title: "Last 7 days", chart: "Last 7 days by day", by: "day", daysAgo: [0, 6] },
  "30d": { label: "30 days", title: "Last 30 days", chart: "Last 30 days by day", by: "day", daysAgo: [0, 29] },
};

/**
 * The van page's time switch: the drill periods and, on that page only, the whole season. App.tsx keeps Season
 * apart from the shared drill period, so City and Store never see it; picking any other time clears it.
 */
export type TruckPeriod = DrillPeriod | "season";
export const TRUCK_PERIODS: readonly TruckPeriod[] = [...DRILL_PERIODS, "season"];
/** On the switch and over the band: "Season" / "This season". `daysAgo` null: every trip since the first. */
export const TRUCK_PERIOD: Record<TruckPeriod, { label: string; title: string; daysAgo: readonly [number, number] | null }> = {
  ...DRILL_PERIOD,
  season: { label: "Season", title: "This season", daysAgo: null },
};

/** Sales over a stretch of time (a period, an hour, a day). daily_store_sales / hourly_store_sales, summed. */
export type PeriodFigures = {
  /** units_sold (metric Pumpkins sold) */
  soldUnits: number;
  /** revenue_usd (metric Revenue) */
  revenueUsd: number;
  /** units_lost: wanted but not on the shelf */
  lostUnits: number;
  /** lost_revenue_usd (metric Lost sales) */
  lostUsd: number;
};
/** A store's or a city's figures for a period, with the plan its revenue is compared against ("vs plan"). */
export type PeriodTotals = PeriodFigures & {
  /** daily_store_sales, metric Revenue plan: today's is paced to the local time, so today compares fairly. null when unknown. */
  planUsd: number | null;
};
/** One column of a City or Store chart: a local hour (Today, Yesterday) or a local day (7 and 30 days). */
export type PeriodColumn = PeriodFigures & {
  /** Stable React key: "h09", or the date for a day. */
  key: string;
  /** An hour column's local_hour (0..23); null for a day. */
  hour: number | null;
  /** local_date, "2026-10-28": a day column's day, an hour column's day. */
  date: string;
  /**
   * Still running: today's current hour ("11:00 · now", figures so far) or, by day, today's bar (drawn faded).
   * False once the place has closed for the day.
   */
  isCurrent: boolean;
  /** An hour of today's opening day not reached yet: a faint placeholder, its figures zero. Never a day. */
  isFuture: boolean;
  /** A day column for today (days_ago 0), still running or closed: it is called "Today" either way. */
  isToday?: boolean;
};
/**
 * A period's chart. By hour it spans the place's whole opening day (the open hours of store_now's opens_at to
 * closes_at, plus any hour with sales outside them), oldest first; by day, one column per day of the period
 * (7 or 30), oldest first, a day without sales at zero.
 */
export type PeriodSeries = { by: "hour" | "day"; columns: PeriodColumn[] };

/**
 * Props every page takes. `vm` is the page's view model, already filtered to `scope`; any part of it may be
 * undefined while its query loads. `onScope` changes the shell's region or country (e.g. picking a country
 * row). `clock` is the same simulated clock the shell shows: use `clock.now` as "now" for relative labels
 * ("closes in 6 h 40 m"), never `new Date()`. `initial` seeds the page's own useState values (tab, open
 * city, selected hour): the static preview passes its `--state` JSON here. `refreshing` is true while a
 * refetch runs behind the data on screen.
 */
export type PageProps<VM, State = Record<string, unknown>> = {
  vm: VM;
  scope: Scope;
  onScope: (scope: Scope) => void;
  clock?: Clock;
  initial?: Partial<State>;
  refreshing?: boolean;
};
