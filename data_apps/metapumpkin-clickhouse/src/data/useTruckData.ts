import { filter, useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useCallback, useMemo } from "react";
import { FleetNow, StoreDemand, StoreNow, TripTimeline, TruckFaults, TruckTrips } from "../../queries/live.query";
import type { DestinationStock, TimelineStep, TruckFault, TruckNow, TruckTrip, TruckViewModel } from "../pages/TruckPage";
import type { FaultSeverity, ServiceStatus, StockStatus, TimelineState, TripStatus, TruckStatus, Variety } from "../types";
import { bool, iso, type LivePage, n0, nOrNull, oneOf, POLL, positional, safely, sOrNull, useLive, ymd } from "./live";
import { lateOf } from "./useFleetData";

/*
 * One van (/fleet/truck/:truckId): its fleet_now row, the trip timeline, faults and every trip of the season
 * (the page picks the time switch's from them), plus the stock at the store its load is for. Polled every 20 s.
 */

/**
 * varieties (pumpkin_live, fixed for the season): kg per pumpkin and list price, to split the load's weight
 * and value by variety. Not queried: they are master data of the contract, like the countries in types.ts.
 */
const VARIETY_INFO: Record<Variety, { kg: number; price: number }> = {
  Carving: { kg: 4.5, price: 7.99 },
  Cooking: { kg: 2.0, price: 5.49 },
  Mini: { kg: 0.5, price: 2.49 },
};
/** What a full tank takes a 7.5 t van (fuel_pct × this = the range). */
const FULL_TANK_KM = 575;

const TRUCK_STATUS: readonly TruckStatus[] = ["at_hub", "loading", "driving", "stopped", "unloading", "returning", "workshop"];
const TRIP_STATUS: readonly TripStatus[] = ["loading", "driving", "stopped", "unloading", "returning", "done"];
const SERVICE_STATUS: readonly ServiceStatus[] = ["ok", "due_soon", "overdue", "in_workshop"];
const SEVERITY: readonly FaultSeverity[] = ["warning", "critical"];
const STEP_STATE: readonly TimelineState[] = ["done", "now", "next"];
const STOCK: readonly StockStatus[] = ["out", "low", "ok"];
const VARIETIES: readonly Variety[] = ["Carving", "Cooking", "Mini"];
/** A store id no store has: what the destination queries ask for while the van has none. */
const NO_STORE = -1;

export function useTruckData(truckId: string): LivePage<TruckViewModel> {
  const byTruck = useMemo(() => ({ filters: [filter(FleetNow.source.fields.truckId, "=", truckId)] }), [truckId]);
  const truck = useLive(useMetabaseQuery(FleetNow, byTruck), `truck:${truckId}`, POLL.fleet, "the van");
  const steps = useLive(useMetabaseQuery(TripTimeline, useMemo(() => ({ filters: [filter(TripTimeline.source.fields.truckId, "=", truckId)] }), [truckId])),
    `timeline:${truckId}`, POLL.fleet, "the trip");
  const faults = useLive(useMetabaseQuery(TruckFaults, useMemo(() => ({ filters: [filter(TruckFaults.source.fields.truckId, "=", truckId)] }), [truckId])),
    `faults:${truckId}`, POLL.fleet, "faults");
  const trips = useLive(useMetabaseQuery(TruckTrips, useMemo(() => ({ filters: [filter(TruckTrips.source.fields.truckId, "=", truckId)] }), [truckId])),
    `trips:${truckId}`, POLL.fleet, "the trips");

  const row = truck.data?.rows[0];
  const destId = row && row.trip_id != null ? nOrNull(row.dest_store_id) ?? NO_STORE : NO_STORE;
  // Only once the van's trip names its store: asking for NO_STORE first cost two queries, then the real two.
  const store = useLive(useMetabaseQuery(StoreNow, useMemo(() => ({ filters: [filter(StoreNow.source.fields.storeId, "=", destId)], enabled: destId !== NO_STORE }), [destId])),
    `store:${destId}`, POLL.fleet, "the store");
  const demand = useLive(useMetabaseQuery(StoreDemand, useMemo(() => ({ filters: [filter(StoreDemand.source.fields.storeId, "=", destId)], enabled: destId !== NO_STORE }), [destId])),
    `demand:${destId}`, POLL.fleet, "store demand");

  const vm = useMemo((): TruckViewModel => {
    const errors: NonNullable<TruckViewModel["errors"]> = {};
    let truckPart: TruckNow | null | undefined;
    if (truck.error) errors.truck = truck.error;
    else if (truck.data) {
      const r = truck.data.rows[0];
      if (!r) truckPart = null;
      else {
        const lines = VARIETIES.map(variety => {
          const units = n0(variety === "Carving" ? r.carving_aboard : variety === "Cooking" ? r.cooking_aboard : r.mini_aboard);
          return { variety, units, kg: units * VARIETY_INFO[variety].kg, valueUsd: units * VARIETY_INFO[variety].price };
        }).filter(l => l.units > 0);
        // Scale the list-price split so the lines add up to the cargo value the view reports.
        const value = n0(r.cargo_value_usd), listed = lines.reduce((s, l) => s + l.valueUsd, 0);
        if (listed > 0 && value > 0) for (const l of lines) l.valueUsd = l.valueUsd * value / listed;
        const fuel = nOrNull(r.fuel_pct);
        const status = oneOf(r.status, TRUCK_STATUS) ?? "at_hub";
        truckPart = {
          truckId: String(r.truck_id), label: String(r.truck_label), makeModel: sOrNull(r.make_model) ?? "", body: sOrNull(r.body) ?? "",
          plate: sOrNull(r.plate) ?? "", driverName: sOrNull(r.driver_name), lastPingAt: iso(r.last_ping_at),
          status, hubName: String(r.hub_name), tz: sOrNull(r.tz) ?? "UTC",
          trip: r.trip_id == null ? null : {
            tripId: String(r.trip_id), storeId: n0(r.dest_store_id), storeName: sOrNull(r.dest_store_name) ?? "", cityName: sOrNull(r.dest_city_name) ?? "",
            plannedArriveAt: iso(r.planned_arrive_at) ?? "", etaAt: iso(r.eta_at),
            late: lateOf(r.late_minutes, r.delay_cause, r.delay_note),
            progressPct: n0(r.progress_pct), kmTotal: n0(r.km_total), kmDone: n0(r.km_done),
          },
          cargo: {
            units: n0(r.units_aboard), lines, bins: n0(r.bins_aboard), capacityBins: n0(r.capacity_bins),
            kg: n0(r.kg_aboard), payloadKg: n0(r.payload_kg), valueUsd: value,
          },
          service: {
            status: oneOf(r.service_status, SERVICE_STATUS) ?? "ok",
            odometerKm: n0(r.odometer_km), kmSinceService: n0(r.km_since_service), intervalKm: n0(r.service_interval_km),
            kmToService: n0(r.km_to_service), lastServiceOn: r.last_service_on == null ? null : ymd(r.last_service_on),
            lastServiceKm: nOrNull(r.last_service_km), bookedOn: r.service_booked_on == null ? null : ymd(r.service_booked_on),
          },
          readings: {
            fuelPct: fuel, fuelRangeKm: fuel == null ? null : Math.round(fuel / 100 * FULL_TANK_KM),
            coolantC: nOrNull(r.coolant_c), cargoTempC: nOrNull(r.cargo_temp_c), speedKmh: nOrNull(r.speed_kmh),
          },
        };
      }
    }

    let timeline: TimelineStep[] | undefined;
    if (steps.error) errors.timeline = steps.error;
    else if (steps.data) timeline = steps.data.rows.map(s => ({
      tripId: String(s.trip_id), seq: n0(s.seq), at: iso(s.event_at), isEstimate: bool(s.is_estimate),
      state: oneOf(s.state, STEP_STATE) ?? "next", label: sOrNull(s.label) ?? "", detail: sOrNull(s.detail),
    }));

    let faultPart: TruckFault[] | undefined;
    if (faults.error) errors.faults = faults.error;
    else if (faults.data) faultPart = faults.data.rows.map(f => ({
      code: sOrNull(f.code) ?? "", description: sOrNull(f.description) ?? "", severity: oneOf(f.severity, SEVERITY) ?? "warning",
      raisedAt: iso(f.raised_at) ?? "", clearedAt: iso(f.cleared_at),
    }));

    let tripPart: TruckTrip[] | undefined;
    if (trips.error) errors.trips = trips.error;
    else if (trips.data) tripPart = trips.data.rows.map(d => ({
      tripId: String(d.trip_id), localDate: ymd(d.local_date), daysAgo: n0(d.days_ago), wave: n0(d.wave),
      storeId: n0(d.store_id), storeName: sOrNull(d.store_name) ?? "", cityName: sOrNull(d.city_name) ?? "",
      kmTotal: n0(d.km_total), kmDone: n0(d.km_done),
      status: oneOf(d.status, TRIP_STATUS) ?? "done", isDelivered: bool(d.is_delivered), isOnTime: bool(d.is_on_time), isLate: bool(d.is_late),
      late: lateOf(d.late_minutes, d.delay_cause, d.delay_note),
      plannedDepartAt: iso(d.planned_depart_at), departedAt: iso(d.departed_at), plannedArriveAt: iso(d.planned_arrive_at),
      arrivedAt: iso(d.arrived_at), etaAt: iso(d.eta_at), unloadedAt: iso(d.unloaded_at), returnedAt: iso(d.returned_at),
      units: n0(d.units_total), varieties: { Carving: n0(d.carving_units), Cooking: n0(d.cooking_units), Mini: n0(d.mini_units) },
      damaged: n0(d.damaged_units), bins: n0(d.bins), capacityBins: n0(d.capacity_bins), kg: n0(d.kg),
      valueUsd: n0(d.cargo_value_usd), costUsd: n0(d.delivery_cost_usd),
    }));

    // The store the load is for: what it is short of, and how many days this load lasts there.
    let destination: DestinationStock | null | undefined = truckPart?.trip ? undefined : null;
    const s = store.data?.rows[0];
    if (truckPart?.trip && s && n0(s.store_id) === truckPart.trip.storeId) {
      const status = oneOf(s.stock_status, STOCK) ?? "ok";
      const variety = oneOf(status === "out" ? s.out_variety : status === "low" ? s.low_variety : null, VARIETIES);
      const demandRows = safely(() => positional(demand.data, ["store", "variety", "requested"] as const), "store demand").value;
      const aboard = variety ? truckPart.cargo.lines.find(l => l.variety === variety)?.units ?? 0 : truckPart.cargo.units;
      const requested = demandRows?.filter(d => !variety || d.variety === variety).reduce((sum, d) => sum + n0(d.requested), 0) ?? 0;
      destination = {
        status, variety, since: status === "out" ? iso(s.out_since) : null,
        loadCoverDays: requested > 0 && aboard > 0 ? aboard / (requested / 7) : null,
      };
    }

    return { truck: truckPart, timeline, faults: faultPart, trips: tripPart, destination, errors: Object.keys(errors).length ? errors : undefined };
  }, [truck.data, truck.error, steps.data, steps.error, faults.data, faults.error, trips.data, trips.error, store.data, demand.data]);

  const parts = [truck, steps, faults, trips, store, demand];
  const refetches = parts.map(p => p.refetch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const retry = useCallback(() => refetches.forEach(r => r()), refetches);
  return { vm, refreshing: parts.some(p => p.refreshing), retry };
}
