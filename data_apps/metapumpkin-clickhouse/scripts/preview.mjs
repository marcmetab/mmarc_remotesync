#!/usr/bin/env node
/*
 * Static preview of one page, without Metabase.
 *
 *   node scripts/preview.mjs <PageName> [--width 1440] [--state '<json>'] [--scope '<json>'] [--theme light|dark]
 *
 *   <PageName>   Business | Fleet | Truck | Stores | City | Store | World | Explore | DataFlow  (src/pages/<PageName>Page.tsx, which
 *                exports `<PageName>Page`, with its fixture src/fixtures/<pagename>.ts, which exports
 *                `fixture` and optionally `fixtureFor(scope)`)
 *   --width      the width you are going to look at it in (default 1440). The page is responsive through
 *                CSS, so from 500 up this only names the output file and the window decides. Under 500
 *                (a phone) the output is a wrapper holding the page in a frame of exactly that width,
 *                because headless Chrome cannot make a window narrower than 500px: it would lay the
 *                page out at 500 and crop the picture.
 *   --state      JSON passed to the page as its `initial` prop: the starting values of the page's own
 *                useState (which tab, which city is open). Its `period` (City and Store) also sets the
 *                top bar's time switch, e.g. '{"period":"7d"}'
 *   --scope      JSON for the shell's region and country, e.g. '{"region":"EU","country":"DE"}'
 *                (default: all regions)
 *   --theme      light (default) or dark: the Shell's theme (data-theme on the root). A dark preview is
 *                written with a "-dark" suffix, so both sit side by side: .preview/business-1440-dark.html
 *
 * It bundles the page and its fixture with esbuild, renders them inside the Shell with react-dom/server
 * (links are plain anchors through StaticNav), inlines the CSS, the two fonts and the banner art, and
 * writes one self-contained file: .preview/<pagename>-<width>[-dark].html (git-ignored). Nothing is fetched
 * from the network. It is a server render: effects and click handlers do not run, so show another
 * state with --state rather than by clicking.
 *
 * To look at it:
 *   <scratchpad>/art/shot.sh "$PWD/.preview/business-1440.html" 1440 1720 "$PWD/.preview/business-1440.png"
 * (headless Chrome: <abs html> <width> <height> <abs png>), then open the PNG. Check 1440, 820 and 390.
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(APP, "src");
const OUT = join(APP, ".preview");

const fail = message => { console.error(`preview: ${message}`); process.exit(1); };

// ---- arguments
const args = process.argv.slice(2);
let pageArg, width = 1440, state = {}, scope = { region: "all", country: null }, theme = "light";
const json = (flag, text) => { try { return JSON.parse(text); } catch { fail(`${flag} is not valid JSON: ${text}`); } };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--width") width = Number(args[++i]);
  else if (a === "--state") state = json("--state", args[++i]);
  else if (a === "--scope") scope = { ...scope, ...json("--scope", args[++i]) };
  else if (a === "--theme") theme = args[++i];
  else if (a.startsWith("--")) fail(`unknown option ${a}`);
  else pageArg = a;
}
if (!pageArg) fail("usage: node scripts/preview.mjs <PageName> [--width 1440] [--state '<json>'] [--scope '<json>'] [--theme light|dark]");
if (!Number.isFinite(width) || width <= 0) fail("--width must be a number");
if (theme !== "light" && theme !== "dark") fail("--theme must be light or dark");

// ---- page, fixture, route
// Page name → the tab it sits under and the path the shell should treat as current.
const PAGES = {
  Business: { tab: "business", path: "/" },
  Fleet: { tab: "fleet", path: "/fleet" },
  Truck: { tab: "fleet", path: "/fleet/truck/PK-US-107" },
  Stores: { tab: "stores", path: "/stores" },
  City: { tab: "stores", path: "/stores/city/US-new-york" },
  Store: { tab: "stores", path: "/stores/store/13" },
  World: { tab: "world", path: "/world" },
  Explore: { tab: "explore", path: "/explore" },
  DataFlow: { tab: "flow", path: "/data-flow" },
};
const bare = pageArg.replace(/Page$/, "");
const name = bare.charAt(0).toUpperCase() + bare.slice(1);
const lower = name.toLowerCase();
// A page outside the nine (a scratch page) previews under the tab named by --state '{"tab":"fleet"}', else Business.
const meta = PAGES[name] ?? { tab: typeof state.tab === "string" ? state.tab : "business", path: "/" };
const pageFile = join(SRC, "pages", `${name}Page.tsx`);
const fixtureFile = ["ts", "tsx"].map(ext => join(SRC, "fixtures", `${lower}.${ext}`)).find(existsSync);
if (!existsSync(pageFile)) fail(`no page at src/pages/${name}Page.tsx`);
if (!fixtureFile) fail(`no fixture at src/fixtures/${lower}.ts`);

// ---- bundle: one JS module that exports the rendered markup, and the CSS it imports
const entry = `
import { renderToStaticMarkup } from "react-dom/server";
import { Shell } from "./components/Shell";
import { StaticNav } from "./nav";
import { shellFixture } from "./fixtures/shell";
import * as pageModule from ${JSON.stringify(pageFile)};
import * as fixtureModule from ${JSON.stringify(fixtureFile)};

const scope = ${JSON.stringify(scope)};
const Page = pageModule[${JSON.stringify(`${name}Page`)}] ?? pageModule.default;
if (!Page) throw new Error(${JSON.stringify(`src/pages/${name}Page.tsx must export ${name}Page`)});
const vm = typeof fixtureModule.fixtureFor === "function" ? fixtureModule.fixtureFor(scope) : fixtureModule.fixture ?? fixtureModule.default;
if (vm === undefined) throw new Error(${JSON.stringify(`src/fixtures/${lower}.ts must export fixture`)});
const noop = () => {};

export const html = renderToStaticMarkup(
  <StaticNav pathname={${JSON.stringify(meta.path)}}>
    <Shell active={${JSON.stringify(meta.tab)}} scope={scope} onScope={noop} clock={shellFixture.clock} lateVans={shellFixture.lateVans} theme={${JSON.stringify(theme)}}${typeof state.period === "string" ? ` period={${JSON.stringify(state.period)}}` : ""}>
      <Page vm={vm} scope={scope} onScope={noop} clock={shellFixture.clock} initial={${JSON.stringify(state)}}/>
    </Shell>
  </StaticNav>
);
`;

// The pages never import the SDK; nav.tsx does (for the live router). Here it resolves to an inert stand-in.
const sdkStub = {
  name: "sdk-stub",
  setup(b) {
    b.onResolve({ filter: /^@metabase\/embedding-sdk-react(\/|$)/ }, a => ({ path: a.path, namespace: "sdk-stub" }));
    b.onLoad({ filter: /.*/, namespace: "sdk-stub" }, () => ({
      loader: "js",
      contents: `module.exports = new Proxy({}, { get: (_, key) => key === "__esModule" ? false : () => null });`,
    }));
  },
};

let result;
try {
  result = await build({
    stdin: { contents: entry, resolveDir: SRC, sourcefile: "preview-entry.tsx", loader: "tsx" },
    bundle: true,
    write: false,
    outdir: OUT,
    platform: "node",
    format: "esm",
    target: "node18",
    jsx: "automatic",
    // React stays external so the page and react-dom/server share one copy (resolved from node_modules).
    external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
    // Art and fonts become data URIs, as they do in the real bundle: the HTML needs no other file.
    loader: { ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl", ".png": "dataurl", ".jpg": "dataurl" },
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [sdkStub],
    logLevel: "warning",
    // The entry probes optional exports (default, fixtureFor); a missing one is expected.
    logOverride: { "import-is-undefined": "silent" },
  });
} catch {
  process.exit(1); // esbuild has already printed what is wrong
}
const js = result.outputFiles.find(f => f.path.endsWith(".js"));
const css = result.outputFiles.filter(f => f.path.endsWith(".css")).map(f => f.text).join("\n");

// ---- render
mkdirSync(OUT, { recursive: true });
const modulePath = join(OUT, `.render-${lower}-${process.pid}.mjs`);
writeFileSync(modulePath, js.text);
let html;
try {
  ({ html } = await import(pathToFileURL(modulePath).href));
} catch (error) {
  console.error(`preview: ${name}Page threw while rendering\n`, error);
  process.exitCode = 1;
} finally {
  rmSync(modulePath, { force: true });
}
if (html === undefined) process.exit(1);

const stem = `${lower}-${width}${theme === "dark" ? "-dark" : ""}`;
const file = join(OUT, `${stem}.html`);
// The page's own ground behind the app (the dark page under a dark preview), and the frame's around it.
const ground = theme === "dark" ? "#1e1317" : "#fdfbf9";
// Headless Chrome's narrowest window. Below it the page goes into a frame of the asked width.
const MIN_WINDOW = 500;
const framed = width < MIN_WINDOW;
const pageFileOut = framed ? join(OUT, `${stem}.frame.html`) : file;
if (framed) writeFileSync(file, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>MetaPumpkin · ${name} · ${width}px preview</title>
<style>html, body { margin: 0; height: 100%; background: ${theme === "dark" ? "#0e090b" : "#d9d2cc"}; } iframe { display: block; width: ${width}px; height: 100%; border: 0; }</style>
</head>
<body><iframe src="./${stem}.frame.html" title="${name} at ${width}px"></iframe></body>
</html>
`);
writeFileSync(pageFileOut, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>MetaPumpkin · ${name} · preview</title>
<style>
html, body { margin: 0; background: ${ground}; }
${css}
</style>
</head>
<body>
${html}
</body>
</html>
`);
console.log(`wrote ${file}`);
