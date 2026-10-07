import { Component, createContext, type ReactNode, useCallback, useContext, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { ExploreKey } from "./components/Define";
import { Shell } from "./components/Shell";
import { PanelState } from "./components/ui";
import { useBusinessData } from "./data/useBusinessData";
import { useFleetData } from "./data/useFleetData";
import { useShellData } from "./data/useShellData";
import { useCityData, useStoreData, useStoresData } from "./data/useStoresData";
import { useTruckData } from "./data/useTruckData";
import { useWorldData } from "./data/useWorldData";
import { DataAppNav, useNav } from "./nav";
import { BusinessPage } from "./pages/BusinessPage";
import { Explore } from "./pages/business/Explore";
import { CityPage } from "./pages/CityPage";
import { useFlowParts, useFlowQueries } from "./data/useFlowData";
import { DataFlowPage, type DataFlowViewModel } from "./pages/DataFlowPage";
import { ExplorePage, type ExploreQuestionRender, type ExploreViewModel } from "./pages/ExplorePage";
import { ExploreQuestion, ExploreSaveLink } from "./pages/explore/ExploreQuestion";
import { NoAccessPage } from "./pages/NoAccessPage";
import { useQuestionHandle } from "./pages/explore/QuestionFrame";
import { FleetPage } from "./pages/FleetPage";
import { StorePage } from "./pages/StorePage";
import { StoresPage } from "./pages/StoresPage";
import { TruckPage } from "./pages/TruckPage";
import { WorldPage } from "./pages/WorldPage";
import { matchRoute, type Route, tabOf } from "./routes";
import { systemTheme, type ThemeName } from "./theme";
import { ALL_SCOPE, type Clock, type DrillPeriod, type Scope, type TruckPeriod } from "./types";
import { detectViewerZone, ViewerZoneContext } from "./viewer";
import { useVisible, VisibleContext } from "./visible";

/** A page that throws shows an error in place of its content; the shell and the other pages keep working. */
class PageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <PanelState state="error" message="This page could not be shown" onRetry={() => this.setState({ failed: false })}/> : this.props.children;
  }
}

const FOOTNOTE = "Live data · simulated clock";

/*
 * One live container per page: it runs the page's hook (src/data/) and hands the view model to the
 * presentational page. Only the open page's queries run and poll. The static preview
 * (scripts/preview.mjs) renders the same pages from src/fixtures/ instead and never loads this file.
 */
type LiveProps = { scope: Scope; onScope: (scope: Scope) => void; clock?: Clock };

/** A definition card's Explore: one Library metric as a Metabase question, in a sheet (only the live app talks to the SDK). */
const explore = (key: ExploreKey, close: () => void) => <Explore k={key} close={close}/>;

function LiveBusiness(p: LiveProps) {
  const { vm, refreshing } = useBusinessData(p.scope, p.clock);
  return <BusinessPage vm={vm} {...p} refreshing={refreshing} explore={explore}/>;
}
function LiveFleet(p: LiveProps) {
  const { vm, refreshing } = useFleetData(p.scope, p.clock);
  return <FleetPage vm={vm} {...p} refreshing={refreshing}/>;
}
/** The van page takes the top bar's time switch too, Season included: it picks the band's figures and the trips listed. */
function LiveTruck({ truckId, period, ...p }: LiveProps & { truckId: string; period: TruckPeriod }) {
  const { vm, refreshing, retry } = useTruckData(truckId);
  return <TruckPage vm={vm} {...p} period={period} refreshing={refreshing} onRetry={retry}/>;
}
/** The Stores page's revenue period is the same choice as the City and Store pages' time switch. */
function LiveStores({ period, onPeriod, ...p }: LiveProps & { period: DrillPeriod; onPeriod: (period: DrillPeriod) => void }) {
  const { vm, refreshing, retry } = useStoresData();
  return <StoresPage vm={vm} {...p} period={period} onPeriod={onPeriod} refreshing={refreshing} onRetry={retry}/>;
}
/** The City and Store pages also take the top bar's time switch: it picks their figures and which hour query runs. */
type DrillProps = LiveProps & { period: DrillPeriod };
function LiveCity({ cityKey, period, ...p }: DrillProps & { cityKey: string }) {
  const { vm, refreshing } = useCityData(cityKey, period, p.clock?.now);
  return <CityPage vm={vm} {...p} period={period} refreshing={refreshing}/>;
}
function LiveStore({ storeId, period, ...p }: DrillProps & { storeId: number }) {
  const { vm, refreshing } = useStoreData(storeId, period, p.clock?.now);
  return <StorePage vm={vm} {...p} period={period} refreshing={refreshing}/>;
}

/** The World map shows the whole business whatever the region (the page dims what is outside it), so its hook takes no scope. */
function LiveWorld(p: LiveProps) {
  const { vm, refreshing, retry } = useWorldData(p.clock);
  return <WorldPage vm={vm} {...p} refreshing={refreshing} onRetry={retry}/>;
}

/**
 * The Explore tab's Metabase question and its "Save in Metabase ↗" link (only the live app talks to the SDK).
 * They share one handle: the question's frame, which the link reads the question from. It loads nothing up front.
 */
const NOTHING: ExploreViewModel = {};
function LiveExplore(p: LiveProps) {
  const handle = useQuestionHandle();
  const question = useCallback<ExploreQuestionRender>((start, onSaved) => <ExploreQuestion start={start} onSaved={onSaved} handle={handle}/>, [handle]);
  const saveLink = useCallback(() => <ExploreSaveLink handle={handle}/>, [handle]);
  return <ExplorePage vm={NOTHING} {...p} question={question} saveLink={saveLink}/>;
}

/** Data flow's Lines tab draws the pipeline as it was measured: nothing to load. */
const NO_FLOW: DataFlowViewModel = {};
/** Its Queries and Parts tabs read ClickHouse's own logs, live (src/data/useFlowData.ts): only the open tab polls. */
function LiveFlowQueries(p: LiveProps) {
  const { vm, refreshing, retry } = useFlowQueries();
  return <DataFlowPage vm={vm} {...p} refreshing={refreshing} onRetry={retry}/>;
}
function LiveFlowParts(p: LiveProps) {
  const { vm, refreshing, retry } = useFlowParts();
  return <DataFlowPage vm={vm} {...p} refreshing={refreshing} onRetry={retry}/>;
}

/**
 * What the open page needs from the shell. It travels by context, not props: inside the sandbox the
 * PageBoundary class does not re-render when its children change, so props handed through it go stale
 * (the region control and the clock would never reach the page). Context updates reach the page anyway.
 */
const LiveContext = createContext<(LiveProps & { route: Route; period: DrillPeriod; truckPeriod: TruckPeriod; onPeriod: (period: DrillPeriod) => void }) | null>(null);

function LivePage() {
  const value = useContext(LiveContext);
  // A viewer who may see some countries only (src/visible.ts) does not get the pipeline page.
  const limited = useVisible() != null;
  if (!value) return null;
  const { route, period, truckPeriod, onPeriod, ...p } = value;
  switch (route.page) {
    case "Business": return <LiveBusiness {...p}/>;
    case "Fleet": return <LiveFleet {...p}/>;
    case "Truck": return <LiveTruck {...p} period={truckPeriod} truckId={route.truckId}/>;
    case "Stores": return <LiveStores {...p} period={period} onPeriod={onPeriod}/>;
    case "City": return <LiveCity {...p} period={period} cityKey={route.cityKey}/>;
    case "Store": return <LiveStore {...p} period={period} storeId={route.storeId}/>;
    case "World": return <LiveWorld {...p}/>;
    case "Explore": return <LiveExplore {...p}/>;
    case "DataFlow": return limited ? <NoAccessPage page="Data flow"/>
      : route.tab === "queries" ? <LiveFlowQueries {...p}/> : route.tab === "parts" ? <LiveFlowParts {...p}/> : <DataFlowPage vm={NO_FLOW} {...p}/>;
  }
}

/**
 * Light or dark: the system preference, following it if it changes, until the viewer presses the switch;
 * from then on their pick, for the session. Nothing is stored (the sandbox blocks browser storage), so a
 * reload starts from the system preference again.
 */
function useTheme(): [ThemeName, (theme: ThemeName) => void] {
  const [system, setSystem] = useState<ThemeName>(systemTheme);
  const [picked, setPicked] = useState<ThemeName | null>(null);
  useEffect(() => {
    try {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      const follow = () => setSystem(query.matches ? "dark" : "light");
      query.addEventListener("change", follow);
      return () => query.removeEventListener("change", follow);
    } catch { return undefined; /* no media queries here: the theme stays as it started */ }
  }, []);
  return [picked ?? system, setPicked];
}

/**
 * Routing and composition. The region, country, theme and the period live here, so they survive moving between
 * pages. The period is the City, Store and van pages' time switch and the Stores page's revenue period: one choice,
 * kept from the stores to a city to its stores and back. The van page's switch also offers Season, kept apart here
 * (`season`) so City and Store never get it: picking Season sets it, picking any other time clears it.
 */
function Root() {
  const { pathname, route } = useNav();
  // The page follows the path a beat behind: a press shows at once (the tab, the shell), and the new page renders
  // after that paint, in the background, rather than inside the click.
  const pagePath = useDeferredValue(pathname);
  const pageRoute = useMemo(() => matchRoute(pagePath), [pagePath]);
  const [scope, setScope] = useState<Scope>(ALL_SCOPE);
  const [period, setPeriod] = useState<DrillPeriod>("today");
  const [season, setSeason] = useState(false);
  const truckPeriod: TruckPeriod = season ? "season" : period;
  const pickPeriod = useCallback((p: TruckPeriod) => {
    if (p === "season") setSeason(true);
    else { setSeason(false); setPeriod(p); }
  }, []);
  const [theme, setTheme] = useTheme();
  const { clock, lateVans, visible } = useShellData();
  // A new page starts at its top.
  useEffect(() => { try { window.scrollTo(0, 0); } catch { /* not scrollable here */ } }, [pagePath]);

  const live = useMemo(() => ({ route: pageRoute, scope, onScope: setScope, clock, period, truckPeriod, onPeriod: pickPeriod }), [pageRoute, scope, clock, period, truckPeriod, pickPeriod]);
  // The countries this viewer may see reach the shell's region control and every page (src/visible.ts).
  return <VisibleContext.Provider value={visible}><Shell active={tabOf(route.page)} scope={scope} onScope={setScope} period={route.page === "Truck" ? truckPeriod : period} onPeriod={pickPeriod}
    clock={clock} lateVans={lateVans} footnote={FOOTNOTE} theme={theme} onTheme={setTheme}>
    <LiveContext.Provider value={live}>
      <PageBoundary key={pagePath}><LivePage/></PageBoundary>
    </LiveContext.Provider>
  </Shell></VisibleContext.Provider>;
}

export default function App() {
  const zone = useMemo(detectViewerZone, []);
  return <ViewerZoneContext.Provider value={zone}><DataAppNav><Root/></DataAppNav></ViewerZoneContext.Provider>;
}
