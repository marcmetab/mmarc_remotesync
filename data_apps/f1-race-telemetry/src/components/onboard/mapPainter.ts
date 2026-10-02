/**
 * Draws the onboard map on a 2D canvas: world geometry is pre-built as Path2D
 * once per lap, then each frame only sets the camera transform, strokes what
 * is in view, and places upright labels in screen space.
 */
import type { OnboardMap } from "../../lib/onboardMap";
import { SECTOR_COLORS, speedColor } from "../CircuitMap";

export type MapRival = { driverNumber: number; x: number; y: number; color: string; abbr: string; ahead: number };

export type MapCamera = {
  width: number;
  height: number;
  dpr: number;
  /** Car position (m) and where it sits on screen. */
  carX: number;
  carY: number;
  anchorX: number;
  anchorY: number;
  /** Pixels per metre. */
  scale: number;
  /** World rotation (radians) applied before drawing; heading-up or map-up. */
  rotation: number;
  /** The car's heading in world radians, for the arrow. */
  heading: number;
  /** Car's distance along the line (m), to fade what's behind. */
  distance: number;
  color: string;
  rivals: readonly MapRival[];
  /** Everything labelled; otherwise only what's next (calm view). */
  detail: boolean;
};

const FONT = '"Barlow Condensed", "Titillium Web", system-ui, sans-serif';
const TRACK_WIDTH = 13;

type Chunk = { path: Path2D; cx: number; cy: number; r: number; color: string; mid: number };

export function createMapPainter(map: OnboardMap) {
  const { n, x, y, length } = map;
  const at = (d: number) => {
    const w = (((d / length) * n) % n + n) % n;
    const i = Math.floor(w);
    const j = (i + 1) % n;
    const t = w - i;
    return { x: x[i] + (x[j] - x[i]) * t, y: y[i] + (y[j] - y[i]) * t };
  };
  const pathBetween = (from: number, to: number) => {
    const p = new Path2D();
    const span = ((to - from) % length + length) % length;
    if (span <= 0) return p;
    const steps = Math.max(2, Math.ceil(span / map.step));
    for (let s = 0; s <= steps; s++) {
      const q = at(from + (span * s) / steps);
      if (s === 0) p.moveTo(q.x, q.y);
      else p.lineTo(q.x, q.y);
    }
    return p;
  };

  const track = new Path2D();
  for (let k = 0; k <= n; k++) {
    const i = k % n;
    if (k === 0) track.moveTo(x[i], y[i]);
    else track.lineTo(x[i], y[i]);
  }

  // The driven line in short chunks, each one colour, with a bounding circle for culling.
  const [lo, hi] = map.speedRange;
  const chunks: Chunk[] = [];
  const CHUNK = 5;
  for (let k = 0; k < n; k += CHUNK) {
    const path = new Path2D();
    let sx = 0;
    let sy = 0;
    let vs = 0;
    let vc = 0;
    const count = Math.min(CHUNK, n - k);
    for (let m = 0; m <= count; m++) {
      const i = (k + m) % n;
      if (m === 0) path.moveTo(x[i], y[i]);
      else path.lineTo(x[i], y[i]);
      sx += x[i];
      sy += y[i];
      if (Number.isFinite(map.speed[i])) { vs += map.speed[i]; vc++; }
    }
    const cx = sx / (count + 1);
    const cy = sy / (count + 1);
    let r = 0;
    for (let m = 0; m <= count; m++) { const i = (k + m) % n; r = Math.max(r, Math.hypot(x[i] - cx, y[i] - cy)); }
    const v = vc > 0 ? vs / vc : Number.NaN;
    chunks.push({ path, cx, cy, r, color: Number.isFinite(v) ? speedColor((v - lo) / Math.max(hi - lo, 1)) : "#6B7487", mid: ((k + count / 2) / n) * length });
  }

  const brakePaths = map.brakes.map((b) => pathBetween(b.from, b.to));
  const drsPaths = map.drs.map((z) => pathBetween(z.from, z.to));

  /** A short line across the track at a line distance. */
  const across = (d: number, half: number) => {
    const a = at(d - 2);
    const b = at(d + 2);
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / l;
    const ny = (b.x - a.x) / l;
    const c = at(d);
    return { x0: c.x + nx * half, y0: c.y + ny * half, x1: c.x - nx * half, y1: c.y - ny * half, cx: c.x, cy: c.y };
  };

  /** Boxes already drawn this frame, so later labels can step around them. */
  let placed: { x: number; y: number; w: number }[] = [];
  const label = (ctx: CanvasRenderingContext2D, text: string, sx: number, y0: number, fg: string, bg: string, border?: string) => {
    ctx.font = `italic 700 13px ${FONT}`;
    const w = ctx.measureText(text).width + 10;
    let sy = y0;
    for (const dy of [0, -20, 20, -40, 40, -60]) {
      if (!placed.some((b) => Math.abs(b.x - sx) < (b.w + w) / 2 + 3 && Math.abs(b.y - (y0 + dy)) < 19)) {
        sy = y0 + dy;
        break;
      }
    }
    placed.push({ x: sx, y: sy, w });
    ctx.fillStyle = bg;
    ctx.fillRect(sx - w / 2, sy - 9, w, 18);
    if (border) {
      ctx.fillStyle = border;
      ctx.fillRect(sx - w / 2, sy - 9, 3, 18);
    }
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, sx + (border ? 1.5 : 0), sy + 0.5);
  };

  return {
    draw(ctx: CanvasRenderingContext2D, cam: MapCamera) {
      const { width: W, height: H, dpr, scale, rotation } = cam;
      // Labels keep clear of the car's own arrow.
      placed = [{ x: cam.anchorX, y: cam.anchorY, w: 34 }];
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const toScreen = (wx: number, wy: number) => {
        const dx = wx - cam.carX;
        const dy = wy - cam.carY;
        return { x: cam.anchorX + (dx * cos - dy * sin) * scale, y: cam.anchorY - (dx * sin + dy * cos) * scale };
      };
      const onScreen = (p: { x: number; y: number }, m = 40) => p.x > -m && p.x < W + m && p.y > -m && p.y < H + m;
      const viewR = Math.hypot(W, H) / scale;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0b0f16";
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(cam.anchorX, cam.anchorY);
      ctx.scale(scale, -scale);
      ctx.rotate(rotation);
      ctx.translate(-cam.carX, -cam.carY);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Track: edge, asphalt, then DRS and braking zones on the surface.
      ctx.strokeStyle = "#39414f";
      ctx.lineWidth = TRACK_WIDTH + 2.4;
      ctx.stroke(track);
      ctx.strokeStyle = "#171c25";
      ctx.lineWidth = TRACK_WIDTH;
      ctx.stroke(track);
      ctx.strokeStyle = "rgba(34,197,94,0.16)";
      ctx.lineWidth = TRACK_WIDTH;
      drsPaths.forEach((p) => ctx.stroke(p));
      ctx.strokeStyle = "rgba(232,0,45,0.30)";
      ctx.lineWidth = TRACK_WIDTH * 0.72;
      brakePaths.forEach((p) => ctx.stroke(p));

      // The driven line coloured by speed; what's behind the car is faded.
      ctx.lineWidth = Math.max(2.2, 3.2 / scale);
      for (const c of chunks) {
        if (Math.hypot(c.cx - cam.carX, c.cy - cam.carY) - c.r > viewR) continue;
        const ahead = ((c.mid - cam.distance) % length + length) % length;
        ctx.globalAlpha = ahead > length * 0.5 ? 0.32 : 1;
        ctx.strokeStyle = c.color;
        ctx.stroke(c.path);
      }
      ctx.globalAlpha = 1;

      // Start/finish and sector lines across the track.
      const lines: [number, string][] = [[0, "#F4F6F8"], ...map.sectors.map((d, i) => [d, SECTOR_COLORS[i + 1] ?? "#FFFFFF"] as [number, string])];
      ctx.lineWidth = 1.6;
      for (const [d, color] of lines) {
        const a = across(d, TRACK_WIDTH / 2 + 3);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(a.x0, a.y0);
        ctx.lineTo(a.x1, a.y1);
        ctx.stroke();
      }
      ctx.restore();

      // Screen-space labels stay upright whatever the map's rotation.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const aheadOf = (d: number) => ((d - cam.distance) % length + length) % length;
      // Calm view: only the next corner is numbered.
      const nextCorner = map.corners.reduce<(typeof map.corners)[number] | null>(
        (best, cn) => (best == null || aheadOf(cn.at) < aheadOf(best.at) ? cn : best),
        null,
      );
      for (const cn of map.corners) {
        if (!cam.detail && cn !== nextCorner) continue;
        const p = toScreen(cn.x, cn.y);
        if (!onScreen(p)) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(11,15,22,0.85)";
        ctx.fill();
        ctx.strokeStyle = "#5b6577";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = "#C9CFDB";
        ctx.font = `italic 700 12px ${FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cn.label, p.x, p.y + 0.5);
      }
      lines.forEach(([d, color], i) => {
        if (i === 0 || !cam.detail) return;
        const a = across(d, TRACK_WIDTH / 2 + 12);
        const p = toScreen(a.x0, a.y0);
        if (onScreen(p)) label(ctx, `S${i + 1}`, p.x, p.y, color, "rgba(11,15,22,0.85)");
      });
      // Calm view: only the braking zone the car is in or heading for.
      const nextBrake = map.brakes.reduce<(typeof map.brakes)[number] | null>(
        (best, b) => (best == null || aheadOf(b.to) < aheadOf(best.to) ? b : best),
        null,
      );
      for (const b of map.brakes) {
        const ahead = aheadOf(b.from);
        if (cam.detail ? ahead > length * 0.5 : b !== nextBrake) continue;
        const start = at(b.from);
        const p = toScreen(start.x, start.y);
        if (!onScreen(p)) continue;
        const text = `${b.entryKmh != null ? Math.round(b.entryKmh) : "—"} → ${b.minKmh != null ? Math.round(b.minKmh) : "—"}`;
        label(ctx, text, p.x + 34, p.y, "#FFD6DC", "rgba(92,10,22,0.88)");
      }

      // Calm view names only the car directly ahead and directly behind.
      let ahead: MapRival | null = null;
      let behind: MapRival | null = null;
      for (const r of cam.rivals) {
        if (r.ahead >= 0 && (ahead == null || r.ahead < ahead.ahead)) ahead = r;
        if (r.ahead < 0 && (behind == null || r.ahead > behind.ahead)) behind = r;
      }
      for (const r of cam.rivals) {
        const p = toScreen(r.x, r.y);
        if (!onScreen(p, 20)) continue;
        const named = cam.detail || r === ahead || r === behind;
        ctx.beginPath();
        ctx.arc(p.x, p.y, named ? 6.5 : 5, 0, Math.PI * 2);
        ctx.globalAlpha = named ? 1 : 0.75;
        ctx.fillStyle = r.color;
        ctx.fill();
        ctx.lineWidth = named ? 1.6 : 1;
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (!named) continue;
        const gap = Math.abs(r.ahead) < 1000 ? `${r.ahead >= 0 ? "+" : "−"}${Math.round(Math.abs(r.ahead))} m` : "";
        label(ctx, `${r.abbr} ${gap}`.trim(), p.x, p.y - 17, "#FFFFFF", "rgba(8,10,14,0.88)", r.color);
      }

      // The car: an arrow on the anchor, pointing along its heading.
      const screenAngle = -(cam.heading + rotation);
      ctx.save();
      ctx.translate(cam.anchorX, cam.anchorY);
      ctx.rotate(screenAngle + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(10, 11);
      ctx.lineTo(0, 5);
      ctx.lineTo(-10, 11);
      ctx.closePath();
      ctx.fillStyle = cam.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();
      ctx.restore();
    },
  };
}
