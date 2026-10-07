import { Fragment, type ReactNode } from "react";
import "./trips.css";
import { Icon, Meter, Panel, PanelState, Pill, StatusChip, Swatch, Tag } from "../../components/ui";
import { dayLabel, dollars, int, kg, km, localDate, num, plural, time, yourTime } from "../../format";
import { Link } from "../../nav";
import { routes } from "../../routes";
import { varietyColor } from "../../theme";
import { DELAY_CAUSE_LABEL, type LateInfo, lateStatus, type TimelineState, type TruckPeriod, VARIETIES } from "../../types";
import { useViewerZone } from "../../viewer";
import type { DestinationStock, TimelineStep, TruckNow, TruckTrip } from "../TruckPage";
import { firstFact, inPeriod, isUnderWay, waveLabel, weekGroups, whenLabel } from "./model";

/*
 * Trips: the time switch's trips, newest first, by week (Monday to Sunday on the van's dates), each week headed by
 * how many there were and how many came late. A row is a button that opens the trip in place (one at a time): its
 * steps on the left (the live timeline for the trip under way, else built from its own times), its load on the
 * right, and the store it served. "Late only" keeps the late ones. Times are on the van's clock, with the viewer's
 * under them in the steps. Styles: trips.css (the rows), truck.css (the steps).
 */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** What an empty list says, by period ("No late trips today" with Late only). */
const EMPTY: Record<TruckPeriod, string> = {
  today: "trips today", yesterday: "trips yesterday", "7d": "trips in the last 7 days", "30d": "trips in the last 30 days", season: "trips this season",
};

type TripsProps = {
  truck?: TruckNow;
  trips?: TruckTrip[];
  timeline?: TimelineStep[];
  destination?: DestinationStock | null;
  period: TruckPeriod;
  /** The van's today ("2026-10-28"), for "This week" and "Today". */
  today: string | null;
  now?: string;
  /** The open row's trip_id, or null. */
  open: string | null;
  onOpen: (tripId: string | null) => void;
  lateOnly: boolean;
  onLateOnly: () => void;
  error?: string;
  onRetry?: () => void;
  busy?: boolean;
};

export function TripsPanel({ truck, trips, timeline, destination, period, today, now, open, onOpen, lateOnly, onLateOnly, error, onRetry, busy }: TripsProps) {
  const inSpan = trips?.filter(t => inPeriod(t.daysAgo, period));
  const late = inSpan?.filter(t => t.isLate).length ?? 0;
  const keep = (t: TruckTrip) => !lateOnly || t.isLate;
  const groups = inSpan && weekGroups(inSpan, today).map(g => ({ ...g, shown: g.trips.filter(keep) })).filter(g => g.shown.length > 0);

  return <Panel label="Trips" pad="flush" gap={0} className="pd-truck-trips" busy={busy}
    title={<>Trips{inSpan && <span className="pd-truck-count"> {int(inSpan.length)}</span>}</>}
    aside={inSpan && inSpan.length > 0 && <Pill pressed={lateOnly} onClick={onLateOnly} mark>Late only <span className="pd-truck-count">{int(late)}</span></Pill>}>
    {error ? <div className="pd-truck-trips-inset"><PanelState state="error" message={error} onRetry={onRetry}/></div>
      : !groups || !truck ? <div className="pd-truck-trips-inset"><PanelState state="loading" rows={5} minHeight={280}/></div>
      : groups.length === 0 ? <div className="pd-truck-trips-inset"><PanelState state="empty" message={`No ${lateOnly && inSpan!.length ? "late " : ""}${EMPTY[period]}`}/></div>
      : <>
        <div className="pd-truck-trip-cols is-head" aria-hidden="true">
          <span>Day</span><span>Store</span><span className="pd-right is-units">Pumpkins</span><span className="is-left">Left</span><span className="is-arrived">Arrived</span><span>Result</span><span/>
        </div>
        {groups.map(g => {
          const lateIn = g.trips.filter(t => t.isLate).length;
          const arrived = g.trips.some(t => t.arrivedAt != null);
          return <section key={g.monday} className="pd-truck-week" aria-label={g.title}>
            <div className="pd-truck-week-head">
              <h3>{g.title}</h3>
              <span>{plural(g.trips.length, "trip")}{lateIn ? <> · <strong>{int(lateIn)} late</strong></> : arrived ? " · all on time" : ""}</span>
            </div>
            {g.shown.map(t => <TripRow key={t.tripId} trip={t} truck={truck} timeline={timeline} destination={destination} now={now}
              open={open === t.tripId} onToggle={() => onOpen(open === t.tripId ? null : t.tripId)}/>)}
          </section>;
        })}
      </>}
  </Panel>;
}

/* ── A row ───────────────────────────────────────────────── */

type RowProps = { trip: TruckTrip; truck: TruckNow; timeline?: TimelineStep[]; destination?: DestinationStock | null; now?: string; open: boolean; onToggle: () => void };

/** Day, store, pumpkins, left, arrived (≈ the ETA while on the way, the plan under it), result and a chevron. */
function TripRow({ trip: t, truck, timeline, destination, now, open, onToggle }: RowProps) {
  const tz = truck.tz;
  const id = `pd-trip-${t.tripId.replace(/[^\w-]/g, "")}`;
  return <div className={cx("pd-truck-trip", open && "is-open")}>
    <button type="button" className="pd-truck-trip-cols" aria-expanded={open} aria-controls={open ? id : undefined} onClick={onToggle}>
      <span className="pd-truck-trip-two">
        <strong>{dayLabel(localDate(t.localDate))}</strong>
        <small className={t.daysAgo === 0 ? "is-today" : undefined}>{t.daysAgo === 0 ? "Today" : waveLabel(t.wave)}</small>
      </span>
      <span className="pd-truck-trip-two">
        <strong>{t.storeName}</strong>
        <small>{t.cityName}</small>
      </span>
      <span className="pd-right pd-truck-trip-num is-units">{int(t.units)}</span>
      <span className="pd-truck-trip-num is-left">{t.departedAt ? time(t.departedAt, tz) : "—"}</span>
      <span className="pd-truck-trip-two pd-truck-trip-num is-arrived">
        <strong className={t.arrivedAt ? undefined : "is-soon"}>{t.arrivedAt ? time(t.arrivedAt, tz) : t.etaAt ? `≈ ${time(t.etaAt, tz)}` : "—"}</strong>
        {t.plannedArriveAt && <small>plan {time(t.plannedArriveAt, tz)}</small>}
      </span>
      <span className="pd-truck-trip-result"><Result trip={t} tz={tz}/></span>
      <span className="pd-truck-trip-chev"><Icon name="chevronDown" size={16} strokeWidth={2}/></span>
    </button>
    {open && <div id={id} className="pd-truck-trip-open">
      <TripOpen trip={t} truck={truck} timeline={timeline} destination={destination} now={now}/>
    </div>}
  </div>;
}

/** On time, late by how much and why, or on the way with its ETA. */
function Result({ trip: t, tz }: { trip: TruckTrip; tz: string }) {
  const status = lateStatus(t.late);
  if (!t.arrivedAt && isUnderWay(t)) {
    if (t.status === "loading") return <Tag tone="stone" size="sm">Loading</Tag>;
    return <span className="pd-truck-result-way">
      {status === "on_schedule" ? <StatusChip status="on_schedule" label="On the way" size="sm"/> : <StatusChip status={status} minutes={t.late.minutes} size="sm"/>}
      {t.etaAt && <span className="pd-truck-trip-num">ETA {time(t.etaAt, tz)}</span>}
    </span>;
  }
  if (status === "on_schedule") return <StatusChip status="on_schedule" label="On time" size="sm"/>;
  return <span className="pd-truck-result-late">
    <StatusChip status={status} minutes={t.late.minutes} size="sm"/>
    {(t.late.cause || t.late.note) && <small><Cause late={t.late}/></small>}
  </span>;
}

/** "Breakdown · coolant temperature high · …". A note that already opens with its cause ("Traffic on I-278") is not prefixed again. */
function Cause({ late }: { late: LateInfo }) {
  const label = late.cause ? DELAY_CAUSE_LABEL[late.cause] : null;
  const note = late.note?.trim() || null;
  if (label && note && note.toLowerCase().startsWith(label.toLowerCase())) return <><strong>{note.slice(0, label.length)}</strong>{note.slice(label.length)}</>;
  return <>{label && <strong>{label}</strong>}{label && note && " · "}{note}</>;
}

/* ── An open row ─────────────────────────────────────────── */

/**
 * The trip laid out: its steps on the left, its load on the right (pumpkins by variety, bins, weight, value, cost,
 * distance, wave), what the store is short of while the load is on its way, and a link to the store.
 */
function TripOpen({ trip: t, truck, timeline, destination, now }: { trip: TruckTrip; truck: TruckNow; timeline?: TimelineStep[]; destination?: DestinationStock | null; now?: string }) {
  const yours = useViewerZone();
  const { tz } = truck;
  // The trip running now has the live timeline (trip_timeline holds its steps); any other is built from its own times.
  const live = isUnderWay(t) && timeline?.[0]?.tripId === t.tripId;
  const current = truck.trip?.tripId === t.tripId;
  const aboard = isUnderWay(t) && !t.unloadedAt;
  const bins = Number.isInteger(t.bins) ? int(t.bins) : num(t.bins, 1);
  const facts: [string, ReactNode][] = [
    ["Bins", `${bins} of ${int(t.capacityBins)}`],
    ["Weight", kg(t.kg)],
    ["Retail value", dollars(t.valueUsd)],
    ["Delivery cost", dollars(t.costUsd)],
    ["Distance", `${km(t.kmTotal)} there and back`],
    ["Wave", waveLabel(t.wave)],
  ];
  const parts = VARIETIES.filter(v => t.varieties[v] > 0);
  return <>
    <Steps label={`Steps of the trip to ${t.storeName}`}
      rows={live ? timelineRows(timeline!, tz, yours, liveStep(truck, timeline!, now)) : tripRows(t, truck.hubName, tz, yours)}/>
    <div className="pd-truck-load">
      <strong>{plural(t.units, "pumpkin")} {aboard ? "aboard" : "loaded"}</strong>
      {t.units > 0 && <>
        <Meter gap={2} height={6} className="pd-truck-load-bar" aria-label={parts.map(v => `${v} ${t.varieties[v]}`).join(", ")}
          segments={parts.map(v => ({ value: t.varieties[v] / t.units, color: varietyColor[v] }))}/>
        <span className="pd-truck-load-key">{parts.map(v => <span key={v}><Swatch color={varietyColor[v]}/>{v} <strong>{int(t.varieties[v])}</strong></span>)}</span>
      </>}
      <dl className="pd-truck-load-facts">
        {facts.map(([label, value]) => <Fragment key={label}><dt>{label}</dt><dd>{value}</dd></Fragment>)}
      </dl>
      {current && destination && <p className="pd-truck-load-dest">{destinationNote(destination, now, tz)}</p>}
      <Link to={routes.store(t.storeId)} className="pd-truck-load-link">Open the {t.storeName} store<Icon name="chevronRight" size={14} strokeWidth={2}/></Link>
    </div>
  </>;
}

/** "Out of Carving since 13:40 · this load covers about 2.1 days" */
function destinationNote(d: DestinationStock, now: string | undefined, tz: string) {
  const stock = d.status === "out" && d.variety ? `Out of ${d.variety}${d.since ? ` since ${whenLabel(d.since, now, tz)}` : ""}`
    : d.status === "low" && d.variety ? `Low on ${d.variety}` : null;
  const cover = d.loadCoverDays != null ? `${stock ? "this" : "This"} load covers about ${num(d.loadCoverDays, 1)} days` : null;
  return [stock, cover].filter(Boolean).join(" · ");
}

/* ── Steps ───────────────────────────────────────────────── */

/** A step: done (olive check), late (deep pumpkin check), now (orange ring) or next (hollow, an estimated time). */
type StepRow = { key: string; state: TimelineState | "late"; time: string; alt: string | null; label: ReactNode; detail?: ReactNode; live?: boolean };
/** The live row of the timeline: the clock's time and what the van is doing. */
type LiveStep = { at: string; label: string; detail?: string | null };

/**
 * The row for right now, under the last step that has happened: the clock's time and what the van is doing
 * ("On the way to Harlem · 18 of 260 km"). Only while a trip runs (the view marks its latest past step "now").
 */
function liveStep(truck: TruckNow, steps: TimelineStep[], now: string | undefined): LiveStep | null {
  if (!now || !steps.some(s => s.state === "now")) return null;
  const { trip, hubName, status } = truck;
  const store = trip?.storeName;
  switch (status) {
    case "loading": return { at: now, label: `Loading at ${hubName}` };
    case "driving": return { at: now, label: store ? `On the way to ${store}` : "On the road", detail: trip ? `${int(trip.kmDone)} of ${km(trip.kmTotal)}` : null };
    case "stopped": return { at: now, label: store ? `Stopped on the way to ${store}` : "Stopped", detail: trip ? firstFact(trip.late.note) ?? (trip.late.cause ? DELAY_CAUSE_LABEL[trip.late.cause] : null) : null };
    case "unloading": return { at: now, label: store ? `Unloading at ${store}` : "Unloading" };
    case "returning": return { at: now, label: `Returning to ${hubName}` };
    default: return null;
  }
}

/**
 * The live timeline's rows (trip_timeline). With `live`, the step that last happened is shown done at its own
 * time, and a row for right now follows it, so the orange ring sits on the current time (it moves with the clock)
 * rather than on the departure. Each time on the hub's clock, and under it on the viewer's (when the two differ).
 */
function timelineRows(steps: TimelineStep[], tz: string, yours: string, live: LiveStep | null): StepRow[] {
  const rows: StepRow[] = [];
  const alt = (at: string | null | undefined) => at ? yourTime(at, tz, yours) : null;
  for (const step of steps) {
    rows.push({ key: String(step.seq), state: live && step.state === "now" ? "done" : step.state, time: step.at ? `${step.isEstimate ? "≈ " : ""}${time(step.at, tz)}` : "", alt: alt(step.at), label: step.label, detail: step.detail });
    if (live && step.state === "now") rows.push({ key: "live", state: "now", time: time(live.at, tz), alt: alt(live.at), label: live.label, detail: live.detail, live: true });
  }
  return rows;
}

/**
 * A trip's steps from its own times (deliveries): left the hub (and the plan), arrived (late by how much and why,
 * or the plan), unloaded (and the damaged), back at the hub. A step still ahead shows its estimate, if known.
 */
function tripRows(t: TruckTrip, hub: string, tz: string, yours: string): StepRow[] {
  const rows: StepRow[] = [];
  const at = (iso: string, estimate = false) => ({ time: `${estimate ? "≈ " : ""}${time(iso, tz)}`, alt: yourTime(iso, tz, yours) });
  const plan = (iso: string | null) => iso ? `plan ${time(iso, tz)}` : null;
  const status = lateStatus(t.late);
  if (t.departedAt) rows.push({ key: "left", state: "done", ...at(t.departedAt), label: `Left ${hub}`, detail: plan(t.plannedDepartAt) });
  else if (t.plannedDepartAt) rows.push({ key: "left", state: "next", ...at(t.plannedDepartAt, true), label: `Leave ${hub}` });
  if (t.arrivedAt) rows.push({
    key: "arrived", state: status === "on_schedule" ? "done" : "late", ...at(t.arrivedAt), label: `Arrived ${t.storeName}`,
    detail: status === "on_schedule" ? plan(t.plannedArriveAt) : <>
      <StatusChip status={status} minutes={t.late.minutes} size="sm"/>
      {(t.late.cause || t.late.note) && <span className="pd-truck-step-cause"><Cause late={t.late}/></span>}
    </>,
  });
  else if (t.etaAt) rows.push({ key: "arrived", state: "next", ...at(t.etaAt, true), label: `Arrive ${t.storeName}`, detail: plan(t.plannedArriveAt) });
  if (t.unloadedAt) rows.push({ key: "unloaded", state: "done", ...at(t.unloadedAt), label: `Unloaded ${plural(t.units - t.damaged, "pumpkin")}`, detail: t.damaged ? `${int(t.damaged)} damaged` : null });
  if (t.returnedAt) rows.push({ key: "back", state: "done", ...at(t.returnedAt), label: `Back at ${hub}` });
  return rows;
}

/** The steps as a rail of dots; the line to the next dot is solid once that step has started. */
function Steps({ rows, label }: { rows: StepRow[]; label: string }) {
  if (!rows.length) return <PanelState state="empty" message="No steps yet"/>;
  return <ol className="pd-truck-steps" aria-label={label}>
    {rows.map((row, i) => {
      const next = rows[i + 1];
      const solid = next != null && next.state !== "next";
      return <li key={row.key} className={`pd-truck-step is-${row.state}${solid ? " is-solid" : ""}${row.live ? " is-live" : ""}`}>
        <span className="pd-truck-step-time">{row.time}{row.alt && <small>{row.alt}</small>}</span>
        <span className="pd-truck-step-rail"><span className="pd-truck-step-dot">{(row.state === "done" || row.state === "late") && <Icon name="check" size={12} strokeWidth={2.6}/>}</span></span>
        <span className="pd-truck-step-text">
          <span>{row.label}</span>{row.state === "now" && <span className="pd-sr"> (now)</span>}
          {row.detail && <small>{row.detail}</small>}
        </span>
      </li>;
    })}
  </ol>;
}
