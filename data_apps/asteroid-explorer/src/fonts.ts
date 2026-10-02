// Fonts are inlined into the bundle: the sandbox blocks fetching them from anywhere else.
import atkinson400 from "@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2?inline";
import atkinson700 from "@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2?inline";
import courier400 from "@fontsource/courier-prime/files/courier-prime-latin-400-normal.woff2?inline";
import courier700 from "@fontsource/courier-prime/files/courier-prime-latin-700-normal.woff2?inline";
import cedarville from "@fontsource/cedarville-cursive/files/cedarville-cursive-latin-400-normal.woff2?inline";

// Prose: Atkinson Hyperlegible (made for readers who struggle with look-alike letters).
// Plate labels and measurements: Courier Prime, the typed sleeve label.
export const PROSE = '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif';
export const TYPED = '"Courier Prime", "Courier New", monospace';
// The observer's hand: ink lettering written straight onto the plate.
export const HAND = '"Cedarville Cursive", "Snell Roundhand", cursive';

const faces: [string, string, number][] = [
  ["Atkinson Hyperlegible", atkinson400, 400],
  ["Atkinson Hyperlegible", atkinson700, 700],
  ["Courier Prime", courier400, 400],
  ["Courier Prime", courier700, 700],
  ["Cedarville Cursive", cedarville, 400],
];

// @font-face rules for a <style> element (the sandbox blocks the FontFace API).
export const FONT_CSS = faces
  .map(([family, src, weight]) => `@font-face { font-family: "${family}"; src: url(${src}) format("woff2"); font-weight: ${weight}; font-style: normal; font-display: swap; }`)
  .join("\n");
