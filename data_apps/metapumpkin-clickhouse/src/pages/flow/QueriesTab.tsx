import { useMemo, useState } from "react";
import { Panel, PanelState } from "../../components/ui";
import { bytes, cadence, hms, int, ms, queryLabel, queryStats, rowsShort, viewLoads } from "./model";
import { FlowStat } from "./StatTile";
import type { Feed, QueryRun } from "./types";

/*
 * Data flow · Queries: the app's own queries as ClickHouse logged them in the last hour (pumpkin_live.ops_queries).
 * Four totals; the latest twelve runs, each pressable; the X-ray of the picked run (its time, rows, memory, the
 * parts and granules it opened, the SQL Metabase sent); and the rows read by view, the heaviest first.
 * Styles: flow-tabs.css.
 */

const LATEST = 12;
const keyOf = (r: QueryRun) => `${r.at}|${r.hash}`;
const speed = (n: number) => n < 100 ? "is-fast" : n < 600 ? "is-mid" : "is-slow";
const load = (n: number) => n >= 2e6 ? "is-heavy" : n >= 5e5 ? "is-mid" : "is-light";

export function QueriesTab({ feed, busy, onRetry, initialRun }: { feed?: Feed<QueryRun>; busy?: boolean; onRetry?: () => void; initialRun?: string }) {
  const [picked, setPicked] = useState<string | null>(initialRun ?? null);
  const runs = useMemo(() => [...(feed?.rows ?? [])].sort((a, b) => b.at.localeCompare(a.at)), [feed?.rows]);
  const stats = useMemo(() => queryStats(runs), [runs]);
  const loads = useMemo(() => viewLoads(runs), [runs]);

  if (!feed || feed.rows == null) {
    return feed?.error
      ? <Panel title="Queries"><PanelState state="error" message={feed.error} onRetry={onRetry} minHeight={240}/></Panel>
      : <Panel title="Queries"><PanelState state="loading" rows={6} minHeight={240}/></Panel>;
  }
  if (!runs.length) return <Panel title="Queries"><PanelState state="empty" message="No queries from Metabase in the last hour" minHeight={160}/></Panel>;

  // The picked run, or the newest when it has scrolled out of the hour.
  const sel = runs.find(r => keyOf(r) === picked) ?? runs[0];
  const same = runs.filter(r => r.hash === sel.hash);
  const sameRead = same.reduce((s, r) => s + r.readRows, 0);
  const label = queryLabel(sel);
  const top = loads.rows[0]?.total || 1;

  return <>
    <div className="pd-flow-stats"><div>
      <FlowStat kind="chat" label="App queries" value={int(stats.count)} note={`${int(stats.questions)} questions in ${stats.minutes} min`}/>
      <FlowStat kind="bolt" label="Median time" value={int(stats.p50)} unit=" ms" note={`95% under ${int(stats.p95)} ms`}/>
      <FlowStat kind="db" label="Rows read" value={rowsShort(stats.readRows)} note={`${bytes(stats.readBytes)} from storage`}/>
      <FlowStat kind="returned" label="Rows returned" value={int(stats.returned)}
        note={stats.returned ? `1 for every ${int(stats.readRows / stats.returned)} read` : "none"}/>
    </div></div>

    <div className="pd-xr-row">
      <Panel title="Latest queries" pad="list" gap={10} busy={busy} className="pd-xr-latest"
        aside={<span className="pd-xr-live"><i/>Live · every 15 s</span>}>
        <div className="pd-xr-head" aria-hidden="true"><span>UTC</span><span>Question</span><span>Time</span><span>Read → returned</span></div>
        <div className="pd-xr-list">
          {runs.slice(0, LATEST).map(r => <button key={keyOf(r)} type="button" className="pd-xr-run" aria-pressed={r === sel} onClick={() => setPicked(keyOf(r))}>
            <span className="pd-xr-time">{hms(r.at)}</span>
            <span className="pd-xr-what"><b>{queryLabel(r)}</b><span>{r.view}</span></span>
            <span className="pd-xr-ms"><span className="pd-xr-track"><i className={speed(r.ms)} style={{ width: `${Math.max(2, Math.min(100, r.ms / 1300 * 100))}%` }}/></span><b>{ms(r.ms)}</b></span>
            <span className="pd-xr-rows"><b>{int(r.readRows)}</b><span> → {int(r.returned)}</span></span>
          </button>)}
        </div>
      </Panel>

      <Panel title="X-ray" className="pd-xr-detail" aside={<span>{hms(sel.at)} UTC</span>} gap={14}>
        <div className="pd-xr-who">
          <svg width={44} height={44} viewBox="0 0 64 64" aria-hidden="true"><rect x={3} y={3} width={58} height={58} rx={18} fill="#2f1a26" stroke="#331b2b" strokeWidth={3}/>{[13.5, 21.5, 29.5, 37.5].map(x => <rect key={x} x={x} y={17} width={5} height={30} rx={1} fill="#f3c34a"/>)}<rect x={45.5} y={28} width={5} height={8} rx={1} fill="#f3c34a"/></svg>
          <div><b>{label}</b><span><code>pumpkin_live.{sel.view}</code> · {cadence(runs, sel.hash)}</span></div>
        </div>
        <div className="pd-xr-figures">
          <div><span>Time</span><b>{ms(sel.ms)}</b></div>
          <div><span>Rows read</span><b>{int(sel.readRows)}</b></div>
          <div><span>Returned</span><b>{int(sel.returned)}</b></div>
          <div><span>Memory</span><b>{bytes(sel.memory)}</b></div>
        </div>
        <div className="pd-xr-touched">
          <b>What ClickHouse touched</b>
          <div>
            <span><b>{int(sel.parts)}</b> parts</span><i aria-hidden="true">→</i>
            <span><b>{int(sel.granules)}</b> granules</span><i aria-hidden="true">→</i>
            <span><b>{int(sel.readRows)}</b> rows read</span><i aria-hidden="true">→</i>
            <span className="is-out"><b>{int(sel.returned)}</b> returned</span>
          </div>
        </div>
        <div className="pd-xr-sql">
          <b>SQL from Metabase</b>
          <pre>{sel.sql}</pre>
        </div>
        <p className="pd-xr-note">{label} ran {same.length === 1 ? "once" : `${int(same.length)} times`} in the last hour and read {rowsShort(sameRead)} rows in all.</p>
      </Panel>
    </div>

    <Panel title="Rows read, by view" aside={<span>Last hour · {rowsShort(loads.total)} in all</span>} busy={busy}>
      <div className="pd-xr-loads">
        {loads.rows.map(v => <div key={v.view} className="pd-xr-load">
          <code>{v.view}</code>
          <span className="pd-xr-bar"><i className={load(v.total)} style={{ width: `${Math.max(1, v.total / top * 100)}%` }}/></span>
          <b>{rowsShort(v.total)}</b>
          <span>{int(v.runs)} {v.runs === 1 ? "run" : "runs"} × {int(v.perRun)} · {ms(v.p50)}</span>
        </div>)}
        {loads.rest && <div className="pd-xr-load is-rest">
          <span>{loads.rest.views} more {loads.rest.views === 1 ? "view" : "views"}</span>
          <span className="pd-xr-bar"><i style={{ width: `${Math.max(1, loads.rest.total / top * 100)}%` }}/></span>
          <b>{rowsShort(loads.rest.total)}</b>
          <span/>
        </div>}
      </div>
      <div className="pd-xr-legend">
        <span><i className="is-heavy"/>Over 2M rows</span>
        <span><i className="is-mid"/>0.5–2M</span>
        <span><i className="is-light"/>Under 0.5M</span>
      </div>
    </Panel>
  </>;
}
