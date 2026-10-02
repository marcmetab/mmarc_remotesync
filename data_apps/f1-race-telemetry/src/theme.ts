import type { MetabaseTheme } from "@metabase/embedding-sdk-react";

import { SANS, T } from "./lib/tokens";

/**
 * Styles SDK-rendered charts only — the app's own chrome is styled inline.
 * `background` must match the card the chart sits in, and `text-primary` must
 * contrast with it, or labels render invisible.
 */
export const sdkTheme: MetabaseTheme = {
  colors: {
    brand: T.accent,
    "brand-hover": "rgba(255, 77, 77, 0.24)",
    "brand-hover-light": "rgba(255, 77, 77, 0.14)",
    positive: T.green,
    negative: T.accent,
    charts: [T.blue, T.green, T.accent, T.amber, T.purple, T.cyan],
    background: T.cardBg,
    "background-secondary": T.cardBgRaised,
    "text-primary": T.text,
    "text-secondary": T.textDim,
    "text-tertiary": T.textFaint,
  },
  fontFamily: SANS,
};
