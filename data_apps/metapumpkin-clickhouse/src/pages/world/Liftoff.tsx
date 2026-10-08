import "./liftoff.css";
import { Banner, type BannerVariant } from "../../components/Banner";

/*
 * The way between Business and World (motion.ts), drawn over the World page (WorldPage.tsx), aria-hidden.
 *   up    World opening from another page. A frame starts where that page's banner was, showing the same banner
 *         (`from`; from a page with none, the frame grows from the top of the page), and grows into the map's frame. A
 *         pumpkin balloon rises out of the field and the camera follows it up: the field drops away, the sky turns to night and the stars come out, the clouds close in, then part, and under them the map
 *         assembles (liftoff.css: it zooms up from far below, the land surfaces, hubs, towns and stores pop in, the
 *         roads draw out, the region names slide together, the counters drop in and count up, the controls slide in
 *         from the edges, the vans start driving). The balloon floats on in the map's corner (`Balloon`).
 *   down  World closing for a page with a banner: the map falls away under the night, the clouds pass, and the frame
 *         shrinks to the banner's place, where that page's banner takes over (it lands: its art rises as the night lifts).
 * Where the frame starts and ends comes from WorldPage, measured (--lift-top, --lift-h, --lift-w on .pd-world).
 */

const STARS: [number, number, number][] = [[12, 14, .8], [28, 32, .95], [44, 10, .85], [61, 26, 1], [77, 12, .9], [88, 38, 1.05], [36, 48, 1.1], [70, 52, 1.15]];
/** Each cloud bank: puffs as [left or right %, top %, width %, height %]. */
const LEFT: [number, number, number, number][] = [[10, 8, 46, 42], [34, 0, 52, 50], [0, 30, 60, 52], [40, 34, 62, 56], [12, 60, 58, 42], [50, 66, 54, 38]];
const RIGHT: [number, number, number, number][] = [[10, 6, 48, 44], [36, 2, 50, 48], [0, 32, 62, 50], [42, 30, 60, 58], [14, 62, 56, 40], [48, 64, 56, 40]];

/** The pumpkin balloon: the envelope's lobes, its stem, the ropes, a burner's flame and the basket. */
export function BalloonArt() {
  return <svg width="80" height="110" viewBox="-40 -50 80 110" aria-hidden="true" focusable="false">
    <ellipse cx="-14" cy="-10" rx="16" ry="30" fill="#d9601c"/><ellipse cx="14" cy="-10" rx="16" ry="30" fill="#d9601c"/><ellipse cx="0" cy="-10" rx="15" ry="32" fill="#f08a3c"/>
    <ellipse cx="-7" cy="-26" rx="4" ry="9" fill="#ffd2a8" opacity=".5"/>
    <rect x="-2.5" y="-46" width="5" height="7" rx="2" fill="#6c7a36"/>
    <path d="M-17 15L-9 38M17 15L9 38M0 22V38" fill="none" stroke="#4a2638" strokeWidth="1.4"/>
    <ellipse className="pd-lift-flame" cx="0" cy="31" rx="3" ry="5" fill="#ffd27a"/>
    <rect x="-11" y="37" width="22" height="3" rx="1.5" fill="#5b2a20"/>
    <rect x="-10" y="39" width="20" height="12" rx="2.5" fill="#7a3a2a"/>
  </svg>;
}

/** The balloon at rest in the map's corner once the lift-off is over, bobbing. */
export function Balloon() {
  return <div className="pd-lift-corner" aria-hidden="true"><div className="pd-lift-bob"><BalloonArt/></div></div>;
}

export function Liftoff({ way, from }: { way: "up" | "down"; from?: BannerVariant | null }) {
  const bank = (puffs: typeof LEFT, side: "left" | "right") => puffs.map(([x, y, w, h], i) =>
    <span key={i} className="pd-lift-puff" style={{ [side]: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}/>);
  return <div className={`pd-lift is-${way}${way === "up" && !from ? " is-bare" : ""}`} aria-hidden="true">
    <div className="pd-lift-frame">
      <div className="pd-lift-day"/>
      <div className="pd-lift-night">
        {STARS.map(([x, y, d], i) => <span key={i} className="pd-lift-star" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}/>)}
      </div>
      {way === "up" && from && <div className="pd-lift-field"><Banner variant={from}/></div>}
      <div className="pd-lift-clouds is-left">{bank(LEFT, "left")}</div>
      <div className="pd-lift-clouds is-right">{bank(RIGHT, "right")}</div>
      <div className="pd-lift-wisp"/>
      <div className="pd-lift-wisp is-late"/>
      {way === "up" && <div className="pd-lift-balloon"><div className="pd-lift-bob"><BalloonArt/></div></div>}
    </div>
  </div>;
}
