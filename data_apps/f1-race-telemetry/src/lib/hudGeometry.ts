/**
 * The circuit as the Race Replay HUD's ground plane.
 *
 * Built from the reference lap's x/y trace: rotated to the official map
 * orientation, flipped to y-down, resampled to evenly spaced points and scaled
 * so its longest side spans TRACK_SPAN units. The HUD's track widths, gate
 * heights and camera distances are all in those units, so every circuit draws
 * at the same visual size.
 */
import type { CornerRow } from "../hooks/useRaceData";
import { nearestIndex, rotate, type XY } from "./lapGeometry";

export const TRACK_SPAN = 1060;
/** Resampled centreline points: ~11 m apart on a 5 km lap. */
const SAMPLES = 480;
/** Points either side of a corner's apex that get a kerb. */
const KERB_SPAN = 5;
/** Sideways shift of a car in the pit lane, in track units. */
const PIT_OFFSET = 26;

export type HudTrackInput = {
  samples: readonly { x: number; y: number; drs: number | null }[];
  /** Time-based lap progress of each sample, 0 → 1 (see `referenceProgress`). */
  fractions: readonly number[];
  rotation: number;
  corners: readonly CornerRow[];
  /** Reference-sample indices where sectors 2 and 3 begin. */
  sectorSplits: [number, number] | null;
};

export type HudTrack = {
  /** Closed, evenly spaced centreline, y-down. */
  pts: XY[];
  /** Unit normal at each point. */
  normals: XY[];
  M: number;
  center: XY;
  kerb: boolean[];
  drs: boolean[];
  /** Centreline indices where sectors 2 and 3 begin. */
  sectors: [number, number] | null;
  /** Lap progress by time → fractional centreline index. */
  indexAt: (progress: number) => number;
};

export function buildHudTrack({ samples, fractions, rotation, corners, sectorSplits }: HudTrackInput): HudTrack | null {
  const n = samples.length;
  if (n < 8 || fractions.length !== n) return null;

  const flip = (p: XY) => {
    const r = rotate(p, rotation);
    return { x: r.x, y: -r.y };
  };
  const raw = samples.map(flip);
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const span = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY, 1);
  const scale = TRACK_SPAN / span;
  const norm = (p: XY) => ({ x: (p.x - minX) * scale, y: (p.y - minY) * scale });
  const ref = raw.map(norm);

  // Arc length along the reference lap, closing back to the first sample.
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(ref[i].x - ref[i - 1].x, ref[i].y - ref[i - 1].y));
  const total = cum[n - 1] + Math.hypot(ref[0].x - ref[n - 1].x, ref[0].y - ref[n - 1].y);
  if (total <= 0) return null;

  const M = SAMPLES;
  const resampled: XY[] = [];
  const drs: boolean[] = [];
  let seg = 0;
  for (let k = 0; k < M; k++) {
    const d = (k / M) * total;
    while (seg < n - 1 && cum[seg + 1] < d) seg++;
    const a = ref[seg];
    const b = seg < n - 1 ? ref[seg + 1] : ref[0];
    const len = (seg < n - 1 ? cum[seg + 1] : total) - cum[seg];
    const t = len > 0 ? (d - cum[seg]) / len : 0;
    resampled.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    const nearest = samples[t < 0.5 ? seg : (seg + 1) % n];
    drs.push(nearest.drs != null && nearest.drs >= 10);
  }

  // GPS noise makes the band edges ragged; a light closed-loop smoothing fixes it.
  let pts = resampled;
  for (let pass = 0; pass < 2; pass++) {
    pts = pts.map((p, i) => {
      const a = pts[(i - 1 + M) % M];
      const b = pts[(i + 1) % M];
      return { x: (a.x + 2 * p.x + b.x) / 4, y: (a.y + 2 * p.y + b.y) / 4 };
    });
  }

  const normals = pts.map((_, i) => {
    const a = pts[(i - 1 + M) % M];
    const b = pts[(i + 1) % M];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    return { x: -dy / l, y: dx / l };
  });

  const kerb = pts.map(() => false);
  for (const corner of corners) {
    const at = nearestIndex(pts, norm(flip({ x: corner.x, y: corner.y })));
    if (at < 0) continue;
    for (let k = -KERB_SPAN; k <= KERB_SPAN; k++) kerb[(at + k + M) % M] = true;
  }

  const refToIndex = (i: number) => Math.round((cum[Math.min(Math.max(i, 0), n - 1)] / total) * M) % M;
  const sectors: [number, number] | null = sectorSplits ? [refToIndex(sectorSplits[0]), refToIndex(sectorSplits[1])] : null;

  const indexAt = (progress: number) => {
    const p = Math.min(1, Math.max(0, progress));
    let lo = 0;
    let hi = n - 1;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >>> 1;
      if (fractions[mid] < p) lo = mid;
      else hi = mid;
    }
    const span = fractions[hi] - fractions[lo];
    const mix = span > 0 ? Math.min(1, Math.max(0, (p - fractions[lo]) / span)) : 0;
    const d = cum[lo] + (cum[hi] - cum[lo]) * mix;
    // The last reference sample sits just short of the line; finish the lap on it.
    return p >= 1 ? M : (d / total) * M;
  };

  const cx = pts.reduce((s, p) => s + p.x, 0) / M;
  const cy = pts.reduce((s, p) => s + p.y, 0) / M;
  return { pts, normals, M, center: { x: cx, y: cy }, kerb, drs, sectors, indexAt };
}

function wrapIndex(track: HudTrack, fi: number) {
  return ((fi % track.M) + track.M) % track.M;
}

/** A point on the centreline at a fractional index, optionally shifted sideways (pit lane). */
export function placeOnTrack(track: HudTrack, fi: number, lateral = 0): XY & { i: number } {
  const w = wrapIndex(track, fi);
  const i = Math.floor(w);
  const k = w - i;
  const a = track.pts[i];
  const b = track.pts[(i + 1) % track.M];
  const nn = track.normals[i];
  const o = PIT_OFFSET * lateral;
  return { x: a.x + (b.x - a.x) * k - nn.x * o, y: a.y + (b.y - a.y) * k - nn.y * o, i };
}
