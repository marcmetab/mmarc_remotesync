import type { BusinessPart, BusinessPeriod, BusinessPulse, BusinessSale, BusinessSeason, BusinessTotals, BusinessViewModel } from "../../pages/business/model";
import { ALL_SCOPE, COUNTRIES, type CountryCode, inScope, type Scope } from "../../types";

/*
 * The glance (hero, live line, season bar, tiles) at the showcase clock: Wed 28 Oct 2026, 18:20 UTC, three
 * days before Halloween. The full days are the simulation's own (pumpkin_sim.day_fact by country, read the
 * way daily_store_sales reads them at that clock), and so is today so far at 18:20 and last week's
 * revenue to the same local time (BusinessDaily and BusinessHourly as measured at that clock). Japan is
 * already on Thursday 29 Oct (03:20 JST) and has not opened yet. All regions: $751,342 over 7 days,
 * $2,669,438 for the season. `glanceFor(scope)` follows the region control and the country focus the way
 * the live hook does; `glance` is all regions.
 */

/**
 * daily_store_sales sums: revenue, plan, last season, gross margin, plan gross margin, last season gross
 * margin, units sold, units requested, plan units, last season units, lost late, lost short, lost demand,
 * shrink in transit, shrink on shelf, delivery cost.
 */
type Sums = [rev: number, plan: number, ly: number, gm: number, planGm: number, lyGm: number, units: number, requested: number, planUnits: number, lyUnits: number,
  late: number, short: number, demand: number, shrinkTransit: number, shrinkShelf: number, delivery: number];
type Country = {
  /** days_ago 1..6 (the six full days before today) */
  past6: Sums;
  /** days_ago 7..13 */
  prev7: Sums;
  /** every full day from Sep 1 to yesterday */
  season: Sums;
  /** days_ago 0 at 18:20 UTC */
  today: Sums;
  /** hourly_store_sales, days_ago 7, over the local hours that have started today */
  todayLastWeek: number;
  /** season_plan.season_plan_revenue_usd, ly_season_revenue_usd */
  seasonPlan: number;
  lySeason: number;
  /** sales_pulse.sales_last_hour, revenue_last_hour_usd */
  salesLastHour: number;
  revenueLastHour: number;
};

const C: Record<CountryCode, Country> = {
  US: {
    past6: [199503.84, 200848.68, 180778.85, 140298.64, 141244.23, 126034.96, 33116, 33505, 33335.6, 30617.5, 924.00, 0, 1367.11, 411.80, 93.10, 6077.11],
    prev7: [181418.60, 188711.48, 169886.30, 127570.90, 132707.89, 118441.92, 30090, 31291, 31322.1, 28772.1, 4171.31, 2217.96, 664.72, 385.00, 82.90, 6945.42],
    season: [741510.82, 756309.07, 681407.69, 521894.32, 532316.57, 475486.53, 126418, 129169, 129002.6, 118575.2, 7860.37, 2217.96, 5214.66, 1465.20, 366.90, 41339.47],
    today: [12922.79, 13252.17, 11893.39, 9089.39, 9319.37, 8291.9, 2171, 2192, 2199.7, 2014.4, 23.97, 0, 124.82, 27.7, 0, 523.73],
    todayLastWeek: 10780.98, seasonPlan: 948949.65, lySeason: 845115.33, salesLastHour: 193, revenueLastHour: 2742.06,
  },
  CA: {
    past6: [127133.78, 135100.79, 122263.34, 90858.18, 96553.28, 86665.58, 20278, 20811, 21558.6, 19909.0, 2472.86, 0, 779.61, 196.80, 61.80, 6059.76],
    prev7: [121431.96, 126936.65, 114896.46, 86780.46, 90717.53, 81446.00, 19344, 19621, 20256.9, 18708.4, 549.34, 0, 1041.69, 221.80, 45.90, 6846.57],
    season: [480579.59, 508731.46, 460846.06, 343725.09, 363865.60, 326935.35, 78649, 80395, 83431.0, 77109.1, 5497.35, 581.70, 4226.53, 838.00, 273.90, 35628.97],
    today: [8371.51, 8914.06, 8043.63, 5984.01, 6370.59, 5701.69, 1349, 1367, 1422.8, 1309.6, 74.79, 0, 74.79, 8.8, 0, 483.59],
    todayLastWeek: 6936.45, seasonPlan: 638294.03, lySeason: 571548.24, salesLastHour: 127, revenueLastHour: 1955.83,
  },
  GB: {
    past6: [152492.65, 151731.86, 143850.42, 112099.45, 111535.59, 104964.53, 22663, 23425, 22481.3, 21748.6, 4736.37, 0, 385.05, 272.10, 53.70, 5430.89],
    prev7: [147394.18, 142562.86, 135182.79, 108346.28, 104796.31, 98638.57, 21846, 22078, 21122.5, 20438.6, 334.95, 170.05, 819.88, 265.90, 55.30, 6165.01],
    season: [585209.15, 571359.39, 542215.50, 430487.85, 420310.12, 395928.00, 89077, 90872, 86992.5, 84237.7, 7124.67, 223.75, 3830.27, 1086.90, 275.30, 32897.60],
    today: [21563.99, 20901.63, 19758.34, 15850.79, 15364.39, 14417.11, 3185, 3202, 3096.6, 2987.3, 0, 0, 93.91, 56.6, 0, 868.28],
    todayLastWeek: 17547.24, seasonPlan: 716883.18, lySeason: 672474.76, salesLastHour: 188, revenueLastHour: 2989.21,
  },
  DE: {
    past6: [91726.39, 94336.08, 85397.39, 66522.69, 68417.85, 61455.36, 14057, 14156, 14495.5, 13390.4, 189.22, 0, 431.87, 157.40, 45.10, 4344.23],
    prev7: [89197.54, 91832.82, 83123.65, 64692.84, 66600.90, 59819.14, 13736, 13861, 14111.7, 13033.8, 271.61, 0, 360.02, 146.90, 42.70, 5219.40],
    season: [353446.52, 365276.85, 330306.75, 256529.32, 265121.97, 237901.15, 55696, 56423, 57708.1, 53256.9, 1392.01, 0, 2677.72, 634.10, 260.60, 25950.01],
    today: [17953.44, 18420.93, 16732.38, 13019.84, 13359.82, 12041.37, 2748, 2783, 2830.9, 2623.6, 118.65, 0, 128.32, 16.7, 0, 877.68],
    todayLastWeek: 14724.76, seasonPlan: 471044.16, lySeason: 422873.35, salesLastHour: 121, revenueLastHour: 1827.44,
  },
  JP: {
    // Japan's six full days run to Wed 28 Oct; its today (Thu 29 Oct) has not opened.
    past6: [119673.45, 113854.38, 110005.19, 82298.85, 78299.35, 74951.59, 20874, 21088, 19885.6, 19605.0, 430.23, 0, 626.55, 256.20, 32.00, 2879.91],
    prev7: [101776.44, 107603.87, 103983.19, 70039.84, 74001.02, 70847.69, 18283, 19964, 18793.9, 18532.1, 507.09, 11149.71, 589.08, 209.20, 6.20, 3028.32],
    season: [447879.84, 436507.66, 422128.40, 308329.24, 300459.18, 287881.37, 80644, 83333, 78260.5, 77210.2, 2523.15, 11149.71, 3406.89, 947.20, 157.40, 14863.79],
    today: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    todayLastWeek: 0, seasonPlan: 524829.05, lySeason: 501771.64, salesLastHour: 0, revenueLastHour: 0,
  },
};
/** Nov 15 is 18 days after Oct 28. */
const DAYS_LEFT = 18;
/**
 * season_landing's band around the 7-day pace, as measured at this clock: the daily 10th and 90th
 * percentile attainment of the last 14 days sit 3.2 points under and 2.0 points over it.
 */
const BAND = { low: -0.0322, high: 0.0198 };

/* ── Sums over the scope ─────────────────────────────────── */

const zero = (): Sums => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const add = (a: Sums, b: Sums) => a.map((v, i) => v + b[i]) as Sums;
const codesIn = (scope: Scope) => COUNTRIES.filter(c => inScope(scope, c.region, c.code)).map(c => c.code);
const sum = (codes: CountryCode[], pick: (c: Country) => Sums) => codes.reduce((s, code) => add(s, pick(C[code])), zero());
const total = (codes: CountryCode[], pick: (c: Country) => number) => codes.reduce((s, code) => s + pick(C[code]), 0);

function totalsOf(s: Sums, prevRevenue: number | null, prev: Sums | null): BusinessTotals {
  const [revenue, planRevenue, lyRevenue, grossMargin, planGrossMargin, lyGrossMargin, unitsSold, unitsRequested, planUnits, lyUnits, late, short, demand, shrinkTransit, shrinkShelf, deliveryCost] = s;
  return {
    revenue, revenueToday: 0, planRevenue, lyRevenue, prevRevenue,
    grossMargin, planGrossMargin, lyGrossMargin, unitsSold, unitsRequested, planUnits, lyUnits,
    lostRevenue: late + short + demand,
    lostByCause: { late_delivery: late, hub_shortage: short, demand_above_plan: demand },
    shrinkTransit, shrinkShelf, deliveryCost, markdown: 0,
    prev: prev && { revenue: prev[0], grossMargin: prev[3], unitsSold: prev[6], deliveryCost: prev[15], shrink: prev[13] + prev[14] },
  };
}

/** vm.totals for the scope: today so far, the last 7 days (today + six full days) and the season. */
export function totalsFor(scope: Scope): Record<BusinessPeriod, BusinessTotals> {
  const codes = codesIn(scope);
  const today = sum(codes, c => c.today);
  const withToday = (t: BusinessTotals) => ({ ...t, revenueToday: today[0] });
  return {
    today: withToday(totalsOf(today, total(codes, c => c.todayLastWeek), null)),
    "7d": withToday(totalsOf(add(today, sum(codes, c => c.past6)), sum(codes, c => c.prev7)[0], sum(codes, c => c.prev7))),
    season: withToday(totalsOf(add(today, sum(codes, c => c.season)), null, null)),
  };
}

/**
 * vm.season for the scope (season_plan + season_landing, no curve: see analysis.ts). Each country lands at
 * revenue to date plus its remaining plan at its 7-day pace; the range moves the pace by the measured band.
 */
export function seasonFor(scope: Scope): BusinessSeason {
  const codes = codesIn(scope);
  let revenueToDate = 0, planToDate = 0, lyToDate = 0, seasonPlan = 0, lySeason = 0, mid = 0, low = 0, high = 0;
  for (const code of codes) {
    const c = C[code];
    const rtd = c.season[0] + c.today[0], ptd = c.season[1] + c.today[1];
    const week = add(c.past6, c.today);
    const pace = week[1] ? week[0] / week[1] : 1;
    const rest = c.seasonPlan - ptd;
    revenueToDate += rtd; planToDate += ptd; lyToDate += c.season[2] + c.today[2];
    seasonPlan += c.seasonPlan; lySeason += c.lySeason;
    mid += rtd + rest * pace; low += rtd + rest * (pace + BAND.low); high += rtd + rest * (pace + BAND.high);
  }
  return { revenueToDate, planToDate, seasonPlan, lySeason, lyToDate, daysLeft: DAYS_LEFT, landing: codes.length ? { mid, low, high } : null };
}

/* ── Live sales ──────────────────────────────────────────── */

/**
 * recent_sales at 18:20:00 UTC, newest first: [seconds ago, store_id, store, city, country, variety, channel,
 * units, amount]. About ten sales a minute (629 in the last hour): North America's afternoon, Britain's and
 * Germany's evening; Japan is closed. Unit prices are the stores' own (US Carving $7.99, Cooking $5.49, Mini
 * $2.49; Canada $8.31, $5.71, $2.59; Britain $8.95, $6.15, $2.79; Germany $8.63, $5.93, $2.69); about one sale in
 * seven is online.
 */
const RECENT: [number, number, string, string, CountryCode, BusinessSale["variety"], BusinessSale["channel"], number, number][] = [
  [4, 2, "Old City", "Philadelphia", "US", "Cooking", "in_store", 3, 16.47],
  [9, 45, "Clifton", "Bristol", "GB", "Carving", "in_store", 2, 17.90],
  [13, 69, "Plagwitz", "Leipzig", "DE", "Carving", "in_store", 1, 8.63],
  [19, 23, "Liberty Village", "Toronto", "CA", "Cooking", "online", 2, 11.42],
  [24, 6, "Park Slope", "New York", "US", "Carving", "in_store", 4, 31.96],
  [31, 42, "Islington", "London", "GB", "Mini", "in_store", 6, 16.74],
  [37, 18, "Shadyside", "Pittsburgh", "US", "Carving", "in_store", 1, 7.99],
  [42, 50, "Didsbury", "Manchester", "GB", "Cooking", "in_store", 2, 12.30],
  [47, 33, "Wortley Village", "London", "CA", "Carving", "in_store", 2, 16.62],
  [51, 64, "Charlottenburg", "Berlin", "DE", "Cooking", "in_store", 3, 17.79],
  [56, 39, "Cataraqui", "Kingston", "CA", "Carving", "in_store", 1, 8.31],
  [60, 53, "Digbeth", "Birmingham", "GB", "Cooking", "online", 1, 6.15],
  [64, 9, "Fells Point", "Baltimore", "US", "Mini", "in_store", 8, 19.92],
  [69, 16, "Navy Yard", "Washington", "US", "Carving", "in_store", 3, 23.97],
  [70, 28, "Ancaster", "Hamilton", "CA", "Carving", "in_store", 2, 16.62],
  [70, 29, "Glebe", "Ottawa", "CA", "Mini", "in_store", 8, 20.72],
  [74, 61, "Kreuzberg", "Berlin", "DE", "Carving", "in_store", 2, 17.26],
  [75, 56, "Jewellery Quarter", "Birmingham", "GB", "Carving", "in_store", 1, 8.95],
  [82, 12, "Mount Vernon", "Baltimore", "US", "Carving", "online", 3, 23.97],
  [92, 2, "Old City", "Philadelphia", "US", "Carving", "in_store", 1, 7.99],
  [96, 66, "Eimsbüttel", "Hamburg", "DE", "Mini", "in_store", 5, 13.45],
  [103, 57, "Headingley", "Leeds", "GB", "Carving", "in_store", 2, 17.90],
  [109, 72, "Südvorstadt", "Leipzig", "DE", "Cooking", "online", 2, 11.86],
  [114, 26, "Locke Street", "Hamilton", "CA", "Cooking", "in_store", 1, 5.71],
];
const NOW = Date.UTC(2026, 9, 28, 18, 20, 0);

/**
 * vm.pulse for the scope. `receivedAt` is when this module loaded, so the preview reads "4 s ago"; a
 * Japan-only scope has no sale in the last 2 hours (03:20 JST).
 */
export function pulseFor(scope: Scope, receivedAt = Date.now()): BusinessPulse {
  const codes = codesIn(scope);
  const recent = RECENT.filter(r => codes.includes(r[4])).slice(0, 20).map(([secondsAgo, storeId, storeName, cityName, countryCode, variety, channel, units, amount], i): BusinessSale => ({
    // Sale ids run in blocks per store in the simulation, so they say nothing about order.
    id: String(storeId * 340_000 + 9_000 - i), soldAt: new Date(NOW - secondsAgo * 1000).toISOString(), secondsAgo, storeId, storeName, cityName, countryCode, variety, channel, units, amount,
  }));
  // The fixture's totals already hold today at 18:20: the pulse is not ahead of them.
  return {
    revenueToday: total(codes, c => c.today[0]), revenueAhead: 0, unitsAhead: 0, salesLastHour: total(codes, c => c.salesLastHour),
    revenueLastHour: total(codes, c => c.revenueLastHour), recent, receivedAt,
  };
}

/* ── Freshness ───────────────────────────────────────────── */

const PARTS: BusinessPart[] = ["totals", "season", "days", "mix", "bridge", "stock", "breakdown", "events", "pulse"];
/** vm.updatedAt: everything arrived 12 seconds ago, the pulse 3 seconds ago. */
export function updatedAtFor(now = Date.now()): Partial<Record<BusinessPart, number>> {
  return Object.fromEntries(PARTS.map(part => [part, now - (part === "pulse" ? 3000 : 12000)]));
}

/* ── All of it ───────────────────────────────────────────── */

/** The glance parts of the view model for a scope. */
export function glanceFor(scope: Scope): Pick<BusinessViewModel, "totals" | "season" | "pulse" | "updatedAt"> {
  return { totals: totalsFor(scope), season: seasonFor(scope), pulse: pulseFor(scope), updatedAt: updatedAtFor() };
}

export const glance = glanceFor(ALL_SCOPE);
