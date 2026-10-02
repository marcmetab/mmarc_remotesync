import type { MetabaseTheme } from "@metabase/embedding-sdk-react";

import { INK, SLEEVE } from "./palette";

// SDK widgets (none are rendered today) would sit on sleeve card stock and speak in observer's ink.
export const sdkTheme: MetabaseTheme = {
  colors: {
    brand: INK,
    "brand-hover": "#e6eaf5",
    "brand-hover-light": "#e6eaf5",
    positive: INK,
    charts: [INK, "#4a4f4c", "#7a5c1e"],
    background: SLEEVE.stock,
    "background-secondary": SLEEVE.stockEdge,
    "text-primary": SLEEVE.text,
    "text-secondary": SLEEVE.textSoft,
    "text-tertiary": SLEEVE.textSoft,
  },
  fontFamily: '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif',
};
