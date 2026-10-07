import { useMemo, useState } from "react";
import "./world/art.css";
import "./world.css";
import { Panel, PanelState } from "../components/ui";
import type { PageProps } from "../types";
import { countWorld } from "./world/model";
import type { WorldStat, WorldState, WorldViewModel } from "./world/types";
import { WorldMap } from "./world/WorldMap";
import { WorldStats } from "./world/WorldStats";

export type { WorldViewModel };

/*
 * World (/world): the whole business on one illustrated, live map. Over it, eight counters for the scope (vans by
 * what they are doing, stores low and out); each one picked keeps only those vans or stores bright. The map
 * (world/WorldMap.tsx) shows every hub, city, store, field, workshop and van, and dims what lies outside the
 * shell's region; hovering a sprite shows its card, clicking pins it. The Shell skips the banner here: the map is
 * the page's picture. Presentational: the view model comes in through props (src/data/useWorldData.ts live,
 * fixtures/world.ts in the static preview). Styles: world.css (layout) over world/art.css (the art).
 */
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

  return <div className="pd-world">
    <h1 className="pd-sr">World</h1>
    <WorldStats counts={counts} focus={focus} onFocus={setFocus}/>
    {vm.errors?.map
      ? <Panel label="World map"><PanelState state="error" message={vm.errors.map} onRetry={onRetry} minHeight={320}/></Panel>
      : <WorldMap vm={vm} scope={scope} onScope={onScope} clock={clock} layersOpen={layersOpen} onLayersOpen={setLayersOpen}
        focus={focus} pinned={pinned} onPin={setPinned} busy={refreshing} stats={<WorldStats counts={counts} focus={focus} onFocus={setFocus} compact/>}/>}
  </div>;
}
