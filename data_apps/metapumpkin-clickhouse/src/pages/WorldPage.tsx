import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./world/art.css";
import "./world.css";
import { Panel, PanelState } from "../components/ui";
import { usePageMotion } from "../motion";
import { bannerOf, matchRoute } from "../routes";
import type { PageProps } from "../types";
import { countWorld } from "./world/model";
import type { WorldStat, WorldState, WorldViewModel } from "./world/types";
import { Balloon, Liftoff } from "./world/Liftoff";
import { WorldMap } from "./world/WorldMap";
import { WorldStats } from "./world/WorldStats";

export type { WorldViewModel };

/*
 * World (/world): the whole business on one illustrated, live map. Over it, eight counters for the scope (vans by
 * what they are doing, stores low and out); each one picked keeps only those vans or stores bright. The map
 * (world/WorldMap.tsx) shows every hub, city, store, field, workshop and van, and dims what lies outside the
 * shell's region; hovering a sprite shows its card, clicking pins it. The Shell skips the banner here: the map is
 * the page's picture. Opened from another page it lifts off (world/Liftoff.tsx): it rises out of that page's banner and
 * the map assembles under the clouds; leaving for a page with a banner it comes down into it again. Presentational: the view model comes
 * in through props (src/data/useWorldData.ts live, fixtures/world.ts in the static preview). Styles: world.css
 * (layout) over world/art.css (the art), world/liftoff.css (the way up and down).
 */

/** A layout effect in the browser; on the server (the static preview) nothing runs, without React's warning. */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;
/** The lift-off, from the moment the page shows: the sky over the map until SKY_MS, the map's own entrance until
 *  SETTLED_MS (liftoff.css), and the counters rising from COUNT_AT_MS. */
const SKY_MS = 2700, SETTLED_MS = 4300, COUNT_AT_MS = 2250;
export function WorldPage({ vm, scope, onScope, clock, initial, refreshing, onRetry }: PageProps<WorldViewModel, WorldState> & { onRetry?: () => void }) {
  const [layersOpen, setLayersOpen] = useState(initial?.layersOpen ?? false);
  const [focus, setFocus] = useState<WorldStat | null>(initial?.focus ?? null);
  const [pinned, setPinned] = useState<string | null>(initial?.pinned ?? null);
  // A new region closes the pinned card: the map flies away from it.
  const scopeKey = `${scope.region}|${scope.country ?? ""}`;
  const [seenScope, setSeenScope] = useState(scopeKey);
  if (seenScope !== scopeKey) {
    setSeenScope(scopeKey);
    setPinned(null);
  }
  const counts = useMemo(() => countWorld(vm.vans, vm.stores, scope), [vm.vans, vm.stores, scope]);

  // Opened from another page, it lifts off once it shows (it mounts unseen while that page plays its way out), out of
  // that page's banner; leaving for a page with a banner, it lands. The balloon stays in the corner while it is open.
  const { motion, role, from } = usePageMotion();
  const lifted = useRef(motion === "liftoff").current;
  const origin = useRef(lifted && from ? bannerOf(matchRoute(from)) : null).current;
  const [lift, setLift] = useState<"sky" | "map" | "done">(lifted ? "sky" : "done");
  const [countFrom, setCountFrom] = useState<number | null>(null);
  const shown = role === "shown";
  useEffect(() => {
    if (!lifted || !shown) return;
    setCountFrom(Date.now() + COUNT_AT_MS);
    const sky = setTimeout(() => setLift("map"), SKY_MS);
    const done = setTimeout(() => { setLift("done"); setCountFrom(null); }, SETTLED_MS);
    return () => { clearTimeout(sky); clearTimeout(done); };
  }, [lifted, shown]);
  const landing = motion === "land" && role === "leaving";
  // Where the frame ends (the map's frame) and how wide the page is: measured once the page is laid out.
  const ref = useRef<HTMLDivElement>(null);
  useBrowserLayoutEffect(() => {
    const el = ref.current, stage = el?.querySelector<HTMLElement>(".pd-world-stage");
    if (!el || !stage || (lift === "done" && !landing && !lifted)) return;
    el.style.setProperty("--lift-top", `${stage.offsetTop}px`);
    el.style.setProperty("--lift-h", `${stage.offsetHeight}px`);
    el.style.setProperty("--lift-w", `${el.offsetWidth}px`);
  }, [lift, landing, role]);

  return <div ref={ref} className={`pd-world${lift !== "done" ? " is-liftoff" : ""}${landing ? " is-landing" : ""}`}>
    <h1 className="pd-sr">World</h1>
    {lift === "sky" && <Liftoff way="up" from={origin}/>}
    {landing && <Liftoff way="down"/>}
    {lifted && <Balloon/>}
    <WorldStats counts={counts} focus={focus} onFocus={setFocus} countFrom={countFrom}/>
    {vm.errors?.map
      ? <Panel label="World map"><PanelState state="error" message={vm.errors.map} onRetry={onRetry} minHeight={320}/></Panel>
      : <WorldMap vm={vm} scope={scope} onScope={onScope} clock={clock} layersOpen={layersOpen} onLayersOpen={setLayersOpen}
        focus={focus} pinned={pinned} onPin={setPinned} busy={refreshing} stats={<WorldStats counts={counts} focus={focus} onFocus={setFocus} compact/>}/>}
  </div>;
}
