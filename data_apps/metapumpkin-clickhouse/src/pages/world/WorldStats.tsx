import { memo, useEffect, useState } from "react";
import { int } from "../../format";
import { STAT_ICON } from "./art";
import { svgElement } from "./markup";
import { cx, STATS } from "./model";
import type { WorldStat } from "./types";

/**
 * The counters over the map, within the scope: six for the vans (a stopped van is on the road), two for the stores.
 * Each is a toggle: picked, only those vans or stores stay bright on the map. A dash while its part loads.
 * `compact`: the same counters, small, in a bar floating over the map in its full view (WorldMap); `data-ui` keeps the
 * map from reading a drag or a click through them. `countFrom`: the World page lifting off (world/Liftoff.tsx): from that
 * client time each count rises from nothing to its value.
 */

/** How long a count takes to rise to its value (ms). */
const COUNT_MS = 900;
/** A count rising from 0 to `value` from the time `from` (Date.now()), eased; the value itself once it has risen. */
function Counting({ value, from }: { value: number | null; from: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t < from + COUNT_MS) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [from]);
  if (value == null) return <>{int(value)}</>;
  const p = Math.min(1, Math.max(0, (now - from) / COUNT_MS));
  return <>{int(Math.round(value * (1 - Math.pow(1 - p, 3))))}</>;
}
export const WorldStats = memo(function WorldStats({ counts, focus, onFocus, compact, countFrom }: { counts: Record<WorldStat, number | null>; focus: WorldStat | null; onFocus: (focus: WorldStat | null) => void; compact?: boolean; countFrom?: number | null }) {
  return <div className={cx("pd-world-stats", compact && "pd-world-float pd-world-statbar")} role="group" aria-label="Vans and stores right now" data-ui={compact || undefined}>
    {STATS.map(({ stat, label }) => {
      const [tint, icon] = STAT_ICON[stat], on = focus === stat;
      return <button type="button" key={stat} className="pd-world-stat" aria-pressed={on} onClick={() => onFocus(on ? null : stat)}>
        <span className="pd-world-stat-icon" style={{ background: tint }}>{svgElement(icon)}</span>
        <span className="pd-world-stat-text"><span className="pd-world-stat-label">{label}</span><span className="pd-world-stat-value">{countFrom != null ? <Counting value={counts[stat]} from={countFrom}/> : int(counts[stat])}</span></span>
      </button>;
    })}
  </div>;
});
