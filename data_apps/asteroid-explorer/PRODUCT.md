# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curious non-experts exploring asteroids for fun, inside Metabase (Bob instance, 2026 offsite hackathon). They don't know orbital mechanics jargon (semi-major axis, Palermo scale, MOID) and need plain-language meaning next to every number.

## Product Purpose

Asteroid Explorer shows near-Earth asteroids moving on their real orbits in 3D, and lets people pick one or several to compare and understand: how big it is, how close it gets to Earth, whether it has any impact risk, and when it next passes by. Success means a visitor can find an asteroid they've heard of (Apophis, 2024 YR4), see where it is right now, and come away understanding whether it is dangerous.

## Positioning

A Metabase Data App, so everything is live data from Metabase rather than a static visualization: orbits for 42k near-Earth asteroids from JPL's Small-Body Database, impact risk from JPL Sentry (updated daily), and close approaches from JPL CAD. Unlike orbit viewers such as orbitviewer.com, it pairs the 3D view with charts and data about the selected objects.

## Operating Context

- Runs as a data app at `/apps/asteroid-explorer` inside Metabase, in a sandboxed iframe. Data comes only through Metabase queries on ClickHouse tables (database 67, tables `ast_*`).
- First job: explore and inspect. The 3D scene comes first, then search or click asteroids and compare one or several in a panel.
- The default 3D set is the ~2,549 potentially hazardous asteroids. Any other near-Earth asteroid is reachable by search.

## Capabilities and Constraints

- Positions are computed in the browser from osculating orbital elements with a two-body Kepler solution. They're accurate enough for visualization, but not for impact analysis. Official dates and distances come from JPL CAD.
- Metabase queries are single-stage structured queries on one table. Row caps per query apply, so the exact limit still needs checking.
- The sandbox blocks network egress, storage, dialogs, history APIs and global key listeners. Canvas and WebGL are expected to work but haven't been verified yet.
- The repo (`abdhabli/metaapps`) and the Metabase instance are shared with another team's app. Only touch `data_apps/asteroid-explorer/` and `ast_*` objects.

## Evidence on Hand

Real data only: JPL SBDB, Sentry, CAD and the MPC NEO Confirmation Page, loaded into ClickHouse. Past Torino ratings (`ast_torino_history`) are a hand-made table, and some dates are approximate. Don't fabricate numbers, risks or imagery.

## Product Principles

1. Explain every number in plain words. Translate AU into lunar distances or km, and a probability into "1 in N".
2. Honest about risk: nothing currently rated above Torino 0. Don't dramatize.
3. The 3D view is for orientation, and the data panel carries the facts.
4. Live data over curated snapshots.
