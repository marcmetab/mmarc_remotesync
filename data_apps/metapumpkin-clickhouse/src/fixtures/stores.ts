import type { DayRow } from "../data/periods";
import type { CityShelf } from "../pages/CityPage";
import { revenueByPeriod, type StoresStoreRow, type StoresViewModel } from "../pages/StoresPage";
import { COUNTRIES, type CountryCode, type DelayCause, type Variety, VARIETIES } from "../types";
import { fixture as city } from "./city";
import { ASTORIA, CHELSEA, GREENWICH, HARLEM, historyOf, PARK_SLOPE, type StoreHistory, type StoreStory, weekOf, YANAKA } from "./drill";
import { shellFixture } from "./shell";
import { greenwich, yanaka } from "./store";

/**
 * The Stores mockup as store_now rows: Wed 28 Oct 2026, 18:20 UTC. 7 stores out, 12 low, $7.5k lost today
 * across 11 cities; Japan is closed (03:20 Thu). The mockup gives city totals, so each city's sold units are
 * split across its four stores (New York's are the City mockup's) and today's lost sales sit on the store that
 * ran out or runs low.
 *
 * Revenue, for the four periods and store_now's today and 7 days alike, is summed from a season of daily rows per
 * store (DailyByStore's), built the way drill.ts builds the City and Store fixtures'. New York's four stores,
 * Greenwich and Yanaka are those very histories, so the three pages agree; Greenwich and Yanaka also take the Store
 * fixture's shelves and next planned van. The late vans' causes and notes are the Fleet fixture's. Every other store sells the mockup's
 * units today, and a usual day (yesterday) is what today's pace makes of them; Japan, not open yet, has a usual
 * day per city instead. German stores close on Sundays, so those days have no rows. (The mockup's own 7-day
 * figures are not used: they were about a third of what its sales today make of a week.)
 *
 * Shelves are not on the mockup: New York takes the City fixture's, Greenwich and Yanaka the Store fixture's, every other store gets steady made-up ones
 * that fit its status (out: that variety at 0 and the rest thin; low: one variety runs out before the store's
 * van; stocked: a day or more of each).
 */

/** The scenario's local day and UTC offset per country, to write times the way the mockup does ("15:40"). */
const ZONE: Record<CountryCode, { day: number; offset: number }> = {
  US: { day: 28, offset: -4 }, CA: { day: 28, offset: -4 }, GB: { day: 28, offset: 0 }, DE: { day: 28, offset: 1 }, JP: { day: 29, offset: 9 },
};
/** A local "HH:MM" on the country's today (`days` 1 = tomorrow, -1 = yesterday) as an ISO instant. */
function local(cc: CountryCode, hhmm: string, days = 0): string {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(2026, 9, ZONE[cc].day + days, h - ZONE[cc].offset, m)).toISOString();
}

/** A van on the way: its ETA ("HH:MM", already late if it is), how late, and why. */
type Van = { to: string; at: string; late?: number; cause?: DelayCause; note?: string; unloading?: true };
type CitySeed = {
  cc: CountryCode;
  name: string;
  /** store_id of the first store: countries, cities and stores in the data contract's order (Astoria is 13). */
  firstId: number;
  stores: [string, string, string, string];
  /** store → [variety, since "HH:MM", days ago]. */
  out?: Record<string, [Variety, string, number?]>;
  /** Stores running low; the variety is LOW_VARIETY's, else Carving. */
  low?: string[];
  /** Pumpkins sold today, lost sales today (USD). */
  sold: number;
  lost: number;
  /** Japan, not open yet today: pumpkins sold on a usual day of late October, the four stores together. */
  usual?: number;
  /** Vans heading to the city's stores now; `next` is the next planned delivery when there is none. */
  vans?: Van[];
  next?: [string, number?];
  /** Per-store sold units, where the mockups give them. */
  byStore?: { sold: number[] };
};

// In the mockup's order (the page sorts them itself).
const CITIES: CitySeed[] = [
  { cc: "US", name: "Philadelphia", firstId: 1, stores: ["Fishtown", "Old City", "Manayunk", "Germantown"], low: ["Manayunk"], sold: 1560, lost: 210, vans: [{ to: "Manayunk", at: "15:20" }] },
  { cc: "US", name: "New York", firstId: 13, stores: ["Astoria", "Park Slope", "Harlem", "Chelsea"], out: { "Astoria": ["Carving", "13:40"] }, low: ["Park Slope"], sold: 1840, lost: 1940,
    vans: [{ to: "Astoria", at: "15:40", late: 85, cause: "breakdown", note: "Coolant temperature high · roadside repair" }, { to: "Park Slope", at: "14:45", late: 25, cause: "traffic", note: "Traffic on I-278" }, { to: "Harlem", at: "15:05" }], byStore: { sold: [520, 470, 450, 400] } },
  { cc: "US", name: "Baltimore", firstId: 5, stores: ["Fells Point", "Canton", "Hampden", "Mount Vernon"], sold: 1120, lost: 0, vans: [{ to: "Canton", at: "14:35" }] },
  { cc: "US", name: "Washington", firstId: 9, stores: ["Georgetown", "Capitol Hill", "Adams Morgan", "Navy Yard"], low: ["Georgetown"], sold: 1330, lost: 380, vans: [{ to: "Georgetown", at: "15:30", late: 40, cause: "late_departure", note: "Late departure · no van free" }] },
  { cc: "US", name: "Pittsburgh", firstId: 17, stores: ["Lawrenceville", "Shadyside", "Squirrel Hill", "South Side"], out: { "South Side": ["Mini", "13:10"] }, sold: 880, lost: 520, vans: [{ to: "South Side", at: "16:10" }] },

  { cc: "CA", name: "Toronto", firstId: 25, stores: ["Leslieville", "The Annex", "Liberty Village", "Danforth"], low: ["Danforth"], sold: 1480, lost: 180, vans: [{ to: "Danforth", at: "15:35" }] },
  { cc: "CA", name: "Hamilton", firstId: 21, stores: ["Westdale", "Locke Street", "Stoney Creek", "Ancaster"], low: ["Locke Street"], sold: 720, lost: 0, vans: [{ to: "Westdale", at: "14:15", unloading: true }] },
  { cc: "CA", name: "Ottawa", firstId: 37, stores: ["Glebe", "ByWard Market", "Westboro", "Kanata"], out: { "Glebe": ["Carving", "12:55"] }, low: ["Westboro"], sold: 860, lost: 1310, vans: [{ to: "Glebe", at: "17:40", late: 130, cause: "storm", note: "Storm on Hwy 401" }] },
  { cc: "CA", name: "London", firstId: 29, stores: ["Wortley Village", "Old North", "Byron", "Masonville"], sold: 690, lost: 0, vans: [{ to: "Masonville", at: "15:00" }] },
  { cc: "CA", name: "Kingston", firstId: 33, stores: ["Sydenham", "Portsmouth", "Cataraqui", "Williamsville"], sold: 610, lost: 0, vans: [{ to: "Cataraqui", at: "17:15" }] },

  { cc: "GB", name: "London", firstId: 41, stores: ["Camden", "Islington", "Brixton", "Greenwich"], out: { "Camden": ["Carving", "16:50"] }, sold: 2610, lost: 1120, vans: [{ to: "Camden", at: "19:05", late: 35, cause: "traffic", note: "Traffic on the M1" }] },
  { cc: "GB", name: "Bristol", firstId: 49, stores: ["Clifton", "Bedminster", "Stokes Croft", "Redland"], low: ["Clifton"], sold: 1330, lost: 0, next: ["06:40", 1] },
  { cc: "GB", name: "Manchester", firstId: 57, stores: ["Ancoats", "Didsbury", "Chorlton", "Salford Quays"], low: ["Didsbury"], sold: 1710, lost: 120, vans: [{ to: "Didsbury", at: "19:20" }] },
  { cc: "GB", name: "Birmingham", firstId: 45, stores: ["Digbeth", "Moseley", "Edgbaston", "Jewellery Quarter"], sold: 1640, lost: 0, next: ["06:55", 1] },
  { cc: "GB", name: "Leeds", firstId: 53, stores: ["Headingley", "Chapel Allerton", "Kirkstall", "Roundhay"], low: ["Headingley"], sold: 1190, lost: 0, next: ["06:50", 1] },

  { cc: "DE", name: "Berlin", firstId: 61, stores: ["Kreuzberg", "Prenzlauer Berg", "Neukölln", "Charlottenburg"], out: { "Neukölln": ["Cooking", "17:30"] }, low: ["Kreuzberg"], sold: 2130, lost: 640, next: ["06:30", 1] },
  { cc: "DE", name: "Hamburg", firstId: 77, stores: ["Altona", "Eimsbüttel", "St. Georg", "Winterhude"], out: { "Altona": ["Carving", "18:05"] }, sold: 1540, lost: 980, vans: [{ to: "Altona", at: "20:05", late: 55, cause: "ventilation", note: "Airflow low · cargo 17.8 °C" }] },
  { cc: "DE", name: "Leipzig", firstId: 65, stores: ["Plagwitz", "Connewitz", "Gohlis", "Südvorstadt"], low: ["Gohlis"], sold: 1120, lost: 100, vans: [{ to: "Gohlis", at: "19:35" }] },
  { cc: "DE", name: "Dresden", firstId: 69, stores: ["Neustadt", "Blasewitz", "Striesen", "Pieschen"], sold: 1060, lost: 0, next: ["06:45", 1] },
  { cc: "DE", name: "Hannover", firstId: 73, stores: ["Linden", "List", "Südstadt", "Herrenhausen"], sold: 990, lost: 0, next: ["07:00", 1] },

  { cc: "JP", name: "Tokyo", firstId: 85, stores: ["Shimokitazawa", "Nakameguro", "Kichijoji", "Yanaka"], out: { "Yanaka": ["Carving", "19:40", -1] }, sold: 0, lost: 0, usual: 1500, next: ["05:10"] },
  { cc: "JP", name: "Yokohama", firstId: 93, stores: ["Motomachi", "Minato Mirai", "Kannai", "Aobadai"], sold: 0, lost: 0, usual: 1050, next: ["05:10"] },
  { cc: "JP", name: "Saitama", firstId: 97, stores: ["Omiya", "Urawa", "Iwatsuki", "Minami-Urawa"], sold: 0, lost: 0, usual: 810, next: ["05:10"] },
  { cc: "JP", name: "Kawasaki", firstId: 89, stores: ["Musashi-Kosugi", "Mizonokuchi", "Shin-Yurigaoka", "Kawasaki Station"], low: ["Musashi-Kosugi"], sold: 0, lost: 0, usual: 760, next: ["05:10"] },
  { cc: "JP", name: "Kashiwa", firstId: 81, stores: ["Kashiwanoha", "Minami-Kashiwa", "Kita-Kashiwa", "Kashiwa Station"], sold: 0, lost: 0, usual: 690, next: ["05:10"] },
];

const SHARES = [0.3, 0.26, 0.24, 0.2];
/** A city total across its four stores, in round steps; the first store takes what rounding leaves. */
function split(total: number, step: number): number[] {
  const parts = SHARES.map(share => Math.round(total * share / step) * step);
  parts[0] += total - parts.reduce((a, b) => a + b, 0);
  return parts;
}

/** The variety a low store runs short of, where it is not Carving. */
const LOW_VARIETY: Record<string, Variety> = { Danforth: "Mini", Didsbury: "Cooking", Kreuzberg: "Mini", Gohlis: "Cooking" };
/** Shelf capacity (Carving, Cooking, Mini) by the store's place in its city: the flagship first, an express last. */
const CAPS = [[420, 150, 400], [300, 120, 280], [300, 120, 280], [220, 90, 200]];
/** The City fixture's New York shelves, by store_id. */
const CITY_SHELVES = new Map((city.stores ?? []).map(s => [s.id, s.shelves]));
/** The Store fixture's Greenwich and Yanaka, by store_id: their shelves, low variety and next planned van win here. */
const STORE_PAGE = new Map([greenwich.store!, yanaka.store!].map(s => [s.storeId, s]));
/** A steady 0..1 per store and shelf, so every run draws the same shelves. */
const jitter = (id: number, k: number) => ((id * 37 + k * 59) % 23) / 22;
const round1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Open hours from the scenario's clock to the store's van, as store_now's open_hours_to_next_delivery counts them:
 * until today's close when the van comes after it (every next-morning van here lands before opening); 0 when shut.
 */
function openHoursToVan(vanAt: string, closesAt: string, isOpen: boolean): number {
  if (!isOpen) return 0;
  return Math.max(0, (Math.min(Date.parse(vanAt), Date.parse(closesAt)) - Date.parse(shellFixture.clock.now)) / 3_600_000);
}

function shelvesOf(storeId: number, index: number, out: Variety | null, low: Variety | null, toVan: number): CityShelf[] {
  return CITY_SHELVES.get(storeId) ?? VARIETIES.map((variety, k): CityShelf => {
    const capacity = CAPS[index][k], j = jitter(storeId, k);
    if (variety === out) return { variety, onHand: 0, capacity, coverHours: 0 };
    // Low means the cover ends before the van: 30 to 80% of the open hours until it (a closed store has none
    // left today, so a few open hours). A tenth of the shelf.
    if (variety === low) return { variety, onHand: Math.round(capacity * (0.05 + 0.08 * j)), capacity,
      coverHours: round1(toVan > 0 ? Math.max(0.1, toVan * (0.3 + 0.5 * j)) : 0.6 + 2.2 * j) };
    // A store that ran out of one variety is thin on the rest: 2 to 8 open hours, 5 to 20% of the shelf.
    if (out) return { variety, onHand: Math.round(capacity * (0.05 + 0.15 * j)), capacity, coverHours: round1(2 + 6 * j) };
    // Stocked: 14 to 36 open hours, half the shelf or more.
    return { variety, onHand: Math.round(capacity * (0.45 + 0.4 * j)), capacity, coverHours: round1(14 + 22 * j) };
  });
}

/* ── Revenue: a season of daily rows per store ───────────── */

/** The stores the City and Store fixtures tell the season of (drill.ts), by store_id. */
const STORIES = new Map([ASTORIA, PARK_SLOPE, HARLEM, CHELSEA, GREENWICH, YANAKA].map(story => [story.storeId, story]));
/**
 * The share of a usual day's pumpkins sold by the scenario's clock: New York's (1,840 of 3,520 at 14:20, drill.ts)
 * in North America, London's at 18:20 and Berlin's at 19:20, both closing at 20:00. Japan has not opened yet.
 */
const DAY_DONE: Record<Exclude<CountryCode, "JP">, number> = { US: 0.52, CA: 0.52, GB: 0.86, DE: 0.95 };
/** The average price of a pumpkin (USD), by country; each store's is a little above or below. */
const PRICE: Record<CountryCode, number> = { US: 6.45, CA: 6.6, GB: 6.9, DE: 6.7, JP: 7.25 };

/**
 * The season of a store drill.ts does not tell, as drill.ts tells one: today's sales are the mockup's (`sold`,
 * `lostUsd`), and a usual day is what today's pace makes of them, or in Japan the city's usual day's share (`usual`).
 */
function madeUpStory(cc: CountryCode, storeId: number, sold: number, lostUsd: number, usual: number | undefined): StoreStory {
  const price = Math.round(PRICE[cc] * (97 + 6 * jitter(storeId, 3))) / 100;
  const revenueUsd = Math.round(sold * price / 10) * 10;
  const vsPlan = Math.round((-0.08 + 0.14 * jitter(storeId, 4)) * 1000) / 1000;
  return {
    storeId, today: `2026-10-${ZONE[cc].day}`, span: [9, cc === "GB" || cc === "DE" ? 20 : 21], seed: storeId * 0.37,
    todayTotals: { soldUnits: sold, revenueUsd, lostUnits: Math.round(lostUsd / price), lostUsd, planUsd: Math.round(revenueUsd / (1 + vsPlan)) },
    yesterdayUnits: cc === "JP" ? usual ?? 0 : Math.round(sold / (DAY_DONE[cc] * (0.94 + 0.12 * jitter(storeId, 5)))),
    price, vsPlan,
  };
}

/** A store's season (drill.ts), less the Sundays a German store is closed: the daily rows have none for them. */
function storeHistory(cc: CountryCode, story: StoreStory): StoreHistory {
  const history = historyOf(story);
  return cc === "DE" ? { ...history, days: history.days.filter(d => new Date(`${d.date}T12:00:00Z`).getUTCDay() !== 0) } : history;
}

/* ── Rows ────────────────────────────────────────────────── */

/** A city's store_now rows, and each store's daily rows (for the view model's `revenue`). */
function storeRows(seed: CitySeed): { row: StoresStoreRow; days: DayRow[] }[] {
  const country = COUNTRIES.find(c => c.code === seed.cc)!;
  const closes = seed.cc === "GB" || seed.cc === "DE" ? "20:00" : "21:00";
  const sold = seed.byStore?.sold ?? split(seed.sold, 10);
  const usual = seed.usual != null ? split(seed.usual, 10) : [];
  // Lost sales belong to the store that ran out, else to the one running low.
  const lostAt = Object.keys(seed.out ?? {})[0] ?? seed.low?.[0];
  return seed.stores.map((storeName, i) => {
    const storeId = seed.firstId + i;
    const lostTodayUsd = storeName === lostAt ? seed.lost : 0;
    const season = storeHistory(seed.cc, STORIES.get(storeId) ?? madeUpStory(seed.cc, storeId, sold[i], lostTodayUsd, usual[i]));
    // days_ago 0: store_now's today columns are the same day's sums.
    const today = season.days[0];
    const out = seed.out?.[storeName];
    const low = seed.low?.includes(storeName) ? LOW_VARIETY[storeName] ?? "Carving" : null;
    const van = seed.vans?.find(v => v.to === storeName);
    const isOpen = seed.cc !== "JP", closesAt = local(seed.cc, closes);
    const etaAt = van ? local(seed.cc, van.at) : null;
    const plannedAt = seed.next ? local(seed.cc, seed.next[0], seed.next[1] ?? 0) : local(seed.cc, "07:10", 1);
    const page = STORE_PAGE.get(storeId);
    const row: StoresStoreRow = {
      storeId,
      storeName,
      cityKey: `${seed.cc}-${seed.name.toLowerCase().replace(/\s+/g, "-")}`,
      cityName: seed.name,
      countryCode: seed.cc,
      regionCode: country.region,
      tz: country.tz,
      isOpen,
      opensAt: local(seed.cc, "09:00"),
      closesAt,
      stockStatus: out ? "out" : low ? "low" : "ok",
      outVariety: out ? out[0] : null,
      outSince: out ? local(seed.cc, out[1], out[2] ?? 0) : null,
      lowVariety: page ? page.lowVariety : low,
      shelves: page ? page.stock.map(({ variety, onHand, capacity, coverHours }) => ({ variety, onHand, capacity, coverHours }))
        : shelvesOf(storeId, i, out?.[0] ?? null, low, openHoursToVan(etaAt ?? plannedAt, closesAt, isOpen)),
      soldTodayUnits: today.soldUnits,
      lostTodayUsd,
      revenueTodayUsd: today.revenueUsd,
      revenue7dUsd: Math.round(weekOf(season).revenueUsd),
      nextVan: van ? { status: van.unloading ? "unloading" : "driving", etaAt, late: { minutes: van.late ?? 0, cause: van.cause ?? null, note: van.note ?? null } } : null,
      nextPlannedAt: van ? null : page ? page.nextPlannedAt : plannedAt,
    };
    return { row, days: season.days };
  });
}

const built = CITIES.flatMap(storeRows);

export const fixture: StoresViewModel = {
  countries: COUNTRIES.map(c => ({ code: c.code, name: c.name, regionCode: c.region, tz: c.tz })),
  stores: built.map(b => b.row),
  // The live query reads the last 30 days.
  revenue: revenueByPeriod(built.flatMap(b => b.days).filter(d => d.daysAgo <= 29)),
};
