import { useEffect, useMemo, useRef } from "react";
import { Panel, PanelState } from "../../components/ui";
import { bytes, hms, int, ms, partName, rowsShort, SALE_TABLE, tableParts, tableSummaries, timeline, writeAmp } from "./model";
import { FlowStat } from "./StatTile";
import type { Feed, Part, PartEvent } from "./types";

/*
 * Data flow · Parts: the sales table as ClickHouse stores it, live (pumpkin_live.ops_parts, ops_part_events).
 * Its parts drawn as crates: the big part every merge goes into, and the small ones each tick's insert leaves,
 * waiting their turn. Every poll that brings a new part drops a crate in under the Kafka chute; a merge that has
 * happened swaps the big crate's name (it bumps). Under it, the latest event, the part name read out, and the last
 * five minutes of inserts and merges. Then what the inserts cost in merges over the hour, and every raw table's
 * parts, size and compression. Styles: flow-tabs.css.
 */

const rowsWord = (n: number) => `${int(n)} ${n === 1 ? "row" : "rows"}`;
const short = (table: string) => table.replace(/^pumpkin_/, "");

/** A crate's pumpkins: one for one row, two for two, three for three or more. */
function Pile({ rows }: { rows: number }) {
  const at = rows >= 3 ? [16, 30, 44] : rows === 2 ? [22, 38] : [30];
  return <svg className="pd-pt-pile" viewBox="0 0 60 22" aria-hidden="true">
    {at.map((x, i) => <g key={x} transform={`translate(${x} ${i === 1 && at.length === 3 ? 10 : 13})`}>
      <ellipse rx={9} ry={7} className="pd-pt-pk"/><ellipse rx={3.8} ry={7} className="pd-pt-pk-front"/>
    </g>)}
  </svg>;
}

/** Remembers the part names already shown, so only parts that are new since the last poll animate (not the first paint). */
function useFresh(names: string[]): Set<string> {
  const seen = useRef<Set<string> | null>(null);
  const fresh = seen.current ? new Set(names.filter(n => !seen.current!.has(n))) : new Set<string>();
  useEffect(() => { seen.current = new Set([...(seen.current ?? []), ...names]); });
  return fresh;
}

export function PartsTab({ parts, events, busy, onRetry }: { parts?: Feed<Part>; events?: Feed<PartEvent>; busy?: boolean; onRetry?: () => void }) {
  const all = parts?.rows ?? [];
  const evs = useMemo(() => [...(events?.rows ?? [])].sort((a, b) => a.at.localeCompare(b.at)), [events?.rows]);
  const { big, small } = useMemo(() => tableParts(all, SALE_TABLE), [all]);
  const tables = useMemo(() => tableSummaries(all).slice(0, 8), [all]);
  const amp = useMemo(() => writeAmp(evs), [evs]);
  const line = useMemo(() => timeline(evs, 5), [evs]);
  const fresh = useFresh([big?.name ?? "", ...small.map(p => p.name)].filter(Boolean));

  const failed = parts?.error ?? events?.error ?? null;
  if (!parts?.rows || !events?.rows) {
    return failed
      ? <Panel title="Parts"><PanelState state="error" message={failed} onRetry={onRetry} minHeight={240}/></Panel>
      : <Panel title="Parts"><PanelState state="loading" rows={6} minHeight={240}/></Panel>;
  }
  if (!big) return <Panel title="Parts"><PanelState state="empty" message={`No parts in ${SALE_TABLE} yet`} minHeight={160}/></Panel>;

  const sale = [big, ...small];
  const compressed = sale.reduce((s, p) => s + p.compressed, 0), uncompressed = sale.reduce((s, p) => s + p.uncompressed, 0);
  const last = evs[evs.length - 1];
  const name = partName(big.name);
  const newest = small[small.length - 1];
  const maxRatio = Math.max(...tables.map(t => t.ratio), 1);

  return <>
    <div className="pd-flow-stats"><div>
      <FlowStat kind="crates" label="Active parts" value={int(sale.length)} note={<>in <code>{SALE_TABLE}</code></>}/>
      <FlowStat kind="lines" label="Rows" value={int(sale.reduce((s, p) => s + p.rows, 0))} note="one per sale so far"/>
      <FlowStat kind="squeeze" label="On disk" value={bytes(compressed).replace(/ .*/, "")} unit={` ${bytes(compressed).split(" ")[1]}`}
        note={compressed ? `${(uncompressed / compressed).toFixed(1)}× smaller than ${bytes(uncompressed)}` : undefined}/>
      <FlowStat kind="merge" label="Merges" value={int(amp.merges)} note={`for ${int(amp.inserts)} inserts in ${amp.minutes} min`}/>
    </div></div>

    <Panel title={<>Sales table, part by part <code className="pd-pt-engine">pumpkin_raw.{SALE_TABLE}</code></>} label="Sales table, part by part" busy={busy} gap={16}
      aside={<span className="pd-xr-live"><i/>Live · every 15 s</span>}>
      <div className="pd-pt-scene">
        <div className="pd-pt-floor"/>
        <div className="pd-pt-chute" aria-hidden="true"/>
        <span className="pd-pt-chute-label">Kafka Connect · every 15 s</span>
        {newest && fresh.has(newest.name) && <svg key={newest.name} className="pd-pt-drop" viewBox="-13 -13 26 24" aria-hidden="true">
          <ellipse rx={11} ry={9} className="pd-pt-pk"/><ellipse rx={4.6} ry={9} className="pd-pt-pk-front"/>
        </svg>}

        <div className="pd-pt-big">
          <svg className="pd-pt-heap" viewBox="0 0 300 54" aria-hidden="true">
            {[[62, 38, 22, 16], [104, 34, 24, 18], [150, 30, 26, 20], [196, 34, 24, 18], [238, 38, 22, 16], [127, 18, 18, 14], [173, 18, 18, 14]].map(([cx, cy, rx, ry]) =>
              <g key={`${cx},${cy}`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="pd-pt-pk"/><ellipse cx={cx} cy={cy} rx={rx * 0.42} ry={ry} className="pd-pt-pk-front"/></g>)}
          </svg>
          <div key={big.name} className={`pd-pt-crate is-big${fresh.has(big.name) ? " is-bump" : ""}`}>
            <span className="pd-pt-plate"><code>{big.name}</code><span><b>{int(big.rows)}</b> rows · level {name.level}</span></span>
          </div>
        </div>

        <div className="pd-pt-next" aria-hidden="true"><span>next merge</span><i/></div>

        <div className="pd-pt-smalls">
          {small.map(p => <div key={p.name} className={`pd-pt-small${fresh.has(p.name) ? " is-new" : ""}`} title={p.name}>
            <Pile rows={p.rows}/>
            <div className="pd-pt-crate"/>
            <code>block {partName(p.name).blocks}</code>
            <span>{rowsWord(p.rows)}</span>
          </div>)}
        </div>
      </div>

      {last && <div className="pd-pt-event" aria-live="polite">
        <span className={`pd-pt-kind is-${last.kind}`}>{last.kind === "insert" ? "Insert" : "Merge"}</span>
        <code>{hms(last.at)}</code>
        <span>{last.kind === "insert"
          ? `New part ${last.part} · ${rowsWord(last.rows)} · written in ${ms(last.ms)}`
          : `${last.from.join(" + ")} → ${last.part} · ${int(last.rows)} rows rewritten in ${ms(last.ms)}`}</span>
      </div>}

      <div className="pd-pt-name">
        <span>Reading <code>{big.name}</code>:</span>
        <span><b>{name.partition}</b> partition</span>
        <span>blocks <b>{name.blocks}</b> merged into one part</span>
        <span>level <b>{name.level}</b>: merges deep</span>
      </div>

      <div className="pd-pt-lanes">
        <span className="pd-pt-lane-name">Inserts</span>
        <div className="pd-pt-lane">{line.marks.filter(e => e.kind === "insert").map(e =>
          <i key={e.at} className={`pd-pt-dot is-${Math.min(e.rows, 3)}`} style={{ left: `${e.x}%` }} title={`${hms(e.at)} · ${rowsWord(e.rows)}`}/>)}</div>
        <span className="pd-pt-lane-name">Merges</span>
        <div className="pd-pt-lane">{line.marks.filter(e => e.kind === "merge").map(e =>
          <i key={e.at} className="pd-pt-tick" style={{ left: `${e.x}%` }} title={`${hms(e.at)} · ${ms(e.ms)}`}/>)}</div>
        <span/>
        <div className="pd-pt-axis">{line.ticks.map(t => <span key={t.label} style={{ left: `${t.x}%` }}>{t.label}</span>)}</div>
      </div>
    </Panel>

    <div className="pd-pt-row">
      <Panel title="Write amplification" className="pd-pt-amp" aside={<span>Sales table, {amp.minutes} min</span>}>
        <div className="pd-pt-amp-rows">
          <div><span>Rows inserted</span><span><i className="is-in"/><b>{int(amp.rowsIn)}</b><small>in {int(amp.inserts)} inserts</small></span></div>
          <div><span>Rows rewritten</span><span className="is-col"><i className="is-out"/><span><b>{rowsShort(amp.rowsRewritten)}</b><small>by {int(amp.merges)} merges</small></span></span></div>
        </div>
        <p className="pd-pt-amp-text">About <b>{int(amp.perRow)} rows rewritten for every row inserted</b>. Kafka Connect writes each tick's few sales as a new part, and the next merge folds it into the big part, rewriting all of it.</p>
        <p className="pd-xr-note">Bigger, less frequent inserts, or ClickHouse's async inserts, would mean fewer merges for the same sales.</p>
      </Panel>

      <Panel title="Raw tables" className="pd-pt-tables" pad="list" aside={<span>system.parts</span>}>
        <div className="pd-pt-scroll"><table className="pd-pt-table">
          <thead><tr><th>Table</th><th>Parts</th><th>Rows</th><th>On disk</th><th>Compression</th><th>Level</th></tr></thead>
          <tbody>{tables.map(t => <tr key={t.table}>
            <td><code>{short(t.table)}</code></td>
            <td>{int(t.parts)}</td>
            <td>{int(t.rows)}</td>
            <td>{bytes(t.compressed)} <span>/ {bytes(t.uncompressed)}</span></td>
            <td><span className="pd-pt-ratio"><span><i style={{ width: `${t.ratio / maxRatio * 100}%` }}/></span><b>{t.ratio.toFixed(1)}×</b></span></td>
            <td>{int(t.level)}</td>
          </tr>)}</tbody>
        </table></div>
      </Panel>
    </div>
  </>;
}
