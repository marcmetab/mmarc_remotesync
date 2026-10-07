import type { CountryCode, LostCause, RegionCode, StoreFormat, Variety } from "../../types";

/*
 * The Business page's view model: what the live hook (src/data/useBusinessData.ts) and the fixture
 * (src/fixtures/business.ts) hand to BusinessPage and its sections in src/pages/business/. Every field
 * names the pumpkin_live view and column it comes from. Everything is already narrowed to the shell's
 * scope (region, country) unless a comment says otherwise. A part is undefined while its query loads.
 */

/* ── Periods ─────────────────────────────────────────────── */

/**
 * The Period tabs. In daily_store_sales terms: today = days_ago 0 (each store's local today, so far) ·
 * 7d = days_ago 0..6 · season = every row (Sep 1 to today).
 */
export type BusinessPeriod = "today" | "7d" | "season";
export const BUSINESS_PERIODS: BusinessPeriod[] = ["today", "7d", "season"];

/** The parts of the page that load (and can fail) on their own. */
export type BusinessPart = "totals" | "season" | "days" | "mix" | "bridge" | "stock" | "breakdown" | "events" | "pulse";

/* ── Glance: hero, season bar, tiles ─────────────────────── */

/**
 * One period's sums over the stores in scope. daily_store_sales filtered by the period's days_ago, summed.
 * Every field is from the same daily_store_sales refresh (every 2 minutes), so comparisons and ratios built
 * from them only move when it does. The hero's numerals add BusinessPulse.revenueAhead to `revenue` and
 * unitsAhead to `unitsSold` to climb between refreshes; nothing else does.
 */
export type BusinessTotals = {
  /** revenue_usd (metric Revenue) */
  revenue: number;
  /** revenue_usd at days_ago = 0: the part of `revenue` that is today */
  revenueToday: number;
  /** plan_revenue_usd (metric Revenue plan; today is paced to the current local time) */
  planRevenue: number;
  /** ly_revenue_usd (metric Last season revenue; paced like the plan) */
  lyRevenue: number;
  /**
   * The period before. today: hourly_store_sales.revenue_usd at days_ago = 7 over the local hours that have
   * started today · 7d: daily_store_sales.revenue_usd at days_ago 7..13 · season: null.
   */
  prevRevenue: number | null;
  /** gross_margin_usd (metric Gross margin) */
  grossMargin: number;
  /** plan_gross_margin_usd (metric Plan gross margin) */
  planGrossMargin: number;
  /** ly_gross_margin_usd (metric Last season gross margin) */
  lyGrossMargin: number;
  /** units_sold (metric Pumpkins sold) */
  unitsSold: number;
  /** units_requested: what customers asked for (sold + lost) */
  unitsRequested: number;
  /** plan_units (plan average selling price = planRevenue / planUnits) */
  planUnits: number;
  /** ly_units (last season average selling price = lyRevenue / lyUnits) */
  lyUnits: number;
  /** lost_revenue_usd (metric Lost sales) */
  lostRevenue: number;
  /** lost_late_usd, lost_shortage_usd, lost_demand_usd (they add up to lost_revenue_usd) */
  lostByCause: Record<LostCause, number>;
  /** shrink_transit_usd */
  shrinkTransit: number;
  /** shrink_shelf_usd (metric Shrink = transit + shelf) */
  shrinkShelf: number;
  /** delivery_cost_usd (metric Delivery cost) */
  deliveryCost: number;
  /** markdown_usd (zero until Nov 1) */
  markdown: number;
  /**
   * The same sums for the period before, for the tiles' "vs prior 7 days". 7d: daily_store_sales at
   * days_ago 7..13. today and season: null (today is compared with plan and last season only).
   */
  prev: { revenue: number; grossMargin: number; unitsSold: number; deliveryCost: number; shrink: number } | null;
};

/** The season bar and the Season panel. season_plan and season_landing, summed over the countries in scope. */
export type BusinessSeason = {
  /** season_plan.revenue_to_date_usd */
  revenueToDate: number;
  /** season_plan.plan_to_date_revenue_usd */
  planToDate: number;
  /** season_plan.season_plan_revenue_usd (Sep 1 to Nov 15) */
  seasonPlan: number;
  /** season_plan.ly_season_revenue_usd */
  lySeason: number;
  /** season_plan.ly_to_date_revenue_usd */
  lyToDate: number;
  /** season_plan.days_left (the same in every row) */
  daysLeft: number;
  /**
   * season_landing: landing_usd (metric Projected season revenue), landing_low_usd, landing_high_usd.
   * Revenue to date plus the plan still to come at the pace of the last 7 days; the range uses the 10th
   * and 90th percentile of daily attainment over the last 14 days. null until season_landing arrives.
   */
  landing: { mid: number; low: number; high: number } | null;
  /**
   * season_daily: every day of the season (Sep 1 to Nov 15), summed over the scope's countries, oldest
   * first. undefined until season_daily arrives (the bar can show without it).
   */
  curve?: BusinessSeasonDay[];
};

/** One day of the season curve. season_daily, summed over the scope's countries. */
export type BusinessSeasonDay = {
  /** local_date, "2026-10-28" */
  date: string;
  /** cum_plan_revenue_usd: the full-day plan, added up from Sep 1 (known in advance, also for future days) */
  cumPlan: number;
  /** cum_ly_revenue_usd: last season on the matching days, added up (known in advance) */
  cumLy: number;
  /** cum_revenue_usd: actual revenue added up; null for days after the local today */
  cumRevenue: number | null;
  /** is_today (for at least one country in scope) */
  isToday: boolean;
  /** days_to_halloween (0 on Oct 31, negative in November) */
  daysToHalloween: number;
};

/**
 * One column of Daily revenue: one local calendar date, daily_store_sales by local_date (a store's sales count
 * on its own local date, so in the UTC evening Japan's Thursday is its own column while Europe and North
 * America are still on Wednesday). The last 28 dates up to the latest one in scope with revenue or plan,
 * oldest first.
 */
export type BusinessDay = {
  /** local_date, "2026-10-28" */
  date: string;
  /** revenue_usd */
  revenue: number;
  /** plan_revenue_usd */
  planRevenue: number;
  /** ly_revenue_usd */
  lyRevenue: number;
  /** gross_margin_usd */
  grossMargin: number;
  /** units_sold */
  unitsSold: number;
  /** delivery_cost_usd */
  deliveryCost: number;
  /** shrink_usd */
  shrink: number;
  /** lost_revenue_usd */
  lostRevenue: number;
  /** is_weekend */
  isWeekend: boolean;
  /**
   * A store in scope is on this date as its local today (days_ago = 0): the day is still running there, and
   * its plan and last season are paced to now. Two dates can be partial at once (Japan's new day and North
   * America's evening).
   */
  isPartial: boolean;
};

/* ── Live sales ──────────────────────────────────────────── */

/** sales_pulse and recent_sales, polled every few seconds, narrowed to the scope. */
export type BusinessPulse = {
  /** sales_pulse.revenue_today_usd summed over the scope's countries (each country's local today) */
  revenueToday: number;
  /**
   * How far the pulse is ahead of daily_store_sales today: per country in scope, while both are on the same
   * local date, max(0, sales_pulse.revenue_today_usd − daily_store_sales revenue_usd at days_ago 0), summed.
   * The hero shows totals[period].revenue + revenueAhead (today is in every period).
   */
  revenueAhead: number;
  /**
   * The same for pumpkins: max(0, sales_pulse.units_today − the metric Pumpkins sold at days_ago 0), summed.
   * The hero shows totals[period].unitsSold + unitsAhead, beside the revenue. 0 when the result has no such
   * column (a saved question synced before the column was added).
   */
  unitsAhead: number;
  /** sales_pulse.sales_last_hour summed over the scope */
  salesLastHour: number;
  /**
   * sales_pulse.revenue_last_hour_usd summed over the scope. null when the result has no such column (a saved
   * question synced before the column was added): Live sales then shows the count alone.
   */
  revenueLastHour: number | null;
  /** recent_sales in scope, newest first (at most 20: Live sales shows 8, and up to 20 on "Show more") */
  recent: BusinessSale[];
  /**
   * Client clock (Date.now()) when this pulse arrived. A sale's age on screen is its seconds_ago plus the
   * seconds since `receivedAt`, so "4 s ago" keeps counting between polls.
   */
  receivedAt: number;
};

/** One line of recent_sales. */
export type BusinessSale = {
  /** sale_id */
  id: string;
  /** sold_at */
  soldAt: string;
  /** seconds_ago (on the simulated clock, at the time of the query) */
  secondsAgo: number;
  /** store_id, store_name */
  storeId: number;
  storeName: string;
  /** city_name, country_code */
  cityName: string;
  countryCode: CountryCode;
  /** variety_name */
  variety: Variety;
  /** channel */
  channel: BusinessChannel;
  /** units */
  units: number;
  /** amount_usd */
  amount: number;
};

/* ── Daily revenue: events ───────────────────────────────── */

/** business_events.kind. Storms, breakdowns and hub shortages are marked on the chart; ventilation faults are only listed. */
export type BusinessEventKind = "storm" | "breakdown" | "ventilation" | "hub_shortage";

/** One event that started by now. business_events, days_ago 0..28, narrowed to the scope's countries. */
export type BusinessEvent = {
  /** event_id */
  id: string;
  kind: BusinessEventKind;
  /** local_date (the country's local date: match it to BusinessDay.date) */
  date: string;
  /** started_at, ended_at (null while it is still going on) */
  startedAt: string;
  endedAt: string | null;
  /** country_code */
  countryCode: CountryCode;
  /** title: "Storm at Guelph hub", "Van PK-US-107 broke down", "Chiba hub ran short" */
  title: string;
  /** detail: one line of facts */
  detail: string;
  /** lost_revenue_usd: lost sales attributed to the event so far */
  lostRevenue: number;
  /** truck_id (breakdown, ventilation): links to the van; hub_id (storm, hub_shortage): links to Harvest & fleet */
  truckId: string | null;
  hubId: string | null;
};

/* ── Plan to actual ──────────────────────────────────────── */

/**
 * How the period's revenue got from plan to actual. Every step is a sum over daily_store_sales in scope:
 *   plan + volume + mix − lost (late, shortage, demand) = actual, to the cent.
 * The selling price is always the plan price in this business, so there is no price step.
 */
export type BusinessBridge = {
  /** plan_revenue_usd (metric Revenue plan) */
  plan: number;
  /** Demand above or below plan, at the plan's average price: (Σunits_requested − Σplan_units) × Σplan_revenue_usd / Σplan_units */
  volume: number;
  /** Which varieties and stores the demand fell on, against the plan's mix: Σ(revenue_usd + lost_revenue_usd) − Σplan_revenue_usd − volume */
  mix: number;
  /** lost_late_usd, lost_shortage_usd, lost_demand_usd (positive amounts; the bridge subtracts them) */
  lostByCause: Record<LostCause, number>;
  /** revenue_usd (metric Revenue) */
  actual: number;
};

/* ── Stock at risk ───────────────────────────────────────── */

/**
 * stock_outlook (country × variety), summed over the scope's countries. Projected stock left on Nov 1:
 * what is on hand (stores, hubs, vans) plus the harvest still planned to Oct 31, minus the sales expected
 * to Oct 31 (plan × recent sold-vs-plan, plus shrink). A negative leftover means the variety is projected
 * to run short before Halloween.
 */
export type BusinessStockLine = {
  /** store_units, hub_units, transit_units: on hand now */
  storeUnits: number;
  hubUnits: number;
  transitUnits: number;
  /** harvest_plan_units: still to be picked by Oct 31 (the plan, known in advance) */
  harvestPlan: number;
  /** sold_expected_units: expected sales to Oct 31 */
  expectedSales: number;
  /** leftover_nov1_units, with leftover_nov1_low_units and _high_units (metric Projected leftover after Halloween) */
  leftover: number;
  leftoverLow: number;
  leftoverHigh: number;
  /** leftover_nov1_cost_usd (metric Leftover stock at cost), leftover_nov1_retail_usd */
  leftoverCost: number;
  leftoverRetail: number;
  /** markdown_exposure_usd (metric Markdown exposure): what the Nov 1 markdowns will give away on it */
  markdownExposure: number;
  /** season_end_leftover_units, season_end_leftover_cost_usd: left after November's expected sales (the write-off risk) */
  seasonEndUnits: number;
  seasonEndCost: number;
  /**
   * november_demand_units: sales expected from Nov 1 (in November: from now) to Nov 15. Optional: Stock at
   * risk falls back to leftover − seasonEndUnits without it.
   */
  novemberSales?: number;
};
export type BusinessStock = {
  /** Per variety, in VARIETIES order. */
  varieties: ({ variety: Variety } & BusinessStockLine)[];
  /** The varieties added up. */
  total: BusinessStockLine;
};

/* ── Breakdown ───────────────────────────────────────────── */

/** "Break down by" options. Country, variety and channel come from the daily query; city and format from the breakdown queries. */
export type BreakdownDim = "country" | "city" | "format" | "variety" | "channel";
/** The metric switch. Channel only has revenue (there is no plan, cost or loss by channel). */
export type BreakdownMetric = "revenue" | "margin" | "units" | "lost";

/** One measure of a breakdown row: the value with its plan and last season (null where none exists). */
export type BreakdownValue = { value: number; plan: number | null; ly: number | null };

/**
 * One row of the Breakdown table, for one period. daily_store_sales grouped by the dimension:
 *   revenue = revenue_usd vs plan_revenue_usd / ly_revenue_usd
 *   margin  = gross_margin_usd vs plan_gross_margin_usd / ly_gross_margin_usd
 *   units   = units_sold vs plan_units / ly_units
 *   lost    = lost_revenue_usd (no plan or last season)
 */
export type BreakdownRow = {
  /** country_code, city_key, store_format, variety_name or channel */
  key: string;
  /** "Germany", "Philadelphia", "Flagship", "Carving", "Online" */
  label: string;
  /** City rows: the country name. */
  sublabel?: string;
  /** Country rows: picking the row shows the country's cities in the table. */
  country?: { code: CountryCode; region: RegionCode };
  /** City rows: the city's country (the Country tab lists a picked country's cities with it). */
  countryCode?: CountryCode;
  /** City rows: picking the row opens the city on Stores. */
  cityKey?: string;
  /** Store format rows. */
  format?: StoreFormat;
  /** Per metric. A metric the dimension cannot be split by (channel: margin, units, lost) is missing. */
  values: Partial<Record<BreakdownMetric, BreakdownValue>>;
  /** lost_revenue_usd / (revenue_usd + lost_revenue_usd): the share of demand lost (null for channel) */
  lostShare: number | null;
  /**
   * Each metric on Daily revenue's 28 local dates (oldest first), whatever the period. Dates after the row's
   * latest date with revenue or plan are NaN: not reached yet (North America is a day behind Japan in the UTC
   * evening), or a new day not open yet. Missing for a metric the dimension cannot be split by.
   */
  trend: Partial<Record<BreakdownMetric, number[]>>;
  /** Index into `trend` of the first date still running (a local today of the row's stores); missing when none is. */
  partialFrom?: number;
};

/* ── Mix ─────────────────────────────────────────────────── */

export type BusinessChannel = "in_store" | "online";
/** Mix for one period and the scope. */
export type BusinessMix = {
  /**
   * daily_store_sales grouped by variety_name, in VARIETIES order: revenue_usd, gross_margin_usd, ly_revenue_usd
   * (for the shift vs last season) and units_sold (all channels: the Average selling price tile's pumpkins by
   * kind, and each variety's own average).
   */
  varieties: { variety: Variety; revenue: number; grossMargin: number; lyRevenue: number; units: number }[];
  /**
   * daily_store_sales: online = online_revenue_usd, in_store = revenue_usd − online_revenue_usd.
   * `units` is null live (there is no unit count by channel), so the "each" note is left out.
   */
  channels: { channel: BusinessChannel; revenue: number; units: number | null }[];
};

/* ── The whole page ──────────────────────────────────────── */

/**
 * Everything the Business page shows. Each part is undefined while its query loads; the period tabs switch
 * between the three periods without a new query.
 */
export type BusinessViewModel = {
  /** daily_store_sales (+ hourly_store_sales, + sales_pulse for today's live revenue): hero, tiles, Lost sales, Costs. */
  totals?: Record<BusinessPeriod, BusinessTotals>;
  /** season_plan + season_landing (+ season_daily for the curve): the season bar and the Season panel. */
  season?: BusinessSeason;
  /** daily_store_sales by local_date: the last 28 local dates, oldest first (Daily revenue). */
  days?: BusinessDay[];
  /**
   * The scope's local today, "2026-10-29": the latest local_date at days_ago 0 in scope whose day has begun
   * (revenue or plan), else the latest. The hero's "vs last Thursday". Arrives with `days`.
   */
  today?: string;
  /** sales_pulse + recent_sales: the live line under the hero and the Live sales table. */
  pulse?: BusinessPulse;
  /** business_events of the last 28 days: markers on Daily revenue. */
  events?: BusinessEvent[];
  /** daily_store_sales: Plan to actual, per period. */
  bridge?: Record<BusinessPeriod, BusinessBridge>;
  /** stock_outlook: Stock at risk. */
  stock?: BusinessStock;
  /**
   * daily_store_sales grouped five ways: the Breakdown table, per dimension and period. Country rows hold
   * every country of the scope's region (also while one country is focused: that row is only highlighted);
   * the other dimensions are narrowed to the scope.
   */
  breakdown?: Record<BreakdownDim, Record<BusinessPeriod, BreakdownRow[]>>;
  /** daily_store_sales by variety and by channel, per period. */
  mix?: Record<BusinessPeriod, BusinessMix>;
  /** Client clock (Date.now()) when each part last arrived: the "Updated 12 s ago" line of a definition. */
  updatedAt?: Partial<Record<BusinessPart, number>>;
  /** A part whose query failed, with a short message. */
  failed?: Partial<Record<BusinessPart, string>>;
  /** Runs the failed queries again. */
  retry?: () => void;
};

/** The page's own state. `day` is an index into `vm.days` (null follows the latest date); the page keeps the picked date. */
export type BusinessState = {
  period: BusinessPeriod;
  day: number | null;
  breakdownBy: BreakdownDim;
  breakdownMetric: BreakdownMetric;
  /** Breakdown sort: a column and direction. */
  sort: { column: "label" | "value" | "share" | "vsPlan" | "vsLy" | "lost"; dir: "asc" | "desc" };
  /** An open definition (see src/definitions.ts), for the preview. */
  define: string | null;
  /** Live sales shows all its rows (up to 20) instead of the newest 8. */
  liveMore: boolean;
};
