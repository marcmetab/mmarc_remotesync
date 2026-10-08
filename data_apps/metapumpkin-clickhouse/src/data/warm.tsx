import { Component, createContext, type ReactNode, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { matchRoute, type Route } from "../routes";
import { ALL_SCOPE, type Clock, type DrillPeriod, type Scope } from "../types";
import { useBusinessData } from "./useBusinessData";
import { useFleetData } from "./useFleetData";
import { cachedData } from "./live";
import { useCityData, useStoreData, useStoresData } from "./useStoresData";
import { useTruckData } from "./useTruckData";
import { useWorldData } from "./useWorldData";

/*
 * Warm-up: the data of pages not open yet, fetched quietly so that their first visit paints at once.
 *
 * A page's hook (src/data/) keeps every result for the session (live.ts CACHE), so a page opened again shows its
 * last data at once. Warm-up runs those same hooks with the same arguments, unseen (nothing is drawn), so the cache
 * already holds a page the first time it opens; the SDK also keeps each saved question's metadata from then on,
 * which a first visit would otherwise wait on before its first query. Two kinds:
 * - Background: once the open page has had WARM_DELAY_MS to load, the tabs (Business, Harvest & fleet, Stores,
 *   World), then one store, one city and one van, run one at a time, each for WARM_HOLD_MS. A tab not warmed or
 *   visited for REWARM_MS is warmed again, so what it first shows is never old news (the World map would otherwise
 *   jump its vans); the drill-downs run once, for their metadata. Opening another page stops the background run and
 *   starts it again later, so the open page's own queries never wait behind it.
 * - Intent: a mouse resting on a link, or keyboard focus on it (src/nav.tsx), warms the page it leads to ahead of
 *   the click: one at most every INTENT_EVERY_MS, INTENT_MAX at a time, each for WARM_HOLD_MS, never a page the
 *   background run has. A page opened while its warm run is still going shows whichever result lands first
 *   (live.ts WAITING).
 * An intent run is never cut short to start another: the host cannot cancel a query, so its results would be lost.
 * Nothing warms while the document is hidden. Data flow and Explore are not warmed (nothing slow to load first).
 */

/** How long the open page gets to itself before the background warm-up starts (ms). */
const WARM_DELAY_MS = 8_000;
/** How long one warm run lasts: enough for a page's queries, both waves of the Business page's included (ms). */
const WARM_HOLD_MS = 10_000;
/** A tab warmed or visited longer ago than this is warmed again when it is not open (ms). */
const REWARM_MS = 3 * 60_000;
/** With nothing to warm, the background looks again this often (ms). */
const IDLE_CHECK_MS = 60_000;
/** At most this many pages warm from intent at once. */
const INTENT_MAX = 2;
/** Intent starts at most one warm run this often: a mouse moved down a list of stores must not warm each (ms). */
const INTENT_EVERY_MS = 1_200;

const TABS: Route[] = [{ page: "Business" }, { page: "Fleet" }, { page: "Stores" }, { page: "World" }];

const idOf = (r: Route) => r.page === "Truck" ? `Truck:${r.truckId}` : r.page === "City" ? `City:${r.cityKey}`
  : r.page === "Store" ? `Store:${r.storeId}` : r.page === "DataFlow" ? `DataFlow:${r.tab}` : r.page;
const WARMABLE = new Set<Route["page"]>(["Business", "Fleet", "Stores", "World", "Store", "City", "Truck"]);

/** When each page was last warmed or visited (left, for the open one). */
const DONE = new Map<string, number>();
const done = (id: string) => { DONE.set(id, Date.now()); };
const recent = (id: string) => Date.now() - (DONE.get(id) ?? -Infinity) < REWARM_MS;
/** The background run's page, if one runs (Warmup keeps it in step with its state). */
let backgroundId: string | null = null;
const isHidden = () => {
  try { return typeof document !== "undefined" && document.hidden === true; } catch { return false; }
};

/* ── Intent: a small store the links write and Warmup reads ── */

type Intent = { id: string; route: Route; n: number };
let intents: Intent[] = [];
let counter = 0;
let lastIntent = 0;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const getIntents = () => intents;
const setIntents = (next: Intent[]) => { intents = next; listeners.forEach(l => l()); };

/** A link may be followed soon (src/nav.tsx): warm the page it leads to, unless it is warm or warming already. */
export function warmIntent(to: string) {
  const route = matchRoute(to);
  const id = idOf(route);
  if (!WARMABLE.has(route.page) || recent(id) || id === backgroundId || isHidden()) return;
  if (intents.length >= INTENT_MAX || intents.some(i => i.id === id)) return;
  const now = Date.now();
  if (now - lastIntent < INTENT_EVERY_MS) return;
  lastIntent = now;
  const n = ++counter;
  setIntents([...intents, { id, route, n }]);
  setTimeout(() => {
    done(id);
    setIntents(intents.filter(i => i.n !== n));
  }, WARM_HOLD_MS);
}

/* ── The background order ────────────────────────────────── */

type Rows = { rows: Record<string, unknown>[] } | null;
/** One store, its city and one van, from the warmed Stores and Harvest & fleet data: the drill-downs' metadata. */
function samples(): Route[] {
  const store = cachedData<Rows>("the stores", "stores")?.rows?.[0];
  const van = cachedData<Rows>("the vans", "fleet")?.rows?.[0];
  const out: Route[] = [];
  if (store?.store_id != null && Number.isFinite(Number(store.store_id))) out.push({ page: "Store", storeId: Number(store.store_id) });
  if (store?.city_key != null) out.push({ page: "City", cityKey: String(store.city_key) });
  if (van?.truck_id != null) out.push({ page: "Truck", truckId: String(van.truck_id) });
  return out;
}
/** The next page to warm: a tab not warmed lately, else a drill-down never warmed; never the open page or an intent's. */
function nextBackground(openId: string): Route | null {
  const busy = (id: string) => id === openId || intents.some(i => i.id === id);
  return TABS.find(r => !busy(idOf(r)) && !recent(idOf(r)))
    ?? samples().find(r => !busy(idOf(r)) && !DONE.has(idOf(r)))
    ?? null;
}

/* ── The unseen pages ────────────────────────────────────── */

type WarmProps = { scope: Scope; clock?: Clock; period: DrillPeriod };
/**
 * The shell's scope, clock and period, by context like the live pages' (App.tsx LiveContext): inside the sandbox a
 * class boundary does not re-render when its children change, so props handed through it would go stale.
 */
const WarmContext = createContext<WarmProps>({ scope: ALL_SCOPE, period: "today" });

// Each runs the page's hook exactly as its live container in App.tsx does, so the cache keys match.
function WarmBusiness() { const { scope, clock } = useContext(WarmContext); useBusinessData(scope, clock); return null; }
function WarmFleet() { const { scope, clock } = useContext(WarmContext); useFleetData(scope, clock); return null; }
function WarmStores() { useStoresData(); return null; }
function WarmWorld() { const { clock } = useContext(WarmContext); useWorldData(clock); return null; }
function WarmCity({ cityKey }: { cityKey: string }) { const { period, clock } = useContext(WarmContext); useCityData(cityKey, period, clock?.now); return null; }
function WarmStore({ storeId }: { storeId: number }) { const { period, clock } = useContext(WarmContext); useStoreData(storeId, period, clock?.now); return null; }
function WarmTruck({ truckId }: { truckId: string }) { useTruckData(truckId); return null; }

function WarmPage({ route }: { route: Route }) {
  switch (route.page) {
    case "Business": return <WarmBusiness/>;
    case "Fleet": return <WarmFleet/>;
    case "Stores": return <WarmStores/>;
    case "World": return <WarmWorld/>;
    case "City": return <WarmCity cityKey={route.cityKey}/>;
    case "Store": return <WarmStore storeId={route.storeId}/>;
    case "Truck": return <WarmTruck truckId={route.truckId}/>;
    default: return null;
  }
}

/** A warm run that throws ends quietly: nothing of it is on screen, and the page opens as it would have anyway. */
class WarmBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Mount once next to the open page: `route` is the open page's, the rest what its live container gets. */
export function Warmup({ route, scope, clock, period }: WarmProps & { route: Route }) {
  const intended = useSyncExternalStore(subscribe, getIntents, getIntents);
  const shared = useMemo(() => ({ scope, clock, period }), [scope, clock, period]);
  const [background, setBackground] = useState<Route | null>(null);
  const openId = idOf(route);

  useEffect(() => {
    // The open page is visited: its own hook fills the cache, nothing to warm for it.
    done(openId);
    let running: Route | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      // The run that held its time is done; one cut short by a page change is not, and is tried again later.
      if (running) done(idOf(running));
      running = isHidden() ? null : nextBackground(openId);
      backgroundId = running ? idOf(running) : null;
      setBackground(running);
      timer = setTimeout(next, running ? WARM_HOLD_MS : isHidden() ? WARM_DELAY_MS : IDLE_CHECK_MS);
    };
    // A page opened while it warms keeps that run (its results are on their way); any other run stops.
    if (backgroundId !== openId) {
      backgroundId = null;
      setBackground(null);
    }
    timer = setTimeout(next, WARM_DELAY_MS);
    return () => {
      clearTimeout(timer);
      // Left now: what it shows is as recent as this.
      done(openId);
    };
  }, [openId]);

  // A link followed while it warms keeps its run too, for the same reason.
  return <WarmContext.Provider value={shared}>
    {background && <WarmBoundary key={`bg:${idOf(background)}`}><WarmPage route={background}/></WarmBoundary>}
    {intended.map(i => <WarmBoundary key={`in:${i.n}`}><WarmPage route={i.route}/></WarmBoundary>)}
  </WarmContext.Provider>;
}
