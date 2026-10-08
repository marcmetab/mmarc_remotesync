import { type CSSProperties, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ThemeContext } from "../../theme";
import type { CountryCode, Scope, Variety } from "../../types";
import { BOAT_SVG, FIELD_DOTS, HUB_SVG, LANDMARK_SVG, LIGHTHOUSE_SVG, PARKED_VAN_SVG, PUMPKIN_LOW_SVG, PUMPKIN_OK_SVG, PUMPKIN_OUT_SVG, SHIP_SVG, STORE_SVG, VAN_SVG, WORKSHOP_SVG } from "./art";
import { GEO, ROADS_SVG, TERRAIN_SVG } from "./geo";
import { svgElement } from "./markup";
import { seesKey } from "../../visible";
import { CITY_AT, cx, type Daylight, groundBox, HUB_AT, inScopeCC, inSeenGround, nameFromKey, storeOpacity, type VanSpot, vanAria, VAN_COLOR, vanOpacity, vanTrail } from "./model";
import type { WorldCity, WorldHub, WorldStat, WorldStore, WorldVan } from "./types";

/*
 * The plane's layers, back to front: the terrain, the roads, the night over the land, the scenery, then the sprites
 * (fields, workshops, hubs, stores, landmarks, labels, vans). Every sprite is a button whose `data-pick` names the
 * card it opens (WorldMap reads hover, focus and clicks from the plane); a name label carries its sprite's pick for
 * the pointer but is no tab stop of its own. Sprites stack by their foot's y (z-index).
 * Each layer is memoized on props that change only with the data, the scope, the counter picked or the card shown,
 * so the one-second tick that moves the vans re-renders the vans alone.
 */

/** A layout effect in the browser; on the server (the static preview) nothing runs, without React's warning. */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The terrain, shown as one image. As live SVG its 3,000-odd shapes (every tree, hill, flower and wave a placed copy)
 * are as many separate pieces for the browser to sort into layers on each frame that paints, which made a zoom stutter
 * and then sharpen in steps; as an image it is one piece, drawn sharp at each zoom. Its paint is inline, with the
 * --pdw-* tokens (gen_world.py), which an image cannot read: they are filled in from the map's computed style, again
 * when the theme changes. A bundled data: image, as the app's other images are (the host's CSP allows those). The
 * static preview (no document) draws the live SVG.
 */
export const Terrain = memo(function Terrain() {
  const theme = useContext(ThemeContext);
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(() => TERRAIN_SRC.get(theme) ?? null);
  useBrowserLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const svg = TERRAIN_SVG.replace(/var\((--[\w-]+)\)/g, (token, name: string) => style.getPropertyValue(name).trim() || token);
    const kept = TERRAIN_SRC.get(theme);
    // the same tokens as last time in this theme: the image already built (a page left and opened again)
    if (kept && TERRAIN_SVG_OF.get(theme) === svg) return setSrc(kept);
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    TERRAIN_SRC.set(theme, url);
    TERRAIN_SVG_OF.set(theme, svg);
    setSrc(url);
  }, [theme]);
  return <div ref={ref} className="pd-world-art">
    {src ? <img src={src} width={GEO.w} height={GEO.h} alt="" draggable={false}/> : typeof document === "undefined" ? svgElement(TERRAIN_SVG) : null}
  </div>;
});
/** The terrain image built in each theme this session (and the markup it was built from), so World opens again at once. */
const TERRAIN_SRC = new Map<string, string>(), TERRAIN_SVG_OF = new Map<string, string>();
/** The roads: static markup, built once (markup.tsx) and never diffed again. */
export const Roads = memo(function Roads() {
  return <div className="pd-world-art">{svgElement(ROADS_SVG)}</div>;
});

/**
 * Day and night across the map, from each region's local time (model.ts daylight): a band that sweeps the whole map
 * from left to right, sea and land, the way the line between day and night crosses a globe. Each region holds its own
 * shade across its land (a soft rose at dusk and dawn, a deep blue at night); between regions the shades blend over
 * the sea, so the edge of the night falls in the ocean. `shades`: "NA:0,EU:0.4,APAC:1" (how dark it is). Each
 * shade's strength is a theme token (art.css: --pdw-dusk-a, --pdw-night-a).
 */
export const NightShade = memo(function NightShade({ shades }: { shades: string }) {
  const by = new Map(shades.split(",").map(p => p.split(":") as [string, string]));
  // two stops per region, at the edges of its land, so each region keeps its own shade from coast to coast
  const stops = [...GEO.regions].sort((a, b) => a.land.cx - b.land.cx).flatMap(r => {
    const dark = Math.min(1, Math.max(0, Number(by.get(r.id) ?? 0)));
    const at = (x: number) => Math.min(1, Math.max(0, x / GEO.w));
    return [at(r.land.cx - r.land.w * 0.42), at(r.land.cx + r.land.w * 0.42)].map(offset => ({ offset, dark, rose: Math.sin(Math.PI * dark) }));
  });
  if (!stops.some(s => s.dark > 0)) return null;
  const band = (id: string, color: string, of: (s: typeof stops[number]) => number) =>
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={GEO.w} y2="0">
      {stops.map((s, i) => <stop key={i} offset={s.offset.toFixed(4)} style={{ stopColor: `var(${color})`, stopOpacity: of(s).toFixed(2) }}/>)}
    </linearGradient>;
  return <svg className="pd-world-night" width={GEO.w} height={GEO.h} viewBox={`0 0 ${GEO.w} ${GEO.h}`} aria-hidden="true" focusable="false">
    <defs>{band("pd-world-dusk", "--pdw-dusk", s => s.rose)}{band("pd-world-night", "--pdw-night", s => s.dark)}</defs>
    {/* well past the plane on every side: zoomed out, the viewport shows sea beyond it, and the night covers that too */}
    <rect x={-GEO.w} y={-GEO.h} width={GEO.w * 3} height={GEO.h * 3} fill="url(#pd-world-dusk)" style={{ opacity: "var(--pdw-dusk-a)" }}/>
    <rect x={-GEO.w} y={-GEO.h} width={GEO.w * 3} height={GEO.h * 3} fill="url(#pd-world-night)" style={{ opacity: "var(--pdw-night-a)" }}/>
  </svg>;
});
/** The shades key: how dark each region is (its darkest country). */
export const shadeKey = (light: Record<CountryCode, Daylight>) =>
  GEO.regions.map(r => `${r.id}:${Math.max(0, ...r.countries.map(cc => light[cc]?.dark ?? 0))}`).join(",");
export const litKey = (light: Record<CountryCode, Daylight>) => Object.entries(light).filter(([, d]) => d.lit).map(([cc]) => cc).join(",");

/**
 * The fog over what this viewer may not see (`seen`, src/visible.ts: "CA"): the plane under a haze of the sea's colour,
 * with a soft-edged clearing round each visible country's ground (model.ts groundBox), so the rest of the world sinks
 * out of sight while the map still reads as a map. Nothing when every country is visible (`seen` empty). Its colour
 * and strength are theme tokens (art.css: --pdw-fog, --pdw-fog-a).
 */
export const Fog = memo(function Fog({ seen }: { seen: string }) {
  if (!seen) return null;
  const holes = seen.split(",").map(cc => groundBox(cc as CountryCode));
  const all = { x: -GEO.w, y: -GEO.h, width: GEO.w * 3, height: GEO.h * 3 };
  return <svg className="pd-world-fog" width={GEO.w} height={GEO.h} viewBox={`0 0 ${GEO.w} ${GEO.h}`} aria-hidden="true" focusable="false">
    <defs>
      {/* clear in the middle of each opening, thickening to full fog at its rim */}
      <radialGradient id="pd-world-fog-hole"><stop offset="0.7" stopColor="#000"/><stop offset="1" stopColor="#fff"/></radialGradient>
      <mask id="pd-world-fog-mask" maskUnits="userSpaceOnUse" {...all}>
        <rect {...all} fill="#fff"/>
        {holes.map((b, i) => <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.w * 0.72} ry={b.h * 0.72} fill="url(#pd-world-fog-hole)"/>)}
      </mask>
    </defs>
    <rect {...all} mask="url(#pd-world-fog-mask)" style={{ fill: "var(--pdw-fog)", opacity: "var(--pdw-fog-a)" }}/>
  </svg>;
});

/** Lighthouses, boats and ships: decoration, out of the way of the pointer and of screen readers. */
export const Decor = memo(function Decor({ seen = "" }: { seen?: string }) {
  const kept = (ps: [number, number][]) => ps.filter(p => inSeenGround(seen, p));
  const lighthouses = kept(GEO.decor.lighthouses), boats = kept(GEO.decor.boats), ships = kept(GEO.decor.ships);
  const item = (key: string, [x, y]: [number, number], svg: string, z: number) =>
    <div key={key} className="pd-world-sp pd-world-decor" aria-hidden="true" style={{ left: x, top: y, zIndex: z }}>{svgElement(svg)}</div>;
  return <>
    {lighthouses.map((p, i) => item(`l${i}`, p, LIGHTHOUSE_SVG, Math.round(p[1])))}
    {boats.map((p, i) => item(`b${i}`, p, BOAT_SVG, 0))}
    {ships.map((p, i) => item(`s${i}`, p, SHIP_SVG, 0))}
  </>;
});

/** A field's soil bed with its rows of pumpkins, by variety. */
const FIELD_SVG = Object.fromEntries((Object.keys(FIELD_DOTS) as Variety[]).map(v => [v,
  `<svg width="30" height="20" viewBox="0 0 30 20" aria-hidden="true" style="display: block; overflow: visible"><rect x="0.5" y="0.5" width="29" height="19" rx="4" class="f-soil"></rect><path d="M3 4.5 H27 M3 10 H27 M3 15.5 H27" class="f-row" stroke-width="2.4" stroke-linecap="round"></path><g class="f-pk">${FIELD_DOTS[v]}</g></svg>`,
])) as Record<Variety, string>;

const at = (x: number, y: number, z: number, opacity = 1) => ({ left: x, top: y, zIndex: z, opacity: opacity < 1 ? opacity : undefined });
const hubLabel = (hubs: Map<string, WorldHub>, hubId: string) => hubs.get(hubId)?.name ?? `${nameFromKey(hubId)} hub`;
const byHub = (hubs: WorldHub[] | undefined) => new Map((hubs ?? []).map(h => [h.hubId, h]));

/** `seen`: the countries this viewer may see ("CA"; empty: all of them, src/visible.ts): the others are left out. */
type LayerProps = { on: boolean; scope: Scope; hot: string | null; seen?: string };

export const Fields = memo(function Fields({ on, scope, hot, hubs, seen = "" }: LayerProps & { hubs?: WorldHub[] }) {
  const names = useMemo(() => byHub(hubs), [hubs]);
  return <div className={cx("pd-world-layer", !on && "is-off")}>
    {GEO.fields.filter(f => seesKey(seen, HUB_AT.get(f.hubId)?.countryCode ?? "US")).map(f => {
      const pick = `field:${f.hubId}:${f.fieldNo}`, cc = HUB_AT.get(f.hubId)?.countryCode ?? "US";
      return <button type="button" key={pick} data-pick={pick} className={cx("pd-world-field", hot === pick && "is-hot")} aria-label={`Field ${f.fieldNo}, ${f.variety}, ${hubLabel(names, f.hubId)}`}
        style={at(f.x, f.y, 1, inScopeCC(scope, cc) ? 1 : 0.4)}>{svgElement(FIELD_SVG[f.variety])}</button>;
    })}
  </div>;
});

export const Workshops = memo(function Workshops({ on, scope, hot, hubs, seen = "" }: LayerProps & { hubs?: WorldHub[] }) {
  const names = useMemo(() => byHub(hubs), [hubs]);
  return <div className={cx("pd-world-layer", !on && "is-off")}>
    {GEO.hubs.filter(h => seesKey(seen, h.countryCode)).map(h => {
      const pick = `workshop:${h.hubId}`;
      return <button type="button" key={pick} data-pick={pick} className={cx("pd-world-sp", hot === pick && "is-hot")} aria-label={`${hubLabel(names, h.hubId).replace(/ hub$/, "")} workshop`}
        style={at(h.workshop[0], h.workshop[1], Math.round(h.workshop[1]), inScopeCC(scope, h.countryCode) ? 1 : 0.45)}>{svgElement(WORKSHOP_SVG)}</button>;
    })}
  </div>;
});

export const Hubs = memo(function Hubs({ on, scope, hot, hubs, lit, seen = "" }: LayerProps & { hubs?: WorldHub[]; lit: string }) {
  const names = useMemo(() => byHub(hubs), [hubs]);
  return <div className={cx("pd-world-layer", !on && "is-off")}>
    {GEO.hubs.filter(h => seesKey(seen, h.countryCode)).map(h => {
      const pick = `hub:${h.hubId}`;
      return <button type="button" key={pick} data-pick={pick} className={cx("pd-world-sp", lit.includes(h.countryCode) && "is-night", hot === pick && "is-hot")} aria-label={hubLabel(names, h.hubId)}
        style={at(h.barn[0], h.barn[1], Math.round(h.barn[1]), inScopeCC(scope, h.countryCode) ? 1 : 0.45)}>{svgElement(HUB_SVG)}</button>;
    })}
  </div>;
});

/** The stock badge over a store: a whole pumpkin, half a pumpkin, or a dashed outline. */
const BADGE = { ok: PUMPKIN_OK_SVG, low: PUMPKIN_LOW_SVG, out: PUMPKIN_OUT_SVG } as const;
const STOCK_ARIA = { ok: "stocked", low: "running low", out: "out of pumpkins" } as const;

/** The 100 stores, drawn from the layout at once; a store's badge, size and name come with its row. */
export const Stores = memo(function Stores({ on, scope, hot, stores, cities, focus, lit, seen = "" }: LayerProps & { stores?: WorldStore[]; cities?: WorldCity[]; focus: WorldStat | null; lit: string }) {
  const rows = useMemo(() => new Map((stores ?? []).map(s => [s.storeId, s])), [stores]);
  const cityNames = useMemo(() => new Map((cities ?? []).map(c => [c.cityKey, c.name])), [cities]);
  return <div className={cx("pd-world-layer", !on && "is-off")}>
    {GEO.stores.filter(g => seesKey(seen, CITY_AT.get(g.cityKey)?.countryCode ?? "US")).map(g => {
      const s = rows.get(g.storeId), pick = `store:${g.storeId}`, cc = s?.countryCode ?? CITY_AT.get(g.cityKey)?.countryCode ?? "US";
      const opacity = storeOpacity(s?.stock ?? null, inScopeCC(scope, cc), focus);
      const label = s ? [s.name, cityNames.get(s.cityKey), STOCK_ARIA[s.stock]].filter(Boolean).join(", ") : `Store ${g.storeId}`;
      return <button type="button" key={g.storeId} data-pick={pick} aria-label={label} style={at(g.x, g.y, Math.round(g.y), opacity)}
        className={cx("pd-world-sp pd-world-store", s?.format === "flagship" && "is-flagship", s?.format === "express" && "is-express", lit.includes(cc) && "is-night", hot === pick && "is-hot")}>
        <span className="pd-world-store-art">{svgElement(STORE_SVG)}</span>
        {s && <span className="pd-world-badge">{svgElement(BADGE[s.stock])}</span>}
      </button>;
    })}
  </div>;
});

/** Each city's icon on its plaza (its landmark, or a pumpkin fountain): hovering one shows its city. */
export const Landmarks = memo(function Landmarks({ scope, hot, cities, seen = "" }: Omit<LayerProps, "on"> & { cities?: WorldCity[] }) {
  const names = useMemo(() => new Map((cities ?? []).map(c => [c.cityKey, c.name])), [cities]);
  return <>
    {GEO.landmarks.filter(l => seesKey(seen, CITY_AT.get(l.cityKey)?.countryCode ?? "US")).map(l => {
      const pick = `city:${l.cityKey}`, cc = CITY_AT.get(l.cityKey)?.countryCode ?? "US", city = names.get(l.cityKey);
      return <button type="button" key={l.cityKey} data-pick={pick} className={cx("pd-world-sp pd-world-landmark", hot === pick && "is-hot")} aria-label={city ? `${l.name}, ${city}` : l.name}
        style={at(l.x, l.y, Math.round(l.y), inScopeCC(scope, cc) ? 1 : 0.45)}>{svgElement(LANDMARK_SVG[l.kind])}</button>;
    })}
  </>;
});

/**
 * City and hub names, over everything else on the plane. Their size in plane pixels follows the zoom through
 * --pdw-ls (labelSize, set round them by WorldMap; world.css), so a zoom restyles them without rendering them again.
 * A name opens the same card as its landmark or hub, for the pointer only: the keyboard and screen readers have that
 * sprite.
 */
export const Labels = memo(function Labels({ scope, cities, hubs, seen = "" }: { scope: Scope; cities?: WorldCity[]; hubs?: WorldHub[]; seen?: string }) {
  const names = useMemo(() => new Map((cities ?? []).map(c => [c.cityKey, c.name])), [cities]);
  const hubNames = useMemo(() => byHub(hubs), [hubs]);
  return <>
    {GEO.cities.filter(c => seesKey(seen, c.countryCode)).map(c => {
      const name = names.get(c.cityKey) ?? nameFromKey(c.cityKey);
      return <span key={c.cityKey} data-pick={`city:${c.cityKey}`} className="pd-world-sp pd-world-label" aria-hidden="true"
        style={at(c.label[0], c.label[1], 50000 + Math.round(c.y), inScopeCC(scope, c.countryCode) ? 1 : 0.45)}>{name}</span>;
    })}
    {GEO.hubs.filter(h => seesKey(seen, h.countryCode)).map(h => <span key={h.hubId} data-pick={`hub:${h.hubId}`} className="pd-world-sp pd-world-label is-hub" aria-hidden="true"
      style={at(h.label[0], h.label[1], 50000 + Math.round(h.y), inScopeCC(scope, h.countryCode) ? 1 : 0.45)}>{hubLabel(hubNames, h.hubId)}</span>)}
  </>;
});

export type PlacedVan = { van: WorldVan; spot: VanSpot; frac: number };
/** A van carrying no pumpkins. */
const EMPTY = new Set<WorldVan["status"]>(["returning", "at_hub", "workshop"]);

/**
 * The vans, pumpkin trucks seen from above: parked ones small in their bays, the rest full size on the road, the bed
 * framed in their status colour. Loaded with pumpkins on the way to a store (and while loading); bare slats when empty:
 * heading back, parked or in the workshop. A ring pulses round a van loading, stopped or unloading. Moving vans glide
 * between the one-second ticks (world.css: left and top ease over a second, linear).
 */
export const Vans = memo(function Vans({ on, scope, hot, vans, focus }: LayerProps & { vans: PlacedVan[]; focus: WorldStat | null }) {
  return <div className={cx("pd-world-layer", !on && "is-off")}>
    {vans.map(({ van, spot }) => {
      const pick = `van:${van.truckId}`, s = van.status;
      const moving = s === "driving" || s === "returning", pulse = s === "loading" || s === "stopped" || s === "unloading";
      return <button type="button" key={van.truckId} data-pick={pick} aria-label={vanAria(van)}
        className={cx("pd-world-van", moving && "is-moving", EMPTY.has(s) && "is-empty", pulse && "is-pulse", hot === pick && "is-hot")}
        style={{
          left: Number(spot.x.toFixed(1)), top: Number(spot.y.toFixed(1)), zIndex: Math.round(spot.y) + (spot.road ? 1 : 0),
          transform: `translate(-50%, -50%) rotate(${spot.deg.toFixed(1)}deg)`, color: VAN_COLOR[s], opacity: vanOpacity(van, scope, focus),
        }}>{svgElement(spot.road ? VAN_SVG : PARKED_VAN_SVG)}</button>;
    })}
  </div>;
});

/** Vans on a trip: out, unloading, or on the way back. */
const ON_TRIP = new Set<WorldVan["status"]>(["driving", "stopped", "unloading", "returning"]);

/*
 * The overview's marks, built once and shared by every mark of a kind (React elements are immutable). Each is drawn
 * round its spot (0,0) at screen size: a shop (walls, roof, door); a town (two houses and a tower, a flag on the tower
 * when a store runs low or out); a van's arrow, pointing the way it drives (a red square with a pause sign when it
 * is stopped); a hub's barn (art.ts, the full map's, at 0.46) on its yard, a red flag on its vane when a van is stopped.
 */
const OV_SHOP = <svg width="10" height="10" viewBox="-5 -5 10 10" focusable="false">
  <ellipse cx="0" cy="3.7" rx="4.4" ry="1.1" className="ov-shadow"/>
  <path d="M-3.4 3.6V-.4L0-3.8L3.4-.4V3.6Z" className="ov-shop-wall"/>
  <path d="M-4.4 .4L0-4.6L4.4 .4" className="ov-shop-roof"/>
  <rect x="-.9" y="1" width="1.8" height="2.6" className="ov-shop-door"/>
</svg>;
const TOWN = <>
  <ellipse cx="0" cy="6.2" rx="12" ry="2.6" className="ov-shadow"/>
  <rect x="-10" y="-1" width="6.5" height="7" className="ov-town-wall"/>
  <path d="M-10.8-1L-6.75-5.2L-2.7-1Z" className="ov-town-tile"/>
  <rect x="-8.2" y="1.6" width="2.6" height="2.4" className="win"/>
  <rect x="-3.6" y="-9" width="7.2" height="15" className="ov-town-tower"/>
  <rect x="-4.3" y="-10.6" width="8.6" height="1.9" rx=".4" className="ov-town-roof"/>
  <path d="M-2.4-7h1.6v1.9h-1.6zM.5-7h1.6v1.9H.5zM-2.4-3.7h1.6v1.9h-1.6zM.5-3.7h1.6v1.9H.5zM-2.4-.4h1.6v1.9h-1.6zM.5-.4h1.6v1.9H.5z" className="win"/>
  <rect x="4.2" y="-3" width="6.6" height="9" className="ov-town-wall"/>
  <path d="M3.4-3L7.5-6.8L11.6-3Z" className="ov-town-roof"/>
  <rect x="6.5" y="2" width="2" height="4" className="ov-town-door"/>
</>;
const OV_TOWN = <svg width="26" height="38" viewBox="-13 -19 26 38" focusable="false">{TOWN}</svg>;
const OV_TOWN_FLAG = <svg width="26" height="38" viewBox="-13 -19 26 38" focusable="false">
  {TOWN}<path d="M0-10.6V-18" className="ov-pole"/><path d="M0-18L6.5-16L0-14Z" className="ov-flag"/>
</svg>;
const ARROW = "M6.5 0L-4.5-5.5L-2 0L-4.5 5.5Z";
const OV_ARROW = <svg width="14" height="14" viewBox="-7 -7 14 14" focusable="false">
  <path d={ARROW} transform="translate(.6 .9)" className="ov-shadow"/><path d={ARROW} className="ov-arrow"/>
</svg>;
const OV_STOP = <svg width="14" height="14" viewBox="-7 -7 14 14" focusable="false">
  <rect x="-5" y="-5" width="10" height="10" rx="2.6" className="ov-stop"/>
  <path d="M-2.4-2.6h1.6v5.2h-1.6zM.8-2.6h1.6v5.2H.8z" className="ov-pause"/>
</svg>;
const OV_BARN = <g transform="translate(-24.84 -28.48) scale(.46)">{svgElement(HUB_SVG)}</g>;
const OV_HUB_FLAG = <><path d="M9.66-23.4V-34.5" className="ov-pole"/><path d="M9.66-34.5L20.5-31.4L9.66-28.3Z" className="ov-flag"/></>;
/** The overview's roads (plane paths): each hub's ring and its roads to its cities; the stores' driveways. */
const ovRoads = (seen: string) => GEO.hubs.filter(h => seesKey(seen, h.countryCode)).map(h => `M${h.x - h.ring} ${h.y}a${h.ring} ${h.ring} 0 1 0 ${2 * h.ring} 0a${h.ring} ${h.ring} 0 1 0 ${-2 * h.ring} 0`).join("")
  + GEO.cities.filter(c => seesKey(seen, c.countryCode)).map(c => `M${c.from[0]} ${c.from[1]}Q${c.ctrl[0]} ${c.ctrl[1]} ${c.x} ${c.y}`).join("");
const ovDrives = (seen: string) => GEO.stores.map(s => { const c = CITY_AT.get(s.cityKey); return c && seesKey(seen, c.countryCode) ? `M${c.x} ${c.y}L${s.x} ${s.y}` : ""; }).join("");
const OV_ROADS = ovRoads(""), OV_DRIVES = ovDrives("");

/**
 * The overview: what the map shows from far out (all regions), each mark kept at screen size whatever the zoom (scaled
 * by 1 / zoom: --pdw-k round it, WorldMap and world.css), so it reads where the full map's sprites are specks. Its hub's barn
 * with a sign under it (the name, then a tick per van: out, stopped, at the hub), a town per city (flagged when one of
 * its stores is low or out), a little shop per store in its stock colour, and an arrow per van on the road, turned the
 * way it drives, with the stretch it just drove; the regions are lettered
 * over it (WorldOverlays Callouts). It fades out as the camera zooms in and the full map fades in (WorldMap, --pdw-ov). Its marks click like the sprites they stand for; they are no tab stops
 * (the full map's sprites are), so they are hidden from screen readers.
 */
export const Overview = memo(function Overview({ scope, hot, show, vans, stores, cities, hubs, focus, seen = "" }: {
  scope: Scope; hot: string | null; show: Record<"stores" | "vans" | "hubs", boolean>; vans: PlacedVan[]; stores?: WorldStore[]; cities?: WorldCity[];
  hubs?: WorldHub[]; focus: WorldStat | null; seen?: string;
}) {
  const roads = useMemo(() => seen ? ovRoads(seen) : OV_ROADS, [seen]), drives = useMemo(() => seen ? ovDrives(seen) : OV_DRIVES, [seen]);
  const geoStores = useMemo(() => GEO.stores.filter(g => seesKey(seen, CITY_AT.get(g.cityKey)?.countryCode ?? "US")), [seen]);
  const geoCities = useMemo(() => GEO.cities.filter(c => seesKey(seen, c.countryCode)), [seen]);
  const geoHubs = useMemo(() => GEO.hubs.filter(h => seesKey(seen, h.countryCode)), [seen]);
  const stock = useMemo(() => new Map((stores ?? []).map(s => [s.storeId, s])), [stores]);
  const cityNames = useMemo(() => new Map((cities ?? []).map(c => [c.cityKey, c.name])), [cities]);
  const hubNames = useMemo(() => byHub(hubs), [hubs]);
  const worst = useMemo(() => {
    const out = new Map<string, "low" | "out">();
    for (const g of GEO.stores) {
      const k = stock.get(g.storeId)?.stock;
      if (k === "out" || (k === "low" && out.get(g.cityKey) !== "out")) out.set(g.cityKey, k);
    }
    return out;
  }, [stock]);
  const trips = new Map<string, { out: number; stopped: number; total: number }>();
  for (const { van } of vans) {
    const t = trips.get(van.hubId) ?? { out: 0, stopped: 0, total: 0 };
    t.total++; if (ON_TRIP.has(van.status)) t.out++; if (van.status === "stopped") t.stopped++;
    trips.set(van.hubId, t);
  }
  const moving = show.vans ? vans.filter(p => p.spot.road) : [];
  return <div className="pd-world-ov" aria-hidden="true">
    <svg className="pd-world-ov-trails" width={GEO.w} height={GEO.h} viewBox={`0 0 ${GEO.w} ${GEO.h}`} focusable="false">
      {/* pathLength 1: the World page's lift-off draws them out (world/liftoff.css). */}
      <path d={roads} className="ov-road-edge" pathLength={1}/>
      <path d={drives} className="ov-drive" pathLength={1}/>
      <path d={roads} className="ov-road" pathLength={1}/>
      {moving.map(({ van, frac }) => {
        const d = vanTrail(van, frac);
        return d ? <path key={van.truckId} d={d} style={{ stroke: VAN_COLOR[van.status], opacity: 0.6 * vanOpacity(van, scope, focus) }}/> : null;
      })}
    </svg>
    {show.stores && geoStores.map(g => {
      const s = stock.get(g.storeId), cc = s?.countryCode ?? CITY_AT.get(g.cityKey)?.countryCode ?? "US", pick = `store:${g.storeId}`;
      return <span key={g.storeId} data-pick={pick} className={cx("pd-world-ov-m pd-world-ov-store", s && `is-${s.stock}`, hot === pick && "is-hot")}
        style={{ left: g.x, top: g.y, opacity: storeOpacity(s?.stock ?? null, inScopeCC(scope, cc), focus) }}>{OV_SHOP}</span>;
    })}
    {geoCities.map(c => {
      const pick = `city:${c.cityKey}`, w = worst.get(c.cityKey), hub = HUB_AT.get(c.hubId);
      // its name on its outer side, away from the hub (the hub's sign sits under the hub), its near edge clear of the
      // town (12px either side, 11px above, 9px below; the flag 7px higher) (a 12px name: about 3.5px a letter wide,
      // 7px half high)
      const label = cityNames.get(c.cityKey) ?? nameFromKey(c.cityKey);
      const dx = hub ? c.x - hub.x : 0, dy = hub ? c.y - hub.y : 1, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const out = 17 + Math.abs(ux) * (label.length * 3.5 + 4) + Math.abs(uy) * 9 + (w && uy < 0 ? -uy * 7 : 0);
      const name = { transform: `translate(calc(-50% + ${(ux * out).toFixed(1)}px), calc(-50% + ${(uy * out).toFixed(1)}px))` };
      return <span key={c.cityKey} data-pick={pick} className={cx("pd-world-ov-m pd-world-ov-city", w && `is-${w}`, hot === pick && "is-hot")}
        style={{ left: c.x, top: c.y, opacity: inScopeCC(scope, c.countryCode) ? 1 : 0.45 }}>
        {w ? OV_TOWN_FLAG : OV_TOWN}<span className="pd-world-ov-name" style={name}>{label}</span>
      </span>;
    })}
    {moving.map(({ van, spot }) => {
      const pick = `van:${van.truckId}`, stopped = van.status === "stopped";
      return <span key={van.truckId} data-pick={pick} className={cx("pd-world-ov-m pd-world-ov-van", van.status === "returning" && "is-empty", stopped && "is-stopped", hot === pick && "is-hot")}
        style={{
          left: Number(spot.x.toFixed(1)), top: Number(spot.y.toFixed(1)), color: VAN_COLOR[van.status], opacity: vanOpacity(van, scope, focus),
          "--pdw-r": `${stopped ? 0 : spot.deg.toFixed(1)}deg`,
        } as CSSProperties}>{stopped ? OV_STOP : OV_ARROW}</span>;
    })}
    {show.hubs && geoHubs.map(h => {
      const pick = `hub:${h.hubId}`, t = trips.get(h.hubId);
      // a tick per van: out first, then the stopped ones, then those at the hub
      const ticks = t ? Array.from({ length: t.total }, (_, i) => i < t.out - t.stopped ? "is-out" : i < t.out ? "is-stopped" : undefined) : [];
      return <span key={h.hubId} data-pick={pick} className={cx("pd-world-ov-m pd-world-ov-hub", hot === pick && "is-hot")}
        style={{ left: h.x, top: h.y, opacity: inScopeCC(scope, h.countryCode) ? 1 : 0.45 }}>
        <svg width="62" height="72" viewBox="-31 -36 62 72" focusable="false">
          <ellipse cx="0" cy="11" rx="31" ry="7.5" className="ov-yard"/>{OV_BARN}{t?.stopped ? OV_HUB_FLAG : null}
        </svg>
        <span className="pd-world-ov-sign">{hubLabel(hubNames, h.hubId).replace(/ hub$/, "")}
          {ticks.length > 0 && <span className="pd-world-ov-ticks">{ticks.map((k, i) => <i key={i} className={k}/>)}</span>}
        </span>
      </span>;
    })}
  </div>;
});
