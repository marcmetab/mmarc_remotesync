import type { MetabaseTheme } from "@metabase/embedding-sdk-react";
import { createContext } from "react";

/** The app's two looks: Golden Hour (light) and Golden Hour at dusk (dark). Set on the .pd-app root as data-theme. */
export type ThemeName = "light" | "dark";

/**
 * The look in use, for what must redraw when it changes (the Shell provides it). Everything styled by CSS follows
 * data-theme without it; only what bakes the tokens' values in (the World map's terrain image) reads it.
 */
export const ThemeContext = createContext<ThemeName>("light");

/**
 * The viewer's system preference (prefers-color-scheme), "light" when it cannot be read (no window in the
 * static preview, or the sandbox refuses matchMedia).
 */
export function systemTheme(): ThemeName {
  try { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } catch { return "light"; }
}

/**
 * Golden Hour in light, as hex. Mirrors the light values in src/styles/tokens.css. Only for what cannot
 * read a CSS variable: the Metabase SDK theme and the colours handed to a Metabase chart (Explore).
 * Everything drawn by the app itself uses `palette`.
 */
export const lightPalette = {
  page: "#fdfbf9",
  surface: "#fdfbf9",
  sidebar: "#f6f1ed",
  stone: "#f6f1ed",
  group: "#f8f4f0",
  track: "#f0e8e2",
  segment: "#e9e0d9",
  raised: "#fdfbf9",
  hover: "#efe8e2",
  border: "#e2d8d1",
  hairline: "#ece3dd",
  rowLine: "#f0e8e2",
  grid: "#e4d8d0",
  ink: "#3a2230",
  inkSoft: "#5a4550",
  muted: "#6f5a64",
  faint: "#b9a8ae",
  pumpkinLight: "#f08a3c",
  pumpkin: "#e2681c",
  pumpkinDeep: "#d9601c",
  pumpkinIcon: "#c2531a",
  severe: "#b5441a",
  terracotta: "#a8440f",
  terracottaDeep: "#8a360a",
  terracottaDark: "#7c2f08",
  blush: "#f9e6d6",
  blushDeep: "#f9dcc2",
  peach: "#f5dccb",
  selected: "#fbeee2",
  selectedRing: "#e7a67c",
  amber: "#f5e3cd",
  amberInk: "#74440c",
  candle: "#e3a047",
  incoming: "#e9b184",
  olive: "#5f6d2c",
  leaf: "#6c7a36",
  meadow: "#8f9a4e",
  oliveWash: "#e9ebd3",
  oliveInk: "#46521d",
  oliveSoft: "#eef0dc",
  plum: "#4a2638",
  plumHill: "#5b3445",
  cream: "#fbe3cf",
  rose: "#a8667a",
  sky: "#f8e0d3",
  onSevere: "#ffffff",
  onOlive: "#ffffff",
} as const;

export type PaletteKey = keyof typeof lightPalette;

/** Golden Hour at dusk, as hex: the dark values in src/styles/tokens.css, for the same uses as `lightPalette`. */
export const darkPalette: { readonly [K in PaletteKey]: string } = {
  page: "#1e1317",
  surface: "#22161a",
  sidebar: "#170e11",
  stone: "#2e2126",
  group: "#291c21",
  track: "#3a2b31",
  segment: "#382930",
  raised: "#4d3a42",
  hover: "#30232a",
  border: "#54424a",
  hairline: "#3d2e35",
  rowLine: "#33252b",
  grid: "#45353c",
  ink: "#f7ebe4",
  inkSoft: "#dfcdc8",
  muted: "#b9a5a8",
  faint: "#7a666e",
  pumpkinLight: "#f8a060",
  pumpkin: "#f0823a",
  pumpkinDeep: "#ea7634",
  pumpkinIcon: "#f59a5c",
  severe: "#c44f28",
  terracotta: "#ee8a68",
  terracottaDeep: "#ffc6a6",
  terracottaDark: "#ffb08a",
  blush: "#36201d",
  blushDeep: "#47271f",
  peach: "#45251d",
  selected: "#3e2a26",
  selectedRing: "#b8714d",
  amber: "#3f2f1c",
  amberInk: "#f2c98d",
  candle: "#e9ad5c",
  incoming: "#e8b088",
  olive: "#b0bf68",
  leaf: "#a3b35d",
  meadow: "#8e9a52",
  oliveWash: "#2f3419",
  oliveInk: "#cfdb95",
  oliveSoft: "#262b17",
  plum: "#dcb3c6",
  plumHill: "#9d7a8b",
  cream: "#2a1820",
  rose: "#cf8aa0",
  sky: "#3b2830",
  onSevere: "#ffffff",
  onOlive: "#22161a",
};

/** The hex palette of a theme. */
export const hexPalette = (theme: ThemeName) => theme === "dark" ? darkPalette : lightPalette;

/**
 * Golden Hour palette as CSS variables: `palette.plum` is "var(--pd-plum)", so a colour passed as a prop or
 * an inline style (chart marks, Meter, Legend, Swatch) follows the theme. Same names as `lightPalette`, each
 * the camelCase of its token (inkSoft → --pd-ink-soft). A variable resolves in a CSS property (style={{…}}),
 * not in an SVG presentation attribute: put SVG colours in `style` (`style={{ stroke: palette.plum }}`).
 */
export const palette = Object.fromEntries(
  Object.keys(lightPalette).map(key => [key, `var(--pd-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)})`]),
) as { readonly [K in PaletteKey]: string };

/** One color per variety, as in the mockups (Mix, Cargo, stock bars). */
export const varietyColor = { Carving: palette.pumpkinDeep, Cooking: palette.candle, Mini: palette.olive } as const;

export const serif = `"Young Serif", Georgia, "Times New Roman", serif`;
export const sans = `"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif`;

/* ── The Metabase SDK theme ──────────────────────────────── */

/**
 * The theme the Metabase SDK draws in: the viewer's system preference when the app loads. The SDK takes its
 * theme once, from the factory's providerProps (src/index.tsx), so it cannot follow the in-app switch. When
 * the switch moves away from it, src/pages/explore/sdk-theme.css repaints the Metabase question in the other
 * theme (the wrapper around a question carries this value as data-sdk-theme).
 */
export const sdkLoadTheme: ThemeName = systemTheme();

/**
 * Chart colours, in Metabase's order for a question's series (pumpkin, plum, olive, candle, rose, rust,
 * meadow, dusty pink). Dark: the dusk tokens, light enough to read on the dark surface.
 */
export function chartColors(theme: ThemeName): string[] {
  const c = hexPalette(theme);
  return [c.pumpkin, c.plum, c.olive, c.candle, c.rose, theme === "dark" ? "#de8a5f" : "#c9683c", c.meadow, "#d6a39b"];
}

/**
 * Golden Hour as a Metabase SDK theme, on Metabase's own light or dark preset. Its surface is the app's
 * surface (a card or panel: the page itself in light, a step above it in dark), the summarize and filter
 * steps of the query editor are olive and plum instead of Metabase's green and violet, and its series
 * colours are `chartColors`.
 */
export function sdkThemeFor(theme: ThemeName): MetabaseTheme {
  const c = hexPalette(theme);
  return {
    preset: theme,
    colors: {
      brand: c.terracotta,
      "brand-hover": c.blush,
      "brand-hover-light": c.selected,
      positive: c.olive,
      negative: c.severe,
      summarize: c.olive,
      filter: c.plumHill,
      charts: chartColors(theme),
      border: c.border,
      background: c.surface,
      "background-secondary": c.stone,
      "background-hover": theme === "dark" ? c.hover : "#f1e9e3",
      "text-primary": c.ink,
      "text-secondary": c.inkSoft,
      "text-tertiary": c.muted,
    },
    // A chart's tooltip in plum (raised plum at dusk) instead of Metabase's slate.
    components: {
      tooltip: theme === "dark"
        ? { backgroundColor: c.raised, focusedBackgroundColor: "#5e4852", textColor: c.ink, secondaryTextColor: c.inkSoft }
        : { backgroundColor: c.plum, focusedBackgroundColor: c.plumHill, textColor: c.page, secondaryTextColor: c.cream },
    },
    fontFamily: sans,
  };
}

/** The SDK theme the app loads with (src/index.tsx hands it to the host). */
export const sdkTheme: MetabaseTheme = sdkThemeFor(sdkLoadTheme);
