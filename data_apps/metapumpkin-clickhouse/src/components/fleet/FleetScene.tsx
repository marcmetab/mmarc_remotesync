/*
 * The Harvest & fleet scene: the art at the top of the Fleet page's stage card (FleetPage.tsx), from the approved
 * artboard (fleet-design A2v2). Sky, sun with slowly turning rays, drifting clouds, a few birds; layered hills;
 * the fenced pumpkin field with crates and a scarecrow (a pumpkin hops into the crate); the red barn hub (a crate
 * slides to the parked truck); the cream road with loaded trucks driving right and empty ones driving back; the
 * market with its striped awning and a truck; the garage with a truck going up and down on a lift, a swaying
 * wrench sign and chimney smoke. Floating place labels name the five zones.
 *
 * Drawn in a 1200 x 320 box whose zones (ZONES) line up with the five stage columns under it. A light
 * illustration in both themes: the art keeps its own colours and fleet-scene.css dims it in dark, like the banners;
 * the labels and the late tag take the theme tokens. Decorative (aria-hidden): the columns carry the data.
 *
 * Layers, back to front: the sky (still), the sky sprites (rays, clouds, birds), the land (still: hills, the
 * five places, the road), the land sprites (the hop, the crate, the lift, the sign, the smoke, the trucks on the
 * road), the dusk wash, then the labels. Every moving part is its own small <svg> placed over the still art in %
 * of the scene, so its motion is a transform on an HTML element that the compositor runs without repainting the
 * art (the HalloweenScene pattern). Motion: fleet-scene.css.
 */
import type { CSSProperties, ReactNode } from "react";
import "./fleet-scene.css";

const W = 1200, H = 320;
const pct = (n: number) => `${+(n * 100).toFixed(4)}%`;

export type FleetZone = "picking" | "hubs" | "road" | "unload" | "workshop";
/** Each zone's left and right edge in the scene (of 1200): the stage columns take the same widths. */
export const ZONES: Record<FleetZone, [number, number]> = { picking: [0, 255], hubs: [255, 560], road: [560, 780], unload: [780, 1010], workshop: [1010, 1200] };
export const SCENE_WIDTH = W;

/**
 * What is going on, so the art only shows activity the data has. Left out (loading, or a failed query) the
 * whole scene plays, without the late tag. Counts above the drawn number (3 trucks out, 2 back) still draw that many.
 */
export type FleetSceneLive = {
  /** Fields picking: a pumpkin hops into the crate. */
  picking: boolean;
  /** A van at a hub (loading or idle): the truck parked by the barn. */
  parked: boolean;
  /** A van loading: a crate slides from the barn to the parked truck. */
  loading: boolean;
  /** Vans delivering (loaded, driving right) and returning (empty, driving left). */
  delivering: number;
  returning: number;
  /** A van unloading: the truck at the market. */
  unloading: boolean;
  /** A van late unloading: the bouncing "late" tag over the market truck. */
  lateUnloading: boolean;
  /** A van in the workshop: the truck on the lift. */
  workshop: boolean;
};

/* ── Pieces of the art ───────────────────────────────────── */

/** A pumpkin: body, crease, stem. */
const pumpkin = (x: number, y: number, rx = 7.5, ry = 6.5) => <g key={`${x},${y}`}>
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#ea7a2c" stroke="#3a2230" strokeWidth="1.4"/>
  <path d={`M${x} ${y - ry} v${2 * ry}`} stroke="#c9601f" strokeWidth="1.2"/>
  <path d={`M${x} ${y - ry} q1 -4 4 -5`} stroke="#6c7a36" strokeWidth="2" strokeLinecap="round" fill="none"/>
</g>;
/** A row of pumpkins at y, from x every `step`. */
const pumpkins = (y: number, xs: number[], rx?: number, ry?: number) => xs.map(x => pumpkin(x, y, rx, ry));
const range = (from: number, count: number, step: number) => Array.from({ length: count }, (_, i) => from + i * step);
/** A slatted wooden crate. */
const crate = (x: number, y: number, w: number, h: number) => <g>
  <rect x={x} y={y} width={w} height={h} rx="3" fill="#c98a4e" stroke="#3a2230" strokeWidth="1.6"/>
  <path d={`M${x} ${y + h / 2} h${w}`} stroke="#9a5a2e" strokeWidth="1.6"/>
  <path d={`M${x + 5} ${y} v${h} M${x + w - 5} ${y} v${h}`} stroke="#9a5a2e" strokeWidth="2"/>
</g>;
/** A poplar on its trunk, its foot at x, y. */
const tree = (x: number, y: number, s: number, fill: string) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M0 0 v-18" stroke="#6b4a33" strokeWidth="3" strokeLinecap="round"/>
  <path d="M0 -62 C 14 -44 18 -28 0 -14 C -18 -28 -14 -44 0 -62 Z" fill={fill} stroke="#3a2230" strokeWidth="1.6"/>
  <path d="M0 -50 v34" stroke="#4f5a25" strokeWidth="1.4"/>
</g>;

/**
 * The fleet's truck (not the smiling vans): a wooden bed, a plum cab, drawn facing right with its rear axle line at
 * 0,0 (x -2…89, y -45…3.5). Loaded: two rows of pumpkins on the bed; empty on the way back and on the lift.
 */
function truck(loaded: boolean) {
  return <>
    {loaded && <>
      {range(6, 5, 10.5).map(x => <ellipse key={`a${x}`} cx={x} cy="-33" rx="6" ry="5" fill="#e2681c"/>)}
      {range(11, 4, 10.5).map(x => <ellipse key={`b${x}`} cx={x} cy="-40" rx="5.6" ry="4.8" fill="#e2681c"/>)}
      {range(4, 5, 10.5).map(x => <ellipse key={`c${x}`} cx={x} cy="-34.5" rx="2" ry="2.4" fill="#f08a3c"/>)}
    </>}
    <rect x="0" y="-30" width="54" height="20" rx="2" fill="#8a4b2a"/>
    <path d="M0 -23 h54 M0 -16 h54" stroke="#6e3a20" strokeWidth="1.4"/>
    <path d="M54 -10 V-34 h18 l11 13 h4 v11 Z" fill="#4a2638"/>
    <path d="M60 -30 h10 l8 9 h-18 Z" fill="#f6e4cb"/>
    <rect x="85" y="-16" width="4" height="3" rx="1" fill="#f9c26b"/>
    <rect x="-2" y="-12" width="91" height="5" rx="2" fill="#2b1a24"/>
    <circle cx="14" cy="-4" r="7.5" fill="#2b1a24"/><circle cx="14" cy="-4" r="3" fill="#f6e4cb"/>
    <circle cx="72" cy="-4" r="7.5" fill="#2b1a24"/><circle cx="72" cy="-4" r="3" fill="#f6e4cb"/>
  </>;
}
/** The truck's box in its own drawing: loaded (pumpkins on top) and empty (the cab is the top). */
const TRUCK_BOX: Box = [-3, -46, 93, 50], EMPTY_BOX: Box = [-3, -36, 93, 40];
/** The same boxes for a truck drawn facing left (mirrored about its 0,0). */
const mirror = ([x, y, w, h]: Box): Box => [-(x + w), y, w, h];

/** A place in the scene: x, y (the part's own 0,0) and a scale. */
type At = [x: number, y: number, scale: number];
/** A part's box in its own drawing: x, y, width, height. */
type Box = [x: number, y: number, w: number, h: number];

/**
 * A moving part: its own <svg>, drawn about the part's own 0,0 within `box`, placed at `at` in % of the scene so it
 * lines up with the still art at any size. It turns about the part's 0,0. `flip` draws the part facing left.
 */
function Sprite({ className, at: [x, y, k], box: [bx, by, bw, bh], flip, children }: { className: string; at: At; box: Box; flip?: boolean; children: ReactNode }) {
  const transformOrigin = `${pct(-bx / bw)} ${pct(-by / bh)}`;
  const place: CSSProperties = { left: pct((x + bx * k) / W), top: pct((y + by * k) / H), width: pct(bw * k / W), height: pct(bh * k / H), transformOrigin };
  return <span className={`pd-fleet-sprite ${className}`} style={place}>
    <svg viewBox={`${bx} ${by} ${bw} ${bh}`} fill="none" aria-hidden="true" focusable="false">{flip ? <g transform="scale(-1 1)">{children}</g> : children}</svg>
  </span>;
}

/** The five place labels: the zone's name, its colour dot (the column's colour), a short name for a narrow scene; x, y of the label's top middle. */
const PLACES: { zone: FleetZone; name: string; short: string; x: number; y: number }[] = [
  { zone: "picking", name: "Pumpkin fields", short: "Fields", x: 120, y: 34 },
  { zone: "hubs", name: "Collection hub", short: "Hub", x: 382, y: 29 },
  { zone: "road", name: "In transit", short: "Transit", x: 640, y: 75 },
  // These two sit 10 left of the artboard's 882 and 1100: the workshop's keeps clear of the scene's edge, and the
  // delivery pill moves with it, so at the phone's 750px scene the two keep 11px apart (5px if only one moved).
  { zone: "unload", name: "Customer delivery", short: "Delivery", x: 872, y: 58 },
  { zone: "workshop", name: "Fleet workshop", short: "Workshop", x: 1090, y: 40 },
];

/** Three clouds, drifting together: each a long base and two puffs ([x, rx] of each puff). */
const CLOUDS = [
  { x: 250, y: 70, base: 46, left: [-16, 21], right: [14, 18] },
  { x: 690, y: 52, base: 58, left: [-20, 26], right: [17, 23] },
  { x: 900, y: 118, base: 40, left: [-14, 18], right: [12, 16] },
];

/* ── The scene ───────────────────────────────────────────── */

/** The scene, decorative. `live` says which moving parts the data has (FleetSceneLive); left out, every part plays. */
export function FleetScene({ live }: { live?: FleetSceneLive }) {
  const on = (part: "picking" | "parked" | "loading" | "unloading" | "workshop") => !live || live[part];
  const out = live ? Math.min(3, live.delivering) : 3, back = live ? Math.min(2, live.returning) : 2;
  // The trucks stay mounted and fade (fleet-scene.css): mounted on a count change, one would appear mid-road.
  const fade = (shown: boolean) => shown ? "pd-fleet-fade" : "pd-fleet-fade is-off";
  return <div className="pd-fleet-scene" aria-hidden="true">
    <div className="pd-fleet-scene-art">
      {/* The sky, behind everything: the ground colour and the sun's two discs. */}
      <svg className="pd-fleet-scene-layer" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
        <rect width={W} height={H} fill="#fbe5d3"/>
        <circle cx="1040" cy="92" r="56" fill="#fbdcbc"/>
        <circle cx="1040" cy="92" r="40" fill="#f8cf9f"/>
      </svg>
      {/* The sun's rays turn about its middle; the hills (next layer) hide their lower ends. */}
      <Sprite className="pd-fleet-rays" at={[1040, 92, 1]} box={[-80, -80, 160, 160]}>
        {range(0, 12, 30).map(deg => <rect key={deg} x="-2" y="-78" width="4" height="16" rx="2" fill="#f9d8b0" transform={`rotate(${deg})`}/>)}
      </Sprite>
      <Sprite className="pd-fleet-clouds" at={[0, 0, 1]} box={[200, 26, 752, 108]}>
        {CLOUDS.map(c => <g key={c.x} transform={`translate(${c.x} ${c.y})`} fill="#fdf1e6">
          <ellipse cx="0" cy="0" rx={c.base} ry="12"/>
          <ellipse cx={c.left[0]} cy="-8" rx={c.left[1]} ry="12"/>
          <ellipse cx={c.right[0]} cy="-10" rx={c.right[1]} ry="13"/>
        </g>)}
      </Sprite>
      <Sprite className="pd-fleet-birds" at={[0, 0, 1]} box={[466, 82, 68, 22]}>
        <path d="M470 96 q5 -5 10 0 q5 -5 10 0 M492 88 q5 -5 10 0 q5 -5 10 0 M510 100 q5 -5 10 0 q5 -5 10 0" stroke="#7a5263" strokeWidth="1.8" strokeLinecap="round"/>
      </Sprite>

      {/* The land: hills, the five places, the road. */}
      <svg className="pd-fleet-scene-layer" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" fill="none" focusable="false">
        <path d="M0 168 C 140 120 300 132 440 150 S 720 112 900 134 S 1110 112 1200 128 V 320 H0Z" fill="#efc5b4"/>
        <path d="M0 196 C 180 160 360 170 560 184 S 900 158 1200 176 V 320 H0Z" fill="#dfa79a"/>
        <path d="M0 214 C 260 196 520 206 760 202 S 1080 192 1200 200 V 320 H0Z" fill="#b4bd6f"/>
        <path d="M0 232 C 300 222 760 230 1200 224 V 320 H0Z" fill="#9aa457"/>

        {/* Pumpkin fields: two poplars, the fence, three rows, two full crates and the scarecrow. */}
        <g>
          {tree(40, 214, .7, "#7d8a3e")}{tree(62, 216, .55, "#5f6d2c")}
          <path d="M18 214 H240 M18 222 H240" stroke="#9a6a42" strokeWidth="2.4"/>
          {range(18, 6, 44).map(x => <rect key={x} x={x} y="206" width="5" height="26" fill="#b98557" stroke="#3a2230" strokeWidth="1"/>)}
          {pumpkins(226, range(30, 9, 22), 6.4, 5.6)}
          {pumpkins(235, range(41, 9, 22), 6.4, 5.6)}
          {pumpkins(244, range(30, 9, 22), 6.4, 5.6)}
          {pumpkins(183, [126, 141, 156])}{crate(118, 186, 46, 24)}
          {pumpkins(193, [174, 192])}{crate(166, 196, 34, 22)}
          <g transform="translate(206 204)">
            <path d="M0 0 v-46 M-16 -34 h32" stroke="#7a5a3a" strokeWidth="3" strokeLinecap="round"/>
            <path d="M-10 -34 h20 l-4 22 h-12 Z" fill="#c9733f" stroke="#3a2230" strokeWidth="1.4"/>
            <circle cx="0" cy="-48" r="8" fill="#f2d9a6" stroke="#3a2230" strokeWidth="1.4"/>
            <path d="M-12 -52 h24 l-6 -10 h-12 Z" fill="#6b4a33" stroke="#3a2230" strokeWidth="1.2"/>
          </g>
        </g>

        {/* Collection hub: the red barn with its pumpkin roundel, open doors, crates either side, the parked truck. */}
        <g>
          <path d="M286 138 L382 86 L478 138 Z" fill="#4a2638" stroke="#3a2230" strokeWidth="2" strokeLinejoin="round"/>
          <rect x="300" y="136" width="164" height="96" fill="#bf5b34" stroke="#3a2230" strokeWidth="2"/>
          <path d={range(308, 12, 13).map(x => `M${x} 140 v88`).join(" ")} stroke="#a84c29" strokeWidth="1.4"/>
          <circle cx="382" cy="116" r="12" fill="#fbf3e6" stroke="#3a2230" strokeWidth="1.8"/>
          {pumpkin(382, 117, 6.9, 6)}
          <rect x="354" y="168" width="56" height="64" fill="#3d2530" stroke="#3a2230" strokeWidth="2"/>
          {pumpkins(203, [368, 382, 396])}{crate(360, 206, 44, 24)}
          {[330, 410].map(x => <g key={x}>
            <path d={`M${x} 168 h24 v64 h-24 Z`} fill="#fbf3e6" stroke="#3a2230" strokeWidth="1.6"/>
            <path d={`M${x} 168 L${x + 24} 232 M${x + 24} 168 L${x} 232`} stroke="#bf5b34" strokeWidth="2"/>
          </g>)}
          {pumpkins(203, [480, 492, 504])}{crate(472, 206, 40, 24)}
          {pumpkins(177, [484, 502])}{crate(476, 180, 34, 22)}
          <g className={fade(on("parked"))} transform="translate(208 246) scale(.72)">{truck(true)}</g>
          {tree(500, 226, .8, "#7d8a3e")}{tree(520, 228, .6, "#5f6d2c")}
        </g>

        {/* In transit: two poplars by the road. */}
        {tree(612, 222, .7, "#5f6d2c")}{tree(726, 220, .85, "#7d8a3e")}

        {/* Customer delivery: the market stall, its striped awning and sign, three full crates, the truck facing it. */}
        <g>
          <rect x="800" y="164" width="164" height="68" fill="#e9c9a3" stroke="#3a2230" strokeWidth="2"/>
          <path d="M788 152 L882 120 L976 152 Z" fill="#4a2638" stroke="#3a2230" strokeWidth="2" strokeLinejoin="round"/>
          {range(794, 8, 22).map((x, i) => <path key={x} d={`M${x} 150 h22 v16 a11 11 0 0 1 -22 0 Z`} fill={i % 2 ? "#fbf3e6" : "#ea7a2c"} stroke="#3a2230" strokeWidth="1.4"/>)}
          <rect x="846" y="128" width="72" height="14" rx="3" fill="#fbf3e6" stroke="#3a2230" strokeWidth="1.4"/>
          <text x="882" y="138.5" textAnchor="middle" fontFamily="Hanken Grotesk, system-ui, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.4" fill="#4a2638">MARKET</text>
          {[810, 860, 910].map(x => <g key={x}>{pumpkins(197, [x + 8, x + 22, x + 36])}{crate(x, 200, 44, 26)}</g>)}
          <g className={fade(on("unloading"))} transform="translate(1030 248) scale(-.72 .72)">{truck(true)}</g>
        </g>

        {/* Fleet workshop: the chimney (its smoke is a sprite), the garage and its roller door, the lift's post. */}
        <g>
          <rect x="1142" y="104" width="14" height="40" fill="#8c6d73" stroke="#3a2230" strokeWidth="1.6"/>
          <path d="M1016 150 L1100 112 L1184 150 Z" fill="#5b3445" stroke="#3a2230" strokeWidth="2" strokeLinejoin="round"/>
          <rect x="1030" y="148" width="140" height="84" fill="#c7aeb0" stroke="#3a2230" strokeWidth="2"/>
          <rect x="1052" y="168" width="96" height="64" fill="#3d2530" stroke="#3a2230" strokeWidth="2"/>
          <path d="M1052 172 h96 M1052 178 h96 M1052 184 h96" stroke="#55404a" strokeWidth="2"/>
          <rect x="1098" y="219" width="5" height="13" fill="#a8949a"/>
          {tree(1186, 228, .6, "#5f6d2c")}
        </g>

        {/* The road (A1's colours): cream, two edges, a dashed middle line; the grass verge in front. */}
        <rect x="0" y="252" width={W} height="40" fill="#f3e2c8"/>
        <rect x="0" y="250" width={W} height="3" fill="#e8cfae"/>
        <rect x="0" y="291" width={W} height="3" fill="#e8cfae"/>
        <path d="M0 272 H1200" stroke="#e1c39c" strokeWidth="2" strokeDasharray="12 10"/>
        <path d="M0 294 C 300 300 800 290 1200 298 V 320 H0Z" fill="#7f8a3f"/>
      </svg>

      {/* The land's moving parts. None of them passes behind anything in the land layer. */}
      {on("picking") && <Sprite className="pd-fleet-hop" at={[150, 222, 1]} box={[-8, -13, 17, 20]}>{pumpkin(0, 0, 6.4, 5.6)}</Sprite>}
      {on("loading") && <Sprite className="pd-fleet-load" at={[330, 214, 1]} box={[-16, -27, 26, 31]}>
        <rect x="-14" y="-12" width="22" height="14" rx="2" fill="#c98a4e" stroke="#3a2230" strokeWidth="1.4"/>
        {pumpkin(-3, -15, 5.8, 5)}
      </Sprite>}
      <Sprite className={live && !live.workshop ? "pd-fleet-lift is-idle" : "pd-fleet-lift"} at={[0, 0, 1]} box={[1062, 188, 84, 33]}>
        <rect x="1064" y="214" width="72" height="5" rx="2" fill="#a8949a"/>
        <g className={fade(on("workshop"))} transform="translate(1066 214) scale(.688)">{truck(false)}</g>
      </Sprite>
      <Sprite className="pd-fleet-smoke" at={[0, 0, 1]} box={[1140, 74, 28, 30]}>
        <circle cx="1149" cy="96" r="6" fill="#efe2db"/><circle cx="1156" cy="84" r="8" fill="#f3e8e2"/>
      </Sprite>
      <Sprite className="pd-fleet-sign" at={[1100, 128, 1]} box={[-13, -5, 26, 26]}>
        <circle cx="0" cy="8" r="11" fill="#fbf3e6" stroke="#3a2230" strokeWidth="1.6"/>
        <path d="M-5 13 l8 -8 m-1.5 -3.5 a3.4 3.4 0 1 0 4.6 4.6" stroke="#4a2638" strokeWidth="2.2" strokeLinecap="round"/>
      </Sprite>
      {range(1, 3, 1).map(n => <Sprite key={`out${n}`} className={`pd-fleet-drive is-out is-${n} ${fade(n <= out)}`} at={[0, 268, .656]} box={TRUCK_BOX}>{truck(true)}</Sprite>)}
      {range(1, 2, 1).map(n => <Sprite key={`back${n}`} className={`pd-fleet-drive is-back is-${n} ${fade(n <= back)}`} at={[0, 290, .624]} box={mirror(EMPTY_BOX)} flip>{truck(false)}</Sprite>)}
    </div>

    {/* Over the art, undimmed in dark: the late tag over the market truck, and the place labels. */}
    {/* Only from data: a late tag is never decoration, so it waits for the hubs (unlike the moving parts). */}
    {live?.unloading && live.lateUnloading && <span className="pd-fleet-scene-late" style={{ left: pct(996 / W), top: pct(212 / H) }}>late</span>}
    {PLACES.map(p => <span key={p.zone} className={`pd-fleet-scene-place is-${p.zone}`} style={{ left: pct(p.x / W), top: pct(p.y / H) }}>
      <i/><span className="pd-fleet-scene-full">{p.name}</span><span className="pd-fleet-scene-short">{p.short}</span>
    </span>)}
    {/* Where a phone's sideways scroll comes to rest: each zone in the middle of the box. */}
    {Object.entries(ZONES).map(([zone, [a, b]]) => <span key={zone} className="pd-fleet-scene-snap" style={{ left: pct(a / W), width: pct((b - a) / W) }}/>)}
  </div>;
}
