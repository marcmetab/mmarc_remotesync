/*
 * A small trend line: the last N values, oldest first, scaled to their own min and max. The values from
 * `partialFrom` on are partial days (still running somewhere): the line into them is dashed and the end dot
 * hollow. Decorative unless given a label. A value that is not a number (no sales that day, or a date the
 * stores have not reached yet) leaves a gap; the end dot sits on the last number. Presentational and
 * server-renderable (no measuring): it draws in a fixed viewBox and stretches to any size; the stroke and
 * the end dot keep their thickness and shape however it is stretched.
 */

export type SparklineProps = {
  values: number[];
  /** The last value is a partial day: draw its segment dashed. Same as `partialFrom={values.length - 1}`. */
  partialLast?: boolean;
  /** The values from this index on are partial days: the line into them is dashed. Wins over `partialLast`. */
  partialFrom?: number;
  /** Stroke color (default plum). A CSS colour or variable (palette.*): it is applied as a style, so var() resolves. */
  color?: string;
  /** Rendered size in px (the SVG stretches to it). */
  width?: number;
  height?: number;
  /** Read out as an image with this label; without it the line is decorative. */
  "aria-label"?: string;
  className?: string;
};

const W = 100, H = 28, PAD = 3;
type Point = readonly [number, number] | null;

/** One subpath per run of numbers: "M x y L x y …". */
const path = (list: Point[]) => {
  let d = "", pen = false;
  for (const p of list) {
    if (!p) { pen = false; continue; }
    d += `${pen ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    pen = true;
  }
  return d;
};

/** A plum line over the values, with a dot on the last number. A value that is not a number leaves a gap. */
export function Sparkline({ values, partialLast, partialFrom, color = "var(--pd-plum)", width = 96, height = 28, className, "aria-label": ariaLabel }: SparklineProps) {
  const a11y = ariaLabel ? { role: "img", "aria-label": ariaLabel } : { "aria-hidden": true };
  const finite = values.filter(Number.isFinite);
  if (values.length < 2 || finite.length < 2) return <svg className={className} width={width} height={height} {...a11y}/>;
  const min = Math.min(...finite), max = Math.max(...finite), span = max - min;
  const pts: Point[] = values.map((v, i) => Number.isFinite(v) ? [
    (i / (values.length - 1)) * W,
    // A flat series runs through the middle rather than along the floor.
    span ? PAD + (1 - (v - min) / span) * (H - PAD * 2) : H / 2,
  ] as const : null);
  // Solid up to the last full day, dashed from there into the partial ones (sharing the point between them).
  const from = Math.max(0, Math.min(values.length, partialFrom ?? (partialLast ? values.length - 1 : values.length)));
  const solid = pts.slice(0, from), dashed = from < pts.length ? pts.slice(Math.max(0, from - 1)) : [];
  let lastAt = -1;
  for (let i = pts.length - 1; i >= 0 && lastAt < 0; i--) if (pts[i]) lastAt = i;
  const last = lastAt >= 0 ? pts[lastAt] : null;
  const hollow = lastAt >= from;
  // Strokes do not scale with the box (non-scaling-stroke), so a zero-length round-capped path stays a round dot.
  // The colour goes in `style`: an SVG presentation attribute (stroke="…") does not resolve var().
  const stroke = { fill: "none", style: { stroke: color }, strokeWidth: 1.6, strokeLinejoin: "round", strokeLinecap: "round", vectorEffect: "non-scaling-stroke" } as const;
  const dot = last && `M${last[0].toFixed(2)} ${last[1].toFixed(2)}h0`;
  return <svg className={className} width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" overflow="visible" {...a11y}>
    {solid.length > 0 && <path d={path(solid)} {...stroke}/>}
    {dashed.length > 0 && <path d={path(dashed)} {...stroke} strokeDasharray="2.5 3"/>}
    {dot && (hollow
      ? <><path d={dot} {...stroke} strokeWidth={6}/><path d={dot} {...stroke} style={{ stroke: "var(--pd-page)" }} strokeWidth={3}/></>
      : <path d={dot} {...stroke} strokeWidth={5}/>)}
  </svg>;
}
