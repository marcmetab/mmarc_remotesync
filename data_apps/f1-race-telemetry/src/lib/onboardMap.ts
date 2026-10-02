/**
 * The onboard map, built from one telemetry lap: the driven line in metres
 * (x east, y north), resampled evenly, with where the car braked (and how
 * fast it was going in and out), opened DRS and crossed the sector lines.
 * Everything comes from the lap's own channels and circuit_corners.
 */
import type { CornerRow } from "../hooks/useRaceData";
import type { TelemetrySample } from "../hooks/useTelemetry";

/** Metres between resampled points. */
const STEP = 4;
/** Offset of a corner number from its apex, along FastF1's label angle (m). */
const CORNER_LABEL_OFFSET = 34;

export type MapZone = { from: number; to: number };
export type BrakeZone = MapZone & { entryKmh: number | null; minKmh: number | null; minAt: number };
/** A corner number: where to draw it and where its apex sits along the line. */
export type MapCorner = { label: string; x: number; y: number; at: number };

export type OnboardMap = {
  n: number;
  step: number;
  /** Length of the closed line, metres. */
  length: number;
  x: Float64Array;
  y: Float64Array;
  /** Speed at each point, km/h (NaN where unknown). */
  speed: Float32Array;
  speedRange: [number, number];
  brakes: BrakeZone[];
  drs: MapZone[];
  /** Line distances where sectors 2 and 3 begin. */
  sectors: number[];
  corners: MapCorner[];
  /** Telemetry distance (m) → distance along the line, through the samples' own x/y. */
  toLine: (telemetryDistance: number) => number;
  /** Position and heading (radians, counter-clockwise from east) at a line distance. */
  pointAt: (d: number) => { x: number; y: number; heading: number };
  /** Line distance of the point nearest to (x, y) in metres. */
  nearest: (x: number, y: number) => number;
};

const wrap = (i: number, n: number) => ((i % n) + n) % n;

export function buildOnboardMap(
  samples: readonly TelemetrySample[],
  corners: readonly CornerRow[],
  sectorSplits: [number, number] | null,
): OnboardMap | null {
  const all = samples.filter((s) => Number.isFinite(s.x) && Number.isFinite(s.y));
  if (all.length < 50) return null;
  const P = all.map((s) => ({ x: s.x / 10, y: s.y / 10 }));

  // A lap trace usually runs a little past the line it started on. Closing the
  // loop over that overlap would fold the line back on itself, so drop tail
  // samples near the first one or just past it along the start heading.
  const lead = P.find((p) => Math.hypot(p.x - P[0].x, p.y - P[0].y) >= 5) ?? P[1];
  const dl = Math.hypot(lead.x - P[0].x, lead.y - P[0].y) || 1;
  const dir = { x: (lead.x - P[0].x) / dl, y: (lead.y - P[0].y) / dl };
  let end = P.length;
  while (end > P.length * 0.9) {
    const w = P[end - 1];
    const dx = w.x - P[0].x;
    const dy = w.y - P[0].y;
    const d = Math.hypot(dx, dy);
    if (d < 25 || (dx * dir.x + dy * dir.y > 0 && d < 60)) end--;
    else break;
  }
  const pts = P.slice(0, end);

  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const closing = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
  const rawLength = cum[cum.length - 1] + closing;
  const n = Math.max(100, Math.round(rawLength / STEP));
  const step = rawLength / n;

  let x = new Float64Array(n);
  let y = new Float64Array(n);
  let seg = 0;
  for (let k = 0; k < n; k++) {
    const d = k * step;
    while (seg < pts.length - 1 && cum[seg + 1] < d) seg++;
    const a = pts[seg];
    const b = seg < pts.length - 1 ? pts[seg + 1] : pts[0];
    const len = (seg < pts.length - 1 ? cum[seg + 1] : rawLength) - cum[seg];
    const t = len > 0 ? Math.min(1, (d - cum[seg]) / len) : 0;
    x[k] = a.x + (b.x - a.x) * t;
    y[k] = a.y + (b.y - a.y) * t;
  }
  // Light closed-loop smoothing takes the jitter out of the position feed.
  for (let pass = 0; pass < 2; pass++) {
    const nx = new Float64Array(n);
    const ny = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      nx[k] = (x[wrap(k - 1, n)] + 2 * x[k] + x[wrap(k + 1, n)]) / 4;
      ny[k] = (y[wrap(k - 1, n)] + 2 * y[k] + y[wrap(k + 1, n)]) / 4;
    }
    x = nx;
    y = ny;
  }
  let length = 0;
  for (let k = 0; k < n; k++) length += Math.hypot(x[wrap(k + 1, n)] - x[k], y[wrap(k + 1, n)] - y[k]);

  // Each sample's place on the line comes from its own x/y (the same basis the
  // rivals' positions use), not from speed-integrated distance. Tail samples
  // trimmed above run past the end and wrap back onto the start.
  const cumAll = [0];
  for (let i = 1; i < P.length; i++) cumAll.push(cumAll[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const lineDistance = cumAll.map((c) => (c / rawLength) * length);
  // Telemetry distance → line distance, interpolated between samples.
  const withDistance = all.map((s, i) => ({ d: s.distanceM, line: lineDistance[i] })).filter((p): p is { d: number; line: number } => p.d != null);
  const telemetryTotal = (all[end - 1].distanceM ?? cum[cum.length - 1]) + closing;
  const toLine = (dTel: number) => {
    if (withDistance.length < 2) return telemetryTotal > 0 ? (dTel / telemetryTotal) * length : 0;
    let lo = 0;
    let hi = withDistance.length - 1;
    if (dTel <= withDistance[0].d) return withDistance[0].line;
    if (dTel >= withDistance[hi].d) return withDistance[hi].line;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >>> 1;
      if (withDistance[mid].d <= dTel) lo = mid;
      else hi = mid;
    }
    const a = withDistance[lo];
    const b = withDistance[hi];
    return b.d > a.d ? a.line + ((dTel - a.d) / (b.d - a.d)) * (b.line - a.line) : a.line;
  };

  // Speed at each resampled point, from the samples in distance order.
  const bySpeed = all.map((s, i) => ({ d: lineDistance[i], v: s.speed })).filter((p) => p.v != null).sort((a, b) => a.d - b.d) as { d: number; v: number }[];
  const speed = new Float32Array(n).fill(Number.NaN);
  let j = 0;
  for (let k = 0; k < n && bySpeed.length > 1; k++) {
    const d = (k / n) * length;
    while (j < bySpeed.length - 2 && bySpeed[j + 1].d < d) j++;
    const a = bySpeed[j];
    const b = bySpeed[j + 1];
    const t = b.d > a.d ? Math.min(1, Math.max(0, (d - a.d) / (b.d - a.d))) : 0;
    speed[k] = a.v + (b.v - a.v) * t;
  }
  let lo = Infinity;
  let hi = -Infinity;
  speed.forEach((v) => { if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });

  // Braking zones and DRS openings, as runs of the channel.
  const runs = (on: (s: TelemetrySample) => boolean) => {
    const out: { from: number; to: number; first: number; last: number }[] = [];
    let start = -1;
    for (let i = 0; i <= all.length; i++) {
      const active = i < all.length && on(all[i]);
      if (active && start < 0) start = i;
      if (!active && start >= 0) {
        out.push({ from: lineDistance[start], to: lineDistance[i - 1], first: start, last: i - 1 });
        start = -1;
      }
    }
    return out;
  };
  const brakes: BrakeZone[] = runs((s) => (s.brake ?? 0) >= 1)
    .filter((r) => r.to - r.from >= 8)
    .map((r) => {
      let minKmh: number | null = null;
      let minAt = r.to;
      for (let i = r.first; i <= Math.min(all.length - 1, r.last + 3); i++) {
        const v = all[i].speed;
        if (v != null && (minKmh == null || v < minKmh)) { minKmh = v; minAt = lineDistance[i]; }
      }
      return { from: r.from, to: r.to, entryKmh: all[r.first].speed, minKmh, minAt };
    });
  const drs: MapZone[] = runs((s) => (s.drs ?? 0) >= 10).filter((r) => r.to - r.from >= 8).map(({ from, to }) => ({ from, to }));

  // Split indices refer to the unfiltered samples.
  const sectors = sectorSplits
    ? sectorSplits.map((i) => samples[i]?.distanceM).filter((d): d is number => d != null).map(toLine)
    : [];

  const pointAt = (d: number) => {
    const w = (((d / length) * n) % n + n) % n;
    const i = Math.floor(w);
    const t = w - i;
    const i1 = wrap(i + 1, n);
    const a = wrap(i - 2, n);
    const b = wrap(i + 3, n);
    return {
      x: x[i] + (x[i1] - x[i]) * t,
      y: y[i] + (y[i1] - y[i]) * t,
      heading: Math.atan2(y[b] - y[a], x[b] - x[a]),
    };
  };

  const CELL = 40;
  const grid = new Map<string, number[]>();
  for (let k = 0; k < n; k++) {
    const key = `${Math.floor(x[k] / CELL)},${Math.floor(y[k] / CELL)}`;
    const list = grid.get(key);
    if (list) list.push(k);
    else grid.set(key, [k]);
  }
  const nearest = (px: number, py: number) => {
    const cx = Math.floor(px / CELL);
    const cy = Math.floor(py / CELL);
    let best = -1;
    let bestD = Infinity;
    let found = -1;
    for (let r = 0; r <= 6 && (found < 0 || r <= found + 1); r++) {
      for (let gx = cx - r; gx <= cx + r; gx++) {
        for (let gy = cy - r; gy <= cy + r; gy++) {
          if (Math.max(Math.abs(gx - cx), Math.abs(gy - cy)) !== r) continue;
          for (const k of grid.get(`${gx},${gy}`) ?? []) {
            const d = (x[k] - px) ** 2 + (y[k] - py) ** 2;
            if (d < bestD) { bestD = d; best = k; }
          }
        }
      }
      if (best >= 0 && found < 0) found = r;
    }
    return best < 0 ? -1 : (best / n) * length;
  };

  const mapCorners: MapCorner[] = corners.map((c) => {
    const a = ((c.angle ?? 0) * Math.PI) / 180;
    return { label: `${c.cornerNumber}${c.letter ?? ""}`, x: c.x / 10 + Math.cos(a) * CORNER_LABEL_OFFSET, y: c.y / 10 + Math.sin(a) * CORNER_LABEL_OFFSET, at: Math.max(0, nearest(c.x / 10, c.y / 10)) };
  });

  return {
    n,
    step: length / n,
    length,
    x,
    y,
    speed,
    speedRange: [Number.isFinite(lo) ? lo : 0, Number.isFinite(hi) ? hi : 350],
    brakes,
    drs,
    sectors,
    corners: mapCorners,
    toLine,
    pointAt,
    nearest,
  };
}

/** Channels at a moment in the lap, interpolated between samples. */
export type LapMoment = {
  timeMs: number;
  sessionTimeMs: number | null;
  distance: number;
  speed: number | null;
  rpm: number | null;
  gear: number | null;
  throttle: number | null;
  brake: number | null;
  drs: number | null;
  gLong: number | null;
  gLat: number | null;
  gTotal: number | null;
  cornerNumber: number | null;
  steer: number;
};

export function momentAt(samples: readonly TelemetrySample[], steer: readonly number[], timeMs: number): LapMoment | null {
  const n = samples.length;
  if (n === 0) return null;
  const t = (s: TelemetrySample) => s.timeInLapMs ?? 0;
  let lo = 0;
  let hi = n - 1;
  if (timeMs <= t(samples[0])) hi = 0;
  else if (timeMs >= t(samples[n - 1])) lo = hi = n - 1;
  else {
    while (lo + 1 < hi) {
      const mid = (lo + hi) >>> 1;
      if (t(samples[mid]) <= timeMs) lo = mid;
      else hi = mid;
    }
  }
  const a = samples[lo];
  const b = samples[hi];
  const span = t(b) - t(a);
  const k = span > 0 ? Math.min(1, Math.max(0, (timeMs - t(a)) / span)) : 0;
  const lerp = (p: number | null, q: number | null) => (p == null ? q : q == null ? p : p + (q - p) * k);
  const pick = <V,>(p: V, q: V) => (k < 0.5 ? p : q);
  return {
    timeMs,
    sessionTimeMs: lerp(a.sessionTimeMs, b.sessionTimeMs),
    distance: lerp(a.distanceM, b.distanceM) ?? 0,
    speed: lerp(a.speed, b.speed),
    rpm: lerp(a.rpm, b.rpm),
    gear: pick(a.gear, b.gear),
    throttle: lerp(a.throttle, b.throttle),
    brake: pick(a.brake, b.brake),
    drs: pick(a.drs, b.drs),
    gLong: lerp(a.gLong, b.gLong),
    gLat: lerp(a.gLat, b.gLat),
    gTotal: lerp(a.gTotal, b.gTotal),
    cornerNumber: pick(a.cornerNumber, b.cornerNumber),
    steer: (steer[lo] ?? 0) + ((steer[hi] ?? 0) - (steer[lo] ?? 0)) * k,
  };
}
