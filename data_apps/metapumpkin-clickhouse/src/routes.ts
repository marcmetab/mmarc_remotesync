/**
 * The app's nine routes: six tabs and three drill-downs.
 *   /                        Business
 *   /fleet                   Harvest & fleet
 *   /fleet/truck/:truckId    one van (trucks.truck_id, e.g. "PK-US-107")
 *   /stores                  Stores
 *   /stores/city/:cityKey    one city (cities.city_key, e.g. "US-new-york")
 *   /stores/store/:storeId   one store (stores.store_id, 1..100)
 *   /world                   World (the live map of the whole business)
 *   /explore                 Explore (the Metabase query builder)
 *   /data-flow               Data flow: the metro map of the pipeline, Postgres to this app (tab Lines)
 *   /data-flow/queries       Data flow: the app's queries, from ClickHouse's query log (tab Queries)
 *   /data-flow/parts         Data flow: the sales table's parts and merges (tab Parts)
 * Build every href with `routes.*` (params are URL-encoded) and read the current one with `useNav().route`.
 */

export type TabId = "business" | "fleet" | "stores" | "world" | "explore" | "flow";
/** Page component names: `src/pages/<PageName>Page.tsx`, fixture `src/fixtures/<pagename>.ts`. */
/** The Data flow page's three tabs, each its own path. */
export type FlowTab = "lines" | "queries" | "parts";
export const FLOW_TABS: { value: FlowTab; label: string }[] = [
  { value: "lines", label: "Lines" },
  { value: "queries", label: "Queries" },
  { value: "parts", label: "Parts" },
];

export type PageName = "Business" | "Fleet" | "Truck" | "Stores" | "City" | "Store" | "World" | "Explore" | "DataFlow";

export type Route =
  | { page: "Business" }
  | { page: "Fleet" }
  | { page: "Truck"; truckId: string }
  | { page: "Stores" }
  | { page: "City"; cityKey: string }
  | { page: "Store"; storeId: number }
  | { page: "World" }
  | { page: "Explore" }
  | { page: "DataFlow"; tab: FlowTab };

export const routes = {
  business: () => "/",
  fleet: () => "/fleet",
  truck: (truckId: string) => `/fleet/truck/${encodeURIComponent(truckId)}`,
  stores: () => "/stores",
  city: (cityKey: string) => `/stores/city/${encodeURIComponent(cityKey)}`,
  store: (storeId: number | string) => `/stores/store/${encodeURIComponent(String(storeId))}`,
  world: () => "/world",
  explore: () => "/explore",
  dataFlow: (tab: FlowTab = "lines") => tab === "lines" ? "/data-flow" : `/data-flow/${tab}`,
};

/**
 * `short` is the phone tab bar's label where the full one would not fit five across (screen readers still get `label`).
 * Data flow is a sidebar row only: the phone tab bar keeps its four tabs and Explore, and phones reach it from the Me sheet.
 */
export const TABS: { id: TabId; label: string; short?: string; to: string }[] = [
  { id: "business", label: "Business", to: routes.business() },
  { id: "fleet", label: "Harvest & fleet", short: "Fleet", to: routes.fleet() },
  { id: "stores", label: "Stores", to: routes.stores() },
  { id: "world", label: "World", to: routes.world() },
  { id: "explore", label: "Explore", to: routes.explore() },
  { id: "flow", label: "Data flow", to: routes.dataFlow() },
];

const PAGE_TAB: Record<PageName, TabId> = { Business: "business", Fleet: "fleet", Truck: "fleet", Stores: "stores", City: "stores", Store: "stores", World: "world", Explore: "explore", DataFlow: "flow" };
/** The tab a page belongs to: drill-downs keep their parent tab selected. */
export const tabOf = (page: PageName): TabId => PAGE_TAB[page];

const decode = (part: string) => {
  try { return decodeURIComponent(part); } catch { return part; }
};
/**
 * Parses a pathname into a route. Anything unknown falls back to the nearest tab, and finally to
 * Business, so the app never opens on a blank page.
 */
export function matchRoute(pathname: string): Route {
  const path = pathname.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
  let m: RegExpMatchArray | null;
  if ((m = path.match(/^\/fleet\/truck\/([^/]+)$/))) return { page: "Truck", truckId: decode(m[1]) };
  if ((m = path.match(/^\/stores\/city\/([^/]+)$/))) return { page: "City", cityKey: decode(m[1]) };
  if ((m = path.match(/^\/stores\/store\/([^/]+)$/))) {
    const storeId = Number(decode(m[1]));
    return Number.isInteger(storeId) && storeId > 0 ? { page: "Store", storeId } : { page: "Stores" };
  }
  if (/^\/fleet(\/|$)/.test(path)) return { page: "Fleet" };
  if (/^\/stores(\/|$)/.test(path)) return { page: "Stores" };
  if (/^\/world(\/|$)/.test(path)) return { page: "World" };
  if (/^\/explore(\/|$)/.test(path)) return { page: "Explore" };
  if ((m = path.match(/^\/data-flow\/(queries|parts)$/))) return { page: "DataFlow", tab: m[1] as FlowTab };
  if (/^\/data-flow(\/|$)/.test(path)) return { page: "DataFlow", tab: "lines" };
  return { page: "Business" };
}
/**
 * The banner a page shows (Shell.tsx, components/Banner.tsx): its tab's art, the van page the fleet's. None on the Fleet
 * overview (its stage card has its own scene) or on World (the map is the page).
 */
export function bannerOf(route: Route): Exclude<TabId, "world"> | null {
  const tab = tabOf(route.page);
  return route.page === "Fleet" || tab === "world" ? null : tab;
}

/** The pathname of a route (the inverse of matchRoute). */
export function routePath(route: Route): string {
  switch (route.page) {
    case "Business": return routes.business();
    case "Fleet": return routes.fleet();
    case "Truck": return routes.truck(route.truckId);
    case "Stores": return routes.stores();
    case "City": return routes.city(route.cityKey);
    case "Store": return routes.store(route.storeId);
    case "World": return routes.world();
    case "Explore": return routes.explore();
    case "DataFlow": return routes.dataFlow(route.tab);
  }
}
