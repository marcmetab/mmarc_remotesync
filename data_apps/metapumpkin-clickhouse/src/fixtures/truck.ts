import type { TruckTrip, TruckViewModel } from "../pages/TruckPage";
import type { DelayCause, TripStatus } from "../types";

/**
 * Truck page fixtures, on the mockups' clock (Wed 28 Oct 2026, 18:20 UTC = 14:20 EDT in Lancaster).
 * `fixture` is Express 105 from the live data (fleet_now and its season of deliveries), moved 23 days later so its
 * last trip runs on this clock: on the way to Fishtown on the midday run, 6 minutes behind plan. Its first three
 * weeks of September repeat its early on-time runs, so the season starts on 1 September as live vans' do. The
 * other two are the states without a trip under way: a van idle at the hub and a van in the workshop. Live data
 * builds the same view models from fleet_now, trip_timeline, truck_faults and deliveries (see TruckViewModel).
 */

const TODAY = "2026-10-28";

/**
 * A deliveries row, compact: the hub's local date, wave, store, km there and back, the load, the times on the
 * hub's clock (Lancaster, EDT), how late and why, and bins, kg, retail value and delivery cost.
 */
type Row = [
  date: string, wave: number, storeId: number, store: string, city: string, kmTotal: number,
  load: [carving: number, cooking: number, mini: number, damaged: number],
  times: [plannedDepart: string, departed: string | null, plannedArrive: string, arrived: string | null, unloaded: string | null, returned: string | null],
  lateMinutes: number, cause: DelayCause | null, note: string | null,
  cargo: [bins: number, kg: number, valueUsd: number, costUsd: number],
];
/** The one trip still running: its status, ETA (EDT) and km so far of the whole run. */
type Running = { status: TripStatus; eta: string; kmDone: number };

/** "13:11" on a local date in Lancaster (EDT, UTC−4, through 1 November) as an ISO instant. */
const at = (date: string, hhmm: string | null) => hhmm ? new Date(`${date}T${hhmm}:00-04:00`).toISOString() : null;
const daysAgo = (date: string) => Math.round((Date.parse(TODAY) - Date.parse(date)) / 864e5);

/** The rows as the hook maps them; a row not back at the hub yet is the running one. */
function tripsOf(fleetNo: number, rows: Row[], running?: Running): TruckTrip[] {
  return rows.map(([date, wave, storeId, storeName, cityName, kmTotal, [carving, cooking, mini, damaged], [pd, d, pa, a, u, r], lateMinutes, cause, note, [bins, kg, valueUsd, costUsd]]) => {
    const done = r != null || !running;
    return {
      tripId: `US-${date.replace(/-/g, "")}-${fleetNo}-${wave}`, localDate: date, daysAgo: daysAgo(date), wave,
      storeId, storeName, cityName, kmTotal, kmDone: done ? kmTotal : running!.kmDone,
      status: done ? "done" : running!.status, isDelivered: a != null, isOnTime: a != null && lateMinutes < 15, isLate: lateMinutes >= 15,
      late: { minutes: lateMinutes, cause, note },
      plannedDepartAt: at(date, pd), departedAt: at(date, d), plannedArriveAt: at(date, pa), arrivedAt: at(date, a),
      etaAt: at(date, a ?? (done ? null : running!.eta)), unloadedAt: at(date, u), returnedAt: at(date, r),
      units: carving + cooking + mini, varieties: { Carving: carving, Cooking: cooking, Mini: mini }, damaged,
      bins, capacityBins: 8, kg, valueUsd, costUsd,
    };
  });
}

/* ── Express 105: on the way to Fishtown ─────────────────── */

const TRIP_105 = "US-20261028-105-2";

/** Express 105's season, newest first (deliveries, from trips105.json). */
const ROWS_105: Row[] = [
  ["2026-10-28", 2, 1, "Fishtown", "Philadelphia", 210, [40, 15, 30, 0], ["13:05", "13:11", "14:30", null, null, null], 6, null, null, [3, 225, 477, 24]],
  ["2026-10-27", 1, 3, "Manayunk", "Philadelphia", 210, [25, 10, 20, 1], ["09:10", "09:10", "10:35", "10:37", "11:03", "12:35"], 2, null, null, [3, 142.5, 304, 24]],
  ["2026-10-26", 2, 15, "Adams Morgan", "Washington", 380, [40, 25, 20, 0], ["11:55", "11:57", "14:25", "14:19", "14:51", "17:31"], 0, null, null, [3, 240, 507, 39]],
  ["2026-10-25", 2, 15, "Adams Morgan", "Washington", 380, [30, 15, 20, 1], ["11:55", "12:02", "14:25", "15:00", "15:33", "18:14"], 35, "traffic", "Traffic on I-95", [3, 175, 372, 39]],
  ["2026-10-24", 2, 9, "Fells Point", "Baltimore", 240, [30, 20, 20, 0], ["12:25", "12:28", "13:55", "14:00", "14:36", "16:07"], 5, null, null, [3, 185, 399, 27]],
  ["2026-10-23", 2, 9, "Fells Point", "Baltimore", 240, [30, 20, 20, 0], ["12:25", "12:24", "13:55", "13:56", "14:33", "16:05"], 1, null, null, [3, 185, 399, 27]],
  ["2026-10-22", 2, 9, "Fells Point", "Baltimore", 240, [20, 20, 10, 0], ["12:25", "12:28", "13:55", "14:01", "14:36", "16:09"], 6, null, null, [3, 135, 295, 27]],
  ["2026-10-21", 2, 9, "Fells Point", "Baltimore", 240, [15, 15, 20, 0], ["12:25", "12:31", "13:55", "14:01", "14:31", "16:02"], 6, null, null, [3, 107.5, 252, 27]],
  ["2026-10-20", 2, 5, "Astoria", "New York", 520, [55, 50, 40, 1], ["11:00", "11:06", "14:15", "14:26", "15:02", "18:16"], 11, null, null, [3, 367.5, 814, 51]],
  ["2026-10-19", 2, 17, "Lawrenceville", "Pittsburgh", 720, [30, 30, 30, 0], ["11:30", "11:39", "15:15", "15:20", "15:56", "19:45"], 5, null, null, [3, 210, 479, 69]],
  ["2026-10-18", 1, 10, "Canton", "Baltimore", 240, [30, 35, 20, 0], ["07:35", "07:34", "09:05", "09:03", "09:37", "11:14"], 0, null, null, [3, 215, 482, 27]],
  ["2026-10-15", 2, 1, "Fishtown", "Philadelphia", 210, [30, 45, 30, 1], ["12:25", "12:30", "13:50", "16:28", "17:00", "18:32"], 158, "breakdown", "Particulate filter blocked · roadside repair", [3, 240, 561, 75]],
  ["2026-10-13", 2, 3, "Manayunk", "Philadelphia", 210, [20, 25, 30, 1], ["13:05", "13:08", "14:30", "18:00", "18:30", "19:55"], 210, "storm", "Storm on US-30", [3, 155, 372, 24]],
  ["2026-10-12", 1, 12, "Mount Vernon", "Baltimore", 240, [15, 25, 10, 1], ["08:35", "08:38", "10:05", "10:06", "10:32", "12:06"], 1, null, null, [3, 122.5, 282, 27]],
  ["2026-10-10", 1, 2, "Old City", "Philadelphia", 210, [15, 30, 20, 1], ["08:35", "08:41", "10:00", "10:00", "10:29", "12:01"], 0, null, null, [3, 137.5, 334, 24]],
  ["2026-10-08", 2, 15, "Adams Morgan", "Washington", 380, [15, 20, 10, 0], ["11:55", "12:01", "14:25", "14:31", "14:59", "17:39"], 6, null, null, [3, 112.5, 255, 39]],
  ["2026-10-06", 2, 17, "Lawrenceville", "Pittsburgh", 720, [15, 25, 20, 1], ["11:30", "11:28", "15:15", "15:46", "16:23", "20:09"], 31, "traffic", "Traffic on I-76", [3, 127.5, 307, 69]],
  ["2026-10-05", 1, 6, "Park Slope", "New York", 520, [15, 25, 20, 0], ["07:00", "07:03", "10:15", "10:06", "10:34", "13:57"], 0, null, null, [3, 127.5, 307, 51]],
  ["2026-10-03", 1, 20, "South Side", "Pittsburgh", 720, [10, 30, 10, 1], ["06:15", "06:18", "10:00", "10:07", "10:32", "14:31"], 7, null, null, [3, 110, 270, 69]],
  ["2026-09-30", 2, 3, "Manayunk", "Philadelphia", 210, [20, 25, 20, 0], ["13:05", "13:08", "14:30", "14:29", "15:00", "16:32"], 0, null, null, [3, 150, 347, 24]],
  ["2026-09-29", 1, 14, "Capitol Hill", "Washington", 380, [15, 30, 20, 0], ["07:35", "07:36", "10:05", "09:58", "10:28", "13:04"], 0, null, null, [3, 137.5, 334, 39]],
  ["2026-09-27", 2, 15, "Adams Morgan", "Washington", 380, [10, 20, 10, 0], ["11:55", "11:59", "14:25", "14:23", "14:51", "17:21"], 0, null, null, [3, 90, 215, 39]],
  ["2026-09-25", 2, 13, "Georgetown", "Washington", 380, [10, 20, 20, 0], ["12:20", "12:23", "14:50", "14:52", "15:19", "17:46"], 2, null, null, [3, 95, 240, 39]],
  ["2026-09-24", 1, 10, "Canton", "Baltimore", 240, [10, 20, 20, 0], ["07:35", "07:40", "09:05", "09:48", "10:24", "12:02"], 43, "traffic", "Traffic on I-83", [3, 95, 240, 27]],
  // Early September: its first on-time runs again, a little different in size.
  ["2026-09-19", 1, 12, "Mount Vernon", "Baltimore", 240, [20, 25, 15, 0], ["08:35", "08:38", "10:05", "10:06", "10:32", "12:06"], 1, null, null, [3, 147.5, 334, 27]],
  ["2026-09-17", 1, 2, "Old City", "Philadelphia", 210, [20, 30, 20, 0], ["08:35", "08:41", "10:00", "10:00", "10:29", "12:01"], 0, null, null, [3, 160, 374, 24]],
  ["2026-09-15", 2, 15, "Adams Morgan", "Washington", 380, [15, 25, 10, 0], ["11:55", "12:01", "14:25", "14:31", "14:59", "17:39"], 6, null, null, [3, 122.5, 282, 39]],
  ["2026-09-12", 1, 6, "Park Slope", "New York", 520, [15, 20, 20, 0], ["07:00", "07:03", "10:15", "10:06", "10:34", "13:57"], 0, null, null, [3, 117.5, 279, 51]],
  ["2026-09-10", 1, 20, "South Side", "Pittsburgh", 720, [10, 25, 10, 1], ["06:15", "06:18", "10:00", "10:07", "10:32", "14:31"], 7, null, null, [3, 100, 242, 69]],
  ["2026-09-07", 2, 3, "Manayunk", "Philadelphia", 210, [20, 20, 20, 0], ["13:05", "13:08", "14:30", "14:29", "15:00", "16:32"], 0, null, null, [3, 140, 319, 24]],
  ["2026-09-06", 1, 14, "Capitol Hill", "Washington", 380, [20, 30, 20, 0], ["07:35", "07:36", "10:05", "09:58", "10:28", "13:04"], 0, null, null, [3, 160, 374, 39]],
  ["2026-09-04", 2, 15, "Adams Morgan", "Washington", 380, [15, 20, 10, 0], ["11:55", "11:59", "14:25", "14:23", "14:51", "17:21"], 0, null, null, [3, 112.5, 255, 39]],
  ["2026-09-02", 2, 13, "Georgetown", "Washington", 380, [10, 20, 10, 0], ["12:20", "12:23", "14:50", "14:52", "15:19", "17:46"], 2, null, null, [3, 90, 215, 39]],
];

export const fixture: TruckViewModel = {
  truck: {
    truckId: "PK-US-105",
    label: "Express 105",
    makeModel: "Isuzu NPR-HD",
    body: "7.5 t ventilated box",
    plate: "PA PQK-5088",
    driverName: "Carmen Price",
    lastPingAt: "2026-10-28T18:19:00Z",
    status: "driving",
    hubName: "Lancaster hub",
    tz: "America/New_York",
    trip: {
      tripId: TRIP_105,
      storeId: 1,
      storeName: "Fishtown",
      cityName: "Philadelphia",
      plannedArriveAt: "2026-10-28T18:30:00Z",
      etaAt: "2026-10-28T18:36:00Z",
      late: { minutes: 6, cause: null, note: null },
      progressPct: 81,
      kmTotal: 105,
      kmDone: 85,
    },
    cargo: {
      units: 85,
      lines: [
        { variety: "Carving", units: 40, kg: 180, valueUsd: 319.8 },
        { variety: "Cooking", units: 15, kg: 30, valueUsd: 82.4 },
        { variety: "Mini", units: 30, kg: 15, valueUsd: 74.8 },
      ],
      bins: 3,
      capacityBins: 8,
      kg: 225,
      payloadKg: 3500,
      valueUsd: 477,
    },
    service: {
      status: "ok",
      odometerKm: 101181,
      kmSinceService: 3496,
      intervalKm: 20000,
      kmToService: 16504,
      lastServiceOn: "2026-10-17",
      lastServiceKm: 97685,
      bookedOn: null,
    },
    readings: { fuelPct: 76, fuelRangeKm: 437, coolantC: 90, cargoTempC: 12, speedKmh: 86 },
  },
  timeline: [
    { tripId: TRIP_105, seq: 1, at: "2026-10-28T16:25:00Z", isEstimate: false, state: "done", label: "Loading started", detail: "Dock 4" },
    { tripId: TRIP_105, seq: 2, at: "2026-10-28T17:03:00Z", isEstimate: false, state: "done", label: "Loaded 85 pumpkins", detail: null },
    { tripId: TRIP_105, seq: 3, at: "2026-10-28T17:11:00Z", isEstimate: false, state: "now", label: "Departed Lancaster hub", detail: "6 min late · planned 13:05" },
    { tripId: TRIP_105, seq: 4, at: "2026-10-28T18:36:00Z", isEstimate: true, state: "next", label: "Arrive Fishtown", detail: null },
    { tripId: TRIP_105, seq: 5, at: "2026-10-28T19:11:00Z", isEstimate: true, state: "next", label: "Unloaded", detail: null },
    { tripId: TRIP_105, seq: 6, at: "2026-10-28T20:42:00Z", isEstimate: true, state: "next", label: "Back at Lancaster hub", detail: null },
  ],
  // The season's faults, all cleared: the filter on the breakdown run to Fishtown, a tire and water in the fuel.
  faults: [
    { code: "SPN 97", description: "Water in fuel indicator", severity: "warning", raisedAt: "2026-10-21T15:40:00Z", clearedAt: "2026-10-23T13:10:00Z" },
    { code: "SPN 3251", description: "Particulate filter blocked", severity: "critical", raisedAt: "2026-10-15T17:02:00Z", clearedAt: "2026-10-17T14:30:00Z" },
    { code: "TPMS 2", description: "Tire pressure low · axle 2", severity: "warning", raisedAt: "2026-09-29T12:15:00Z", clearedAt: "2026-09-30T11:00:00Z" },
  ],
  trips: tripsOf(105, ROWS_105, { status: "driving", eta: "14:36", kmDone: 85 }),
  destination: { status: "low", variety: "Carving", since: null, loadCoverDays: 1.6 },
};

/* ── Express 101: idle at the hub ────────────────────────── */

const TRIP_101 = "US-20261028-101-1";

/** Idle at the hub: back from the morning run to Old City, nothing aboard, service in order. */
export const idleFixture: TruckViewModel = {
  truck: {
    truckId: "PK-US-101",
    label: "Express 101",
    makeModel: "Isuzu NPR-HD",
    body: "7.5 t ventilated box",
    plate: "PA LRT-2086",
    driverName: "Grace Holloway",
    lastPingAt: "2026-10-28T18:18:00Z",
    status: "at_hub",
    hubName: "Lancaster hub",
    tz: "America/New_York",
    trip: null,
    cargo: { units: 0, lines: [], bins: 0, capacityBins: 8, kg: 0, payloadKg: 3500, valueUsd: 0 },
    service: {
      status: "ok",
      odometerKm: 96480,
      kmSinceService: 8340,
      intervalKm: 20000,
      kmToService: 11660,
      lastServiceOn: "2026-09-14",
      lastServiceKm: 88140,
      bookedOn: null,
    },
    readings: { fuelPct: 71, fuelRangeKm: 410, coolantC: 38, cargoTempC: 13.4, speedKmh: 0 },
  },
  timeline: [
    { tripId: TRIP_101, seq: 1, at: "2026-10-28T10:40:00Z", isEstimate: false, state: "done", label: "Loading started", detail: "Dock 1" },
    { tripId: TRIP_101, seq: 2, at: "2026-10-28T11:12:00Z", isEstimate: false, state: "done", label: "Loaded 95 pumpkins", detail: null },
    { tripId: TRIP_101, seq: 3, at: "2026-10-28T11:20:00Z", isEstimate: false, state: "done", label: "Departed Lancaster hub", detail: "5 min late · planned 07:15" },
    { tripId: TRIP_101, seq: 4, at: "2026-10-28T12:43:00Z", isEstimate: false, state: "done", label: "Arrived Old City", detail: "2 min early · planned 08:45" },
    { tripId: TRIP_101, seq: 5, at: "2026-10-28T13:18:00Z", isEstimate: false, state: "done", label: "Unloaded", detail: "95 pumpkins · 1 damaged" },
    { tripId: TRIP_101, seq: 6, at: "2026-10-28T14:50:00Z", isEstimate: false, state: "done", label: "Back at Lancaster hub", detail: null },
  ],
  faults: [],
  trips: tripsOf(101, [
    ["2026-10-28", 1, 2, "Old City", "Philadelphia", 210, [40, 35, 20, 1], ["07:15", "07:20", "08:45", "08:43", "09:18", "10:50"], 0, null, null, [3, 255, 520, 24]],
    ["2026-10-27", 2, 9, "Fells Point", "Baltimore", 240, [30, 20, 20, 0], ["12:25", "12:27", "13:55", "13:58", "14:31", "16:04"], 3, null, null, [3, 185, 399, 27]],
    ["2026-10-26", 1, 10, "Canton", "Baltimore", 240, [35, 25, 20, 0], ["07:35", "07:36", "09:05", "09:07", "09:41", "11:16"], 2, null, null, [3, 217.5, 467, 27]],
    ["2026-10-24", 2, 3, "Manayunk", "Philadelphia", 210, [25, 30, 20, 1], ["13:05", "13:09", "14:30", "14:33", "15:04", "16:35"], 3, null, null, [3, 182.5, 414, 24]],
    ["2026-10-22", 1, 6, "Park Slope", "New York", 520, [45, 30, 25, 0], ["07:00", "07:02", "10:15", "10:12", "10:48", "14:05"], 0, null, null, [3, 285, 586, 51]],
  ]),
  destination: null,
};

/* ── Express 119: in the workshop ────────────────────────── */

const TRIP_119 = "US-20261027-119-2";

/** In the workshop since yesterday's run: brake fault open, service due, no trip today. */
export const workshopFixture: TruckViewModel = {
  truck: {
    truckId: "PK-US-119",
    label: "Express 119",
    makeModel: "Isuzu NPR-HD",
    body: "7.5 t ventilated box",
    plate: "PA HWM-7310",
    driverName: null,
    lastPingAt: "2026-10-27T20:10:00Z",
    status: "workshop",
    hubName: "Lancaster hub",
    tz: "America/New_York",
    trip: null,
    cargo: { units: 0, lines: [], bins: 0, capacityBins: 8, kg: 0, payloadKg: 3500, valueUsd: 0 },
    service: {
      status: "in_workshop",
      odometerKm: 131904,
      kmSinceService: 19640,
      intervalKm: 20000,
      kmToService: 360,
      lastServiceOn: "2026-08-03",
      lastServiceKm: 112264,
      bookedOn: "2026-10-28",
    },
    readings: { fuelPct: 38, fuelRangeKm: 220, coolantC: null, cargoTempC: null, speedKmh: 0 },
  },
  timeline: [
    { tripId: TRIP_119, seq: 1, at: "2026-10-27T14:40:00Z", isEstimate: false, state: "done", label: "Loading started", detail: "Dock 2" },
    { tripId: TRIP_119, seq: 2, at: "2026-10-27T15:15:00Z", isEstimate: false, state: "done", label: "Loaded 90 pumpkins", detail: null },
    { tripId: TRIP_119, seq: 3, at: "2026-10-27T15:25:00Z", isEstimate: false, state: "done", label: "Departed Lancaster hub", detail: "On time" },
    { tripId: TRIP_119, seq: 4, at: "2026-10-27T16:10:00Z", isEstimate: false, state: "done", label: "Fault: brake pad wear, front axle", detail: "SPN 1099 · critical" },
    { tripId: TRIP_119, seq: 5, at: "2026-10-27T17:25:00Z", isEstimate: false, state: "done", label: "Arrived Hampden", detail: "30 min late · planned 12:55" },
    { tripId: TRIP_119, seq: 6, at: "2026-10-27T18:00:00Z", isEstimate: false, state: "done", label: "Unloaded", detail: null },
    { tripId: TRIP_119, seq: 7, at: "2026-10-27T19:55:00Z", isEstimate: false, state: "done", label: "Back at Lancaster hub", detail: null },
  ],
  faults: [
    { code: "SPN 1099", description: "Brake pad wear, front axle", severity: "critical", raisedAt: "2026-10-27T16:10:00Z", clearedAt: null },
  ],
  trips: tripsOf(119, [
    ["2026-10-27", 2, 7, "Hampden", "Baltimore", 240, [35, 30, 25, 0], ["11:25", "11:25", "12:55", "13:25", "14:00", "15:55"], 30, "breakdown", "Brake pad wear, front axle · reduced speed", [3, 230, 457, 27]],
    ["2026-10-25", 1, 9, "Fells Point", "Baltimore", 240, [30, 25, 20, 0], ["07:35", "07:38", "09:05", "09:09", "09:44", "11:20"], 4, null, null, [3, 195, 427, 27]],
    ["2026-10-23", 2, 2, "Old City", "Philadelphia", 210, [25, 25, 30, 1], ["13:05", "13:07", "14:30", "14:32", "15:01", "16:33"], 2, null, null, [3, 177.5, 412, 24]],
    ["2026-10-21", 1, 15, "Adams Morgan", "Washington", 380, [40, 20, 20, 0], ["07:00", "07:04", "09:30", "09:36", "10:10", "12:48"], 6, null, null, [3, 230, 479, 39]],
  ]),
  destination: null,
};
