/*
 * The band of figures under a drill page's title (City, Store), without boxes: the period's Sold and Lost on the
 * left, which follow the top bar's time switch, a hairline, then right now on the right, which never follows it.
 * Each page builds its two right-now figures from NowFigure ("Runs out first" is the shared RunsOutFigure; the
 * second is the page's vans) and the band places them. Also here: the rule for a shelf that runs out before its
 * next van, and the time words both pages print for vans (the place's clock, then the viewer's).
 * Styles: drill-band.css.
 */
import { Fragment, type ReactNode } from "react";
import "./drill-band.css";
import { StockPumpkin } from "./Pumpkin";
import { Icon } from "./ui";
import { bothTimes, dayLabel, int, money, num, plural, time } from "../format";
import { Link } from "../nav";
import { DRILL_PERIOD, type DrillPeriod, type PeriodFigures, type StockStatus } from "../types";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** A non-breaking space: holds a line open while its value loads. */
export const BLANK = " ";

/* ── Cover ───────────────────────────────────────────────── */

/** Without a restock time, a shelf counts as short under this many open hours of cover. */
export const LOW_COVER_HOURS = 8;

/** What the cover rule reads of a shelf: units on it and open hours of cover (null when unknown). */
export type CoverShelf = { onHand: number; coverHours: number | null };

/** A shelf's cover in open hours: zero when it is empty, null when unknown. */
export const coverOf = (shelf: CoverShelf) => shelf.onHand <= 0 ? 0 : shelf.coverHours;

/**
 * A shelf that runs out before the next van can restock it (the contract's "low"); an empty one counts.
 * `restockHours` is store_now.open_hours_to_next_delivery; left out, short means under LOW_COVER_HOURS.
 */
export function runsShort(shelf: CoverShelf, restockHours: number | null | undefined) {
  const hours = coverOf(shelf);
  return hours != null && (hours <= 0 || hours < (restockHours ?? LOW_COVER_HOURS));
}

/** The shelf with the least cover (unknown cover is skipped), its hours, and how many others are empty too. */
export function leastCover<T extends CoverShelf>(shelves: T[]): { shelf: T; hours: number; moreOut: number } | null {
  let best: { shelf: T; hours: number } | null = null, empty = 0;
  for (const shelf of shelves) {
    const hours = coverOf(shelf);
    if (hours == null) continue;
    if (hours <= 0) empty++;
    if (!best || hours < best.hours) best = { shelf, hours };
  }
  return best && { ...best, moreOut: best.hours <= 0 ? empty - 1 : 0 };
}

/** Cover in the band's sentence: "in about 2 open hours", "in about 1.4 days". */
const coverWords = (hours: number, openHours: number) =>
  hours < 1 ? "in under an open hour" : hours < openHours ? `in about ${plural(Math.round(hours), "open hour")}` : `in about ${num(hours / openHours, 1)} days`;

/* ── Time words ──────────────────────────────────────────── */

/** Where a page reads times: the place's zone, the shell clock, the viewer's zone, and its trading day in open hours. */
export type Place = { tz: string; now?: string; yours: string; openHours: number };

/** "Today", "Yesterday", "Tomorrow" or "Fri 30 Oct": the local day of a time, seen from now. */
function dayWord(at: string, now: string | undefined, tz: string) {
  const day = dayLabel(at, tz);
  if (!now) return day;
  const t = new Date(now).getTime();
  if (day === dayLabel(now, tz)) return "Today";
  if (day === dayLabel(t + 864e5, tz)) return "Tomorrow";
  return day === dayLabel(t - 864e5, tz) ? "Yesterday" : day;
}
/** A time later today as "15:40"; on another day with its day in front: "Tomorrow 07:10". `today` stands before today's. */
export function whenLabel(at: string, now: string | undefined, tz: string, today = "") {
  const day = dayWord(at, now, tz);
  return `${day === "Today" ? today : day} ${time(at, tz)}`.trim();
}
/** The same inside a sentence: "tomorrow 07:10". */
export const whenWords = (at: string, now: string | undefined, tz: string) => whenLabel(at, now, tz).replace(/^(Tomorrow|Yesterday)/, w => w.toLowerCase());
/** A van time on the place's clock and the viewer's: "14:15 (15:15 CEST)", "tomorrow 09:20 (10:20 CEST)". */
export function vanTime(at: string, { tz, now, yours }: Place) {
  const day = dayWord(at, now, tz);
  const before = day === "Today" ? "" : `${day === "Tomorrow" || day === "Yesterday" ? day.toLowerCase() : day} `;
  return `${before}${bothTimes(at, tz, yours)}`;
}

/* ── The band ────────────────────────────────────────────── */

export type DrillBandProps = {
  /** The top bar's time switch: names the left part. */
  period: DrillPeriod;
  /** The period's figures; undefined while they load (skeletons). */
  totals?: PeriodFigures;
  /** The figures failed: this short message stands in their place. */
  figuresError?: string;
  busy?: boolean;
  /** Right now's two figures, each a NowFigure: area "run" (what runs out first), then area "van". */
  children: ReactNode;
};

/**
 * The figures under the title: the period's Sold and Lost (they follow the time switch), a hairline, and right
 * now. One row on a wide column; the two parts stack under 900px, and on phones right now's two figures stack too
 * (drill-band.css).
 */
export function DrillBand({ period, totals, figuresError, busy, children }: DrillBandProps) {
  const lost = totals?.lostUnits ?? 0;
  return <section className={cx("pd-drill", busy && "pd-busy")} aria-label="Summary">
    <div className="pd-drill-band">
      <h2 className="pd-drill-head is-period">{DRILL_PERIOD[period].title}</h2>
      {figuresError
        ? <p className="pd-drill-error" role="alert"><Icon name="alert" size={16} strokeWidth={1.9}/>{figuresError}</p>
        : <>
          <Figure area="sold" label="Sold" value={totals && int(totals.soldUnits)} note={totals ? `pumpkins · ${money(totals.revenueUsd)}` : BLANK}/>
          <Figure area="lost" label="Lost" value={totals && int(totals.lostUnits)} note={totals ? `pumpkins · ${money(totals.lostUsd)} lost` : BLANK} alert={lost > 0}/>
        </>}
      <span className="pd-drill-rule" aria-hidden="true"/>
      <h2 className="pd-drill-head is-now">Right now</h2>
      {children}
    </div>
  </section>;
}

/** A period figure: a small label, a big numeral (Hanken 600, lining figures; a skeleton while it loads) and one line under it. */
function Figure({ area, label, value, note, alert }: { area: string; label: string; value?: string; note: string; alert?: boolean }) {
  return <div className={`pd-drill-fig is-${area}`}>
    <span className="pd-drill-fig-label">{label}</span>
    {value != null ? <span className="pd-num pd-drill-fig-num">{value}</span> : <span className="pd-skeleton pd-drill-fig-skel is-num"/>}
    <span className={cx("pd-drill-fig-note", alert && "is-alert")}>{note}</span>
  </div>;
}

/**
 * A right-now figure: a small label, a line with its mark, one line under it (`main` null: a skeleton while it
 * loads). A link when it names a place to open.
 */
export function NowFigure({ area, to, label, mark, main, note }: { area: "run" | "van"; to?: string; label: string; mark: ReactNode; main: ReactNode | null; note: ReactNode }) {
  const body = <>
    <span className="pd-drill-fig-label">{label}</span>
    {main != null
      ? <span className="pd-drill-fig-main">{mark}<span className="pd-drill-fig-what">{main}</span></span>
      : <span className="pd-skeleton pd-drill-fig-skel"/>}
    <span className="pd-drill-fig-note">{note}</span>
  </>;
  return to ? <Link to={to} className={`pd-drill-fig is-${area}`}>{body}</Link> : <div className={`pd-drill-fig is-${area}`}>{body}</div>;
}

/** The van mark of the second right-now figure. */
export const VanMark = () => <span className="pd-drill-fig-icon"><Icon name="truck" size={22} strokeWidth={1.9}/></span>;

/** A piece of a figure's line that wraps as a whole (a time, a delay); `alert` prints it in terracotta. */
export const Bit = ({ alert, children }: { alert?: boolean; children: ReactNode }) =>
  <span className={cx("pd-drill-fig-bit", alert && "is-alert")}>{children}</span>;

/** A figure's line from its pieces, dot-separated; the dot stays on the line above when a piece wraps. Falsy pieces drop out. */
export const dotted = (parts: ReactNode[]) =>
  parts.filter(Boolean).map((part, i) => <Fragment key={i}>{i > 0 && " · "}{part}</Fragment>);

/** The shelf that runs out first, as RunsOutFigure prints it. */
export type RunsOut = {
  /** "Carving at Astoria" on the City page, "Carving" on the store's own. */
  what: string;
  /** The mark: the store's stock status on the City page, the variety's own on the Store page. */
  status: StockStatus;
  /** Open hours of cover; 0 when the shelf is empty. */
  hours: number;
  /** It runs out before its next van (runsShort): the line turns terracotta. */
  short: boolean;
  /** An empty shelf: when it ran out, if known. */
  since?: string | null;
  /** Its next van: when it comes, or came while it unloads. */
  van?: { at: string; arrived: boolean } | null;
  /** Other shelves empty besides this one. */
  moreOut?: number;
  /** The page it opens, if any. */
  to?: string;
};

/**
 * "Runs out first": the shelf with the least cover, and when it runs dry next to when its next van comes (both
 * clocks): terracotta when it runs out first (the store's "low", also said to screen readers), muted when the van
 * comes in time. A shelf already empty leads instead, as "Out of stock" with when it ran out. `first` null:
 * "Nothing short" once `ready`, a skeleton before, the error when the stock failed.
 */
export function RunsOutFigure({ first, ready, error, place }: { first: RunsOut | null; ready: boolean; error?: string; place: Place }) {
  const mark = <StockPumpkin status={first?.status ?? "ok"}/>;
  if (!first) return <NowFigure area="run" label="Runs out first" mark={mark}
    main={ready ? "Nothing short" : error ? "—" : null} note={error ?? (ready ? "no cover figures" : BLANK)}/>;

  const { what, hours, short, since, van, moreOut = 0, to } = first;
  const empty = hours <= 0;
  // The van's time on both clocks, wrapping as a whole; a van unloading there has already come.
  const parts: ReactNode[] = [
    empty ? (since ? `since ${whenWords(since, place.now, place.tz)}` : "now") : coverWords(hours, place.openHours),
    van && <Bit>{van.arrived ? "van arrived" : "next van"} {vanTime(van.at, place)}</Bit>,
    moreOut > 0 && `+${moreOut} more out`,
  ];
  return <NowFigure area="run" to={to} label={empty ? "Out of stock" : "Runs out first"} mark={mark} main={what}
    note={<span className={short ? "is-alert" : undefined}>
      {dotted(parts)}
      {short && !empty && <span className="pd-sr">, runs out before the next van</span>}
    </span>}/>;
}
