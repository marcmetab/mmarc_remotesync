import type { CSSProperties } from "react";
import "./season.css";
import { ChartTip, type ChartTipRow, useChartTip } from "../../components/ChartTip";
import { Legend, type LegendItem, Panel, PanelState, PumpkinGlyph } from "../../components/ui";
import { dayLabel, duration, int, localDate, plural, time } from "../../format";
import { palette } from "../../theme";
import { DELAY_CAUSE_LABEL, lateStatus, TRUCK_PERIOD, type TruckPeriod } from "../../types";
import type { TruckFault, TruckTrip } from "../TruckPage";
import { isUnderWay, type SeasonDay, seasonDays, waveLabel } from "./model";

/*
 * The season: one column per day from the season's start to Halloween. A day with a trip is a bar as tall as the
 * pumpkins it took (two trips add up): olive on time, deep pumpkin late, striped while under way. A day without
 * one is a short stub, a day still to come a dashed one, and a small dot above marks a fault raised that day
 * (amber a warning, deep orange critical). The time switch's days are shaded and the bars outside them fade.
 * A column under the mouse, the keyboard focus or a finger shows its card (ChartTip, as on the City page).
 * Styles: season.css.
 */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
const share = (v: number) => `${(Math.max(0, Math.min(1, v)) * 100).toFixed(3)}%`;

const LEGEND: LegendItem[] = [
  { label: "On time", color: palette.olive },
  { label: "Late", color: palette.pumpkinDeep },
  { label: "Fault", color: palette.candle, shape: "dot" },
];
const FAULT_COLOR = { warning: palette.candle, critical: palette.severe } as const;

/** The bars' tallest height and the strip above them for the fault dots (px): season.css keeps the same numbers. */
const BARS_H = 96, DOTS_H = 16;
/** How far over the plot a column's card may rise (px), over the panel's title row. */
const TIP_REACH = 40;

type ChartProps = {
  trips?: TruckTrip[];
  faults?: TruckFault[];
  tz: string;
  /** The van's today and Halloween ("2026-10-28"); null until the van's row (or its trips) has loaded. */
  today: string | null;
  halloween: string | null;
  period: TruckPeriod;
  error?: string;
  onRetry?: () => void;
  busy?: boolean;
};

export function SeasonChart({ trips, faults, tz, today, halloween, period, error, onRetry, busy }: ChartProps) {
  const ready = trips && today && halloween;
  return <Panel title={<>The season <span className="pd-truck-season-unit">· pumpkins per trip</span></>} label="The season"
    aside={ready && <Legend items={LEGEND}/>} className="pd-truck-season-panel" gap={18} busy={busy}>
    {error ? <PanelState state="error" message={error} onRetry={onRetry}/>
      : !ready ? <PanelState state="loading" chart minHeight={136}/>
      : <SeasonBars days={seasonDays(trips, faults ?? [], today, halloween, tz)} halloween={halloween} period={period} tz={tz}/>}
  </Panel>;
}

/** How a day's bar is drawn: under way wins, then late. */
function barKind(day: SeasonDay): "now" | "now-late" | "late" | "ok" {
  const late = day.trips.some(t => t.isLate);
  if (day.trips.some(isUnderWay)) return late ? "now-late" : "now";
  return late ? "late" : "ok";
}

/** "2 h 38 m late · Breakdown", "On time", "On the way · ETA 14:36": a trip's result in the card. */
function resultWords(trip: TruckTrip, tz: string) {
  const late = lateStatus(trip.late) !== "on_schedule";
  const cause = trip.late.cause ? ` · ${DELAY_CAUSE_LABEL[trip.late.cause]}` : "";
  if (!trip.arrivedAt && isUnderWay(trip)) return `${late ? `${duration(trip.late.minutes)} late` : "On the way"}${trip.etaAt ? ` · ETA ${time(trip.etaAt, tz)}` : ""}`;
  return late ? `${duration(trip.late.minutes)} late${cause}` : "On time";
}

function SeasonBars({ days, halloween, period, tz }: { days: SeasonDay[]; halloween: string; period: TruckPeriod; tz: string }) {
  const count = days.length;
  const todayAt = days.findIndex(d => d.daysAgo === 0);
  const tip = useChartTip(count, todayAt >= 0 ? todayAt : days.reduce((last, d, i) => d.future ? last : i, 0));
  const shown = tip.index != null && !days[tip.index].future ? tip.index : null;
  const most = Math.max(1, ...days.map(d => d.trips.reduce((s, t) => s + t.units, 0)));
  const span = TRUCK_PERIOD[period].daysAgo;
  const inSpan = (d: SeasonDay) => !d.future && (!span || (d.daysAgo >= span[0] && d.daysAgo <= span[1]));
  // The period's days, shaded: none for the season, which is every day so far.
  const lit = span ? days.map((d, i) => inSpan(d) ? i : -1).filter(i => i >= 0) : [];

  return <div className="pd-truck-season">
    <div className="pd-truck-season-plot">
      {lit.length > 0 && <span className="pd-truck-season-shade" aria-hidden="true" style={{ left: share(lit[0] / count), right: share(1 - (lit[lit.length - 1] + 1) / count) }}/>}
      <div className="pd-truck-season-cols" {...tip.track}>
        {days.map((d, i) => {
          const units = d.trips.reduce((s, t) => s + t.units, 0);
          const out = !inSpan(d);
          if (d.future) return <span key={d.date} className="pd-truck-day is-future" aria-hidden="true">
            {d.fault && <i className="pd-truck-day-fault" style={{ background: FAULT_COLOR[d.fault] }}/>}
            <span className="pd-truck-day-dash"/>
          </span>;
          return <button type="button" key={d.date} {...tip.column(i, false)} aria-label={dayWords(d, tz)}
            className={cx("pd-truck-day", i === shown && "is-on", out && "is-out", d.daysAgo === 0 && "is-today")}>
            {d.fault && <i className="pd-truck-day-fault" style={{ background: FAULT_COLOR[d.fault] }}/>}
            {units > 0
              ? <span className={`pd-truck-day-bar is-${barKind(d)}`} style={{ "--pd-v": units / most } as CSSProperties}/>
              : <span className="pd-truck-day-stub"/>}
          </button>;
        })}
      </div>
      {shown != null && <span className="pd-truck-season-tip" style={{ top: -TIP_REACH }}>
        <ChartTip id={tip.id} heading={days[shown].daysAgo === 0 ? `Today · ${dayLabel(localDate(days[shown].date))}` : dayLabel(localDate(days[shown].date))}
          at={(shown + 0.5) / count} span={1 / count} rows={tipRows(days[shown], tz)}
          top={(DOTS_H + Math.max(6, days[shown].trips.reduce((s, t) => s + t.units, 0) / most * BARS_H)) / (BARS_H + DOTS_H + TIP_REACH)}/>
      </span>}
    </div>
    <Axis days={days} halloween={halloween}/>
  </div>;
}

/** The card's rows: where to, how many, how it went, and the fault raised that day. "No trip" on a quiet day. */
function tipRows(day: SeasonDay, tz: string): ChartTipRow[] {
  const rows: ChartTipRow[] = [];
  const [one] = day.trips;
  if (!one) rows.push({ label: "No trip", value: "" });
  else if (day.trips.length === 1) rows.push(
    { label: "Store", value: `${one.storeName}, ${one.cityName}` },
    { label: "Pumpkins", value: int(one.units) },
    { label: "Result", value: resultWords(one, tz), color: one.isLate ? palette.pumpkinDeep : palette.olive },
  );
  else {
    // Two runs in a day: each by its wave, then the day's pumpkins.
    for (const t of [...day.trips].reverse()) rows.push({ label: waveLabel(t.wave), value: `${t.storeName} · ${resultWords(t, tz)}`, color: t.isLate ? palette.pumpkinDeep : palette.olive });
    rows.push({ label: "Pumpkins", value: int(day.trips.reduce((s, t) => s + t.units, 0)) });
  }
  for (const f of day.faults) rows.push({ label: day.faults.length > 1 ? `Fault · ${f.code}` : "Fault", value: f.description, color: FAULT_COLOR[f.severity], shape: "dot" });
  return rows;
}

/** A column's name for the ear: the day, then its trips and fault. */
function dayWords(day: SeasonDay, tz: string) {
  const trips = day.trips.length ? day.trips.map(t => `${t.storeName}, ${plural(t.units, "pumpkin")}, ${resultWords(t, tz)}`).join("; ") : "no trip";
  const fault = day.faults.map(f => `fault: ${f.description}`).join("; ");
  return [`${day.daysAgo === 0 ? "Today, " : ""}${dayLabel(localDate(day.date))}`, trips, fault].filter(Boolean).join(": ");
}

/* ── Axis ────────────────────────────────────────────────── */

type AxisLabel = { at: number; text: string; strong: boolean; end: boolean; rank: number; glyph?: boolean };
/**
 * Pixels a column is wide, by chart width (season.css answers to the same container breakpoints): at least 900px,
 * 560–900px, a phone. The labels that would touch a stronger one are left out at that width.
 */
const TIERS = [["l", 14], ["m", 8.5], ["s", 4.6]] as const;
/** The pumpkin before "Halloween", and all that is left of it where the word would touch "Today" (px). */
const GLYPH_W = 13;

/**
 * Under the columns: the month on its first day, Mondays' dates, "Today" and Halloween at the end. Stronger labels
 * win where two would touch: Today, then Halloween (its pumpkin alone when the word has no room), then months, then
 * Mondays.
 */
function Axis({ days, halloween }: { days: SeasonDay[]; halloween: string }) {
  const count = days.length;
  const labels: AxisLabel[] = [];
  days.forEach((d, i) => {
    const [weekday, date, month] = dayLabel(localDate(d.date)).split(" ");
    // Near the end, "Today" ends at its column, leaving Halloween room after it.
    if (d.daysAgo === 0) labels.push({ at: i, text: "Today", strong: true, end: i > count - 8, rank: 0 });
    else if (d.date === halloween) labels.push({ at: i, text: "Halloween", strong: true, end: true, rank: 1, glyph: true });
    else if (date === "1" || i === 0) labels.push({ at: i, text: month, strong: true, end: false, rank: 2 });
    else if (weekday === "Mon") labels.push({ at: i, text: date, strong: false, end: false, rank: 3 });
  });
  // Per width: keep a label only if it clears every stronger one kept before it (the pumpkin alone, failing that).
  const classes = new Map<AxisLabel, string[]>();
  const add = (label: AxisLabel, cls: string) => classes.set(label, [...classes.get(label) ?? [], cls]);
  for (const [tier, col] of TIERS) {
    const kept: [number, number][] = [];
    const fits = (label: AxisLabel, w: number) => {
      const x0 = label.end ? (label.at + 1) * col - w : label.at * col, x1 = x0 + w;
      if (kept.some(([a, b]) => x0 < b + 8 && x1 > a - 8)) return false;
      kept.push([x0, x1]);
      return true;
    };
    for (const label of [...labels].sort((a, b) => a.rank - b.rank || a.at - b.at)) {
      const w = label.text.length * (label.strong ? 7.2 : 6.6) + (label.glyph ? GLYPH_W + 4 : 0);
      if (fits(label, w)) continue;
      if (label.glyph && fits(label, GLYPH_W)) add(label, `is-short-${tier}`);
      else add(label, `is-hide-${tier}`);
    }
  }
  return <div className="pd-truck-season-x" aria-hidden="true">
    {labels.map(l => <span key={l.at} className={cx("pd-truck-x", l.strong && "is-strong", ...(classes.get(l) ?? []))}
      style={l.end ? { right: share(1 - (l.at + 1) / count) } : { left: share(l.at / count) }}>
      {l.glyph ? <><PumpkinGlyph width={GLYPH_W}/><span className="pd-truck-x-word">{l.text}</span></> : l.text}
    </span>)}
  </div>;
}
