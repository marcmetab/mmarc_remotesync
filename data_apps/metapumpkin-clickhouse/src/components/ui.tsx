import { type CSSProperties, type PointerEvent, type ReactNode, useRef } from "react";
import { lateLabel, signedPct } from "../format";
import { Link } from "../nav";
import type { ChipStatus } from "../types";
import { useSegmentLens } from "./lens";

/**
 * Shared building blocks. Presentational only: no data hooks, no SDK imports, and nothing that
 * measures the window (the static preview renders these on the server; the segmented control's sliding lens measures
 * its own options, in an effect, so not there). Styles: styles/base.css.
 */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/* ── Icons ───────────────────────────────────────────────── */

export type IconName =
  | "dollar" | "truck" | "store" | "chevronRight" | "chevronLeft" | "chevronDown" | "close" | "alert" | "leaf" | "check"
  | "clock" | "storm" | "refresh" | "box" | "pin" | "arrowRight" | "sun" | "moon" | "chart" | "globe" | "route" | "pause" | "play";
const ICONS: Record<IconName, ReactNode> = {
  dollar: <path d="M12 2v20M17 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6"/>,
  truck: <><path d="M2.5 6h11v11h-11zM13.5 9.5h4l3.5 4V17h-7.5"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/></>,
  store: <path d="M3 9l2-5h14l2 5M4.5 10v10h15V10M9.5 20v-6h5v6"/>,
  chevronRight: <path d="M10 7l5 5-5 5"/>,
  chevronLeft: <path d="M14 7l-5 5 5 5"/>,
  chevronDown: <path d="M7 10l5 5 5-5"/>,
  close: <path d="M6 6l12 12M18 6 6 18"/>,
  alert: <path d="M12 3l10 17H2zM12 9v5M12 17v.1"/>,
  leaf: <path d="M20 3C7 2 2 9 6 15s15 3 14-12ZM5 20l11-11"/>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5"/>,
  clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
  storm: <path d="M7 16a4.5 4.5 0 1 1 1.2-8.8A5.5 5.5 0 0 1 19 9a3.5 3.5 0 0 1-1 7M12.5 12l-2.5 4h3.5L11 20.5"/>,
  refresh: <path d="M20 7a8 8 0 1 0 1 7M20 3v5h-5"/>,
  box: <path d="M3 7l9-4 9 4v11l-9 4-9-4zM3 7l9 4 9-4M12 11v11M8 5l9 4"/>,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></>,
  moon: <path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6Z"/>,
  // Three bars on a baseline: the Explore tab.
  chart: <path d="M4 20h16M7.5 16.5v-4M12 16.5V6.5M16.5 16.5V10"/>,
  // A globe, a meridian and the equator: the World tab.
  globe: <><circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.6" ry="8.5"/><path d="M3.5 12h17"/></>,
  // Two stations joined by a winding line: the Data flow row.
  route: <><circle cx="5.5" cy="18.5" r="2.2"/><circle cx="18.5" cy="5.5" r="2.2"/><path d="M7.7 18.5H15a3.2 3.2 0 0 0 0-6.4H9a3.2 3.2 0 0 1 0-6.4h7.3"/></>,
  pause: <path d="M9 6v12M15 6v12"/>,
  play: <path d="M8 5.5v13l10.5-6.5z"/>,
};
/** 24-unit stroke icons with round caps and joins, drawn in the current text color. Decorative (aria-hidden). */
export function Icon({ name, size = 18, strokeWidth = 1.7, style }: { name: IconName; size?: number; strokeWidth?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{ICONS[name]}</svg>;
}
/** The filled house on hub markers. Sits on a plum disc, in cream (the ink on plum, in both themes). */
export function HubGlyph({ size = 16, fill = "var(--pd-cream)" }: { size?: number; fill?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 14V7L8 2.5 13.5 7v7h-4v-4h-3v4z" style={{ fill }}/></svg>;
}
/** The brand pumpkin, also the bar marker of the daily revenue chart. Leaf, pumpkin-deep and pumpkin-light: it follows the theme. */
const STEM = { fill: "var(--pd-leaf, #6c7a36)" }, SIDE = { fill: "var(--pd-pumpkin-deep, #d9601c)" }, FRONT = { fill: "var(--pd-pumpkin-light, #f08a3c)" };
export function PumpkinGlyph({ width = 26, style }: { width?: number; style?: CSSProperties }) {
  return <svg width={width} height={width * 30 / 32} viewBox="0 0 32 30" aria-hidden="true" style={style}><path d="M15 8c0-3 1.5-5.5 5-6.5l1 2.5c-2 .6-3 2-3 4z" style={STEM}/><ellipse cx="9.5" cy="18.5" rx="7.5" ry="9.5" style={SIDE}/><ellipse cx="22.5" cy="18.5" rx="7.5" ry="9.5" style={SIDE}/><ellipse cx="16" cy="18.5" rx="7" ry="10.5" style={FRONT}/></svg>;
}

/* ── Panels ──────────────────────────────────────────────── */

export type PanelProps = {
  /** A plain noun: "Trip", "Cargo", "Stock". Rendered as the panel's h2. May be a `<Define>` around the noun (then pass `label`). */
  title?: ReactNode;
  /** Right side of the title row: a count, a Legend, a Tag. */
  aside?: ReactNode;
  /** aria-label of the section; defaults to the title. */
  label?: string;
  /** "default" 18/20/20 · "list" ends in rows (6px bottom) · "flush" no side padding, for tables. */
  pad?: "default" | "list" | "flush";
  /** Gap between the panel's children in px (default 14). */
  gap?: number;
  /** A refresh is running: the last content stays, dimmed. */
  busy?: boolean;
  as?: "section" | "article";
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};
/** A bordered, rounded surface on the page background. No fill, no shadow. */
export function Panel({ title, aside, label, pad = "default", gap, busy, as: Tag = "section", id, className, style, children }: PanelProps) {
  return <Tag id={id} aria-label={label ?? (typeof title === "string" ? title : undefined)} aria-busy={busy || undefined} className={cx("pd-panel", pad !== "default" && `is-${pad}`, className)} style={gap == null ? style : { gap, ...style }}>
    {(title || aside) && <div className="pd-panel-head">{title && <h2 className="pd-panel-title">{title}</h2>}{aside && <div className="pd-panel-aside">{aside}</div>}</div>}
    {children}
  </Tag>;
}

export type PanelStateProps = {
  state: "loading" | "empty" | "error";
  /** Empty: what there is none of ("None", "All in band"). Error: what failed. */
  message?: string;
  /** Loading: how many skeleton lines (default 3). */
  rows?: number;
  /** Loading a chart: the harvest loader (the pumpkin in its turning ring) instead of skeleton lines. */
  chart?: boolean;
  /** Reserve the height of the content to come, so nothing jumps when it arrives. */
  minHeight?: number;
  /** Empty: draw the hairline a list row would have. */
  line?: boolean;
  /** Error: shows a Retry button. */
  onRetry?: () => void;
};
/**
 * The harvest loader: the brand pumpkin in a ring whose pumpkin arc turns, over "Loading the harvest…". What a chart
 * shows while its data is on its way. It fades in after a beat (base.css), so a quick load never flashes it.
 */
export function HarvestLoader({ message = "Loading the harvest…", minHeight }: { message?: string; minHeight?: number }) {
  return <div className="pd-harvest" role="status" style={{ minHeight }}>
    <span className="pd-harvest-ring">
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="25" className="pd-harvest-track"/><path d="M28 3a25 25 0 0 1 25 25" className="pd-harvest-arc"/></svg>
      <PumpkinGlyph width={28}/>
    </span>
    <span>{message}</span>
  </div>;
}

/** What a panel shows instead of data: skeleton lines (the harvest loader for a chart), a short "None", or an error with a retry. */
export function PanelState({ state, message, rows = 3, chart, minHeight, line, onRetry }: PanelStateProps) {
  if (state === "loading" && chart) return <HarvestLoader message={message} minHeight={minHeight}/>;
  if (state === "loading") return <div className="pd-state is-loading" role="status" style={{ minHeight }}><span className="pd-sr">{message ?? "Loading"}</span>{Array.from({ length: rows }, (_, i) => <span className="pd-skeleton" key={i}/>)}</div>;
  if (state === "error") return <div className="pd-state is-error" role="alert" style={{ minHeight }}><Icon name="alert" strokeWidth={1.9}/><span>{message ?? "Could not load this"}</span>{onRetry && <button type="button" className="pd-retry" onClick={onRetry}>Retry</button>}</div>;
  return <div className={cx("pd-state is-empty", line && "has-line")} role="status" style={{ minHeight }}>{message ?? "None"}</div>;
}

/* ── Chips and tags ──────────────────────────────────────── */

type ChipSize = "sm" | "md" | "lg";
export type StatusChipProps = {
  status: ChipStatus;
  /** Late and severe: minutes behind plan, printed as "Late · 1 h 25 m". */
  minutes?: number | null;
  /** Replaces the default words ("On schedule", "Late · …", "Delivered"), e.g. "On time", "All on time". */
  label?: string;
  /** sm in dense tables · md default · lg next to a page title. */
  size?: ChipSize;
};
/** Delivery status: olive wash with a dot, peach with a diamond, terracotta with a white diamond, or a hairline. */
export function StatusChip({ status, minutes, label, size = "md" }: StatusChipProps) {
  const late = status === "late" || status === "severe";
  const text = label ?? (late ? (minutes != null ? lateLabel(minutes) : "Late") : status === "delivered" ? "Delivered" : "On schedule");
  return <span className={cx("pd-chip", `is-${status}`, size !== "md" && `is-${size}`)}>{status === "delivered" ? <Icon name="check" size={12} strokeWidth={2.6}/> : <i/>}{text}</span>;
}

export type TagTone = "out" | "severe" | "low" | "warn" | "ok" | "neutral" | "stone";
/**
 * A short label on a fill. out / severe: terracotta with white text (out of stock, overdue) · low: amber ·
 * warn: peach · ok: olive wash · neutral: stone (in workshop) · stone: quiet fact chip (hub stock).
 */
export function Tag({ tone = "neutral", size = "md", children }: { tone?: TagTone; size?: ChipSize; children: ReactNode }) {
  return <span className={cx("pd-tag", `is-${tone}`, size !== "md" && `is-${size}`)}>{children}</span>;
}

type DeltaProps = {
  /** A ratio: -0.014 prints "−1.4%". null prints a dash on a neutral fill. */
  value: number | null | undefined;
  /** What it is against: "vs plan". */
  label?: string;
  digits?: number;
  /** For measures where a fall is good (lost sales, shrink). */
  goodWhen?: "up" | "down";
  /** Replaces the formatted value, e.g. signedPts(...). `value` still picks the color. */
  text?: string;
};
const deltaTone = (value: number | null | undefined, goodWhen: "up" | "down") =>
  value == null || !Number.isFinite(value) ? "is-flat" : (value >= 0) === (goodWhen === "up") ? "is-good" : "is-bad";
/** Change as a pill: olive when good, peach when bad. */
export function DeltaChip({ value, label, digits = 1, goodWhen = "up", text }: DeltaProps) {
  return <span className={cx("pd-delta", deltaTone(value, goodWhen))}>{text ?? signedPct(value, digits)}{label && <span>{label}</span>}</span>;
}
/** Change as colored text, for table cells and readouts: "−5.0% vs plan". */
export function DeltaText({ value, label, digits = 1, goodWhen = "up", text }: DeltaProps) {
  return <span className={cx("pd-delta-text", deltaTone(value, goodWhen))}>{text ?? signedPct(value, digits)}{label && ` ${label}`}</span>;
}

/* ── Controls ────────────────────────────────────────────── */

/** `short` (Segmented only): the label shown on phones, under 600px; `label` stays the accessible name. */
export type Option<T extends string> = { value: T; label: string; short?: string };
type ChoiceProps<T extends string> = {
  /** aria-label of the group: "Region", "Period", "Sort". */
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};
/**
 * Segmented control: a soft track with a raised white option. The top bar's region control (RegionPicker)
 * draws the same look, with a country menu on its selected option.
 * An option with a `short` label prints it on phones (CSS swaps the two) and keeps the full label as its name.
 */
/** A segmented control: the picked option is a raised lens that slides to the next pick (lens.tsx). `glass`: in a glass capsule (FloatBar.tsx). */
export function Segmented<T extends string>({ label, options, value, onChange, glass }: ChoiceProps<T> & { glass?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { lens, className, style } = useSegmentLens(ref, options.findIndex(o => o.value === value), glass);
  return <div ref={ref} role="group" aria-label={label} className={`pd-segmented${className}`} style={style}>
    {lens}
    {options.map(o => <button type="button" key={o.value} aria-pressed={o.value === value} aria-label={o.short ? o.label : undefined} onClick={() => onChange(o.value)}>
      <span>{o.short ? <><span className="pd-segmented-full">{o.label}</span><span className="pd-segmented-short">{o.short}</span></> : o.label}</span>
    </button>)}
  </div>;
}
/** Underline tabs for view and sort switches. `trailing` sits at the right end of the line (a Legend). */
export function UnderlineTabs<T extends string>({ label, options, value, onChange, trailing }: ChoiceProps<T> & { trailing?: ReactNode }) {
  return <div className="pd-tabs">
    <div role="group" aria-label={label} className="pd-tabs-list">
      {options.map(o => <button type="button" key={o.value} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>)}
    </div>
    {trailing && <div className="pd-tabs-trailing">{trailing}</div>}
  </div>;
}
/** A pill toggle (aria-pressed). Pressed is blush. `mark` adds the small orange diamond ("Late only"). */
export function Pill({ pressed, onClick, mark, children, "aria-label": ariaLabel }: { pressed: boolean; onClick: () => void; mark?: boolean; children: ReactNode; "aria-label"?: string }) {
  return <button type="button" className="pd-pill" aria-pressed={pressed} aria-label={ariaLabel} onClick={onClick}><span>{mark && <i className="pd-pill-mark"/>}{children}</span></button>;
}
/** An active filter shown as a blush pill with a cross; clicking it clears the filter. */
export function ClearChip({ onClear, clearLabel, children }: { onClear: () => void; clearLabel: string; children: ReactNode }) {
  return <button type="button" className="pd-pill is-clear" aria-label={clearLabel} onClick={onClear}><span>{children}<Icon name="close" size={14} strokeWidth={2}/></span></button>;
}

export type RowLinkProps = {
  to: string;
  /** Sits between the body and the chevron: a Tag, a StatusChip, a value. */
  trailing?: ReactNode;
  /** Vertical padding in px: 0 for one-line rows (46px tall), 10 for two-line rows. */
  pad?: number;
  /** Top divider: "hairline" (default), "row" (lighter, inside tables) or "none". */
  line?: "hairline" | "row" | "none";
  "aria-label"?: string;
  className?: string;
  children: ReactNode;
};
/** A row that navigates: the whole row is one link and ends in a right chevron. Never nest a link or button inside. */
export function RowLink({ to, trailing, pad = 0, line = "hairline", className, children, "aria-label": ariaLabel }: RowLinkProps) {
  return <Link to={to} aria-label={ariaLabel} className={cx("pd-rowlink", trailing != null && "has-trailing", line === "row" && "is-row-line", line === "none" && "is-no-line", className)} style={pad ? { "--pd-row-pad": `${pad}px` } as CSSProperties : undefined}>
    <span className="pd-rowlink-body">{children}</span>{trailing}<Icon name="chevronRight" size={16} strokeWidth={2}/>
  </Link>;
}

/**
 * The title row of a drill-down page, directly under the banner: a round back button, the h1, an optional
 * status chip, and one meta line. `meta` as an array is joined with " · " (empty entries are dropped).
 */
export function BackTitle({ to, backLabel, title, chip, meta }: { to: string; backLabel: string; title: string; chip?: ReactNode; meta?: ReactNode | (string | null | undefined | false)[] }) {
  const metaLine = Array.isArray(meta) ? meta.filter(Boolean).join(" · ") : meta;
  return <div className="pd-backtitle">
    <div className="pd-backtitle-row">
      <Link to={to} aria-label={`Back to ${backLabel}`} className="pd-back"><span><Icon name="chevronLeft" size={16} strokeWidth={2}/></span></Link>
      <h1>{title}</h1>
      {chip}
    </div>
    {metaLine && <div className="pd-backtitle-meta">{metaLine}</div>}
  </div>;
}

/* ── Numbers ─────────────────────────────────────────────── */

export type StatProps = {
  /** A plain noun, or a `<Define>` around it. */
  label: ReactNode;
  /** The numeral, already formatted. */
  value: ReactNode;
  /** One short line under the numeral. */
  note?: ReactNode;
  /** alert draws the numeral in terracotta. */
  tone?: "default" | "alert";
  /** Numeral size in px: 21, 23 (default), 25 or 28. */
  size?: number;
  /** true: a bordered tile (default) · "inset": the smaller tile inside a panel · false: no frame. */
  card?: boolean | "inset";
  /** With onClick the tile is a toggle button; pressed is blush. */
  pressed?: boolean;
  onClick?: () => void;
  className?: string;
  /** Extra content under the note (a Meter, a row of chips). */
  children?: ReactNode;
};
/** A labelled numeral (Hanken 600, lining figures) with one line of context. */
export function Stat({ label, value, note, tone = "default", size, card = true, pressed, onClick, className, children }: StatProps) {
  const cls = cx("pd-stat", card === true && "is-card", card === "inset" && "is-inset", tone === "alert" && "is-alert", className);
  const body = <>
    <span className="pd-stat-label">{label}</span>
    <span className="pd-stat-value" style={size ? { fontSize: size } : undefined}>{value}</span>
    {note != null && <span className="pd-stat-note">{note}</span>}
  </>;
  if (onClick) return <button type="button" className={cls} aria-pressed={!!pressed} onClick={onClick}>{body}{children}</button>;
  return <article className={cls}>{body}{children}</article>;
}

export type MeterProps = {
  /** One fill: its share of the track, 0 to 1. */
  value?: number | null;
  /** Fill color (default plum). */
  color?: string;
  /** Or stacked parts, each a share of the track. */
  segments?: { value: number; color: string }[];
  /** Gap between stacked parts in px. With a gap the track itself is not drawn. */
  gap?: number;
  /** A marker across the track at this share: the plan, the service interval. */
  tick?: number | null;
  tickColor?: string;
  /** Track height in px: 6, 8 (default) or 10. */
  height?: number;
  /** Read out as an image with this label; without it the meter is decorative. */
  "aria-label"?: string;
  className?: string;
};
const clampShare = (v: number | null | undefined) => `${Math.max(0, Math.min(1, v ?? 0)) * 100}%`;
/** A thin horizontal bar: progress against a total, or a stacked split. */
export function Meter({ value, color, segments, gap = 0, tick, tickColor, height = 8, className, "aria-label": ariaLabel }: MeterProps) {
  const parts = segments ?? [{ value: value ?? 0, color: color ?? "" }];
  return <span className={cx("pd-meter", !segments && "is-single", className)} style={{ height }} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true}>
    <span className="pd-meter-track" style={gap ? { gap, background: "transparent" } : undefined}>
      {parts.map((p, i) => <span key={i} style={{ ...(gap ? { flex: `${Math.max(0, p.value)} 1 0%` } : { width: clampShare(p.value) }), background: p.color || undefined }}/>)}
    </span>
    {tick != null && <span className="pd-meter-tick" style={{ left: clampShare(tick), background: tickColor }}/>}
  </span>;
}

export type LegendItem = {
  label: string;
  color: string;
  /** square (default, 10px) · dot (11px round) · line (plan) · ring (last season) · box (12px with a border). */
  shape?: "square" | "dot" | "line" | "ring" | "box";
  /** Border color of a box. */
  border?: string;
  /** A custom swatch instead of the shape. */
  swatch?: ReactNode;
};
/** Swatch + one or two words. Only where a visual cannot be read without it. */
export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return <div className={cx("pd-legend", className)}>
    {items.map(item => <span key={item.label}>{item.swatch ?? <Swatch color={item.color} shape={item.shape} border={item.border}/>}{item.label}</span>)}
  </div>;
}
/** The colored mark of a legend or key row. */
export function Swatch({ color, shape = "square", border }: { color: string; shape?: LegendItem["shape"]; border?: string }) {
  const style: CSSProperties = shape === "ring" ? { boxShadow: `inset 0 0 0 2.5px ${color}` } : shape === "box" ? { background: color, borderColor: border ?? color } : { background: color };
  return <i className={cx("pd-swatch", shape !== "square" && `is-${shape}`)} style={style} aria-hidden="true"/>;
}

/* ── Insets and lists ────────────────────────────────────── */

/** A tinted inset with an icon: a late cause, an open fault (problem), a cleared fault (ok). */
export function Notice({ tone = "problem", icon, children }: { tone?: "problem" | "ok" | "neutral"; icon?: IconName; children: ReactNode }) {
  return <div className={cx("pd-notice", tone !== "neutral" && `is-${tone}`)}>
    <Icon name={icon ?? (tone === "ok" ? "check" : "alert")} strokeWidth={tone === "ok" ? 2.2 : 1.9}/>
    <div>{children}</div>
  </div>;
}
/** Label and value rows separated by hairlines (a <dl>): odometer, last service, store details. */
export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
  return <dl className="pd-facts">{items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
}

/* ── Chart frame ─────────────────────────────────────────── */

export type ChartTick = { /** Position from the bottom, 0 to 1. */ at: number; label: string };
/**
 * Touch scrubbing for a row of equal chart columns: on a touch screen a finger slides along the columns and the
 * one under it is picked as it moves (columns on a phone are narrower than a fingertip). Call it from the pointer
 * events of the element that holds the columns (useChartTip does, once the finger slides sideways), with
 * `touch-action: pan-y` so a vertical swipe still scrolls the page. A mouse is ignored. Measures only in the event.
 */
export function chartScrub(count: number, pick: (index: number) => void) {
  return (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" || e.buttons === 0 || count === 0) return;
    const box = e.currentTarget.getBoundingClientRect();
    pick(Math.max(0, Math.min(count - 1, Math.floor((e.clientX - box.left) / box.width * count))));
  };
}

/**
 * The frame every bar chart shares: y labels on the left, dashed gridlines, a plum baseline and a row of
 * x labels. `children` are positioned inside the plot (position:absolute; it is `height` px tall);
 * `backdrop` is drawn under the gridlines (a highlighted band); `xAxis` is the label row under the plot.
 */
export function ChartFrame({ height, ticks, axisWidth = 30, backdrop, xAxis, children }: { height: number; ticks: ChartTick[]; axisWidth?: number; backdrop?: ReactNode; xAxis?: ReactNode; children: ReactNode }) {
  return <div className="pd-chart">
    <div className="pd-chart-axis" style={{ height, minWidth: axisWidth }} aria-hidden="true">
      {ticks.map(t => <span key={t.label} style={{ bottom: `${t.at * 100}%` }}>{t.label}</span>)}
    </div>
    <div className="pd-chart-plot" style={{ height }}>
      {backdrop}
      {ticks.map(t => <span key={t.label} className="pd-chart-grid" style={{ bottom: `${t.at * 100}%` }}/>)}
      {children}
      <span className="pd-chart-base"/>
    </div>
    {xAxis && <div className="pd-chart-x" aria-hidden="true">{xAxis}</div>}
  </div>;
}
