# MetaPumpkin · ClickHouse

MetaPumpkin on the live stream: a regional manager's app reading ClickHouse Cloud (fed from Postgres through
Debezium, Kafka and the ClickHouse sink). It was built on seaside-axle (abdhabli/axle-data-apps) and moved to
olden-midship, which runs a pinned Metabase release. On this instance:

| | |
|---|---|
| Metabase database | 102 `Pumpkin database` (ClickHouse `pumpkin_live`) |
| Library tables | Library / Data / MetaPumpkin · ClickHouse (collection 144, 27 tables) |
| Library metrics | Library / Metrics / MetaPumpkin · ClickHouse (collection 145, metrics 388–411) |
| App collection | Data App: metapumpkin-clickhouse |
| Dev server | port 5180 |

The schema comes from those two Library collections only:

```bash
( source "$(git rev-parse --show-toplevel)/.env.local"
  curl -o src/live.metabase.data.ts -H "x-api-key: $DATA_APP_MB_API_KEY" -H "Accept: text/typescript" \
    "$DATA_APP_MB_URL/api/typed-schemas/v1/typescript?library-collections=144,145" )
npm run metrics
```

One code change: the Store page's hours come from `store_now.opens_at` / `closes_at` on the store's clock, not from
`stores.open_time` / `close_time`. ClickHouse holds those as `Time64`, which Metabase's ClickHouse driver cannot read
("Unsupported conversion from java.time.LocalDateTime to java.time.OffsetTime"), so they are hidden (sensitive) in
database 102. If the ClickHouse view ever returns them as `'HH:MM:SS'` strings, unhide them and the original code works.

A Metabase **data app** for a regional manager: revenue against plan, the harvest and the delivery
fleet, and store stock, through the pumpkin season. Six tabs (Data flow has three of its own) and three drill-downs:

| Path | Page |
|---|---|
| `/` | Business |
| `/fleet` | Harvest & fleet |
| `/fleet/truck/:truckId` | one van |
| `/stores` | Stores |
| `/stores/city/:cityKey` | one city |
| `/stores/store/:storeId` | one store |
| `/world` | World: the live map |
| `/explore` | Explore: the Metabase query builder |
| `/data-flow` | Data flow · Lines: the pipeline as a metro map (a sidebar row; on phones, in the Me sheet) |
| `/data-flow/queries` | Data flow · Queries: the app's own queries in ClickHouse's query log, live |
| `/data-flow/parts` | Data flow · Parts: the sales table's parts and merges, live |

It is a single-bundle React app (Embedding SDK data-app contract) served from this directory by remote
sync at `/apps/metapumpkin-clickhouse`. The built bundle (`dist/index.js`) is committed with the source.

## Data flow: ClickHouse watching itself

The Queries and Parts tabs read three `pumpkin_live` views over ClickHouse's system tables, defined in
`clickhouse/pumpkin_live/views/90_ops.sql` (they run as `pumpkin_definer`, which the file grants `SELECT` on
`system.query_log`, `system.parts` and `system.part_log`):

| View | From | What |
|---|---|---|
| `ops_queries` | `system.query_log` | every query Metabase ran on `pumpkin_live` in the last hour (never the `ops_` views themselves) |
| `ops_parts` | `system.parts` | the active parts of every `pumpkin_raw` table |
| `ops_part_events` | `system.part_log` | the inserts and merges on `pumpkin_raw` in the last hour |

`queries/flow.query.ts` reads them and `src/data/useFlowData.ts` polls the open tab every 15 s. To set them up:
apply the SQL as the admin (`./apply.sh views/90_ops.sql` from `clickhouse/pumpkin_live`, or the Cloud SQL console),
sync database 102, publish the three views to the Library's MetaPumpkin · ClickHouse collection (144), regenerate
`src/live.metabase.data.ts` (below), then `npm run build`.

## Develop

```bash
npm install
npm run typecheck
npm run dev        # http://localhost:5180, needs DATA_APP_MB_URL + DATA_APP_MB_API_KEY in the repo-root .env.local
npm run build      # syncs queries/ and actions/ to Metabase, then writes dist/index.js
npm run metrics    # after regenerating src/live.metabase.data.ts: copies the Library metrics' names and
                   # descriptions into src/metrics.generated.ts for the definition cards
```

`npm run build` runs `sync-resources` first: it creates or updates one saved question per `queries/`
export (and copies the Library metrics they use into the app's collection), writes each new
`savedQuestionSourceId` into `queries/live.query.ts` and records everything in `resources_metadata.json`.
Commit those two files with the bundle.

### Static preview (no Metabase)

```bash
node scripts/preview.mjs <PageName> [--width 1440] [--state '<json>'] [--scope '<json>']
```

Renders one page with its fixture inside the shell and writes a self-contained
`.preview/<pagename>-<width>.html` (git-ignored; fonts, art and CSS inlined). `--state` seeds the
page's own UI state, `--scope` sets the region and country. See the header of `scripts/preview.mjs`.

## Business page

`src/pages/BusinessPage.tsx` lays out the sections in `src/pages/business/` (each takes its part of the
view model in `src/pages/business/model.ts`, and loads and fails on its own):

| Section | File | Data (pumpkin_live) |
|---|---|---|
| Revenue hero: live total, comparisons, latest sale, season bar with the landing range | `Hero.tsx` | daily_store_sales, sales_pulse, recent_sales, season_plan, season_landing |
| Tiles: gross margin, average selling price, contribution, 28-day sparklines | `Tiles.tsx` | daily_store_sales |
| Daily revenue with storms, breakdowns and hub shortages | `DailyRevenue.tsx` | daily_store_sales, business_events |
| Lost sales and costs (markdowns from Nov 1) | `LostAndCosts.tsx` | daily_store_sales |
| Plan to actual: plan, volume, mix, lost sales by cause, actual | `Bridge.tsx` | daily_store_sales |
| Mix: variety (shift vs last season) and channel | `Mix.tsx` | daily_store_sales |
| Season: cumulative actual, plan, last season and the projected landing | `SeasonCurve.tsx` | season_daily, season_plan, season_landing |
| Stock at risk: projected leftover on Nov 1, markdown exposure, season end | `StockAtRisk.tsx` | stock_outlook |
| Breakdown by country, city, store format, variety or channel | `Breakdown.tsx` | daily_store_sales |

`src/data/useBusinessData.ts` runs the queries (`Business*`, `Season*`, `StockOutlook` every 2 minutes;
`SalesPulse` and `RecentSales` every 10 seconds: only the hero numeral adds the live sales, so it climbs
between refreshes while every comparison stays on the 2-minute figures). A label with a
dotted underline opens its definition (`src/components/Define.tsx`, text from `src/definitions.ts`):
the Library metric's Metabase description, freshness, "Open in Metabase" and, for the metrics with an
`Explore<Key>` query that a definition points to, a Metabase question in a sheet (`src/pages/business/Explore.tsx`).

## World page

`src/pages/WorldPage.tsx` draws the whole business as one illustrated map: the 5 hubs (red barns in fenced
yards, inside a ring road) with their workshops and 30 pumpkin fields, the 25 cities at the end of their roads
(each plaza with its landmark or a pumpkin fountain), the 100 stores (each with a pumpkin for its stock) and all
100 vans: parked in their hub's bays, in the workshop, or on the roads. Counters above the map pick out vans or
stores by status; a hover or a click opens a card for a van, store, hub, workshop, field or city. It has region
callouts, a minimap, layers to show or hide and a live activity feed. The map always shows
every region and dims what is outside the selected one; the counters follow the region. No banner: the map is
the page.

The last button under the zoom opens the full view: the map leaves the page and fills the window, over the
sidebar and the tab bar, with the counters in a small bar over its top (one row of eight, or two of four on a
narrower window; under 900px wide, a row over its foot that scrolls sideways) and Live activity over its corner
(under 900px, a strip under it). The same button or Escape brings it back; Tab stays inside it. It fills the window, not the screen: the data-app sandbox blocks the Fullscreen API
(`Element.requestFullscreen`).

From far out (All regions) the map shows an overview drawn at screen size, so it reads whatever the zoom: each hub's
barn on its yard with a wooden sign (its name, then a tick per van: out, stopped, at the hub; a red flag on the barn
when a van is stopped), a little town per city (a flag on its tower when a store is low or out), a little shop per
store in its stock colour, an arrow per van on the road pointing the way it drives with the stretch it just drove,
and each region lettered with its local time and alerts. Zooming in
cross-fades it into the full illustrated map; a region's view always opens on the full map. Day and night
sweep across the map as a band, from each region's local time: a soft rose at dusk and dawn, a deep blue at night,
blending over the sea between regions.

The land is real coastline drawn as on a world map, not to scale: North America, Britain and Ireland beside the
rest of Europe, and Japan. Each is magnified around its hub, so the roads, cities and stores have room, and kept
small away from it, so the hubs and stores stand out. A hub's cities lie in their real direction from it, at a
distance that follows the drive time.

`src/data/useWorldData.ts` builds the view model (`src/pages/world/types.ts`) from `FleetNow`, polled every 10
seconds, `HubNow` and `StoreNow`, polled every 20, and `Cities`, read once. A van is placed by its city and how
far along that road it is (`frac`). Between polls a driving van keeps moving toward its store so that it arrives
at its ETA (`eta_at`), a returning van heads back a little faster than the road's drive time (`driveMin`), and the
others stand still; the next poll puts them back on the data.

The map's geometry, terrain, roads and sprites are generated, as is its fixture:

```bash
pip install shapely               # once
python3 scripts/world/gen_world.py
```

It writes `src/pages/world/geo.ts` (layout, terrain and roads), `src/pages/world/art.ts` (sprites, drawn in
`scripts/world/art.py`) and `src/fixtures/world.ts` (the static preview's view model). The coastlines are
Natural Earth 1:50m, downloaded once into `scripts/world/.cache/`. The scenery is seeded: a rerun gives the
same map. The run checks the layout (every store, barn, field, plaza and label on land, clear of the coast and
of the other hubs) and writes nothing when it fails; `WORLD_STRICT=0` writes anyway and only lists the problems.
`src/pages/world/art.css` holds the art's colour tokens (`--pdw-*`, light and dark) and classes, by hand.

The art is SVG markup, turned into React elements by `src/pages/world/markup.tsx`. It must not go in through
`innerHTML`: inside Metabase the host sanitizes every `innerHTML` write and strips SVG `<use>`, which draws the
land, coasts, trees and hills.

The terrain (some 3,000 shapes) is shown as one image, a `data:` SVG like the app's other bundled images: as live
SVG every placed tree is a piece of its own for the browser to sort into layers on each frame, and a zoom stuttered
and sharpened in steps. So the generator writes its paint inline (each class's rule from `art.css`, tokens and all)
and the app fills the tokens in from the map's computed style, again when the theme changes. The static preview
draws it as live SVG.

## Loading and speed

A chart on its way shows the harvest loader (`HarvestLoader` in `src/components/ui.tsx`, `PanelState` with
`chart`): the pumpkin in a ring whose pumpkin arc turns, over "Loading the harvest…". It fades in after .15 s, so a
quick load never flashes it; lists and figures keep their skeleton lines. A Metabase question in Explore shows the
same loader drawn over the SDK's own spinner (`src/pages/explore/sdk-theme.css`): a data app cannot hand the SDK a
loader component (the host keeps only `theme`, `allowedCustomVisualizations` and `errorComponent`).

`useLive` (`src/data/live.ts`) keeps every query's last result for the session, so a page opened again shows its data
at once and refreshes it behind. A refresh behind data on screen (a poll, that revisit) is quiet; only a retry the
viewer asked for dims its part. Business asks for the top of the page first and the rest once the daily sales are in
(staging runs out of database connections when thirteen queries start at once). A press shows at once: the tab
highlights while the new page renders after that paint (`useDeferredValue` in `App.tsx`), and a held control darkens
a touch.

## Layout

```
data_app.yaml            manifest: version, name, bundle path
queries/ actions/        every defineQuery / defineAction export (see their READMEs)
scripts/preview.mjs      static preview
scripts/gen-metrics.mjs  npm run metrics: Library metrics → src/metrics.generated.ts
scripts/world/           gen_world.py (+ art.py): the World map's geometry, sprites and fixture
src/
  index.tsx              entry: the factory ({ component, providerProps })
  App.tsx                router, shell, region and country state, one live container per page
  registry.ts            finds pages and fixtures by file name (fixture tools; not in the bundle)
  live.metabase.data.ts  generated typed schema (pumpkin_live tables + Library metrics)
  metrics.generated.ts   generated by npm run metrics: Library metric names, descriptions, instance URL
  definitions.ts         what each number on Business means, and the Library metrics it is built from
  data/                  one live hook per page: queries → the page's view model, polling
  nav.tsx                Link + useNav; DataAppNav (host router) and StaticNav (preview)
  routes.ts              path builders and matchRoute
  format.ts              money, percents, durations, local times, chart scales
  types.ts               shared types, regions and countries
  theme.ts               palette and the SDK theme
  fonts.css              Young Serif + Hanken Grotesk, bundled
  styles/tokens.css      Golden Hour tokens (--pd-*) on .pd-app
  styles/base.css        shell, panels, chips, controls, tables, utilities
  components/Shell.tsx   sidebar / bottom tab bar, top bar, banner, footer
  components/Banner.tsx  the illustrated strip (business / fleet / stores)
  components/ui.tsx      shared building blocks
  components/Define.tsx  definition labels and cards (DefineProvider)
  components/Sparkline.tsx  28-day sparklines
  assets/                banner art
  pages/<Name>Page.tsx   one presentational page each, with pages/<name>.css
  pages/business/        the Business page's sections, their CSS and its view model (model.ts)
  pages/world/           the World map: its view model and geometry types (types.ts), generated geo.ts
                         and art.ts, the art's tokens and classes (art.css)
  fixtures/<name>.ts     the page's fixture view model (Business: assembled from fixtures/business/;
                         World: generated by scripts/world/gen_world.py)
```

Pages and components are presentational: they take a typed view model and never import the SDK.
The SDK is imported by the queries (`queries/live.query.ts`), the live hooks (`src/data/`), `nav.tsx`,
`index.tsx`, `theme.ts` (its theme type) and `pages/business/Explore.tsx`, which only `App.tsx` renders,
through BusinessPage's `explore` prop. Keep `<MetabaseProvider>` out of `App.tsx`: the host provides it.
