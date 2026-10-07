import { memo } from "react";
import { int } from "../../format";
import { STAT_ICON } from "./art";
import { svgElement } from "./markup";
import { cx, STATS } from "./model";
import type { WorldStat } from "./types";

/**
 * The counters over the map, within the scope: six for the vans (a stopped van is on the road), two for the stores.
 * Each is a toggle: picked, only those vans or stores stay bright on the map. A dash while its part loads.
 * `compact`: the same counters, small, in a bar floating over the map in its full view (WorldMap); `data-ui` keeps the
 * map from reading a drag or a click through them.
 */
export const WorldStats = memo(function WorldStats({ counts, focus, onFocus, compact }: { counts: Record<WorldStat, number | null>; focus: WorldStat | null; onFocus: (focus: WorldStat | null) => void; compact?: boolean }) {
  return <div className={cx("pd-world-stats", compact && "pd-world-float pd-world-statbar")} role="group" aria-label="Vans and stores right now" data-ui={compact || undefined}>
    {STATS.map(({ stat, label }) => {
      const [tint, icon] = STAT_ICON[stat], on = focus === stat;
      return <button type="button" key={stat} className="pd-world-stat" aria-pressed={on} onClick={() => onFocus(on ? null : stat)}>
        <span className="pd-world-stat-icon" style={{ background: tint }}>{svgElement(icon)}</span>
        <span className="pd-world-stat-text"><span className="pd-world-stat-label">{label}</span><span className="pd-world-stat-value">{int(counts[stat])}</span></span>
      </button>;
    })}
  </div>;
});
