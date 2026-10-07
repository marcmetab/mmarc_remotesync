import { useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useCallback, useMemo } from "react";
import { Cities, DeliveriesByDay, FleetNow, HarvestYesterday, HubNow, VanSeason } from "../../queries/live.query";
import { CARGO_BAND_C, type FleetCargoRow, type FleetHub, type FleetOnTime, type FleetServiceRow, type FleetVan, type FleetViewModel, type FleetYardVan } from "../pages/FleetPage";
import { dayLabel } from "../format";
import { type Clock, COUNTRIES, type CountryCode, type DelayCause, type FaultSeverity, type HarvestStatus, inScope, type LateInfo, type RegionCode, type Scope, type ServiceStatus, type TruckStatus } from "../types";
import { iso, type LivePage, n0, nOrNull, oneOf, POLL, positional, safely, sOrNull, useLive } from "./live";

/*
 * Harvest & fleet: hub_now, fleet_now, cities, yesterday's harvest, 14 days of deliveries and the season's trips by
 * van (the yard's hover card), polled every 20 s (cities once). The region and country are applied here.
 */

export const DELAY_CAUSES: readonly DelayCause[] = ["traffic", "late_departure", "breakdown", "storm", "ventilation"];
const HARVEST: readonly HarvestStatus[] = ["picking", "done", "not_started", "rain_stop"];
const VAN_STATUS = ["driving", "stopped", "unloading"] as const;
const TRUCK_STATUS: readonly TruckStatus[] = ["at_hub", "loading", "driving", "stopped", "unloading", "returning", "workshop"];
const SERVICE = ["due_soon", "overdue", "in_workshop"] as const;
const SERVICE_ALL: readonly ServiceStatus[] = ["ok", ...SERVICE];
const FAULT: readonly FaultSeverity[] = ["warning", "critical"];
const isCountry = (v: unknown): v is CountryCode => COUNTRIES.some(c => c.code === v);
const regionOf = (cc: CountryCode): RegionCode => COUNTRIES.find(c => c.code === cc)!.region;

/** fleet_now / store_now / deliveries: late_minutes, delay_cause, delay_note. */
export const lateOf = (minutes: unknown, cause: unknown, note: unknown): LateInfo =>
  ({ minutes: Math.max(0, n0(minutes)), cause: oneOf(cause, DELAY_CAUSES), note: sOrNull(note) });

type FleetRows = NonNullable<ReturnType<typeof useFleetRows>["data"]>["rows"];
const useFleetRows = () => useMetabaseQuery(FleetNow);

export function useFleetData(scope: Scope, clock?: Clock): LivePage<FleetViewModel> {
  const hubs = useLive(useMetabaseQuery(HubNow), "hubs", POLL.fleet, "the hubs");
  const fleet = useLive(useFleetRows(), "fleet", POLL.fleet, "the vans");
  const cities = useLive(useMetabaseQuery(Cities), "cities", 0, "the cities");
  const harvest = useLive(useMetabaseQuery(HarvestYesterday), "harvest", POLL.fleet, "the harvest");
  const trips = useLive(useMetabaseQuery(DeliveriesByDay), "trips", POLL.fleet, "deliveries");
  const season = useLive(useMetabaseQuery(VanSeason), "season", POLL.stores, "the season's trips");
  const now = clock?.now;

  const vm = useMemo((): FleetViewModel => {
    const errors: NonNullable<FleetViewModel["errors"]> = {};
    const vans: FleetRows = fleet.data?.rows ?? [];
    const inScopeCc = (cc: unknown) => isCountry(cc) && inScope(scope, regionOf(cc), cc);
    const tripRows = safely(() => positional(trips.data, ["country", "hub", "daysAgo", "cause", "count", "delivered", "onTime"] as const), "deliveries");
    const harvestRows = safely(() => positional(harvest.data, ["hub", "bins", "planBins"] as const), "the harvest");
    const seasonRows = safely(() => positional(season.data, ["truck", "trips", "delivered", "onTime"] as const), "the season's trips");

    let hubPart: FleetHub[] | undefined;
    const hubError = hubs.error ?? fleet.error ?? cities.error;
    if (hubError) errors.hubs = hubError;
    else if (hubs.data && fleet.data && cities.data) {
      const order = (cc: CountryCode) => COUNTRIES.findIndex(c => c.code === cc);
      hubPart = hubs.data.rows.filter(h => inScopeCc(h.country_code)).sort((a, b) => order(a.country_code as CountryCode) - order(b.country_code as CountryCode)).map((h): FleetHub => {
        const hubId = String(h.hub_id);
        const cc = h.country_code as CountryCode;
        const tz = sOrNull(h.tz) ?? COUNTRIES.find(c => c.code === cc)!.tz;
        const status = oneOf(h.harvest_status, HARVEST) ?? "not_started";
        // Before the first pick of the day, the bins are yesterday's.
        const yesterday = status === "not_started" ? harvestRows.value?.find(r => r.hub === hubId) : undefined;
        const shop = vans.filter(v => v.hub_id === hubId && v.status === "workshop");
        // The next wave is the day's first when no trip of this hub has started on that local day.
        const waveAt = iso(h.next_wave_at);
        const startedToday = (tripRows.value ?? []).some(r => r.hub === hubId && n0(r.daysAgo) === 0 && n0(r.count) > 0);
        const waveToday = waveAt != null && now != null && dayLabel(waveAt, tz) === dayLabel(now, tz);
        return {
          hubId, name: String(h.hub_name), countryCode: cc, country: String(h.country_name), regionCode: regionOf(cc), tz,
          harvestStatus: status, harvestNote: sOrNull(h.harvest_note) ?? "",
          fieldsPicking: n0(h.fields_picking),
          bins: yesterday ? n0(yesterday.bins) : n0(h.bins_today),
          planBins: yesterday ? n0(yesterday.planBins) : n0(h.plan_bins_today),
          binsDay: yesterday ? "yesterday" : "today",
          stockDays: n0(h.hub_stock_days),
          vansAtHub: n0(h.vans_at_hub), vansLoading: n0(h.vans_loading), vansReturning: n0(h.vans_returning),
          workshop: shop.map(v => n0(v.fleet_no)),
          workshopLabels: shop.map(v => String(v.truck_label)),
          nextWave: waveAt ? { at: waveAt, first: !(waveToday && startedToday), later: !waveToday } : null,
          cities: cities.data!.rows.filter(c => c.hub_id === hubId).map(c => ({
            cityKey: String(c.city_key),
            name: String(c.city_name),
            vans: vans.filter(v => v.dest_city_key === c.city_key && (VAN_STATUS as readonly unknown[]).includes(v.status)).map((v): FleetVan => ({
              truckId: String(v.truck_id), label: String(v.truck_label), driver: sOrNull(v.driver_name) ?? "",
              status: oneOf(v.status, VAN_STATUS)!,
              store: sOrNull(v.dest_store_name) ?? "", units: n0(v.units_aboard),
              etaAt: iso(v.eta_at) ?? iso(v.planned_arrive_at) ?? "", plannedAt: iso(v.planned_arrive_at) ?? "",
              progressPct: n0(v.progress_pct),
              late: lateOf(v.late_minutes, v.delay_cause, v.delay_note),
            })),
          })),
        };
      });
    }

    let yard: FleetYardVan[] | undefined, maintenance: FleetServiceRow[] | undefined, cargo: FleetCargoRow[] | undefined;
    if (fleet.error) errors.vans = errors.maintenance = errors.cargo = fleet.error;
    else if (fleet.data) {
      const scoped = vans.filter(v => inScopeCc(v.country_code));
      // The season by van, once its query is in (a van with no trip yet has no row: zeros). Failed: no season line.
      const bySeason = seasonRows.value && new Map(seasonRows.value.map(r => [String(r.truck), { trips: n0(r.trips), delivered: n0(r.delivered), onTime: n0(r.onTime) }]));
      // Every van, whatever it is doing, in fleet_now's fleet-number order. A status outside the contract is left out.
      yard = scoped.flatMap((v): FleetYardVan[] => {
        const status = oneOf(v.status, TRUCK_STATUS);
        if (!status) return [];
        const truckId = String(v.truck_id);
        const fault = sOrNull(v.open_fault_desc);
        return [{
          truckId, label: String(v.truck_label), fleetNo: n0(v.fleet_no), driver: sOrNull(v.driver_name) ?? "", hubId: String(v.hub_id),
          status, store: sOrNull(v.dest_store_name), city: sOrNull(v.dest_city_name),
          etaAt: iso(v.eta_at), progressPct: n0(v.progress_pct), units: n0(v.units_aboard),
          late: lateOf(v.late_minutes, v.delay_cause, v.delay_note),
          service: oneOf(v.service_status, SERVICE_ALL) ?? "ok", kmToService: n0(v.km_to_service),
          fault: fault ? { desc: fault, severity: oneOf(v.open_fault_severity, FAULT) } : null,
          season: bySeason ? bySeason.get(truckId) ?? { trips: 0, delivered: 0, onTime: 0 } : undefined,
        }];
      });
      maintenance = scoped.flatMap(v => {
        const status = oneOf(v.service_status, SERVICE);
        return status ? [{ truckId: String(v.truck_id), label: String(v.truck_label), hubName: String(v.hub_name), status, kmToService: n0(v.km_to_service) }] : [];
      });
      cargo = scoped.flatMap(v => {
        const temp = nOrNull(v.cargo_temp_c);
        if (n0(v.units_aboard) <= 0 || temp == null || (temp >= CARGO_BAND_C.min && temp <= CARGO_BAND_C.max)) return [];
        return [{ truckId: String(v.truck_id), label: String(v.truck_label), hubName: String(v.hub_name), store: sOrNull(v.dest_store_name), cargoTempC: temp }];
      });
    }

    let onTime: FleetOnTime | undefined;
    const tripError = trips.error ?? tripRows.error;
    if (tripError) errors.onTime = tripError;
    else if (tripRows.value) {
      const rows = tripRows.value.filter(r => inScopeCc(r.country));
      const week = rows.filter(r => n0(r.daysAgo) <= 6), before = rows.filter(r => n0(r.daysAgo) >= 7);
      const sum = (list: typeof rows, key: "delivered" | "onTime") => list.reduce((s, r) => s + n0(r[key]), 0);
      const prevStops = sum(before, "delivered");
      const byCause = new Map<DelayCause | null, number>();
      for (const r of week) {
        // Within a cause, the delivered stops that were not on time are its late stops.
        const late = n0(r.delivered) - n0(r.onTime);
        if (late <= 0) continue;
        const cause = oneOf(r.cause, DELAY_CAUSES);
        byCause.set(cause, (byCause.get(cause) ?? 0) + late);
      }
      onTime = {
        stops: sum(week, "delivered"), onTime: sum(week, "onTime"),
        prevStops: prevStops || null, prevOnTime: prevStops ? sum(before, "onTime") : null,
        lateByCause: [...byCause.entries()].map(([cause, stops]) => ({ cause, stops })),
      };
    }

    return { hubs: hubPart, vans: yard, maintenance, cargo, onTime, errors: Object.keys(errors).length ? errors : undefined };
  }, [hubs.data, hubs.error, fleet.data, fleet.error, cities.data, cities.error, harvest.data, trips.data, trips.error, season.data, scope, now]);

  const parts = [hubs, fleet, cities, harvest, trips, season];
  const refetches = parts.map(p => p.refetch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const retry = useCallback(() => refetches.forEach(r => r()), refetches);
  return { vm, refreshing: parts.some(p => p.refreshing), retry };
}
