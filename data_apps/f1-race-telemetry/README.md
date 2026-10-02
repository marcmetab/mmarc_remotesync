# F1 Race Telemetry

A Metabase data app over the `f1` schema of the **Clickhouse Data Apps**
database (id 67) on `bob.metabaseapp.com`. Served at `/apps/f1-race-telemetry`.

## Screens

| Route | What it shows |
|---|---|
| `/` | **Race Replay** — scrub lap by lap through a session: live timing tower (position, gap, last lap, compound, position change, trend), track map with every car, weather, track status, fastest lap, and the leader's live telemetry. |
| `/results` | **Race Results** — a race podium with animated winner and finisher states, followed by a filterable classification table; opens a driver. The former `/drivers` route remains an alias. |
| `/driver-catalog` | **Driver Catalog** — search and filter distinct drivers across the loaded race and sprint sessions, with portraits, numbers, countries, and latest teams. |
| `/driver-catalog/:sessionId/:driverNumber` | **Catalog driver detail** — opens the cockpit telemetry page in a loaded session where that driver raced, with a return link to the catalog. |
| `/drivers/:driverNumber` | **Driver detail** — play or scrub through that driver's telemetry lap from the cockpit: an F1 steering wheel whose dash shows speed, RPM (with shift lights), gear, throttle, brake, DRS and g-force, and which turns through each corner; a circuit map in its official orientation with kerbs, corner numbers, DRS zones and the rest of the field moving in sync (Circuit / Speed / Gear / Sectors views); a lap trace you can click to seek; plus tyre state, sector times with timing colours, lap details and position/gaps. |
| `/map` | **Season map** — explore races by year on a globe and open a race replay. |

The app uses a charcoal page and card palette inspired by Formula 1's dark
website, with a red F1 mark and bright, high-contrast typography. The header
links to Race Replay, Race Results, and Driver Catalog, with the season map next to the session
picker. On narrow screens the session picker and navigation wrap into
separate header rows. The steering wheel and circuit retain their own darker
drawing surfaces.

Titillium Web and Oxanium are bundled open-source fonts. The Formula 1 header
font is proprietary, so Oxanium is used for a similar display feel. The red F1
logo SVG is from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:F1.svg)
and remains a Formula 1 trademark; confirm rights before distributing the app.

## What the data does and doesn't carry

Read this before extending the app — two constraints shaped the design.

**There is no tyre pressure.** `f1.laps` carries `compound`, `tyre_life`
(age in laps) and `fresh_tyre`; no pressure column exists anywhere in the
schema. The tyre card says so explicitly rather than substituting a
similar-looking number.

**Rich telemetry covers one lap per driver.** `f1.lap_telemetry` is the only
table with lap distance, x/y position and g-force (`g_long`, `g_lat`,
`g_total`) — and it holds exactly one lap per driver, about 700 samples each.
So g-force is available *during that lap*, not at an arbitrary moment of the
race. The driver page scrubs across that lap and names it in the UI.

**The catalog is derived from race results.** There is no standalone driver
table. The catalog joins driver identities across the loaded race and sprint
sessions, and each card opens the most recent loaded session for that driver.
The Metabase results query currently fits within its row cap; if the dataset
grows substantially, the catalog query will need server-side aggregation.

That lap is nearly always the driver's fastest, but **not universally**: across
the 14 loaded sessions one driver-session differs — Piastri's telemetry lap in
the Bahrain race (lap 39, 1:34.983) is 0.209s off his actual best (1:34.774).
So the page compares the lap against the driver's best at render time and
labels it *Fastest lap* or *Telemetry lap* accordingly, rather than asserting
it.

**Do not substitute `laps.is_personal_best` for that check.** It marks a lap
that was the driver's best *at the time*, so it is set on many laps per driver
— eight of Piastri's in that race, including the 1:34.983 — and cannot
identify the quickest.

The Laps tab replays **any** lap using the full-session position feed. Rich
telemetry for any other lap remains reduced: all 1,129 laps of the
Bahrain race have `lap_start_ms` and `lap_end_ms`, so any lap can be sliced
out of `car_telemetry` (~350 samples/lap) and `position_data` (~370) by
session time — giving speed, RPM, gear, throttle, brake, DRS and track
position at roughly half the sample rate. Distance, g-force and corner number
would be unavailable, since they exist only in `lap_telemetry`.

**There is no steering sensor.** The driver page's wheel angle is estimated
from the racing line: curvature of the lap's x/y trace → front-wheel angle
for a 3.6 m wheelbase → × a 10.5:1 steering ratio (`src/lib/lapGeometry.ts`).
It agrees with the sign of `g_lat` through every corner, and the page labels
it as an estimate.

Race-wide channels come from the other two telemetry tables, which have no
distance or g-force:

| Table | Coverage | Channels |
|---|---|---|
| `car_telemetry` | whole session, ~150 ms | speed, rpm, gear, throttle, brake, drs |
| `position_data` | whole session, ~260 ms | x, y, z, on_track |
| `lap_telemetry` | one lap per driver, ~130 ms | the above **plus** distance, g-force, corner number |

**Column semantics worth knowing:**

- `brake` is a **0/1 flag**, not a percentage — the UI shows `ON`/`OFF`.
- `throttle` is a genuine 0–100 percentage.
- `drs` uses the FIA codes; `10`, `12`, `14` mean the wing is open.
- `results.race_time_ms` is the **winner's total race time** for P1 but the
  **gap to the winner** for everyone else. The driver page labels it per row.

## How the data layer is arranged

Session-scoped tables are small once filtered (20 results, ~1.1k laps, 157
weather samples, 15 corners), so `useRaceData` fetches each once and every
lap-by-lap derivation happens in React (`src/lib/raceState.ts`). Scrubbing the
race re-renders without refetching the session tables. The track-map dots and
leader telemetry are keyed to a lap-end moment; Race Replay keeps completed
frames locally, prefetches the next two laps, and waits for the next frame
before advancing playback. The circuit outline is fixed for the session and
uses the same detailed map drawing as the driver page, including kerbs, corner
numbers, the start line, and field markers.

The driver page animates the whole field, so it reads `position_data` in
8-second windows (~600 rows for 20 cars), prefetches the next window, and
interpolates each car between samples (`useFieldMotion`).

Two rules bit during development and are worth preserving:

1. **A static `limit` truncates before the hook's dynamic filter runs.** The
   session-scoped queries deliberately declare no `limit`, so the
   session-filtered result — not the whole table — is what gets bounded. This
   bit twice: as more sessions loaded, `limit: 200` on corners dropped
   Bahrain's turns 13–15, and the same limit on results dropped drivers.
2. **Results are capped at 2,000 rows.** `TelemetryLapIndex` originally
   selected raw rows from a ~14k-row table and silently returned only the
   first three drivers. It is now an aggregated query (count + breakouts),
   returning one row per driver.

## Driver headshots are inlined, deliberately

The app renders inside Metabase's embed iframe, whose CSP is

```
img-src 'self' data: https://*.tile.openstreetmap.org blob:
```

so remote headshots from `media.formula1.com` are refused in production. They
load under `npm run dev` only because the dev server sets **no `img-src`
directive at all** — its CSP covers `connect-src`, `form-action` and
`frame-src` and nothing else. That makes this class of bug invisible until the
app is synced, so check any new remote asset against the embed CSP rather than
the preview.

`allowed_hosts` does not help: it feeds those same three directives, and the
embed `img-src` is byte-identical across every app on the instance, so it is a
Metabase-wide policy rather than something an app configures.

`data:` *is* allowed, which is why the F1 logo (imported with `?inline`) has
always rendered. `scripts/build-headshots.py` bakes the driver photos in the
same way — see its docstring for why the format is WebP and why a sprite sheet
would make things worse. Re-run it when the lineup changes:

```bash
python3 scripts/build-headshots.py   # needs Pillow
```

It costs about 105 kB of bundle. Drivers the source has no photo for — the
field carries the literal string `"None"` for 52 rows — fall back to initials.

## Development

```bash
npm install
npm run dev        # http://localhost:5174
npm run typecheck
npm run build      # syncs queries to Metabase, then bundles to dist/index.js
```

Credentials come from the repo-root `.env.local` (`DATA_APP_MB_URL`,
`DATA_APP_MB_API_KEY`) — git-ignored, one file for every app in the repo.

`npm run build` must be re-run after changing anything in `queries/`: the dev
preview resolves a query through its synced card, so an edited definition does
not take effect until it is synced.
