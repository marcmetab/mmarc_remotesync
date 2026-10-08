import { type ReactNode, useRef, useState } from "react";
import "../fonts.css";
import "../styles/tokens.css";
import "../styles/base.css";
import { clockLabel, dayLabel, timeTz } from "../format";
import { Link, useNav } from "../nav";
import { routes, TABS, type TabId } from "../routes";
import { ThemeContext, type ThemeName } from "../theme";
import { type Clock, countryName, DRILL_PERIOD, DRILL_PERIODS, type Scope, scopeLabel, TRUCK_PERIOD, TRUCK_PERIODS, type TruckPeriod } from "../types";
import { useViewerZone } from "../viewer";
import { singleCountry, useVisible } from "../visible";
import logo from "../assets/metapumpkin.svg";
import { Banner } from "./Banner";
import { HalloweenCard, halloweenChip, untilHalloween } from "./HalloweenCard";
import { MeSheet } from "./MeSheet";
import "./period.css";
import { RegionPicker } from "./RegionPicker";
import { RegionSheet } from "./RegionSheet";
import { AccessoryProvider, type BarAccessory, TAB_ICON, TabBar, useBarScroll } from "./TabBar";
import { Icon, Segmented } from "./ui";

const LATE_NOTE = "Some vans are running late";
const PERIOD_OPTIONS = DRILL_PERIODS.map(value => ({ value: value as TruckPeriod, label: DRILL_PERIOD[value].label }));
/** The van page's switch: the same four, then Season. */
const TRUCK_OPTIONS = TRUCK_PERIODS.map(value => ({ value, label: TRUCK_PERIOD[value].label }));

export type ShellProps = {
  /** The selected tab. Drill-down pages keep their parent tab (`tabOf(route.page)`). */
  active: TabId;
  scope: Scope;
  onScope: (scope: Scope) => void;
  /**
   * The time switch on the City, Store and van pages, where it takes the region control's place (default "today").
   * Only the van page offers "season"; App.tsx hands each page the value its switch shows.
   */
  period?: TruckPeriod;
  /** Picks a period. Without it the switch is still drawn (the static preview) but does nothing. */
  onPeriod?: (period: TruckPeriod) => void;
  /** sim_status. Undefined while it loads: the clock pill shows a dash. */
  clock?: Clock;
  /** Vans running late right now (hub_now.vans_late, summed). Above zero, Harvest & fleet shows the orange dot. */
  lateVans?: number;
  /** Light or dark (data-theme on the root). The app root holds it: the system preference, until the switch is pressed. */
  theme?: ThemeName;
  /** The top bar's dark mode switch. Without it the switch is still drawn (the static preview) but does nothing. */
  onTheme?: (theme: ThemeName) => void;
  /** The page. Each top-level element becomes one row of the content column (24px apart). */
  children: ReactNode;
};

/**
 * "Halloween in 3 days": the one chip a banner carries, on Business only, counted on the viewer's clock like the
 * sidebar's countdown card. Only shown under 900px (halloween.css), where there is no sidebar to hold the card.
 */
function seasonChip(active: TabId, tz: string, clock?: Clock) {
  if (active !== "business" || !clock) return undefined;
  return halloweenChip(untilHalloween(Date.parse(clock.now), tz));
}

/** The compact tab bar's line when the page gives none: the clock, live or simulated. */
function clockAccessory(clock: Clock | undefined, tz: string): BarAccessory {
  const shifted = clock?.mode === "shifted";
  return { label: shifted ? "Simulated clock" : "Live", detail: clockLabel(clock?.now, tz), tone: shifted ? "shifted" : "live" };
}

/**
 * The avatar button (under 900px, in the top bar and the floating top): it opens the Me sheet. Its dot is the
 * clock: olive live, pumpkin simulated.
 */
function MeButton({ clock, onOpen }: { clock?: Clock; onOpen: () => void }) {
  const shifted = clock?.mode === "shifted";
  return <button type="button" className="pd-me" aria-haspopup="dialog" aria-label={`Regional manager. ${shifted ? "Simulated clock" : "Live"}`} onClick={onOpen}>
    <span className="pd-avatar" aria-hidden="true">RM</span>
    <i className={shifted ? "is-shifted" : undefined}/>
  </button>;
}

/**
 * The app frame: a flat stone sidebar (900px and up) or a floating glass tab bar (under 900px, TabBar.tsx), the
 * top bar, the banner (not on the Fleet overview, whose stage card has its own scene, nor on World, which is all
 * map), the page and the footer. The root carries the theme (data-theme), which every --pd-* token follows.
 * The top bar: the region control (its selected region opens a menu of its countries), then, from 900px up, the
 * clock pill and the dark mode switch; under 900px the avatar in their place, which opens the Me sheet with the
 * clock, the theme and the Halloween countdown, so the bar keeps to one line. On a phone the selected region
 * opens the Region sheet rather than the menu.
 * Scrolling down a page under 900px shrinks the tab bar to the current tab, the page's live line (a page sets it
 * with useBarAccessory; else the clock) and Explore; once the top bar has scrolled away, a floating region pill
 * and the avatar stay at the top.
 * On the City, Store and van pages the region control gives way to the time switch: a city, a store or a van is
 * already one place. Data flow has neither: the pipeline is the same for every region. The van page's switch adds Season. The route comes from the nav context, so the static
 * preview shows the switch on those pages too.
 */
export function Shell({ active, scope, onScope, period = "today", onPeriod, clock, lateVans = 0, theme = "light", onTheme, children }: ShellProps) {
  const late = lateVans > 0;
  const dark = theme === "dark";
  const { pathname, route } = useNav();
  const truck = route.page === "Truck";
  const drill = route.page === "City" || route.page === "Store" || truck;
  // A viewer who may see one country only (src/visible.ts) has no region to choose: that country is the whole app.
  const visible = useVisible();
  const only = singleCountry(visible) && visible ? [...visible][0] : null;
  // Data flow is the same for every region: no region control there; nor for a one-country viewer.
  const regionless = route.page === "DataFlow" || only != null;
  // The top clock is the viewer's own: it never switches with the page or the region.
  const tz = useViewerZone();
  const [sheet, setSheet] = useState<"me" | "region" | null>(null);
  const [pageLine, setPageLine] = useState<BarAccessory | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const { compact, past, expand } = useBarScroll(pathname, navRef);
  const shifted = clock?.mode === "shifted";
  // A page's line keeps its own alert; otherwise its dot follows the clock, like the default line's.
  const accessory: BarAccessory = pageLine ? { ...pageLine, tone: pageLine.tone === "alert" ? "alert" : shifted ? "shifted" : "live" } : clockAccessory(clock, tz);
  const openMe = () => setSheet("me");
  const openRegion = () => setSheet("region");
  const closeSheet = () => setSheet(null);
  return <ThemeContext.Provider value={theme}><div className="pd-app" data-theme={theme}>
    <aside className="pd-sidebar">
      {/* The brand art (src/assets/metapumpkin.svg), the same in both themes; the name beside it is the link's text. */}
      <Link to={routes.business()} className="pd-brand"><img src={logo} alt="" width={30} height={30}/><span>MetaPumpkin</span></Link>
      <nav aria-label="Main navigation" className="pd-nav">
        {TABS.map(tab => {
          const on = tab.id === active;
          return <Link key={tab.id} to={tab.to} aria-current={on ? "page" : undefined} className="pd-nav-row">
            <Icon name={TAB_ICON[tab.id]} strokeWidth={on ? 1.8 : 1.7}/>
            <span>{tab.label}</span>
            {tab.id === "fleet" && late && <><span className="pd-nav-dot"/><span className="pd-sr">{LATE_NOTE}</span></>}
          </Link>;
        })}
      </nav>
      <HalloweenCard clock={clock}/>
      <div className="pd-profile"><span className="pd-avatar" aria-hidden="true">RM</span><span>Regional manager<small>{only ? countryName(only) : scopeLabel(scope)}</small></span></div>
    </aside>

    <main className="pd-main">
      <header className="pd-topbar">
        {drill
          ? <div className="pd-period"><Segmented label="Time" options={truck ? TRUCK_OPTIONS : PERIOD_OPTIONS} value={period} onChange={p => onPeriod?.(p)}/></div>
          : !regionless && <RegionPicker scope={scope} onScope={onScope} onSheet={openRegion}/>}
        <div className="pd-topbar-end">
          <div className={`pd-clock${clock?.mode === "shifted" ? " is-shifted" : ""}`}>
            <i/>{clock ? <><b>{dayLabel(clock.now, tz)} · {timeTz(clock.now, tz)}</b><span>{clock.mode === "shifted" ? "Simulated" : "Live"}</span></> : clockLabel(undefined)}
          </div>
          {/* A moon to go dark, a sun to come back. */}
          <button type="button" className="pd-theme" aria-label="Dark mode" aria-pressed={dark} title="Dark mode" onClick={() => onTheme?.(dark ? "light" : "dark")}>
            <span><Icon name={dark ? "sun" : "moon"} size={17} strokeWidth={1.8}/></span>
          </button>
        </div>
        <MeButton clock={clock} onOpen={openMe}/>
      </header>
      <AccessoryProvider value={setPageLine}><div className="pd-content">
        {/* The Fleet overview has no banner: its stage card opens with its own scene (FleetPage). The Truck page keeps it.
            World has none either: the map is the page. */}
        {route.page !== "Fleet" && active !== "world" && <Banner variant={active} chip={seasonChip(active, tz, clock)}/>}
        {children}
      </div></AccessoryProvider>
    </main>

    {/* Under 900px: the floating top (once the top bar has scrolled away), the fade under the bar, the bar. */}
    <div className={`pd-floattop${past ? " is-on" : ""}`}>
      {!drill && !regionless && <button type="button" className="pd-floattop-region pd-glass" aria-haspopup="dialog" aria-label={`Region: ${scopeLabel(scope)}`} onClick={openRegion}>
        <span>{scopeLabel(scope)}</span><Icon name="chevronDown" size={16} strokeWidth={2.2}/>
      </button>}
      <MeButton clock={clock} onOpen={openMe}/>
    </div>
    <div className="pd-tabbar-fade" aria-hidden="true"/>
    <TabBar active={active} compact={compact} onExpand={expand} accessory={accessory} lateVans={lateVans} lateNote={LATE_NOTE} navRef={navRef}/>

    {sheet === "me" && <MeSheet scope={scope} clock={clock} theme={theme} onTheme={onTheme} onClose={closeSheet}/>}
    {sheet === "region" && <RegionSheet scope={scope} onScope={onScope} clock={clock} onClose={closeSheet}/>}
  </div></ThemeContext.Provider>;
}
