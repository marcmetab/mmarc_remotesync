import type { FleetCargoRow, FleetHub, FleetOnTime, FleetServiceRow, FleetVan, FleetViewModel, FleetYardVan } from "../pages/FleetPage";
import { ALL_SCOPE, type CountryCode, type DelayCause, type FaultSeverity, type HarvestStatus, inScope, type RegionCode, type Scope, type ServiceStatus, type TruckStatus } from "../types";
import { shellFixture } from "./shell";

/*
 * Mock data of the Harvest & fleet page, copied from the approved mockup (Fleet.dc.html): Wed 28 Oct 2026,
 * 18:20 UTC. Europe has finished picking, North America is mid-afternoon, Japan is asleep. Six vans are
 * late. `fixtureFor(scope)` narrows it the way the live queries will; `fixture` is every region.
 * The yard ("All vans") has rows of its own, read from the live app later (YARD, below).
 */

/** A hub's wall time on the mock day as an instant: at("15:40", -4) is 19:40 UTC. */
const at = (hhmm: string, utcOffset: number, day = 28) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(2026, 9, day, h - utcOffset, m)).toISOString();
};

/** fleet no · driver · store · status · progress % · ETA or arrival (local) · planned (local) · minutes late · cause · note · pumpkins aboard */
type VanSeed = [number, string, string, FleetVan["status"], number, string, string, number, DelayCause | null, string | null, number];
type HubSeed = {
  cc: CountryCode; hub: string; country: string; region: RegionCode; tz: string;
  /** Hours east of UTC on the mock day. */
  utc: number;
  harvestStatus: HarvestStatus; harvest: string; fields: number; bins: number; plan: number; binsDay: "today" | "yesterday";
  stock: number; loading: number; returning: number; idle: number; shop: number[];
  /** First wave of the hub's next day, local time on Thu 29 Oct. */
  wave: string | null;
  cities: [string, VanSeed[]][];
};

const HUBS: HubSeed[] = [
  { cc: "US", hub: "Lancaster", country: "United States", region: "NA", tz: "America/New_York", utc: -4,
    harvestStatus: "picking", harvest: "Picking Field 2, 3, 5, 6", fields: 4, bins: 96, plan: 104, binsDay: "today",
    stock: 1.9, loading: 1, returning: 4, idle: 5, shop: [119], wave: null,
    cities: [
      ["Philadelphia", [[103, "Owen Carter", "Fishtown", "unloading", 100, "14:05", "14:10", 0, null, null, 360], [104, "Lena Ortiz", "Manayunk", "driving", 57, "15:20", "15:20", 0, null, null, 330]]],
      ["New York", [[107, "Dana Whitfield", "Astoria", "stopped", 62, "15:40", "14:15", 85, "breakdown", "Breakdown · coolant", 410], [112, "Marcus Bell", "Park Slope", "driving", 88, "14:45", "14:20", 25, "traffic", "Traffic on I-278", 380], [115, "Priya Nair", "Harlem", "driving", 41, "15:05", "15:05", 0, null, null, 450]]],
      ["Baltimore", [[106, "Theo Price", "Canton", "driving", 82, "14:35", "14:35", 0, null, null, 290]]],
      ["Washington", [[109, "Jamal Greene", "Georgetown", "driving", 70, "15:30", "14:50", 40, "late_departure", "Late departure · no van free", 400], [110, "Hannah Moss", "Navy Yard", "driving", 35, "15:55", "15:55", 0, null, null, 310]]],
      ["Pittsburgh", [[118, "Rosa Kim", "South Side", "driving", 30, "16:10", "16:10", 0, null, null, 260]]],
    ] },
  { cc: "CA", hub: "Guelph", country: "Canada", region: "NA", tz: "America/Toronto", utc: -4,
    harvestStatus: "picking", harvest: "Picking Field 1, 4, 5 · Field 2 stopped for rain", fields: 3, bins: 71, plan: 80, binsDay: "today",
    stock: 1.4, loading: 1, returning: 3, idle: 8, shop: [], wave: null,
    cities: [
      ["Toronto", [[203, "Mei Chen", "Leslieville", "driving", 63, "15:10", "15:10", 0, null, null, 340], [204, "Daniel Roy", "Danforth", "driving", 38, "15:35", "15:35", 0, null, null, 300], [205, "Nadia Haddad", "The Annex", "unloading", 100, "14:10", "14:15", 0, null, null, 380]]],
      ["Hamilton", [[201, "Ben Okafor", "Westdale", "unloading", 100, "14:00", "14:05", 0, null, null, 290]]],
      ["Ottawa", [[206, "Claire Tremblay", "Glebe", "driving", 64, "17:40", "15:30", 130, "storm", "Storm on Hwy 401", 420], [207, "Sam Wilson", "Westboro", "driving", 48, "16:05", "16:05", 0, null, null, 350]]],
      ["London", [[208, "Grace Liu", "Masonville", "driving", 52, "15:00", "15:00", 0, null, null, 320]]],
      ["Kingston", [[209, "Luc Gagnon", "Cataraqui", "driving", 34, "17:15", "17:15", 0, null, null, 430]]],
    ] },
  { cc: "GB", hub: "Bedford", country: "United Kingdom", region: "EU", tz: "Europe/London", utc: 0,
    harvestStatus: "done", harvest: "Harvest done for today", fields: 0, bins: 88, plan: 90, binsDay: "today",
    stock: 2.3, loading: 0, returning: 4, idle: 13, shop: [], wave: null,
    cities: [
      ["London", [[304, "Tom Hughes", "Camden", "driving", 77, "19:05", "18:30", 35, "traffic", "Traffic on the M1", 390], [305, "Aisha Khan", "Islington", "unloading", 100, "18:10", "18:15", 0, null, null, 340]]],
      ["Bristol", []],
      ["Manchester", [[307, "Ellie Shaw", "Didsbury", "driving", 58, "19:20", "19:20", 0, null, null, 360]]],
      ["Birmingham", []],
      ["Leeds", []],
    ] },
  { cc: "DE", hub: "Brandenburg", country: "Germany", region: "EU", tz: "Europe/Berlin", utc: 1,
    harvestStatus: "done", harvest: "Harvest done for today", fields: 0, bins: 79, plan: 84, binsDay: "today",
    stock: 1.6, loading: 0, returning: 3, idle: 14, shop: [412], wave: null,
    cities: [
      ["Berlin", []],
      ["Hamburg", [[411, "Jonas Weber", "Altona", "driving", 71, "20:05", "19:10", 55, "ventilation", "Airflow low · cargo 17.8 °C", 380]]],
      ["Leipzig", [[414, "Katrin Vogel", "Gohlis", "driving", 74, "19:35", "19:35", 0, null, null, 330]]],
      ["Dresden", []],
      ["Hannover", []],
    ] },
  { cc: "JP", hub: "Chiba", country: "Japan", region: "APAC", tz: "Asia/Tokyo", utc: 9,
    harvestStatus: "not_started", harvest: "Harvest starts 07:00", fields: 0, bins: 78, plan: 80, binsDay: "yesterday",
    stock: 2.8, loading: 0, returning: 0, idle: 19, shop: [503], wave: "05:10",
    cities: [["Tokyo", []], ["Yokohama", []], ["Saitama", []], ["Kawasaki", []], ["Kashiwa", []]] },
];

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");
const truckId = (cc: CountryCode, fleetNo: number) => `PK-${cc}-${fleetNo}`;
const hubIdOf = (h: HubSeed) => `${h.cc}-${slug(h.hub)}`;

function toHub(h: HubSeed): FleetHub {
  return {
    hubId: hubIdOf(h), name: `${h.hub} hub`, countryCode: h.cc, country: h.country, regionCode: h.region, tz: h.tz,
    harvestStatus: h.harvestStatus, harvestNote: h.harvest, fieldsPicking: h.fields, bins: h.bins, planBins: h.plan, binsDay: h.binsDay,
    stockDays: h.stock, vansAtHub: h.idle, vansLoading: h.loading, vansReturning: h.returning, workshop: h.shop, workshopLabels: h.shop.map(no => `Express ${no}`),
    nextWave: h.wave ? { at: at(h.wave, h.utc, 29), first: true } : null,
    cities: h.cities.map(([city, vans]) => ({
      cityKey: `${h.cc}-${slug(city)}`, name: city,
      vans: vans.map(([no, driver, store, status, progressPct, eta, planned, minutes, cause, note, units]): FleetVan => ({
        truckId: truckId(h.cc, no), label: `Express ${no}`, driver, status, store, units,
        etaAt: at(eta, h.utc), plannedAt: at(planned, h.utc), progressPct, late: { minutes, cause, note },
      })),
    })),
  };
}

/** country · fleet no · hub · service status · km to service (negative = overdue) */
const SERVICE: [CountryCode, number, string, FleetServiceRow["status"], number][] = [
  ["US", 107, "Lancaster", "overdue", -3240],
  ["CA", 214, "Guelph", "overdue", -1120],
  ["GB", 318, "Bedford", "due_soon", 420],
  ["DE", 402, "Brandenburg", "due_soon", 610],
  ["US", 119, "Lancaster", "in_workshop", 0],
  ["DE", 412, "Brandenburg", "in_workshop", 0],
  ["JP", 503, "Chiba", "in_workshop", 0],
];
/** country · fleet no · hub · store it is heading to · cargo °C */
const CARGO: [CountryCode, number, string, string, number][] = [["DE", 411, "Brandenburg", "Altona", 17.8]];

/**
 * Delivered stops of the last 7 days and of the 7 before, by country. The mockup gives the totals (245 of
 * 268 on time, 23 late: traffic 11, breakdown 5, late departure 4, storm 3; 3.2 points under the week
 * before); the split by country is made up so the panel follows the region control.
 */
const STOPS: Record<CountryCode, { stops: number; prevStops: number; prevOnTime: number; late: Partial<Record<DelayCause, number>> }> = {
  US: { stops: 72, prevStops: 70, prevOnTime: 66, late: { traffic: 3, breakdown: 2, late_departure: 2 } },
  CA: { stops: 58, prevStops: 56, prevOnTime: 52, late: { traffic: 2, breakdown: 1, storm: 3 } },
  GB: { stops: 52, prevStops: 51, prevOnTime: 49, late: { traffic: 3, late_departure: 1 } },
  DE: { stops: 46, prevStops: 45, prevOnTime: 43, late: { traffic: 1, breakdown: 2, late_departure: 1 } },
  JP: { stops: 40, prevStops: 39, prevOnTime: 37, late: { traffic: 2 } },
};
const CAUSES: DelayCause[] = ["traffic", "breakdown", "late_departure", "storm", "ventilation"];

function onTimeOf(countries: CountryCode[]): FleetOnTime {
  const sum = (pick: (c: (typeof STOPS)[CountryCode]) => number) => countries.reduce((total, cc) => total + pick(STOPS[cc]), 0);
  const lateByCause = CAUSES.map(cause => ({ cause, stops: sum(c => c.late[cause] ?? 0) })).filter(c => c.stops > 0);
  const stops = sum(c => c.stops);
  return { stops, onTime: stops - lateByCause.reduce((total, c) => total + c.stops, 0), prevStops: sum(c => c.prevStops), prevOnTime: sum(c => c.prevOnTime), lateByCause };
}

/*
 * The yard ("All vans"): all 100 vans as the live fleet_now and deliveries had them on Mon 5 Oct, 15:49 CEST
 * (13:49 UTC), read for the approved board (vans-design, Yard): 24 on a trip, 3 of them late, 3 loading,
 * 6 heading back, 2 in the workshop, the rest at their hub. An ETA keeps its distance from that moment on this
 * fixture's clock (Wed 28 Oct, 18:20 UTC). Only the yard reads these rows, so it does not add up with the stage
 * columns and hub cards above, which are the older mockup's moment.
 */
/** Hours east of UTC at each hub on 5 Oct (summer time everywhere but Japan). */
const YARD_UTC: Record<CountryCode, number> = { US: -4, CA: -4, GB: 1, DE: 2, JP: 9 };
const YARD_READ = Date.UTC(2026, 9, 5, 13, 49);
/** A hub's wall time on 5 Oct, as the same distance from the fixture clock: yardAt("10:06", "US") is 17 min after now. */
const yardAt = (hhmm: string, cc: CountryCode) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.parse(shellFixture.clock.now) + Date.UTC(2026, 9, 5, h - YARD_UTC[cc], m) - YARD_READ).toISOString();
};

/** store · city · ETA, or arrival once unloading (local) · progress % · pumpkins aboard · minutes late · cause · note */
type YardTrip = [string, string, string, number, number, number, DelayCause | null, string | null];
/** fleet no · driver · status · service status · km to service · season trips · delivered · on time · trip (null: none) · open fault and its severity */
type YardSeed = [number, string, TruckStatus, ServiceStatus, number, number, number, number, (YardTrip | null)?, [string, FaultSeverity]?];

const YARD: Record<CountryCode, YardSeed[]> = {
  US: [
    [101, "Maya Stokes", "workshop", "in_workshop", -1278, 24, 24, 23],
    [102, "Miles Moss", "driving", "ok", 5792, 24, 23, 20, ["South Side", "Pittsburgh", "10:04", 97.2, 40, 4, null, null]],
    [103, "Owen Carter", "at_hub", "ok", 10425, 24, 24, 22],
    [104, "Lena Ortiz", "returning", "ok", 16589, 24, 24, 24],
    [105, "Carmen Price", "driving", "ok", 16504, 24, 23, 18, ["Fishtown", "Philadelphia", "10:06", 82, 85, 6, null, null]],
    [106, "Theo Price", "driving", "ok", 6363, 24, 23, 22, ["Shadyside", "Pittsburgh", "11:01", 69, 120, 91, "late_departure", "Van swap after the pre-trip check"]],
    [107, "Dana Whitfield", "at_hub", "ok", 2812, 24, 24, 22],
    [108, "Reggie Kim", "at_hub", "ok", 16520, 23, 23, 19],
    [109, "Jamal Greene", "driving", "due_soon", 1139, 24, 23, 21, ["Chelsea", "New York", "10:31", 77.7, 95, 1, null, null]],
    [110, "Hannah Moss", "driving", "ok", 5721, 24, 23, 23, ["Mount Vernon", "Baltimore", "10:08", 77.3, 70, 3, null, null]],
    [111, "Dana Hollis", "driving", "due_soon", 1193, 24, 23, 23, ["Navy Yard", "Washington", "10:13", 90.6, 120, 3, null, null]],
    [112, "Marcus Bell", "driving", "ok", 1682, 24, 23, 22, ["Germantown", "Philadelphia", "10:30", 54.6, 75, 0, null, null]],
    [113, "Nora Carter", "driving", "ok", 6908, 24, 23, 22, ["Old City", "Philadelphia", "10:00", 89.4, 125, 0, null, null], ["Tire pressure low · axle 2", "warning"]],
    [114, "Marcus Barrett", "at_hub", "ok", 15690, 22, 22, 20],
    [115, "Priya Nair", "at_hub", "ok", 16890, 23, 23, 22],
    [116, "Andre Ortiz", "driving", "ok", 14965, 23, 22, 20, ["Park Slope", "New York", "10:15", 90.4, 160, 0, null, null]],
    [117, "Priya Dunn", "at_hub", "ok", 5999, 23, 23, 23],
    [118, "Rosa Kim", "at_hub", "ok", 12100, 23, 23, 20],
    [119, "Tessa Greene", "at_hub", "ok", 8378, 23, 23, 23],
    [120, "Owen Reyes", "driving", "ok", 15972, 23, 22, 19, ["Capitol Hill", "Washington", "10:05", 93.7, 115, 0, null, null]],
  ],
  CA: [
    [201, "Noah Gauthier", "at_hub", "ok", 6089, 17, 17, 17],
    [202, "Tara Singh", "at_hub", "ok", 1715, 17, 17, 14],
    [203, "Liam Pelletier", "at_hub", "ok", 16760, 17, 17, 16],
    [204, "Isla Tremblay", "returning", "ok", 18350, 17, 17, 16],
    [205, "Benoît Bouchard", "at_hub", "ok", 14404, 17, 17, 15],
    [206, "Claire Tremblay", "workshop", "in_workshop", 445, 16, 16, 15],
    [207, "Sam Wilson", "driving", "ok", 4421, 17, 16, 16, ["Kanata", "Ottawa", "10:45", 87.8, 50, 5, null, null]],
    [208, "Erin Campbell", "driving", "ok", 10985, 17, 16, 16, ["ByWard Market", "Ottawa", "10:50", 80, 60, 0, null, null]],
    [209, "Raj Bélanger", "unloading", "ok", 10346, 17, 17, 16, ["Masonville", "London", "09:34", 100, 90, 4, null, null]],
    [210, "Dawn Gagnon", "driving", "ok", 3299, 17, 16, 15, ["Westboro", "Ottawa", "14:04", 15.8, 70, 4, null, null]],
    [211, "Claire Lavoie", "driving", "ok", 5416, 17, 16, 16, ["Portsmouth", "Kingston", "10:29", 82.6, 60, 4, null, null]],
    [212, "Brooke Stewart", "driving", "ok", 6130, 17, 16, 15, ["Danforth", "Toronto", "10:40", 37.8, 75, 5, null, null]],
    [213, "Kieran MacLeod", "driving", "ok", 16631, 17, 16, 14, ["The Annex", "Toronto", "10:45", 30.3, 50, 5, null, null]],
    [214, "Sam Morrison", "loading", "ok", 5470, 17, 16, 14, ["Ancaster", "Hamilton", "10:30", 0, 95, 0, null, null]],
    [215, "Mathieu Fortin", "at_hub", "ok", 16170, 16, 16, 15],
    [216, "Amélie Roy", "loading", "ok", 17910, 17, 16, 15, ["Locke Street", "Hamilton", "10:45", 0, 40, 0, null, null]],
    [217, "Étienne Côté", "at_hub", "due_soon", 677, 16, 16, 15],
    [218, "Gwen Reid", "at_hub", "ok", 4838, 16, 16, 15],
    [219, "Scott Fraser", "at_hub", "ok", 16180, 16, 16, 15],
    [220, "Maddie Sinclair", "at_hub", "ok", 4638, 16, 16, 15],
  ],
  GB: [
    [301, "Rhys Oakes", "driving", "ok", 18794, 19, 18, 16, ["Clifton", "Bristol", "16:03", 55.1, 95, 23, "traffic", "Traffic on the M4"]],
    [302, "Maeve Fenwick", "at_hub", "ok", 3563, 19, 19, 18],
    [303, "Imran Naylor", "at_hub", "ok", 10588, 19, 19, 17],
    [304, "Tom Hughes", "at_hub", "ok", 10199, 19, 19, 19],
    [305, "Aisha Khan", "at_hub", "ok", 16200, 19, 19, 17],
    [306, "Poppy Entwistle", "at_hub", "ok", 19580, 18, 18, 14],
    [307, "Angus Khan", "at_hub", "ok", 18610, 19, 19, 14],
    [308, "Ffion Thackeray", "at_hub", "ok", 9285, 19, 19, 17],
    [309, "Gareth Ridley", "at_hub", "ok", 10129, 19, 19, 15],
    [310, "Bethan Pritchard", "at_hub", "ok", 8186, 19, 19, 18],
    [311, "Tom Rowntree", "stopped", "ok", 16841, 19, 18, 16, ["Ancoats", "Manchester", "16:38", 56.9, 75, 143, "breakdown", "Coolant temperature high · roadside repair"], ["Coolant temperature high", "warning"]],
    [312, "Niamh Garside", "returning", "ok", 2897, 19, 19, 17],
    [313, "Kwame Aldridge", "returning", "due_soon", 831, 19, 19, 18],
    [314, "Aisha Hargreaves", "at_hub", "ok", 18480, 18, 18, 16],
    [315, "Dev Tennant", "driving", "ok", 9276, 19, 18, 17, ["Stokes Croft", "Bristol", "16:57", 16.1, 40, 2, null, null]],
    [316, "Isobel Bassett", "driving", "ok", 5177, 19, 18, 15, ["Chorlton", "Manchester", "15:13", 90.7, 90, 3, null, null]],
    [317, "Callum Lyle", "at_hub", "ok", 18530, 18, 18, 16],
    [318, "Harriet Mayhew", "at_hub", "due_soon", 3, 18, 18, 16],
    [319, "Alfie Okonkwo", "at_hub", "ok", 6523, 18, 18, 16],
    [320, "Freya Coombes", "at_hub", "ok", 19510, 17, 17, 16],
  ],
  DE: [
    [401, "Florian Engel", "at_hub", "ok", 19400, 12, 12, 9],
    [402, "Paula Albrecht", "at_hub", "ok", 3294, 13, 13, 12],
    [403, "Emre Winkler", "at_hub", "ok", 18800, 12, 12, 10],
    [404, "Selin Weber", "at_hub", "ok", 4862, 13, 13, 13],
    [405, "Kemal Krause", "at_hub", "ok", 5654, 13, 13, 13],
    [406, "Franziska Dietrich", "at_hub", "ok", 12248, 13, 13, 12],
    [407, "Matthias Schuster", "at_hub", "ok", 6420, 13, 13, 12],
    [408, "Svenja Petrovic", "returning", "ok", 5454, 13, 13, 12],
    [409, "Tobias Lorenz", "at_hub", "ok", 17510, 13, 13, 11],
    [410, "Lea Brandt", "driving", "ok", 18080, 13, 12, 11, ["Neukölln", "Berlin", "15:58", 93.2, 105, 3, null, null]],
    [411, "Jonas Weber", "returning", "ok", 3083, 13, 13, 13],
    [412, "Annika Bauer", "driving", "ok", 14048, 13, 12, 12, ["Plagwitz", "Leipzig", "16:57", 43.9, 95, 2, null, null]],
    [413, "Dennis Vogel", "driving", "ok", 2068, 13, 12, 12, ["Kreuzberg", "Berlin", "16:16", 61.7, 35, 1, null, null]],
    [414, "Miriam Seidel", "loading", "ok", 17410, 13, 12, 12, ["Altona", "Hamburg", "19:10", 0, 120, 0, null, null]],
    [415, "Milan Franke", "at_hub", "ok", 17140, 12, 12, 11],
    [416, "Carla Yilmaz", "at_hub", "ok", 5482, 12, 12, 12],
    [417, "Lukas Arslan", "at_hub", "ok", 4616, 12, 12, 11],
    [418, "Greta Demir", "at_hub", "ok", 14496, 12, 12, 11],
    [419, "Henrik Lindner", "at_hub", "ok", 11643, 12, 12, 10],
    [420, "Katrin Kuhn", "at_hub", "ok", 1923, 12, 12, 9],
  ],
  JP: [
    [501, "Ryo Ikeda", "at_hub", "ok", 8285, 18, 18, 16],
    [502, "Misaki Nakamura", "at_hub", "ok", 6984, 18, 18, 16],
    [503, "Sota Inoue", "at_hub", "ok", 18150, 17, 17, 16],
    [504, "Nanami Sato", "at_hub", "ok", 18310, 17, 17, 14],
    [505, "Kazuki Kobayashi", "at_hub", "ok", 8284, 17, 17, 14],
    [506, "Hina Kimura", "at_hub", "ok", 1855, 18, 18, 14],
    [507, "Takumi Suzuki", "at_hub", "ok", 2904, 18, 18, 16, null, ["Coolant level low", "warning"]],
    [508, "Rina Kato", "at_hub", "ok", 1544, 17, 17, 17],
    [509, "Daiki Hayashi", "at_hub", "ok", 8495, 17, 17, 14],
    [510, "Emi Takahashi", "at_hub", "ok", 2201, 17, 17, 14],
    [511, "Haruto Yoshida", "at_hub", "ok", 1580, 17, 17, 13],
    [512, "Mio Shimizu", "at_hub", "ok", 19230, 17, 17, 14],
    [513, "Shun Watanabe", "at_hub", "ok", 8645, 17, 17, 15],
    [514, "Yui Yamada", "at_hub", "ok", 18400, 17, 17, 13],
    [515, "Kenta Saito", "at_hub", "ok", 4713, 17, 17, 16],
    [516, "Kaori Ito", "at_hub", "ok", 2956, 17, 17, 14],
    [517, "Ren Sasaki", "at_hub", "ok", 2788, 17, 17, 13],
    [518, "Sakura Mori", "at_hub", "ok", 7033, 17, 17, 16],
    [519, "Yuto Yamamoto", "at_hub", "ok", 3009, 17, 17, 16],
    [520, "Aoi Matsumoto", "at_hub", "ok", 3871, 17, 17, 16],
  ],
};

function toYardVan(h: HubSeed, [no, driver, status, service, kmToService, trips, delivered, onTime, trip, fault]: YardSeed): FleetYardVan {
  return {
    truckId: truckId(h.cc, no), label: `Express ${no}`, fleetNo: no, driver, hubId: hubIdOf(h), status,
    store: trip?.[0] ?? null, city: trip?.[1] ?? null, etaAt: trip ? yardAt(trip[2], h.cc) : null, progressPct: trip?.[3] ?? 0, units: trip?.[4] ?? 0,
    late: { minutes: trip?.[5] ?? 0, cause: trip?.[6] ?? null, note: trip?.[7] ?? null },
    service, kmToService, fault: fault ? { desc: fault[0], severity: fault[1] } : null,
    season: { trips, delivered, onTime },
  };
}

export function fixtureFor(scope: Scope): FleetViewModel {
  const hubs = HUBS.filter(h => inScope(scope, h.region, h.cc));
  const countries = hubs.map(h => h.cc);
  const here = ([cc]: [CountryCode, ...unknown[]]) => countries.includes(cc);
  return {
    hubs: hubs.map(toHub),
    vans: hubs.flatMap(h => YARD[h.cc].map(seed => toYardVan(h, seed))),
    maintenance: SERVICE.filter(here).map(([cc, no, hub, status, kmToService]): FleetServiceRow => ({ truckId: truckId(cc, no), label: `Express ${no}`, hubName: `${hub} hub`, status, kmToService })),
    cargo: CARGO.filter(here).map(([cc, no, hub, store, cargoTempC]): FleetCargoRow => ({ truckId: truckId(cc, no), label: `Express ${no}`, hubName: `${hub} hub`, store, cargoTempC })),
    onTime: onTimeOf(countries),
  };
}

export const fixture: FleetViewModel = fixtureFor(ALL_SCOPE);
