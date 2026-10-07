import "./business.css";
import { Define, type DefinitionKey } from "../../components/Define";
import { Meter, Panel, PanelState, RowLink, Swatch } from "../../components/ui";
import { money, pct, share } from "../../format";
import { routes } from "../../routes";
import { palette } from "../../theme";
import { LOST_CAUSE_LABEL, type LostCause } from "../../types";
import type { BusinessPeriod, BusinessTotals } from "./model";

/*
 * Lost sales and costs (the rail beside Daily revenue): what the stores could not sell, split by cause,
 * each cause opening the page where it is worked on; then shrink, delivery and, from Nov 1, markdowns.
 * Data: vm.totals[period] (daily_store_sales sums). Styles: business.css.
 */

/** Where each cause is worked on: late and short vans on Harvest & fleet, demand on Stores. */
const CAUSES: { cause: LostCause; color: string; to: string; page: string }[] = [
  { cause: "late_delivery", color: palette.pumpkinDeep, to: routes.fleet(), page: "Harvest & fleet" },
  { cause: "hub_shortage", color: palette.candle, to: routes.fleet(), page: "Harvest & fleet" },
  { cause: "demand_above_plan", color: palette.rose, to: routes.stores(), page: "Stores" },
];
/** Markdowns begin on Nov 1: carving at 70% and cooking at 85% of the list price. */
const MARKDOWNS_FROM = "2026-11-01";

/** A share of revenue as "68.5% of revenue", or a dash when there is no revenue. */
const ofRevenue = (part: number, revenue: number) => revenue ? `${pct(part / revenue, 1)} of revenue` : "—";

export type LostAndCostsProps = {
  /** vm.totals[period] */
  totals?: BusinessTotals;
  period: BusinessPeriod;
  /** clock.now: the markdowns row shows from Nov 1 (the clock's date), or as soon as there are markdowns. */
  clockNow?: string;
  busy?: boolean;
  /** vm.failed.totals */
  error?: string;
  onRetry?: () => void;
};

/** Requests the stores could not serve, split by cause (each cause opens the page where it is worked on), then the cost lines. */
export function LostAndCosts({ totals, period, clockNow, busy, error, onRetry }: LostAndCostsProps) {
  const title = <Define k="lostSales" part="totals">Lost sales</Define>;
  if (!totals) return <Panel title={title} label="Lost sales and costs" gap={12} className="pd-split-rail pd-business-rail">
    {error ? <PanelState state="error" message={error} onRetry={onRetry}/> : <PanelState state="loading" chart minHeight={280}/>}
  </Panel>;
  const t = totals;
  const markdowns = t.markdown > 0 || (clockNow ?? "").slice(0, 10) >= MARKDOWNS_FROM;
  const costs: { k: DefinitionKey; label: string; value: number; note: string }[] = [
    { k: "shrink", label: "Shrink", value: t.shrinkTransit + t.shrinkShelf, note: `In transit ${money(t.shrinkTransit)} · on shelf ${money(t.shrinkShelf)}` },
    { k: "deliveryCost", label: "Delivery", value: t.deliveryCost, note: ofRevenue(t.deliveryCost, t.revenue) },
    ...(markdowns ? [{ k: "markdowns" as const, label: "Markdowns", value: t.markdown, note: ofRevenue(t.markdown, t.revenue) }] : []),
  ];
  return <Panel title={title} label="Lost sales and costs" gap={12} busy={busy} className="pd-split-rail pd-business-rail">
    <div className="pd-business-lost">
      <span className="pd-num">{money(t.lostRevenue)}</span>
      <span>{t.revenue ? ofRevenue(t.lostRevenue, t.revenue) : period === "today" ? "No demand yet today" : "—"}</span>
    </div>
    <Meter segments={CAUSES.map(c => ({ value: share(t.lostByCause[c.cause], t.lostRevenue) ?? 0, color: c.color }))}/>
    <div>
      {CAUSES.map(c => {
        const value = money(t.lostByCause[c.cause]);
        const part = share(t.lostByCause[c.cause], t.lostRevenue);
        return <RowLink key={c.cause} to={c.to} trailing={<strong className="pd-business-amount">{value}</strong>} aria-label={`${LOST_CAUSE_LABEL[c.cause]}, ${value}. Open ${c.page}`}>
          <span className="pd-business-cause"><Swatch color={c.color}/><span>{LOST_CAUSE_LABEL[c.cause]}{part != null && <span> {pct(part)}</span>}</span></span>
        </RowLink>;
      })}
    </div>
    <h2 className="pd-panel-title pd-business-subtitle">Costs</h2>
    <div>
      {costs.map(c => <div className="pd-business-cost" key={c.label}>
        <span><Define k={c.k} part="totals">{c.label}</Define></span>
        <strong className="pd-business-amount">{money(c.value)}</strong>
        <small>{c.note}</small>
      </div>)}
    </div>
  </Panel>;
}
