import type { BusinessBridge, BusinessPeriod, BusinessSeason, BusinessStock, BusinessStockLine, BusinessTotals, BusinessViewModel } from "../pages/business/model";
import { ALL_SCOPE, type Scope } from "../types";
import { season as seasonAll, stock as stockAll } from "./business/analysis";
import { breakdownFor, daysFor, eventsFor, mixFor, todayFor } from "./business/breakdown";
import { glanceFor, seasonFor } from "./business/glance";

/**
 * The Business page at the showcase clock, Wed 28 Oct 2026, 18:20 UTC (three days before Halloween),
 * assembled from the section fixtures in ./business/: the glance (totals, season, live sales, freshness),
 * the breakdown builder's days, events, mix and Breakdown table, and the analysis builder's season curve and
 * stock. `fixtureFor(scope)` follows the region control and the country focus the way the live hook does;
 * `fixture` is all regions.
 *
 * Plan to actual is worked out from the totals with the live hook's formula, so its actual is the hero's
 * revenue. The season curve and the stock are measured for all regions only: for a narrower scope they are
 * scaled by the scope's share (of the season plan, last season and revenue to date for the curve, of the
 * season plan for the stock), which is close enough for a preview.
 */

const PERIODS: BusinessPeriod[] = ["today", "7d", "season"];
const per = <T>(make: (period: BusinessPeriod) => T) => Object.fromEntries(PERIODS.map(p => [p, make(p)])) as Record<BusinessPeriod, T>;

/** Plan to actual from one period's totals (src/data/useBusinessData.ts bridgeOf). */
function bridgeOf(t: BusinessTotals): BusinessBridge {
  const volume = t.planUnits ? (t.unitsRequested - t.planUnits) * t.planRevenue / t.planUnits : 0;
  return { plan: t.planRevenue, volume, mix: t.revenue + t.lostRevenue - t.planRevenue - volume, lostByCause: t.lostByCause, actual: t.revenue };
}

const ratio = (part: number, whole: number) => whole ? part / whole : 0;

/** The all-regions season curve, scaled to the scope's season. */
function seasonOf(scope: Scope): BusinessSeason {
  const s = seasonFor(scope);
  const all = seasonFor(ALL_SCOPE);
  const plan = ratio(s.seasonPlan, all.seasonPlan), ly = ratio(s.lySeason, all.lySeason), actual = ratio(s.revenueToDate, all.revenueToDate);
  const curve = seasonAll.curve?.map(d => ({ ...d, cumPlan: d.cumPlan * plan, cumLy: d.cumLy * ly, cumRevenue: d.cumRevenue == null ? null : d.cumRevenue * actual }));
  return { ...s, curve };
}

/** The all-regions stock, scaled to the scope's share of the season plan. */
function stockOf(scope: Scope): BusinessStock {
  const share = ratio(seasonFor(scope).seasonPlan, seasonFor(ALL_SCOPE).seasonPlan);
  if (share === 1) return stockAll;
  const scale = <L extends BusinessStockLine>(line: L): L =>
    Object.fromEntries(Object.entries(line).map(([k, v]) => [k, typeof v === "number" ? Math.round(v * share) : v])) as L;
  return { varieties: stockAll.varieties.map(scale), total: scale(stockAll.total) };
}

export function fixtureFor(scope: Scope): BusinessViewModel {
  const glance = glanceFor(scope);
  const totals = glance.totals!;
  return {
    ...glance,
    season: seasonOf(scope),
    days: daysFor(scope),
    today: todayFor(scope),
    events: eventsFor(scope),
    bridge: per(period => bridgeOf(totals[period])),
    stock: stockOf(scope),
    breakdown: breakdownFor(scope),
    mix: mixFor(scope),
  };
}

export const fixture: BusinessViewModel = fixtureFor(ALL_SCOPE);
