// Data apps run in an embedded sandbox, so fonts are inlined into the bundle.
import titillium400 from "@fontsource/titillium-web/files/titillium-web-latin-400-normal.woff2?inline";
import titillium600 from "@fontsource/titillium-web/files/titillium-web-latin-600-normal.woff2?inline";
import titillium700 from "@fontsource/titillium-web/files/titillium-web-latin-700-normal.woff2?inline";
import oxanium600 from "@fontsource/oxanium/files/oxanium-latin-600-normal.woff2?inline";
import oxanium700 from "@fontsource/oxanium/files/oxanium-latin-700-normal.woff2?inline";
import barlow600i from "@fontsource/barlow-condensed/files/barlow-condensed-latin-600-italic.woff2?inline";
import barlow700i from "@fontsource/barlow-condensed/files/barlow-condensed-latin-700-italic.woff2?inline";
import barlow800i from "@fontsource/barlow-condensed/files/barlow-condensed-latin-800-italic.woff2?inline";

export const FONT_CSS = [
  ["Titillium Web", titillium400, 400, "normal"],
  ["Titillium Web", titillium600, 600, "normal"],
  ["Titillium Web", titillium700, 700, "normal"],
  ["Oxanium", oxanium600, 600, "normal"],
  ["Oxanium", oxanium700, 700, "normal"],
  // Race Replay's broadcast HUD.
  ["Barlow Condensed", barlow600i, 600, "italic"],
  ["Barlow Condensed", barlow700i, 700, "italic"],
  ["Barlow Condensed", barlow800i, 800, "italic"],
]
  .map(
    ([family, source, weight, style]) =>
      `@font-face { font-family: "${family}"; src: url(${source}) format("woff2"); font-style: ${style}; font-weight: ${weight}; font-display: swap; }`,
  )
  .join("\n");
