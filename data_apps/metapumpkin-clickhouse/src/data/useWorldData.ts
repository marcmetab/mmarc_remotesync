import { useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useCallback, useMemo, useRef } from "react";
import { Cities, FleetNow, HubNow, StoreNow } from "../../queries/live.query";
import type { WorldCity, WorldEvent, WorldEventTone, WorldHub, WorldStore, WorldVan, WorldViewModel } from "../pages/world/types";
import { type Clock, COUNTRIES, type CountryCode, type HarvestStatus, type StockStatus, type StoreFormat, type TruckStatus, VARIETIES, type Variety } from "../types";
import { bool, iso, type LivePage, n0, nOrNull, oneOf, POLL, sOrNull, useLive } from "./live";
import { lateOf } from "./useFleetData";

/*
 * The World tab: hub_now, fleet_now, store_now and cities, read whole (the map always shows the whole business;
 * the page scopes its counters). The vans poll every 10 s, the hubs and the stores every 20 s, the cities once.
 * No view lists what just happened: the Live activity feed is what changed between two readings, kept here for
 * as long as the page is open.
 */

/**
 * The map is about moving vans: fleet_now polls twice as often as on Harvest & fleet. hub_now does not: its van
 * counts only show until fleet_now is in (the map counts the vans themselves), and it reads fleet_now inside.
 */
const VANS_MS = 10_000;

const TRUCK_STATUS: readonly TruckStatus[] = ["at_hub", "loading", "driving", "stopped", "unloading", "returning", "workshop"];
/** On the way to a store: fleet_now has its destination. */
const HEADING = ["loading", "driving", "stopped", "unloading"] as const;
/** On a trip: from the loading dock to the way back. */
const ON_TRIP: readonly TruckStatus[] = [...HEADING, "returning"];
const HARVEST: readonly HarvestStatus[] = ["picking", "done", "not_started", "rain_stop"];
const STOCK: readonly StockStatus[] = ["out", "low", "ok"];
const FORMATS: readonly StoreFormat[] = ["flagship", "standard", "express"];
const isCountry = (v: unknown): v is CountryCode => COUNTRIES.some(c => c.code === v);
const variety = (v: unknown): Variety | null => oneOf(v, VARIETIES);
const tzOf = (v: unknown, cc: CountryCode) => sOrNull(v) ?? COUNTRIES.find(c => c.code === cc)!.tz;
const order = (cc: CountryCode) => COUNTRIES.findIndex(c => c.code === cc);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** hub_now.harvest_note while picking: "Picking Field 2, 5" → [2, 5]. */
const fieldsIn = (note: string) => (note.match(/\d+/g) ?? []).map(Number);

const useFleetRows = () => useMetabaseQuery(FleetNow);
const useStoreRows = () => useMetabaseQuery(StoreNow);
type FleetData = NonNullable<ReturnType<typeof useFleetRows>["data"]>;
type FleetRow = FleetData["rows"][number];
type StoreData = NonNullable<ReturnType<typeof useStoreRows>["data"]>;
type StoreRow = StoreData["rows"][number];

/* ── A returning van's road ──────────────────────────────── */

type LatLon = readonly [number, number];

/**
 * The hubs' coordinates (pumpkin_sim.hub, supabase/pumpkin_live/01_master.sql). No view returns them, and a
 * returning van's road is found from where it stands relative to its hub.
 */
const HUB_AT: Record<string, LatLon> = {
  "US-lancaster": [40.0379, -76.3055],
  "CA-guelph": [43.5448, -80.2482],
  "GB-bedford": [52.1364, -0.4667],
  "DE-brandenburg": [52.4125, 12.5316],
  "JP-chiba": [35.6073, 140.1063],
};

/** Where `p` lies from `o` on a flat map (equirectangular: longitude shrunk by cos(latitude)), in degrees. */
const offset = (o: LatLon, p: LatLon): [number, number] => [(p[1] - o[1]) * Math.cos(o[0] * Math.PI / 180), p[0] - o[0]];

type CityAt = { cityKey: string; hubId: string; at: LatLon };

/**
 * A returning van's city and how far along its road it is. fleet_now has no destination then, only the van's
 * position, on the straight line from the store it served back to the hub. The city is the one this page saw it
 * head to on the same trip (`known`), else the hub's city whose direction from the hub best matches the van's;
 * how far along is the van's distance from the hub over the city's. No position or no hub: at the hub end.
 *
 * "Best matches" is the smallest miss: how far from a city the van's direction passes at that city's distance.
 * A store sits a few km off its city's centre, so a near city's stores spread over a wider angle than a far
 * one's (from Guelph, Toronto's stores overlap Kingston's direction); the miss weighs that, the angle alone does not.
 */
function roadBack(hubId: string, van: LatLon | null, cities: CityAt[], known: string | null): { cityKey: string | null; frac: number } {
  const hub = HUB_AT[hubId];
  const mine = cities.filter(c => c.hubId === hubId);
  if (!hub || !van || !mine.length) return { cityKey: known, frac: 0 };
  const [vx, vy] = offset(hub, van);
  const bearing = Math.atan2(vy, vx);
  const miss = (c: CityAt) => {
    const [x, y] = offset(hub, c.at);
    return 2 * Math.hypot(x, y) * Math.abs(Math.sin((Math.atan2(y, x) - bearing) / 2));
  };
  const city = mine.find(c => c.cityKey === known) ?? mine.reduce((best, c) => miss(c) < miss(best) ? c : best);
  const road = Math.hypot(...offset(hub, city.at));
  return { cityKey: city.cityKey, frac: road > 0 ? clamp01(Math.hypot(vx, vy) / road) : 0 };
}

/* ── Live activity ───────────────────────────────────────── */

/** The feed keeps this many lines, newest last. */
const FEED_MAX = 40;
/** The first reading seeds the feed with the departures of the last half hour. */
const SEED_DRIVE_MS = 30 * 60_000;
/** A van's ping trails the sim clock by under a minute: a fleet reading this far behind the last one is a jump back. */
const PING_MS = 60_000;
/**
 * A fleet reading whose sim clock moved this much further than the real time since the last one jumped ahead
 * (sim_jump_to): the sim runs at real speed, so a hidden tab that skips polls moves both together.
 */
const JUMP_MS = 5 * 60_000;

/** What the feed remembers of a van from the last reading. */
type VanSeen = {
  status: TruckStatus;
  /** fleet_now.dest_store_name, for the restock line once the van turns back (it has no destination then). */
  store: string | null;
  tripId: string | null;
  /** The trip's city: dest_city_key, kept while the same trip comes back (see `roadBack`). */
  cityKey: string | null;
};

type Feed = {
  /** The readings last diffed. */
  fleet: FleetData | null;
  stores: StoreData | null;
  /** Client time (Date.now()) when `fleet` was diffed. */
  fleetAt: number;
  vans: Map<string, VanSeen>;
  stock: Map<number, StockStatus>;
  /** Undefined until the first fleet and store readings are both in. */
  events: WorldEvent[] | undefined;
};

const blankFeed = (): Feed => ({ fleet: null, stores: null, fleetAt: 0, vans: new Map(), stock: new Map(), events: undefined });

const event = (kind: string, id: string | number, at: string, countryCode: CountryCode, text: string, tone: WorldEventTone): WorldEvent =>
  ({ key: `${kind}:${id}:${at}`, at, countryCode, text, tone });
const byTime = (a: WorldEvent, b: WorldEvent) => Date.parse(a.at) - Date.parse(b.at);

/** The newest ping of a fleet_now reading: close to the sim time it was read at (a van's ping trails it by under a minute). */
function newestPing(fleet: FleetData | null): string | null {
  let best: string | null = null, bestMs = -Infinity;
  for (const v of fleet?.rows ?? []) {
    const at = iso(v.last_ping_at), ms = at ? Date.parse(at) : NaN;
    if (ms > bestMs) { best = at; bestMs = ms; }
  }
  return best;
}

/**
 * Whether the sim clock jumped (sim_jump_to, sim_go_live) between two fleet readings, `realMs` apart: it went
 * back, or ahead by much more than the real time. Diffing across a jump would make up what the vans did.
 */
function jumped(was: string | null, now: string | null, realMs: number): boolean {
  if (!was || !now) return false;
  const simMs = Date.parse(now) - Date.parse(was);
  return simMs < -PING_MS || simMs - realMs > JUMP_MS;
}

const vanNo = (v: FleetRow) => n0(v.fleet_no);
const hubOf = (v: FleetRow) => sOrNull(v.hub_name) ?? "the hub";
/** When an unloading van reached its store: fleet_now's eta_at is the real arrival once it happened. */
const arrivedAt = (v: FleetRow, now: string) => iso(v.eta_at) ?? now;

/** A line for a van the first reading finds on the road: departures of the last half hour, stops, unloadings. */
function seedVan(v: FleetRow, cc: CountryCode, status: TruckStatus, now: string): WorldEvent | null {
  const truck = String(v.truck_id), van = `Van ${vanNo(v)}`, store = sOrNull(v.dest_store_name);
  switch (status) {
    case "driving": {
      const at = iso(v.departed_at);
      if (!at || !(Date.parse(now) - Date.parse(at) <= SEED_DRIVE_MS)) return null;
      return event("drive", truck, at, cc, `${van} left ${hubOf(v)}${store ? ` for ${store}` : ""}`, "drive");
    }
    case "stopped": {
      const note = sOrNull(v.delay_note);
      return event("stop", truck, now, cc, `${van} stopped${note ? `: ${note}` : ""}`, "stop");
    }
    case "unloading":
      return event("unload", truck, arrivedAt(v, now), cc, store ? `${van} is unloading at ${store}` : `${van} is unloading`, "unload");
    default:
      return null;
  }
}

/**
 * What a van did since the last reading, from its status then and now. A reading can skip steps (polls pause
 * while the tab is hidden): a van seen unloading, or still loading, and now back at the hub gets both the
 * store's restock line and its own.
 */
function vanMoved(v: FleetRow, cc: CountryCode, was: VanSeen, status: TruckStatus, now: string): WorldEvent[] {
  if (status === was.status) return [];
  const truck = String(v.truck_id), no = vanNo(v), van = `Van ${no}`, store = sOrNull(v.dest_store_name);
  // The store it was heading to is restocked once it turns back (fleet_now has no destination then; `was.store` has it).
  const restocked = () => was.store && oneOf(was.status, HEADING) ? [event("restock", truck, now, cc, `${was.store} restocked by van ${no}`, "restock")] : [];
  switch (status) {
    case "driving":
      return [was.status === "stopped"
        ? event("go", truck, now, cc, `${van} is moving again`, "drive")
        // The departure's own time when fleet_now has it.
        : event("drive", truck, iso(v.departed_at) ?? now, cc, `${van} left ${hubOf(v)}${store ? ` for ${store}` : ""}`, "drive")];
    case "stopped": {
      const note = sOrNull(v.delay_note);
      return [event("stop", truck, now, cc, `${van} stopped${note ? `: ${note}` : ""}`, "stop")];
    }
    case "unloading":
      return [event("unload", truck, arrivedAt(v, now), cc, store ? `${van} reached ${store}` : `${van} is unloading`, "unload")];
    case "returning":
      return restocked();
    case "at_hub":
      return ON_TRIP.includes(was.status) ? [...restocked(), event("back", truck, now, cc, `${van} is back at ${hubOf(v)}`, "back")] : [];
    default:
      return [];
  }
}

const outLine = (s: StoreRow, cc: CountryCode, at: string) =>
  event("out", n0(s.store_id), at, cc, `${String(s.store_name)} ran out of ${variety(s.out_variety) ?? "pumpkins"}`, "out");

/**
 * The Live activity feed, and what it remembers of each van. Like `useLive`, it reads in render: each new
 * reading (a new data object) is diffed once against the last; a re-render with the same readings changes
 * nothing. The first fleet and store readings seed it from the current state, at their real times where the
 * views carry them; every reading after adds what changed. A fleet reading whose clock jumped starts it over:
 * it seeds the feed like the first. A line's time is the departure's, the arrival's or the stockout's when the
 * view has it, else the fleet reading's own (its newest ping): the clock polls less often and stands still
 * through a failed poll, so it only stands in before any ping.
 */
function useActivity(fleet: FleetData | null, stores: StoreData | null, clockNow: string | undefined): Feed {
  const ref = useRef<Feed>(blankFeed());
  if (fleet === ref.current.fleet && stores === ref.current.stores) return ref.current;

  const readAt = Date.now(), ping = newestPing(fleet ?? ref.current.fleet);
  // Across a clock jump nothing is diffed: the feed starts over from this reading and the store reading in hand.
  if (fleet && fleet !== ref.current.fleet && jumped(newestPing(ref.current.fleet), ping, readAt - ref.current.fleetAt)) ref.current = blankFeed();
  const feed = ref.current;
  const now = ping ?? clockNow ?? new Date().toISOString();
  const seeded = feed.events !== undefined;
  const added: WorldEvent[] = [];

  if (fleet && fleet !== feed.fleet) {
    for (const v of fleet.rows) {
      const status = oneOf(v.status, TRUCK_STATUS);
      if (!status || !isCountry(v.country_code)) continue;
      const truck = String(v.truck_id), tripId = sOrNull(v.trip_id), was = feed.vans.get(truck);
      if (seeded && was) added.push(...vanMoved(v, v.country_code, was, status, now));
      const sameTrip = was != null && tripId != null && was.tripId === tripId;
      feed.vans.set(truck, { status, store: sOrNull(v.dest_store_name), tripId, cityKey: sOrNull(v.dest_city_key) ?? (sameTrip ? was.cityKey : null) });
    }
    feed.fleet = fleet;
    feed.fleetAt = readAt;
  }

  if (stores && stores !== feed.stores) {
    for (const s of stores.rows) {
      const stock = oneOf(s.stock_status, STOCK);
      if (!stock || !isCountry(s.country_code)) continue;
      const id = n0(s.store_id), was = feed.stock.get(id);
      if (seeded && was && was !== "out" && stock === "out") added.push(outLine(s, s.country_code, iso(s.out_since) ?? now));
      feed.stock.set(id, stock);
    }
    feed.stores = stores;
  }

  // Nothing happens after the sim time now (the fleet reading's, plus the real time since): a line well after it
  // comes from a store reading taken before the clock jumped back, and is left out.
  const latest = ping ? Date.parse(ping) + (readAt - feed.fleetAt) + JUMP_MS : Infinity;
  const inTime = (e: WorldEvent) => Date.parse(e.at) <= latest;

  if (!seeded && feed.fleet && feed.stores) {
    const seed: WorldEvent[] = [];
    for (const v of feed.fleet.rows) {
      const status = oneOf(v.status, TRUCK_STATUS);
      const line = status && isCountry(v.country_code) ? seedVan(v, v.country_code, status, now) : null;
      if (line) seed.push(line);
    }
    for (const s of feed.stores.rows) {
      const since = iso(s.out_since);
      if (s.stock_status === "out" && since && isCountry(s.country_code)) seed.push(outLine(s, s.country_code, since));
    }
    feed.events = seed.filter(inTime).sort(byTime).slice(-FEED_MAX);
  } else if (feed.events && added.length) {
    // A line already in the feed (same kind, van or store, and time) is not added twice.
    const keys = new Set(feed.events.map(e => e.key));
    const fresh = added.filter(e => {
      if (!inTime(e) || keys.has(e.key)) return false;
      keys.add(e.key);
      return true;
    });
    if (fresh.length) feed.events = [...feed.events, ...fresh].sort(byTime).slice(-FEED_MAX);
  }
  return feed;
}

/* ── The hook ────────────────────────────────────────────── */

export function useWorldData(clock?: Clock): LivePage<WorldViewModel> {
  const hubs = useLive(useMetabaseQuery(HubNow), "hubs", POLL.fleet, "the hubs");
  const fleet = useLive(useFleetRows(), "fleet", VANS_MS, "the vans");
  const stores = useLive(useStoreRows(), "stores", POLL.fleet, "the stores");
  const cities = useLive(useMetabaseQuery(Cities), "cities", 0, "the cities");
  const feed = useActivity(fleet.data, stores.data, clock?.now);
  // `feed.vans` changes only with a new fleet reading, which is in the memo's dependencies.
  const { events, vans: seen } = feed;

  const vm = useMemo((): WorldViewModel => {
    const cityRows = cities.data?.rows;
    const cityPart = cityRows?.flatMap((c): WorldCity[] => isCountry(c.country_code) ? [{
      cityKey: String(c.city_key), name: String(c.city_name), countryCode: c.country_code, hubId: String(c.hub_id),
      roadKm: n0(c.road_km), driveMin: n0(c.drive_min),
    }] : []);

    const hubPart = hubs.data?.rows.flatMap((h): WorldHub[] => {
      if (!isCountry(h.country_code)) return [];
      const status = oneOf(h.harvest_status, HARVEST) ?? "not_started";
      const note = sOrNull(h.harvest_note) ?? "";
      return [{
        hubId: String(h.hub_id), name: String(h.hub_name), countryCode: h.country_code, tz: tzOf(h.tz, h.country_code),
        harvestStatus: status, harvestNote: note, picking: status === "picking" ? fieldsIn(note) : [],
        binsToday: n0(h.bins_today), planBinsToday: n0(h.plan_bins_today),
        stockUnits: n0(h.hub_stock_units), stockDays: n0(h.hub_stock_days),
        vans: {
          total: n0(h.vans_total), atHub: n0(h.vans_at_hub), loading: n0(h.vans_loading), onRoad: n0(h.vans_on_road),
          unloading: n0(h.vans_unloading), returning: n0(h.vans_returning), workshop: n0(h.vans_workshop), late: n0(h.vans_late),
        },
      }];
    }).sort((a, b) => order(a.countryCode) - order(b.countryCode));

    const storePart = stores.data?.rows.flatMap((s): WorldStore[] => {
      if (!isCountry(s.country_code)) return [];
      return [{
        storeId: n0(s.store_id), name: String(s.store_name), format: oneOf(s.store_format, FORMATS) ?? "standard",
        cityKey: String(s.city_key), countryCode: s.country_code, tz: tzOf(s.tz, s.country_code),
        stock: oneOf(s.stock_status, STOCK) ?? "ok", shortVariety: variety(s.out_variety) ?? variety(s.low_variety),
        shelves: [
          { variety: "Carving", onHand: n0(s.on_hand_carving), capacity: n0(s.cap_carving) },
          { variety: "Cooking", onHand: n0(s.on_hand_cooking), capacity: n0(s.cap_cooking) },
          { variety: "Mini", onHand: n0(s.on_hand_mini), capacity: n0(s.cap_mini) },
        ],
        isOpen: bool(s.is_open), opensAt: iso(s.opens_at), closesAt: iso(s.closes_at),
        next: s.next_truck_id == null ? null : {
          truckId: String(s.next_truck_id), label: sOrNull(s.next_truck_label) ?? "",
          status: oneOf(s.next_status, HEADING) ?? "driving", etaAt: iso(s.next_eta_at) ?? iso(s.next_planned_at), units: n0(s.next_units),
        },
      }];
    });

    // The vans wait for the cities: a van's road time, and a returning van's road, come from them.
    let vanPart: WorldVan[] | undefined;
    if (fleet.data && cityRows) {
      const byKey = new Map(cityRows.map(c => [String(c.city_key), c]));
      const roads = cityRows.flatMap((c): CityAt[] => {
        const lat = nOrNull(c.latitude), lon = nOrNull(c.longitude);
        return lat != null && lon != null ? [{ cityKey: String(c.city_key), hubId: String(c.hub_id), at: [lat, lon] }] : [];
      });
      // A status outside the contract is left out.
      vanPart = fleet.data.rows.flatMap((v): WorldVan[] => {
        const status = oneOf(v.status, TRUCK_STATUS);
        if (!status || !isCountry(v.country_code)) return [];
        const truckId = String(v.truck_id), hubId = String(v.hub_id);
        const heading = oneOf(status, HEADING) != null;
        let place: { cityKey: string | null; frac: number } = { cityKey: null, frac: 0 };
        if (status === "returning") {
          const lat = nOrNull(v.latitude), lon = nOrNull(v.longitude);
          place = roadBack(hubId, lat != null && lon != null ? [lat, lon] : null, roads, seen.get(truckId)?.cityKey ?? null);
        } else if (heading) {
          place = {
            cityKey: sOrNull(v.dest_city_key),
            frac: status === "unloading" ? 1 : status === "loading" ? 0 : clamp01(n0(v.progress_pct) / 100),
          };
        }
        const city = place.cityKey ? byKey.get(place.cityKey) : undefined;
        return [{
          truckId, fleetNo: n0(v.fleet_no), label: String(v.truck_label), hubId, countryCode: v.country_code, status,
          cityKey: place.cityKey,
          storeId: heading ? nOrNull(v.dest_store_id) : null, storeName: heading ? sOrNull(v.dest_store_name) : null,
          frac: place.frac, etaAt: iso(v.eta_at), plannedAt: iso(v.planned_arrive_at),
          driveMin: city ? n0(city.drive_min) : null, roadKm: city ? n0(city.road_km) : null,
          units: n0(v.units_aboard), bins: n0(v.bins_aboard),
          late: lateOf(v.late_minutes, v.delay_cause, v.delay_note),
          driver: sOrNull(v.driver_name) ?? "", model: sOrNull(v.make_model) ?? "", plate: sOrNull(v.plate),
          workshopJob: status === "workshop" ? sOrNull(v.open_fault_desc) ?? "Scheduled service" : null,
        }];
      });
    }

    const mapError = fleet.error ?? hubs.error ?? stores.error ?? cities.error;
    return {
      hubs: hubPart, cities: cityPart, stores: storePart, vans: vanPart, events,
      vansAt: vanPart ? fleet.receivedAt ?? undefined : undefined,
      errors: mapError ? { map: mapError } : undefined,
    };
  }, [hubs.data, hubs.error, fleet.data, fleet.error, fleet.receivedAt, stores.data, stores.error, cities.data, cities.error, events, seen]);

  const parts = [hubs, fleet, stores, cities];
  const refetches = parts.map(p => p.refetch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const retry = useCallback(() => refetches.forEach(r => r()), refetches);
  return { vm, refreshing: parts.some(p => p.refreshing), retry };
}
