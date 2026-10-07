/*
 * The City and Store period charts' shared pieces. ChartTip: the small card that names one chart column and its
 * figures ("10:00–11:00 · Sold 26 · Lost 0 · Revenue $164") above the column under the mouse, the keyboard focus
 * or the finger; `useChartTip`, which tracks which column that is; `columnLabel`, a column's name; and
 * `periodAxis`, the labels under the columns. Usage:
 *
 *   const tip = useChartTip(columns.length, home);   // home: the column Tab lands on (the running one, else the last reached)
 *   <ChartFrame xAxis={periodAxis(columns)} …>       // its plot is positioned: the card is placed inside it
 *     <div className="…-bars" {...tip.track}>        // hover, touch tap and scrub (chartScrub), arrow keys, Escape
 *       {columns.map((c, i) => <button key={c.key} {...tip.column(i)} …/>)}   // one Tab stop, focus shows the card
 *     </div>
 *     {tip.index != null && <ChartTip id={tip.id} at={(tip.index + 0.5) / n} span={1 / n} top={share of the bar}
 *       heading={columnLabel(columns[tip.index])} rows={[{ label: "Sold", value: int(c.soldUnits), color: palette.olive }, …]}/>}
 *   </ChartFrame>
 *
 * Placement: centred over the column just above its bar, slid sideways to stay inside the plot. When a tall bar
 * leaves no room above it inside the plot, the card steps beside the column (right, else left); when neither side
 * has room either (a phone), it sits at the top of the plot, over the bar's top (it ignores the pointer). The
 * card never leaves the element it is placed in. The first paint (and the static preview) places it with CSS
 * alone; in the browser a layout effect measures the card and the plot and corrects it before it is seen.
 * Styles: chart-tip.css.
 */
import { type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import "./chart-tip.css";
import { dayLabel, localDate } from "../format";
import type { PeriodColumn } from "../types";
import { chartScrub, type LegendItem, Swatch } from "./ui";

/** A layout effect in the browser; on the server (the static preview) nothing runs, without React's warning. */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;
/** Space between the card and the bar or column it points at (px). */
const GAP = 10;
/** How far a finger slides sideways before it scrubs (px); an up or down slide is the page scrolling. */
const SLOP = 6;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pad2 = (n: number) => String(n).padStart(2, "0");
const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export type ChartTipRow = {
  /** "Sold", "Lost", "Revenue". */
  label: string;
  /** The figure, already formatted. */
  value: ReactNode;
  /** The legend swatch before the label (the series colour, e.g. palette.olive). None for a row without a series. */
  color?: string;
  shape?: LegendItem["shape"];
};

export type ChartTipProps = {
  /** The card's id (useChartTip's `id`): the focused column points at it with aria-describedby. */
  id?: string;
  /** The column's name: columnLabel() gives "10:00–11:00", "11:00 · now", "Fri 2 Oct", "Today". */
  heading: ReactNode;
  rows: ChartTipRow[];
  /** The column's centre across the plot, 0..1: (index + 0.5) / count. */
  at: number;
  /** The top of the column's bar, as a share of the plot's height (0 = the floor, 1 = the top). */
  top: number;
  /** One column's width as a share of the plot (1 / count): how far the card steps aside when it sits beside the bar. */
  span?: number;
};

/** The tooltip card. Render it inside the chart's positioned plot; it ignores the pointer, so the columns under it keep their hover. */
export function ChartTip({ id, heading, rows, at, top, span = 0 }: ChartTipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ x: number; y: number } | null>(null);

  // Measure after every render (cheap; the state only changes when the place does).
  useBrowserLayoutEffect(() => {
    const card = ref.current, plot = card?.offsetParent;
    if (!card || !(plot instanceof HTMLElement)) return;
    const W = plot.clientWidth, H = plot.clientHeight, w = card.offsetWidth, h = card.offsetHeight;
    const centre = at * W, barTop = top * H, side = span * W / 2 + GAP;
    let x = clamp(centre - w / 2, 0, Math.max(0, W - w)), y = barTop + GAP;
    if (y + h > H) {
      const right = centre + side, left = centre - side - w;
      if (right + w <= W || left >= 0) {
        x = right + w <= W ? right : left;
        y = clamp(barTop - h / 2, 0, Math.max(0, H - h));
      } else y = Math.max(0, H - h);
    }
    const next = { x: Math.round(x), y: Math.round(y) };
    setPlace(prev => prev && prev.x === next.x && prev.y === next.y ? prev : next);
  });

  const style = {
    "--pd-tip-at": `${(clamp(at, 0, 1) * 100).toFixed(2)}%`,
    "--pd-tip-top": `${(clamp(top, 0, 1) * 100).toFixed(2)}%`,
    ...(place && { left: place.x, bottom: place.y }),
  } as CSSProperties;
  return <div ref={ref} id={id} role="tooltip" className="pd-tip" style={style}>
    <strong className="pd-tip-head">{heading}</strong>
    {rows.map(row => <div key={row.label} className="pd-tip-row">
      <span className="pd-tip-label">{row.color && <Swatch color={row.color} shape={row.shape}/>}{row.label}</span>
      <span className="pd-tip-value">{row.value}</span>
    </div>)}
  </div>;
}

/** A chart column's name: an hour "10:00–11:00", the running hour "11:00 · now", a day "Fri 2 Oct", today's bar "Today" (running or closed). */
export function columnLabel(column: Pick<PeriodColumn, "hour" | "date" | "isCurrent" | "isToday">): string {
  if (column.hour != null) return column.isCurrent ? `${pad2(column.hour)}:00 · now` : `${pad2(column.hour)}:00–${pad2(column.hour + 1)}:00`;
  return column.isToday || column.isCurrent ? "Today" : column.date ? dayLabel(localDate(column.date)) : "—";
}

/**
 * The labels under a period chart's columns (ChartFrame's `xAxis`). An hour prints "09:00", the running one
 * "14:00 · now"; a day "Thu 22" (its name over its date on a phone), the last day "Today"; 30 days label one
 * day a week, counted back from today ("7 Sep"). Narrower charts keep every second hour, phones every third in
 * the short form ("09", "now"): chart-tip.css, against the chart panel's `pd-period-chart` container.
 */
export function periodAxis(columns: PeriodColumn[]): ReactNode[] {
  const count = columns.length, dense = count > 14;
  const now = columns.findIndex(c => c.hour != null && c.isCurrent);
  return columns.map((c, i) => {
    if (c.hour != null) {
      const hh = `${pad2(c.hour)}:00`;
      return <span key={c.key} className={cx("pd-period-x is-hour", i % 2 === 0 && "is-m2", i % 3 === 0 && "is-m3", c.isCurrent && "is-now", now >= 0 && Math.abs(i - now) === 1 && "is-by-now")}>
        <span className="pd-period-x-full">{c.isCurrent ? `${hh} · now` : hh}</span>
        <span className="pd-period-x-short">{c.isCurrent ? "now" : hh.slice(0, 2)}</span>
      </span>;
    }
    const fromEnd = count - 1 - i;
    const [weekday, day, month] = dayLabel(localDate(c.date)).split(" ");
    const label = fromEnd === 0 ? "Today"
      : dense ? (fromEnd % 7 === 0 ? `${day} ${month}` : null)
      : <span className="pd-period-x-day"><span>{weekday}</span> <span>{day}</span></span>;
    return <span key={c.key} className={cx("pd-period-x is-day", fromEnd === 0 && "is-today", dense && "is-dense", dense && fromEnd === 7 && "is-by-today")}>{label}</span>;
  });
}

/** Whether a focused element shows its focus ring: keyboard focus, not a click. */
const focusVisible = (el: Element) => {
  try { return el.matches(":focus-visible"); } catch { return true; }
};

type Active = { index: number; via: "mouse" | "focus" | "touch" } | null;
/** A finger on the chart: where it landed, whether it is scrubbing, and the card before it landed. */
type Gesture = { id: number; x: number; y: number; scrub: boolean; before: Active };

export type ChartTipState = {
  /** The column whose card shows, or null. */
  index: number | null;
  /** The card's id, for <ChartTip id>. */
  id: string;
  /** Spread on the element that holds the columns (equal widths, side by side): hover, touch, arrow keys and Escape. Give it `touch-action: pan-y`. */
  track: {
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
    onPointerLeave: (e: PointerEvent<HTMLElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  };
  /**
   * Spread on column i's button: keyboard focus shows its card; one column is the chart's Tab stop (the arrow
   * keys move along). With `describe` the focused column names the card (aria-describedby); leave it off when
   * the button's own label already says everything the card does.
   */
  column: (index: number, describe?: boolean) => {
    onFocus: (e: FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
    tabIndex: number;
    "data-pd-col": number;
    "aria-describedby"?: string;
  };
};

/**
 * Which column of a chart shows its card. A mouse shows it while over a column (the gaps between columns
 * included). Keyboard focus on a column shows it (a click's focus does not); the chart is one Tab stop, `home`
 * at first, then the column last focused, and Left, Right, Home and End move along the columns. A finger shows
 * it with a tap (a second tap on the same column hides it) or a sideways slide along the columns (chartScrub);
 * it stays after the finger lifts, and a slide up or down, the page scrolling, leaves the card as it was. Escape
 * hides it until the pointer or the focus moves on. Listens on the chart's own elements only.
 */
export function useChartTip(count: number, home = count - 1): ChartTipState {
  const id = useId();
  const [active, setActive] = useState<Active>(null);
  const [stop, setStop] = useState<number | null>(null);
  const gesture = useRef<Gesture | null>(null);
  // The column Escape closed: the mouse does not reopen it until it reaches another column.
  const dismissed = useRef<number | null>(null);
  const show = (index: number, via: NonNullable<Active>["via"]) => setActive(a => a && a.index === index && a.via === via ? a : { index, via });
  const scrub = chartScrub(count, index => show(index, "touch"));
  const indexAt = (e: PointerEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return clamp(Math.floor((e.clientX - box.left) / box.width * count), 0, count - 1);
  };
  const tabStop = stop != null && stop < count ? stop : home;
  return {
    index: active && active.index < count ? active.index : null,
    id,
    track: {
      onPointerMove: e => {
        if (count === 0) return;
        if (e.pointerType === "mouse") {
          const index = indexAt(e);
          if (index === dismissed.current) return;
          dismissed.current = null;
          show(index, "mouse");
          return;
        }
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        if (!g.scrub) {
          const dx = Math.abs(e.clientX - g.x), dy = Math.abs(e.clientY - g.y);
          if (dx < SLOP || dx <= dy) return;
          g.scrub = true;
        }
        scrub(e);
      },
      // Nothing shows as the finger lands: it may be the start of a scroll.
      onPointerDown: e => {
        if (e.pointerType === "mouse" || count === 0) return;
        gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, scrub: false, before: active };
      },
      onPointerUp: e => {
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        gesture.current = null;
        if (g.scrub) return;
        const index = indexAt(e);
        setActive(a => a?.via === "touch" && a.index === index ? null : { index, via: "touch" });
      },
      // The browser took the gesture over (a scroll): the card goes back to what it was before the finger landed.
      onPointerCancel: e => {
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        gesture.current = null;
        setActive(g.before);
      },
      onPointerLeave: e => {
        if (e.pointerType !== "mouse") return;
        dismissed.current = null;
        setActive(a => a?.via === "mouse" ? null : a);
      },
      onKeyDown: e => {
        if (e.key === "Escape") {
          if (!active) return;
          e.stopPropagation();
          dismissed.current = active.index;
          setActive(null);
          return;
        }
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return;
        const cols = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-pd-col]"));
        const at = cols.findIndex(c => c === e.target);
        if (at < 0) return;
        e.preventDefault();
        const next = e.key === "Home" ? 0 : e.key === "End" ? cols.length - 1 : clamp(at + (e.key === "ArrowLeft" ? -1 : 1), 0, cols.length - 1);
        cols[next].focus();
        show(Number(cols[next].dataset.pdCol), "focus");
      },
    },
    column: (index, describe = true) => ({
      onFocus: e => {
        setStop(index);
        dismissed.current = null;
        if (focusVisible(e.currentTarget)) show(index, "focus");
      },
      onBlur: () => setActive(a => a?.via === "focus" && a.index === index ? null : a),
      tabIndex: index === tabStop ? 0 : -1,
      "data-pd-col": index,
      "aria-describedby": describe && active?.index === index ? id : undefined,
    }),
  };
}
