import type { ReactNode } from "react";

/** The stat cards' stickers: a rounded tile in a Golden Hour colour with a dark rim, the same in both themes. */
export type TileKind = "watch" | "plane" | "squeeze" | "bolt" | "chat" | "db" | "returned" | "crates" | "lines" | "merge";
const FILL: Record<TileKind, string> = {
  watch: "#c2531a", plane: "#4a2638", squeeze: "#5f6d2c", bolt: "#a8667a", chat: "#4a2638", db: "#c2531a",
  returned: "#5f6d2c", crates: "#c9683c", lines: "#4a2638", merge: "#a8667a",
};
const INK = "#fdfbf9", CREAM = "#fdf3ea", PEACH = "#f8b77f";
const line = (color: string) => ({ fill: "none", stroke: color, strokeWidth: 3.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
const MARK: Record<TileKind, ReactNode> = {
  watch: <><circle cx={32} cy={35} r={14} {...line(CREAM)}/><path d="M32 27V35L38 38.5M27 14H37M32 14V21" {...line(CREAM)}/></>,
  plane: <><path d="M11 31 52 14 30 36Z" fill={PEACH}/><path d="M30 36 52 14 43 49Z" fill={PEACH} opacity={0.7}/><path d="M30 36 31 48 37 41.5Z" fill={PEACH}/></>,
  squeeze: <><rect x={24} y={24} width={16} height={16} rx={3.5} fill={INK}/><path d="M13 13 20 20M20 14V20H14M51 13 44 20M44 14V20H50M13 51 20 44M14 44H20V50M51 51 44 44M50 44H44V50" {...line(INK)}/></>,
  bolt: <path d="M36 11 18 36H30.5L27.5 53 46 27H33.5Z" fill={INK} stroke={INK} strokeWidth={2} strokeLinejoin="round"/>,
  chat: <path d="M14 21C14 17 17 14 21 14H43C47 14 50 17 50 21V35C50 39 47 42 43 42H29L20 49V42H21C17 42 14 39 14 35ZM24 24H40M24 31H35" {...line("#fbe3cf")}/>,
  db: <path d="M18 19C18 16 24.5 14 32 14S46 16 46 19 39.5 24 32 24 18 22 18 19ZM18 19V45C18 48 24.5 50.5 32 50.5S46 48 46 45V19M18 32C18 35 24.5 37.5 32 37.5S46 35 46 32" {...line(CREAM)}/>,
  returned: <path d="M13 32H45M36 23 45 32 36 41M50 22V42" {...line(INK)}/>,
  crates: <><rect x={12} y={30} width={22} height={18} rx={3} {...line(CREAM)}/><rect x={38} y={36} width={14} height={12} rx={2.5} {...line(CREAM)}/><ellipse cx={23} cy={24} rx={6} ry={4.5} fill={CREAM}/></>,
  lines: <path d="M16 20H48M16 32H48M16 44H40" {...line(PEACH)}/>,
  merge: <path d="M14 22H30C36 22 38 26 38 32S40 42 46 42H50M14 42H30C36 42 38 38 38 32M44 37 50 42 44 47" {...line(INK)}/>,
};

export function StatTile({ kind }: { kind: TileKind }) {
  return <svg className="pd-flow-tile" width={40} height={40} viewBox="0 0 64 64" aria-hidden="true">
    <rect x={3} y={3} width={58} height={58} rx={18} fill={FILL[kind]} stroke="#331b2b" strokeWidth={3}/>{MARK[kind]}
  </svg>;
}

/** A stat card with its sticker: the label, the figure (a unit word after it, smaller) and one line under it. */
export function FlowStat({ kind, label, value, unit, note }: { kind: TileKind; label: string; value: string; unit?: string; note?: ReactNode }) {
  return <article className="pd-stat is-card pd-flow-stat">
    <StatTile kind={kind}/>
    <span>
      <span className="pd-stat-label">{label}</span>
      <span className="pd-stat-value">{value}{unit && <span className="pd-unit">{unit}</span>}</span>
      {note != null && <span className="pd-stat-note">{note}</span>}
    </span>
  </article>;
}
