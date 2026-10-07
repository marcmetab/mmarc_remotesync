import type { ReactNode } from "react";
import { Bit, BLANK, dotted, NowFigure, type Place, vanTime } from "../../components/DrillBand";
import { Icon } from "../../components/ui";
import { dayLabel, duration, int, localDate, pct, plural } from "../../format";
import { routes } from "../../routes";
import { palette } from "../../theme";
import { DELAY_CAUSE_LABEL, lateStatus, type ServiceStatus, TRUCK_PERIOD, type TruckPeriod } from "../../types";
import type { TimelineStep, TruckFault, TruckNow, TruckTrip } from "../TruckPage";
import { firstFact, HEADING, inPeriod, tripFigures, whenLabel } from "./model";

/*
 * The band under the van's title: the City and Store pages' band (DrillBand's look and pieces, drill-band.css),
 * with four figures for the time switch's trips on the left (trips, on time, pumpkins delivered, km driven), a
 * hairline, and what the van is doing right now, which never follows the switch. Styles: truck.css (the grid).
 */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** Why a van sits in the workshop when it has no open fault. */
const SERVICE_WHY: Partial<Record<ServiceStatus, string>> = { overdue: "Service overdue", due_soon: "Service due soon", in_workshop: "In for service" };

type BandProps = {
  truck?: TruckNow;
  trips?: TruckTrip[];
  timeline?: TimelineStep[];
  faults?: TruckFault[];
  period: TruckPeriod;
  place: Place;
  /** The trips failed: this short message stands in for the period's figures. */
  error?: string;
  busy?: boolean;
};

export function TruckBand({ truck, trips, timeline, faults, period, place, error, busy }: BandProps) {
  const span = trips?.filter(t => inPeriod(t.daysAgo, period));
  const f = span && tripFigures(span);
  const days = TRUCK_PERIOD[period].daysAgo;
  const single = days != null && days[0] === days[1];

  // Trips: what is running now, else where they went (one day) or since when (several).
  const tripsNote = !f ? BLANK
    : f.trips === 0 ? "no trips"
    : f.underWay && f.trips === 1 ? (f.underWay.isDelivered ? "heading back now" : "on the way now")
    : single ? `to ${Array.from(new Set(span!.map(t => t.storeName))).join(", ")}`
    : `since ${dayLabel(localDate(f.first!.localDate))}`;

  return <section className={cx("pd-drill pd-truck-drill", busy && "pd-busy")} aria-label="Summary">
    <div className="pd-drill-band">
      <h2 className="pd-drill-head is-period">{TRUCK_PERIOD[period].title}</h2>
      {error
        ? <p className="pd-drill-error" role="alert"><Icon name="alert" size={16} strokeWidth={1.9}/>{error}</p>
        : <>
          <Figure area="trips" label="Trips" value={f && int(f.trips)} note={tripsNote}/>
          <Figure area="ontime" label="On time" value={f && (f.delivered ? pct(f.onTime / f.delivered) : "—")} alert={!!f?.late}
            note={!f ? BLANK : !f.delivered ? "none arrived yet" : `${int(f.onTime)} of ${int(f.delivered)}${f.late ? ` · ${int(f.late)} late` : f.delivered > 1 ? ", all on time" : ""}`}/>
          <Figure area="units" label="Pumpkins delivered" value={f && int(f.units)}
            note={!f ? BLANK : f.damaged ? `${int(f.damaged)} damaged` : f.delivered ? "none damaged" : f.underWay ? `${int(f.underWay.units)} aboard now` : BLANK}/>
          <Figure area="km" label="Driven" value={f && <>{int(f.km)}<small className="pd-unit"> km</small></>}
            note={!f || !f.trips ? BLANK : f.underWay && f.trips === 1 ? "so far" : "there and back"}/>
        </>}
      <span className="pd-drill-rule" aria-hidden="true"/>
      <h2 className="pd-drill-head is-now">Right now</h2>
      <RightNow truck={truck} trips={trips} timeline={timeline} faults={faults} place={place}/>
    </div>
  </section>;
}

/** A period figure, as DrillBand draws its own: a small label, a big numeral (a skeleton while it loads) and one line. */
function Figure({ area, label, value, note, alert }: { area: string; label: string; value?: ReactNode; note: string; alert?: boolean }) {
  return <div className={`pd-drill-fig is-${area}`}>
    <span className="pd-drill-fig-label">{label}</span>
    {value != null ? <span className="pd-num pd-drill-fig-num">{value}</span> : <span className="pd-skeleton pd-drill-fig-skel is-num"/>}
    <span className={cx("pd-drill-fig-note", alert && "is-alert")}>{note}</span>
  </div>;
}

/** The dot before the right-now line: olive on schedule, pumpkin late, severe very late, faint idle, plum in the workshop. */
const NowDot = ({ color }: { color: string }) => <span className="pd-truck-now-dot" style={{ background: color }}/>;

/**
 * What the van is doing (fleet_now): on the way to a store with its ETA on both clocks and the load aboard, stopped
 * and why, unloading, heading back, at the hub since when, or in the workshop and why. It opens the store it serves.
 */
function RightNow({ truck, trips, timeline, faults, place }: { truck?: TruckNow; trips?: TruckTrip[]; timeline?: TimelineStep[]; faults?: TruckFault[]; place: Place }) {
  if (!truck) return <NowFigure area="van" label="Trip" mark={<NowDot color={palette.track}/>} main={null} note={BLANK}/>;
  const { status, trip, hubName, cargo } = truck;
  const store = trip?.storeName || null;
  const late = trip ? lateStatus(trip.late) : "on_schedule";
  const tone = late === "severe" ? palette.severe : late === "late" ? palette.pumpkinDeep : palette.olive;
  const lateBit = trip && late !== "on_schedule" && <Bit alert>{duration(trip.late.minutes)} late</Bit>;
  const aboard = cargo.units > 0 && `${plural(cargo.units, "pumpkin")} aboard`;
  const to = trip && store && HEADING.includes(status) ? routes.store(trip.storeId) : undefined;
  const end = timeline?.[timeline.length - 1];

  let main: string, note: ReactNode[], dot = tone;
  switch (status) {
    case "loading":
      main = `Loading at ${hubName}`;
      note = [store && `for ${store}`, cargo.units > 0 && plural(cargo.units, "pumpkin")];
      break;
    case "driving":
      main = store ? `On the way to ${store}` : "On the road";
      note = [trip?.etaAt && <Bit>ETA {vanTime(trip.etaAt, place)}</Bit>, lateBit, aboard];
      break;
    case "stopped":
      main = store ? `Stopped on the way to ${store}` : "Stopped";
      note = [trip && (firstFact(trip.late.note) ?? (trip.late.cause ? DELAY_CAUSE_LABEL[trip.late.cause] : null)), trip?.etaAt && <Bit>ETA {vanTime(trip.etaAt, place)}</Bit>, lateBit];
      break;
    case "unloading":
      main = store ? `Unloading at ${store}` : "Unloading";
      note = [trip?.etaAt && <Bit>arrived {vanTime(trip.etaAt, place)}</Bit>, lateBit, aboard];
      break;
    case "returning": {
      // On the way back fleet_now names no store; the trip's own row does.
      const from = trip && (store ?? trips?.find(t => t.tripId === trip.tripId)?.storeName);
      main = `Heading back to ${hubName}`;
      note = [end?.at && end.state !== "done" && <Bit>back {end.isEstimate ? "≈ " : ""}{vanTime(end.at, place)}</Bit>, from && `from ${from}`];
      dot = palette.olive;
      break;
    }
    case "workshop": {
      const open = faults?.filter(f => !f.clearedAt) ?? [];
      const why = (open.find(f => f.severity === "critical") ?? open[0])?.description ?? SERVICE_WHY[truck.service.status] ?? hubName;
      main = "In the workshop";
      note = [why];
      dot = palette.plumHill;
      break;
    }
    default:
      main = `At ${hubName}`;
      note = [end?.at && end.state === "done" ? `since ${whenLabel(end.at, place.now, place.tz)}` : "no trip now"];
      dot = palette.faint;
  }
  return <NowFigure area="van" to={to} label={trip ? "Trip" : "Van"} mark={<NowDot color={dot}/>} main={main} note={dotted(note)}/>;
}
