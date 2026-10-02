/**
 * Perspective camera for the Race Replay HUD's tilted circuit.
 *
 * The world is the flat track plane from `hudGeometry` with z pointing up.
 * Cameras yaw around the plane, tilt back from straight-down, and project
 * with a pinhole of distance D. Everything is SVG path strings: no WebGL.
 */
import { placeOnTrack, type HudTrack } from "./hudGeometry";

export type HudCamera = {
  mode: "overview" | "chase";
  yaw: number;
  tilt: number;
  D: number;
  k: number;
  /** World point the camera looks at. */
  cx: number;
  cy: number;
  /** Where that point lands on screen. */
  ox: number;
  oy: number;
};

/** Screen x, screen y, and the perspective scale at that depth. */
export type Projected = [number, number, number];
export type Projector = (x: number, y: number, z: number) => Projected | null;

/** The stage the design was drawn for; chase framing scales from it. */
const DESIGN_W = 1248;
const DESIGN_H = 900;

export function projector(cm: HudCamera): Projector {
  const cy = Math.cos(cm.yaw);
  const sy = Math.sin(cm.yaw);
  const ct = Math.cos(cm.tilt);
  const st = Math.sin(cm.tilt);
  const D = cm.D;
  return (x, y, z) => {
    const X0 = x - cm.cx;
    const Y0 = y - cm.cy;
    const X = X0 * cy - Y0 * sy;
    const Y = X0 * sy + Y0 * cy;
    const Yr = Y * ct - z * st;
    const Zr = Y * st + z * ct;
    const dep = D - Zr;
    if (dep < D * 0.3) return null;
    const f = (D / dep) * cm.k;
    return [cm.ox + X * f, cm.oy + Yr * f, f];
  };
}

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * The fixed, whole-circuit view. Real circuits vary in shape, so the yaw is
 * whichever 15° step lets the track fill the stage at the largest scale; near
 * ties go to the official map orientation (yaw 0).
 */
export function overviewCamera(track: HudTrack, W: number, H: number): HudCamera {
  const fitW = W * 0.56;
  const fitH = H * 0.68;
  let best: { yaw: number; kk: number; x0: number; x1: number; y0: number; y1: number } | null = null;
  for (let step = 0; step < 24; step++) {
    const yaw = (step * 15 * Math.PI) / 180;
    const pr = projector({ mode: "overview", yaw, tilt: 0.98, D: 1700, k: 1, cx: track.center.x, cy: track.center.y, ox: 0, oy: 0 });
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const s of track.pts) {
      const p = pr(s.x, s.y, 0);
      if (!p) continue;
      x0 = Math.min(x0, p[0]);
      x1 = Math.max(x1, p[0]);
      y0 = Math.min(y0, p[1]);
      y1 = Math.max(y1, p[1]);
    }
    const kk = Math.min(fitW / Math.max(x1 - x0, 1), fitH / Math.max(y1 - y0, 1));
    const closer = best != null && Math.abs(wrapAngle(yaw)) < Math.abs(wrapAngle(best.yaw));
    if (best == null || kk > best.kk * 1.03 || (kk > best.kk * 0.97 && closer)) best = { yaw, kk, x0, x1, y0, y1 };
  }
  const b = best!;
  return {
    mode: "overview",
    yaw: b.yaw,
    tilt: 0.98,
    D: 1700,
    k: b.kk,
    cx: track.center.x,
    cy: track.center.y,
    ox: W * 0.5 - ((b.x0 + b.x1) / 2) * b.kk,
    oy: H * 0.505 - ((b.y0 + b.y1) / 2) * b.kk,
  };
}

/**
 * Rides behind the followed car, looking 150 units down the track. The yaw
 * eases toward the car's heading so corners swing smoothly into view.
 * Optional orbit offsets let the user drag around that chase framing.
 */
export function chaseCamera(
  track: HudTrack,
  fi: number,
  lateral: number,
  prevYaw: number | null,
  dtSec: number,
  W: number,
  H: number,
  snap: boolean,
  orbit: { yaw: number; tilt: number } = { yaw: 0, tilt: 0 },
): { camera: HudCamera; baseYaw: number } {
  const p = placeOnTrack(track, fi, lateral);
  const q = placeOnTrack(track, fi + 7, 0);
  const heading = Math.atan2(q.y - p.y, q.x - p.x);
  const target = -Math.PI / 2 - heading;
  const baseYaw =
    prevYaw == null || snap
      ? target
      : prevYaw + wrapAngle(target - prevYaw) * Math.min(1, dtSec * 3.2);
  const yaw = baseYaw + orbit.yaw;
  const tilt = Math.min(1.38, Math.max(0.42, 1.08 + orbit.tilt));
  const orbiting = Math.abs(orbit.yaw) > 0.02 || Math.abs(orbit.tilt) > 0.02;
  // Free-look orbits the car itself; default chase still looks ahead.
  const ahead = -Math.PI / 2 - baseYaw;
  const look = orbiting
    ? p
    : { x: p.x + Math.cos(ahead) * 150, y: p.y + Math.sin(ahead) * 150 };
  const s = Math.min(W / DESIGN_W, H / DESIGN_H);
  return {
    baseYaw,
    camera: {
      mode: "chase",
      yaw,
      tilt,
      D: orbiting ? 820 : 760,
      k: 1.9 * s,
      cx: look.x,
      cy: look.y,
      ox: W * 0.5,
      oy: H * 0.489,
    },
  };
}

export type HudGate = { pts: string; top: string; pl: string; pr: string; color: string };
export type HudGateLabel = { x: number; y: number; color: string; label: string };

export type HudWorld = {
  gridD: string;
  runD: string;
  kerbW: string;
  kerbR: string;
  edgeD: string;
  asphD: string;
  drsGlow: string;
  drsD: string;
  sfD: string;
  gates: HudGate[];
  gateLabels: HudGateLabel[];
  pr: Projector;
};

const f1 = (v: number) => v.toFixed(1);

/** Track bands, ground grid and sector gates, as seen through `cm`. */
export function buildWorld(track: HudTrack, cm: HudCamera, W: number, H: number, sectorColors: readonly string[]): HudWorld {
  const { M, pts, normals } = track;
  const pr = projector(cm);
  const edges = new Map<number, [(Projected | null)[], (Projected | null)[]]>();
  const edge = (hw: number) => {
    const cached = edges.get(hw);
    if (cached) return cached;
    const L: (Projected | null)[] = [];
    const R: (Projected | null)[] = [];
    for (let i = 0; i < M; i++) {
      const s = pts[i];
      const nn = normals[i];
      L.push(pr(s.x + nn.x * hw, s.y + nn.y * hw, 0));
      R.push(pr(s.x - nn.x * hw, s.y - nn.y * hw, 0));
    }
    const pair: [(Projected | null)[], (Projected | null)[]] = [L, R];
    edges.set(hw, pair);
    return pair;
  };
  const band = (hw: number, keep?: (i: number) => boolean) => {
    const [L, R] = edge(hw);
    let out = "";
    for (let i = 0; i < M; i++) {
      if (keep && !keep(i)) continue;
      const j = (i + 1) % M;
      const a = L[i];
      const b = L[j];
      const c = R[j];
      const d = R[i];
      if (!a || !b || !c || !d) continue;
      if (Math.max(a[0], b[0], c[0], d[0]) < -60 || Math.min(a[0], b[0], c[0], d[0]) > W + 60) continue;
      if (Math.max(a[1], b[1], c[1], d[1]) < -60 || Math.min(a[1], b[1], c[1], d[1]) > H + 60) continue;
      out += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(c[0])} ${f1(c[1])}L${f1(d[0])} ${f1(d[1])}Z`;
    }
    return out;
  };

  let gridD = "";
  const G = 140;
  const gx = Math.round(cm.cx / G) * G;
  const gy = Math.round(cm.cy / G) * G;
  for (let a = -10; a <= 10; a++) {
    for (const dir of [0, 1]) {
      let pen = false;
      for (let b = -10; b <= 10; b++) {
        const x = dir ? gx + a * G : gx + b * G;
        const y = dir ? gy + b * G : gy + a * G;
        const p = pr(x, y, 0);
        if (!p || p[0] < -400 || p[0] > W + 400 || p[1] < -200 || p[1] > H + 200) {
          pen = false;
          continue;
        }
        gridD += `${pen ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`;
        pen = true;
      }
    }
  }

  const gates: HudGate[] = [];
  const gateLabels: HudGateLabel[] = [];
  const gateAt: [number, string, string][] = [[0, "#FFFFFF", "S1"]];
  if (track.sectors) {
    gateAt.push([track.sectors[0], sectorColors[1], "S2"], [track.sectors[1], sectorColors[2], "S3"]);
  }
  for (const [i, color, label] of gateAt) {
    const s = pts[i];
    const nn = normals[i];
    const h = 34;
    const w = 19;
    const corners = [
      pr(s.x + nn.x * w, s.y + nn.y * w, 0),
      pr(s.x - nn.x * w, s.y - nn.y * w, 0),
      pr(s.x - nn.x * w, s.y - nn.y * w, h),
      pr(s.x + nn.x * w, s.y + nn.y * w, h),
    ];
    if (corners.some((p) => !p)) continue;
    const [p0, p1, p2, p3] = corners as Projected[];
    const q = (p: Projected) => `${f1(p[0])},${f1(p[1])}`;
    gates.push({ pts: [p0, p1, p2, p3].map(q).join(" "), top: `${q(p3)} ${q(p2)}`, pl: `${q(p0)} ${q(p3)}`, pr: `${q(p1)} ${q(p2)}`, color });
    const tl = pr(s.x, s.y, h + 4);
    if (tl) gateLabels.push({ x: tl[0], y: tl[1], color, label });
  }

  return {
    gridD,
    runD: band(34),
    kerbW: band(17.5, (i) => track.kerb[i] && i % 2 === 0),
    kerbR: band(17.5, (i) => track.kerb[i] && i % 2 === 1),
    edgeD: band(15.5),
    asphD: band(13.5),
    drsGlow: band(5, (i) => track.drs[i]),
    drsD: band(1.6, (i) => track.drs[i]),
    sfD: band(13.5, (i) => i === 0),
    gates,
    gateLabels,
    pr,
  };
}

/** The followed car's trail from the line to where it is now. */
export function trailPath(track: HudTrack, pr: Projector, fi: number): string {
  const end = Math.floor(fi);
  if (end <= 2) return "";
  let out = "";
  let prev: [Projected | null, Projected | null] | null = null;
  for (let i = 0; i <= end && i < track.M; i++) {
    const s = track.pts[i];
    const nn = track.normals[i];
    const cur: [Projected | null, Projected | null] = [pr(s.x + nn.x * 3, s.y + nn.y * 3, 0), pr(s.x - nn.x * 3, s.y - nn.y * 3, 0)];
    if (prev) {
      const [a, d] = prev;
      const [b, c] = cur;
      if (a && b && c && d) out += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(c[0])} ${f1(c[1])}L${f1(d[0])} ${f1(d[1])}Z`;
    }
    prev = cur;
  }
  return out;
}
