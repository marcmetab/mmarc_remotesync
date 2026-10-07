import type { Part, PartEvent, QueryRun } from "./types";

/*
 * What the Queries and Parts tabs work out from ClickHouse's own logs: pure functions over the view model, so the
 * static preview and the live app show the same figures for the same rows.
 */

/** The table the Parts tab follows: one row per sale, written every tick. */
export const SALE_TABLE = "pumpkin_feed_sale";

/* ── Formatting ──────────────────────────────────────────── */

const grouped = (n: number) => Math.round(n).toLocaleString("en-US");
/** 14,323,774 → "14.3M"; 9,654 → "9,654". */
export function rowsShort(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)}M`;
  if (n >= 1e5) return `${Math.round(n / 1e3)}k`;
  return grouped(n);
}
/** Bytes, decimal: 564,247 → "564 KB", 706,636,138 → "707 MB". */
export function bytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)} MB`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} KB`;
  return `${n} B`;
}
export const ms = (n: number) => `${grouped(n)} ms`;
export const int = grouped;
/** "22:08:41" in UTC: the logs' own clock. */
export const hms = (at: string) => {
  const d = new Date(at);
  return Number.isNaN(d.valueOf()) ? "—" : d.toISOString().slice(11, 19);
};

/* ── Queries ─────────────────────────────────────────────── */

/** What each view answers in the app, in a few words. */
const VIEW_LABEL: Record<string, string> = {
  business_events: "Business events", cities: "Cities", countries: "Countries", daily_store_sales: "Daily store sales",
  deliveries: "Deliveries", fleet_now: "Vans now", harvest_daily: "Harvest", hourly_store_sales: "Hourly store sales",
  hub_now: "Hubs now", hubs: "Hubs", recent_sales: "Latest sales", sales_pulse: "Sales pulse", season_daily: "Season by day",
  season_landing: "Season landing", season_plan: "Season plan", sim_status: "Clock", stock_outlook: "Stock outlook",
  stockouts: "Stockouts", store_now: "Stores now", stores: "Stores", trip_timeline: "Trip timeline", truck_faults: "Van faults",
  trucks: "Vans", varieties: "Varieties",
};
/** A run's name: the late-van count gets its own (it is the shell's orange dot); the rest are their view's. */
export function queryLabel(run: QueryRun): string {
  if (run.view === "fleet_now" && /COUNT\(\*\)/.test(run.sql) && /`is_late` = TRUE/.test(run.sql)) return "Late vans";
  return VIEW_LABEL[run.view] ?? run.view;
}

/** The value at quantile q (0..1) of numbers sorted ascending, interpolated. */
export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const at = (sorted.length - 1) * q;
  const lo = Math.floor(at), hi = Math.ceil(at);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (at - lo);
}

export type QueryStats = { count: number; questions: number; p50: number; p95: number; readRows: number; readBytes: number; returned: number; minutes: number };
export function queryStats(runs: QueryRun[]): QueryStats {
  const times = runs.map(r => r.ms).sort((a, b) => a - b);
  const at = runs.map(r => Date.parse(r.at)).filter(Number.isFinite);
  return {
    count: runs.length,
    questions: new Set(runs.map(r => r.hash)).size,
    p50: quantile(times, 0.5),
    p95: quantile(times, 0.95),
    readRows: runs.reduce((s, r) => s + r.readRows, 0),
    readBytes: runs.reduce((s, r) => s + r.readBytes, 0),
    returned: runs.reduce((s, r) => s + r.returned, 0),
    minutes: at.length > 1 ? Math.max(1, Math.round((Math.max(...at) - Math.min(...at)) / 60_000)) : 0,
  };
}

export type ViewLoad = { view: string; runs: number; perRun: number; total: number; p50: number };
/** Rows read by view, the heaviest first: the first `top`, then the rest summed. */
export function viewLoads(runs: QueryRun[], top = 7): { rows: ViewLoad[]; rest: { views: number; total: number } | null; total: number } {
  const by = new Map<string, QueryRun[]>();
  for (const r of runs) by.set(r.view, [...(by.get(r.view) ?? []), r]);
  const all = [...by.entries()].map(([view, rs]): ViewLoad => {
    const total = rs.reduce((s, r) => s + r.readRows, 0);
    return { view, runs: rs.length, total, perRun: total / rs.length, p50: quantile(rs.map(r => r.ms).sort((a, b) => a - b), 0.5) };
  }).sort((a, b) => b.total - a.total);
  const rest = all.slice(top);
  return {
    rows: all.slice(0, top),
    rest: rest.length ? { views: rest.length, total: rest.reduce((s, v) => s + v.total, 0) } : null,
    total: all.reduce((s, v) => s + v.total, 0),
  };
}

/** How often a question runs: "every 30 s" when it repeats, else how many times this hour. */
export function cadence(runs: QueryRun[], hash: string): string {
  const at = runs.filter(r => r.hash === hash).map(r => Date.parse(r.at)).filter(Number.isFinite).sort((a, b) => a - b);
  if (at.length < 4) return at.length === 1 ? "once this hour" : `${at.length} times this hour`;
  const gap = (at[at.length - 1] - at[0]) / (at.length - 1) / 1000;
  return gap < 90 ? `every ${Math.round(gap / 5) * 5 || 5} s` : `every ${Math.round(gap / 60)} min`;
}

/* ── Parts ───────────────────────────────────────────────── */

/** "all_407_1029_511" → its partition, block range and level. */
export function partName(name: string): { partition: string; blocks: string; level: string } {
  const bits = name.split("_");
  if (bits.length < 4) return { partition: name, blocks: "", level: "" };
  const [level, max, min] = [bits.pop()!, bits.pop()!, bits.pop()!];
  return { partition: bits.join("_"), blocks: min === max ? min : `${min}–${max}`, level };
}

/** One table's parts: the biggest (where the merges go), and the small ones waiting, oldest block first. */
export function tableParts(parts: Part[], table: string): { big: Part | null; small: Part[] } {
  const mine = parts.filter(p => p.table === table);
  if (!mine.length) return { big: null, small: [] };
  const big = mine.reduce((a, b) => b.rows > a.rows ? b : a);
  return { big, small: mine.filter(p => p !== big).sort((a, b) => a.minBlock - b.minBlock) };
}

export type TableSummary = { table: string; parts: number; rows: number; compressed: number; uncompressed: number; ratio: number; level: number };
/** Every raw table, the most rows first. */
export function tableSummaries(parts: Part[]): TableSummary[] {
  const by = new Map<string, Part[]>();
  for (const p of parts) by.set(p.table, [...(by.get(p.table) ?? []), p]);
  return [...by.entries()].map(([table, ps]) => {
    const compressed = ps.reduce((s, p) => s + p.compressed, 0), uncompressed = ps.reduce((s, p) => s + p.uncompressed, 0);
    return { table, parts: ps.length, rows: ps.reduce((s, p) => s + p.rows, 0), compressed, uncompressed,
      ratio: compressed ? uncompressed / compressed : 0, level: Math.max(...ps.map(p => p.level)) };
  }).sort((a, b) => b.rows - a.rows);
}

export type WriteAmp = { inserts: number; rowsIn: number; merges: number; rowsRewritten: number; perRow: number; minutes: number };
/** What the inserts cost in merges over the events given (the last hour). */
export function writeAmp(events: PartEvent[]): WriteAmp {
  const ins = events.filter(e => e.kind === "insert"), mer = events.filter(e => e.kind === "merge");
  const rowsIn = ins.reduce((s, e) => s + e.rows, 0), rowsRewritten = mer.reduce((s, e) => s + e.rows, 0);
  const at = events.map(e => Date.parse(e.at)).filter(Number.isFinite);
  return {
    inserts: ins.length, rowsIn, merges: mer.length, rowsRewritten, perRow: rowsIn ? rowsRewritten / rowsIn : 0,
    minutes: at.length > 1 ? Math.max(1, Math.round((Math.max(...at) - Math.min(...at)) / 60_000)) : 0,
  };
}

/** The events of the last `minutes` before the newest one, placed on 0–100% of that span. */
export function timeline(events: PartEvent[], minutes = 5): { span: number; end: number; marks: (PartEvent & { x: number })[]; ticks: { x: number; label: string }[] } {
  const at = events.map(e => Date.parse(e.at)).filter(Number.isFinite);
  const end = at.length ? Math.max(...at) + 5_000 : 0;
  const span = minutes * 60_000, start = end - span;
  const marks = events.map(e => ({ ...e, x: (Date.parse(e.at) - start) / span * 100 })).filter(e => e.x >= 0 && e.x <= 100);
  const ticks: { x: number; label: string }[] = [];
  for (let t = Math.ceil(start / 60_000) * 60_000; t <= end; t += 60_000) ticks.push({ x: (t - start) / span * 100, label: new Date(t).toISOString().slice(11, 16) });
  return { span, end, marks, ticks };
}
