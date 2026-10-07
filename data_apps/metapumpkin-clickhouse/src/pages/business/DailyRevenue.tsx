import type { PointerEvent, ReactNode } from "react";
import "./business.css";
import { Define } from "../../components/Define";
import { ChartFrame, DeltaText, Icon, type IconName, Legend, type LegendItem, Panel, PanelState, PumpkinGlyph, RowLink } from "../../components/ui";
import { change, dayLabel, dollars, localDate, money, monthDay, niceScale, num, plural } from "../../format";
import { routes } from "../../routes";
import { palette } from "../../theme";
import type { BusinessDay, BusinessEvent, BusinessEventKind } from "./model";

/*
 * Daily revenue: the last 28 days as the vine chart, with the day's storms, van breakdowns and hub shortages
 * marked above its column. Pressing a day (or its marks) fills the readout above the chart and lists the
 * day's events under it, each opening where it is worked on: a storm or a shortage on Harvest & fleet, a
 * van on its own page. Data: vm.days (daily_store_sales by local date) and vm.events (business_events,
 * matched to a day by local date). Styles: business.css.
 */

/* ── Labels ──────────────────────────────────────────────── */

const LEGEND: LegendItem[] = [
  { label: "Revenue", color: palette.meadow, swatch: <i className="pd-business-key-bar" aria-hidden="true"/> },
  { label: "Plan", color: palette.plum, shape: "line" },
  { label: "Last season", color: palette.rose, shape: "ring" },
];
export const CHART_HEIGHT = 326;

/** How each kind of event looks and reads. Ventilation faults are frequent and small: listed, not marked. */
const KIND: Record<BusinessEventKind, { icon: IconName; one: string; many: string; marked: boolean }> = {
  storm: { icon: "storm", one: "storm", many: "storms", marked: true },
  breakdown: { icon: "truck", one: "breakdown", many: "breakdowns", marked: true },
  hub_shortage: { icon: "box", one: "hub shortage", many: "hub shortages", marked: true },
  ventilation: { icon: "truck", one: "ventilation fault", many: "ventilation faults", marked: false },
};
const ORDER: BusinessEventKind[] = ["storm", "breakdown", "hub_shortage", "ventilation"];
/** The event key under the chart: what each mark above the days means. */
const EVENT_LABEL: Record<BusinessEventKind, string> = { storm: "Storm", breakdown: "Van broke down", hub_shortage: "Hub ran short", ventilation: "Ventilation fault" };

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
/** Axis labels: $0, then thousands ($25k, $2.5k, $10k), or whole dollars on a very small scale. */
const axisLabel = (value: number, step: number) => value === 0 ? "$0" : step >= 1000 ? `$${num(value / 1000, step % 1000 ? 1 : 0).replace(/\.0$/, "")}k` : dollars(value);
const dayName = (d: BusinessDay) => dayLabel(localDate(d.date));
/** "1 storm, 2 breakdowns": the kinds of a day's events, counted. */
const countText = (counts: [BusinessEventKind, number][]) => counts.map(([kind, n]) => n === 1 ? `1 ${KIND[kind].one}` : `${n} ${KIND[kind].many}`).join(", ");
/** Where an event is worked on: a van on its own page, a storm or a hub on Harvest & fleet. */
const targetOf = (e: BusinessEvent) => e.truckId && (e.kind === "breakdown" || e.kind === "ventilation")
  ? { to: routes.truck(e.truckId), page: `van ${e.truckId}` }
  : { to: routes.fleet(), page: "Harvest & fleet" };

/**
 * Touch scrubbing over the day columns: a finger sliding along the chart picks the column under it (on a phone
 * a column is narrower than a fingertip). Each column is found by its own box, so the days a phone hides take
 * no part. A mouse keeps to clicks and keyboards to the buttons; it measures only in the event. With
 * `touch-action: pan-y` (business.css) a vertical swipe still scrolls the page.
 */
const scrubber = (on: number, onSelect: (index: number) => void) => (e: PointerEvent<HTMLElement>) => {
  if (e.pointerType === "mouse" || e.buttons === 0) return;
  const cols = e.currentTarget.children;
  let best = -1, distance = Infinity;
  for (let i = 0; i < cols.length; i++) {
    const box = cols[i].getBoundingClientRect();
    if (!box.width) continue;
    const d = Math.abs(e.clientX - (box.left + box.right) / 2);
    if (d < distance) { distance = d; best = i; }
  }
  if (best >= 0 && best !== on) onSelect(best);
};

/** The round mark of an event kind: on the chart and in front of each listed event. */
export function EventMark({ kind, count = 1 }: { kind: BusinessEventKind; count?: number }) {
  return <span className={`pd-business-mark is-${kind}`} aria-hidden="true">
    <Icon name={KIND[kind].icon} size={12} strokeWidth={2.1}/>
    {count > 1 && <b>{count}</b>}
  </span>;
}

/* ── Panel ───────────────────────────────────────────────── */

export type DailyRevenueProps = {
  /** vm.days: the last 28 local dates, oldest first. */
  days?: BusinessDay[];
  /** vm.events: undefined while they load (the chart shows without marks). */
  events?: BusinessEvent[];
  /** Index into `days`; null follows the latest day. */
  selected: number | null;
  onSelect: (index: number) => void;
  busy?: boolean;
  /** vm.failed.days */
  error?: string;
  /** vm.failed.events */
  eventsError?: string;
  onRetry?: () => void;
};

/**
 * The vine chart: one pumpkin per day on a stem, a plum tick for the plan and a ring for last season.
 * Weekends sit on a warmer bar and carry a dot under the axis; today is dashed while it runs. A day is a
 * button: pressing it fills the readout and lists its events; on a touch screen a finger can slide along the
 * columns. Phones show the last 14 days.
 */
export function DailyRevenue({ days, events, selected, onSelect, busy, error, eventsError, onRetry }: DailyRevenueProps) {
  let body: ReactNode;
  if (!days) body = <div className="pd-business-pending">{error ? <PanelState state="error" message={error} onRetry={onRetry}/> : <PanelState state="loading" chart minHeight={CHART_HEIGHT}/>}</div>;
  else if (!days.length) body = <PanelState state="empty" message="No sales yet" minHeight={CHART_HEIGHT}/>;
  else {
    const last = days.length - 1;
    const on = selected == null ? last : Math.max(0, Math.min(last, selected));
    // Headroom above the tallest mark for its pumpkin; never a zero-height axis.
    const scale = niceScale(Math.max(1000, Math.max(...days.map(d => Math.max(d.revenue, d.planRevenue, d.lyRevenue))) * 1.12));
    const at = (value: number) => `${Math.max(0, value / scale.top) * 100}%`;

    // Each day's events, oldest first, and how many of each kind.
    const byDay = days.map(d => (events ?? []).filter(e => e.date === d.date).sort((a, b) => a.startedAt.localeCompare(b.startedAt)));
    const counts = byDay.map(list => ORDER.map(kind => [kind, list.filter(e => e.kind === kind).length] as [BusinessEventKind, number]).filter(([, n]) => n > 0));
    const marked = counts.map(list => list.filter(([kind]) => KIND[kind].marked));
    const read = days[on];
    const readEvents = byDay[on];
    const scrub = scrubber(on, onSelect);

    body = <>
      <div className="pd-business-readout" aria-live="polite">
        <strong>{dayName(read)}{read.isPartial && " · so far"}</strong>
        <span className="pd-num">{money(read.revenue)}</span>
        <span>Plan {money(read.planRevenue)}</span>
        <span>Last season {money(read.lyRevenue)}</span>
        {change(read.revenue, read.planRevenue) != null && <DeltaText value={change(read.revenue, read.planRevenue)} label="vs plan"/>}
        {readEvents.length > 0 && <span>{plural(readEvents.length, "event")}</span>}
      </div>
      {marked.some(list => list.length) && <div className="pd-business-evrow">
        <div className="pd-business-evdays">
          {/* Keyboard users pick days through the columns, whose labels name the events; the marks are a larger target for a pointer. */}
          {days.map((d, i) => marked[i].length
            ? <button type="button" key={d.date} tabIndex={-1} className="pd-business-evday" aria-pressed={i === on} onClick={() => onSelect(i)}
                aria-label={`${dayName(d)}: ${countText(counts[i])}. Show the day`} title={countText(marked[i])}>
                {marked[i].map(([kind, n]) => <EventMark key={kind} kind={kind} count={n}/>)}
              </button>
            : <span key={d.date}/>)}
        </div>
      </div>}
      <ChartFrame height={CHART_HEIGHT} axisWidth={38} ticks={scale.ticks.map(t => ({ at: t / scale.top, label: axisLabel(t, scale.step) }))}
        xAxis={<div className="pd-business-x">{days.map((d, i) => <span key={d.date} className={d.isWeekend ? "is-weekend" : undefined}><i/>{(last - i) % 7 === 0 && monthDay(localDate(d.date))}</span>)}</div>}>
        <div className="pd-business-days" onPointerDown={scrub} onPointerMove={scrub}>
          {days.map((d, i) => <button type="button" key={d.date} className={cx("pd-business-day", d.isWeekend && "is-weekend", d.isPartial && "is-partial")}
            aria-pressed={i === on} onClick={() => onSelect(i)}
            aria-label={`${dayName(d)}${d.isPartial ? ", so far" : ""}: ${money(d.revenue)}, plan ${money(d.planRevenue)}${counts[i].length ? `. ${countText(counts[i])}` : ""}`}>
            {/* A day with nothing yet (a market not open) draws nothing on the axis. */}
            {d.revenue > 0 && <>
              <span className="pd-business-bar" style={{ height: at(d.revenue) }}/>
              <span className="pd-business-stem" style={{ height: `calc(${at(d.revenue)} - 2%)` }}/>
              <PumpkinGlyph width={22} style={{ bottom: at(d.revenue) }}/>
            </>}
            {d.planRevenue > 0 && <span className="pd-business-plan" style={{ bottom: at(d.planRevenue) }}/>}
            {d.lyRevenue > 0 && <span className="pd-business-ly" style={{ bottom: at(d.lyRevenue) }}/>}
          </button>)}
        </div>
      </ChartFrame>
      {marked.some(list => list.length) && <Legend className="pd-business-evlegend"
        items={ORDER.filter(kind => KIND[kind].marked && marked.some(list => list.some(([k]) => k === kind)))
          .map(kind => ({ label: EVENT_LABEL[kind], color: "", swatch: <EventMark kind={kind}/> }))}/>}
      {readEvents.length > 0 && <div className="pd-business-events">
        {readEvents.map(e => {
          const { to, page } = targetOf(e);
          const lost = e.lostRevenue >= 0.5 ? `${money(e.lostRevenue)} lost` : null;
          const detail = `${e.detail}${e.endedAt ? "" : " · ongoing"}`;
          return <RowLink key={e.id} to={to} pad={8} trailing={lost && <span className="pd-business-event-lost">{lost}</span>}
            aria-label={`${e.title}: ${detail}${lost ? `, ${lost}` : ""}. Open ${page}`}>
            <span className="pd-business-event">
              <EventMark kind={e.kind}/>
              <span><strong>{e.title}</strong><small>{detail}</small></span>
            </span>
          </RowLink>;
        })}
      </div>}
      {!events && eventsError && <div className="pd-business-events-state"><PanelState state="error" message={eventsError} onRetry={onRetry}/></div>}
    </>;
  }
  return <Panel title={<Define k="dailyRevenue" part="days">Daily revenue</Define>} label="Daily revenue" aside={<Legend items={LEGEND}/>} gap={0} busy={busy}
    className="pd-split-main pd-business-daily">{body}</Panel>;
}
