import { aggregations, breakout, defineQuery, filter, orderBy } from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/live.metabase.data";

/*
 * Every query Pumpkin Dispatch runs, on the clock-safe `pumpkin_live` views (Library / Data). Each one is
 * static: what a page picks at runtime (a truck, a store, a city) goes in the hook's second argument, as a
 * filter on a column the query returns. Dates are never filtered with Metabase's relative-date filters:
 * the views carry `days_ago` on the simulated clock, and that is what these filter on.
 *
 * This SDK cannot name aggregations (two sums both come back as "sum", "sum_2"), so the hooks in src/data/
 * read aggregated queries by column position: breakouts first, then aggregations, in the order written
 * here. Reordering either means updating the column list next to the hook that reads it.
 */

const t = schema.tables;
const m = schema.metrics;

/* ── Clock ───────────────────────────────────────────────── */

/** sim_status: the one row that drives the clock pill and the Halloween chip. */
export const SimStatus = defineQuery({
    source: t.simStatus,
    fields: [t.simStatus.fields.simNow, t.simStatus.fields.mode, t.simStatus.fields.daysToHalloween, t.simStatus.fields.lastTickAt],
    savedQuestionSourceId: 483
});

const fleetNow = t.fleetNow;
/** fleet_now: how many vans are late right now (the orange dot on Harvest & fleet). */
export const LateVans = defineQuery({
    source: fleetNow,
    filters: [filter(fleetNow.fields.isLate, "=", true)],
    aggregations: [aggregations.count()],
    savedQuestionSourceId: 484
});

/**
 * countries: the countries the viewer may see. Metabase's row and column security returns only a viewer's own
 * (a Canada group member gets CA alone); an admin gets all five. The shell reads it once (src/visible.ts).
 */
export const Countries = defineQuery({
    source: t.countries,
    fields: [t.countries.fields.countryCode],
    savedQuestionSourceId: 485
});

/* ── Business ────────────────────────────────────────────── */

const daily = t.dailyStoreSales;
const dim = m.revenue.dimensions.dailyStoreSales;
/**
 * daily_store_sales by country, day and variety, aggregated with the Library metrics (Revenue, Revenue plan,
 * Last season revenue, Gross margin, Pumpkins sold, Lost sales, Lost sales to late deliveries, Shrink,
 * Delivery cost, Plan gross margin, Last season gross margin) plus the plain sums the metrics do not cover
 * (lost to hub shortage and to demand, shrink in transit, markdowns, online revenue, units requested, plan
 * units, last season units). The Business hook adds these rows up into the periods (today, 7 days, season),
 * the daily chart and the tiles' sparklines, Plan to actual, the mix, and the Breakdown's country, variety
 * and channel rows. The SDK cannot name aggregations, so the hook reads the columns by position: keep the
 * order of breakouts and aggregations in step with DAILY in src/data/useBusinessData.ts.
 */
export const BusinessDaily = defineQuery({
    source: daily,
    aggregations: [
        m.revenue,
        m.revenuePlan,
        m.lastSeasonRevenue,
        m.grossMargin,
        m.pumpkinsSold,
        m.lostSales,
        m.lostSalesToLateDeliveries,
        m.shrink,
        m.deliveryCost,
        aggregations.sum(dim.lostShortageUsd),
        aggregations.sum(dim.lostDemandUsd),
        aggregations.sum(dim.shrinkTransitUsd),
        aggregations.sum(dim.markdownUsd),
        aggregations.sum(dim.onlineRevenueUsd),
        aggregations.sum(dim.unitsRequested),
        aggregations.sum(dim.planUnits),
        aggregations.sum(dim.lyUnits),
        m.planGrossMargin,
        m.lastSeasonGrossMargin,
    ],
    breakouts: [
        breakout(dim.countryCode),
        breakout(dim.daysAgo),
        breakout(dim.localDate, { unit: "day" }),
        breakout(dim.isWeekend),
        breakout(dim.varietyName),
    ],
    savedQuestionSourceId: 486
});

/**
 * daily_store_sales of the last 29 days by city, store format and day (days_ago and its local_date): the
 * Breakdown's city and store format rows (today and 7 days) and their trends over the chart's 28 local dates.
 * The chart ends on the latest local date with sales, so in the UTC evening Japan's oldest column is its
 * days_ago 28. 75 city × format pairs × 29 days = 2,175 rows (local_date adds none: a country's stores share
 * one date per days_ago). Columns by position: keep in step with BREAKDOWN in src/data/useBusinessData.ts.
 */
export const BusinessBreakdownDaily = defineQuery({
    source: daily,
    filters: [filter(daily.fields.daysAgo, "<=", 28)],
    aggregations: [
        m.revenue,
        m.revenuePlan,
        m.lastSeasonRevenue,
        m.grossMargin,
        m.planGrossMargin,
        m.lastSeasonGrossMargin,
        m.pumpkinsSold,
        aggregations.sum(daily.fields.planUnits),
        aggregations.sum(daily.fields.lyUnits),
        m.lostSales,
    ],
    breakouts: [
        breakout(daily.fields.countryCode),
        breakout(daily.fields.cityKey),
        breakout(daily.fields.cityName),
        breakout(daily.fields.storeFormat),
        breakout(daily.fields.daysAgo),
        breakout(daily.fields.localDate, { unit: "day" }),
    ],
    savedQuestionSourceId: 487
});

/** The same sums for the whole season (Sep 1 to today), by city and store format: the Breakdown's season rows. */
export const BusinessBreakdownSeason = defineQuery({
    source: daily,
    aggregations: [
        m.revenue,
        m.revenuePlan,
        m.lastSeasonRevenue,
        m.grossMargin,
        m.planGrossMargin,
        m.lastSeasonGrossMargin,
        m.pumpkinsSold,
        aggregations.sum(daily.fields.planUnits),
        aggregations.sum(daily.fields.lyUnits),
        m.lostSales,
    ],
    breakouts: [
        breakout(daily.fields.countryCode),
        breakout(daily.fields.cityKey),
        breakout(daily.fields.cityName),
        breakout(daily.fields.storeFormat),
    ],
    savedQuestionSourceId: 488
});

const hourly = t.hourlyStoreSales;
/**
 * hourly_store_sales by country, day and local hour (the view keeps the last 8 local days): the hook compares
 * today's started hours with the same hours a week ago ("vs last <weekday>").
 */
export const BusinessHourly = defineQuery({
    source: hourly,
    aggregations: [aggregations.sum(hourly.fields.revenueUsd)],
    breakouts: [breakout(hourly.fields.countryCode), breakout(hourly.fields.daysAgo), breakout(hourly.fields.localHour)],
    savedQuestionSourceId: 489
});

/** season_plan: one row per country. */
export const SeasonPlan = defineQuery({
    source: t.seasonPlan,
    fields: [
        t.seasonPlan.fields.countryCode, t.seasonPlan.fields.regionCode, t.seasonPlan.fields.revenueToDateUsd,
        t.seasonPlan.fields.planToDateRevenueUsd, t.seasonPlan.fields.seasonPlanRevenueUsd, t.seasonPlan.fields.daysLeft,
        t.seasonPlan.fields.lySeasonRevenueUsd, t.seasonPlan.fields.lyToDateRevenueUsd,
    ],
    savedQuestionSourceId: 490
});

const seasonDaily = t.seasonDaily;
/** season_daily: every day of the season (Sep 1 to Nov 15) per country, added up from Sep 1. 380 rows. */
export const SeasonDaily = defineQuery({
    source: seasonDaily,
    fields: [
        seasonDaily.fields.countryCode, seasonDaily.fields.localDate, seasonDaily.fields.isToday, seasonDaily.fields.daysToHalloween,
        seasonDaily.fields.cumPlanRevenueUsd, seasonDaily.fields.cumLyRevenueUsd, seasonDaily.fields.cumRevenueUsd,
    ],
    orderBys: [orderBy(seasonDaily.fields.localDate, "asc")],
    savedQuestionSourceId: 491
});

const landing = t.seasonLanding;
/** season_landing by country: the metric Projected season revenue, with the low and high ends of its range. Columns by position. */
export const SeasonLanding = defineQuery({
    source: landing,
    aggregations: [m.projectedSeasonRevenue, aggregations.sum(landing.fields.landingLowUsd), aggregations.sum(landing.fields.landingHighUsd)],
    breakouts: [breakout(landing.fields.countryCode)],
    savedQuestionSourceId: 492
});

const outlook = t.stockOutlook;
/**
 * stock_outlook by country and variety (15 rows): stock on hand, the harvest still planned, expected sales,
 * and the projected leftover on Nov 1 with the metrics Projected leftover after Halloween, Leftover stock at
 * cost and Markdown exposure. Columns by position: keep in step with STOCK in src/data/useBusinessData.ts.
 */
export const StockOutlook = defineQuery({
    source: outlook,
    aggregations: [
        aggregations.sum(outlook.fields.storeUnits),
        aggregations.sum(outlook.fields.hubUnits),
        aggregations.sum(outlook.fields.transitUnits),
        aggregations.sum(outlook.fields.harvestPlanUnits),
        aggregations.sum(outlook.fields.soldExpectedUnits),
        m.projectedLeftoverAfterHalloween,
        aggregations.sum(outlook.fields.leftoverNov1LowUnits),
        aggregations.sum(outlook.fields.leftoverNov1HighUnits),
        m.leftoverStockAtCost,
        aggregations.sum(outlook.fields.leftoverNov1RetailUsd),
        m.markdownExposure,
        aggregations.sum(outlook.fields.seasonEndLeftoverUnits),
        aggregations.sum(outlook.fields.seasonEndLeftoverCostUsd),
        aggregations.sum(outlook.fields.novemberDemandUnits),
    ],
    breakouts: [breakout(outlook.fields.countryCode), breakout(outlook.fields.varietyName)],
    savedQuestionSourceId: 493
});

const pulse = t.salesPulse;
/**
 * sales_pulse: one row per country, today's sales so far (each country's local today) and the last hour's
 * (Live sales: "629 sales · $9,552 in the last hour"). Polled every 10 seconds.
 */
export const SalesPulse = defineQuery({
    source: pulse,
    fields: [
        pulse.fields.countryCode, pulse.fields.regionCode, pulse.fields.localDate, pulse.fields.revenueTodayUsd,
        pulse.fields.salesLastHour, pulse.fields.secondsSinceLastSale, pulse.fields.revenueLastHourUsd, pulse.fields.unitsToday,
    ],
    savedQuestionSourceId: 494
});

const recent = t.recentSales;
/**
 * recent_sales: every sale of the last 2 hours, newest first. Narrowed to the scope (region or country) and
 * cut to the newest 20 at runtime, in the hook's second argument (the hero's last sale and Live sales). Polled
 * every 10 seconds.
 */
export const RecentSales = defineQuery({
    source: recent,
    fields: [
        recent.fields.saleId, recent.fields.soldAt, recent.fields.secondsAgo, recent.fields.storeId, recent.fields.storeName,
        recent.fields.cityName, recent.fields.countryCode, recent.fields.regionCode, recent.fields.varietyName,
        recent.fields.channel, recent.fields.units, recent.fields.amountUsd,
    ],
    orderBys: [orderBy(recent.fields.soldAt, "desc")],
    savedQuestionSourceId: 495
});

const events = t.businessEvents;
/**
 * business_events of the last 29 local days (storms, van breakdowns and ventilation faults, hub shortages),
 * oldest first: Daily revenue puts each on its own local_date's column (Japan's oldest column can be its
 * days_ago 28).
 */
export const BusinessEvents = defineQuery({
    source: events,
    fields: [
        events.fields.eventId, events.fields.kind, events.fields.localDate, events.fields.daysAgo, events.fields.startedAt, events.fields.endedAt,
        events.fields.countryCode, events.fields.regionCode, events.fields.hubId, events.fields.truckId,
        events.fields.title, events.fields.detail, events.fields.lostRevenueUsd,
    ],
    filters: [filter(events.fields.daysAgo, "<=", 28)],
    orderBys: [orderBy(events.fields.startedAt, "asc")],
    savedQuestionSourceId: 496
});

/* ── Explore (definition cards) ──────────────────────────── */

/*
 * One Library metric on daily_store_sales by day and country, for the Explore sheet of a definition card
 * (src/pages/business/Explore.tsx turns it into an InteractiveQuestion). Named Explore<Key> after the
 * ExploreKey in src/definitions.ts: Explore.tsx looks them up by that name.
 */

/** Revenue by day and country. */
export const ExploreRevenue = defineQuery({
    source: daily,
    aggregations: [m.revenue],
    breakouts: [breakout(dim.localDate, { unit: "day" }), breakout(dim.countryName)],
    savedQuestionSourceId: 497
});

/** Gross margin by day and country. */
export const ExploreGrossMargin = defineQuery({
    source: daily,
    aggregations: [m.grossMargin],
    breakouts: [breakout(dim.localDate, { unit: "day" }), breakout(dim.countryName)],
    savedQuestionSourceId: 498
});

/** Average selling price by day and country. */
export const ExploreAverageSellingPrice = defineQuery({
    source: daily,
    aggregations: [m.averageSellingPrice],
    breakouts: [breakout(dim.localDate, { unit: "day" }), breakout(dim.countryName)],
    savedQuestionSourceId: 499
});

/** Pumpkins sold by day and country. */
export const ExplorePumpkinsSold = defineQuery({
    source: daily,
    aggregations: [m.pumpkinsSold],
    breakouts: [breakout(dim.localDate, { unit: "day" }), breakout(dim.countryName)],
    savedQuestionSourceId: 500
});

/** Lost sales by day and country. */
export const ExploreLostSales = defineQuery({
    source: daily,
    aggregations: [m.lostSales],
    breakouts: [breakout(dim.localDate, { unit: "day" }), breakout(dim.countryName)],
    savedQuestionSourceId: 501
});

/** Delivery cost by day and country. */
export const ExploreDeliveryCost = defineQuery({
    source: daily,
    aggregations: [m.deliveryCost],
    breakouts: [breakout(dim.localDate, { unit: "day" }), breakout(dim.countryName)],
    savedQuestionSourceId: 502
});

/** Shrink by day and country. */
export const ExploreShrink = defineQuery({
    source: daily,
    aggregations: [m.shrink],
    breakouts: [breakout(dim.localDate, { unit: "day" }), breakout(dim.countryName)],
    savedQuestionSourceId: 503
});

/* ── Harvest & fleet, and the van page ───────────────────── */

/** hub_now: one row per hub. */
export const HubNow = defineQuery({ source: t.hubNow, savedQuestionSourceId: 504 });

/** fleet_now: one row per van. Pages narrow it with a dynamic filter (truck_id, dest_city_key). */
export const FleetNow = defineQuery({ source: fleetNow, orderBys: [orderBy(fleetNow.fields.fleetNo, "asc")], savedQuestionSourceId: 505 });

/** cities: the 25 cities, in hub → city drive order. */
export const Cities = defineQuery({ source: t.cities, orderBys: [orderBy(t.cities.fields.driveMin, "asc")], savedQuestionSourceId: 506 });

const harvest = t.harvestDaily;
/** harvest_daily yesterday by hub: the bins a hub shows before its first pick of the day. */
export const HarvestYesterday = defineQuery({
    source: harvest,
    filters: [filter(harvest.fields.daysAgo, "=", 1)],
    aggregations: [aggregations.sum(harvest.fields.bins), aggregations.sum(harvest.fields.planBins)],
    breakouts: [breakout(harvest.fields.hubId)],
    savedQuestionSourceId: 507
});

const deliveries = t.deliveries;
/**
 * deliveries of the last 14 days by country, hub, day and delay cause: trips, stops delivered and on time.
 * Feeds "On time, 7 days" (and the week before) and whether a hub has started its day.
 */
export const DeliveriesByDay = defineQuery({
    source: deliveries,
    filters: [filter(deliveries.fields.daysAgo, "<=", 13)],
    aggregations: [
        aggregations.count(),
        aggregations.sum(deliveries.fields.isDelivered),
        aggregations.sum(deliveries.fields.isOnTime),
    ],
    breakouts: [breakout(deliveries.fields.countryCode), breakout(deliveries.fields.hubId), breakout(deliveries.fields.daysAgo), breakout(deliveries.fields.delayCause)],
    savedQuestionSourceId: 508
});

/** deliveries of the last 7 days, one row per trip. Narrowed to one van or one store at runtime. */
export const RecentDeliveries = defineQuery({
    source: deliveries,
    fields: [
        deliveries.fields.tripId, deliveries.fields.localDate, deliveries.fields.daysAgo, deliveries.fields.truckId, deliveries.fields.truckLabel,
        deliveries.fields.storeId, deliveries.fields.storeName, deliveries.fields.cityName, deliveries.fields.kmTotal, deliveries.fields.status,
        deliveries.fields.isDelivered, deliveries.fields.arrivedAt, deliveries.fields.etaAt, deliveries.fields.lateMinutes,
        deliveries.fields.delayCause, deliveries.fields.delayNote, deliveries.fields.unitsTotal, deliveries.fields.damagedUnits,
    ],
    filters: [filter(deliveries.fields.daysAgo, "<=", 6)],
    orderBys: [orderBy(deliveries.fields.plannedDepartAt, "desc")],
    savedQuestionSourceId: 509
});

/**
 * deliveries of the whole season, one row per trip, newest first: the van page's trip list, its band and its
 * season chart. Narrowed to one van at runtime (about 25 trips a van by Halloween).
 */
export const TruckTrips = defineQuery({
    source: deliveries,
    fields: [
        deliveries.fields.tripId, deliveries.fields.truckId, deliveries.fields.localDate, deliveries.fields.daysAgo, deliveries.fields.wave,
        deliveries.fields.storeId, deliveries.fields.storeName, deliveries.fields.cityName, deliveries.fields.kmTotal, deliveries.fields.kmDone,
        deliveries.fields.status, deliveries.fields.isDelivered, deliveries.fields.isOnTime, deliveries.fields.isLate,
        deliveries.fields.lateMinutes, deliveries.fields.delayCause, deliveries.fields.delayNote,
        deliveries.fields.plannedDepartAt, deliveries.fields.departedAt, deliveries.fields.plannedArriveAt, deliveries.fields.arrivedAt,
        deliveries.fields.etaAt, deliveries.fields.unloadedAt, deliveries.fields.returnedAt,
        deliveries.fields.unitsTotal, deliveries.fields.carvingUnits, deliveries.fields.cookingUnits, deliveries.fields.miniUnits,
        deliveries.fields.damagedUnits, deliveries.fields.bins, deliveries.fields.capacityBins, deliveries.fields.kg,
        deliveries.fields.cargoValueUsd, deliveries.fields.deliveryCostUsd,
    ],
    orderBys: [orderBy(deliveries.fields.plannedDepartAt, "desc")],
    savedQuestionSourceId: 510
});

/** deliveries of the whole season by van: trips, stops delivered and on time. The "All vans" hover card's season line. */
export const VanSeason = defineQuery({
    source: deliveries,
    aggregations: [
        aggregations.count(),
        aggregations.sum(deliveries.fields.isDelivered),
        aggregations.sum(deliveries.fields.isOnTime),
    ],
    breakouts: [breakout(deliveries.fields.truckId)],
    savedQuestionSourceId: 511
});

/** trip_timeline: the steps of each van's current (or latest) trip. Narrowed to one van at runtime. */
export const TripTimeline = defineQuery({ source: t.tripTimeline, orderBys: [orderBy(t.tripTimeline.fields.seq, "asc")], savedQuestionSourceId: 512 });

/** truck_faults of the last 30 days. Narrowed to one van at runtime. */
export const TruckFaults = defineQuery({ source: t.truckFaults, orderBys: [orderBy(t.truckFaults.fields.raisedAt, "desc")], savedQuestionSourceId: 513 });

/** Average daily demand per store and variety over the last 7 full days: how long a load lasts. Narrowed to one store at runtime. */
export const StoreDemand = defineQuery({
    source: daily,
    filters: [filter(daily.fields.daysAgo, "between", [1, 7])],
    aggregations: [aggregations.sum(daily.fields.unitsRequested)],
    breakouts: [breakout(daily.fields.storeId), breakout(daily.fields.varietyName)],
    savedQuestionSourceId: 514
});

/* ── Stores, city and store ──────────────────────────────── */

/** store_now: one row per store (100). */
export const StoreNow = defineQuery({ source: t.storeNow, orderBys: [orderBy(t.storeNow.fields.storeId, "asc")], savedQuestionSourceId: 515 });

/** hourly_store_sales today, by store and local hour. Narrowed to a city or a store at runtime. */
export const HourlyToday = defineQuery({
    source: hourly,
    filters: [filter(hourly.fields.daysAgo, "=", 0)],
    aggregations: [
        aggregations.sum(hourly.fields.unitsSold),
        aggregations.sum(hourly.fields.unitsLost),
        aggregations.sum(hourly.fields.revenueUsd),
        aggregations.sum(hourly.fields.lostRevenueUsd),
    ],
    breakouts: [breakout(hourly.fields.cityKey), breakout(hourly.fields.storeId), breakout(hourly.fields.localHour), breakout(hourly.fields.isCurrentHour)],
    savedQuestionSourceId: 516
});

/*
 * The time switch (Today · Yesterday · 7 days · 30 days) on the City and Store pages. Today's hours stay on
 * HourlyToday above; these two add yesterday's hours and the last 30 days. New queries rather than wider old
 * ones: the deployed app reads the old saved questions by column position, so an extra column would break it.
 */

/**
 * hourly_store_sales yesterday (days_ago 1), by store and local hour: "Yesterday by hour". Narrowed to a city or
 * a store at runtime. Columns by position: keep in step with HOURLY_YESTERDAY in src/data/useStoresData.ts.
 */
export const HourlyYesterday = defineQuery({
    source: hourly,
    filters: [filter(hourly.fields.daysAgo, "=", 1)],
    aggregations: [
        aggregations.sum(hourly.fields.unitsSold),
        aggregations.sum(hourly.fields.unitsLost),
        aggregations.sum(hourly.fields.revenueUsd),
        aggregations.sum(hourly.fields.lostRevenueUsd),
    ],
    breakouts: [breakout(hourly.fields.cityKey), breakout(hourly.fields.storeId), breakout(hourly.fields.localHour)],
    savedQuestionSourceId: 517
});

/**
 * daily_store_sales of the last 30 local days (days_ago 0..29) by store and day, with the Library metrics Pumpkins
 * sold, Revenue, Lost sales and Revenue plan (paced to the local time today) and the units lost: every period's
 * figures (the band, the store table's Sold, Lost, Revenue and vs plan) and the 7 and 30 days charts, so the
 * switch needs no new query between them. Narrowed to a city or a store at runtime (a city: 4 stores × 30 days).
 * Columns by position: keep in step with DAILY in src/data/useStoresData.ts.
 */
export const DailyByStore = defineQuery({
    source: daily,
    filters: [filter(daily.fields.daysAgo, "<=", 29)],
    aggregations: [m.pumpkinsSold, m.revenue, aggregations.sum(daily.fields.unitsLost), m.lostSales, m.revenuePlan],
    breakouts: [
        breakout(daily.fields.cityKey),
        breakout(daily.fields.storeId),
        breakout(daily.fields.daysAgo),
        breakout(daily.fields.localDate, { unit: "day" }),
    ],
    savedQuestionSourceId: 518
});

const stockouts = t.stockouts;
/** stockouts of the last 7 days. Narrowed to a city or a store at runtime. */
export const RecentStockouts = defineQuery({
    source: stockouts,
    filters: [filter(stockouts.fields.daysAgo, "<=", 6)],
    orderBys: [orderBy(stockouts.fields.startedAt, "desc")],
    savedQuestionSourceId: 519
});

/** stores: the master row (hours, capacity, opened, lead). Narrowed to one store at runtime. */
export const StoreDetails = defineQuery({ source: t.stores, savedQuestionSourceId: 520 });
