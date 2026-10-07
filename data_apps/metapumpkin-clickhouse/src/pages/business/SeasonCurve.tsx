import "./analysis.css";
import { Define } from "../../components/Define";
import { Panel, PanelState, PumpkinGlyph } from "../../components/ui";
import { money, niceScale, num } from "../../format";
import type { BusinessSeason, BusinessSeasonDay } from "./model";

/*
 * Season: revenue added up from Sep 1 to Nov 15 against the plan and last season, with where it is
 * heading. Plan (plum) and last season (rose, dashed) are known for every day; actual (olive) runs to
 * today; from today a dashed olive line goes to the landing, in a wash between the low and high end of
 * its range. The projection spends the plan still to come at the pace the landing assumes:
 *   projected(d) = revenue to date + (cum plan(d) − plan to date) × (landing − revenue to date) / (season plan − plan to date)
 * so it ends exactly on the landing (and the low and high ends on theirs). Inline SVG stretched over an
 * HTML frame (labels stay crisp at any width; nothing is measured). Data: season_daily, season_plan,
 * season_landing (model.ts BusinessSeason). Styles: analysis.css.
 */

type PartProps = { busy?: boolean; error?: string; onRetry?: () => void };

const W = 1000, H = 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-09-01" → "Sep 1" (the axis wants the short month, whatever the locale calls it). */
const shortDate = (ymd: string) => `${MONTHS[Number(ymd.slice(5, 7)) - 1] ?? ""} ${Number(ymd.slice(8, 10))}`;

/** Axis labels: $0 · $0.5M · $3.0M, or $100k on a small scope. */
function tickLabel(v: number, step: number, top: number) {
  if (v === 0) return "$0";
  if (top >= 1e6) return `$${num(v / 1e6, step % 1e6 ? (step % 1e5 ? 2 : 1) : 0)}M`;
  return `$${num(v / 1e3, step % 1e3 ? 1 : 0)}k`;
}

/** The days that get a date under the axis: the first and last, Halloween, and the first of each month, never two within 9% of the width. */
function xLabels(curve: BusinessSeasonDay[]) {
  const n = curve.length, last = n - 1;
  const want = [0, last, curve.findIndex(d => d.daysToHalloween === 0), ...curve.flatMap((d, i) => d.date.endsWith("-01") ? [i] : [])];
  const taken: number[] = [];
  for (const i of want) if (i >= 0 && !taken.includes(i) && taken.every(j => Math.abs(i - j) / Math.max(1, last) >= 0.09)) taken.push(i);
  return taken.sort((a, b) => a - b);
}

/** Season: the cumulative curve with today, Halloween and the projected landing. */
export function SeasonCurve({ season, busy, error, onRetry, className }: { season?: BusinessSeason; className?: string } & PartProps) {
  const title = <Define k="seasonCurve" part="season">Season</Define>;
  const cls = ["pd-split-main pd-business-curve", className].filter(Boolean).join(" ");
  const curve = season?.curve;
  if (!season || !curve) return <Panel title={title} label="Season" gap={12} className={cls}>
    {error ? <PanelState state="error" message={error} onRetry={onRetry}/> : <PanelState state="loading" chart minHeight={300}/>}
  </Panel>;
  if (!curve.length) return <Panel title={title} label="Season" gap={12} busy={busy} className={cls}><PanelState state="empty" message="None"/></Panel>;

  const n = curve.length, last = n - 1;
  const firstToday = curve.findIndex(d => d.isToday);
  const lastKnown = curve.reduce((k, d, i) => d.cumRevenue != null ? i : k, -1);
  // With several countries in scope, the earliest local today is "today" (a country already on tomorrow has not sold yet).
  const today = firstToday >= 0 ? firstToday : lastKnown;
  const actual = curve.slice(0, today + 1).flatMap((d, i) => d.cumRevenue == null ? [] : [[i, d.cumRevenue] as const]);
  const atToday = actual.length ? actual[actual.length - 1] : null;

  // The projection: from today's point to Nov 15, ending on the landing (mid, low, high).
  const { landing, revenueToDate, planToDate } = season;
  const planEnd = curve[last].cumPlan;
  const remaining = planEnd - planToDate;
  const project = (to: number) => {
    if (!atToday || today >= last || remaining <= 0) return null;
    const pace = (to - revenueToDate) / remaining;
    return [atToday, ...curve.slice(today + 1).map((d, k) => [today + 1 + k, revenueToDate + (d.cumPlan - planToDate) * pace] as const)];
  };
  const mid = landing && project(landing.mid), low = landing && project(landing.low), high = landing && project(landing.high);

  const max = Math.max(...curve.map(d => Math.max(d.cumPlan, d.cumLy, d.cumRevenue ?? 0)), landing?.high ?? 0);
  const scale = niceScale(max * 1.04, 7);
  const x = (i: number) => (last ? i / last : 0) * W;
  const y = (v: number) => (1 - Math.max(0, v) / scale.top) * H;
  const pct = (i: number) => `${(last ? i / last : 0) * 100}%`;
  const path = (pts: readonly (readonly [number, number])[]) => pts.map(([i, v], k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const series = (pick: (d: BusinessSeasonDay) => number) => path(curve.map((d, i) => [i, pick(d)] as const));
  const band = low && high ? `${path(low)}${[...high].reverse().map(([i, v]) => `L${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("")}Z` : null;
  const halloween = curve.findIndex(d => d.daysToHalloween === 0);
  const afterHalloween = halloween >= 0 && today > halloween;

  const summary = [
    `Season revenue ${money(revenueToDate)} so far against ${money(planToDate)} plan to date`,
    landing && `landing ${money(landing.mid)}, range ${money(landing.low)} to ${money(landing.high)}`,
    `season plan ${money(season.seasonPlan)}, last season ${money(season.lySeason)}`,
  ].filter(Boolean).join("; ");

  return <Panel title={title} label="Season" gap={12} busy={busy} className={cls}>
    <div className="pd-business-curve-readout">
      <span><i className="pd-business-curve-key is-actual" aria-hidden="true"/>To date <strong>{money(revenueToDate)}</strong></span>
      {landing && <span><i className="pd-business-curve-key is-landing" aria-hidden="true"/><Define k="seasonLanding" part="season">Landing</Define> <strong>{money(landing.mid)}</strong> · range {money(landing.low)}–{money(landing.high)}</span>}
      <span><i className="pd-business-curve-key is-plan" aria-hidden="true"/>Plan {money(season.seasonPlan)}</span>
      <span><i className="pd-business-curve-key is-ly" aria-hidden="true"/>Last season {money(season.lySeason)}</span>
    </div>
    <div className="pd-business-curve-body">
      <div className="pd-chart pd-business-curve-chart" role="img" aria-label={summary}>
        <div className="pd-chart-axis" aria-hidden="true">
          {scale.ticks.map(t => <span key={t} style={{ bottom: `${t / scale.top * 100}%` }}>{tickLabel(t, scale.step, scale.top)}</span>)}
        </div>
        <div className="pd-chart-plot" aria-hidden="true">
          {scale.ticks.map(t => <span key={t} className="pd-chart-grid" style={{ bottom: `${t / scale.top * 100}%` }}/>)}
          {halloween >= 0 && <span className={`pd-business-curve-mark is-halloween${afterHalloween ? " is-flip" : ""}`} style={{ left: pct(halloween) }}><PumpkinGlyph width={15}/></span>}
          {today >= 0 && <span className={`pd-business-curve-mark is-today${afterHalloween ? "" : " is-flip"}`} style={{ left: pct(today) }}><span>Today</span></span>}
          <svg className="pd-business-curve-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            {band && <path d={band} className="is-band"/>}
            <path d={series(d => d.cumLy)} className="is-ly"/>
            <path d={series(d => d.cumPlan)} className="is-plan"/>
            {mid && <path d={path(mid)} className="is-landing"/>}
            {actual.length > 1 && <path d={path(actual)} className="is-actual"/>}
          </svg>
          {atToday && <span className="pd-business-curve-dot" style={{ left: pct(atToday[0]), bottom: `${Math.max(0, atToday[1]) / scale.top * 100}%` }}/>}
          <span className="pd-chart-base"/>
        </div>
        <div className="pd-chart-x" aria-hidden="true">
          <div className="pd-business-curve-x">
            {xLabels(curve).map(i => <span key={i} className={i === 0 ? "is-first" : i === last ? "is-last" : i === halloween ? "is-halloween" : undefined} style={{ left: pct(i) }}>{shortDate(curve[i].date)}</span>)}
          </div>
        </div>
      </div>
    </div>
  </Panel>;
}
