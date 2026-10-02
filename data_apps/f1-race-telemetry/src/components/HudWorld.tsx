import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { buildWorld, chaseCamera, overviewCamera, trailPath, type HudCamera } from "../lib/hudCamera";
import { placeOnTrack, type HudTrack } from "../lib/hudGeometry";
import { raceProgressAt, type RaceMotionIndex } from "../lib/raceMotion";
import { SECTOR_COLORS } from "./CircuitMap";

export type HudCameraMode = "overview" | "chase";

/** Identity and broadcast-tag content for one car, prepared by the page. */
export type HudCarInfo = {
  driverNumber: number;
  abbr: string;
  color: string;
  position: number | null;
  /** Present when the car earns a broadcast tag: top 3, battle, fastest lap. */
  tag: { note: string; noteColor: string } | null;
};

const FRAME_S = 1 / 30;
const EDGE_GREEN = "#6A7485";
const ORBIT_YAW_PER_PX = 0.0055;
const ORBIT_TILT_PER_PX = 0.004;
const DRAG_CLICK_PX = 5;

type OrbitOffset = { yaw: number; tilt: number };
const ZERO_ORBIT: OrbitOffset = { yaw: 0, tilt: 0 };

/**
 * The tilted 3D circuit: ground grid, run-off, kerbs, DRS zones, sector gates,
 * and every car as a ground dot with a stick up to its marker. Cars move from
 * the shared playhead on their own ~30fps loop, as the old flat map did.
 */
export function HudWorld({
  track,
  width,
  height,
  mode,
  motionIndex,
  timeRef,
  timeMs,
  playing,
  followedNumber,
  cars,
  edgeColor,
  onFollow,
}: {
  track: HudTrack;
  width: number;
  height: number;
  mode: HudCameraMode;
  motionIndex: RaceMotionIndex;
  timeRef: { current: number | null };
  timeMs: number | null;
  playing: boolean;
  followedNumber: number | null;
  cars: ReadonlyMap<number, HudCarInfo>;
  /** Track-limit colour; null while the track is green. */
  edgeColor: string | null;
  onFollow: (driverNumber: number) => void;
}) {
  const uid = useId().replace(/:/g, "");
  const [frame, setFrame] = useState<{ t: number | null; cam: HudCamera | null }>({ t: timeMs, cam: null });
  const [orbit, setOrbit] = useState<OrbitOffset>(ZERO_ORBIT);
  const yawRef = useRef<number | null>(null);
  const orbitRef = useRef<OrbitOffset>(ZERO_ORBIT);
  const timeMsRef = useRef(timeMs);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    origin: OrbitOffset;
    moved: boolean;
  } | null>(null);
  timeMsRef.current = timeMs;
  orbitRef.current = orbit;

  const overview = useMemo(() => overviewCamera(track, width, height), [track, width, height]);
  const overviewWorld = useMemo(() => buildWorld(track, overview, width, height, SECTOR_COLORS), [track, overview, width, height]);

  // Leaving chase / changing the followed car drops free-look back to default.
  useEffect(() => {
    setOrbit(ZERO_ORBIT);
    orbitRef.current = ZERO_ORBIT;
    if (mode !== "chase") yawRef.current = null;
  }, [mode, followedNumber]);

  // Playback and the chase camera's easing both advance here. While paused
  // the loop only runs until the chase camera settles on its target — unless
  // the user is free-looking, which always needs fresh frames.
  const pausedAt = playing ? null : timeMs;
  const orbiting = Math.abs(orbit.yaw) > 0.001 || Math.abs(orbit.tilt) > 0.001;
  useEffect(() => {
    if (mode !== "chase") yawRef.current = null;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let raf = 0;
    let last = performance.now();
    let acc = FRAME_S;
    const step = (now: number) => {
      acc += Math.min(now - last, 120) / 1000;
      last = now;
      if (acc >= FRAME_S) {
        const t = playing ? timeRef.current ?? timeMsRef.current : timeMsRef.current;
        let cam: HudCamera | null = null;
        let settled = true;
        if (mode === "chase" && followedNumber != null) {
          const car = raceProgressAt(motionIndex, t).find((c) => c.driverNumber === followedNumber);
          if (car) {
            const prev = yawRef.current;
            const next = chaseCamera(
              track,
              track.indexAt(car.progress),
              car.pitBlend,
              prev,
              acc,
              width,
              height,
              reduceMotion,
              orbitRef.current,
            );
            cam = next.camera;
            settled =
              prev != null &&
              Math.abs(Math.atan2(Math.sin(next.baseYaw - prev), Math.cos(next.baseYaw - prev))) < 0.0015 &&
              !orbiting;
            yawRef.current = next.baseYaw;
          }
        }
        acc = 0;
        setFrame({ t, cam });
        if (!playing && settled && !orbiting) return;
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [playing, pausedAt, mode, followedNumber, track, motionIndex, width, height, timeRef, orbiting]);

  const cam = mode === "chase" && frame.cam ? frame.cam : overview;
  const world = useMemo(
    () => (cam === overview ? overviewWorld : buildWorld(track, cam, width, height, SECTOR_COLORS)),
    [cam, overview, overviewWorld, track, width, height],
  );

  const scene = useMemo(() => {
    const pr = world.pr;
    const progress = raceProgressAt(motionIndex, frame.t);
    const followed = progress.find((c) => c.driverNumber === followedNumber) ?? null;
    type Dot = { key: number; z: number; gx: number; gy: number; tx: number; ty: number; gr: number; pr: number; lw: number; hr: number; head: string; color: string; o: number; abbr: string };
    type Tag = { key: number; z: number; x: number; y: number; pos: string; abbr: string; color: string; note: string; noteColor: string; followed: boolean };
    const dots: Dot[] = [];
    const tags: Tag[] = [];
    const nums: { key: number; x: number; y: number; pos: string }[] = [];
    for (const car of progress) {
      const info = cars.get(car.driverNumber);
      const fi = track.indexAt(car.progress);
      const p = placeOnTrack(track, fi, car.pitBlend);
      const gp = pr(p.x, p.y, 0);
      const tp = pr(p.x, p.y, 30);
      if (!gp || !tp || gp[0] < -40 || gp[0] > width + 40 || gp[1] < -40 || gp[1] > height + 40) continue;
      const isF = car.driverNumber === followedNumber;
      const s = gp[2];
      const color = info?.color ?? "#6B7280";
      const abbr = info?.abbr ?? String(car.driverNumber);
      dots.push({
        key: car.driverNumber,
        z: s,
        gx: gp[0],
        gy: gp[1],
        tx: tp[0],
        ty: tp[1],
        gr: 18 * s * (isF ? 1.5 : 1),
        pr: Math.max(2.5, 6 * s),
        lw: Math.max(1.5, (isF ? 3.4 : 2.2) * s),
        hr: Math.max(2.5, (isF ? 5.5 : 3.6) * s),
        head: isF ? "#FFFFFF" : "#06080C",
        color,
        o: car.inPit ? 0.45 : 1,
        abbr,
      });
      const pos = info?.position != null ? String(info.position) : "–";
      if (isF || car.inPit || info?.tag) {
        tags.push({
          key: car.driverNumber,
          z: s,
          x: tp[0],
          y: tp[1],
          pos,
          abbr,
          color,
          note: car.inPit ? "PIT" : isF ? "" : info?.tag?.note ?? "",
          noteColor: car.inPit ? "#F59E0B" : info?.tag?.noteColor ?? "#C9CFDB",
          followed: isF,
        });
      } else {
        nums.push({ key: car.driverNumber, x: tp[0], y: tp[1] - 5, pos });
      }
    }
    dots.sort((a, b) => a.z - b.z);
    tags.sort((a, b) => a.z - b.z);

    // Nudge overlapping tags up or down, far cars first.
    const placed: { x: number; y: number }[] = [];
    const tagsPlaced = tags.map((t) => {
      let dy = 0;
      for (const d of [0, -24, -48, 24]) {
        if (!placed.some((q) => Math.abs(q.x - t.x) < 70 && Math.abs(q.y - (t.y + d)) < 22)) {
          dy = d;
          break;
        }
      }
      placed.push({ x: t.x, y: t.y + dy });
      return { ...t, y: t.y + dy };
    });
    const busy = [...tagsPlaced.map((t) => [t.x, t.y - 16]), ...world.gateLabels.map((g) => [g.x, g.y - 8])];
    const kept: number[][] = [];
    const numsPlaced = nums.filter((n) => {
      if (busy.some(([bx, by]) => Math.abs(bx - n.x) < 36 && Math.abs(by - n.y) < 18)) return false;
      if (kept.some(([kx, ky]) => Math.abs(kx - n.x) < 14 && Math.abs(ky - n.y) < 14)) return false;
      kept.push([n.x, n.y]);
      return true;
    });

    const trail = followed && !followed.inPit ? trailPath(track, pr, track.indexAt(followed.progress)) : "";
    return { dots, tags: tagsPlaced, nums: numsPlaced, trail };
  }, [world, motionIndex, frame.t, followedNumber, cars, track, width, height]);

  const followedColor = cars.get(followedNumber ?? -1)?.color ?? "#FFFFFF";
  const chk = `hud-chk-${uid}`;

  const onOrbitPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mode !== "chase" || event.button !== 0) return;
    // Clicks on cars still select/follow; only empty-stage drags orbit.
    const target = event.target as Element | null;
    if (target?.closest?.(".hud-car")) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: orbitRef.current,
      moved: false,
    };
  };

  const onOrbitPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_CLICK_PX) return;
    drag.moved = true;
    const next = {
      yaw: drag.origin.yaw - dx * ORBIT_YAW_PER_PX,
      tilt: Math.min(0.3, Math.max(-0.66, drag.origin.tilt + dy * ORBIT_TILT_PER_PX)),
    };
    orbitRef.current = next;
    setOrbit(next);
  };

  const onOrbitPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      /* already released */
    }
  };

  const resetOrbit = () => {
    orbitRef.current = ZERO_ORBIT;
    setOrbit(ZERO_ORBIT);
  };

  return (
    <div
      className={`hud-world-stage${mode === "chase" ? " is-chase" : ""}${orbiting ? " is-orbiting" : ""}`}
      onPointerDown={onOrbitPointerDown}
      onPointerMove={onOrbitPointerMove}
      onPointerUp={onOrbitPointerUp}
      onPointerCancel={onOrbitPointerUp}
      onDoubleClick={() => {
        if (mode === "chase") resetOrbit();
      }}
      title={mode === "chase" ? "Drag to orbit · double-click to reset chase" : undefined}
    >
      <svg className="hud-world-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
        <defs>
          <pattern id={chk} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#F8FAFC" />
            <rect width="3" height="3" fill="#0A0C10" />
            <rect x="3" y="3" width="3" height="3" fill="#0A0C10" />
          </pattern>
        </defs>
        <path d={world.gridD} fill="none" stroke="rgba(110,140,190,0.10)" strokeWidth={1} />
        <path d={world.runD} fill="#111620" />
        <path d={world.kerbW} fill="#DDE3EC" />
        <path d={world.kerbR} fill="#D4101C" />
        <path d={world.edgeD} fill={edgeColor ?? EDGE_GREEN} />
        <path d={world.asphD} fill="#1D232E" />
        <path d={world.drsGlow} fill="#22C55E" opacity={0.2} />
        <path d={world.drsD} fill="#4ADE80" opacity={0.9} />
        {scene.trail && <path d={scene.trail} fill={followedColor} opacity={0.9} />}
        <path d={world.sfD} fill={`url(#${chk})`} />
        {world.gates.map((g) => (
          <g key={g.pts}>
            <polygon points={g.pts} fill={g.color} opacity={0.12} />
            <polyline points={g.top} fill="none" stroke={g.color} strokeWidth={2.5} strokeLinecap="round" />
            <polyline points={g.pl} fill="none" stroke={g.color} strokeWidth={1.5} opacity={0.7} />
            <polyline points={g.pr} fill="none" stroke={g.color} strokeWidth={1.5} opacity={0.7} />
          </g>
        ))}
        {scene.dots.map((c) => (
          <g key={c.key} className="hud-car" onClick={() => onFollow(c.key)}>
            <title>{c.abbr}</title>
            <circle cx={c.gx} cy={c.gy} r={c.gr} fill={c.color} opacity={0.2} />
            <line x1={c.gx} y1={c.gy} x2={c.tx} y2={c.ty} stroke={c.color} strokeWidth={c.lw} strokeLinecap="round" opacity={0.85} />
            <circle cx={c.gx} cy={c.gy} r={c.pr} fill={c.color} stroke="#06080C" strokeWidth={1.5} />
            <circle cx={c.tx} cy={c.ty} r={c.hr} fill={c.head} stroke={c.color} strokeWidth={2} />
          </g>
        ))}
      </svg>
      <div className="hud-world-labels" aria-hidden="true">
        {world.gateLabels.map((g) => (
          <span key={g.label} className="hud-gate-label" style={{ left: g.x, top: g.y, color: g.color }}>{g.label}</span>
        ))}
        {scene.nums.map((n) => (
          <span key={n.key} className="hud-car-num" style={{ left: n.x, top: n.y }}>{n.pos}</span>
        ))}
        {scene.tags.map((t) => (
          <div key={t.key} className="hud-tag" style={{ left: t.x, top: t.y, outline: t.followed ? `2px solid ${t.color}` : "none" }}>
            <span className="hud-tag-pos">{t.pos}</span>
            <span className="hud-tag-name" style={{ borderLeftColor: t.color }}>
              {t.abbr}
              {t.note && <span style={{ color: t.noteColor }}>{t.note}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
