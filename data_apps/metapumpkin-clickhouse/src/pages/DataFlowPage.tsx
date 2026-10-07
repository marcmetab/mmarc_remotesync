import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import "./flow.css";
import "./flow/flow-tabs.css";
import logo from "../assets/metapumpkin.svg";
import { Icon, Panel, UnderlineTabs } from "../components/ui";
import { useNav } from "../nav";
import { FLOW_TABS, type FlowTab, routes } from "../routes";
import type { PageProps } from "../types";
import { PartsTab } from "./flow/PartsTab";
import { QueriesTab } from "./flow/QueriesTab";
import { StatTile, type TileKind } from "./flow/StatTile";
import type { DataFlowViewModel } from "./flow/types";

/*
 * Data flow (/data-flow): how a sale gets from the simulator to this app, drawn as a metro map. Four lines in the
 * app's colours: the Budapest line (the mini PC: Postgres, Debezium, Redpanda with Console on a spur, Kafka Connect),
 * the express to London, the London line (ClickHouse Cloud: raw, core, live) and, through an interchange, the
 * Metabase line (the database, the Library, the app's questions, this app). Each place is a tinted zone, each
 * station a round badge with its mark. Pumpkins ride the whole route on a loop (SVG animateMotion; the Pause button
 * or a reduced-motion setting stops them). Pressing a station, or the express, opens its card in the middle of the
 * map, which otherwise holds the key.
 *
 * The map is a 1100×560 drawing that scales with the panel; the stations are HTML buttons placed over it in %. When
 * the panel is under 860px wide (phones, tablets, a narrow window) it gives way to the same route as a vertical line,
 * one row per station, each opening in place (a container query in flow.css).
 *
 * Lines' figures are as measured on 6 October 2026 (pipeline/README.md and the ClickHouse service): it queries
 * nothing. Two more tabs read ClickHouse watching itself, live: Queries (the app's own queries, from the query log:
 * flow/QueriesTab.tsx) and Parts (the sales table's parts and merges: flow/PartsTab.tsx). Each tab is its own path
 * (routes.dataFlow), so the live container (App.tsx) polls only the open one. Sidebar row from 900px up; under it,
 * phones reach the page from the Me sheet.
 */

export type { DataFlowViewModel };
export type StationId = "postgres" | "debezium" | "redpanda" | "console" | "connect" | "express" | "raw" | "core" | "live" | "db" | "library" | "questions" | "app";
/**
 * The page's own state: Lines' open station and its paused pumpkins, and the picked run on Queries (its time and
 * hash). `tab` only seeds the static preview: live, the path picks the tab.
 */
export type DataFlowState = { selected: StationId | null; paused: boolean; tab: FlowTab; run: string };

type LineId = "budapest" | "express" | "london" | "metabase";
const LINE_NAME: Record<LineId, string> = { budapest: "Budapest line", express: "Express", london: "London line", metabase: "Metabase line" };

type Station = {
  line: LineId;
  name: string;
  /** The line under the name. */
  sub: string;
  /** The card's closing figure. */
  fact: string;
  /** The card's sentence (the list row's, when it opens). */
  text: string;
  /** Centre on the 1100×560 map. */
  x: number;
  y: number;
};

const STATIONS: Record<StationId, Station> = {
  postgres: { line: "budapest", name: "Postgres", sub: "Transactional source", fact: "Every 15 s", x: 90, y: 110,
    text: "The simulator. A ticker calls tick() every 15 s, which writes the new sales, trips and stock. Postgres 17.11 with logical WAL." },
  debezium: { line: "budapest", name: "Debezium", sub: "CDC layer", fact: "CDC layer", x: 250, y: 110,
    text: "Reads each change from the Postgres log and turns it into a Kafka message. It runs inside the Kafka Connect container." },
  redpanda: { line: "budapest", name: "Redpanda", sub: "33 Kafka topics", fact: "33 topics", x: 410, y: 110,
    text: "The Kafka broker on the mini PC: one node, one topic per published table." },
  console: { line: "budapest", name: "Console", sub: "localhost:8080", fact: "localhost:8080", x: 450, y: 200,
    text: "Redpanda Console, for watching topics and messages. Open on the mini PC only." },
  connect: { line: "budapest", name: "ClickHouse sink", sub: "Kafka Connect", fact: "Outbound only", x: 570, y: 110,
    text: "The ClickHouse sink sends each message to ClickHouse Cloud over HTTPS and saves its place every 10 s. Nothing connects in." },
  express: { line: "express", name: "Budapest → London", sub: "1.4 s median", fact: "1.4 s median", x: 770, y: 160,
    text: "From a Postgres commit in Budapest to a row in ClickHouse in London. A sale takes 8.7 s end to end, mostly waiting for the next tick." },
  raw: { line: "london", name: "pumpkin_raw", sub: "Raw / landing layer", fact: "33 landing tables", x: 820, y: 240,
    text: "One table per topic. 198k rows take 2.6 MB here, 9× smaller than the 25 MB of data." },
  core: { line: "london", name: "pumpkin_core", sub: "Transformation layer", fact: "34 views", x: 820, y: 320,
    text: "Views that drop duplicate rows and keep the simulation clock." },
  live: { line: "london", name: "pumpkin_live", sub: "26 views", fact: "26 views", x: 820, y: 400,
    text: "The views this app reads, rebuilt from the raw rows on every query." },
  db: { line: "metabase", name: "ClickHouse database", sub: "Pumpkin", fact: "Database 102", x: 820, y: 470,
    text: "Metabase database 102, connected to ClickHouse Cloud. Metabase asks it over HTTPS." },
  library: { line: "metabase", name: "Library", sub: "24 tables, 24 metrics", fact: "24 tables · 24 metrics", x: 620, y: 470,
    text: "The tables and metrics in the Metabase Library. The app’s questions are built on them." },
  questions: { line: "metabase", name: "Saved queries", sub: "41 questions", fact: "41 questions", x: 420, y: 470,
    text: "41 saved questions in the app’s collection. The app runs these." },
  app: { line: "metabase", name: "MetaPumpkin", sub: "Polls 10 s to 2 min", fact: "Polls 10 s to 2 min", x: 200, y: 470,
    text: "This app. Each panel asks again every 10 s to 2 min, and a query takes 0.1–1.2 s." },
};

/** The whole route, Postgres to this app: the path the pumpkins ride. */
const ROUTE = "M90 110 H706 Q720 110 730 120 L810 200 Q820 210 820 224 V470 H200";
/** Five pumpkins, spread evenly along the 14 s loop. */
const BEGINS = ["0s", "-2.8s", "-5.6s", "-8.4s", "-11.2s"];

/* ── Marks ───────────────────────────────────────────────── */

type GlyphId = Exclude<StationId, "express" | "app">;
const stroke = (width: number) => ({ fill: "none", stroke: "currentColor", strokeWidth: width });
/** Each station's mark on a 64 grid, in ink (currentColor); `pd-flow-hole` cuts out in the page colour. */
const GLYPHS: Record<GlyphId, ReactNode> = {
  postgres: <><ellipse cx={42} cy={31} rx={8.5} ry={11}/><ellipse cx={33} cy={29} rx={13} ry={12}/><ellipse className="pd-flow-hole" cx={42.5} cy={31.5} rx={4.2} ry={6.5}/><path d="M24 33C21 40 22 46 28 48" {...stroke(6)}/><circle className="pd-flow-hole" cx={29.5} cy={26} r={2.1}/></>,
  debezium: <><path d="M17 18H27C36 18 42 24 42 32S36 46 27 46H17Z" {...stroke(3.8)}/><path d="M24 26H44M24 32H50M24 38H44" {...stroke(3.4)}/></>,
  redpanda: <><path d="M15.5 25L19 12.5 28 19.5H36L45 12.5 48.5 25C50.5 31 49.5 38 45 43 41 47 36.5 48.5 32 48.5S23 47 19 43C14.5 38 13.5 31 15.5 25Z"/><ellipse className="pd-flow-hole" cx={25} cy={32} rx={5} ry={4}/><ellipse className="pd-flow-hole" cx={39} cy={32} rx={5} ry={4}/><circle cx={25.5} cy={32} r={1.8}/><circle cx={38.5} cy={32} r={1.8}/><path className="pd-flow-hole" d="M29 39H35L32 42.5Z"/></>,
  console: <><rect x={14} y={16} width={36} height={32} rx={6} {...stroke(4)}/><path d="M14 25H50M22 42V37M29 42V32M36 42V35M43 42V30" {...stroke(4)}/></>,
  connect: <><path d="M25 18V46M25 32 41 23M25 32 41 41" {...stroke(3.4)}/><circle cx={25} cy={32} r={6}/>{[[25, 16.5], [25, 47.5], [42, 22.5], [42, 41.5]].map(([cx, cy]) => <circle key={`${cx},${cy}`} className="pd-flow-hole" cx={cx} cy={cy} r={4.2} stroke="currentColor" strokeWidth={3.4}/>)}</>,
  raw: <path d="M14 36 19.5 25H24M40 25H44.5L50 36V45C50 47 49 48 47 48H17C15 48 14 47 14 45ZM14 36H24L26.5 40.5H37.5L40 36H50M32 13V31M25.5 24.5 32 31 38.5 24.5" {...stroke(3.8)}/>,
  core: <path d="M14 17H50L36.5 32.5V44L27.5 48.5V32.5Z" {...stroke(3.8)}/>,
  live: <><path d="M11 32C17 22.5 24 18 32 18S47 22.5 53 32C47 41.5 40 46 32 46S17 41.5 11 32Z" {...stroke(3.8)}/><circle cx={32} cy={32} r={7.5}/><circle className="pd-flow-hole" cx={34.6} cy={29.4} r={2.2}/></>,
  db: <><ellipse cx={32} cy={18.5} rx={14} ry={5} {...stroke(3.8)}/><path d="M18 18.5V45C18 48 24.5 50.5 32 50.5S46 48 46 45V18.5M18 27.5C18 30.5 24.5 33 32 33S46 30.5 46 27.5M18 36.5C18 39.5 24.5 42 32 42S46 39.5 46 36.5" {...stroke(3.8)}/></>,
  library: <><rect x={14.5} y={15} width={7.5} height={31} rx={1.6}/><rect x={24.5} y={19} width={7.5} height={27} rx={1.6}/><path d="M34.6 21.2 41.3 19.4 48.3 44.6 41.6 46.4Z"/><path d="M12 49.5H52" {...stroke(3.8)}/></>,
  questions: <><path d="M14 21C14 17 17 14 21 14H43C47 14 50 17 50 21V35C50 39 47 42 43 42H29L20 49V42H21C17 42 14 39 14 35ZM27.5 24C27.5 20.5 36.5 20 36.5 25 36.5 28.5 32 28.5 32 31.5" {...stroke(3.8)}/><circle cx={32} cy={36.5} r={2.4}/></>,
};

/** A mark in its group: ink by default, round caps; placed and scaled by `transform`. */
function Glyph({ id, transform }: { id: GlyphId; transform: string }) {
  return <g className="pd-flow-glyph" transform={transform} fill="currentColor" strokeLinecap="round" strokeLinejoin="round">{GLYPHS[id]}</g>;
}

/** A sale: the app's pumpkin, centred on 0,0, about 20 by 22. */
function Pumpkin() {
  return <><ellipse rx={10} ry={8} className="pd-flow-pk-side"/><ellipse rx={4.2} ry={8} className="pd-flow-pk-front"/><path d="M0-7.5C0-11 2-12.5 4-12.5" className="pd-flow-pk-stem"/></>;
}

/** A place's chip: Budapest and London carry the pin. */
function ZoneChip({ line, inline, style }: { line: "budapest" | "london" | "metabase"; inline?: boolean; style?: CSSProperties }) {
  const label = line === "budapest" ? "Budapest · Mini PC" : line === "london" ? "London · ClickHouse Cloud" : "Metabase Cloud";
  return <span className={`pd-flow-zonechip is-${line}${inline ? " is-inline" : ""}`} style={style}>
    {line !== "metabase" && <Icon name="pin" size={13} strokeWidth={2.2}/>}{label}
  </span>;
}

/* ── The map ─────────────────────────────────────────────── */

const W = 1100, H = 560;
const pct = (value: number, of: number) => `${+(value / of * 100).toFixed(3)}%`;
const X = (v: number) => pct(v, W), Y = (v: number) => pct(v, H);

type Stop = { id: Exclude<StationId, "express">; at: "above" | "right" | "below"; width?: number; pad?: number };
/** Where each station's button sits: its name above the badge (the Budapest line), right of it, or below it. */
const STOPS: Stop[] = [
  { id: "postgres", at: "above" }, { id: "debezium", at: "above" }, { id: "redpanda", at: "above" }, { id: "connect", at: "above" },
  { id: "console", at: "right", width: 170, pad: 48 },
  { id: "raw", at: "right", width: 260, pad: 56 }, { id: "core", at: "right", width: 260, pad: 56 },
  { id: "live", at: "right", width: 260, pad: 56 }, { id: "db", at: "right", width: 260, pad: 56 },
  { id: "library", at: "below" }, { id: "questions", at: "below" }, { id: "app", at: "below" },
];
/** A button's box in % of the map (padding % is of the map's width too, so it scales with the drawing). */
function stopStyle({ id, at, width = 140, pad = 0 }: Stop): CSSProperties {
  const { x, y } = STATIONS[id];
  if (at === "above") return { left: X(x - 70), top: Y(y - 74), width: X(140), height: Y(98) };
  if (at === "right") return { left: X(x - 24), top: Y(y - 24), width: X(width), height: Y(48), paddingLeft: X(pad) };
  // The terminus carries the mascot in its ring; the other names sit under their badge.
  if (id === "app") return { left: X(x - 70), top: Y(y - 30), width: X(140), height: Y(104), paddingTop: X(4) };
  return { left: X(x - 70), top: Y(y - 24), width: X(140), height: Y(96), paddingTop: X(52) };
}

/** The badges on the map: every station but the express (a chip) and the terminus (a ring round the mascot). */
const BADGES = (Object.keys(GLYPHS) as GlyphId[]).map(id => ({ id, ...STATIONS[id], small: id === "console" }));

function Key() {
  return <>
    <h3 className="pd-flow-card-title">Key</h3>
    <ul className="pd-flow-key">
      <li><i className="pd-flow-swatch is-budapest"/><span><b>Budapest line</b> · the mini PC</span></li>
      <li><i className="pd-flow-swatch is-express"/><span><b>Express</b> · Budapest to London</span></li>
      <li><i className="pd-flow-swatch is-london"/><span><b>London line</b> · ClickHouse Cloud</span></li>
      <li><i className="pd-flow-swatch is-metabase"/><span><b>Metabase line</b> · database to app</span></li>
      <li><svg className="pd-flow-swatch-pk" viewBox="-14 -14 28 26" aria-hidden="true"><Pumpkin/></svg><span><b>A sale</b> · 8.7 s to London, median</span></li>
      <li><i className="pd-flow-swatch is-change"/><span><b>Query</b> · Metabase → ClickHouse</span></li>
    </ul>
  </>;
}

/* ── The vertical line (narrow panels) ───────────────────── */

/** A pumpkin running down one stretch of the line. The first starts at Postgres, the last stops at the app. */
function Ball({ at, fast }: { at?: "start" | "end"; fast?: boolean }) {
  return <span className={`pd-flow-ball${at ? ` is-${at}` : ""}${fast ? " is-fast" : ""}`} aria-hidden="true"><svg viewBox="-12 -14 24 24"><Pumpkin/></svg></span>;
}
function Dot({ id, small }: { id: GlyphId; small?: boolean }) {
  return <svg className={`pd-flow-dot${small ? " is-small" : ""}`} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx={32} cy={32} r={28} className={`pd-flow-badge is-${STATIONS[id].line}`}/>
    <Glyph id={id} transform="translate(8 8) scale(.75)"/>
  </svg>;
}

/* ── Stats ───────────────────────────────────────────────── */

const STATS: { kind: TileKind; label: string; value: string; unit: string; note: string }[] = [
  { kind: "watch", label: "End-to-end latency", value: "8.7", unit: " s median", note: "Sale → ClickHouse" },
  { kind: "plane", label: "CDC latency", value: "1.4", unit: " s median", note: "Commit → ClickHouse" },
  { kind: "squeeze", label: "Storage compression", value: "9×", unit: " smaller", note: "198k rows · 2.6 MB" },
  { kind: "bolt", label: "Query latency", value: "0.1–1.2", unit: " s", note: "Per app query" },
];

/* ── Page ────────────────────────────────────────────────── */

function LinesTab({ initial }: { initial?: Partial<DataFlowState> }) {
  const [selected, setSelected] = useState<StationId | null>(initial?.selected ?? null);
  const [paused, setPaused] = useState(initial?.paused ?? false);
  const pumpkins = useRef<SVGSVGElement>(null);
  const toggle = (id: StationId) => setSelected(open => open === id ? null : id);

  // Someone who asked for less motion gets the map still; Play still runs it.
  useEffect(() => {
    try { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true); } catch { /* no media queries here */ }
  }, []);
  // SMIL keeps its own clock: pausing it holds every pumpkin where it is. The vertical line follows `is-paused`.
  useEffect(() => {
    const svg = pumpkins.current;
    if (!svg) return;
    try { if (paused) svg.pauseAnimations(); else svg.unpauseAnimations(); } catch { /* no SMIL here: they stay put */ }
  }, [paused]);

  const cur = selected ? { id: selected, ...STATIONS[selected] } : null;

  const row = (id: StationId, at?: "start" | "end" | "spur") => {
    const s = STATIONS[id];
    const open = selected === id;
    const mark = id === "express" ? null
      : id === "app" ? <span className="pd-flow-terminus"><img src={logo} alt=""/></span>
      : at === "spur" ? <><i className="pd-flow-branch"/><Dot id={id as GlyphId} small/></>
      : <Dot id={id as GlyphId}/>;
    return <button key={id} type="button" className={`pd-flow-row${at === "spur" ? " is-spur" : ""}`} aria-expanded={open} onClick={() => toggle(id)}>
      <span className="pd-flow-rail">
        <i className={`pd-flow-bar is-${s.line}${at === "start" || at === "end" ? ` is-${at}` : ""}`}/>
        <Ball at={at === "start" || at === "end" ? at : undefined} fast={id === "express"}/>
        {mark}
      </span>
      <span className="pd-flow-row-text">
        {id === "express"
          ? <span className="pd-flow-zonechip is-express is-inline">Budapest → London · 1.4 s</span>
          : <><b>{s.name}</b><span>{s.sub}</span></>}
        {open && <span className="pd-flow-more">{s.text}</span>}
      </span>
      <span className="pd-flow-chev"><Icon name="chevronDown" size={16} strokeWidth={2}/></span>
    </button>;
  };

  const pause = <button type="button" className="pd-flow-pause" onClick={() => setPaused(p => !p)}>
    <span><Icon name={paused ? "play" : "pause"} size={15} strokeWidth={2.2}/>{paused ? "Play" : "Pause"}</span>
  </button>;

  return <>
    <Panel title="Lines" aside={pause} className={`pd-flow${paused ? " is-paused" : ""}`}>
      <div className="pd-flow-map">
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <rect className="pd-flow-zone is-budapest" x={24} y={24} width={736} height={220} rx={28}/>
          <rect className="pd-flow-zone is-london" x={776} y={160} width={300} height={268} rx={28}/>
          <rect className="pd-flow-zone is-metabase" x={24} y={440} width={1052} height={108} rx={28}/>
          <path className="pd-flow-line is-budapest" d="M90 110H570"/>
          <path className="pd-flow-line is-budapest is-spur" d="M410 110 446 146Q450 150 450 157V200"/>
          <path className="pd-flow-line is-express" d="M570 110H706Q720 110 730 120L810 200Q820 210 820 224V240"/>
          <path className="pd-flow-dashes" d="M578 110H706Q720 110 730 120L810 200Q820 210 820 224V236"/>
          <path className="pd-flow-line is-london" d="M820 240V400"/>
          <path className="pd-flow-line is-metabase" d="M820 470H200"/>
        </svg>

        <svg ref={pumpkins} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="is-over">
          <circle className="pd-flow-pulse" cx={90} cy={110} r={22}>
            <animate attributeName="r" values="22;40" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".7;0" dur="3s" repeatCount="indefinite"/>
          </circle>
          {BEGINS.map(begin => <g key={begin}><Pumpkin/><animateMotion dur="14s" begin={begin} repeatCount="indefinite" path={ROUTE}/></g>)}
        </svg>

        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="is-over">
          {cur && <circle className={`pd-flow-halo is-${cur.line}`} cx={cur.x} cy={cur.y} r={cur.id === "app" ? 42 : cur.id === "console" ? 27 : 33}/>}
          <rect className="pd-flow-change" x={797} y={377} width={46} height={116} rx={23}/>
          {BADGES.map(b => <g key={b.id}>
            <circle className={`pd-flow-badge is-${b.line}${b.small ? " is-small" : ""}`} cx={b.x} cy={b.y} r={b.small ? 17 : 21}/>
            <Glyph id={b.id} transform={b.small ? `translate(${b.x - 13.44} ${b.y - 13.44}) scale(.42)` : `translate(${b.x - 16} ${b.y - 16}) scale(.5)`}/>
          </g>)}
          <circle className="pd-flow-badge is-metabase is-end" cx={200} cy={470} r={30}/>
        </svg>

        <ZoneChip line="budapest" style={{ left: X(48), top: Y(206) }}/>
        <ZoneChip line="london" style={{ right: X(36), top: Y(176) }}/>
        <ZoneChip line="metabase" style={{ right: X(36), top: Y(516) }}/>

        {STOPS.map(stop => {
          const s = STATIONS[stop.id];
          return <button key={stop.id} type="button" className={`pd-flow-stop is-${stop.at}`} style={stopStyle(stop)} aria-pressed={selected === stop.id} onClick={() => toggle(stop.id)}>
            {stop.id === "app" && <img src={logo} alt=""/>}
            <span className="pd-flow-name">{s.name}</span>
            <span className="pd-flow-sub">{s.sub}</span>
          </button>;
        })}
        <button type="button" className="pd-flow-express" style={{ left: X(606), top: Y(152) }} aria-pressed={selected === "express"} onClick={() => toggle("express")}>1.4 s to London</button>

        <div className="pd-flow-card" aria-live="polite">
          {cur ? <>
            <div className={`pd-flow-card-line is-${cur.line}`}><i/>{LINE_NAME[cur.line]}</div>
            <h3 className="pd-flow-card-title is-station">{cur.name}</h3>
            <p>{cur.text}</p>
            <b className={`pd-flow-fact is-${cur.line}`}>{cur.fact}</b>
            <button type="button" className="pd-flow-close" aria-label="Close" onClick={() => setSelected(null)}><span><Icon name="close" size={16} strokeWidth={2}/></span></button>
          </> : <Key/>}
        </div>
      </div>

      <div className="pd-flow-list">
        <div className="pd-flow-block is-budapest">
          <div className="pd-flow-zonerow"><span className="pd-flow-rail"/><ZoneChip line="budapest" inline/></div>
          {row("postgres", "start")}
          {row("debezium")}
          {row("redpanda")}
          {row("console", "spur")}
          {row("connect")}
        </div>
        <div className="pd-flow-between">{row("express")}</div>
        <div className="pd-flow-block is-london">
          <div className="pd-flow-zonerow"><span className="pd-flow-rail"><i className="pd-flow-bar is-london"/><Ball/></span><ZoneChip line="london" inline/></div>
          {row("raw")}
          {row("core")}
          {row("live")}
        </div>
        <div className="pd-flow-between">
          <div className="pd-flow-changerow">
            <span className="pd-flow-rail"><i className="pd-flow-bar is-london is-stub-top"/><i className="pd-flow-bar is-metabase is-stub-bottom"/><i className="pd-flow-capsule"/></span>
            <span className="pd-flow-row-text"><b>Query</b><span>Metabase → ClickHouse</span></span>
          </div>
        </div>
        <div className="pd-flow-block is-metabase">
          <div className="pd-flow-zonerow"><span className="pd-flow-rail"><i className="pd-flow-bar is-metabase"/><Ball/></span><ZoneChip line="metabase" inline/></div>
          {row("db")}
          {row("library")}
          {row("questions")}
          {row("app", "end")}
        </div>
      </div>
    </Panel>

    <div className="pd-flow-stats"><div>
      {STATS.map(s => <article key={s.kind} className="pd-stat is-card pd-flow-stat">
        <StatTile kind={s.kind}/>
        <span>
          <span className="pd-stat-label">{s.label}</span>
          <span className="pd-stat-value">{s.value}<span className="pd-unit">{s.unit}</span></span>
          <span className="pd-stat-note">{s.note}</span>
        </span>
      </article>)}
    </div></div>
  </>;
}

/* ── Page ────────────────────────────────────────────────── */

/** The open tab: the preview's seed, else the path (Lines when the path is not a Data flow one). */
function useTab(seed?: FlowTab): FlowTab {
  const { route } = useNav();
  return seed ?? (route.page === "DataFlow" ? route.tab : "lines");
}

/**
 * The live tabs' line at the right of the tabs: when the shown data arrived (UTC, the logs' clock), and Refresh, which
 * reads the tab's views again now rather than at the next 15 s poll (polls also pause while the page is hidden).
 * The icon turns while the read runs.
 */
function RefreshLine({ at, busy, onRefresh }: { at?: number | null; busy?: boolean; onRefresh?: () => void }) {
  return <span className="pd-flow-refresh">
    {at ? <span>Updated {new Date(at).toISOString().slice(11, 19)} UTC</span> : null}
    <button type="button" className="pd-flow-pause" aria-busy={busy || undefined} onClick={() => onRefresh?.()}>
      <span><Icon name="refresh" size={15} strokeWidth={2.1}/>Refresh</span>
    </button>
  </span>;
}

export function DataFlowPage({ vm, initial, refreshing, onRetry }: PageProps<DataFlowViewModel, DataFlowState> & { onRetry?: () => void }) {
  const tab = useTab(initial?.tab);
  const { navigate } = useNav();
  const at = tab === "queries" ? vm.queries?.receivedAt : tab === "parts" ? vm.parts?.receivedAt : null;
  return <>
    <h1 className="pd-sr">Data flow</h1>
    <div className="pd-flow-tabs"><UnderlineTabs label="Data flow" options={FLOW_TABS} value={tab} onChange={next => navigate(routes.dataFlow(next))}
      trailing={tab === "lines" ? undefined : <RefreshLine at={at} busy={refreshing} onRefresh={onRetry}/>}/></div>
    {tab === "queries" ? <QueriesTab feed={vm.queries} busy={refreshing} onRetry={onRetry} initialRun={initial?.run}/>
      : tab === "parts" ? <PartsTab parts={vm.parts} events={vm.events} busy={refreshing} onRetry={onRetry}/>
      : <LinesTab initial={initial}/>}
  </>;
}
