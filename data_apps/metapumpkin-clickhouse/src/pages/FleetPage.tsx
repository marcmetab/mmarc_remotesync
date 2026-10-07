import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import "./fleet.css";
import { FleetScene, type FleetSceneLive, SCENE_WIDTH, ZONES } from "../components/fleet/FleetScene";
import { useBarAccessory } from "../components/TabBar";
import { cityLabel, hubWhere, VanYard } from "../components/fleet/VanYard";
import { ClearChip, DeltaText, HubGlyph, Icon, Legend, type LegendItem, Meter, type Option, Panel, PanelState, Pill, RowLink, Segmented, StatusChip, Swatch, Tag } from "../components/ui";
import { bothTimes, dayLabel, int, km, num, pct, plural, share, signedPts, tempC, time, timeTz } from "../format";
import { useViewerZone } from "../viewer";
import { routes } from "../routes";
import { palette } from "../theme";
import { type CountryCode, DELAY_CAUSE_LABEL, type DelayCause, type FaultSeverity, type HarvestStatus, type LateInfo, lateStatus, type PageProps, type RegionCode, scopeLabel, type ServiceStatus, type TruckStatus } from "../types";

/*
 * Harvest & fleet (/fleet): where every van is right now. At the top, in place of the page banner (Shell skips it
 * here), the harvest stages: an illustrated scene of the season's road (components/fleet/FleetScene.tsx) with five
 * columns under it, lined up with its places, that filter the page by stage. Then the filter row, which also
 * switches the view. By hub: one card per hub with a tile per city and a dot per van, the van list of the open
 * city, and a rail: late now, maintenance, cargo temperature, on time over 7 days. All vans: the yard, a tile per
 * van under each hub (components/fleet/VanYard.tsx), full width. Presentational: the view model comes in through
 * props (src/data/useFleetData.ts live, fixtures/fleet.ts in the static preview). Styles: fleet.css.
 */

/* ── View model ──────────────────────────────────────────── */

/** A van heading to a store: on the road or unloading there. One dot in its city's tile, one row in the open list. */
export type FleetVan = {
  /** fleet_now: truck_id, truck_label, driver_name */
  truckId: string;
  label: string;
  driver: string;
  /** fleet_now.status. Only driving and stopped (on the road) and unloading (at the store) belong here. */
  status: "driving" | "stopped" | "unloading";
  /** fleet_now: dest_store_name, units_aboard */
  store: string;
  units: number;
  /** fleet_now: eta_at (the arrival time once the van is unloading), planned_arrive_at, progress_pct (0 to 100) */
  etaAt: string;
  plannedAt: string;
  progressPct: number;
  /** fleet_now: late_minutes, delay_cause, delay_note */
  late: LateInfo;
};

/** A city a hub serves, with the vans heading there (fleet_now.dest_city_key). Empty `vans` = "No van en route". */
export type FleetCity = {
  /** cities: city_key, city_name (every city of the hub, in the order to show them) */
  cityKey: string;
  name: string;
  vans: FleetVan[];
};

export type FleetHub = {
  /** hub_now: hub_id, hub_name, country_code, country_name, region_code, tz */
  hubId: string;
  name: string;
  countryCode: CountryCode;
  country: string;
  regionCode: RegionCode;
  tz: string;
  /** hub_now: harvest_status, harvest_note, fields_picking */
  harvestStatus: HarvestStatus;
  harvestNote: string;
  fieldsPicking: number;
  /**
   * hub_now: bins_today, plan_bins_today. Before the first pick of the hub's day (harvest_status
   * 'not_started') these are yesterday's and `binsDay` says so: harvest_daily where days_ago = 1,
   * sum(bins), sum(plan_bins) over the hub's fields.
   */
  bins: number;
  planBins: number;
  binsDay: "today" | "yesterday";
  /** hub_now: hub_stock_days, vans_at_hub (idle), vans_loading, vans_returning */
  stockDays: number;
  vansAtHub: number;
  vansLoading: number;
  vansReturning: number;
  /** fleet_now where hub_id = this hub and status = 'workshop': fleet_no (hub_now.vans_workshop is their count) */
  workshop: number[];
  /** fleet_now.truck_label of the same vans ("Express 119"), when known: the stage card writes the first in full. */
  workshopLabels?: string[];
  /**
   * hub_now: next_wave_at, shown when no van is heading out. `first`: no trip of this hub has that local
   * date yet (deliveries: hub_id, local_date), so it is the first wave of the day. `later`: the wave is on
   * a later local day than the clock (after the evening, or a closed Sunday), so its weekday is shown.
   */
  nextWave: { at: string; first: boolean; later?: boolean } | null;
  cities: FleetCity[];
};

/** A van that needs the workshop: fleet_now where service_status <> 'ok'. */
export type FleetServiceRow = {
  /** fleet_now: truck_id, truck_label, hub_name */
  truckId: string;
  label: string;
  hubName: string;
  /** fleet_now: service_status, km_to_service (negative = overdue) */
  status: Exclude<ServiceStatus, "ok">;
  kmToService: number;
};

/** A loaded van whose cargo is outside the band: fleet_now where units_aboard > 0 and cargo_temp_c is not within CARGO_BAND_C. */
export type FleetCargoRow = {
  /** fleet_now: truck_id, truck_label, hub_name, dest_store_name, cargo_temp_c */
  truckId: string;
  label: string;
  hubName: string;
  store: string | null;
  cargoTempC: number;
};

/** A van in the yard ("All vans"): every van of the hubs in scope, whatever it is doing. One fleet_now row. */
export type FleetYardVan = {
  /** fleet_now: truck_id, truck_label, fleet_no, driver_name, hub_id */
  truckId: string;
  label: string;
  fleetNo: number;
  driver: string;
  hubId: string;
  /** fleet_now.status: on a trip (driving, stopped, unloading), at the hub (at_hub, loading), returning or in the workshop. */
  status: TruckStatus;
  /** fleet_now: dest_store_name, dest_city_name (null when the van has no trip: at the hub, returning, workshop) */
  store: string | null;
  city: string | null;
  /** fleet_now: eta_at (the arrival time once the van is unloading), progress_pct (0 to 100) */
  etaAt: string | null;
  progressPct: number;
  /** fleet_now.units_aboard */
  units: number;
  /** fleet_now: late_minutes, delay_cause, delay_note (no minutes when the van has no trip) */
  late: LateInfo;
  /** fleet_now: service_status, km_to_service (negative = overdue) */
  service: ServiceStatus;
  kmToService: number;
  /** fleet_now: open_fault_desc, open_fault_severity. null when no fault is open. */
  fault: { desc: string; severity: FaultSeverity | null } | null;
  /**
   * VanSeason (deliveries by truck_id): count(*), sum(is_delivered), sum(is_on_time); zeros for a van with no trip yet.
   * Undefined while that query loads, or when it failed: the hover card then has no season line.
   */
  season?: { trips: number; delivered: number; onTime: number };
};

export type FleetOnTime = {
  /** deliveries where is_delivered = 1 and days_ago between 0 and 6: count(*), sum(is_on_time) */
  stops: number;
  onTime: number;
  /** The same over days_ago 7 to 13, for the change in points. null when there is no earlier week. */
  prevStops: number | null;
  prevOnTime: number | null;
  /** The late stops of the 7 days (is_on_time = 0) by deliveries.delay_cause: count(*) */
  lateByCause: { cause: DelayCause | null; stops: number }[];
};

/** Each part is undefined while its query loads; `errors` names the parts whose query failed. */
export type FleetViewModel = {
  /** hub_now + cities + fleet_now, one entry per hub in scope. Feeds the stage cards, the hub cards and "Late now". */
  hubs?: FleetHub[];
  /** fleet_now, every van in scope in fleet-number order, with VanSeason: the yard ("All vans"). */
  vans?: FleetYardVan[];
  /** fleet_now (service_status, km_to_service) */
  maintenance?: FleetServiceRow[];
  /** fleet_now (cargo_temp_c) */
  cargo?: FleetCargoRow[];
  /** deliveries, last 14 days */
  onTime?: FleetOnTime;
  errors?: Partial<Record<"hubs" | "vans" | "maintenance" | "cargo" | "onTime", string>>;
};

/** The band pumpkins travel in. Not a contract column yet: the mapper filters `cargo` with it. */
export const CARGO_BAND_C = { min: 10, max: 15 };

export type FleetStage = "picking" | "hubs" | "road" | "unload" | "workshop";
/** "By hub": the hub cards and the rail. "All vans": the yard, a tile per van. */
export type FleetView = "hubs" | "vans";
/**
 * The page's own state. `openCity` is a cities.city_key; null = every list closed; left out = the city with the most
 * late vans. `peek` is a fleet_now.truck_id whose hover card shows from the start in the yard (the static preview).
 */
export type FleetState = { stage: FleetStage | null; lateOnly: boolean; openCity: string | null; view: FleetView; peek: string | null };

/* ── Helpers ─────────────────────────────────────────────── */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
const STAGES: { key: FleetStage; label: string }[] = [
  { key: "picking", label: "Picking" },
  { key: "hubs", label: "At hubs" },
  { key: "road", label: "On the road" },
  { key: "unload", label: "Unloading" },
  { key: "workshop", label: "Workshop" },
];
const stageLabel = (key: FleetStage) => STAGES.find(s => s.key === key)?.label ?? key;

const isLate = (van: FleetVan) => lateStatus(van.late) !== "on_schedule";
const onRoad = (van: FleetVan) => van.status !== "unloading";
type VanFilter = { stage: FleetStage | null; lateOnly: boolean };
/** "On the road" and "Unloading" narrow the vans; the other stages are about the hub, not its vans. */
const matches = (van: FleetVan, f: VanFilter) =>
  (f.stage === "road" ? onRoad(van) : f.stage === "unload" ? !onRoad(van) : true) && (!f.lateOnly || isLate(van));
const isHubStage = (stage: FleetStage | null) => stage === "picking" || stage === "hubs" || stage === "workshop";

/** "Lancaster hub" → "Lancaster", for rows that already sit under a fleet heading. */
const hubShort = (name: string) => name.replace(/\s+hub$/i, "");

/** The city to open first: the one with the most late vans (ties: the longest delay). None when nothing is late. */
function worstCity(hubs: FleetHub[] | undefined): string | null {
  let best: { key: string; late: number; minutes: number } | null = null;
  for (const hub of hubs ?? []) for (const city of hub.cities) {
    const late = city.vans.filter(isLate);
    if (!late.length) continue;
    const minutes = Math.max(...late.map(v => v.late.minutes));
    if (!best || late.length > best.late || (late.length === best.late && minutes > best.minutes)) best = { key: city.cityKey, late: late.length, minutes };
  }
  return best?.key ?? null;
}

/* ── Harvest stages: the scene, and five columns under it (a filter) ── */

/** The stage icons of the artboard: a leaf, the hub, a truck, a parcel, a wrench (24-unit strokes, like ui.tsx's). */
const STAGE_GLYPH: Record<FleetStage, ReactNode> = {
  picking: <path d="M5 19c8 0 14-6 14-14C11 5 5 11 5 19zm0 0 8-8"/>,
  hubs: <path d="M3 21V9l9-5 9 5v12M8 21v-7h8v7M8 17h8"/>,
  road: <><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="16" cy="17.5" r="1.8"/></>,
  unload: <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3zm0 0v18M3 7.5l9 4.5 9-4.5"/>,
  workshop: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>,
};
const StageGlyph = ({ stage }: { stage: FleetStage }) =>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{STAGE_GLYPH[stage]}</svg>;

/** Vans with nothing to watch (idle at a hub, on their way back, due for service later): the quiet bar part (fleet.css). */
const QUIET = "var(--pd-fleet-quiet)";
type Part = { value: number; color: string };

/** What one column shows. `status` undefined: its own query is still loading (the workshop's service list). */
type StageColumn = {
  value: number;
  unit: string;
  detail: ReactNode;
  /** Above zero: the "N late" badge in the head instead of the chevron. */
  late: number;
  /** A share of the track (bins against the plan), or parts that fill it. */
  bar: { share: number | null; color: string } | Part[];
  status?: ReactNode;
  /** The status is a problem: terracotta. */
  alert?: boolean;
};

/**
 * The five columns from the hubs in scope (and the service list, for the workshop's status). Picking: fields picking
 * and bins against the plan, today's (the hubs that have started their day) or, before the first pick of every
 * hub's day, yesterday's. At hubs: vans loading
 * and idle. On the road: vans delivering (on time and late) and returning. Unloading: vans at a store. Workshop: the
 * vans in it, then the service list's overdue and due-soon vans.
 */
function stageColumns(hubs: FleetHub[], service: FleetServiceRow[] | undefined, serviceError: string | undefined, viewer: string): Record<FleetStage, StageColumn> {
  const sum = (pick: (hub: FleetHub) => number, of = hubs) => of.reduce((total, hub) => total + pick(hub), 0);
  const cities = hubs.flatMap(h => h.cities);
  const vans = cities.flatMap(c => c.vans);
  const road = vans.filter(onRoad), unloading = vans.filter(v => !onRoad(v));
  const roadLate = road.filter(isLate).length, unloadLate = unloading.filter(isLate).length;
  const returning = sum(h => h.vansReturning), loading = sum(h => h.vansLoading), idle = sum(h => h.vansAtHub);
  // Bins of one day only: a hub that has not started yet holds yesterday's, which would pass for today's in a sum.
  const started = hubs.filter(h => h.binsDay === "today");
  const yesterday = hubs.length > 0 && started.length === 0;
  const binsOf = yesterday ? hubs : started;
  const fields = sum(h => h.fieldsPicking), bins = sum(h => h.bins, binsOf), plan = sum(h => h.planBins, binsOf);
  // A store, not a store name: two cities may each have one called the same.
  const stores = new Set(cities.flatMap(c => c.vans.filter(v => !onRoad(v)).map(v => `${c.cityKey}|${v.store}`))).size;
  const shop = hubs.flatMap(h => h.workshop);
  // "Express 214 · 311 · 407": the first van's label in full, then fleet numbers.
  const shopPrefix = hubs.flatMap(h => h.workshopLabels ?? [])[0]?.match(/^(.*?)\s*\d+$/)?.[1];
  const overdue = service?.filter(r => r.status === "overdue").length ?? 0, dueSoon = service?.filter(r => r.status === "due_soon").length ?? 0;
  const parts = (list: Part[]) => list.filter(p => p.value > 0);
  const b = (n: number) => <strong>{int(n)}</strong>;
  const vansUnit = (n: number) => n === 1 ? "van" : "vans";

  // No van loading anywhere: the earliest wave a hub waits for, on the hub's clock and the viewer's.
  const wave = hubs.filter(h => h.nextWave).sort((x, y) => Date.parse(x.nextWave!.at) - Date.parse(y.nextWave!.at))[0];
  const waveLine = wave?.nextWave && `${wave.nextWave.first ? "First" : "Next"} wave ${wave.nextWave.later ? `${dayLabel(wave.nextWave.at, wave.tz).split(" ")[0]} ` : ""}${bothTimes(wave.nextWave.at, wave.tz, viewer)}${hubs.length > 1 ? ` · ${hubShort(wave.name)}` : ""}`;

  return {
    picking: {
      value: fields, unit: fields === 1 ? "field" : "fields",
      detail: <>{b(bins)} of {int(plan)} bins picked</>, late: 0,
      bar: { share: share(bins, plan), color: palette.leaf },
      status: plan > 0 ? `${pct(share(bins, plan))} of ${yesterday ? "yesterday's" : "today's"} plan` : `No plan ${yesterday ? "yesterday" : "today"}`,
    },
    hubs: {
      value: loading + idle, unit: vansUnit(loading + idle),
      detail: <>{b(loading)} loading · {b(idle)} idle</>, late: 0,
      bar: parts([{ value: loading, color: palette.pumpkin }, { value: idle, color: QUIET }]),
      status: loading > 0 ? `${int(loading)} loading now` : waveLine || (idle > 0 ? "Ready for the next run" : "Every van is out"),
    },
    road: {
      value: road.length + returning, unit: vansUnit(road.length + returning),
      detail: <>{b(road.length)} delivering · {b(returning)} returning</>, late: roadLate,
      bar: parts([{ value: road.length - roadLate, color: palette.candle }, { value: returning, color: QUIET }, { value: roadLate, color: palette.terracotta }]),
      status: roadLate > 0 ? `${int(roadLate)} running late` : road.length > 0 ? "All on time" : returning > 0 ? "All on their way back" : "No van on the road",
      alert: roadLate > 0,
    },
    unload: {
      value: unloading.length, unit: vansUnit(unloading.length),
      detail: unloading.length ? <>at {b(stores)} {stores === 1 ? "store" : "stores"} now</> : "No van at a store",
      late: unloadLate,
      bar: parts([{ value: unloading.length - unloadLate, color: palette.candle }, { value: unloadLate, color: palette.terracotta }]),
      status: unloadLate > 0 ? `${int(unloadLate)} behind schedule` : unloading.length > 0 ? "All on time" : "Nothing to unload",
      alert: unloadLate > 0,
    },
    workshop: {
      value: shop.length, unit: vansUnit(shop.length),
      detail: shop.length
        ? <>{shopPrefix && <span className="pd-fleet-stage-prefix">{shopPrefix} </span>}{shop.slice(0, 3).map((no, i) => <Fragment key={i}>{i > 0 && " · "}{b(no)}</Fragment>)}{shop.length > 3 && ` · +${shop.length - 3}`}</>
        : "None in the workshop",
      late: 0,
      // The service queue: vans in the workshop, overdue (terracotta), due soon (quiet).
      bar: parts([{ value: shop.length, color: palette.plumHill }, { value: overdue, color: palette.terracotta }, { value: dueSoon, color: QUIET }]),
      status: serviceError ? "—" : !service ? undefined : overdue > 0 ? `${int(overdue)} overdue for service` : dueSoon > 0 ? `${int(dueSoon)} due for service soon` : "No service due",
      alert: overdue > 0 && !serviceError,
    },
  };
}
/** A failed hubs query: a dash for the numeral, an empty bar, nothing else (the hub list below says what failed). */
const ERROR_COLUMN: StageColumn = { value: NaN, unit: "", detail: " ", late: 0, bar: [], status: " " };

/** What the scene draws: only the activity the data has. Undefined while the hubs load (or failed): the whole scene plays. */
function sceneLive(hubs: FleetHub[] | undefined): FleetSceneLive | undefined {
  if (!hubs) return undefined;
  const vans = hubs.flatMap(h => h.cities.flatMap(c => c.vans));
  const unloading = vans.filter(v => !onRoad(v));
  const loading = hubs.some(h => h.vansLoading > 0);
  return {
    picking: hubs.some(h => h.fieldsPicking > 0), loading, parked: loading || hubs.some(h => h.vansAtHub > 0),
    delivering: vans.filter(onRoad).length, returning: hubs.reduce((total, h) => total + h.vansReturning, 0),
    unloading: unloading.length > 0, lateUnloading: unloading.some(isLate), workshop: hubs.some(h => h.workshop.length > 0),
  };
}

/** One column: icon and stage name (a late badge, else a chevron), the numeral and its unit, a detail line, a thin bar, a status line. */
function StageButton({ stage, label, column: c, pressed, onClick }: { stage: FleetStage; label: string; column: StageColumn | undefined; pressed: boolean; onClick: () => void }) {
  const bar = !c ? <Meter value={0} height={5}/>
    : !Array.isArray(c.bar) ? <Meter value={Math.min(1, c.bar.share ?? 0)} color={c.bar.color} height={5}/>
    : c.bar.length ? <Meter segments={c.bar} gap={2} height={5}/> : <Meter value={0} height={5}/>;
  return <button type="button" className="pd-fleet-stage" aria-pressed={pressed} onClick={onClick}>
    <span className="pd-fleet-stage-head">
      <span className="pd-fleet-stage-name"><StageGlyph stage={stage}/><span>{label}</span></span>
      {c && c.late > 0 ? <Tag tone="warn" size="sm">{int(c.late)} late</Tag> : <Icon name="chevronRight" size={14} strokeWidth={2}/>}
    </span>
    <span className="pd-fleet-stage-value"><span className="pd-num">{c ? int(c.value) : "—"}</span>{c?.unit && <span className="pd-fleet-stage-unit">{c.unit}</span>}</span>
    <span className="pd-fleet-stage-detail">{c ? c.detail : <span className="pd-skeleton"/>}</span>
    <span className="pd-fleet-stage-bar">{bar}</span>
    <span className={cx("pd-fleet-stage-status", c?.alert && "is-alert")}>{c?.status !== undefined ? c.status : <span className="pd-skeleton"/>}</span>
  </button>;
}

/**
 * The top of the page, in place of a banner: the scene across the card, five columns under it lined up with its zones.
 * A column toggles the page's stage filter; the scene is never dimmed or tinted. While the hubs load the columns show
 * skeletons and the whole scene plays; if they failed, dashes (the hub list below says why).
 */
function HarvestStages({ hubs, error, service, serviceError, stage, onStage, busy }: {
  hubs: FleetHub[] | undefined; error?: string; service: FleetServiceRow[] | undefined; serviceError?: string;
  stage: FleetStage | null; onStage: (stage: FleetStage | null) => void; busy?: boolean;
}) {
  const viewer = useViewerZone();
  const columns = hubs && !error ? stageColumns(hubs, service, serviceError, viewer) : undefined;
  // On a phone the scene scrolls sideways in its box: bring the picked stage's zone to the middle.
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!stage || !el || el.scrollWidth <= el.clientWidth) return;
    const [a, b] = ZONES[stage];
    el.scrollTo({ left: (a + b) / 2 / SCENE_WIDTH * el.scrollWidth - el.clientWidth / 2 });
  }, [stage]);
  return <section aria-label="Harvest stages" aria-busy={busy || undefined} className="pd-fleet-stages">
    {/* Out of the Tab order: on a phone this box scrolls, which makes it focusable, but its art is aria-hidden and the columns scroll it. */}
    <div className="pd-fleet-stages-art" ref={box} tabIndex={-1}><FleetScene live={error ? undefined : sceneLive(hubs)}/></div>
    <div role="group" aria-label="Filter by stage" className={cx("pd-fleet-stages-cols", busy && "pd-busy")}>
      {STAGES.map(s => <StageButton key={s.key} stage={s.key} label={s.label} column={error ? ERROR_COLUMN : columns?.[s.key]}
        pressed={stage === s.key} onClick={() => onStage(stage === s.key ? null : s.key)}/>)}
    </div>
  </section>;
}

/* ── Hub card: header, harvest line, city tiles, the open city's vans ── */

function VanRow({ van, tz }: { van: FleetVan; tz: string }) {
  const status = lateStatus(van.late);
  const yours = useViewerZone();
  const at = `${Math.max(0, Math.min(100, van.progressPct))}%`;
  return <RowLink to={routes.truck(van.truckId)} pad={11} line="row" className="pd-fleet-van">
    <span className="pd-fleet-van-who"><strong>{van.label}</strong><span>{van.driver}</span></span>
    <span className="pd-fleet-van-trip">
      <span className="pd-fleet-van-line">
        <span>{van.store}</span>
        <span><strong>{onRoad(van) ? "ETA" : "Arrived"} {bothTimes(van.etaAt, tz, yours)}</strong> · planned {bothTimes(van.plannedAt, tz, yours)}</span>
      </span>
      <span className={cx("pd-fleet-progress", status !== "on_schedule" && "is-late")} aria-hidden="true"><i style={{ width: at }}/><b style={{ left: at }}/></span>
    </span>
    <span className="pd-fleet-van-state">
      <span className="pd-fleet-van-load">
        <span className="pd-fleet-van-units">{plural(van.units, "pumpkin")}</span>
        <span className="pd-fleet-van-chip"><StatusChip status={status} minutes={van.late.minutes}/></span>
      </span>
      {van.late.note && <span className="pd-fleet-cause">{van.late.note}</span>}
    </span>
  </RowLink>;
}

function CityTile({ city, label, filter, open, onToggle }: { city: FleetCity; label: string; filter: VanFilter; open: boolean; onToggle: () => void }) {
  const n = city.vans.length;
  const lateN = city.vans.filter(isLate).length;
  const dimAll = isHubStage(filter.stage);
  const summary = n === 0 ? "no vans on the way" : `${plural(n, "van")} on the way, ${lateN ? `${lateN} late` : "all on time"}`;
  return <button type="button" className={cx("pd-fleet-tile", n === 0 ? "is-empty" : lateN > 0 && "is-late")} aria-expanded={open} aria-label={`${label}: ${summary}`} onClick={onToggle}>
    <span className="pd-fleet-tile-name">{label}</span>
    <span className="pd-fleet-dots">{city.vans.map(v => <i key={v.truckId} className={cx(isLate(v) && "is-late", (dimAll || !matches(v, filter)) && "is-dim")}/>)}</span>
    <span className="pd-fleet-tile-note">{n === 0 ? "No van en route" : lateN ? `${lateN} late` : "all on time"}</span>
  </button>;
}

function HubCard({ hub, now, filter, openKey, onOpen, busy }: { hub: FleetHub; now: string | undefined; filter: VanFilter; openKey: string | null; onOpen: (cityKey: string | null) => void; busy?: boolean }) {
  const vans = hub.cities.flatMap(c => c.vans);
  const lateN = vans.filter(isLate).length;
  const yours = useViewerZone();
  const where = hubWhere(hub, now, yours);
  const open = hub.cities.find(c => c.cityKey === openKey);
  const openLabel = open ? cityLabel(open.name, hub.countryCode) : "";
  const shown = open ? open.vans.filter(v => matches(v, filter)) : [];

  return <Panel as="article" label={hub.name} className="pd-fleet-hub" gap={12} busy={busy}>
    <div className="pd-fleet-hub-head">
      <div className="pd-fleet-hub-id">
        <span className="pd-fleet-disc"><HubGlyph/></span>
        <div><h2 className="pd-panel-title">{hub.name}</h2><div className="pd-fleet-where">{where}</div></div>
      </div>
      {vans.length > 0
        ? <span className="pd-fleet-hub-count"><strong className={lateN ? "pd-alert" : "pd-good"}>{lateN} late</strong> <span className="pd-muted">of {vans.length}</span></span>
        : hub.nextWave && <span className="pd-fleet-hub-wave">{hub.nextWave.first ? "First" : "Next"} wave {hub.nextWave.later ? `${dayLabel(hub.nextWave.at, hub.tz).split(" ")[0]} ` : ""}{bothTimes(hub.nextWave.at, hub.tz, yours)}</span>}
    </div>

    <div className="pd-fleet-facts">
      <span className={cx("pd-fleet-harvest", filter.stage === "picking" && "is-on")}>
        <Icon name="leaf" size={15} strokeWidth={1.8}/>{hub.harvestNote} · {int(hub.bins)} of {int(hub.planBins)} bins{hub.binsDay === "yesterday" && " yesterday"}
      </span>
      <span className={cx("pd-fleet-fact", filter.stage === "hubs" && "is-on")}>Hub stock {num(hub.stockDays, 1)} days</span>
      {hub.vansLoading > 0 && <span className={cx("pd-fleet-fact", filter.stage === "hubs" && "is-on")}>{int(hub.vansLoading)} loading</span>}
      {hub.workshop.length > 0 && <span className={cx("pd-fleet-fact", filter.stage === "workshop" && "is-on")}>Workshop {hub.workshop.join(", ")}</span>}
    </div>

    <div className="pd-fleet-tiles">
      {hub.cities.map(city => <CityTile key={city.cityKey} city={city} label={cityLabel(city.name, hub.countryCode)} filter={filter}
        open={city.cityKey === openKey} onToggle={() => onOpen(city.cityKey === openKey ? null : city.cityKey)}/>)}
    </div>

    {open && <div className="pd-fleet-open" aria-live="polite">
      <div className="pd-fleet-open-head">
        <strong>{openLabel} · {open.vans.length === 0 ? "No van en route" : shown.length < open.vans.length ? `${shown.length} of ${plural(open.vans.length, "van")}` : plural(open.vans.length, "van")}</strong>
        <button type="button" className="pd-fleet-close" aria-label={`Close the ${openLabel} list`} onClick={() => onOpen(null)}><Icon name="close" size={16} strokeWidth={2}/></button>
      </div>
      {shown.map(van => <VanRow key={van.truckId} van={van} tz={hub.tz}/>)}
    </div>}
  </Panel>;
}

/* ── Rail ────────────────────────────────────────────────── */

type PartProps = { error?: string; busy?: boolean };
const Count = ({ of }: { of: unknown[] | undefined }) => of ? <span className="pd-fleet-count">{of.length}</span> : null;
/** What a rail list shows instead of rows: an error, skeleton lines, or a short "None". */
function listState(rows: unknown[] | undefined, error: string | undefined, none = "None") {
  if (error) return <PanelState state="error" message={error}/>;
  if (!rows) return <PanelState state="loading" rows={3} minHeight={96}/>;
  return rows.length ? null : <PanelState state="empty" message={none} line/>;
}

function LateNow({ hubs, error, busy }: PartProps & { hubs: FleetHub[] | undefined }) {
  // Every late van in scope, the longest delay first. The stage and "Late only" filters do not narrow it.
  const rows = hubs?.flatMap(hub => hub.cities.flatMap(city => city.vans.filter(isLate).map(van => ({ van, to: `${van.store}, ${cityLabel(city.name, hub.countryCode)}` }))))
    .sort((a, b) => b.van.late.minutes - a.van.late.minutes);
  return <Panel title="Late now" aside={<Count of={rows}/>} pad="list" gap={12} busy={busy}>
    {listState(rows, error) ?? <div>
      {rows!.map(({ van, to }) => <RowLink key={van.truckId} to={routes.truck(van.truckId)} pad={10}>
        <span className="pd-fleet-late">
          <span className="pd-fleet-name"><strong>{van.label}</strong> <span className="pd-soft">· {to}</span></span>
          <span className="pd-fleet-why"><StatusChip status={lateStatus(van.late)} minutes={van.late.minutes}/>{van.late.note && <span className="pd-fleet-cause">{van.late.note}</span>}</span>
        </span>
      </RowLink>)}
    </div>}
  </Panel>;
}

const SERVICE_RANK: Record<FleetServiceRow["status"], number> = { overdue: 0, due_soon: 1, in_workshop: 2 };
function serviceTag(row: FleetServiceRow) {
  if (row.status === "overdue") return <Tag tone="severe">Overdue {km(Math.abs(row.kmToService))}</Tag>;
  if (row.status === "due_soon") return <Tag tone="low">Due in {km(row.kmToService)}</Tag>;
  return <Tag tone="neutral">In workshop</Tag>;
}
function Maintenance({ rows, error, busy }: PartProps & { rows: FleetServiceRow[] | undefined }) {
  // Overdue first (the furthest over on top), then due soon (the nearest first), then the vans already in the workshop.
  const sorted = rows && [...rows].sort((a, b) => SERVICE_RANK[a.status] - SERVICE_RANK[b.status] || (a.status === "in_workshop" ? 0 : a.kmToService - b.kmToService));
  return <Panel title="Maintenance" aside={<Count of={sorted}/>} pad="list" gap={12} busy={busy}>
    {listState(sorted, error) ?? <div>
      {sorted!.map(row => <RowLink key={row.truckId} to={routes.truck(row.truckId)} trailing={serviceTag(row)}>
        <span className="pd-fleet-name"><strong>{row.label}</strong> <span className="pd-muted">· {hubShort(row.hubName)}</span></span>
      </RowLink>)}
    </div>}
  </Panel>;
}

function CargoTemperature({ rows, error, busy }: PartProps & { rows: FleetCargoRow[] | undefined }) {
  return <Panel title="Cargo temperature" aside={<Count of={rows}/>} pad="list" gap={12} busy={busy}>
    {listState(rows, error, "All in band") ?? <div>
      {rows!.map(row => <RowLink key={row.truckId} to={routes.truck(row.truckId)} pad={9} trailing={<Tag tone="warn">{tempC(row.cargoTempC)}</Tag>}>
        <span className="pd-fleet-name">
          <strong>{row.label}</strong> <span className="pd-muted">· {hubShort(row.hubName)}</span>
          <span className="pd-fleet-sub">Band {CARGO_BAND_C.min}–{CARGO_BAND_C.max} °C{row.store && ` · to ${row.store}`}</span>
        </span>
      </RowLink>)}
    </div>}
  </Panel>;
}

/** Storm and late departure have page colours of their own (fleet.css): in dark, plum and rose are both pink. */
const CAUSE_COLOR: Record<DelayCause, string> = { traffic: palette.candle, breakdown: palette.severe, late_departure: "var(--pd-fleet-departure)", storm: "var(--pd-fleet-storm)", ventilation: palette.meadow };
function OnTime({ data, scopeName, error, busy }: PartProps & { data: FleetOnTime | undefined; scopeName: string }) {
  const body = () => {
    if (error) return <PanelState state="error" message={error}/>;
    if (!data) return <PanelState state="loading" chart minHeight={220}/>;
    const rate = share(data.onTime, data.stops);
    const prev = share(data.prevOnTime, data.prevStops);
    const causes = data.lateByCause.filter(c => c.stops > 0).sort((a, b) => b.stops - a.stops)
      .map(c => ({ ...c, label: c.cause ? DELAY_CAUSE_LABEL[c.cause] : "Other", color: c.cause ? CAUSE_COLOR[c.cause] : palette.faint }));
    const lateTotal = causes.reduce((total, c) => total + c.stops, 0);
    return <>
      <div className="pd-fleet-rate">
        <span className="pd-num">{pct(rate, 1)}</span>
        <span>{int(data.onTime)} of {int(data.stops)} stops{rate != null && prev != null && <> · <DeltaText value={rate - prev} text={signedPts(rate - prev)}/></>}</span>
      </div>
      <div className="pd-label pd-fleet-late-total">{int(data.stops - data.onTime)} late</div>
      {causes.length > 0 && <>
        <Meter segments={causes.map(c => ({ value: c.stops, color: c.color }))} gap={2}/>
        <div>
          {causes.map(c => <div className="pd-keyrow" key={c.label}>
            <Swatch color={c.color}/>
            <strong>{c.label}</strong>
            <span className="pd-fleet-key-share">{pct(share(c.stops, lateTotal))}</span>
            <strong className="pd-fleet-key-value">{int(c.stops)}</strong>
          </div>)}
        </div>
      </>}
    </>;
  };
  return <Panel id="late-deliveries" title="On time, 7 days" aside={<span className="pd-fleet-scope">{scopeName}</span>} className="pd-fleet-ontime" gap={12} busy={busy}>{body()}</Panel>;
}

/* ── Page ────────────────────────────────────────────────── */

const VIEWS: Option<FleetView>[] = [{ value: "hubs", label: "By hub" }, { value: "vans", label: "All vans" }];
/** The dots of the city tiles; the yard's vans (VanYard: olive, deep pumpkin, plum, muted wrench). */
const LEGEND: Record<FleetView, LegendItem[]> = {
  hubs: [{ label: "On time", color: palette.leaf, shape: "dot" }, { label: "Late", color: palette.pumpkinDeep, shape: "dot" }],
  vans: [
    { label: "On the road", color: palette.olive, shape: "dot" }, { label: "Late", color: palette.pumpkinDeep, shape: "dot" },
    { label: "At the hub", color: palette.plum, shape: "ring" }, { label: "Workshop", color: palette.muted, shape: "dot" },
  ],
};

export function FleetPage({ vm, scope, clock, initial, refreshing }: PageProps<FleetViewModel, FleetState>) {
  const { hubs, errors } = vm;
  const [view, setView] = useState<FleetView>(initial?.view === "vans" ? "vans" : "hubs");
  const [stage, setStage] = useState<FleetStage | null>(initial?.stage ?? null);
  const [lateOnly, setLateOnly] = useState(initial?.lateOnly ?? false);
  // undefined = not chosen yet: the most troubled city opens once the hubs arrive, and stays put through refreshes.
  const [openCity, setOpenCity] = useState<string | null | undefined>(initial?.openCity);
  const firstCity = worstCity(hubs);
  useEffect(() => { if (openCity === undefined && hubs) setOpenCity(firstCity); }, [openCity, hubs, firstCity]);
  const openKey = openCity === undefined ? firstCity : openCity;
  const filter: VanFilter = { stage, lateOnly };
  // The compact tab bar's line (phones): late vans first, else how many are out, as the On the road column counts them.
  const vans = hubs?.flatMap(h => h.cities.flatMap(c => c.vans)) ?? [];
  const lateNow = vans.filter(isLate).length;
  const out = vans.filter(onRoad).length + (hubs ?? []).reduce((total, h) => total + h.vansReturning, 0);
  useBarAccessory(!hubs || errors?.hubs ? null
    : lateNow > 0 ? { label: `${plural(lateNow, "van")} running late`, detail: `${int(out)} on the road`, tone: "alert" }
    : out > 0 ? { label: "All vans on time", detail: `${plural(out, "van")} on the road` }
    : { label: "No van on the road" });

  return <>
    <HarvestStages hubs={hubs} error={errors?.hubs} service={vm.maintenance} serviceError={errors?.maintenance} stage={stage} onStage={setStage} busy={refreshing}/>

    <div className="pd-fleet-filters">
      <div>
        <Segmented label="Show" options={VIEWS} value={view} onChange={setView}/>
        <Pill pressed={lateOnly} onClick={() => setLateOnly(!lateOnly)} mark>Late only</Pill>
        {stage && <ClearChip onClear={() => setStage(null)} clearLabel={`Clear stage filter: ${stageLabel(stage)}`}>{stageLabel(stage)}</ClearChip>}
      </div>
      <Legend className="pd-fleet-legend" items={LEGEND[view]}/>
    </div>

    {view === "vans" ? <VanYard hubs={hubs} vans={vm.vans} error={errors?.hubs ?? errors?.vans} filter={filter} now={clock?.now} busy={refreshing} peek={initial?.peek ?? null}/> : <div className="pd-split is-top">
      <div className="pd-split-main pd-fleet-col">
        {errors?.hubs ? <Panel className="pd-fleet-hub"><PanelState state="error" message={errors.hubs}/></Panel>
          : !hubs ? [0, 1, 2].map(i => <Panel key={i} className="pd-fleet-hub"><PanelState state="loading" rows={4} minHeight={168}/></Panel>)
          : hubs.length === 0 ? <Panel className="pd-fleet-hub"><PanelState state="empty" message="No hubs in this region"/></Panel>
          : hubs.map(hub => <HubCard key={hub.hubId} hub={hub} now={clock?.now} filter={filter} openKey={openKey} onOpen={setOpenCity} busy={refreshing}/>)}
      </div>
      <div className="pd-split-rail pd-fleet-col">
        <LateNow hubs={hubs} error={errors?.hubs} busy={refreshing}/>
        <Maintenance rows={vm.maintenance} error={errors?.maintenance} busy={refreshing}/>
        <CargoTemperature rows={vm.cargo} error={errors?.cargo} busy={refreshing}/>
        <OnTime data={vm.onTime} scopeName={scopeLabel(scope)} error={errors?.onTime} busy={refreshing}/>
      </div>
    </div>}
  </>;
}
