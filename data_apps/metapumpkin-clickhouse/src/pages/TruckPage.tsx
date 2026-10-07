import { useState } from "react";
import { BackTitle, Facts, Icon, Meter, Panel, PanelState, Pill, Stat, StatusChip, Tag, type TagTone } from "../components/ui";
import { ago, dateLabel, dayLabel, int, km, localDate, pct, tempC } from "../format";
import { routes } from "../routes";
import { palette } from "../theme";
import {
  lateStatus,
  type FaultSeverity, type LateInfo, type PageProps, type ServiceStatus, type StockStatus, type TimelineState, type TripStatus, type TruckPeriod, type TruckStatus, type Variety,
} from "../types";
import "./truck.css";
import { useViewerZone } from "../viewer";
import { halloweenOf, isUnderWay, vanToday, whenLabel } from "./truck/model";
import { SeasonChart } from "./truck/SeasonChart";
import { TripsPanel } from "./truck/TripList";
import { TruckBand } from "./truck/TruckBand";

/**
 * Truck page (/fleet/truck/:truckId): one van, and every trip it made this season. Under the title a band of
 * figures for the top bar's time switch (trips, on time, pumpkins delivered, km driven) and what the van is doing
 * right now; the season by day; then the trips, newest first by week, each opening to its steps and its load, and
 * beside them the vehicle's health and last readings. Presentational: the view model comes in; the only state is
 * the open trip, the "Late only" filter and the cleared-faults toggle. Pieces: ./truck/ (band, chart, trips).
 */

/* ── View model ──────────────────────────────────────────── */

/**
 * Each part is one query on `pumpkin_live` and is undefined while that query loads (its panels show a
 * skeleton). `truck: null` means no van has this id. All timestamps are ISO strings; the page prints
 * them in the van's home zone (`truck.tz`).
 */
export type TruckViewModel = {
  /** fleet_now: the one row where truck_id = :truckId. */
  truck?: TruckNow | null;
  /** trip_timeline where truck_id = :truckId, ordered by seq: the current trip, or the latest one when the van is idle. */
  timeline?: TimelineStep[];
  /** truck_faults where truck_id = :truckId (last 30 days), newest first. */
  faults?: TruckFault[];
  /**
   * TruckTrips: deliveries where truck_id = :truckId, the whole season, newest first (planned_depart_at). Loaded
   * once; the page picks the time switch's trips from it by days_ago.
   */
  trips?: TruckTrip[];
  /** store_now (+ daily_store_sales) for fleet_now.dest_store_id. Optional: without it the open trip shows no stock note. */
  destination?: DestinationStock | null;
  /** A query that failed, by part: the message its panels show instead of data. */
  errors?: Partial<Record<"truck" | "timeline" | "faults" | "trips", string>>;
};

export type TruckNow = {
  /* Title row and meta line. fleet_now: truck_id, truck_label, make_model, body, plate, driver_name, last_ping_at. */
  truckId: string;
  label: string;
  makeModel: string;
  body: string;
  plate: string;
  driverName: string | null;
  lastPingAt: string | null;

  /* Where it is. fleet_now: status, hub_name, tz (the home hub's zone). */
  status: TruckStatus;
  hubName: string;
  tz: string;

  /*
   * The current trip; null at the hub or in the workshop (fleet_now.trip_id is null).
   * fleet_now: trip_id, dest_store_id, dest_store_name, dest_city_name, planned_arrive_at, eta_at,
   * late_minutes + delay_cause + delay_note (as `late`), progress_pct (0–100, hub → store leg), km_total, km_done.
   */
  trip: {
    tripId: string;
    storeId: number;
    storeName: string;
    cityName: string;
    plannedArriveAt: string;
    etaAt: string | null;
    late: LateInfo;
    progressPct: number;
    kmTotal: number;
    kmDone: number;
  } | null;

  /*
   * What is aboard. fleet_now: units_aboard, bins_aboard, capacity_bins, kg_aboard, payload_kg, cargo_value_usd;
   * lines from carving_aboard / cooking_aboard / mini_aboard, each with kg = units × varieties.kg_per_unit and
   * valueUsd = units × varieties.list_price_usd, scaled so the lines add up to cargo_value_usd.
   */
  cargo: {
    units: number;
    lines: { variety: Variety; units: number; kg: number; valueUsd: number }[];
    bins: number;
    capacityBins: number;
    kg: number;
    payloadKg: number;
    valueUsd: number;
  };

  /*
   * Service. fleet_now: service_status, odometer_km, km_since_service, service_interval_km,
   * km_to_service (negative = overdue), last_service_on, last_service_km, service_booked_on (dates, "2026-11-02").
   */
  service: {
    status: ServiceStatus;
    odometerKm: number;
    kmSinceService: number;
    intervalKm: number;
    kmToService: number;
    lastServiceOn: string | null;
    lastServiceKm: number | null;
    bookedOn: string | null;
  };

  /*
   * Readings of the last ping. fleet_now: fuel_pct (0–100), coolant_c, cargo_temp_c, speed_kmh.
   * fuelRangeKm is not a column: fuel_pct × the van's full-tank range (a constant in the mapper); null hides it.
   */
  readings: {
    fuelPct: number | null;
    fuelRangeKm: number | null;
    coolantC: number | null;
    cargoTempC: number | null;
    speedKmh: number | null;
  };
};

/** trip_timeline: trip_id, seq, event_at, is_estimate, state, label, detail. */
export type TimelineStep = {
  tripId: string;
  seq: number;
  at: string | null;
  isEstimate: boolean;
  state: TimelineState;
  label: string;
  detail: string | null;
};

/** truck_faults: code, description, severity, raised_at, cleared_at (null = open). */
export type TruckFault = {
  code: string;
  description: string;
  severity: FaultSeverity;
  raisedAt: string;
  clearedAt: string | null;
};

/**
 * One trip of this van: hub → one store → hub (TruckTrips, a deliveries row). The band counts them, the season
 * chart draws one bar a day from them, the Trips list shows each, and an open row lays out its steps and load.
 */
export type TruckTrip = {
  /* Which and when. deliveries: trip_id, local_date (the hub's date), days_ago, wave (1 morning, 2 midday). */
  tripId: string;
  localDate: string;
  daysAgo: number;
  wave: number;
  /* Where to. deliveries: store_id, store_name, city_name. */
  storeId: number;
  storeName: string;
  cityName: string;
  /* How far. deliveries: km_total (the whole run, there and back), km_done (of it so far). */
  kmTotal: number;
  kmDone: number;
  /*
   * How it went. deliveries: status, is_delivered (reached the store), is_on_time (arrived under 15 minutes after
   * plan), is_late (15 minutes or more; an estimate while on the way), late_minutes + delay_cause + delay_note (as `late`).
   */
  status: TripStatus;
  isDelivered: boolean;
  isOnTime: boolean;
  isLate: boolean;
  late: LateInfo;
  /*
   * Times, null until they happen. deliveries: planned_depart_at, departed_at, planned_arrive_at, arrived_at,
   * eta_at (the estimate while on the way, the arrival after), unloaded_at, returned_at.
   */
  plannedDepartAt: string | null;
  departedAt: string | null;
  plannedArriveAt: string | null;
  arrivedAt: string | null;
  etaAt: string | null;
  unloadedAt: string | null;
  returnedAt: string | null;
  /*
   * The load. deliveries: units_total, carving_units / cooking_units / mini_units (as `varieties`), damaged_units,
   * bins, capacity_bins, kg, cargo_value_usd (at list price), delivery_cost_usd.
   */
  units: number;
  varieties: Record<Variety, number>;
  damaged: number;
  bins: number;
  capacityBins: number;
  kg: number;
  valueUsd: number;
  costUsd: number;
};

/**
 * Stock at the store the load is for. store_now where store_id = fleet_now.dest_store_id: stock_status,
 * out_variety or low_variety (as `variety`), out_since. loadCoverDays = that variety's units aboard
 * (units_aboard when nothing is short) ÷ the store's average daily units_requested over days_ago 1–7
 * (daily_store_sales); null leaves the phrase out.
 */
export type DestinationStock = {
  status: StockStatus;
  variety: Variety | null;
  since: string | null;
  loadCoverDays: number | null;
};

/**
 * The page's own state. `period` stands in for the top bar's switch in the static preview only
 * (`--state '{"period":"season"}'`); the app passes the `period` prop. `openTrip` is the trip_id of the open row
 * (null: none); left out, the trip under way opens.
 */
type TruckState = { showCleared: boolean; lateOnly: boolean; openTrip: string | null; period: TruckPeriod };
export type TruckPageProps = PageProps<TruckViewModel, TruckState> & {
  /** The top bar's time switch (Season included): the band's figures and the trips listed. Default `initial.period`, else "today". */
  period?: TruckPeriod;
  /** Re-runs the failed queries; error states show a Retry button when it is given. */
  onRetry?: () => void;
};

/* ── Rules and labels ────────────────────────────────────── */

const STATUS_WORD: Record<TruckStatus, string> = {
  at_hub: "At hub", loading: "Loading", driving: "Driving", stopped: "Stopped", unloading: "Unloading", returning: "Returning", workshop: "In workshop",
};
const SERVICE_TAG: Record<ServiceStatus, { tone: TagTone; label: string } | null> = {
  ok: null,
  due_soon: { tone: "low", label: "Service due soon" },
  overdue: { tone: "severe", label: "Service overdue" },
  in_workshop: { tone: "neutral", label: "In workshop" },
};
/** Coolant runs normally under this. */
const COOLANT_MAX_C = 95;
/** Pumpkins travel at 10–15 °C; the little scale under the reading runs from 5 to 20. */
const CARGO_BAND_C = { lo: 10, hi: 15, min: 5, max: 20 };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** The long meter bar (service): plum in light, the muted plum-hill in dark (truck.css). */
const BAR = "var(--pd-truck-bar)";

/* ── Page ────────────────────────────────────────────────── */

export function TruckPage({ vm, clock, initial, refreshing, onRetry, period: picked }: TruckPageProps) {
  const [showCleared, setShowCleared] = useState(initial?.showCleared ?? false);
  const [lateOnly, setLateOnly] = useState(initial?.lateOnly ?? false);
  // undefined until a row is clicked: the trip under way stays open, whichever it is as the data moves on.
  const [openTrip, setOpenTrip] = useState<string | null | undefined>(initial?.openTrip);
  const { truck, timeline, faults, trips, destination, errors } = vm;
  const now = clock?.now;
  const yours = useViewerZone();
  const period = picked ?? initial?.period ?? "today";
  const back = { to: routes.fleet(), backLabel: "Harvest & fleet" };

  // Without its fleet_now row there is nothing to lay out: one message under the title.
  if (truck === null || (!truck && errors?.truck)) return <>
    <BackTitle {...back} title="Van"/>
    {truck === null
      ? <PanelState state="empty" message="No van with this id"/>
      : <PanelState state="error" message={errors?.truck} onRetry={onRetry}/>}
  </>;

  const tz = truck?.tz ?? "UTC";
  const today = truck ? vanToday(now, tz, trips) : null;
  const halloween = today ? halloweenOf(today, clock) : null;
  const open = openTrip === undefined ? trips?.find(isUnderWay)?.tripId ?? null : openTrip;

  return <>
    <BackTitle {...back} title={truck?.label ?? "Van"} chip={truck && <TitleChip truck={truck}/>}
      meta={truck && [truck.makeModel, truck.body, truck.plate, truck.driverName, truck.lastPingAt && now && `last ping ${ago(truck.lastPingAt, now)}`]}/>
    <TruckBand truck={truck} trips={trips} timeline={timeline} faults={faults} period={period} place={{ tz, now, yours, openHours: 12 }}
      error={errors?.trips} busy={refreshing}/>
    <SeasonChart trips={trips} faults={faults} tz={tz} today={today} halloween={halloween} period={period}
      error={errors?.trips} onRetry={onRetry} busy={refreshing}/>
    <div className="pd-truck-cols"><div className="pd-truck-split">
      <div className="pd-truck-main">
        <TripsPanel truck={truck} trips={trips} timeline={timeline} destination={destination} period={period} today={today} now={now}
          open={open} onOpen={setOpenTrip} lateOnly={lateOnly} onLateOnly={() => setLateOnly(v => !v)}
          error={errors?.trips} onRetry={onRetry} busy={refreshing}/>
      </div>
      <div className="pd-stack">
        <HealthPanel truck={truck} faults={faults} now={now} busy={refreshing} error={errors?.faults} onRetry={onRetry} showCleared={showCleared} onToggleCleared={() => setShowCleared(v => !v)}/>
        <ReadingsPanel truck={truck} busy={refreshing}/>
      </div>
    </div></div>
  </>;
}

/** Next to the title: how late the delivery is, or where the van is when it is not delivering. */
function TitleChip({ truck }: { truck: TruckNow }) {
  if (truck.status === "workshop") return <Tag tone="neutral" size="lg">In workshop</Tag>;
  if (truck.status === "at_hub" || !truck.trip) return <Tag tone="stone" size="lg">At hub</Tag>;
  if (truck.status === "returning") return <StatusChip status="delivered" size="lg"/>;
  return <StatusChip status={lateStatus(truck.trip.late)} minutes={truck.trip.late.minutes} size="lg"/>;
}

type PanelBase = { truck?: TruckNow; busy?: boolean };
type Retry = { error?: string; onRetry?: () => void };

/* ── Vehicle health ──────────────────────────────────────── */

function HealthPanel({ truck, faults, now, busy, error, onRetry, showCleared, onToggleCleared }: PanelBase & Retry & { faults?: TruckFault[]; now?: string; showCleared: boolean; onToggleCleared: () => void }) {
  if (!truck) return <Panel title="Vehicle health"><PanelState state="loading" rows={5} minHeight={300}/></Panel>;
  const { service, tz } = truck;
  const tag = SERVICE_TAG[service.status];
  const over = Math.max(0, -service.kmToService);
  // The track runs a quarter past the interval, so an overdue van shows how far past it is.
  const scale = Math.max(service.intervalKm * 1.25, service.kmSinceService, 1);
  const open = faults?.filter(f => !f.clearedAt) ?? [];
  const cleared = faults?.filter(f => f.clearedAt) ?? [];

  return <Panel title="Vehicle health" aside={tag && <Tag tone={tag.tone}>{tag.label}</Tag>} className="pd-truck-health" busy={busy}>
    <div>
      <div className="pd-label">{over > 0 ? "Overdue by" : "Next service in"}</div>
      <div className={`pd-num pd-truck-num${over > 0 ? " is-alert" : ""}`}>{int(over > 0 ? over : service.kmToService)} <small className="pd-unit">km</small></div>
    </div>
    <div className="pd-truck-service">
      <Meter tick={service.intervalKm / scale} aria-label={`${int(service.kmSinceService)} of ${km(service.intervalKm)} since service`}
        segments={[{ value: Math.min(service.kmSinceService, service.intervalKm) / scale, color: BAR }, { value: over / scale, color: palette.severe }]}/>
      <div className="pd-truck-service-key">
        <span>{int(service.kmSinceService)} of {km(service.intervalKm)} since service</span>
        <span><i/>Interval</span>
      </div>
    </div>
    <Facts items={[
      { label: "Odometer", value: km(service.odometerKm) },
      { label: "Last service", value: service.lastServiceOn ? `${dateLabel(localDate(service.lastServiceOn))}${service.lastServiceKm != null ? ` at ${km(service.lastServiceKm)}` : ""}` : "—" },
      { label: "Booked", value: service.bookedOn ? dayLabel(localDate(service.bookedOn)) : "Not booked" },
    ]}/>
    <div className="pd-truck-faults">
      <div className="pd-label">Open faults</div>
      {error ? <PanelState state="error" message={error} onRetry={onRetry}/>
        : !faults ? <PanelState state="loading" rows={2}/>
        : <>
          {open.length === 0 && <PanelState state="empty" message="None"/>}
          {open.map(f => <Fault key={f.code + f.raisedAt} tone="problem" label={f.description} meta={`${f.code} · ${f.severity} · since ${whenLabel(f.raisedAt, now, tz)}`}/>)}
          {cleared.length > 0 && <Pill pressed={showCleared} onClick={onToggleCleared}>Cleared faults ({cleared.length})</Pill>}
          {showCleared && cleared.map(f => <Fault key={f.code + f.raisedAt} tone="ok" label={f.description} meta={`Cleared ${whenLabel(f.clearedAt!, now, tz)}`}/>)}
        </>}
    </div>
  </Panel>;
}

function Fault({ tone, label, meta }: { tone: "problem" | "ok"; label: string; meta: string }) {
  return <div className={`pd-notice is-${tone} pd-truck-fault`}>
    <Icon name={tone === "ok" ? "check" : "alert"} strokeWidth={tone === "ok" ? 2.2 : 1.9}/>
    <div><strong>{label}</strong><span>{meta}</span></div>
  </div>;
}

/* ── Readings ────────────────────────────────────────────── */

function ReadingsPanel({ truck, busy }: PanelBase) {
  if (!truck) return <Panel title="Readings"><PanelState state="loading" rows={3} minHeight={196}/></Panel>;
  const r = truck.readings;
  const band = CARGO_BAND_C;
  const onScale = (c: number) => clamp01((c - band.min) / (band.max - band.min));
  const cargoOff = r.cargoTempC != null && (r.cargoTempC < band.lo || r.cargoTempC > band.hi);

  return <Panel title="Readings" busy={busy}>
    <div className="pd-truck-readings">
      <Stat card="inset" size={21} label="Fuel" value={r.fuelPct != null ? pct(r.fuelPct / 100) : "—"} note={r.fuelRangeKm != null ? `≈ ${km(r.fuelRangeKm)}` : undefined}/>
      <Stat card="inset" size={21} label="Coolant" value={tempC(r.coolantC, 0)} tone={r.coolantC != null && r.coolantC > COOLANT_MAX_C ? "alert" : "default"} note={`Normal under ${COOLANT_MAX_C} °C`}/>
      <Stat card="inset" size={21} label="Cargo" value={tempC(r.cargoTempC)} tone={cargoOff ? "alert" : "default"}>
        {r.cargoTempC != null && <span className="pd-truck-band" aria-hidden="true">
          <i style={{ left: `${onScale(band.lo) * 100}%`, width: `${(onScale(band.hi) - onScale(band.lo)) * 100}%` }}/>
          <b style={{ left: `${onScale(r.cargoTempC) * 100}%` }}/>
        </span>}
        <span className="pd-stat-note">Band {band.lo}–{band.hi} °C</span>
      </Stat>
      <Stat card="inset" size={21} label="Speed" value={r.speedKmh != null ? <>{int(r.speedKmh)} <small className="pd-unit">km/h</small></> : "—"} note={STATUS_WORD[truck.status]}/>
    </div>
  </Panel>;
}
