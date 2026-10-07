import { bothTimes, dayLabel, duration, int, km, pct, plural, time, timeTz } from "../../format";
import { routes } from "../../routes";
import { COUNTRIES, type CountryCode, countryName, DELAY_CAUSE_LABEL, inScope, LATE_MINUTES, type RegionCode, type Scope, type StockStatus, type TruckStatus } from "../../types";
import { seesKey } from "../../visible";
import { GEO } from "./geo";
import type { Pt, WorldCity, WorldEventTone, WorldHub, WorldStat, WorldStore, WorldVan, WorldViewModel } from "./types";

/*
 * The World map's pure parts: the camera (the default fit, a region's view, clamping, projecting a plane point to
 * the viewport and back), where each van stands, the counters, day and night per country, the region callouts and
 * the hover cards. No React and no DOM: WorldMap.tsx and world/layers.tsx draw what these return.
 */

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ── Places ──────────────────────────────────────────────── */

const COUNTRY = new Map(COUNTRIES.map(c => [c.code, c]));
export const tzOf = (cc: CountryCode) => COUNTRY.get(cc)?.tz ?? "UTC";
export const regionOf = (cc: CountryCode): RegionCode => COUNTRY.get(cc)?.region ?? "NA";
export const inScopeCC = (scope: Scope, cc: CountryCode) => inScope(scope, regionOf(cc), cc);

export const HUB_AT = new Map(GEO.hubs.map(h => [h.hubId, h]));
export const CITY_AT = new Map(GEO.cities.map(c => [c.cityKey, c]));
export const STORE_AT = new Map(GEO.stores.map(s => [s.storeId, s]));

/** "US-new-york" → "New York", "US-lancaster" → "Lancaster": a place's name before its row arrives. */
export const nameFromKey = (key: string) => key.slice(key.indexOf("-") + 1).split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** The view model's rows by id. */
export type WorldIndex = { hubs: Map<string, WorldHub>; cities: Map<string, WorldCity>; stores: Map<number, WorldStore>; vans: Map<string, WorldVan> };
export function indexWorld(vm: WorldViewModel): WorldIndex {
  return {
    hubs: new Map((vm.hubs ?? []).map(h => [h.hubId, h])),
    cities: new Map((vm.cities ?? []).map(c => [c.cityKey, c])),
    stores: new Map((vm.stores ?? []).map(s => [s.storeId, s])),
    vans: new Map((vm.vans ?? []).map(v => [v.truckId, v])),
  };
}
export const hubName = (idx: WorldIndex, hubId: string) => idx.hubs.get(hubId)?.name ?? `${nameFromKey(hubId)} hub`;
export const cityName = (idx: WorldIndex, cityKey: string) => idx.cities.get(cityKey)?.name ?? nameFromKey(cityKey);
/** "PK-US-115" → 115 (the fleet number), from the van's row or the id. */
const fleetNo = (idx: WorldIndex, truckId: string) => idx.vans.get(truckId)?.fleetNo ?? /(\d+)$/.exec(truckId)?.[1] ?? truckId;

/* ── Camera ──────────────────────────────────────────────── */

/** Where the camera looks (plane pixels) and its zoom. */
export type Camera = { fx: number; fy: number; z: number };
/** The viewport, in CSS pixels. */
export type Size = { w: number; h: number };
/** The viewport before it is measured, and in the static preview. */
export const DEFAULT_SIZE: Size = { w: 1146, h: 720 };
/** One press of the zoom buttons. */
export const ZOOM_STEP = 1.35;
const Z_MIN = 0.22, Z_MAX = 3;

/**
 * The zoom that fits a box of the plane, leaving `room` px of height for what floats over the map (by default the
 * callouts above the land and the activity panel below it).
 */
const zoomToFit = (w: number, h: number, size: Size, room = 300) => Math.min((size.w - 40) / w, (size.h - room) / h);
/** How far out the camera goes: 0.22, or less on a small screen, so the whole land still fits there (down to 0.07). */
const minZoom = (size: Size) => clamp(zoomToFit(GEO.fit.w, GEO.fit.h, size, 200), 0.07, Z_MIN);

/** A box of the plane, centred, at `minZ` at least. */
function boxCamera(box: { cx: number; cy: number; w: number; h: number }, size: Size, room?: number, minZ = 0): Camera {
  const z = Math.max(zoomToFit(box.w, box.h, size, room), minZ);
  return { fx: box.cx, fy: box.cy + 6 / Math.max(0.2, z), z: clamp(z, minZoom(size), 1.1) };
}
/** The whole land: the overview, which has no callout cards over it, so it fits tighter. */
export const fitCamera = (size: Size): Camera => boxCamera(GEO.fit, size, 200);

/**
 * From far out the map shows its overview (world/layers.tsx Overview: markers kept at screen size); closer in, the full
 * map. Below OV_FULL only the overview, above OV_NONE only the map, the two cross-fading between.
 */
const OV_FULL = 0.24, OV_NONE = 0.31;
/** How much of the overview shows at a zoom: 1 far out, 0 close in. */
export const overviewAmount = (z: number) => clamp((OV_NONE - z) / (OV_NONE - OV_FULL), 0, 1);
/** A region's view opens on the full map: at least this zoom, even when that crops its edge a little. */
export const REGION_MIN_Z = OV_NONE + 0.03;
/** Keeps the camera over the land and its zoom in range. */
export function clampCamera(cam: Camera, size: Size): Camera {
  return { fx: clamp(cam.fx, GEO.w * 0.1, GEO.w * 0.9), fy: clamp(cam.fy, GEO.h * 0.2, GEO.h * 0.85), z: clamp(cam.z, minZoom(size), Z_MAX) };
}
/** A region's view (a country flies to its region); null for all regions. */
export function regionCamera(scope: Scope, size: Size): Camera | null {
  const id = scope.country ? regionOf(scope.country) : scope.region;
  const r = GEO.regions.find(x => x.id === id);
  return r ? boxCamera(r.fit, size, undefined, REGION_MIN_Z) : null;
}
/** Where the camera rests until the viewer moves it: the scope's region, or the whole land. */
/**
 * Where the camera rests until the viewer moves it: the scope's region, or the whole land; for a viewer who may see
 * some countries only (`seen`, src/visible.ts), those countries' ground.
 */
export const homeCamera = (scope: Scope, size: Size, seen = "") =>
  regionCamera(scope, size) ?? (seen ? boxCamera(seenBox(seen), size, undefined, REGION_MIN_Z) : fitCamera(size));

/** The ground of a country: its hubs and their rings and workshops, its roads, cities, stores and fields, with a margin. */
const GROUND = new Map<CountryCode, { cx: number; cy: number; w: number; h: number }>();
export function groundBox(cc: CountryCode) {
  const kept = GROUND.get(cc);
  if (kept) return kept;
  const hubs = GEO.hubs.filter(h => h.countryCode === cc), hubIds = new Set(hubs.map(h => h.hubId));
  const cities = GEO.cities.filter(c => c.countryCode === cc), cityKeys = new Set(cities.map(c => c.cityKey));
  const pts: Pt[] = [
    ...hubs.flatMap(h => [[h.x - h.ring, h.y - h.ring], [h.x + h.ring, h.y + h.ring], h.workshop, h.label] as Pt[]),
    ...cities.flatMap(c => [[c.x, c.y], c.from, c.label] as Pt[]),
    ...GEO.stores.filter(st => cityKeys.has(st.cityKey)).map(st => [st.x, st.y] as Pt),
    ...GEO.fields.filter(f => hubIds.has(f.hubId)).map(f => [f.x, f.y] as Pt),
  ];
  const pad = 220, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  const box = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
  GROUND.set(cc, box);
  return box;
}
/** The ground of every country in `seen` ("CA", "GB,DE"), as one box. */
export function seenBox(seen: string) {
  const boxes = seen.split(",").map(cc => groundBox(cc as CountryCode));
  const x0 = Math.min(...boxes.map(b => b.cx - b.w / 2)), x1 = Math.max(...boxes.map(b => b.cx + b.w / 2));
  const y0 = Math.min(...boxes.map(b => b.cy - b.h / 2)), y1 = Math.max(...boxes.map(b => b.cy + b.h / 2));
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
}
/** Whether a plane point lies in the clear ground round a visible country (the fog's openings, layers.tsx Fog). */
export const inSeenGround = (seen: string, [x, y]: Pt) => !seen || seen.split(",").some(cc => {
  const b = groundBox(cc as CountryCode);
  return ((x - b.cx) / (b.w * 0.5)) ** 2 + ((y - b.cy) / (b.h * 0.5)) ** 2 <= 1;
});

/** The plane's CSS transform: zoom, then the camera's point to the middle of the viewport. */
export const planeTransform = (cam: Camera) =>
  `scale(${cam.z}) translate(${(GEO.w / 2 - cam.fx).toFixed(1)}px, ${(GEO.h / 2 - cam.fy).toFixed(1)}px)`;

/** A plane point on the viewport (`s`: plane pixels to screen pixels, the zoom). */
export function project(x: number, y: number, cam: Camera, size: Size): { x: number; y: number; s: number } {
  return { x: size.w / 2 + cam.z * (x - cam.fx), y: size.h / 2 + cam.z * (y - cam.fy), s: cam.z };
}
/** The plane point under a viewport point (`mx`, `my` from the viewport's middle): project's inverse. */
export const screenToPlane = (cam: Camera, mx: number, my: number): Pt => [cam.fx + mx / cam.z, cam.fy + my / cam.z];
/** The camera at zoom `z` that puts the plane point `at` under the viewport point (`mx`, `my` from its middle). */
export const anchorCamera = (at: Pt, mx: number, my: number, z: number): Camera => ({ fx: at[0] - mx / z, fy: at[1] - my / z, z });

/** Labels keep about 11px on screen as the camera zooms (10.5 to 26 plane pixels). */
export const labelSize = (z: number) => Math.round(clamp(11 / Math.max(0.2, z), 10.5, 26) * 10) / 10;

/** The minimap's view rectangle, in minimap pixels. */
export function miniRect(cam: Camera, size: Size) {
  const { scale, origin: [ox, oy], size: [mw, mh] } = GEO.mini;
  const w = size.w / cam.z, h = size.h / cam.z;
  const x0 = Math.max(1, (cam.fx - w / 2 - ox) * scale), y0 = Math.max(1, (cam.fy - h / 2 - oy) * scale);
  const x1 = Math.min(mw - 1, (cam.fx + w / 2 - ox) * scale), y1 = Math.min(mh - 1, (cam.fy + h / 2 - oy) * scale);
  return { x: x0, y: y0, w: Math.max(4, x1 - x0), h: Math.max(4, y1 - y0) };
}
/** A point of the minimap (as a share of its width and height) on the plane. */
export const miniToPlane = (u: number, v: number): Pt => [GEO.mini.origin[0] + u * GEO.mini.size[0] / GEO.mini.scale, GEO.mini.origin[1] + v * GEO.mini.size[1] / GEO.mini.scale];

/* ── Vans ────────────────────────────────────────────────── */

/** A van's colour by status: its bed's frame on the map, its card's pill (world.css, both themes). */
export const VAN_COLOR: Record<TruckStatus, string> = {
  driving: "var(--pdw-van-drive)", stopped: "var(--pdw-van-stop)", unloading: "var(--pdw-van-unload)", returning: "var(--pdw-van-return)",
  loading: "var(--pdw-van-load)", at_hub: "var(--pdw-van-hub)", workshop: "var(--pdw-van-ws)",
};
/** The Live activity dots. */
export const TONE_COLOR: Record<WorldEventTone, string> = {
  drive: "var(--pdw-van-drive)", unload: "var(--pdw-van-unload)", back: "var(--pdw-van-hub)", stop: "var(--pdw-van-stop)", out: "var(--pdw-van-stop)", restock: "var(--pdw-van-unload)",
};

/**
 * Bays: each van's own bay in its hub's lot, its place in fleet order among the hub's vans (20 vans, 20 bays), so a
 * parked van stands where it always does whoever else is out. In the workshop, one of its three places: the same one
 * (that place, mod 3) unless a lower-numbered van holds it, then the next free one.
 */
export function bays(vans: WorldVan[]): Map<string, number> {
  const out = new Map<string, number>(), rank = new Map<string, number>(), held = new Map<string, Set<number>>();
  for (const v of [...vans].sort((a, b) => a.fleetNo - b.fleetNo)) {
    const k = rank.get(v.hubId) ?? 0;
    rank.set(v.hubId, k + 1);
    if (v.status !== "workshop") { out.set(v.truckId, k); continue; }
    const n = HUB_AT.get(v.hubId)?.workshopBays.length || 1, taken = held.get(v.hubId) ?? new Set<number>();
    const bay = Array.from({ length: n }, (_, i) => (k + i) % n).find(b => !taken.has(b)) ?? k % n;
    held.set(v.hubId, taken.add(bay));
    out.set(v.truckId, bay);
  }
  return out;
}

/**
 * The simulated time when the vans arrived and the seconds since: between polls a van keeps driving towards its
 * store (it reaches it at its ETA) or back to the hub (a little faster than the drive out). Null: vans stand still.
 */
export type Motion = { simAtVans: number; elapsedS: number };
/** How far along its road a van is now, 0 (hub) to 1 (city). */
export function shownFrac(van: WorldVan, motion: Motion | null): number {
  if (!motion) return van.frac;
  if (van.status === "driving") {
    const eta = van.etaAt ? Date.parse(van.etaAt) : NaN;
    if (!Number.isFinite(eta)) return van.frac;
    const left = Math.max(60, (eta - motion.simAtVans) / 1000);
    return Math.min(Math.max(van.frac, 0.995), van.frac + (1 - van.frac) * motion.elapsedS / left);
  }
  if (van.status === "returning" && van.driveMin) return Math.max(0, van.frac - motion.elapsedS / (van.driveMin * 60 * 0.95));
  return van.frac;
}

/** A city road's length in plane pixels, measured once. */
const ROAD_LEN = new Map<string, number>();
function roadLength(cityKey: string): number {
  let len = ROAD_LEN.get(cityKey);
  if (len == null) {
    const c = CITY_AT.get(cityKey);
    len = 0;
    if (c) for (let i = 1, p = c.from; i <= 24; i++) { const q = bez(c.from, c.ctrl, [c.x, c.y], i / 24); len += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; }
    ROAD_LEN.set(cityKey, len || 1);
  }
  return len || 1;
}
/** Nose to tail on one lane: a van's length and a gap (plane pixels). */
const QUEUE_GAP = 30;
/**
 * Vans on the same road going the same way never stack: two readings can put them on one spot. Taken from the one
 * nearest its destination back, each keeps QUEUE_GAP behind the one ahead of it. `fracs`: each van's frac (shownFrac);
 * returns them adjusted.
 */
export function queueOnRoads(vans: WorldVan[], fracs: Map<string, number>): Map<string, number> {
  const lanes = new Map<string, WorldVan[]>();
  for (const v of vans) {
    if (!v.cityKey || (v.status !== "driving" && v.status !== "stopped" && v.status !== "returning")) continue;
    const key = `${v.cityKey}|${v.status === "returning" ? "back" : "out"}`;
    lanes.set(key, [...lanes.get(key) ?? [], v]);
  }
  const out = new Map(fracs);
  for (const [key, vs] of lanes) {
    if (vs.length < 2) continue;
    const back = key.endsWith("|back"), gap = QUEUE_GAP / roadLength(vs[0].cityKey!), at = (v: WorldVan) => out.get(v.truckId) ?? v.frac;
    // out to the city the leader is the furthest along; back to the hub, the nearest the hub
    vs.sort((a, b) => back ? at(a) - at(b) : at(b) - at(a));
    for (let i = 1; i < vs.length; i++) {
      const lead = at(vs[i - 1]), f = at(vs[i]);
      out.set(vs[i].truckId, back ? Math.min(1, Math.max(f, lead + gap)) : Math.max(0, Math.min(f, lead - gap)));
    }
  }
  return out;
}

/** A van's lane: its offset from the road's centre line (the road is 26 wide and a van 12, so two pass clear). */
const LANE = 6.5;
/** Where a van stands (plane pixels) and which way it faces (degrees, 0 = right). `road`: drawn as a van on the move. */
export type VanSpot = { x: number; y: number; deg: number; road: boolean };
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
};
const degrees = (radians: number) => radians * 180 / Math.PI;

/**
 * At the hub or loading: its bay in the yard's lot, nose up. In the workshop: a row in front of it. Unloading: on its
 * store's driveway, 30px from the door, facing the store. On the road: along the curve from the hub's ring road to its
 * city's plaza, keeping right (out on one lane, back on the other), facing the way it goes.
 */
export function vanSpot(van: WorldVan, bay: number, frac: number): VanSpot | null {
  const hub = HUB_AT.get(van.hubId);
  if (!hub) return null;
  const parked = (spots: Pt[], deg: number): VanSpot => {
    const [x, y] = spots[bay % spots.length];
    return { x, y, deg, road: false };
  };
  if (van.status === "at_hub" || van.status === "loading") return parked(hub.bays, -90);
  if (van.status === "workshop") return parked(hub.workshopBays, 0);
  const city = van.cityKey ? CITY_AT.get(van.cityKey) : undefined;
  if (!city) return parked(hub.bays, -90);
  const store = van.status === "unloading" && van.storeId != null ? STORE_AT.get(van.storeId) : undefined;
  if (store) {
    const dx = city.x - store.x, dy = city.y - (store.y - 3), d = Math.hypot(dx, dy) || 1;
    return { x: store.x + dx / d * 30, y: store.y - 3 + dy / d * 30, deg: degrees(Math.atan2(-dy, -dx)), road: true };
  }
  const a = city.from, b: Pt = [city.x, city.y];
  const t = van.status === "unloading" ? 1 : clamp(frac, 0, 1);
  const p = bez(a, city.ctrl, b, t), ahead = bez(a, city.ctrl, b, Math.min(1, t + 0.01)), behind = bez(a, city.ctrl, b, Math.max(0, t - 0.01));
  const dx = ahead[0] - behind[0], dy = ahead[1] - behind[1], len = Math.hypot(dx, dy) || 1;
  const back = van.status === "returning", lane = back ? -LANE : LANE;
  return { x: p[0] - dy / len * lane, y: p[1] + dx / len * lane, deg: degrees(Math.atan2(back ? -dy : dy, back ? -dx : dx)), road: true };
}

/** The stretch of road a van on the move just drove, in its lane (a plane path), for the overview's trail; null otherwise. */
export function vanTrail(van: WorldVan, frac: number): string | null {
  if (van.status !== "driving" && van.status !== "returning") return null;
  const city = van.cityKey ? CITY_AT.get(van.cityKey) : undefined;
  if (!city) return null;
  const a = city.from, b: Pt = [city.x, city.y], back = van.status === "returning", lane = back ? -LANE : LANE;
  const t = clamp(frac, 0, 1), t0 = back ? t : Math.max(0, t - 0.16), t1 = back ? Math.min(1, t + 0.16) : t;
  const pts: string[] = [];
  for (let i = 0; i <= 8; i++) {
    const tt = t0 + (t1 - t0) * i / 8, p = bez(a, city.ctrl, b, tt);
    const q = bez(a, city.ctrl, b, Math.min(1, tt + 0.01)), r = bez(a, city.ctrl, b, Math.max(0, tt - 0.01));
    const dx = q[0] - r[0], dy = q[1] - r[1], len = Math.hypot(dx, dy) || 1;
    pts.push(`${(p[0] - dy / len * lane).toFixed(1)} ${(p[1] + dx / len * lane).toFixed(1)}`);
  }
  return `M${pts.join("L")}`;
}

/** What a van is doing, as the card's pill says it: "On the way to Harlem". */
export function vanDoing(van: WorldVan): string {
  const store = van.storeName ?? "a store";
  switch (van.status) {
    case "driving": return `On the way to ${store}`;
    case "stopped": return van.late.note ? `Stopped · ${van.late.note}` : `Stopped on the way to ${store}`;
    case "unloading": return `Unloading at ${store}`;
    case "returning": return "Heading back to the hub";
    case "loading": return `Loading for ${store}`;
    case "at_hub": return "Parked at the hub";
    case "workshop": return "In the workshop";
  }
}
/** "Van 107, on the way to Harlem": a van sprite's name. */
export const vanAria = (van: WorldVan) => `Van ${van.fleetNo}, ${vanDoing(van).replace(/^./, c => c.toLowerCase())}`;

/* ── Counters and focus ──────────────────────────────────── */

/** The counters, in order. A stopped van counts as on the road. */
export const STATS: { stat: WorldStat; label: string }[] = [
  { stat: "driving", label: "On the road" }, { stat: "loading", label: "Loading" }, { stat: "unloading", label: "Unloading" },
  { stat: "returning", label: "Heading back" }, { stat: "hub", label: "At hub" }, { stat: "workshop", label: "In workshop" },
  { stat: "low", label: "Stores low" }, { stat: "out", label: "Stores out" },
];
const STAT_OF: Record<TruckStatus, WorldStat> = { driving: "driving", stopped: "driving", loading: "loading", unloading: "unloading", returning: "returning", at_hub: "hub", workshop: "workshop" };

/** The counters within the scope; null while their part loads. */
export function countWorld(vans: WorldVan[] | undefined, stores: WorldStore[] | undefined, scope: Scope): Record<WorldStat, number | null> {
  const n: Record<WorldStat, number | null> = { driving: null, loading: null, unloading: null, returning: null, hub: null, workshop: null, low: null, out: null };
  if (vans) {
    for (const s of ["driving", "loading", "unloading", "returning", "hub", "workshop"] as const) n[s] = 0;
    for (const v of vans) if (inScopeCC(scope, v.countryCode)) n[STAT_OF[v.status]] = (n[STAT_OF[v.status]] ?? 0) + 1;
  }
  if (stores) {
    n.low = stores.filter(s => s.stock === "low" && inScopeCC(scope, s.countryCode)).length;
    n.out = stores.filter(s => s.stock === "out" && inScopeCC(scope, s.countryCode)).length;
  }
  return n;
}

/** A van's opacity: dimmed outside the scope, and faded when a counter is picked and it is not one of them. */
export const vanOpacity = (van: WorldVan, scope: Scope, focus: WorldStat | null) =>
  !inScopeCC(scope, van.countryCode) ? 0.35 : focus && focus !== STAT_OF[van.status] ? 0.15 : 1;
/** A store's opacity: with "Stores low" or "Stores out" picked only those stay bright; with a van counter, stores step back. */
export function storeOpacity(stock: StockStatus | null, inside: boolean, focus: WorldStat | null) {
  if (!inside) return 0.4;
  if (focus === "low" || focus === "out") return stock === focus ? 1 : 0.3;
  return focus ? 0.55 : 1;
}

/* ── Day and night ───────────────────────────────────────── */

/** The local hour (14.25 for 14:15) at `now` in a zone. */
export function localHour(now: string, tz: string): number {
  const [h, m] = time(now, tz).split(":").map(Number);
  return h + m / 60;
}
/**
 * Day and night per country: `shade`, the opacity of the dark over its land (0 by day, .25 at dusk and dawn, .5 at
 * night); `lit`, the shop windows glow (from 19:30 to 06:30); `day`, the callout shows a sun (06:30 to 19:00).
 */
export type Daylight = { dark: number; lit: boolean; day: boolean };
/** How dark it is at a local hour: clear by day, deepening from 18:00 to full night at 21:00, lifting from 5:00 to 7:00. */
const darkness = (h: number) => h >= 21 || h < 5 ? 1 : h >= 18 ? (h - 18) / 3 : h < 7 ? (7 - h) / 2 : 0;
export function daylight(now: string | undefined): Record<CountryCode, Daylight> {
  const out = {} as Record<CountryCode, Daylight>;
  for (const c of COUNTRIES) {
    const h = now ? localHour(now, c.tz) : 12;
    out[c.code] = { dark: Math.round(darkness(h) * 20) / 20, lit: h >= 19.5 || h < 6.5, day: h >= 6.5 && h < 19 };
  }
  return out;
}

/* ── Region callouts ─────────────────────────────────────── */

const ON_TRIP = new Set<TruckStatus>(["driving", "stopped", "unloading", "returning"]);
export type CalloutModel = {
  id: RegionCode;
  name: string;
  /** Each zone's local time once: "19:15 GMT · 20:15 CET". */
  times: string;
  day: boolean;
  stores: number;
  /** Vans on a trip (out, unloading or on the way back); null while vans load. */
  out: number | null;
  /** Stopped vans and stores out of pumpkins; null while either loads. */
  alerts: number | null;
  at: Pt;
};
export function calloutsFor(vans: WorldVan[] | undefined, stores: WorldStore[] | undefined, now: string | undefined, light: Record<CountryCode, Daylight>, seen = ""): CalloutModel[] {
  // A viewer who may see some countries only (src/visible.ts): the regions and stores of those countries alone.
  return GEO.regions.filter(r => r.countries.some(cc => seesKey(seen, cc))).map(r => {
    const has = (cc: CountryCode) => r.countries.includes(cc) && seesKey(seen, cc);
    const times = [...new Set(r.countries.filter(has).map(cc => now ? timeTz(now, tzOf(cc)) : "—"))].join(" · ");
    const out = vans ? vans.filter(v => has(v.countryCode) && ON_TRIP.has(v.status)).length : null;
    const stopped = vans ? vans.filter(v => has(v.countryCode) && v.status === "stopped").length : null;
    const empty = stores ? stores.filter(s => has(s.countryCode) && s.stock === "out").length : null;
    return {
      // a region the viewer sees one country of is named after that country ("Canada", not "North America")
      id: r.id, name: seen && r.countries.filter(has).length === 1 ? countryName(r.countries.find(has)!) : r.name, times,
      day: light[r.countries.find(has) ?? r.countries[0]]?.day ?? true,
      stores: GEO.stores.filter(s => { const c = CITY_AT.get(s.cityKey); return c ? has(c.countryCode) : false; }).length,
      out, alerts: stopped != null && empty != null ? stopped + empty : null, at: [r.x, r.y],
    };
  });
}

/* ── Show on map ─────────────────────────────────────────── */

export type LayerId = "stores" | "hubs" | "vans" | "workshops" | "fields" | "roads";
export const LAYERS: { id: LayerId; label: string; color: string }[] = [
  { id: "stores", label: "Stores", color: "var(--pdw-pk)" }, { id: "hubs", label: "Hubs", color: "var(--pdw-barn)" },
  { id: "vans", label: "Vans", color: "var(--pdw-van-drive)" }, { id: "workshops", label: "Workshops", color: "var(--pdw-van-ws)" },
  { id: "fields", label: "Fields", color: "var(--pdw-soil)" }, { id: "roads", label: "Roads", color: "var(--pdw-road-edge)" },
];
export const ALL_LAYERS: Record<LayerId, boolean> = { stores: true, hubs: true, vans: true, workshops: true, fields: true, roads: true };

/* ── Cards ───────────────────────────────────────────────── */

/**
 * What hovering, focusing or clicking a sprite shows: "van:PK-US-107", "store:13", "hub:US-lancaster",
 * "workshop:US-lancaster", "field:US-lancaster:2" or "city:US-new-york" (WorldState.pinned).
 */
export type CardRow = { k: string; v: string };
export type CardModel = {
  kind: string;
  title: string;
  sub: string;
  pill: string;
  pillColor: string;
  bar: { label: string; value: string; share: number; color: string } | null;
  rows: CardRow[];
  /** Its page; `scope`: the shell's scope to switch to on the way, when the place lies outside the current one. */
  link: { label: string; to: string; scope?: Scope };
  /** The plane point the card points at, and how far above it (plane pixels) the sprite's top is. */
  at: Pt;
  lift: number;
  /** A van's card follows it as it moves. */
  moving: boolean;
};
export type CardContext = {
  idx: WorldIndex;
  vans: WorldVan[] | undefined;
  /** clock.now, and the simulated time now (between polls). */
  now: string | undefined;
  sim: number | null;
  viewerTz: string;
  /** Where each van stands now and how far along its road it is. */
  spots: Map<string, { spot: VanSpot; frac: number }>;
  /** The shell's scope (the map shows every region; Harvest & fleet only the hubs in scope). */
  scope: Scope;
};

const FORMAT_WORD = { flagship: "Flagship", standard: "Standard", express: "Express" } as const;
const STOCK_WORD: Record<StockStatus, string> = { ok: "Stocked", low: "Running low", out: "Out of pumpkins" };
const STOCK_SHORT: Record<StockStatus, string> = { ok: "Stocked", low: "Low", out: "Out" };
const STOCK_COLOR: Record<StockStatus, string> = { ok: "var(--pdw-van-unload)", low: "var(--pdw-van-load)", out: "var(--pdw-van-stop)" };
const NEXT_WORD = { loading: "loading at hub", driving: "on the way", stopped: "stopped on the way", unloading: "unloading now" } as const;

export function cardFor(pick: string, ctx: CardContext): CardModel | null {
  const at = pick.indexOf(":"), kind = pick.slice(0, at), key = pick.slice(at + 1);
  switch (kind) {
    case "van": return vanCard(key, ctx);
    case "store": return storeCard(Number(key), ctx);
    case "hub": return hubCard(key, ctx);
    case "workshop": return workshopCard(key, ctx);
    case "field": return fieldCard(key, ctx);
    case "city": return cityCard(key, ctx);
    default: return null;
  }
}

function vanCard(truckId: string, ctx: CardContext): CardModel | null {
  const { idx } = ctx, van = idx.vans.get(truckId), placed = ctx.spots.get(truckId);
  if (!van || !placed) return null;
  const tz = tzOf(van.countryCode), when = (iso: string | null) => bothTimes(iso, tz, ctx.viewerTz, true);
  const city = van.cityKey ? cityName(idx, van.cityKey) : null, frac = placed.frac;
  const rows: CardRow[] = [];
  let bar: CardModel["bar"] = null;
  if (van.storeName && van.status !== "returning") rows.push({ k: "Store", v: city ? `${van.storeName}, ${city}` : van.storeName });
  const load = { k: "Load", v: plural(van.bins, "bin") };
  if (van.status === "driving" || van.status === "stopped") {
    rows.push({ k: "Arrives", v: when(van.etaAt) });
    if (van.late.minutes >= LATE_MINUTES) rows.push({ k: "Late", v: van.late.cause ? `${duration(van.late.minutes)} · ${DELAY_CAUSE_LABEL[van.late.cause]}` : duration(van.late.minutes) });
    rows.push(load);
    if (city && van.roadKm != null) bar = { label: `To ${city} · ${km(van.roadKm)}`, value: km(frac * van.roadKm), share: frac, color: VAN_COLOR[van.status] };
  } else if (van.status === "loading") {
    const leaves = van.etaAt && van.driveMin != null ? new Date(Date.parse(van.etaAt) - van.driveMin * 60_000).toISOString() : null;
    if (leaves) rows.push({ k: "Leaves", v: when(leaves) });
    rows.push(load);
  } else if (van.status === "unloading") {
    rows.push({ k: "Arrived", v: when(van.etaAt) }, { k: "Unloading", v: plural(van.bins, "bin") });
  } else if (van.status === "returning") {
    if (city && van.roadKm != null) bar = { label: `From ${city} · ${km(van.roadKm)}`, value: `${km((1 - frac) * van.roadKm)} back`, share: 1 - frac, color: VAN_COLOR.returning };
    else if (city) rows.push({ k: "From", v: city });
    const base = ctx.sim ?? (ctx.now ? Date.parse(ctx.now) : NaN);
    if (van.driveMin != null && Number.isFinite(base)) rows.push({ k: "Back at hub", v: when(new Date(base + frac * van.driveMin * 0.95 * 60_000).toISOString()) });
  } else if (van.status === "workshop") {
    rows.push({ k: "Job", v: van.workshopJob ?? "Scheduled service" });
  }
  if (van.driver) rows.push({ k: "Driver", v: van.driver });
  if (van.plate) rows.push({ k: "Plate", v: van.plate });
  return {
    kind: "Van", title: `Van ${van.fleetNo}`, sub: `${van.model} · ${hubName(idx, van.hubId)}`, pill: vanDoing(van), pillColor: VAN_COLOR[van.status],
    bar, rows, link: { label: "Open van", to: routes.truck(van.truckId) }, at: [placed.spot.x, placed.spot.y], lift: 6, moving: placed.spot.road,
  };
}

function storeCard(storeId: number, ctx: CardContext): CardModel | null {
  const s = ctx.idx.stores.get(storeId), g = STORE_AT.get(storeId);
  if (!s || !g) return null;
  const rows: CardRow[] = s.shelves.map(sh => ({ k: sh.variety, v: `${int(sh.onHand)} / ${int(sh.capacity)}` }));
  const next = s.next;
  rows.push({ k: "Next van", v: next ? `Van ${fleetNo(ctx.idx, next.truckId)} · ${NEXT_WORD[next.status]}` : "None booked" });
  if (next?.etaAt && next.status !== "unloading") rows.push({ k: "Arrives", v: bothTimes(next.etaAt, s.tz, ctx.viewerTz, true) });
  const opens = s.opensAt && ctx.now && dayLabel(s.opensAt, s.tz) !== dayLabel(ctx.now, s.tz) ? `${dayLabel(s.opensAt, s.tz).split(" ")[0]} ${time(s.opensAt, s.tz)}` : time(s.opensAt, s.tz);
  rows.push({ k: "Hours", v: s.isOpen ? (s.closesAt ? `Open until ${time(s.closesAt, s.tz)}` : "Open") : s.opensAt ? `Opens ${opens}` : "Closed" });
  const onHand = s.shelves.reduce((a, sh) => a + sh.onHand, 0), capacity = s.shelves.reduce((a, sh) => a + sh.capacity, 0);
  const share = capacity > 0 ? onHand / capacity : 0;
  return {
    kind: `${FORMAT_WORD[s.format]} store`, title: s.name, sub: `${cityName(ctx.idx, s.cityKey)}, ${countryName(s.countryCode)}`,
    pill: `${STOCK_WORD[s.stock]} · ${s.isOpen ? "open" : "closed"}`, pillColor: STOCK_COLOR[s.stock],
    bar: { label: "Shelf stock", value: pct(share), share, color: STOCK_COLOR[s.stock] }, rows,
    link: { label: "Open store", to: routes.store(s.storeId) }, at: [g.x, g.y], lift: 48, moving: false,
  };
}

/** Harvest & fleet, for a hub's place: a hub the scope leaves out picks its country on the way, so the page shows it. */
const fleetLink = (label: string, cc: CountryCode, scope: Scope): CardModel["link"] =>
  ({ label, to: routes.fleet(), scope: inScopeCC(scope, cc) ? undefined : { region: regionOf(cc), country: cc } });

/** A hub's vans by what they are doing: from the map's vans, or from hub_now while they load. */
function hubVans(hub: WorldHub, vans: WorldVan[] | undefined) {
  if (!vans) return { road: hub.vans.onRoad, loading: hub.vans.loading, unloading: hub.vans.unloading, returning: hub.vans.returning, atHub: hub.vans.atHub, workshop: hub.vans.workshop, total: hub.vans.total };
  const mine = vans.filter(v => v.hubId === hub.hubId), n = (...s: TruckStatus[]) => mine.filter(v => s.includes(v.status)).length;
  return { road: n("driving", "stopped"), loading: n("loading"), unloading: n("unloading"), returning: n("returning"), atHub: n("at_hub"), workshop: n("workshop"), total: mine.length };
}

function hubCard(hubId: string, ctx: CardContext): CardModel | null {
  const hub = ctx.idx.hubs.get(hubId), g = HUB_AT.get(hubId);
  if (!hub || !g) return null;
  const c = hubVans(hub, ctx.vans), out = c.road + c.unloading + c.returning;
  return {
    kind: "Harvest hub", title: hub.name, sub: ctx.now ? `${countryName(hub.countryCode)} · ${timeTz(ctx.now, hub.tz)}` : countryName(hub.countryCode),
    pill: `${out} of ${plural(c.total, "van")} out`, pillColor: VAN_COLOR.driving,
    bar: { label: "Vans out", value: `${out} / ${c.total}`, share: c.total ? out / c.total : 0, color: VAN_COLOR.driving },
    rows: [
      { k: "On the road", v: int(c.road) }, { k: "Loading", v: int(c.loading) }, { k: "Unloading", v: int(c.unloading) }, { k: "Heading back", v: int(c.returning) },
      { k: "At hub", v: int(c.atHub) }, { k: "In workshop", v: int(c.workshop) }, { k: "Fields", v: hub.harvestNote },
      { k: "Picked today", v: `${int(hub.binsToday)} / ${int(hub.planBinsToday)} bins` }, { k: "Hub stock", v: `${int(hub.stockUnits)} pumpkins` },
    ],
    link: fleetLink("Open hub", hub.countryCode, ctx.scope), at: [g.x, g.y], lift: 92, moving: false,
  };
}

function workshopCard(hubId: string, ctx: CardContext): CardModel | null {
  const g = HUB_AT.get(hubId);
  if (!g || !ctx.vans) return null;
  const inside = ctx.vans.filter(v => v.hubId === hubId && v.status === "workshop").sort((a, b) => a.fleetNo - b.fleetNo);
  return {
    kind: "Workshop", title: `${hubName(ctx.idx, hubId).replace(/ hub$/, "")} workshop`, sub: countryName(g.countryCode),
    pill: `${plural(inside.length, "van")} in service`, pillColor: VAN_COLOR.workshop, bar: null,
    rows: inside.map(v => ({ k: `Van ${v.fleetNo}`, v: v.workshopJob ?? "Scheduled service" })),
    link: fleetLink("Open workshop", g.countryCode, ctx.scope), at: g.workshop, lift: 44, moving: false,
  };
}

const FIELD_REST: Record<WorldHub["harvestStatus"], string> = { picking: "Resting", done: "Picked for today", not_started: "Not started yet", rain_stop: "Stopped for rain" };
function fieldCard(key: string, ctx: CardContext): CardModel | null {
  const cut = key.lastIndexOf(":"), hubId = key.slice(0, cut), no = Number(key.slice(cut + 1));
  const f = GEO.fields.find(x => x.hubId === hubId && x.fieldNo === no), hub = ctx.idx.hubs.get(hubId);
  if (!f || !hub) return null;
  const picking = hub.picking.includes(no), share = hub.planBinsToday ? hub.binsToday / hub.planBinsToday : 0;
  return {
    kind: "Field", title: `Field ${no}`, sub: `${f.variety} · ${hub.name}`,
    pill: picking ? "Picking now" : FIELD_REST[hub.harvestStatus], pillColor: picking ? VAN_COLOR.unloading : VAN_COLOR.at_hub,
    bar: { label: "Picked today at the hub", value: `${int(hub.binsToday)} / ${int(hub.planBinsToday)} bins`, share, color: VAN_COLOR.unloading },
    rows: [{ k: "Variety", v: f.variety }, { k: "Hub", v: hub.name }, ...(ctx.now ? [{ k: "Local time", v: timeTz(ctx.now, hub.tz) }] : [])],
    link: fleetLink("Open field", hub.countryCode, ctx.scope), at: [f.x, f.y], lift: 10, moving: false,
  };
}

function cityCard(cityKey: string, ctx: CardContext): CardModel | null {
  const c = ctx.idx.cities.get(cityKey), g = CITY_AT.get(cityKey);
  if (!c || !g) return null;
  const stores = [...ctx.idx.stores.values()].filter(s => s.cityKey === cityKey).sort((a, b) => a.storeId - b.storeId);
  const short = stores.filter(s => s.stock !== "ok").length;
  const coming = ctx.vans?.filter(v => v.cityKey === cityKey && (v.status === "driving" || v.status === "stopped" || v.status === "unloading")).length;
  return {
    kind: "City", title: c.name, sub: `${countryName(c.countryCode)} · ${plural(stores.length || GEO.stores.filter(s => s.cityKey === cityKey).length, "store")}`,
    pill: !stores.length ? "Stores loading" : short ? `${short} of ${stores.length} stores need pumpkins` : "All stores stocked",
    pillColor: short ? VAN_COLOR.loading : VAN_COLOR.unloading, bar: null,
    rows: [
      ...stores.map(s => ({ k: s.name, v: STOCK_SHORT[s.stock] })),
      { k: "Vans coming", v: int(coming) }, { k: "From hub", v: `${km(c.roadKm)} · ${duration(c.driveMin)}` },
    ],
    link: { label: "Open city", to: routes.city(cityKey) }, at: [g.x, g.y + 30], lift: 14, moving: false,
  };
}

/** Where the card goes: beside its sprite, flipped left on the right of the map, nudged to stay inside top and bottom. */
export function cardPlace(card: CardModel, cam: Camera, size: Size, height = 0) {
  const p = project(card.at[0], card.at[1], cam, size), top = p.y - card.lift * p.s, right = p.x > size.w * 0.6;
  const left = Math.round(p.x + (right ? -18 : 18)), tx = right ? "-100%" : "0";
  // Once the card has been measured: centred on its sprite, kept 8px inside the map (its title and Close stay in view).
  if (height > 0) return { left, top: Math.round(clamp(top - height / 2, 8, Math.max(8, size.h - 8 - height))), transform: `translate(${tx}, 0)` };
  const ty = top < 170 ? "-12%" : top > size.h - 190 ? "-88%" : "-50%";
  return { left, top: Math.round(top), transform: `translate(${tx}, ${ty})` };
}
