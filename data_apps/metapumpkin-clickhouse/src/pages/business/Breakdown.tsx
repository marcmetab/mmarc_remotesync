import { type ReactNode, useEffect, useRef, useState } from "react";
import "./breakdown.css";
import { Define } from "../../components/Define";
import { Sparkline } from "../../components/Sparkline";
import { DeltaText, Icon, Meter, type Option, Panel, PanelState, Swatch, UnderlineTabs } from "../../components/ui";
import { change, int, money, pct, share, signedPct } from "../../format";
import { Link } from "../../nav";
import { routes } from "../../routes";
import { palette, varietyColor } from "../../theme";
import type { CountryCode, Variety } from "../../types";
import { CHANNEL } from "./Mix";
import type { BreakdownDim, BreakdownMetric, BreakdownRow, BusinessChannel, BusinessPeriod, BusinessState } from "./model";

/*
 * Breakdown (full width, under the analysis rows): the period's revenue, margin, units or lost sales broken
 * down by country, city, store format, variety or channel, as a sortable table with each row's share of the
 * total, its change against plan and last season, the share of demand it lost, and a 28-day trend. A country
 * row opens that country's cities right in the table ("‹ All countries" goes back; the rest of the page keeps
 * its scope); a city row opens the city on Stores. Data: vm.breakdown[dim][period] (daily_store_sales grouped
 * five ways; a country's cities are the city rows of that country). Styles: breakdown.css.
 */

/* ── Labels ──────────────────────────────────────────────── */

const DIMS: Option<BreakdownDim>[] = [
  { value: "country", label: "Country" },
  { value: "city", label: "City" },
  { value: "format", label: "Store format" },
  { value: "variety", label: "Variety" },
  { value: "channel", label: "Channel" },
];
const DIM_LABEL = Object.fromEntries(DIMS.map(d => [d.value, d.label])) as Record<BreakdownDim, string>;
const METRICS: Option<BreakdownMetric>[] = [
  { value: "revenue", label: "Revenue" },
  { value: "margin", label: "Margin" },
  { value: "units", label: "Units" },
  { value: "lost", label: "Lost sales" },
];
/** The value column's heading, and the words in a row's label. */
const METRIC_NAME: Record<BreakdownMetric, string> = { revenue: "Revenue", margin: "Gross margin", units: "Pumpkins sold", lost: "Lost sales" };
const PERIOD_WORDS: Record<BusinessPeriod, string> = { today: "today so far", "7d": "last 7 days", season: "season to date" };
/** Above this many rows the table shows the first ten and a "Show all" button. */
const FIRST = 10;

type Sort = BusinessState["sort"];
type SortColumn = Sort["column"];
const DEFAULT_SORT: Sort = { column: "value", dir: "desc" };
/** Names A to Z first; every number highest first. */
const firstDir = (column: SortColumn): Sort["dir"] => column === "label" ? "asc" : "desc";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
const formatValue = (metric: BreakdownMetric, value: number | null | undefined) => metric === "units" ? int(value) : money(value);
/** The rows' trends added up date by date; a date no row has reached yet stays a gap. */
const sumOf = (list: number[][]) => list.length ? list[0].map((_, i) => {
  const known = list.map(l => l[i]).filter(Number.isFinite);
  return known.length ? known.reduce((s, v) => s + v, 0) : NaN;
}) : [];

/** One row with the numbers of the chosen metric worked out. */
type Line = {
  row: BreakdownRow;
  value: number | null;
  share: number | null;
  vsPlan: number | null;
  vsLy: number | null;
  lost: number | null;
  trend: number[] | undefined;
  /** Index into `trend` of the first date still running. */
  partialFrom: number | undefined;
};

function compare(column: SortColumn, dir: Sort["dir"]) {
  const key = (l: Line) => column === "value" ? l.value : column === "share" ? l.share : column === "vsPlan" ? l.vsPlan : column === "vsLy" ? l.vsLy : l.lost;
  return (a: Line, b: Line) => {
    if (column === "label") return (dir === "asc" ? 1 : -1) * a.row.label.localeCompare(b.row.label);
    const x = key(a), y = key(b);
    // Rows without the number (no plan, no channel split) go last either way.
    if (x == null || y == null) return x == null && y == null ? 0 : x == null ? 1 : -1;
    return dir === "asc" ? x - y : y - x;
  };
}

/* ── Panel ───────────────────────────────────────────────── */

export type BreakdownProps = {
  /** vm.breakdown */
  breakdown?: Record<BreakdownDim, Record<BusinessPeriod, BreakdownRow[]>>;
  period: BusinessPeriod;
  /** The page's `initial`: the starting dimension, metric and sort (the preview passes them). */
  initial?: Partial<Pick<BusinessState, "breakdownBy" | "breakdownMetric" | "sort">>;
  busy?: boolean;
  /** vm.failed.breakdown */
  error?: string;
  onRetry?: () => void;
};

/** The Breakdown table with its dimension tabs, metric switch and sortable headings. */
export function Breakdown({ breakdown, period, initial, busy, error, onRetry }: BreakdownProps) {
  const [by, setBy] = useState<BreakdownDim>(initial?.breakdownBy ?? "country");
  const [chosen, setChosen] = useState<BreakdownMetric>(initial?.breakdownMetric ?? "revenue");
  const [sort, setSort] = useState<Sort>(initial?.sort ?? DEFAULT_SORT);
  const [all, setAll] = useState(false);
  // The country whose cities the Country tab shows; null: the countries.
  const [drill, setDrill] = useState<CountryCode | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  /** Where focus goes after the rows change under it: the back button, or the country row it came from. */
  const focusNext = useRef<"back" | CountryCode | null>(null);
  // There is no plan, cost or loss by channel: the channel split is revenue only.
  const metric: BreakdownMetric = by === "channel" ? "revenue" : chosen;

  const metricSwitch = <div role="group" aria-label="Measure" className="pd-segmented pd-business-bd-metric">
    {METRICS.map(m => {
      const off = by === "channel" && m.value !== "revenue";
      return <button type="button" key={m.value} aria-pressed={m.value === metric} disabled={off} onClick={() => setChosen(m.value)}
        aria-label={off ? `${m.label}: not split by channel` : `Show ${m.label.toLowerCase()}`}><span>{m.label}</span></button>;
    })}
  </div>;

  // A drilled country that left the shell's scope falls back to the countries.
  const drilled = by === "country" && drill ? breakdown?.country?.[period]?.find(r => r.country?.code === drill) ?? null : null;
  const list = drilled ? breakdown?.city?.[period]?.filter(r => r.countryCode === drilled.country?.code) : breakdown?.[by]?.[period];
  const dimLabel = drilled ? "City" : DIM_LABEL[by];
  const openCountry = (code: CountryCode | null) => {
    focusNext.current = code ? "back" : drill;
    setDrill(code);
    setAll(false);
  };
  useEffect(() => {
    const next = focusNext.current;
    if (!next) return;
    focusNext.current = null;
    if (next === "back") backRef.current?.focus();
    else tableRef.current?.querySelector<HTMLElement>(`[data-country="${next}"]`)?.focus();
  }, [drilled?.key]);
  const crumb = drilled && <div className="pd-business-bd-crumb">
    <button type="button" ref={backRef} className="pd-business-bd-back" onClick={() => openCountry(null)}>
      <Icon name="chevronLeft" size={16} strokeWidth={2}/><span>All countries</span>
    </button>
    <span className="pd-business-bd-crumb-sep" aria-hidden="true">/</span>
    <strong>{drilled.label}</strong>
    {list && <span className="pd-business-bd-crumb-note">{list.length === 1 ? "1 city" : `${list.length} cities`}</span>}
  </div>;
  let body: ReactNode;
  if (!list) body = <>{crumb}<div className="pd-business-bd-state">{error ? <PanelState state="error" message={error} onRetry={onRetry}/> : <PanelState state="loading" rows={8} minHeight={420}/>}</div></>;
  else if (!list.length) body = <>{crumb}<div className="pd-business-bd-state"><PanelState state="empty" message="None" line/></div></>;
  else {
    const total = list.reduce((s, r) => s + (r.values[metric]?.value ?? 0), 0);
    const lines: Line[] = list.map(row => {
      const v = row.values[metric];
      return { row, value: v?.value ?? null, share: share(v?.value, total), vsPlan: change(v?.value, v?.plan), vsLy: change(v?.value, v?.ly), lost: row.lostShare, trend: row.trend[metric], partialFrom: row.partialFrom };
    }).sort(compare(sort.column, sort.dir));
    const top = Math.max(0, ...lines.map(l => l.share ?? 0)) || 1;

    // The whole of the rows, for the line at the top: plan and last season only where every row has one.
    const plan = list.every(r => r.values[metric]?.plan != null) ? list.reduce((s, r) => s + (r.values[metric]?.plan ?? 0), 0) : null;
    const ly = list.every(r => r.values[metric]?.ly != null) ? list.reduce((s, r) => s + (r.values[metric]?.ly ?? 0), 0) : null;
    const revenue = list.reduce((s, r) => s + (r.values.revenue?.value ?? 0), 0);
    const lostValue = list.every(r => r.values.lost) ? list.reduce((s, r) => s + (r.values.lost?.value ?? 0), 0) : null;
    const trends = lines.map(l => l.trend).filter((t): t is number[] => !!t);
    const partials = lines.map(l => l.partialFrom).filter((i): i is number => i != null);
    const sum: Line = {
      row: { key: "total", label: "Total", values: {}, lostShare: null, trend: {} },
      value: total, share: 1, vsPlan: change(total, plan), vsLy: change(total, ly),
      lost: lostValue == null ? null : share(lostValue, revenue + lostValue), trend: trends.length === lines.length ? sumOf(trends) : undefined,
      partialFrom: partials.length ? Math.min(...partials) : undefined,
    };

    const many = lines.length > FIRST + 2;
    const shown = many && !all ? lines.slice(0, FIRST) : lines;
    const color = metric === "lost" ? palette.pumpkinDeep : palette.meadow;
    const head = (column: SortColumn, label: string, right = true) => {
      const on = sort.column === column;
      const next: Sort["dir"] = on ? (sort.dir === "asc" ? "desc" : "asc") : firstDir(column);
      const words = column === "label" ? (next === "asc" ? "A to Z" : "Z to A") : (next === "desc" ? "highest first" : "lowest first");
      return <span role="columnheader" className={cx(right && "pd-right")} aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button type="button" className={cx("pd-business-bd-sort", on && "is-on")} onClick={() => setSort({ column, dir: next })}
          aria-label={`Sort by ${label.toLowerCase()}, ${words}`}>
          {label}{on && <Icon name="chevronDown" size={14} strokeWidth={2.2} style={sort.dir === "asc" ? { transform: "rotate(180deg)" } : undefined}/>}
        </button>
      </span>;
    };
    const cells = (l: Line, chevron: boolean) => <>
      <span role="cell" className="pd-right pd-business-bd-value">{formatValue(metric, l.value)}</span>
      <span role="cell" className="pd-business-bd-share">
        {/* Bars compare the rows (the largest fills it), so the total has none. */}
        {l === sum ? <span/> : <Meter height={6} value={(l.share ?? 0) / top} color={color}/>}
        <span>{pct(l.share, 1)}</span>
      </span>
      <span role="cell" className="pd-right"><DeltaText value={l.vsPlan} goodWhen={metric === "lost" ? "down" : "up"}/></span>
      <span role="cell" className="pd-right"><DeltaText value={l.vsLy} goodWhen={metric === "lost" ? "down" : "up"}/></span>
      <span role="cell" className="pd-right pd-business-bd-lost">{pct(l.lost, 1)}</span>
      <span role="cell" className="pd-business-bd-trend">
        {l.trend && <Sparkline values={l.trend} partialFrom={l.partialFrom} color={metric === "lost" ? palette.pumpkinDeep : palette.plum} width={84} height={26}/>}
        {chevron && <Icon name="chevronRight" size={16} strokeWidth={2}/>}
      </span>
    </>;
    const sentence = (l: Line) => [
      `${l.row.label}${l.row.sublabel ? `, ${l.row.sublabel}` : ""}: ${METRIC_NAME[metric].toLowerCase()} ${formatValue(metric, l.value)}`,
      `${pct(l.share, 1)} of the total`,
      l.vsPlan != null && `${signedPct(l.vsPlan)} vs plan`,
      l.vsLy != null && `${signedPct(l.vsLy)} vs last season`,
      l.lost != null && `${pct(l.lost, 1)} of demand lost`,
    ].filter(Boolean).join(", ");

    body = <>
      {crumb}
      <div className="pd-table-scroll pd-business-bd-scroll">
        <div role="table" ref={tableRef} id="pd-business-bd-table" className="pd-table pd-business-bd-table"
          aria-label={`Breakdown by ${dimLabel.toLowerCase()}${drilled ? ` in ${drilled.label}` : ""}: ${METRIC_NAME[metric].toLowerCase()}, ${PERIOD_WORDS[period]}`}>
          <div role="row" className="pd-thead">
            {head("label", dimLabel, false)}
            {head("value", METRIC_NAME[metric])}
            {head("share", "Share", false)}
            {head("vsPlan", "vs plan")}
            {head("vsLy", "vs last season")}
            {head("lost", "Demand lost")}
            <span role="columnheader" className="pd-business-bd-trend-head">28 days</span>
          </div>
          <div role="row" className="pd-tr is-group pd-business-bd-row">
            <span role="rowheader" className="pd-business-bd-name"><span className="pd-business-bd-label"><strong>Total</strong></span></span>
            {cells(sum, false)}
          </div>
          {shown.map(l => {
            const r = l.row;
            const mark = by === "variety" ? <Swatch color={varietyColor[r.key as Variety] ?? palette.faint}/> : by === "channel" ? <Swatch color={CHANNEL[r.key as BusinessChannel]?.color ?? palette.faint}/> : null;
            const name = <>{mark}<span className="pd-business-bd-label"><strong>{r.label}</strong>{r.sublabel && <small>{r.sublabel}</small>}</span></>;
            const country = drilled ? undefined : r.country;
            let nameCell: ReactNode;
            if (country) nameCell = <button type="button" className="pd-business-bd-hit" data-country={country.code}
              onClick={() => openCountry(country.code)} aria-label={`${sentence(l)}. Show its cities`}>{name}</button>;
            else if (r.cityKey) nameCell = <Link to={routes.city(r.cityKey)} className="pd-business-bd-hit" aria-label={`${sentence(l)}. Open ${r.label} on Stores`}>{name}</Link>;
            else nameCell = <span className="pd-business-bd-plain">{name}</span>;
            return <div role="row" key={r.key} className={cx("pd-tr pd-business-bd-row", (country || r.cityKey) && "is-hit")}>
              <span role="rowheader" className="pd-business-bd-name">{nameCell}</span>
              {cells(l, !!(country || r.cityKey))}
            </div>;
          })}
        </div>
        {/* Phones: the right edge fades while more columns are off to the side. */}
        <span className="pd-business-bd-fade" aria-hidden="true"/>
      </div>
      {many && <button type="button" className="pd-business-bd-more" aria-expanded={all} aria-controls="pd-business-bd-table" onClick={() => setAll(!all)}>
        <span>{all ? "Show fewer" : `Show all ${lines.length}`}</span>
        <Icon name="chevronDown" size={16} strokeWidth={2} style={all ? { transform: "rotate(180deg)" } : undefined}/>
      </button>}
    </>;
  }

  return <Panel title={<Define k="breakdown" part="breakdown">Breakdown</Define>} label="Breakdown" pad="flush" gap={0} busy={busy} className="pd-business-bd">
    <div className="pd-business-bd-controls">
      <UnderlineTabs label="Break down by" options={DIMS} value={by} onChange={next => { setBy(next); setAll(false); setDrill(null); }} trailing={metricSwitch}/>
    </div>
    {body}
  </Panel>;
}
