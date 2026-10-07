import type { CityViewModel } from "../pages/CityPage";
import { ASTORIA, CHELSEA, clockAt, HARLEM, historyOf, hourRowsOf, PARK_SLOPE, periodsOf } from "./drill";
import { shellFixture } from "./shell";

/**
 * New York at 14:20 EDT on Wed 28 Oct, as in the approved mockup: Astoria has been out of Carving since
 * 13:40 because Express 107 broke down on the way, Park Slope is low, and three vans are heading in.
 * Times are UTC (EDT is UTC−4). Cover of Cooking and Mini is not on the mockup: those hours are filled in so
 * that Carving stays the shortest (0, 1.2, 19.2 and 22.8 open hours average 10.8, which is 0.9 days of 12).
 *
 * The time switch's four options come from the stores' histories (drill.ts): today is the mockup's, and the
 * days before run up to Halloween.
 */
const histories = [ASTORIA, PARK_SLOPE, HARLEM, CHELSEA].map(historyOf);
/** The mockup's hours, the city's stores together: 09:00 to 14:20, the last one still running. 11,900 USD in all. */
const cityHours = hourRowsOf(0, [[9, 190, 0, 0], [10, 260, 0, 0], [11, 330, 0, 0], [12, 380, 0, 0], [13, 410, 130, 840], [14, 270, 170, 1100]], 11900);
const periods = periodsOf(histories, {
  span: [9, 21],
  clock: clockAt(shellFixture.clock.now, "America/New_York", { isOpen: true, opensAt: "2026-10-28T13:00:00Z" }),
  todayHours: cityHours,
});

export const fixture: CityViewModel = {
  city: {
    key: "US-new-york",
    name: "New York",
    countryName: "United States",
    tz: "America/New_York",
    isOpen: true,
    opensAt: "2026-10-28T13:00:00Z",
    closesAt: "2026-10-29T01:00:00Z",
    openHours: 12,
  },
  stores: [
    {
      id: 13, name: "Astoria", format: "flagship",
      stockStatus: "out", outVariety: "Carving", outSince: "2026-10-28T17:40:00Z", lowVariety: null,
      shelves: [
        { variety: "Carving", onHand: 0, capacity: 420, coverHours: 0 },
        { variety: "Cooking", onHand: 64, capacity: 150, coverHours: 15.6 },
        { variety: "Mini", onHand: 210, capacity: 400, coverHours: 28.8 },
      ],
      soldToday: 520, revenueToday: 3400, lostToday: 300, lostTodayUsd: 1940,
      nextVan: { truckId: "PK-US-107", label: "Express 107", status: "driving", etaAt: "2026-10-28T19:40:00Z", late: { minutes: 85, cause: "breakdown", note: "Coolant temperature high · roadside repair" } },
      nextPlannedAt: null,
    },
    {
      id: 14, name: "Park Slope", format: "standard",
      stockStatus: "low", outVariety: null, outSince: null, lowVariety: "Carving",
      shelves: [
        { variety: "Carving", onHand: 38, capacity: 300, coverHours: 1.2 },
        { variety: "Cooking", onHand: 96, capacity: 120, coverHours: 30 },
        { variety: "Mini", onHand: 180, capacity: 280, coverHours: 26.4 },
      ],
      soldToday: 470, revenueToday: 3060, lostToday: 0, lostTodayUsd: 0,
      nextVan: { truckId: "PK-US-112", label: "Express 112", status: "driving", etaAt: "2026-10-28T18:45:00Z", late: { minutes: 25, cause: "traffic", note: "Traffic on I-278" } },
      nextPlannedAt: null,
    },
    {
      id: 15, name: "Harlem", format: "standard",
      stockStatus: "ok", outVariety: null, outSince: null, lowVariety: null,
      shelves: [
        { variety: "Carving", onHand: 210, capacity: 300, coverHours: 19.2 },
        { variety: "Cooking", onHand: 88, capacity: 120, coverHours: 26.4 },
        { variety: "Mini", onHand: 230, capacity: 280, coverHours: 31.2 },
      ],
      soldToday: 450, revenueToday: 2900, lostToday: 0, lostTodayUsd: 0,
      nextVan: { truckId: "PK-US-115", label: "Express 115", status: "driving", etaAt: "2026-10-28T19:05:00Z", late: { minutes: 0, cause: null, note: null } },
      nextPlannedAt: null,
    },
    {
      id: 16, name: "Chelsea", format: "express",
      stockStatus: "ok", outVariety: null, outSince: null, lowVariety: null,
      shelves: [
        { variety: "Carving", onHand: 160, capacity: 220, coverHours: 22.8 },
        { variety: "Cooking", onHand: 70, capacity: 90, coverHours: 28.8 },
        { variety: "Mini", onHand: 150, capacity: 200, coverHours: 27.6 },
      ],
      soldToday: 400, revenueToday: 2540, lostToday: 0, lostTodayUsd: 0,
      nextVan: null,
      nextPlannedAt: "2026-10-29T11:10:00Z",
    },
  ],
  stockouts: [
    { storeId: 13, storeName: "Astoria", variety: "Carving", startedAt: "2026-10-28T17:40:00Z" },
  ],
  // Soonest arrival first (none unloading yet).
  vans: [
    { truckId: "PK-US-112", fleetNo: 112, label: "Express 112", status: "driving", late: { minutes: 25, cause: "traffic", note: "Traffic on I-278" }, storeId: 14, storeName: "Park Slope", etaAt: "2026-10-28T18:45:00Z" },
    { truckId: "PK-US-115", fleetNo: 115, label: "Express 115", status: "driving", late: { minutes: 0, cause: null, note: null }, storeId: 15, storeName: "Harlem", etaAt: "2026-10-28T19:05:00Z" },
    { truckId: "PK-US-107", fleetNo: 107, label: "Express 107", status: "driving", late: { minutes: 85, cause: "breakdown", note: "Coolant temperature high · roadside repair" }, storeId: 13, storeName: "Astoria", etaAt: "2026-10-28T19:40:00Z" },
  ],
  periods,
};
