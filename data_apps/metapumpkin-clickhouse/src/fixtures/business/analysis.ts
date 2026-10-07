import type { BusinessBridge, BusinessPeriod, BusinessSeason, BusinessSeasonDay, BusinessStock, BusinessStockLine } from "../../pages/business/model";
import { VARIETIES, type Variety } from "../../types";

/*
 * Mock data of the Business page's analysis panels (Plan to actual, Season, Stock at risk), all regions.
 * The numbers are the ones pumpkin_live returned on the local database (research-sql.md §2–4) at the
 * fixtures' clock, Wed 28 Oct 2026 18:20 UTC, three days before Halloween; the `oct4` and `november`
 * sets are the same views at Sun 4 Oct 12:31 and at Tue 10 Nov 12:00, for previewing the other phases
 * of the season. Per-variety splits are invented so that they add up to the measured totals.
 */

/* ── Plan to actual ──────────────────────────────────────── */

/** plan, volume, mix, lost late / short / demand, actual (USD). Plan + volume + mix − lost = actual to the cent. */
type BridgeRow = [plan: number, volume: number, mix: number, late: number, short: number, demand: number, actual: number];
const bridgeOf = ([plan, volume, mix, late, short, demand, actual]: BridgeRow): BusinessBridge =>
  ({ plan, volume, mix, lostByCause: { late_delivery: late, hub_shortage: short, demand_above_plan: demand }, actual });

/** Wed 28 Oct 18:20 UTC. */
export const bridge: Record<BusinessPeriod, BusinessBridge> = {
  today: bridgeOf([61509.21, -58.59, 0.36, 217.41, 0, 421.84, 60811.73]),
  "7d": bridgeOf([757381.00, 7612.54, -669.58, 8970.09, 0, 4012.03, 751341.84]),
  season: bridgeOf([2699693.64, 29052.11, -742.11, 24614.96, 14173.12, 19777.91, 2669437.65]),
};
/** Sun 4 Oct 12:31 UTC. */
export const bridgeOct4: Record<BusinessPeriod, BusinessBridge> = {
  today: bridgeOf([13732.04, 687.12, -9.41, 66.00, 0, 91.05, 14252.70]),
  "7d": bridgeOf([227452.10, 2466.55, 177.68, 2027.53, 0, 1741.86, 226326.94]),
  season: bridgeOf([588136.67, 5593.98, 725.71, 3047.61, 581.70, 7752.77, 583074.28]),
};

/* ── Season curve ────────────────────────────────────────── */

const SEASON_DAYS = 76; // Sep 1 (index 0, a Tuesday) to Nov 15 (75); Oct 31 is 60
const DAY_MS = 86_400_000;
const START = Date.UTC(2026, 8, 1);
const dateAt = (i: number) => new Date(START + i * DAY_MS).toISOString().slice(0, 10);
const weekday = (i: number) => (2 + i) % 7; // 0 = Sunday
/** The script's demand weight (02_script.sql `cal.w`): a ramp to Oct 28, weekends ×1.35, November ×0.2. */
const weight = (i: number, weekend: boolean) => (0.35 + 2.8 * Math.max(0, 1 - Math.abs(i - 57) / 35)) * (weekend ? 1.35 : 1) * (i > 60 ? 0.2 : 1);
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, k) => from + k);
/** Scales `values[from..to]` so they add up to `sum`. */
function pin(values: number[], from: number, to: number, sum: number) {
  const have = range(from, to).reduce((s, i) => s + values[i], 0);
  for (const i of range(from, to)) values[i] *= sum / have;
}

/**
 * The full-day plan per day, pinned to what season_daily returned: cum plan $574,404.63 to Oct 3, Oct 4
 * $49,621.16, $2,638,184.43 to Oct 27, $3,110,107.33 to Oct 31 (Oct 31 alone $146,549.10), $3,300,000.07
 * to Nov 15.
 */
const PLAN = (() => {
  const v = range(0, SEASON_DAYS - 1).map(i => weight(i, weekday(i) === 0 || weekday(i) === 6));
  pin(v, 0, 32, 574404.63); pin(v, 33, 33, 49621.16); pin(v, 34, 56, 2014158.64);
  pin(v, 57, 59, 325373.80); pin(v, 60, 60, 146549.10); pin(v, 61, 75, 189892.74);
  return v;
})();
/** Last season on the same dates: last year's weekends fell a weekday earlier (Sun and Mon of 2026). $3,013,783.32 in all. */
const LY = (() => {
  const v = range(0, SEASON_DAYS - 1).map(i => weight(i, weekday(i) === 0 || weekday(i) === 1));
  pin(v, 0, SEASON_DAYS - 1, 3013783.32);
  return v;
})();
/** Daily attainment of the plan, wobbling around 99%. */
const attainment = (i: number) => 0.99 + 0.012 * Math.sin(i * 1.3) + 0.008 * Math.cos(i * 0.7);

/**
 * season_daily summed over all countries, with actuals up to `today` (index), whose revenue so far is
 * `todayRevenue`; `pastRevenue` pins the days before today: [index, cum revenue to that day inclusive].
 */
function curveTo(today: number, todayRevenue: number, pins: [to: number, sum: number][]): BusinessSeasonDay[] {
  const actual = PLAN.map((p, i) => p * attainment(i));
  let from = 0;
  for (const [to, sum] of pins) { pin(actual, from, to, sum); from = to + 1; }
  actual[today] = todayRevenue;
  let plan = 0, ly = 0, rev = 0;
  return PLAN.map((p, i) => {
    plan += p; ly += LY[i];
    if (i <= today) rev += actual[i];
    return { date: dateAt(i), cumPlan: plan, cumLy: ly, cumRevenue: i <= today ? rev : null, isToday: i === today, daysToHalloween: 60 - i };
  });
}

/**
 * season_daily summed over all countries at Wed 28 Oct 18:20, as measured: [cum plan, cum last season, cum
 * revenue (null after the local today)], one row per day from Sep 1. Japan is already on Thu 29 Oct (not open
 * yet), so Oct 29 is a today too, without an actual (its curve stops at Oct 28, $2,669,437.65 with every
 * market's Oct 28 so far).
 */
const MEASURED_OCT28: [cumPlan: number, cumLy: number, cumRevenue: number | null][] = [
  [11301.87, 10403.61, 11530.64], [22603.74, 20807.22, 22942.47], [33905.61, 31210.83, 34470.39], [45207.48, 41614.44, 46059.56],
  [60464.98, 52018.05, 60602.37], [73200.88, 66062.94, 73282.45], [84502.75, 77817.32, 84307.27], [95804.62, 88220.93, 95522.18],
  [107106.49, 98624.54, 106257.10], [118408.36, 109028.15, 117236.56], [129710.23, 119431.76, 127903.30], [144967.73, 129835.37, 142678.80],
  [157703.63, 143880.26, 155305.66], [169005.50, 155634.64, 166748.56], [180307.37, 166038.25, 177941.29], [191609.24, 176441.86, 188943.16],
  [202911.11, 186845.47, 200007.89], [214212.98, 197249.08, 211071.76], [229470.48, 207652.69, 226199.95], [242206.38, 221697.58, 238792.73],
  [253595.96, 233543.23, 250060.38], [265073.25, 244108.33, 261252.09], [276638.38, 254754.20, 273035.63], [290954.59, 267932.53, 287206.94],
  [308062.16, 283680.48, 304089.21], [334979.81, 302034.83, 330911.29], [360684.57, 330381.57, 356747.34], [386406.73, 357133.53, 382205.89],
  [415080.66, 383528.42, 410937.65], [446746.53, 412677.39, 442481.07], [481444.20, 444617.32, 476358.36], [519214.00, 479385.19, 514320.37],
  [574404.63, 517017.74, 568821.58], [624025.79, 571739.01, 618993.96], [671252.28, 620856.04, 665665.67], [721711.27, 667304.50, 716088.67],
  [775442.91, 716765.45, 768197.55], [832487.23, 769275.82, 824829.49], [892884.28, 824872.52, 885309.97], [979000.75, 883592.35, 971927.92],
  [1054247.02, 966572.76, 1046606.99], [1124005.66, 1039123.64, 1115801.59], [1196748.67, 1106084.94, 1188855.28], [1272476.00, 1175793.29, 1264003.97],
  [1351187.64, 1248248.83, 1343237.72], [1432883.60, 1323451.50, 1424556.95], [1547201.96, 1401401.31, 1537516.65], [1645988.96, 1510342.16, 1624676.84],
  [1736637.87, 1604619.49, 1711880.76], [1830271.15, 1690810.64, 1805331.87], [1926888.64, 1779748.93, 1901746.08], [2026490.58, 1871434.30, 2000956.37],
  [2129076.88, 1965866.86, 2103440.60], [2271597.09, 2063046.58, 2243772.95], [2393924.80, 2197947.69, 2362504.63], [2505464.10, 2313951.53, 2473791.17],
  [2619987.65, 2419372.60, 2589555.76], [2737495.38, 2527540.73, 2669437.65], [2852018.93, 2632961.80, null], [2963558.23, 2735635.71, null],
  [3110107.33, 2835562.45, null], [3126761.06, 2853927.82, null], [3141121.86, 2868863.54, null], [3155064.99, 2881698.36, null],
  [3168590.35, 2894148.62, null], [3181697.97, 2906214.33, null], [3194387.73, 2917895.46, null], [3210954.86, 2929192.06, null],
  [3224313.23, 2943923.32, null], [3235749.75, 2955817.60, null], [3246768.45, 2965960.53, null], [3257369.40, 2975718.81, null],
  [3267552.59, 2985092.54, null], [3277317.93, 2994081.65, null], [3289937.28, 3002686.20, null], [3300000.07, 3013783.32, null],
];
export const seasonCurve: BusinessSeasonDay[] = MEASURED_OCT28.map(([cumPlan, cumLy, cumRevenue], i) =>
  ({ date: dateAt(i), cumPlan, cumLy, cumRevenue, isToday: i === 57 || i === 58, daysToHalloween: 60 - i }));
/** Sun 4 Oct: the same days to Oct 3, and $14,252.70 today so far ($583,074.28). */
export const seasonCurveOct4: BusinessSeasonDay[] = curveTo(33, 14252.70, [[32, 568821.58]]);

/** Last season to date, with today paced like the plan (today's paced plan over its full-day plan). */
const lyToDate = (curve: BusinessSeasonDay[], today: number, todayPacedPlan: number) => curve[today - 1].cumLy + LY[today] * todayPacedPlan / PLAN[today];

/**
 * season_plan + season_landing (+ season_daily) at Wed 28 Oct 18:20, all countries. Landing: revenue to
 * date plus the plan still to come at the last 7 days' pace; the range from the daily 10th/90th
 * percentile attainment of the last 14 days.
 */
export const season: BusinessSeason = {
  revenueToDate: 2669437.65,
  planToDate: 2699673.22,
  seasonPlan: 3300000.00,
  lySeason: 3013783.26,
  lyToDate: 2493332.14,
  daysLeft: 18,
  landing: { mid: 3264390.57, low: 3244407.16, high: 3276878.08 },
  curve: seasonCurve,
};
/** The same at Sun 4 Oct 12:31: a wide range (six weeks to go). */
export const seasonOct4: BusinessSeason = {
  revenueToDate: 583074.28,
  planToDate: 588136.67,
  seasonPlan: 3300000.07,
  lySeason: 3013783.32,
  lyToDate: lyToDate(seasonCurveOct4, 33, 13732.04),
  daysLeft: 42,
  landing: { mid: 3275972, low: 3163460, high: 3353306 },
  curve: seasonCurveOct4,
};

/* ── Stock at risk ───────────────────────────────────────── */

type Line = Omit<BusinessStockLine, "storeUnits" | "hubUnits" | "transitUnits"> & { on: [stores: number, hubs: number, vans: number] };
const line = ({ on: [storeUnits, hubUnits, transitUnits], ...rest }: Line): BusinessStockLine => ({ storeUnits, hubUnits, transitUnits, ...rest });
const KEYS: (keyof BusinessStockLine)[] = ["storeUnits", "hubUnits", "transitUnits", "harvestPlan", "expectedSales", "leftover", "leftoverLow", "leftoverHigh", "leftoverCost", "leftoverRetail", "markdownExposure", "seasonEndUnits", "seasonEndCost", "novemberSales"];
/** stock_outlook summed: each variety, and their total. */
function stockOf(lines: Record<Variety, Line>): BusinessStock {
  const varieties = VARIETIES.map(variety => ({ variety, ...line(lines[variety]) }));
  const total = Object.fromEntries(KEYS.map(k => [k, varieties.reduce((s, v) => s + (v[k] ?? 0), 0)])) as BusinessStockLine;
  return { varieties, total };
}

/**
 * Wed 28 Oct 18:20, all countries (stock_outlook as measured, summed by variety). Totals: on hand 102,093
 * (stores 6,893 · hubs 90,820 · vans 4,380), harvest plan 22,006, left on Nov 1 55,746 / 56,402 / 57,058,
 * $83.2k at cost, $290.9k at retail, November demand 43,325, markdown exposure $37.1k, season end 15,122
 * ($22.5k at cost).
 */
export const stock: BusinessStock = stockOf({
  Carving: { on: [3458, 37646, 2425], harvestPlan: 5871, expectedSales: 35901, leftover: 12684, leftoverLow: 12509, leftoverHigh: 12858, leftoverCost: 30440.62, leftoverRetail: 103005.56, markdownExposure: 19816.19, seasonEndUnits: 4734, seasonEndCost: 11359.51, novemberSales: 9524 },
  Cooking: { on: [1282, 24981, 735], harvestPlan: 9667, expectedSales: 11129, leftover: 24630, leftoverLow: 24341, leftoverHigh: 24920, leftoverCost: 39408.36, leftoverRetail: 138954.54, markdownExposure: 17316.13, seasonEndUnits: 4261, seasonEndCost: 6817.91, novemberSales: 20840 },
  Mini: { on: [2153, 28193, 1220], harvestPlan: 6468, expectedSales: 18232, leftover: 19088, leftoverLow: 18896, leftoverHigh: 19280, leftoverCost: 13361.43, leftoverRetail: 48910.94, markdownExposure: 0, seasonEndUnits: 6127, seasonEndCost: 4288.85, novemberSales: 12961 },
});

/**
 * Sun 4 Oct 12:43, all countries: on hand 31,072, harvest plan 465,357, left on Nov 1 34,549 / 47,785 /
 * 62,739, $67.6k at cost, $237.6k at retail, November demand 43,138, markdown exposure $34.9k, season end
 * 7,362 ($8.7k at cost).
 */
export const stockOct4: BusinessStock = stockOf({
  Carving: { on: [2050, 9800, 900], harvestPlan: 241000, expectedSales: 222134, leftover: 6500, leftoverLow: 1050, leftoverHigh: 12700, leftoverCost: 15600, leftoverRetail: 53495, markdownExposure: 16055, seasonEndUnits: 300, seasonEndCost: 720, novemberSales: 9100 },
  Cooking: { on: [1700, 8600, 700], harvestPlan: 130000, expectedSales: 101832, leftover: 25800, leftoverLow: 20300, leftoverHigh: 32000, leftoverCost: 41280, leftoverRetail: 145770, markdownExposure: 18845, seasonEndUnits: 3400, seasonEndCost: 5440, novemberSales: 20500 },
  Mini: { on: [1383, 5454, 485], harvestPlan: 94357, expectedSales: 76465, leftover: 15485, leftoverLow: 13199, leftoverHigh: 18039, leftoverCost: 10720, leftoverRetail: 38335, markdownExposure: 0, seasonEndUnits: 3662, seasonEndCost: 2563, novemberSales: 13538 },
});

/**
 * Tue 10 Nov 12:00, all countries: no harvest and no sales to Oct 31 left, so "left on Nov 1" is the stock
 * on hand (28,900); November's remaining demand 13,000; 16,550 left at season end ($23.4k at cost).
 */
export const stockNovember: BusinessStock = stockOf({
  Carving: { on: [300, 5800, 100], harvestPlan: 0, expectedSales: 0, leftover: 6200, leftoverLow: 6200, leftoverHigh: 6200, leftoverCost: 14880, leftoverRetail: 51026, markdownExposure: 8398, seasonEndUnits: 3050, seasonEndCost: 7320, novemberSales: 3400 },
  Cooking: { on: [520, 13180, 200], harvestPlan: 0, expectedSales: 0, leftover: 13900, leftoverLow: 13900, leftoverHigh: 13900, leftoverCost: 22240, leftoverRetail: 78535, markdownExposure: 5865, seasonEndUnits: 7400, seasonEndCost: 11840, novemberSales: 6900 },
  Mini: { on: [300, 8420, 80], harvestPlan: 0, expectedSales: 0, leftover: 8800, leftoverLow: 8800, leftoverHigh: 8800, leftoverCost: 6160, leftoverRetail: 22440, markdownExposure: 0, seasonEndUnits: 6100, seasonEndCost: 4270, novemberSales: 2700 },
});

/**
 * An edge case, not a measurement: United Kingdom on Sun 4 Oct with carving projected to run 1,000 short
 * before Halloween (the low end of the real run had GB carving at −1,029), for the "Short by" tag.
 */
export const stockShort: BusinessStock = stockOf({
  Carving: { on: [420, 1900, 160], harvestPlan: 46000, expectedSales: 45120, leftover: -1000, leftoverLow: -2240, leftoverHigh: 380, leftoverCost: 0, leftoverRetail: 0, markdownExposure: 0, seasonEndUnits: 0, seasonEndCost: 0, novemberSales: 1900 },
  Cooking: { on: [330, 1700, 140], harvestPlan: 25500, expectedSales: 20300, leftover: 4700, leftoverLow: 3700, leftoverHigh: 5800, leftoverCost: 7520, leftoverRetail: 29600, markdownExposure: 3500, seasonEndUnits: 620, seasonEndCost: 992, novemberSales: 4100 },
  Mini: { on: [270, 1050, 95], harvestPlan: 18500, expectedSales: 15400, leftover: 2900, leftoverLow: 2450, leftoverHigh: 3400, leftoverCost: 2030, leftoverRetail: 8000, markdownExposure: 0, seasonEndUnits: 650, seasonEndCost: 455, novemberSales: 2600 },
});

/** The three parts at the fixtures' clock (Wed 28 Oct 18:20 UTC), for src/fixtures/business.ts. */
export const analysis = { bridge, season, stock };
