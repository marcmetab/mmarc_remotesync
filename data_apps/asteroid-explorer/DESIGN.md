---
name: Asteroid Explorer
description: The whole hazardous population on one glass plate, circled in red and read in plain words.
colors:
  observer-ink: "#1f3a8a"
  selection-red: "#c8321e"
  plate-glass: "#e9ebe6"
  plate-glass-edge: "#cdd3cc"
  plate-glass-core: "#f4f5f1"
  speck: "#16181a"
  sun-burn: "#0f1112"
  pencil-graphite: "#8a908c"
  pencil-graphite-dark: "#4a4f4c"
  label-wash: "rgba(233, 235, 230, 0.82)"
  sleeve-stock: "#f6f3ea"
  sleeve-stock-edge: "#e4ded0"
  sleeve-rule: "#d3ccbb"
  field-paper: "#fffdf7"
  sleeve-text: "#23262a"
  sleeve-text-soft: "#565b61"
typography:
  display:
    fontFamily: "\"Cedarville Cursive\", \"Snell Roundhand\", cursive"
    fontSize: "46px"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "\"Courier Prime\", \"Courier New\", monospace"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\""
  title:
    fontFamily: "\"Courier Prime\", \"Courier New\", monospace"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  title-section:
    fontFamily: "\"Courier Prime\", \"Courier New\", monospace"
    fontSize: "14px"
    fontWeight: 700
  body:
    fontFamily: "\"Atkinson Hyperlegible\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.45
  body-soft:
    fontFamily: "\"Atkinson Hyperlegible\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label-stamp:
    fontFamily: "\"Courier Prime\", \"Courier New\", monospace"
    fontSize: "14.5px"
    fontWeight: 400
    letterSpacing: "0.03em"
  label:
    fontFamily: "\"Courier Prime\", \"Courier New\", monospace"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.06em"
  label-axis:
    fontFamily: "\"Courier Prime\", \"Courier New\", monospace"
    fontSize: "10px"
    fontWeight: 400
rounded:
  hairline: "2px"
  control: "3px"
  card: "4px"
  mark: "50%"
spacing:
  xs: "4px"
  sm: "6px"
  md: "12px"
  lg: "16px"
  xl: "22px"
components:
  rail-button:
    backgroundColor: "rgba(246, 243, 234, 0.9)"
    textColor: "{colors.observer-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  rail-button-pressed:
    backgroundColor: "{colors.observer-ink}"
    textColor: "{colors.sleeve-stock}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  search-input:
    backgroundColor: "{colors.field-paper}"
    textColor: "{colors.sleeve-text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "38px"
  suggestion-chip:
    backgroundColor: "transparent"
    textColor: "{colors.observer-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
  suggestion-chip-hover:
    backgroundColor: "{colors.sleeve-stock-edge}"
    textColor: "{colors.observer-ink}"
  plate-sleeve:
    backgroundColor: "{colors.sleeve-stock}"
    textColor: "{colors.sleeve-text}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "22px 20px 20px"
    width: "400px"
  search-card:
    backgroundColor: "{colors.sleeve-stock}"
    textColor: "{colors.sleeve-text}"
    rounded: "{rounded.card}"
    padding: "14px 16px 16px"
  selection-mark:
    textColor: "{colors.selection-red}"
    typography: "{typography.title-section}"
    rounded: "{rounded.mark}"
    size: "30px"
---

# Design System: Asteroid Explorer

## Overview

**Creative North Star: "The Discovery Plate"**

Asteroids were found by comparing two glass photographic plates of the same patch of sky, and looking for the dots that had moved. The app is that observatory light box, running live. The whole screen is a pale backlit negative: asteroids print as dark specks, the Sun as a dark burned disc, and planet orbits as graphite pencil. An observer has worked on this plate in two inks: blue-black for annotations and red for circling a find. The data sits in plate sleeves, off-white card-stock envelopes with typed labels, stacked at the plate's right edge.

The world deliberately turns down the usual glowing-dark-space viewer with a data sidebar. Depth comes from paper and light, not from glow. The plate is dense (about 2,549 specks), and everything else is sparse and legible, so the page reads like a working astronomer's desk rather than a dashboard. BLINK is the signature move. It swaps the plate between two dates 30 days apart, so the asteroids jump while the planets barely move.

**Key Characteristics:**
- A light-box negative: pale milky glass with a soft vignette, dark objects, no glow anywhere.
- Two inks. Blue-black annotates and red circles. Graphite pencil carries context.
- Three voices: the observer's handwriting on the glass, typed labels for every measurement and heading, and hyperlegible prose for explanations.
- Card-stock sleeves are the only raised surfaces.
- Solid means present and chosen. Dashed means past, reference, or provisional.

## Colors

The palette is a photographic negative on a light box, annotated in two inks. It has one cool blue-black primary, one red reserved for a single job, and warm paper and cool glass neutrals.

### Primary
- **Observer's Blue-Black Ink** (observer-ink): all annotation. Selected orbits, the Earth–asteroid sight lines, the blink trail, Earth and its orbit, the plate title and date stamp, section headings, the distance numeral, the distance curve, rail ticks, the pressed rail button, focus rings, the caret and text selection.

### Secondary
- **Circling Red** (selection-red): only for selection marks. That covers the ring around a circled speck, its letter A–D, the mark letter in a sleeve label and sleeve header, and the letter over each rail tick.

### Neutral
- **Backlit Glass** (plate-glass), **Glass Core** (plate-glass-core) and **Glass Falloff** (plate-glass-edge): the light box, drawn as one radial vignette (ellipse 80% × 90% at 42% 45%, core → glass at 48% → falloff at 100%).
- **Speck** (speck): an asteroid on the negative, a soft-edged photographic grain at 0.8 opacity.
- **Sun Burn** (sun-burn): the overexposed Sun, a burned disc.
- **Pencil Graphite** (pencil-graphite): dashed planet orbits, secondary control borders, dashed chip borders and the thin scrollbar.
- **Dark Graphite** (pencil-graphite-dark): planet bodies and labels, rail ticks and year labels, the plate-date line in charts, hover rings, and explanatory prose on the glass.
- **Label Wash** (label-wash): a translucent glass-coloured backing behind any text written on the plate, so ink stays legible over specks.
- **Sleeve Stock**, **Stock Edge**, **Sleeve Rule** (sleeve-stock, sleeve-stock-edge, sleeve-rule): card stock, its hover and pressed tone, and the ruled lines that divide a sleeve.
- **Field Paper** (field-paper): the brighter paper inside the search field.
- **Sleeve Text** and **Soft Text** (sleeve-text, sleeve-text-soft): main and secondary reading text on the card stock.

### Named Rules
**The Red Ink Rule.** Red marks a selection and does nothing else. Warnings, danger, errors, emphasis, hover and pressed states never use it. If red appears somewhere nothing is circled, it is a bug.

**The Negative Rule.** Objects print dark on pale glass. No light-on-dark, no bloom, no glow halos. Brightness means empty glass.

**The Two Inks Rule.** Anything the observer wrote uses blue-black ink, and anything the sky or the instrument supplies uses graphite. New annotation colors don't get added. A new meaning goes into line form (solid, dashed, dotted) or type voice instead.

## Typography

**Display Font:** Cedarville Cursive (with Snell Roundhand, cursive)
**Body Font:** Atkinson Hyperlegible (with Segoe UI, system-ui, sans-serif)
**Label/Mono Font:** Courier Prime (with Courier New, monospace)

**Character:** The observer's quick hand on the glass, a typewriter on the sleeve labels, and a face built for readers who confuse similar letters, used for every explanation. Mono carries the lab-record tone. Atkinson keeps the plain-language sentences easy to read.

### Hierarchy
- **Display** (400, 46px, 1.1; 30px under 860px): the plate title only, lettered in ink directly on the glass.
- **Headline** (Courier Prime 700, 34px, tabular numerals): the live distance numeral in a sleeve. It rolls like an odometer.
- **Title** (Courier Prime 700, 20px, −0.01em, balanced wrap): an asteroid's name at the head of its sleeve.
- **Title-section** (Courier Prime 700, 14px): typed sleeve section headings ("How big", "How close it gets", "Is it dangerous", "Its story") and the search prompt.
- **Body** (Atkinson 400, 15.5px, 1.45, pretty wrap): plain-language facts in sleeves. The same face at 14.5px/1.55 captions the plate, capped at 50ch.
- **Body-soft** (Atkinson 400, 14px, 1.45, soft text): caveats, sources and how-to-read lines.
- **Label-stamp** (Courier Prime 400, 14.5px, 0.03em): the plate's date stamp ("Plate of 23 Sept 2026").
- **Label** (Courier Prime 400, 12px, 0.06em for uppercase controls): rail buttons (BLINK, TODAY), suggestion chips, the sleeve's typed header line, and planet names (11px, 0.04em, uppercase).
- **Label-axis** (Courier Prime 400, 10px): year labels on the rail and mark letters over ticks (700).

### Named Rules
**The Typed Record Rule.** Numbers, designations, dates, headings and control labels are typed in Courier Prime. Sentences that explain something are in Atkinson. The hand appears once, in the plate title.

**The Inlined Face Rule.** Every face ships inside the bundle as an `@font-face` rule with a base64 `data:` URL, injected through a `<style>` element. The Metabase data-app sandbox blocks network fetches and the FontFace API, so a font that isn't inlined falls back to the system face.

## Layout

The plate fills the viewport (100vh, overflow hidden) and the rest floats on it. The title lettering sits top-left (16px from the top, 26px from the left, at most 540px wide). The time rail runs along the bottom edge (26px in from the left, 18px up, stopping 440px from the right). The sleeve dock is a 400px column 16px in from the top, right and bottom. It scrolls on its own, and only its cards take pointer events, so the plate stays draggable between them. When sleeves are open, the 3D camera's projection moves left by a view offset of 432px, so the scene stays centred in the visible glass without breaking picking or label alignment.

The spacing rhythm is small and paper-like: 4 and 6px inside labels and small groups, 12px between stacked sleeves and in headers, 14px between sleeve sections, 16px dock gutters and card padding, and 20–22px sleeve padding.

Under 860px the page stacks: the plate becomes a 64vh block, the rail sits just below it, and the sleeves follow in normal flow. The title drops to 30px, the caption is hidden, and minor (five-year) rail labels are dropped.

## Elevation & Depth

The plate has no elevation of its own. Its depth is photographic, coming from the vignette, grain opacity and the 3D perspective. Only card stock is raised, and it's raised once, with a soft two-layer warm shadow and no border.

### Shadow Vocabulary
- **Sleeve lift** (`box-shadow: 0 1px 2px rgba(40, 36, 28, 0.10), 0 10px 24px -12px rgba(40, 36, 28, 0.35)`): the plate sleeves and the search card, and nothing else.

### Named Rules
**The Declared-Once Rule.** A raised surface gets the sleeve shadow or nothing. Never add a border on top of it, stack a second shadow, or invent an in-between elevation step.

## Shapes

Shapes are nearly square, like a paper record. Card stock uses 4px corners, controls and fields 3px, and the rail 2px. The one true circle is the selection mark, a 1.8px red ring around a speck (radius 15) or a 30px mark medallion in the sleeve header. Line form carries meaning. Solid ink is for present, chosen things (selected orbits, upcoming close passes, the current date line). Dashed or dotted strokes are for the past, references and provisional things (past rail ticks, the reference-object size bar, the plate-date line in charts, the hover ring, planet orbits, today's dotted marker, the Earth-to-asteroid sight line and the blink trail).

**The Specks-Only Rule.** Unselected asteroids get a speck and nothing else. Their orbits are never drawn, because 2,549 dashed ellipses would bury the plate. An asteroid's orbit is drawn only after it's circled, in solid ink (2.2px).

**The Past-Is-Dashed Rule.** On any mark that exists in both a solid and a dashed form, dashed means already happened, only a reference, or not the real thing yet. Don't use dashing as decoration.

## Components

### Rail Buttons
Typed, uppercase and quiet, like switches on the light box.
- **Shape:** 3px corners, 30px tall, 12px side padding, 1px graphite border.
- **Default:** translucent card stock with ink text or a 14px solid SVG glyph (play/pause).
- **Pressed (aria-pressed):** filled with ink and stock text. Used for Run and BLINK.
- **Hover:** the border turns ink. **Focus:** 2px ink outline, offset 2px.

### Suggestion Chips
- **Style:** transparent, with a 1px dashed graphite border, 3px corners, ink text in 12px Courier Prime. They're dashed because they're suggestions and not yet chosen.
- **Hover:** fills with Stock Edge.

### Search Field
- **Style:** Field Paper, 1px Sleeve Rule border, 3px corners, 38px tall, 15px Atkinson text, soft-text placeholder, ink caret.
- **Focus:** 2px ink outline, offset 2px. Results are borderless rows that fill with Stock Edge on hover and fade to 0.55 opacity when disabled (all four marks used).

### Plate Sleeve (signature)
An acid-free envelope for one circled asteroid.
- **Corner / Background / Shadow:** 4px corners, Sleeve Stock background, the sleeve lift, no border.
- **Typed label line:** 12px Courier Prime soft text, ruled underneath: "Plate ‹date› · mark ‹A›" on the left, "No. ‹catalogue›" on the right. The mark letter is red.
- **Header:** the 30px red ring medallion with its letter, the name in Title type, and the provisional designation in ink followed by the class in soft prose. A 30px borderless remove control with an SVG cross.
- **Distance odometer:** a 34px ink numeral whose digits roll (420ms, cubic-bezier(0.16, 1, 0.3, 1)), followed by "× the Moon's distance…" and a soft km line.
- **Sections:** separated by a 1px top rule and 14px padding, each with a typed ink heading. The mini charts share the sleeve's inks. Solid ink is the measured value and dashed graphite the reference. Distance is on a log scale in Moon distances, and stock-filled ink rings mark JPL close passes.
- **Entry:** slides in 28px from the right, unblurring from 3px, over 520ms. Turned off under prefers-reduced-motion.

### Time Rail
A calibrated graphite hairline covering 20 years back and 30 ahead. Ticks mark every five years, taller each decade. The circled asteroids' close approaches rise above it as ink ticks. A taller tick is a closer pass (log scale), dashed ticks are past passes, and each tick has a red mark letter on top that jumps to that date when clicked. A dotted graphite marker shows today, and a solid 2px ink needle shows the plate's date. It's a keyboard slider: arrows move a day, Page keys a month, Shift a year, Home returns to today.

### Selection Mark (on the plate)
An HTML overlay that follows the projected position each frame. It's a 1.8px red ring (r=15), a red 13px bold letter above right, and the name in 12px ink Courier on a label wash below right. Hovering an uncircled speck shows a dashed graphite ring (r=10) and its name in graphite.

### Plate Canvas
The WebGL canvas is mounted inside a shadow root on its host element. OrbitControls attaches keydown listeners to the canvas's root node, the sandbox blocks global key listeners, and a shadow root makes itself that root node. Any new 3D surface mounts the same way.

## Do's and Don'ts

### Do:
- **Do** keep red for selection marks alone: rings, mark letters, and the mark on sleeve labels and rail ticks.
- **Do** print new sky objects dark on the glass, as grain sprites or ink lines, and put a label wash behind any text written on the plate.
- **Do** type every measurement, designation, date and heading in Courier Prime, and write explanations in Atkinson Hyperlegible.
- **Do** tell present from past or reference by line form, solid versus dashed, and not by adding colors.
- **Do** raise card stock only with the sleeve lift, and keep corners at 4px (cards), 3px (controls) or 2px (rail).
- **Do** inline any new font as an `@font-face` data URL, and mount any new canvas inside a shadow root.

### Don't:
- **Don't** draw orbits for unselected asteroids. The population is specks only.
- **Don't** use red for danger, warnings, errors or emphasis. Honest risk wording is plain ink prose.
- **Don't** add glow, bloom, light-on-dark space backgrounds or neon accents. The plate is a negative.
- **Don't** give a raised surface a border as well as its shadow, or add a second elevation level.
- **Don't** use the handwritten face anywhere but the plate title.
- **Don't** load fonts or assets from the network, or register them through the FontFace API. The sandbox blocks both.
