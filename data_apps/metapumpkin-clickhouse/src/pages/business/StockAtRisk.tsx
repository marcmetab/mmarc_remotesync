import "./analysis.css";
import type { ReactNode } from "react";
import { Define } from "../../components/Define";
import { Legend, type LegendItem, Panel, PanelState, Swatch, Tag } from "../../components/ui";
import { int, money, num } from "../../format";
import { palette, varietyColor } from "../../theme";
import type { BusinessStock, BusinessStockLine } from "./model";

/*
 * Stock at risk: the pumpkins projected to be left when Halloween is over. Up to Oct 31 it is stock on
 * hand plus the harvest still planned, minus the sales expected to Oct 31; a negative leftover means the
 * variety runs short before Halloween. Two bars: the supply, and where it goes by Oct 31 (sales, shrink and
 * harvest below plan, what is left), in neutrals so they do not read as varieties; then each variety, what the November markdowns will give away, and what is
 * left when the season ends (the write-off risk). From Nov 1 (the clock's date) there is no harvest or
 * Halloween demand left: the panel shows the stock on hand against November's sales instead. Data:
 * stock_outlook (model.ts BusinessStock). Styles: analysis.css.
 */

type PartProps = { busy?: boolean; error?: string; onRetry?: () => void };

/** Pumpkins in compact form: 55.4k · 980 · −1.0k. */
const units = (v: number) => Math.abs(v) >= 999.5 ? `${num(v / 1000, 1)}k` : int(v);

/**
 * Supply: where the pumpkins are now, and the harvest to come, in graded neutrals (the colors of the
 * varieties, the plan and last season mean something else on this page); the harvest still to come is hatched.
 */
const SUPPLY: { key: "storeUnits" | "hubUnits" | "transitUnits" | "harvestPlan"; label: string; color: string; hatch?: string }[] = [
  { key: "storeUnits", label: "Stores", color: palette.inkSoft },
  { key: "hubUnits", label: "Hubs", color: palette.faint },
  { key: "transitUnits", label: "Vans", color: palette.border },
  { key: "harvestPlan", label: "Harvest", color: palette.faint, hatch: "is-harvest" },
];
/** Where the supply goes: what sells, what neither sells nor stays, and (the risk) what is left. */
const SOLD = palette.muted;
/** Segment in light, border in dark, where segment is the track's colour (analysis.css). */
const OTHER = "var(--pd-business-stock-other)";

/** The day after Halloween: markdowns start, harvest and Halloween demand are over. */
const NOV_1 = "2026-11-01";
/** True from Nov 1 on the clock (its UTC date, as the clock pill shows it). */
const isNovember = (clockNow?: string) => {
  const d = clockNow ? new Date(clockNow) : null;
  return !!d && !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) >= NOV_1;
};

/**
 * What one line (a variety, or the total) adds up to, in the phase of the season: the supply, the sales
 * expected (demand), what of it sells from this supply (sold), and what is left (negative: short).
 */
function phaseOf(l: BusinessStockLine, november: boolean) {
  const onHand = l.storeUnits + l.hubUnits + l.transitUnits;
  if (november) {
    // November: what is on hand meets the rest of November's sales; what stays is the season-end leftover.
    // The leftover is counted per country and variety, where a stock cannot serve another market's demand:
    // what it leaves of the on-hand is what sells, and the rest of the demand goes unserved.
    const demand = l.novemberSales ?? Math.max(0, l.leftover - l.seasonEndUnits);
    const sold = Math.min(demand, Math.max(0, onHand - l.seasonEndUnits));
    return { onHand, supply: onHand, demand, sold, left: l.seasonEndUnits, unserved: Math.max(0, demand - sold) };
  }
  return { onHand, supply: onHand + l.harvestPlan, demand: l.expectedSales, sold: l.expectedSales, left: l.leftover, unserved: Math.max(0, -l.leftover) };
}

/** Stock at risk: the leftover on Nov 1 (or the stock on hand in November), where supply goes, per variety, markdowns and the season end. */
export function StockAtRisk({ stock, clockNow, busy, error, onRetry, className }: { stock?: BusinessStock; clockNow?: string; className?: string } & PartProps) {
  const title = <Define k="stockAtRisk" part="stock">Stock at risk</Define>;
  const cls = ["pd-split-rail pd-business-stock", className].filter(Boolean).join(" ");
  if (!stock) return <Panel title={title} label="Stock at risk" gap={14} className={cls}>
    {error ? <PanelState state="error" message={error} onRetry={onRetry}/> : <PanelState state="loading" chart minHeight={360}/>}
  </Panel>;

  const november = isNovember(clockNow);
  const t = stock.total;
  const p = phaseOf(t, november);
  const short = !november && t.leftover < 0;
  const ranged = !november && Math.round(t.leftoverLow) !== Math.round(t.leftoverHigh);

  let head: ReactNode;
  if (november) head = <>
    <div className="pd-business-stock-head">
      <span className="pd-num">{units(p.onHand)}</span>
      <span>pumpkins on hand</span>
    </div>
    <div className="pd-business-stock-sub">{money(t.leftoverCost)} at cost · {money(t.leftoverRetail)} at retail</div>
  </>;
  else if (short) head = <div className="pd-business-stock-head is-short">
    <span className="pd-num"><small className="pd-unit">≈</small> {units(-t.leftover)}</span>
    <span>pumpkins short before Halloween{ranged && ` · range ${units(Math.max(0, -t.leftoverHigh))}–${units(-t.leftoverLow)}`}</span>
  </div>;
  else head = <>
    <div className="pd-business-stock-head">
      <span className="pd-num"><small className="pd-unit">≈</small> {units(t.leftover)}</span>
      <span>pumpkins left on Nov 1</span>
    </div>
    <div className="pd-business-stock-sub">{ranged && `Range ${units(t.leftoverLow)}–${units(t.leftoverHigh)} · `}{money(t.leftoverCost)} at cost · {money(t.leftoverRetail)} at retail</div>
  </>;

  return <Panel title={title} label="Stock at risk" gap={14} busy={busy} className={cls}>
    <div className="pd-business-stock-top">{head}</div>
    <Flow line={t} november={november}/>
    <div className="pd-business-stock-varieties">
      {stock.varieties.map(v => {
        const vp = phaseOf(v, november);
        // A variety's own shortfall nets its markets (the bar above counts each market on its own).
        const vShort = november ? Math.max(0, vp.demand - vp.onHand) : Math.max(0, -v.leftover);
        return <div className="pd-keyrow" key={v.variety}>
          <Swatch color={varietyColor[v.variety]}/>
          <span>{v.variety}</span>
          {vShort > 0
            ? <span className="pd-business-stock-short"><Tag tone="severe" size="sm">Short by {units(vShort)}</Tag></span>
            : <><strong>{november ? units(vp.onHand) : `≈ ${units(v.leftover)}`}</strong><span className="pd-business-stock-note">{money(v.leftoverCost)} at cost</span></>}
        </div>;
      })}
    </div>
    <div className="pd-business-stock-foot">
      <div className="pd-business-stock-row">
        <span><Define k="markdownExposure" part="stock">Markdown exposure</Define></span>
        <strong>{money(t.markdownExposure)}</strong>
      </div>
      <div className="pd-business-stock-row">
        <span>Left at season end</span>
        <strong>≈ {units(t.seasonEndUnits)} · {money(t.seasonEndCost)} at cost</strong>
      </div>
    </div>
  </Panel>;
}

/**
 * Two bars on one scale. Supply: stores, hubs, vans and (to Oct 31) the harvest to come. Then where it goes
 * by Oct 31 (in November: by Nov 15): the sales expected, shrink and harvest below plan, and what is left
 * (hatched). Sales the supply cannot meet run past its end, hatched in terracotta.
 */
function Flow({ line, november }: { line: BusinessStockLine; november: boolean }) {
  const { supply, demand, sold, left, unserved } = phaseOf(line, november);
  const kept = Math.max(0, left), short = unserved;
  // What neither sells nor stays: shrink, and the harvest coming in under plan.
  const other = Math.max(0, supply - sold - left);
  const scale = Math.max(1, supply, sold + other + kept, supply + short);
  const w = (v: number) => `${Math.max(0, v) / scale * 100}%`;
  const parts = SUPPLY.filter(s => !(november && s.key === "harvestPlan"));
  const until = november ? "Nov 15" : "Oct 31";
  let x = 0;
  const supplyBars = parts.map(s => {
    const v = line[s.key], left0 = x;
    x += v;
    return <span key={s.key} className={s.hatch ? `pd-business-stock-hatch ${s.hatch}` : undefined} style={{ left: w(left0), width: w(v), background: s.hatch ? undefined : s.color }}/>;
  });
  const swatchOf = (hatch?: string) => hatch ? <i className={`pd-business-stock-hatch ${hatch}`} aria-hidden="true"/> : undefined;
  const goesItems: LegendItem[] = [
    { label: `Sales ${units(sold)}`, color: SOLD },
    ...(other >= 0.5 ? [{ label: `Shrink, harvest gap ${units(other)}`, color: OTHER }] : []),
    ...(kept >= 0.5 || short < 0.5 ? [{ label: `Left ${units(kept)}`, color: palette.pumpkin, swatch: swatchOf("is-left") }] : []),
    ...(short >= 0.5 ? [{ label: `Short ${units(short)}`, color: palette.severe, swatch: swatchOf("is-short") }] : []),
  ];
  return <div className="pd-business-stock-flow">
    <div className="pd-business-stock-bar">
      <div className="pd-business-stock-bar-head"><span>{november ? "On hand" : "Supply"}</span><strong>{units(supply)}</strong></div>
      <span className="pd-business-stock-track" role="img" aria-label={`${november ? "On hand" : "Supply"} ${int(supply)}: ${parts.map(s => `${s.label.toLowerCase()} ${int(line[s.key])}`).join(", ")}`}>{supplyBars}</span>
      <Legend items={parts.map(s => ({ label: `${s.label} ${units(line[s.key])}`, color: s.color, swatch: swatchOf(s.hatch) }))}/>
    </div>
    <div className="pd-business-stock-bar">
      <div className="pd-business-stock-bar-head"><span>By {until}</span></div>
      <span className="pd-business-stock-track" role="img"
        aria-label={`By ${until}: sales ${int(sold)} of ${int(demand)} expected${other >= 0.5 ? `, shrink and harvest below plan ${int(other)}` : ""}, left ${int(kept)}${short >= 0.5 ? `, short by ${int(short)}` : ""}`}>
        <span style={{ left: 0, width: w(sold), background: SOLD }}/>
        {other >= 0.5 && <span style={{ left: w(sold), width: w(other), background: OTHER }}/>}
        {kept > 0 && <span className="pd-business-stock-hatch is-left" style={{ left: w(sold + other), width: w(kept) }}/>}
        {short >= 0.5 && <span className="pd-business-stock-hatch is-short" style={{ left: w(supply), width: w(short) }}/>}
      </span>
      <Legend items={goesItems}/>
    </div>
  </div>;
}
