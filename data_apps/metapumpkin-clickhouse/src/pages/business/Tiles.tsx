import { useRef } from "react";
import "./business.css";
import "./glance.css";
import "./tiles.css";
import { Define, type DefineExtra } from "../../components/Define";
import { Swatch } from "../../components/ui";
import type { DefinitionKey } from "../../definitions";
import { change, int, money, pct, price, share } from "../../format";
import { varietyColor } from "../../theme";
import { changeRow, type ExtraRow, PERIOD_TITLE } from "./extra";
import type { BusinessMix, BusinessPeriod, BusinessTotals, BusinessViewModel } from "./model";

/*
 * The three tiles under the hero: Gross margin, Average selling price and Contribution. Each is its label,
 * the number and one thin split bar with a key: where each $1 of revenue went (the pumpkins' cost, delivery
 * and shrink, the margin or what is left), or the pumpkins sold by kind. No comparisons at rest: hovering a
 * tile (or the label's button, for the keyboard) opens the definition card with the period's numbers.
 * Data: vm.totals[period] (daily_store_sales sums) and vm.mix[period] (daily_store_sales by variety: units
 * sold and revenue). Styles: tiles.css; the numeral style is glance.css's, shared with the hero.
 */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export type TilesProps = {
  period: BusinessPeriod;
  /** vm.totals[period] */
  totals?: BusinessTotals;
  /** vm.mix[period]: the pumpkins sold by kind under Average selling price. */
  mix?: BusinessMix;
  /** vm.failed.mix: the kinds bar is left out (Mix shows the error and its Retry). */
  mixError?: string;
  /** vm.failed: totals is read (the hero shows the error and its Retry; the tiles show dashes). */
  failed?: BusinessViewModel["failed"];
  /** A refresh is running: the numbers dim, the labels stay crisp. */
  busy?: boolean;
};

/** The parts of each $1: the pumpkins' cost pale, delivery and shrink peach, what is kept the page's plum block (business.css). */
const COST = "var(--pd-border)", DELIVERY = "var(--pd-incoming)", KEPT = "var(--pd-business-plum-block)";

/** One part of a split bar: its key text, its size (only positive sizes are drawn) and its colour. */
type SplitPart = { label: string; value: number; color: string };
/** Under a tile's number: the parts, a pale bar while they load, "No sales yet", or nothing (a failed load). */
type SplitState = SplitPart[] | "loading" | "empty" | null;

const contributionOf = (gm: number, delivery: number, shrink: number) => gm - delivery - shrink;
const cents = (value: number) => `${int(value)}¢`;

/**
 * Whole shares of `total` (100 by default) that add up to exactly it (largest remainder): [31.4, 68.6] →
 * [31, 69]. A part can be negative (a loss): it keeps its sign and the shares still add up.
 */
function wholeShares(values: number[], total = 100): number[] {
  const sum = values.reduce((s, v) => s + v, 0);
  if (!sum) return values.map(() => 0);
  const exact = values.map(v => v / sum * total);
  const out = exact.map(v => Math.floor(v));
  const order = exact.map((v, i) => ({ i, rest: v - Math.floor(v) })).sort((a, b) => b.rest - a.rest);
  let left = Math.round(total - out.reduce((s, v) => s + v, 0));
  for (let j = 0; left > 0 && j < order.length; j++, left--) out[order[j].i]++;
  return out;
}

/** The card's box of numbers; rows left out when there are none, "No sales yet" without a note. */
const extraOf = (title: string, rows: ExtraRow[], note: string | undefined): DefineExtra =>
  ({ title, rows: rows.length ? rows : undefined, note: note ?? "No sales yet." });

/** "Share of revenue 68.5%"; left out without revenue. */
function shareRow(part: number, revenue: number): ExtraRow[] {
  const s = share(part, revenue);
  return s == null ? [] : [{ label: "Share of revenue", value: pct(s, 1) }];
}

/**
 * Gross margin and contribution as cents of each $1 of revenue, average selling price over the pumpkins
 * sold by kind. Contribution is what is left after delivery and shrink; it has no plan or last season, so
 * its card compares it with the prior 7 days, on the 7-day tab only.
 */
export function Tiles({ period, totals: t, mix, mixError, failed, busy }: TilesProps) {
  // The hero already shows a failed load with its Retry: the tiles stay quiet, with dashes.
  const loading = !t && !failed?.totals;
  const title = PERIOD_TITLE[period];
  const dollars = (parts: SplitPart[]): SplitState => loading ? "loading" : !t ? null : t.revenue > 0 ? parts : "empty";

  // Where each $1 went: the parts add up to revenue, so their cents add up to 100.
  const pumpkins = t ? t.revenue - t.grossMargin : 0;
  const deliveryShrink = t ? t.deliveryCost + t.shrinkTransit + t.shrinkShelf : 0;
  const contribution = t && contributionOf(t.grossMargin, t.deliveryCost, t.shrinkTransit + t.shrinkShelf);
  const prevContribution = t?.prev && period === "7d" ? contributionOf(t.prev.grossMargin, t.prev.deliveryCost, t.prev.shrink) : null;
  const gmCents = t && t.revenue > 0 ? wholeShares([pumpkins, t.grossMargin]) : null;
  // Contribution splits the margin's cents (rounding them apart, the two tiles could give the pumpkins
  // different cents, and delivery & shrink + left would miss the margin by one); without a margin, its own split.
  const cCents = t && contribution != null && gmCents
    ? t.grossMargin > 0 ? [gmCents[0], ...wholeShares([deliveryShrink, contribution], gmCents[1])] : wholeShares([pumpkins, deliveryShrink, contribution])
    : null;

  // Pumpkins sold by kind (VARIETIES order, as in Mix), and each kind's own average price.
  const asp = share(t?.revenue, t?.unitsSold);
  const units = mix?.varieties.reduce((s, v) => s + v.units, 0) ?? 0;
  const kinds = mix && units > 0 ? wholeShares(mix.varieties.map(v => v.units)) : null;
  const each = mix?.varieties.filter(v => v.units > 0).map(v => `${v.variety} ${price(v.revenue / v.units)}`) ?? [];
  const aspSplit: SplitState = mix
    ? kinds ? mix.varieties.map((v, i) => ({ label: `${v.variety} ${kinds[i]}%`, value: v.units, color: varietyColor[v.variety] })) : "empty"
    : mixError ? null : "loading";

  return <div className={cx("pd-cards pd-business-tiles", busy && "is-busy")}>
    <Tile k="grossMargin" label="Gross margin" loading={loading} value={money(t?.grossMargin)}
      split={dollars(gmCents ? [
        { label: `${cents(gmCents[0])} pumpkins`, value: pumpkins, color: COST },
        { label: `${cents(gmCents[1])} margin`, value: t?.grossMargin ?? 0, color: KEPT },
      ] : [])} splitLabel="Of each $1 of revenue:"
      extra={t && extraOf(title, [
        ...shareRow(t.grossMargin, t.revenue),
        ...changeRow("vs plan", change(t.grossMargin, t.planGrossMargin)),
        ...changeRow("vs last season", change(t.grossMargin, t.lyGrossMargin)),
      ], gmCents ? `Of each $1 of revenue, ${cents(gmCents[0])} paid for the pumpkins and ${cents(gmCents[1])} is margin.` : undefined)}/>
    <Tile k="averageSellingPrice" label="Average selling price" loading={loading} value={price(asp)}
      split={aspSplit} splitLabel="Pumpkins sold by kind:"
      extra={t || mix ? extraOf(title, t ? [
        ...changeRow("vs plan", change(asp, share(t.planRevenue, t.planUnits))),
        ...changeRow("vs last season", change(asp, share(t.lyRevenue, t.lyUnits))),
      ] : [], each.length
        ? `The bar is pumpkins sold by kind. More Minis pull the average down, more Carvings push it up. Each: ${each.join(" · ")}`
        : mix || t?.unitsSold === 0 ? undefined : "More Minis pull the average down, more Carvings push it up.") : undefined}/>
    <Tile k="contribution" label="Contribution" loading={loading} value={money(contribution)} align="end"
      split={dollars(cCents ? [
        { label: `${cents(cCents[0])} pumpkins`, value: pumpkins, color: COST },
        { label: `${cents(cCents[1])} delivery & shrink`, value: deliveryShrink, color: DELIVERY },
        { label: `${cents(cCents[2])} left`, value: contribution ?? 0, color: KEPT },
      ] : [])} splitLabel="Of each $1 of revenue:"
      extra={t && contribution != null ? extraOf(title, [
        ...shareRow(contribution, t.revenue),
        ...changeRow("vs prior 7 days", prevContribution != null ? change(contribution, prevContribution) : null),
      ], cCents ? `Of each $1 of revenue: ${cents(cCents[0])} pumpkins, ${cents(cCents[1])} delivery and shrink, ${cents(cCents[2])} left.` : undefined) : undefined}/>
  </div>;
}

type TileProps = {
  k: DefinitionKey;
  label: string;
  /** The number, already formatted (a dash when totals failed). */
  value: string;
  loading: boolean;
  split: SplitState;
  /** Read before the key by screen readers: "Of each $1 of revenue:". */
  splitLabel: string;
  /** The period's numbers in the definition card. */
  extra?: DefineExtra;
  /** The card lines up with the tile's end (the right-hand tile). */
  align?: "start" | "end";
};

/** One tile: the label, the number and the split bar. The whole tile opens the definition on hover or click. */
function Tile({ k, label, value, loading, split, splitLabel, extra, align }: TileProps) {
  const ref = useRef<HTMLDivElement>(null);
  return <div ref={ref} className="pd-business-tile">
    <span className="pd-business-tile-label"><Define k={k} part="totals" area={ref} quiet align={align} extra={extra}>{label}</Define></span>
    {loading
      ? <span className="pd-skeleton pd-business-tile-skeleton" role="status"><span className="pd-sr">Loading {label.toLowerCase()}</span></span>
      : <span className="pd-business-figure-num pd-business-tile-num">{value}</span>}
    {split && <SplitBar parts={split} label={splitLabel}/>}
  </div>;
}

/**
 * A thin bar split into parts (2px apart, rounded at its outer ends) and its key: a swatch and a short text
 * per part. The bar is decoration and draws only the positive parts, scaled to their sum; the key carries the
 * numbers (a negative part keeps its true value there).
 */
function SplitBar({ parts, label }: { parts: Exclude<SplitState, null>; label: string }) {
  if (parts === "loading") return <span className="pd-business-split" aria-hidden="true"><span className="pd-skeleton pd-business-split-skeleton"/></span>;
  if (parts === "empty") return <span className="pd-business-split"><span className="pd-business-split-key">No sales yet</span></span>;
  const drawn = parts.filter(p => p.value > 0);
  return <span className="pd-business-split">
    {drawn.length > 0 && <span className="pd-business-split-bar" aria-hidden="true">
      {drawn.map((p, i) => <span key={i} style={{ flexGrow: p.value, background: p.color }}/>)}
    </span>}
    <span className="pd-business-split-key">
      <span className="pd-sr">{label} </span>
      {parts.map((p, i) => <span className="pd-business-split-item" key={i}>
        <Swatch color={p.color}/>{p.label}{i < parts.length - 1 && <span className="pd-sr">,</span>}
      </span>)}
    </span>
  </span>;
}
