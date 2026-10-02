---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface: Asteroid Explorer (whole app, /apps/asteroid-explorer)

Mode: Experience (the plate leads), with an Operate-grade inspection panel.
Audience: curious non-experts. Job: find an asteroid, see where it is and how its orbit meets Earth's, understand size / closeness / danger / story. Compare one or several.
Constraints: data only via Metabase queries (2,000-row cap, split queries); sandbox blocks storage, global key listeners, history, dialogs. Honest risk: everything is Torino 0 today.

## Direction contract

THESIS: Asteroids were discovered by comparing two glass plates of the same sky; the app is that observatory light box, live. It refuses the glowing-dark-space viewer with a data sidebar.

OWN-WORLD: Pale milky backlit glass (#e9ebe6) with a soft vignette; the image is a negative: asteroids dark specks, the Sun a dark burned disc, planet orbits graphite hairlines. Observer's ink: blue-black (#1f3a8a) for annotations, red (#c8321e) only for the circled selection. Panels are typed plate-sleeve envelopes (off-white card stock, typewriter-style labels, plate numbers). Selected orbits solid ink; all other orbits dashed pencil.

STORY: The visitor sees the whole hazardous population on one plate, blinks between two dates and watches the asteroids jump, circles one or several, reads each sleeve in plain words (as big as…, closest pass…, odds 1 in N…, found in…), and leaves knowing whether it is dangerous.

FIRST VIEWPORT: Plate fills the viewport. Top-left: hand-lettered plate title and date stamp. Bottom edge: the time rail (ticks for the selected objects' close approaches, tick height = closeness, dashed = past). Right: stack of sleeves, empty state invites "circle an asteroid" plus search. Primary action: click a speck or search.

FORM: The Discovery Plate (candidate 6 of 7 on my resonance list: planetarium dome, orrery, star atlas, museum specimen labels, almanac ephemeris, discovery plates, trajectory drawings). Seed key 1ea6eb51. Signature interaction: BLINK, a toggle that alternates the plate between two dates (now vs. +N days), so moving objects jump while the planets barely move. Raises: time rail with line-form state (from emission-line rail), solid/dashed selection (from sewing pattern), rolling distance counter (from nixie).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
