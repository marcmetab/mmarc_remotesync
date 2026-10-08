import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import "./harvest.css";
import { type Camera, reducedMotion } from "../../motion";
import { svgElement } from "../../pages/world/markup";
import { Icon } from "../ui";
import { DEFS, FAR, FIREFLIES, GROUND, MID, SKY, STALL, TRUCK } from "./harvestArt";

/*
 * The Business and Stores banner: one living world (harvestArt.ts) seen through two cameras.
 *   biz     the van rolls along the hill road: wheels turn, dust puffs, the road's dashes run, birds cross, the
 *           clouds drift, the trees sway, and at dusk (dark theme) fireflies come out.
 *   stores  the market stall: the awning breathes, the sign swings, the lights twinkle, a pumpkin hops now and then,
 *           and the van idles beside it.
 * Going from one to the other (`at` changes) the camera pans across, each depth at its own speed, and the van drives
 * off the hill road to park by the stall (the crates fill and the sign rings when it gets there); going back it
 * turns round, drives left, and turns to face the road again. Pages share one mounted scene (Shell keeps it), so the
 * pan runs while the page under it changes.
 * `sale`: the store page opened from a Live sales row (motion.ts): the camera is already at the stall (no pan), the van
 * drives in from the left and parks, then the sale plays out at the stall: one pumpkin hops for each one sold (up to
 * four) and the amount rises over it. `onBack` adds the "Live sales" button.
 * `landing`: Business opening on the way down from World: the field rises into view as the night lifts.
 * With reduced motion it stays still and nothing plays on its own: the camera jumps, the sale shows as it ends. Off
 * screen, it rests. Styles: harvest.css.
 */

export type SceneSale = { key: string; qty: number; amount: string };

/** The van's drive from the hill road to the stall, or back (ms; harvest.css). */
const DRIVE_MS = 1800;

type Cam = { at: Camera; still: boolean; dir: "out" | "back" | null; arrived: boolean };
/** A piece of the art: parsed elements all carry the key 0, so each sits in its own keyed fragment. */
const art = (name: string, markup: string) => <Fragment key={name}>{svgElement(markup)}</Fragment>;

export function HarvestScene({ at, sale, landing, chip, onBack }: { at: Camera; sale?: SceneSale | null; landing?: boolean; chip?: ReactNode; onBack?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  // With reduced motion it plays nothing on its own: the loops rest, the camera jumps, the sale is already done.
  const live = !reducedMotion();
  const [cam, setCam] = useState<Cam>({ at, still: true, dir: null, arrived: false });
  // A new camera (state adjusted while rendering, so the pan starts in the same frame as the new page's banner).
  if (cam.at !== at) {
    const jump = !!sale || !live;
    setCam({ at, still: jump, dir: jump ? null : at === "stores" ? "out" : "back", arrived: false });
  }
  // A jump lands without its transition; the next change pans again.
  useEffect(() => {
    if (!cam.still) return;
    const id = setTimeout(() => setCam(c => c.still ? { ...c, still: false } : c), 60);
    return () => clearTimeout(id);
  }, [cam.still]);
  // The van parks (or is back on the road): the crates fill, the sign rings.
  useEffect(() => {
    if (!cam.dir) return;
    const id = setTimeout(() => setCam(c => ({ ...c, dir: null, arrived: c.at === "stores" })), DRIVE_MS);
    return () => clearTimeout(id);
  }, [cam.dir, cam.at]);

  // Scrolled out of view, it rests (it is a lot of little animations).
  const [away, setAway] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const watch = new IntersectionObserver(([entry]) => setAway(!entry.isIntersecting));
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const playing = sale && live ? sale : null;
  const cls = ["pd-banner", "is-scene", `is-${at === "biz" ? "business" : "stores"}`, `at-${cam.at}`,
    cam.dir && "is-moving", cam.dir === "back" && "is-back", cam.arrived && live && "is-arrived", cam.still && "is-still",
    playing && `is-sale is-q${Math.max(1, Math.min(4, playing.qty))}`, landing && live && "is-landing", !live && "is-still-life", away && "is-away"];
  return <section ref={ref} className={cls.filter(Boolean).join(" ")}>
    <svg className="pd-scene" viewBox="0 218 1200 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      {art("defs", DEFS)}
      {art("sky", SKY)}
      {art("far", FAR)}
      {art("mid", MID)}
      <g className="sc-near">
        {art("ground", GROUND)}
        {art("stall", STALL)}
        {art("truck", TRUCK)}
        {art("fireflies", FIREFLIES)}
        {/* What the sale brought in, rising over the stall (in the stall's own coordinates, like STALL). */}
        <g transform="translate(1080 162)"><g className="sc-tag">
          <rect x="904" y="73" width="80" height="22" rx="11" fill="#3b1f2e"/>
          <text x="944" y="88.5" textAnchor="middle" fill="#fdeee2" className="sc-tag-text">+{sale?.amount ?? ""}</text>
        </g></g>
      </g>
    </svg>
    {landing && live && <div className="pd-scene-night" aria-hidden="true"/>}
    {chip && <div className="pd-banner-top"><span className="pd-banner-chip">{chip}</span></div>}
    {onBack && <button type="button" className="pd-scene-back pd-glass" onClick={onBack}><Icon name="chevronLeft" size={18} strokeWidth={2.2}/>Live sales</button>}
  </section>;
}
