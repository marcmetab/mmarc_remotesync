import { filter, useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useCallback, useMemo } from "react";
import { Cities, DailyByStore, FleetNow, HourlyToday, HourlyYesterday, RecentDeliveries, RecentStockouts, StoreDetails, StoreNow } from "../../queries/live.query";
import type { CityPeriod, CityShelf, CityStockout, CityStore, CityVan, CityViewModel } from "../pages/CityPage";
import type { StoreDelivery, StoreNow as StoreNowVM, StorePeriodPart, StoreStock, StoreStockout, StoreViewModel } from "../pages/StorePage";
import { revenueByPeriod, type StoresStoreRow, type StoresViewModel } from "../pages/StoresPage";
import {
  COUNTRIES, type CountryCode, DRILL_PERIODS, type DrillPeriod, type LostCause, type PeriodSeries, type PeriodTotals, type RegionCode, type ServiceStatus,
  type StockStatus, type StoreFormat, type TripStatus, VARIETIES, type Variety,
} from "../types";
import { bool, iso, type LivePage, n0, nOrNull, oneOf, POLL, positional, ROW_CAP, safely, sOrNull, useLive, whole, ymd } from "./live";
import { type DayClock, dayClock, type DayRow, daySeries, type HourRow, hourSeries, localYmd, openSpan, rowsClock, shiftDate, totalsByStore, totalsOf } from "./periods";
import { DELAY_CAUSES, lateOf } from "./useFleetData";
import { time } from "../format";

/*
 * Stores, one city and one store. store_now is read whole (100 rows) and narrowed here; the sales, stockouts,
 * deliveries and vans are narrowed in the query by city or store, except the Stores page's sales by day, which
 * are every store's (DailyByStore, 30 days: 3,000 rows). Polled every 60 s.
 *
 * The City and Store pages follow the top bar's time switch (src/data/periods.ts builds its figures and charts):
 * DailyByStore (30 days) gives every option's figures and the 7 and 30 days charts; the hour charts come from
 * HourlyToday or HourlyYesterday, and only the picked one runs.
 */

const STOCK: readonly StockStatus[] = ["out", "low", "ok"];
const FORMATS: readonly StoreFormat[] = ["flagship", "standard", "express"];
const TRIP_STATUS: readonly TripStatus[] = ["loading", "driving", "stopped", "unloading", "returning", "done"];
const HEADING: readonly TripStatus[] = ["loading", "driving", "stopped", "unloading"];
const SERVICE: readonly ServiceStatus[] = ["ok", "due_soon", "overdue", "in_workshop"];
const CAUSES: readonly LostCause[] = ["late_delivery", "hub_shortage", "demand_above_plan"];
const isCountry = (v: unknown): v is CountryCode => COUNTRIES.some(c => c.code === v);
const variety = (v: unknown): Variety | null => oneOf(v, VARIETIES);

type StoreRows = NonNullable<ReturnType<typeof useStoreRows>["data"]>["rows"];
type StoreRow = StoreRows[number];
const useStoreRows = () => useMetabaseQuery(StoreNow);

/** store_now's per-variety columns, Carving, Cooking, Mini. */
function shelvesOf(r: StoreRow): (CityShelf & { incoming: number })[] {
  return [
    { variety: "Carving", onHand: n0(r.on_hand_carving), capacity: n0(r.cap_carving), coverHours: nOrNull(r.cover_hours_carving), incoming: n0(r.next_carving) },
    { variety: "Cooking", onHand: n0(r.on_hand_cooking), capacity: n0(r.cap_cooking), coverHours: nOrNull(r.cover_hours_cooking), incoming: n0(r.next_cooking) },
    { variety: "Mini", onHand: n0(r.on_hand_mini), capacity: n0(r.cap_mini), coverHours: nOrNull(r.cover_hours_mini), incoming: n0(r.next_mini) },
  ];
}
const nextVanOf = (r: StoreRow) => r.next_trip_id == null ? null : {
  status: oneOf(r.next_status, TRIP_STATUS) ?? "driving",
  etaAt: iso(r.next_eta_at) ?? iso(r.next_planned_at),
  late: lateOf(r.next_late_minutes, r.next_delay_cause, r.next_delay_note),
};

/* ── Stores ──────────────────────────────────────────────── */

/**
 * Every store, right now (store_now), and its revenue in each of the revenue period's options: DailyByStore
 * not narrowed to a city (100 stores x 30 days, well under the row cap), the same rows the City and Store pages
 * read, added up the same way. The page picks the period; both queries always run, so a pick shows at once.
 */
export function useStoresData(): LivePage<StoresViewModel> {
  const stores = useLive(useStoreRows(), "stores", POLL.stores, "the stores");
  const daily = useLive(useMetabaseQuery(DailyByStore), "days:all", POLL.stores, "sales by day");
  // A result cut off at the row cap fails the revenue rather than showing partial sums.
  const revenue = useMemo(() => safely(() => {
    const rows = readDays(whole(daily.data, ROW_CAP.aggregated));
    return rows ? revenueByPeriod(rows) : undefined;
  }, "sales by day"), [daily.data]);
  const vm = useMemo((): StoresViewModel => ({
    countries: COUNTRIES.map(c => ({ code: c.code, name: c.name, regionCode: c.region, tz: c.tz })),
    stores: stores.data?.rows.flatMap((r): StoresStoreRow[] => {
      if (!isCountry(r.country_code)) return [];
      const next = nextVanOf(r);
      return [{
        storeId: n0(r.store_id), storeName: String(r.store_name), cityKey: String(r.city_key), cityName: String(r.city_name),
        countryCode: r.country_code, regionCode: (sOrNull(r.region_code) ?? "NA") as RegionCode, tz: sOrNull(r.tz) ?? "UTC",
        isOpen: bool(r.is_open), opensAt: iso(r.opens_at), closesAt: iso(r.closes_at),
        stockStatus: oneOf(r.stock_status, STOCK) ?? "ok", outVariety: variety(r.out_variety), outSince: iso(r.out_since), lowVariety: variety(r.low_variety),
        shelves: shelvesOf(r).map(({ incoming: _, ...shelf }) => shelf),
        soldTodayUnits: n0(r.sold_today_units), lostTodayUsd: n0(r.lost_today_usd),
        revenueTodayUsd: n0(r.revenue_today_usd), revenue7dUsd: n0(r.revenue_7d_usd),
        nextVan: next && { status: next.status, etaAt: next.etaAt, late: next.late },
        nextPlannedAt: iso(r.next_planned_delivery_at),
      }];
    }),
    error: stores.error,
    revenue: revenue.value ?? undefined,
    revenueError: daily.error ?? revenue.error,
  }), [stores.data, stores.error, revenue, daily.error]);
  const { refetch: refetchStores } = stores, { refetch: refetchDaily } = daily;
  const retry = useCallback(() => { refetchStores(); refetchDaily(); }, [refetchStores, refetchDaily]);
  return { vm, refreshing: stores.refreshing || daily.refreshing, retry };
}

/* ── The time switch (City and Store) ────────────────────── */

/** HourlyToday's columns: its four breakouts, then sold, lost, revenue, lost revenue. */
const HOURLY = ["city", "store", "hour", "current", "sold", "lost", "revenue", "lostUsd"] as const;
/** HourlyYesterday's: its three breakouts, then sold, lost, revenue, lost revenue. */
const HOURLY_YESTERDAY = ["city", "store", "hour", "sold", "lost", "revenue", "lostUsd"] as const;
/** DailyByStore's: its four breakouts, then Pumpkins sold, Revenue, units lost, Lost sales, Revenue plan. */
const DAILY = ["city", "store", "daysAgo", "date", "sold", "revenue", "lost", "lostUsd", "plan"] as const;

type Rows = Parameters<typeof positional>[0];
const readHours = (data: Rows, names: readonly string[]) => positional(data, names)?.map((r): HourRow => ({
  storeId: n0(r.store), hour: n0(r.hour), isCurrent: bool(r.current),
  soldUnits: n0(r.sold), revenueUsd: n0(r.revenue), lostUnits: n0(r.lost), lostUsd: n0(r.lostUsd),
})) ?? null;
const readDays = (data: Rows) => positional(data, DAILY)?.map((r): DayRow => ({
  storeId: n0(r.store), daysAgo: n0(r.daysAgo), date: ymd(r.date),
  soldUnits: n0(r.sold), revenueUsd: n0(r.revenue), lostUnits: n0(r.lost), lostUsd: n0(r.lostUsd), planUsd: nOrNull(r.plan),
})) ?? null;

/** The place the switch's queries are narrowed to: a city's stores, or one store. */
type Place = { cityKey: string } | { storeId: number };

/**
 * The switch's queries for one place. The 30 days of daily rows always run: they hold every option's figures.
 * The picked day's hour query runs at once; the other one runs once the daily rows are in, so its first pick shows
 * at once too. Only the picked one polls.
 */
function usePeriodQueries(place: Place, period: DrillPeriod) {
  const city = "cityKey" in place ? place.cityKey : null, store = "storeId" in place ? place.storeId : null;
  const id = city ?? String(store);
  const onToday = period === "today", onYesterday = period === "yesterday";
  const daily = useLive(useMetabaseQuery(DailyByStore, useMemo(() => ({
    filters: [city != null ? filter(DailyByStore.source.fields.cityKey, "=", city) : filter(DailyByStore.source.fields.storeId, "=", store ?? 0)],
  }), [city, store])), `days:${id}`, POLL.stores, "sales by day");
  const today = useLive(useMetabaseQuery(HourlyToday, useMemo(() => ({
    filters: [city != null ? filter(HourlyToday.source.fields.cityKey, "=", city) : filter(HourlyToday.source.fields.storeId, "=", store ?? 0)],
    enabled: onToday || daily.data != null,
  }), [city, store, onToday, daily.data != null])), `hours:${id}`, onToday ? POLL.stores : 0, "today's sales");
  const yesterday = useLive(useMetabaseQuery(HourlyYesterday, useMemo(() => ({
    filters: [city != null ? filter(HourlyYesterday.source.fields.cityKey, "=", city) : filter(HourlyYesterday.source.fields.storeId, "=", store ?? 0)],
    enabled: onYesterday || daily.data != null,
  }), [city, store, onYesterday, daily.data != null])), `yday:${id}`, onYesterday ? POLL.stores : 0, "yesterday's sales");
  return { daily, today, yesterday };
}

/** One option for one place, before it takes the page's shape. */
type Built = { totals?: PeriodTotals; byStore?: Record<number, PeriodTotals>; chart?: PeriodSeries; figuresError?: string; chartError?: string };

/**
 * Every option of the switch for one place, from the rows that have arrived. `span` (the opening hours, from
 * store_now) is undefined while store_now loads: the hour charts wait for it so their axis does not jump.
 */
function buildPeriods(q: ReturnType<typeof usePeriodQueries>, at: { tz: string; now?: string; span: [number, number] | null | undefined; clock: DayClock | null; storeIds: number[] }) {
  const days = safely(() => readDays(q.daily.data), "sales by day");
  const hours = { today: safely(() => readHours(q.today.data, HOURLY), "today's sales"), yesterday: safely(() => readHours(q.yesterday.data, HOURLY_YESTERDAY), "yesterday's sales") };
  const dayError = q.daily.error ?? days.error;
  // The local date today: the clock's, else the daily rows' (days_ago 0).
  const today = at.clock?.today || days.value?.find(r => r.daysAgo === 0)?.date || (at.now ? localYmd(at.now, at.tz) : "");
  const out = {} as Record<DrillPeriod, Built>;
  for (const p of DRILL_PERIODS) {
    const b: Built = {};
    if (dayError) b.figuresError = dayError;
    else if (days.value) { b.totals = totalsOf(days.value, p); b.byStore = totalsByStore(days.value, p, at.storeIds); }
    if (p === "7d" || p === "30d") {
      if (dayError) b.chartError = dayError;
      else if (days.value) b.chart = daySeries(days.value, p, { today, running: at.clock?.running ?? true });
    } else {
      const read = hours[p], failed = q[p].error ?? read.error;
      if (failed) b.chartError = failed;
      else if (read.value && at.span !== undefined) b.chart = hourSeries(read.value, p === "today"
        ? { span: at.span, date: today, clock: at.clock ?? rowsClock(read.value, today) }
        : { span: at.span, date: today ? shiftDate(today, -1) : "", clock: null });
    }
    out[p] = b;
  }
  return out;
}

/* ── City ────────────────────────────────────────────────── */

/**
 * One city. `period` is the top bar's switch (it only picks which hour query runs: every option the rows allow
 * is in `periods`); `now` is the shell's clock, for the running hour and today's column.
 */
export function useCityData(cityKey: string, period: DrillPeriod = "today", now?: string): LivePage<CityViewModel> {
  const cities = useLive(useMetabaseQuery(Cities), "cities", 0, "the city");
  const stores = useLive(useStoreRows(), "stores", POLL.stores, "the stores");
  const outs = useLive(useMetabaseQuery(RecentStockouts, useMemo(() => ({ filters: [filter(RecentStockouts.source.fields.cityKey, "=", cityKey)] }), [cityKey])),
    `outs:${cityKey}`, POLL.stores, "stockouts");
  const vans = useLive(useMetabaseQuery(FleetNow, useMemo(() => ({ filters: [filter(FleetNow.source.fields.destCityKey, "=", cityKey)] }), [cityKey])),
    `vans:${cityKey}`, POLL.stores, "the vans");
  const sales = usePeriodQueries({ cityKey }, period);

  const vm = useMemo((): CityViewModel => {
    const errors: NonNullable<CityViewModel["errors"]> = {};
    const row = cities.data?.rows.find(c => c.city_key === cityKey);
    const mine = stores.data?.rows.filter(s => s.city_key === cityKey);
    const tz = sOrNull(row?.tz) ?? sOrNull(mine?.[0]?.tz) ?? "UTC";
    const opens = mine?.map(s => iso(s.opens_at)).filter((v): v is string => !!v).sort() ?? [];

    let city: CityViewModel["city"];
    if (cities.data && !row) city = null;
    else if (row && mine) {
      const closes = mine.map(s => iso(s.closes_at)).filter((v): v is string => !!v).sort();
      const span = mine[0] ? (Date.parse(String(iso(mine[0].closes_at))) - Date.parse(String(iso(mine[0].opens_at)))) / 36e5 : NaN;
      city = {
        key: cityKey, name: String(row.city_name), countryName: String(row.country_name), tz,
        isOpen: mine.some(s => bool(s.is_open)), opensAt: opens[0] ?? null, closesAt: closes[closes.length - 1] ?? null,
        openHours: Number.isFinite(span) ? ((span % 24) + 24) % 24 || 12 : 12,
      };
    }

    let storePart: CityStore[] | undefined;
    if (stores.error) errors.stores = stores.error;
    else if (mine) storePart = mine.map((r): CityStore => {
      const next = nextVanOf(r);
      return {
        id: n0(r.store_id), name: String(r.store_name), format: oneOf(r.store_format, FORMATS) ?? "standard",
        stockStatus: oneOf(r.stock_status, STOCK) ?? "ok", outVariety: variety(r.out_variety), outSince: iso(r.out_since), lowVariety: variety(r.low_variety),
        shelves: shelvesOf(r).map(({ incoming: _, ...shelf }) => shelf),
        restockHours: nOrNull(r.open_hours_to_next_delivery),
        soldToday: n0(r.sold_today_units), revenueToday: n0(r.revenue_today_usd), lostToday: n0(r.lost_today_units), lostTodayUsd: n0(r.lost_today_usd),
        nextVan: next && r.next_truck_id != null ? { truckId: String(r.next_truck_id), label: sOrNull(r.next_truck_label) ?? "", status: next.status, etaAt: next.etaAt, late: next.late } : null,
        nextPlannedAt: iso(r.next_planned_delivery_at),
      };
    });

    const stockouts: CityStockout[] | undefined = outs.data?.rows.filter(o => bool(o.is_ongoing)).flatMap(o => {
      const v = variety(o.variety_name), at = iso(o.started_at);
      return v && at ? [{ storeId: n0(o.store_id), storeName: String(o.store_name), variety: v, startedAt: at }] : [];
    });

    // Still on the road first, soonest first; a van unloading has arrived (its eta_at is past), so it comes last.
    let vanPart: CityVan[] | undefined;
    if (vans.error) errors.vans = vans.error;
    else if (vans.data) vanPart = vans.data.rows.flatMap((v): CityVan[] => {
      const status = oneOf(v.status, HEADING);
      return status ? [{
        truckId: String(v.truck_id), fleetNo: n0(v.fleet_no), label: String(v.truck_label), status, late: lateOf(v.late_minutes, v.delay_cause, v.delay_note),
        storeId: nOrNull(v.dest_store_id), storeName: sOrNull(v.dest_store_name), etaAt: iso(v.eta_at),
      }] : [];
    }).sort((a, b) => Number(a.status === "unloading") - Number(b.status === "unloading")
      || (a.etaAt ? Date.parse(a.etaAt) : Infinity) - (b.etaAt ? Date.parse(b.etaAt) : Infinity));

    // The opening day spans the earliest opening to the latest closing of the city's stores.
    const span = stores.error ? null : mine ? openSpan(mine.map(s => ({ opensAt: iso(s.opens_at), closesAt: iso(s.closes_at) })), tz) : undefined;
    const clock = mine ? dayClock(now, tz, { isOpen: mine.some(s => bool(s.is_open)), opensAt: opens[0] ?? null }) : null;
    const built = buildPeriods(sales, { tz, now, span, clock, storeIds: mine?.map(s => n0(s.store_id)) ?? [] });
    const periods = Object.fromEntries(DRILL_PERIODS.map((p): [DrillPeriod, CityPeriod] => {
      const { totals, byStore, chart, figuresError, chartError } = built[p];
      return [p, { totals, byStore, chart, errors: figuresError || chartError ? { figures: figuresError, chart: chartError } : undefined }];
    })) as Record<DrillPeriod, CityPeriod>;

    return { city, stores: storePart, stockouts: stockouts ?? (outs.error ? [] : undefined), vans: vanPart, periods, errors: Object.keys(errors).length ? errors : undefined };
  }, [cityKey, now, cities.data, stores.data, stores.error, outs.data, outs.error, vans.data, vans.error,
    sales.daily.data, sales.daily.error, sales.today.data, sales.today.error, sales.yesterday.data, sales.yesterday.error]);

  const parts = [cities, stores, outs, vans, sales.daily, sales.today, sales.yesterday];
  const refetches = parts.map(p => p.refetch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const retry = useCallback(() => refetches.forEach(r => r()), refetches);
  return { vm, refreshing: parts.some(p => p.refreshing), retry };
}

/* ── Store ───────────────────────────────────────────────── */

/** A truck id no van has: what the next-van query asks for while the store has none on the way. */
const NO_TRUCK = "—";

/** One store. `period` and `now` as for useCityData. */
export function useStoreData(storeId: number, period: DrillPeriod = "today", now?: string): LivePage<StoreViewModel> {
  const stores = useLive(useStoreRows(), "stores", POLL.stores, "the store");
  const outs = useLive(useMetabaseQuery(RecentStockouts, useMemo(() => ({ filters: [filter(RecentStockouts.source.fields.storeId, "=", storeId)] }), [storeId])),
    `outs:${storeId}`, POLL.stores, "stockouts");
  const trips = useLive(useMetabaseQuery(RecentDeliveries, useMemo(() => ({ filters: [filter(RecentDeliveries.source.fields.storeId, "=", storeId)] }), [storeId])),
    `trips:${storeId}`, POLL.stores, "deliveries");
  const details = useLive(useMetabaseQuery(StoreDetails, useMemo(() => ({ filters: [filter(StoreDetails.source.fields.storeId, "=", storeId)] }), [storeId])),
    `details:${storeId}`, POLL.stores, "store details");
  const sales = usePeriodQueries({ storeId }, period);

  const row = stores.data?.rows.find(s => n0(s.store_id) === storeId);
  const nextTruckId = row?.next_truck_id != null ? String(row.next_truck_id) : NO_TRUCK;
  // Only once the store's row names its next van (NO_TRUCK would be a query for nothing).
  const truck = useLive(useMetabaseQuery(FleetNow, useMemo(() => ({ filters: [filter(FleetNow.source.fields.truckId, "=", nextTruckId)], enabled: nextTruckId !== NO_TRUCK }), [nextTruckId])),
    `truck:${nextTruckId}`, POLL.stores, "the van");

  const vm = useMemo((): StoreViewModel => {
    // A part is undefined while it loads and null once it failed.
    const part = <T,>(failed: string | null | undefined, value: T | undefined): T | null | undefined => failed ? null : value;
    const notFound = !!stores.data && !row;
    const tz = sOrNull(row?.tz) ?? "UTC";

    let store: StoreNowVM | undefined;
    if (row) {
      const next = nextVanOf(row);
      store = {
        storeId, name: String(row.store_name), format: oneOf(row.store_format, FORMATS) ?? "standard",
        cityKey: String(row.city_key), cityName: String(row.city_name), countryName: String(row.country_name), tz,
        isOpen: bool(row.is_open), opensAt: iso(row.opens_at), closesAt: iso(row.closes_at),
        stockStatus: oneOf(row.stock_status, STOCK) ?? "ok", outVariety: variety(row.out_variety), outSince: iso(row.out_since), lowVariety: variety(row.low_variety),
        stock: shelvesOf(row).map((s): StoreStock => ({ variety: s.variety, onHand: s.onHand, capacity: s.capacity, coverHours: s.coverHours, incoming: next ? s.incoming : 0 })),
        restockHours: nOrNull(row.open_hours_to_next_delivery),
        today: { soldUnits: n0(row.sold_today_units), revenueUsd: n0(row.revenue_today_usd), lostUnits: n0(row.lost_today_units), lostUsd: n0(row.lost_today_usd) },
        week: { revenueUsd: n0(row.revenue_7d_usd), planUsd: nOrNull(row.plan_7d_usd), lyUsd: nOrNull(row.ly_7d_usd), fillRate: nOrNull(row.fill_rate_7d), availability: nOrNull(row.availability_7d), shrinkUsd: nOrNull(row.shrink_7d_usd) },
        season: { revenueUsd: n0(row.revenue_season_usd), planUsd: nOrNull(row.plan_season_usd), lyUsd: nOrNull(row.ly_season_usd), fillRate: nOrNull(row.fill_rate_season), availability: nOrNull(row.availability_season), shrinkUsd: nOrNull(row.shrink_season_usd) },
        next: next && row.next_trip_id != null ? {
          tripId: String(row.next_trip_id), truckId: String(row.next_truck_id ?? ""), truckLabel: sOrNull(row.next_truck_label) ?? "",
          driverName: sOrNull(row.next_driver_name) ?? "", status: next.status,
          etaAt: next.etaAt ?? "", plannedAt: iso(row.next_planned_at) ?? "", late: next.late, units: n0(row.next_units),
        } : null,
        nextPlannedAt: iso(row.next_planned_delivery_at),
      };
    }

    const delayOfTrip = new Map((trips.data?.rows ?? []).map(d => [String(d.trip_id), oneOf(d.delay_cause, DELAY_CAUSES)]));
    const stockouts: StoreStockout[] | undefined = outs.data?.rows.flatMap(o => {
      const v = variety(o.variety_name), at = iso(o.started_at);
      if (!v || !at) return [];
      return [{
        variety: v, startedAt: at, endedAt: iso(o.ended_at), isOngoing: bool(o.is_ongoing), daysAgo: n0(o.days_ago),
        lostUnits: n0(o.units_lost), lostUsd: n0(o.lost_revenue_usd), cause: oneOf(o.cause, CAUSES),
        truckId: sOrNull(o.truck_id), truckLabel: sOrNull(o.truck_label), delayCause: o.trip_id == null ? null : delayOfTrip.get(String(o.trip_id)) ?? null,
      }];
    });

    const deliveries: StoreDelivery[] | undefined = trips.data?.rows.map(d => {
      const delivered = n0(d.is_delivered) === 1;
      return {
        tripId: String(d.trip_id), localDate: ymd(d.local_date), daysAgo: n0(d.days_ago), truckId: String(d.truck_id), truckLabel: sOrNull(d.truck_label) ?? "",
        isDelivered: delivered, at: (delivered ? iso(d.arrived_at) : null) ?? iso(d.eta_at) ?? "",
        late: lateOf(d.late_minutes, d.delay_cause, d.delay_note), units: n0(d.units_total), damagedUnits: n0(d.damaged_units),
      };
    });

    const d = details.data?.rows[0];
    const detailPart = d ? {
      format: oneOf(d.store_format, FORMATS) ?? "standard", tz: sOrNull(d.tz) ?? "UTC",
      // stores.open_time / close_time are hidden on ClickHouse (its Metabase driver cannot read Time64), so the
      // hours come from store_now: its next opening and closing, on the store's own clock.
      openTime: time(iso(row?.opens_at), tz), closeTime: time(iso(row?.closes_at), tz),
      // Germany closes on Sundays; everywhere else opens every day.
      openDays: d.country_code === "DE" ? "Mon–Sat" : "every day",
      shelfCapacityUnits: n0(d.shelf_capacity_units), openedYear: n0(d.opened_year), storeLead: sOrNull(d.store_lead) ?? "—",
    } : details.data ? null : undefined;

    const t = truck.data?.rows[0];
    const nextTruck = t ? { serviceStatus: oneOf(t.service_status, SERVICE) ?? "ok", kmToService: n0(t.km_to_service) } : null;

    const span = stores.error || notFound ? null : row ? openSpan([{ opensAt: iso(row.opens_at), closesAt: iso(row.closes_at) }], tz) : undefined;
    const clock = row ? dayClock(now, tz, { isOpen: bool(row.is_open), opensAt: iso(row.opens_at) }) : null;
    const built = buildPeriods(sales, { tz, now, span, clock, storeIds: [storeId] });
    const periods = Object.fromEntries(DRILL_PERIODS.map((p): [DrillPeriod, StorePeriodPart] => {
      const { totals, chart, figuresError, chartError } = built[p];
      return [p, { totals: part(figuresError, totals), chart: part(chartError, chart) }];
    })) as Record<DrillPeriod, StorePeriodPart>;

    return {
      notFound,
      store: part(stores.error, store),
      periods,
      stockouts: part(outs.error, stockouts),
      deliveries: part(trips.error, deliveries),
      details: part(details.error, detailPart),
      nextTruck,
    };
  }, [storeId, now, row, stores.data, stores.error, outs.data, outs.error, trips.data, trips.error, details.data, details.error, truck.data,
    sales.daily.data, sales.daily.error, sales.today.data, sales.today.error, sales.yesterday.data, sales.yesterday.error]);

  const parts = [stores, outs, trips, details, truck, sales.daily, sales.today, sales.yesterday];
  const refetches = parts.map(p => p.refetch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const retry = useCallback(() => refetches.forEach(r => r()), refetches);
  return { vm, refreshing: parts.some(p => p.refreshing), retry };
}
