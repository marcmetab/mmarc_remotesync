import "./analysis.css";
import { Define } from "../../components/Define";
import { DeltaText, Panel, PanelState, RowLink } from "../../components/ui";
import { change, dollars, int, money, niceScale, num } from "../../format";
import { routes } from "../../routes";
import { LOST_CAUSE_LABEL, type LostCause } from "../../types";
import type { BusinessBridge, BusinessPeriod } from "./model";

/*
 * Plan to actual: the period's revenue walked from plan to actual as a horizontal waterfall. Plan, then
 * what demand did (volume, mix), then what was lost and why (each cause opens the page where it is worked
 * on), then actual. Bars float from the running total on one shared scale. The scale does not start at
 * zero (a 1% move would be a hairline): it starts at a round value under 90% of the lowest total, and
 * the axis says so, with a break drawn across the two total bars. Data: daily_store_sales (model.ts
 * BusinessBridge). Styles: analysis.css.
 */

type PartProps = { busy?: boolean; error?: string; onRetry?: () => void };

const PERIOD_LABEL: Record<BusinessPeriod, string> = { today: "today so far", "7d": "last 7 days", season: "season to date" };

type StepKind = "total" | "up" | "down" | "zero";
type Step = {
  key: string;
  label: string;
  /** The signed change, or the total itself. */
  value: number;
  /** Where the bar starts and ends on the value axis. */
  from: number;
  to: number;
  kind: StepKind;
  /** Lost causes: the page where the cause is worked on. */
  link?: { to: string; page: string };
};

/** Where each lost cause is worked on: late and short vans on Harvest & fleet, demand on Stores. */
const LOST: { cause: LostCause; to: string; page: string }[] = [
  { cause: "late_delivery", to: routes.fleet(), page: "Harvest & fleet" },
  { cause: "hub_shortage", to: routes.fleet(), page: "Harvest & fleet" },
  { cause: "demand_above_plan", to: routes.stores(), page: "Stores" },
];

/** A change in compact dollars, always signed: +$7.6k · −$670 · $0. */
const signedMoney = (v: number) => Math.abs(v) < 0.5 ? "$0" : v > 0 ? `+${money(v)}` : money(v);
/** The same in whole dollars, for screen readers: "+$7,613". */
const signedDollars = (v: number) => Math.abs(v) < 0.5 ? "$0" : v > 0 ? `+${dollars(v)}` : dollars(v);

/** Plan, volume, mix, the three lost causes and actual, each with where its bar starts and ends. */
function stepsOf(b: BusinessBridge): Step[] {
  const steps: Step[] = [{ key: "plan", label: "Plan", value: b.plan, from: 0, to: b.plan, kind: "total" }];
  let run = b.plan;
  const add = (key: string, label: string, value: number, link?: Step["link"]) => {
    const kind: StepKind = Math.abs(value) < 0.5 ? "zero" : value > 0 ? "up" : "down";
    steps.push({ key, label, value, from: run, to: run + value, kind, link });
    run += value;
  };
  add("volume", "Volume", b.volume);
  add("mix", "Mix", b.mix);
  for (const l of LOST) add(l.cause, LOST_CAUSE_LABEL[l.cause], -b.lostByCause[l.cause], { to: l.to, page: l.page });
  steps.push({ key: "actual", label: "Actual", value: b.actual, from: 0, to: b.actual, kind: "total" });
  return steps;
}

/**
 * The value axis: from a round value under 90% of the lowest total or running total, to a round value
 * above the highest. Zero when the moves are as large as the totals (nothing to zoom into).
 */
function axisOf(steps: Step[]) {
  const ends = steps.flatMap(s => s.kind === "total" ? [s.to] : [s.from, s.to]);
  const lo = Math.min(...ends), hi = Math.max(...ends);
  const floor0 = lo > 0 ? lo * 0.9 : 0;
  const { step } = niceScale(Math.max(hi - floor0, 1), 4);
  const base = Math.max(0, Math.floor(floor0 / step) * step);
  const top = Math.ceil((hi + (hi - base) * 0.02) / step) * step;
  const ticks: number[] = [];
  for (let t = base; t <= top + step / 2; t += step) ticks.push(Number(t.toPrecision(12)));
  return { base, top, step, ticks };
}

/** Axis labels in the unit of the scale: $675k · $2.4M · $54k · $800. */
function tickLabel(v: number, step: number, top: number) {
  const digits = (unit: number) => (step / unit >= 1 ? (Number.isInteger(step / unit) ? 0 : 1) : step / unit >= 0.1 ? 1 : 2);
  if (v === 0) return "$0";
  if (top >= 1e6) return `$${num(v / 1e6, digits(1e6))}M`;
  if (top >= 1e3) return `$${num(v / 1e3, digits(1e3))}k`;
  return `$${int(v)}`;
}

/**
 * Plan to actual for the period: a waterfall on rows. The lost-sales rows are links; the panel's aside
 * gives the gap to plan in dollars.
 */
export function Bridge({ period, bridge, busy, error, onRetry, className }: { period: BusinessPeriod; bridge?: BusinessBridge; className?: string } & PartProps) {
  const title = <Define k="bridge" part="bridge">Plan to actual</Define>;
  const cls = ["pd-split-main pd-business-bridge", className].filter(Boolean).join(" ");
  if (!bridge) return <Panel title={title} label="Plan to actual" gap={10} className={cls}>
    {error ? <PanelState state="error" message={error} onRetry={onRetry}/> : <PanelState state="loading" chart minHeight={340}/>}
  </Panel>;
  if (bridge.plan <= 0 && bridge.actual <= 0) return <Panel title={title} label="Plan to actual" gap={10} busy={busy} className={cls}>
    <PanelState state="empty" message="No sales yet" minHeight={120}/>
  </Panel>;

  const steps = stepsOf(bridge);
  const axis = axisOf(steps);
  const span = axis.top - axis.base || 1;
  const at = (v: number) => (Math.max(axis.base, Math.min(axis.top, v)) - axis.base) / span * 100;
  const gap = bridge.actual - bridge.plan;
  const baseLabel = tickLabel(axis.base, axis.step, axis.top);

  return <Panel title={title} label="Plan to actual" gap={10} busy={busy} className={cls}
    aside={<DeltaText value={change(bridge.actual, bridge.plan)} text={signedMoney(gap)} label="vs plan"/>}>
    <div className="pd-business-bridge-body">
      <ol className="pd-business-bridge-list" aria-label={`Plan to actual, ${PERIOD_LABEL[period]}. The scale starts at ${baseLabel}`}>
        {steps.map(s => {
          const total = s.kind === "total";
          const left = total ? 0 : at(Math.min(s.from, s.to));
          const width = total ? at(s.to) : at(Math.max(s.from, s.to)) - left;
          const sentence = total
            ? `${s.label}: ${dollars(s.value)}${s.key === "actual" ? `, ${signedDollars(gap)} against plan` : ""}`
            : `${s.label}: ${signedDollars(s.value)}, ${dollars(s.to)} after this step`;
          const body = <span className="pd-business-bridge-step" aria-hidden={s.link ? undefined : true}>
            <span className="pd-business-bridge-label">{s.label}</span>
            <span className="pd-business-bridge-track">
              <i className="pd-business-bridge-guide" style={{ left: `${at(bridge.plan)}%` }}/>
              <span className={`pd-business-bridge-bar is-${s.kind}`} style={{ left: `${left}%`, width: `${width}%` }}>
                {total && axis.base > 0 && <i className="pd-business-bridge-break"/>}
              </span>
            </span>
          </span>;
          const amount = <strong className="pd-business-bridge-amount" aria-hidden={s.link ? undefined : true}>{total ? money(s.value) : signedMoney(s.value)}</strong>;
          return <li key={s.key} className={total ? "is-total" : undefined}>
            {s.link
              ? <RowLink to={s.link.to} className="pd-business-bridge-row" trailing={amount} aria-label={`${sentence}. Open ${s.link.page}`}>{body}</RowLink>
              : <div className="pd-business-bridge-row"><span className="pd-sr">{sentence}</span>{body}{amount}<span/></div>}
          </li>;
        })}
      </ol>
      <div className="pd-business-bridge-axis" aria-hidden="true">
        <span className="pd-business-bridge-ticks">
          {axis.ticks.map((t, i) => <span key={t} className={i === 0 ? "is-first" : i === axis.ticks.length - 1 ? "is-last" : undefined} style={{ left: `${at(t)}%` }}>
            {i === 0 && axis.base > 0 && <i className="pd-business-bridge-zig"/>}{tickLabel(t, axis.step, axis.top)}
          </span>)}
        </span>
      </div>
    </div>
  </Panel>;
}
