import type { StorePeriodPart, StoreViewModel } from "../pages/StorePage";
import type { DrillPeriod, Scope } from "../types";
import { ASTORIA, clockAt, GREENWICH, historyOf, periodsOf, seasonOf, type StoreStory, weekOf, YANAKA } from "./drill";
import { shellFixture } from "./shell";

/**
 * Mock stores for the Store page, at the shell fixture's clock: Wed 28 Oct 2026, 18:20 UTC.
 * Timestamps are UTC, as the database returns them; the comment beside each gives the store's local time.
 *
 *   astoria    New York, 14:20 EDT. Out of Carving since 13:40, its van is 1 h 25 m late. The approved mockup.
 *   greenwich  London (UK), 18:20 GMT. Nothing wrong: no van on the way, no stockout, ten hours of sales.
 *   yanaka     Tokyo, 03:20 JST on Thursday. Closed, out of Carving since last evening, today not started.
 */

/**
 * A store's history (drill.ts): the time switch's four options (its figures and chart), and its week and season
 * revenue and plan, summed from the same days so the page agrees with itself. Today's figures are the mockup's.
 */
function drill(story: StoreStory, tz: string, place: { isOpen: boolean; opensAt: string }) {
  const history = historyOf(story);
  const options = periodsOf([history], { span: story.span, clock: clockAt(shellFixture.clock.now, tz, place) });
  const periods = Object.fromEntries(Object.entries(options).map(([p, o]) => [p, { totals: o.totals, chart: o.chart }])) as Record<DrillPeriod, StorePeriodPart>;
  const week = weekOf(history), season = seasonOf(history);
  return { periods, week: { revenueUsd: week.revenueUsd, planUsd: week.planUsd }, season: { revenueUsd: season.revenueUsd, planUsd: season.planUsd } };
}
const astoriaDrill = drill(ASTORIA, "America/New_York", { isOpen: true, opensAt: "2026-10-28T13:00:00Z" });
const greenwichDrill = drill(GREENWICH, "Europe/London", { isOpen: true, opensAt: "2026-10-28T09:00:00Z" });
const yanakaDrill = drill(YANAKA, "Asia/Tokyo", { isOpen: false, opensAt: "2026-10-29T00:00:00Z" });

/** Astoria, store 13 (flagship). Numbers from the approved Store mockup. */
export const astoria: StoreViewModel = {
  store: {
    storeId: 13, name: "Astoria", format: "flagship", cityKey: "US-new-york", cityName: "New York", countryName: "United States", tz: "America/New_York",
    isOpen: true, opensAt: "2026-10-28T13:00:00Z" /* 09:00 */, closesAt: "2026-10-29T01:00:00Z" /* 21:00 */,
    stockStatus: "out", outVariety: "Carving", outSince: "2026-10-28T17:40:00Z" /* 13:40 */, lowVariety: null,
    // Shelf capacity 970 = 420 + 150 + 400. Express 107 carries Carving 300, Cooking 70, Mini 40.
    stock: [
      { variety: "Carving", onHand: 0, capacity: 420, coverHours: 0, incoming: 300 },
      { variety: "Cooking", onHand: 64, capacity: 150, coverHours: 9, incoming: 70 },
      { variety: "Mini", onHand: 210, capacity: 400, coverHours: 19.2, incoming: 40 },
    ],
    today: { soldUnits: 520, revenueUsd: 3400, lostUnits: 300, lostUsd: 1940 },
    // Last season ran 3% and 5% behind.
    week: { ...astoriaDrill.week, lyUsd: Math.round(astoriaDrill.week.revenueUsd * 0.969), fillRate: 0.86, availability: 0.91, shrinkUsd: 64 },
    season: { ...astoriaDrill.season, lyUsd: Math.round(astoriaDrill.season.revenueUsd * 0.946), fillRate: 0.93, availability: 0.96, shrinkUsd: 412 },
    next: {
      tripId: "PK-US-107-20261028-2", truckId: "PK-US-107", truckLabel: "Express 107", driverName: "Dana Whitfield", status: "stopped",
      etaAt: "2026-10-28T19:40:00Z" /* 15:40 */, plannedAt: "2026-10-28T18:15:00Z" /* 14:15 */,
      late: { minutes: 85, cause: "breakdown", note: "Breakdown, roadside repair" },
      units: 410,
    },
    nextPlannedAt: null,
  },
  nextTruck: { serviceStatus: "overdue", kmToService: -3240 },
  // Today adds up to 520 sold ($3.4k) and 300 lost ($1,940), all after 13:40 (drill.ts, ASTORIA).
  periods: astoriaDrill.periods,
  stockouts: [
    { variety: "Carving", startedAt: "2026-10-28T17:40:00Z" /* 13:40 */, endedAt: null, isOngoing: true, daysAgo: 0, lostUnits: 300, lostUsd: 1940, cause: "late_delivery", truckId: "PK-US-107", truckLabel: "Express 107", delayCause: "breakdown" },
    { variety: "Carving", startedAt: "2026-10-24T20:10:00Z" /* Sat 16:10 */, endedAt: "2026-10-24T22:30:00Z" /* 18:30 */, isOngoing: false, daysAgo: 4, lostUnits: 140, lostUsd: 910, cause: "demand_above_plan", truckId: null, truckLabel: null, delayCause: null },
    { variety: "Mini", startedAt: "2026-10-22T15:30:00Z" /* Thu 11:30 */, endedAt: "2026-10-22T16:05:00Z" /* 12:05 */, isOngoing: false, daysAgo: 6, lostUnits: 35, lostUsd: 87, cause: "late_delivery", truckId: "PK-US-112", truckLabel: "Express 112", delayCause: "traffic" },
  ],
  deliveries: [
    { tripId: "PK-US-107-20261028-2", localDate: "2026-10-28", daysAgo: 0, truckId: "PK-US-107", truckLabel: "Express 107", isDelivered: false, at: "2026-10-28T19:40:00Z" /* ETA 15:40 */, late: { minutes: 85, cause: "breakdown", note: "Breakdown, roadside repair" }, units: 410, damagedUnits: 0 },
    { tripId: "PK-US-112-20261027-1", localDate: "2026-10-27", daysAgo: 1, truckId: "PK-US-112", truckLabel: "Express 112", isDelivered: true, at: "2026-10-27T14:55:00Z" /* 10:55 */, late: { minutes: 0, cause: null, note: null }, units: 420, damagedUnits: 2 },
    { tripId: "PK-US-107-20261026-1", localDate: "2026-10-26", daysAgo: 2, truckId: "PK-US-107", truckLabel: "Express 107", isDelivered: true, at: "2026-10-26T15:40:00Z" /* 11:40 */, late: { minutes: 20, cause: "traffic", note: "Traffic on I-278" }, units: 400, damagedUnits: 0 },
  ],
  details: { format: "flagship", tz: "America/New_York", openTime: "09:00:00", closeTime: "21:00:00", openDays: "every day", shelfCapacityUnits: 970, openedYear: 2019, storeLead: "Rosa Delgado" },
};

/** Greenwich, store 44 (express). A quiet day: everything in stock, the morning van came on time, the next one is tomorrow. */
export const greenwich: StoreViewModel = {
  store: {
    storeId: 44, name: "Greenwich", format: "express", cityKey: "GB-london", cityName: "London", countryName: "United Kingdom", tz: "Europe/London",
    isOpen: true, opensAt: "2026-10-28T09:00:00Z" /* 09:00 */, closesAt: "2026-10-28T20:00:00Z" /* 20:00 */,
    stockStatus: "ok", outVariety: null, outSince: null, lowVariety: null,
    stock: [
      { variety: "Carving", onHand: 150, capacity: 220, coverHours: 14.3, incoming: 0 },
      { variety: "Cooking", onHand: 62, capacity: 90, coverHours: 16.5, incoming: 0 },
      { variety: "Mini", onHand: 128, capacity: 200, coverHours: 22, incoming: 0 },
    ],
    today: { soldUnits: 360, revenueUsd: 2484, lostUnits: 0, lostUsd: 0 },
    week: { ...greenwichDrill.week, lyUsd: Math.round(greenwichDrill.week.revenueUsd * 0.94), fillRate: 0.99, availability: 1, shrinkUsd: 31 },
    season: { ...greenwichDrill.season, lyUsd: Math.round(greenwichDrill.season.revenueUsd * 0.9375), fillRate: 0.98, availability: 0.99, shrinkUsd: 196 },
    next: null,
    nextPlannedAt: "2026-10-29T10:10:00Z" /* Thu 10:10 */,
  },
  nextTruck: null,
  periods: greenwichDrill.periods,
  stockouts: [],
  // Six in the last 7 days: the page lists the newest five.
  deliveries: [
    { tripId: "PK-GB-309-20261028-1", localDate: "2026-10-28", daysAgo: 0, truckId: "PK-GB-309", truckLabel: "Express 309", isDelivered: true, at: "2026-10-28T11:05:00Z", late: { minutes: 0, cause: null, note: null }, units: 240, damagedUnits: 0 },
    { tripId: "PK-GB-302-20261027-1", localDate: "2026-10-27", daysAgo: 1, truckId: "PK-GB-302", truckLabel: "Express 302", isDelivered: true, at: "2026-10-27T11:20:00Z", late: { minutes: 5, cause: "traffic", note: "Traffic on the M1" }, units: 250, damagedUnits: 0 },
    { tripId: "PK-GB-309-20261026-1", localDate: "2026-10-26", daysAgo: 2, truckId: "PK-GB-309", truckLabel: "Express 309", isDelivered: true, at: "2026-10-26T10:50:00Z", late: { minutes: 0, cause: null, note: null }, units: 230, damagedUnits: 1 },
    { tripId: "PK-GB-311-20261025-1", localDate: "2026-10-25", daysAgo: 3, truckId: "PK-GB-311", truckLabel: "Express 311", isDelivered: true, at: "2026-10-25T11:35:00Z", late: { minutes: 25, cause: "late_departure", note: "No van free at 09:10" }, units: 260, damagedUnits: 0 },
    { tripId: "PK-GB-302-20261024-1", localDate: "2026-10-24", daysAgo: 4, truckId: "PK-GB-302", truckLabel: "Express 302", isDelivered: true, at: "2026-10-24T10:00:00Z" /* 11:00 BST */, late: { minutes: 0, cause: null, note: null }, units: 270, damagedUnits: 0 },
    { tripId: "PK-GB-309-20261023-1", localDate: "2026-10-23", daysAgo: 5, truckId: "PK-GB-309", truckLabel: "Express 309", isDelivered: true, at: "2026-10-23T09:45:00Z" /* 10:45 BST */, late: { minutes: 0, cause: null, note: null }, units: 250, damagedUnits: 0 },
  ],
  details: { format: "express", tz: "Europe/London", openTime: "09:00:00", closeTime: "20:00:00", openDays: "every day", shelfCapacityUnits: 510, openedYear: 2021, storeLead: "Imogen Clarke" },
};

/** Yanaka, store 88 (express). Before opening: no sales yet today, Carving ran out last evening, Cooking is low, the first van is planned for 06:25. */
export const yanaka: StoreViewModel = {
  store: {
    storeId: 88, name: "Yanaka", format: "express", cityKey: "JP-tokyo", cityName: "Tokyo", countryName: "Japan", tz: "Asia/Tokyo",
    isOpen: false, opensAt: "2026-10-29T00:00:00Z" /* Thu 09:00 */, closesAt: "2026-10-29T12:00:00Z" /* Thu 21:00 */,
    stockStatus: "out", outVariety: "Carving", outSince: "2026-10-28T10:40:00Z" /* Wed 19:40 */, lowVariety: "Cooking",
    stock: [
      { variety: "Carving", onHand: 0, capacity: 220, coverHours: 0, incoming: 0 },
      { variety: "Cooking", onHand: 18, capacity: 90, coverHours: 3.4, incoming: 0 },
      { variety: "Mini", onHand: 96, capacity: 200, coverHours: 15, incoming: 0 },
    ],
    today: { soldUnits: 0, revenueUsd: 0, lostUnits: 0, lostUsd: 0 },
    week: { ...yanakaDrill.week, lyUsd: Math.round(yanakaDrill.week.revenueUsd * 0.942), fillRate: 0.95, availability: 0.94, shrinkUsd: 22 },
    season: { ...yanakaDrill.season, lyUsd: Math.round(yanakaDrill.season.revenueUsd * 0.938), fillRate: 0.97, availability: 0.97, shrinkUsd: 148 },
    next: null,
    nextPlannedAt: "2026-10-28T21:25:00Z" /* Thu 06:25 */,
  },
  nextTruck: null,
  periods: yanakaDrill.periods,
  stockouts: [
    { variety: "Carving", startedAt: "2026-10-28T10:40:00Z" /* Wed 19:40 */, endedAt: null, isOngoing: true, daysAgo: 1, lostUnits: 45, lostUsd: 330, cause: "demand_above_plan", truckId: null, truckLabel: null, delayCause: null },
  ],
  deliveries: [
    { tripId: "PK-JP-512-20261028-1", localDate: "2026-10-28", daysAgo: 1, truckId: "PK-JP-512", truckLabel: "Express 512", isDelivered: true, at: "2026-10-28T01:35:00Z" /* Wed 10:35 */, late: { minutes: 0, cause: null, note: null }, units: 260, damagedUnits: 0 },
    { tripId: "PK-JP-507-20261027-2", localDate: "2026-10-27", daysAgo: 2, truckId: "PK-JP-507", truckLabel: "Express 507", isDelivered: true, at: "2026-10-27T04:10:00Z" /* Tue 13:10 */, late: { minutes: 25, cause: "traffic", note: "Traffic on the Keiyo Road" }, units: 240, damagedUnits: 3 },
  ],
  details: { format: "express", tz: "Asia/Tokyo", openTime: "09:00:00", closeTime: "21:00:00", openDays: "every day", shelfCapacityUnits: 510, openedYear: 2022, storeLead: "Haruka Mori" },
};

/** The approved screen: Astoria. */
export const fixture: StoreViewModel = astoria;

/**
 * Fixture phase only: the region control picks the mock store, so the page's other states can be looked
 * at in the app and in the preview (`node scripts/preview.mjs Store --scope '{"region":"EU"}'`).
 * All regions and North America show Astoria, Europe shows Greenwich, Asia-Pacific shows Yanaka.
 * With live data the store comes from the route (:storeId) and the region control leaves this page alone.
 */
export function fixtureFor(scope: Scope): StoreViewModel {
  return scope.region === "EU" ? greenwich : scope.region === "APAC" ? yanaka : astoria;
}
