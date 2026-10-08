import { clockLabel, timeTz } from "../format";
import { Link } from "../nav";
import { routes } from "../routes";
import type { ThemeName } from "../theme";
import { type Clock, type Scope, scopeLabel } from "../types";
import { useViewerZone } from "../viewer";
import { HalloweenCard } from "./HalloweenCard";
import { Sheet } from "./Sheet";
import { Icon, type Option, Segmented } from "./ui";

const THEMES: Option<ThemeName>[] = [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }];

/**
 * The avatar's sheet (under 900px, where there is no sidebar): who you are and the region you are looking at,
 * the Halloween countdown, the clock and light or dark. It holds what the wide top bar shows as the clock pill
 * and the moon: live, the clock is the phone's own time, which its status bar already shows; simulated (a demo),
 * the time and date matter, and the avatar's dot turns pumpkin. Last, the way to Data flow, which has no tab on a
 * phone (the sidebar lists it from 900px up). Styles: sheet.css.
 */
export function MeSheet({ scope, clock, theme, onTheme, onClose }: {
  scope: Scope; clock?: Clock; theme: ThemeName; onTheme?: (theme: ThemeName) => void; onClose: () => void;
}) {
  const tz = useViewerZone();
  const shifted = clock?.mode === "shifted";
  return <Sheet title="You" onClose={onClose} head={<div className="pd-me-who">
    <span className="pd-avatar" aria-hidden="true">RM</span>
    <span><b>Regional manager</b><small>{scopeLabel(scope)}</small></span>
  </div>}>
    <HalloweenCard clock={clock}/>
    <div className="pd-sheet-group">
      <div className="pd-sheet-row">
        <span className="pd-sheet-tile" aria-hidden="true"><i className={`pd-me-live${shifted ? " is-shifted" : ""}`}/></span>
        <span className="pd-sheet-text"><b>{shifted ? "Simulated clock" : "Live"}</b><span>{shifted ? "Not the real time" : "Same as your phone"}</span></span>
        <span className="pd-me-time">{clock ? shifted ? clockLabel(clock.now, tz) : timeTz(clock.now, tz) : clockLabel(undefined)}</span>
      </div>
      <div className="pd-sheet-row">
        <span className="pd-sheet-tile" aria-hidden="true"><Icon name={theme === "dark" ? "moon" : "sun"} size={18} strokeWidth={1.8}/></span>
        <span className="pd-sheet-text"><b>Appearance</b></span>
        <Segmented label="Appearance" options={THEMES} value={theme} onChange={next => onTheme?.(next)}/>
      </div>
    </div>
    <div className="pd-sheet-group">
      <Link to={routes.dataFlow()} className="pd-sheet-row is-link" onClick={onClose}>
        <span className="pd-sheet-tile" aria-hidden="true"><Icon name="route" size={18} strokeWidth={1.8}/></span>
        <span className="pd-sheet-text"><b>Data flow</b><span>From Postgres to this app</span></span>
        <Icon name="chevronRight" size={16} strokeWidth={2}/>
      </Link>
    </div>
  </Sheet>;
}
