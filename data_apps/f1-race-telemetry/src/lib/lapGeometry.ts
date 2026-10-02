/**
 * Geometry derived from one telemetry lap's x/y trace.
 *
 * Track coordinates are in tenths of a metre, y-up. Nothing here invents a
 * channel: the steering angle is an estimate from the path's curvature (the
 * dataset has no steering sensor), and callers label it as such.
 */

export type XY = { x: number; y: number };

type TracePoint = XY & { distanceM: number | null };

/** Front-axle-to-rear-axle distance of a current F1 car, in metres. */
const WHEELBASE_M = 3.6;
/** Degrees at the steering wheel per degree at the front wheels. */
const STEERING_RATIO = 10.5;
/** Beyond this the hands cross over; F1 wheels rarely exceed it outside Monaco. */
const MAX_WHEEL_DEG = 110;
/** Heading is measured across ±HEADING_SPAN samples (~±20 m) to damp GPS noise. */
const HEADING_SPAN = 3;

function wrapAngle(rad: number): number {
  let a = rad;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

function heading(points: readonly TracePoint[], i: number): number {
  const a = points[Math.max(0, i - 1)];
  const b = points[Math.min(points.length - 1, i + 1)];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Estimated steering-wheel angle per sample, in degrees. Positive means the
 * wheel is turned clockwise (a right-hand corner), which matches SVG and CSS
 * `rotate()`.
 *
 * Curvature κ = dθ/ds from the trace; front-wheel angle ≈ atan(L·κ) for a car
 * of wheelbase L; the steering ratio scales that up to the wheel. Checked
 * against `g_lat`: the two agree on the direction of every corner.
 */
export function steeringAngles(points: readonly TracePoint[]): number[] {
  const n = points.length;
  if (n < 3) {
    return points.map(() => 0);
  }

  const raw = points.map((_, i) => {
    const a = Math.max(0, i - HEADING_SPAN);
    const b = Math.min(n - 1, i + HEADING_SPAN);
    const da = points[a].distanceM;
    const db = points[b].distanceM;
    const ds = da != null && db != null ? db - da : null;
    if (ds == null || ds < 1) {
      return 0;
    }
    const kappa = wrapAngle(heading(points, b) - heading(points, a)) / ds;
    const frontWheelDeg = (Math.atan(WHEELBASE_M * kappa) * 180) / Math.PI;
    // κ > 0 turns left (counter-clockwise, y-up), which is an anticlockwise
    // wheel, i.e. a negative rotation.
    const wheel = -frontWheelDeg * STEERING_RATIO;
    return Math.max(-MAX_WHEEL_DEG, Math.min(MAX_WHEEL_DEG, wheel));
  });

  // A short moving average so the wheel eases in and out of corners.
  return raw.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - 2); j <= Math.min(n - 1, i + 2); j++) {
      sum += raw[j];
      count++;
    }
    return sum / count;
  });
}

/**
 * Rotate a point counter-clockwise by `degrees` about the origin — the same
 * transform FastF1 applies with a circuit's `rotation` to draw it the way the
 * official track map is drawn.
 */
export function rotate(point: XY, degrees: number): XY {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  };
}

/** Index of the sample closest to `target` on the plane. */
export function nearestIndex(points: readonly XY[], target: XY): number {
  let best = -1;
  let bestD = Number.POSITIVE_INFINITY;
  points.forEach((p, i) => {
    const d = (p.x - target.x) ** 2 + (p.y - target.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/**
 * Sample indices where sector 2 and sector 3 begin, located by elapsed time
 * in the lap against the lap's official sector times.
 */
export function sectorSplitIndices(
  timesInLapMs: readonly (number | null)[],
  sector1Ms: number | null,
  sector2Ms: number | null,
): [number, number] | null {
  if (sector1Ms == null || sector2Ms == null || timesInLapMs.length === 0) {
    return null;
  }
  const firstAtOrAfter = (ms: number) => {
    const i = timesInLapMs.findIndex((t) => t != null && t >= ms);
    return i < 0 ? timesInLapMs.length - 1 : i;
  };
  return [firstAtOrAfter(sector1Ms), firstAtOrAfter(sector1Ms + sector2Ms)];
}
