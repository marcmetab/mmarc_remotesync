import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { useEngineSound } from "../../audio/useEngineSound";
import type { CornerRow, DriverResult, LapRow, SessionOption } from "../../hooks/useRaceData";
import { useFieldMotion, type TelemetrySample } from "../../hooks/useTelemetry";
import { formatNumber, teamColor } from "../../lib/format";
import { rotate, steeringAngles } from "../../lib/lapGeometry";
import { buildOnboardMap, momentAt, type LapMoment } from "../../lib/onboardMap";
import { SPEED_GRADIENT } from "../CircuitMap";
import { SteeringWheel } from "../SteeringWheel";
import { createMapPainter, type MapRival } from "./mapPainter";
import "./OnboardView.css";

const SPEEDS = [0.5, 1, 2] as const;
/** React readouts refresh at ~30fps; the map redraws every frame. */
const HUD_INTERVAL_MS = 33;
const TIMING = { session: "#C084FC", personal: "#4ADE80", other: "#F5C518" };
/** Where the car sits on the map, as a share of the stage height: above the wheel. */
const ANCHOR_Y = 0.6;

export type OnboardTiming = {
  sessionSectors: (number | null)[];
  personalSectors: (number | null)[];
};

type Orientation = "heading" | "map";

function lapClock(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return m > 0 ? `${m}:${r.toFixed(3).padStart(6, "0")}` : r.toFixed(3);
}

/** A 1-2-5 length in metres that draws close to `px` wide at `scale`. */
function niceMetres(px: number, scale: number): number {
  const raw = px / scale;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((f) => f * pow).reduce((best, v) => (Math.abs(v - raw) < Math.abs(best - raw) ? v : best));
}

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * The driver's telemetry lap on a heading-up map: the circuit turns so the
 * car always points up, with the line ahead coloured by speed, braking zones
 * with their real entry and minimum speeds, and the real field around it.
 */
export function OnboardView({
  sessionId,
  session,
  driver,
  samples,
  lapRow,
  lapLabel,
  telemetryLap,
  totalLaps,
  corners,
  rotation,
  sectorSplits,
  timing,
  results,
  laps,
  initialTimeMs,
  onTimeCommit,
  soundOn,
  soundVolume,
  onSoundChange,
}: {
  sessionId: number | null;
  session: SessionOption | null;
  driver: DriverResult;
  samples: readonly TelemetrySample[];
  lapRow: LapRow | null;
  lapLabel: string;
  telemetryLap: number;
  totalLaps: number;
  corners: readonly CornerRow[];
  rotation: number;
  sectorSplits: [number, number] | null;
  timing: OnboardTiming;
  results: readonly DriverResult[];
  /** All lap rows of the session, to leave out cars that had already retired. */
  laps: readonly LapRow[];
  initialTimeMs: number;
  /** Called when playback pauses or the view closes, so other views pick up here. */
  onTimeCommit: (timeMs: number) => void;
  soundOn: boolean;
  soundVolume: number;
  onSoundChange: (on: boolean) => void;
}) {
  const color = teamColor(driver.teamColorRaw);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ordered = useMemo(() => [...samples].sort((a, b) => (a.timeInLapMs ?? 0) - (b.timeInLapMs ?? 0)), [samples]);
  const steer = useMemo(() => steeringAngles(ordered), [ordered]);
  const map = useMemo(() => buildOnboardMap(ordered, corners, sectorSplits), [ordered, corners, sectorSplits]);
  const painter = useMemo(() => (map ? createMapPainter(map) : null), [map]);
  const lapMs = useMemo(() => {
    const last = ordered[ordered.length - 1]?.timeInLapMs ?? 0;
    return Math.max(last, lapRow?.lapTimeMs ?? 0, 1);
  }, [ordered, lapRow?.lapTimeMs]);

  const reduceMotion = useMemo(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false, []);
  const [orientation, setOrientation] = useState<Orientation>(reduceMotion ? "map" : "heading");
  // Calm by default: only what's next is labelled until the viewer asks for everything.
  const [showAll, setShowAll] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const timeRef = useRef(Math.min(Math.max(initialTimeMs, 0), lapMs));
  const [hud, setHud] = useState<{ t: number; moment: LapMoment | null; scale: number; rotation: number }>(() => ({
    t: timeRef.current,
    moment: momentAt(ordered, steer, timeRef.current),
    scale: 1,
    rotation: 0,
  }));
  const dirtyRef = useRef(60);
  const live = useRef({ playing, speed, orientation, showAll });
  live.current = { playing, speed, orientation, showAll };

  const commitRef = useRef(onTimeCommit);
  commitRef.current = onTimeCommit;
  useEffect(() => () => commitRef.current(timeRef.current), []);

  // The real field, read at the exact frame time inside the loop.
  const byNumber = useMemo(() => new Map(results.map((r) => [r.driverNumber, r])), [results]);
  // A retired car keeps reporting its last position; only show cars still lapping.
  const lastLapEnd = useMemo(() => {
    const ends = new Map<number, number>();
    for (const l of laps) {
      if (l.lapEndMs != null && l.lapEndMs > (ends.get(l.driverNumber) ?? -Infinity)) ends.set(l.driverNumber, l.lapEndMs);
    }
    return ends;
  }, [laps]);
  const field = useFieldMotion(sessionId, hud.moment?.sessionTimeMs ?? null);
  const fieldAt = useRef(field.at);
  fieldAt.current = field.at;
  useEffect(() => {
    dirtyRef.current = Math.max(dirtyRef.current, 2);
  }, [field.at]);

  useEngineSound({
    enabled: soundOn,
    volume: soundVolume,
    playing,
    sample: hud.moment ? { rpm: hud.moment.rpm, throttle: hud.moment.throttle, gear: hud.moment.gear, brake: hud.moment.brake } : null,
    identity: `onboard:${sessionId ?? "none"}:${driver.driverNumber}:${telemetryLap}`,
  });

  useEffect(() => {
    dirtyRef.current = 30;
  }, [orientation, showAll]);

  // Size the canvas and run the frame loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !stage || !ctx || !map || !painter) return;
    let W = 1;
    let H = 1;
    let dpr = 1;
    // The band the car can use: below whatever sits over the centre at the top,
    // above the steering wheel's rim.
    let topClear = 0;
    let wheelTop = 1;
    const layout = () => {
      const r = stage.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      topClear = 0;
      for (const el of Array.from(stage.querySelectorAll<HTMLElement>(".ob-clock, .ob-controls, .ob-legend, .ob-id"))) {
        const b = el.getBoundingClientRect();
        const covers = b.left - r.left < W / 2 + 60 && b.right - r.left > W / 2 - 60;
        if (b.width > 0 && covers && b.top - r.top < H / 2) topClear = Math.max(topClear, b.bottom - r.top + 12);
      }
      const wheel = stage.querySelector<HTMLElement>(".ob-wheel")?.getBoundingClientRect();
      wheelTop = wheel && wheel.width > 0 ? wheel.top - r.top + wheel.width * 0.24 : H;
      dirtyRef.current = 30;
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(stage);
    // Overlays change size too (Show all, breakpoints), which moves the free band.
    stage.querySelectorAll(".ob-clock, .ob-controls, .ob-legend, .ob-wheel").forEach((el) => ro.observe(el));

    // A hidden tab stops animation frames; pause so the engine note doesn't hang.
    const doc = canvas.ownerDocument;
    const onVisibility = () => {
      if (doc.hidden && live.current.playing) setPlaying(false);
    };
    doc.addEventListener("visibilitychange", onVisibility);

    const rotationRad = (rotation * Math.PI) / 180;
    const cam = { heading: null as number | null, scale: null as number | null };
    let raf = 0;
    let last = performance.now();
    let lastHud = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const { playing: isPlaying, speed: rate, orientation: mode, showAll: detail } = live.current;
      if (isPlaying) {
        timeRef.current += dt * 1000 * rate;
        if (timeRef.current >= lapMs) timeRef.current -= lapMs;
        dirtyRef.current = 30;
      }
      if (dirtyRef.current > 0) {
        if (!isPlaying) dirtyRef.current -= 1;
        const m = momentAt(ordered, steer, timeRef.current);
        const distance = map.toLine(m?.distance ?? 0);
        const p = map.pointAt(distance);
        // Heading-up sits the car low with the road ahead above it; map-up
        // centres it in the free band so every direction gets room.
        const anchorY = mode === "heading" ? Math.min(H * ANCHOR_Y, wheelTop - 48) : (topClear + wheelTop) / 2;
        // Heading-up frames the road from the car to the top edge (the far end may
        // pass under the clock); map-up keeps every direction inside the band.
        const room = mode === "heading" ? anchorY : Math.min(anchorY - topClear, wheelTop - anchorY, W / 2);
        // Zoom out with speed, like a sat-nav: ~250 m ahead when slow, ~560 m flat
        // out (about five seconds of track). Reduced motion keeps one zoom.
        const metresAhead = reduceMotion ? 560 : 250 + 310 * Math.min(1, Math.max(0, (m?.speed ?? 0) / 320));
        const targetScale = Math.max(40, room) / metresAhead;
        const snap = cam.heading == null || cam.scale == null;
        const heading = snap ? p.heading : cam.heading! + wrapAngle(p.heading - cam.heading!) * (1 - Math.exp(-dt / 0.14));
        const scale = snap ? targetScale : cam.scale! + (targetScale - cam.scale!) * (1 - Math.exp(-dt / 0.6));
        cam.heading = heading;
        cam.scale = scale;
        // Paused, keep drawing until the camera has eased onto its target.
        const settled = Math.abs(wrapAngle(p.heading - heading)) < 0.003 && Math.abs(targetScale - scale) < targetScale * 0.003;
        if (!isPlaying && !settled) dirtyRef.current = Math.max(dirtyRef.current, 1);
        const worldRotation = mode === "heading" ? Math.PI / 2 - heading : rotationRad;

        const rivals: MapRival[] = [];
        const sessionTime = m?.sessionTimeMs;
        if (sessionTime != null) {
          for (const pos of fieldAt.current(sessionTime)) {
            if (pos.driverNumber === driver.driverNumber || !pos.onTrack) continue;
            const lastEnd = lastLapEnd.get(pos.driverNumber);
            if (lastEnd == null || sessionTime > lastEnd + 60_000) continue;
            const rx = pos.x / 10;
            const ry = pos.y / 10;
            const d = map.nearest(rx, ry);
            let ahead = d < 0 ? 0 : ((d - distance) % map.length + map.length) % map.length;
            if (ahead > map.length / 2) ahead -= map.length;
            const r = byNumber.get(pos.driverNumber);
            rivals.push({ driverNumber: pos.driverNumber, x: rx, y: ry, color: teamColor(r?.teamColorRaw), abbr: r?.abbreviation ?? String(pos.driverNumber), ahead });
          }
        }

        painter.draw(ctx, { width: W, height: H, dpr, carX: p.x, carY: p.y, anchorX: W / 2, anchorY, scale, rotation: worldRotation, heading: p.heading, distance, color, rivals, detail });
        if (now - lastHud >= HUD_INTERVAL_MS || dirtyRef.current <= 1) {
          lastHud = now;
          setHud({ t: timeRef.current, moment: m, scale, rotation: worldRotation });
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      doc.removeEventListener("visibilitychange", onVisibility);
    };
  }, [map, painter, ordered, steer, lapMs, rotation, driver.driverNumber, byNumber, lastLapEnd, color, reduceMotion]);

  // The slider's announced value changes on seeks and pauses, not 30 times a second.
  const [ariaT, setAriaT] = useState(timeRef.current);
  const seek = (ms: number) => {
    timeRef.current = Math.min(Math.max(ms, 0), lapMs - 1);
    setAriaT(timeRef.current);
    dirtyRef.current = 30;
    setHud((h) => ({ ...h, t: timeRef.current, moment: momentAt(ordered, steer, timeRef.current) }));
  };
  const togglePlay = () => {
    setAriaT(timeRef.current);
    if (playing) onTimeCommit(timeRef.current);
    setPlaying(!playing);
  };

  const m = hud.moment;
  const t = hud.t;

  // Sectors from the lap's own sector times.
  const sectorMs = [lapRow?.sector1Ms ?? null, lapRow?.sector2Ms ?? null, lapRow?.sector3Ms ?? null];
  const sectorEnds = sectorMs.reduce<(number | null)[]>((acc, v, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    acc.push(prev == null || v == null ? null : prev + v);
    return acc;
  }, []);
  const sectorColor = (i: number, v: number | null) => {
    if (v == null) return TIMING.other;
    const best = timing.sessionSectors[i];
    const own = timing.personalSectors[i];
    return best != null && v <= best ? TIMING.session : own != null && v <= own ? TIMING.personal : TIMING.other;
  };
  const sectors = sectorMs.map((v, i) => {
    const start = i === 0 ? 0 : sectorEnds[i - 1];
    const end = sectorEnds[i];
    const done = end != null && t >= end;
    const current = !done && start != null && t >= start;
    const fill = done ? 1 : current && end != null && start != null ? (t - start) / (end - start) : 0;
    const c = sectorColor(i, v);
    return {
      label: `S${i + 1}`,
      state: done ? "done" : current ? "live" : "next",
      value: done ? (v! / 1000).toFixed(3) : current && start != null ? ((t - start) / 1000).toFixed(1) : "—",
      color: done ? c : current ? "#FFFFFF" : "#6B7487",
      bar: done ? c : "#FFFFFF",
      fill,
    };
  });

  // North-up overview in the official map orientation.
  const mini = useMemo(() => {
    const pts = ordered.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)).map((p) => rotate({ x: p.x, y: p.y }, rotation));
    if (pts.length < 3) return null;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const W = 218;
    const H = 118;
    const k = Math.min(W / (maxX - minX || 1), H / (maxY - minY || 1)) * 0.9;
    const ox = (W - (maxX - minX) * k) / 2;
    const oy = (H - (maxY - minY) * k) / 2;
    const proj = pts.map((p) => ({ x: ox + (p.x - minX) * k, y: oy + (maxY - p.y) * k }));
    const path = (a: number, b: number) => proj.slice(a, b + 1).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("");
    const [s2, s3] = sectorSplits ?? [Math.floor(proj.length / 3), Math.floor((proj.length * 2) / 3)];
    return { proj, full: `${path(0, proj.length - 1)}Z`, parts: [path(0, s2), path(s2, s3), path(s3, proj.length - 1)] };
  }, [ordered, rotation, sectorSplits]);
  const miniIndex = useMemo(() => {
    let lo = 0;
    let hi = ordered.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >>> 1;
      if ((ordered[mid].timeInLapMs ?? 0) <= t) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }, [ordered, t]);
  const miniDot = mini?.proj[Math.min(miniIndex, mini.proj.length - 1)];

  // Speed trace scrubber.
  const trace = useMemo(() => {
    const maxD = Math.max(1, ordered[ordered.length - 1]?.distanceM ?? 1);
    const pts = ordered
      .filter((p) => p.distanceM != null && p.speed != null)
      .map((p) => `${((p.distanceM! / maxD) * 1000).toFixed(1)},${(66 - ((p.speed! - 60) / 290) * 62).toFixed(1)}`)
      .join(" ");
    const brakes: { x: number; w: number }[] = [];
    let start: number | null = null;
    ordered.forEach((p, i) => {
      const on = (p.brake ?? 0) >= 1;
      if (on && start == null) start = p.distanceM ?? 0;
      if ((!on || i === ordered.length - 1) && start != null) {
        const end = p.distanceM ?? start;
        brakes.push({ x: (start / maxD) * 1000, w: Math.max(2, ((end - start) / maxD) * 1000) });
        start = null;
      }
    });
    return { maxD, pts, brakes };
  }, [ordered]);
  const headX = ((m?.distance ?? 0) / trace.maxD) * 1000;
  const timeAtDistance = (d: number) => {
    const i = ordered.findIndex((p) => (p.distanceM ?? 0) >= d);
    return i < 0 ? lapMs - 1 : ordered[i].timeInLapMs ?? 0;
  };
  const scrubTo = (event: PointerEvent<HTMLDivElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    const q = Math.max(0, Math.min(0.999, (event.clientX - r.left) / r.width));
    seek(timeAtDistance(q * trace.maxD));
  };
  const onScrubKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const stepMs = lapMs / 50;
    const keys: Record<string, number> = { ArrowRight: stepMs, ArrowUp: stepMs, ArrowLeft: -stepMs, ArrowDown: -stepMs };
    if (event.key in keys) seek(timeRef.current + keys[event.key]);
    else if (event.key === "Home") seek(0);
    else if (event.key === "End") seek(lapMs - 1);
    else if (event.key === " ") togglePlay();
    else return;
    event.preventDefault();
  };

  const steerDeg = Math.round(m?.steer ?? 0);
  const [first, ...rest] = (driver.fullName || driver.abbreviation).split(" ");
  const position = lapRow?.position ?? driver.position;
  const turn = m?.cornerNumber != null ? `TURN ${m.cornerNumber}` : "STRAIGHT";
  const scaleM = niceMetres(110, hud.scale || 1);

  if (!map) {
    return <div className="ob-stage ob-empty">Not enough position data in this lap to draw the onboard map.</div>;
  }

  return (
    <section className="ob-stage" ref={stageRef} aria-label={`Onboard map: ${driver.fullName}, ${lapLabel.toLowerCase()} ${telemetryLap}`}>
      <canvas
        className="ob-canvas"
        ref={canvasRef}
        role="img"
        aria-label={`Track map ${orientation === "heading" ? "turning with the car" : "in the official orientation"}, with the line coloured by speed, braking zones and the cars around ${driver.abbreviation}`}
      />

      <div className="ob-id" style={{ borderLeftColor: color, background: `linear-gradient(90deg, ${color}66, rgba(8,10,14,0.85))` }}>
        {position != null && <span className="ob-id-pos">P{position}</span>}
        <div>
          <strong>{first?.toUpperCase()} {rest.join(" ").toUpperCase()}</strong>
          <span>{(driver.teamName ?? "").toUpperCase()} · #{driver.driverNumber}</span>
        </div>
      </div>

      <div className="ob-clock">
        <span className="ob-clock-label">{lapLabel.toUpperCase()} · {telemetryLap}/{totalLaps}</span>
        <span className="ob-clock-time">{lapClock(t)}</span>
        <div className="ob-sectors">
          {sectors.map((sx) => (
            <div key={sx.label} className="ob-sector">
              <span className="ob-sector-bar"><i style={{ width: `${(sx.fill * 100).toFixed(1)}%`, background: sx.bar }} /></span>
              <span className="ob-sector-row"><span>{sx.label}</span><span style={{ color: sx.color }}>{sx.value}</span></span>
            </div>
          ))}
        </div>
      </div>

      <div className="ob-map">
        <div className="ob-map-head"><span>{(session?.location ?? session?.eventName ?? "").toUpperCase()}</span><span style={{ color }}>{turn}</span></div>
        {mini && (
          <svg viewBox="0 0 218 118" aria-hidden="true">
            <path d={mini.full} fill="none" stroke="#2A3240" strokeWidth={6} strokeLinejoin="round" />
            {mini.parts.map((d, i) => {
              const s = sectors[i];
              return <path key={i} d={d} fill="none" stroke={s.state === "done" ? s.color : s.state === "live" ? "#FFFFFF" : "#3A4454"} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" opacity={s.state === "next" ? 0.6 : 0.95} />;
            })}
            {miniDot && <circle cx={miniDot.x} cy={miniDot.y} r={4.5} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />}
          </svg>
        )}
      </div>

      <div className="ob-legend">
        <div className="ob-north" title="North" style={{ transform: `rotate(${(-hud.rotation * 180) / Math.PI}deg)` }} aria-hidden="true"><span>N</span></div>
        <div className="ob-seg" role="group" aria-label="Map orientation">
          <button type="button" aria-pressed={orientation === "heading"} onClick={() => setOrientation("heading")}>Heading up</button>
          <button type="button" aria-pressed={orientation === "map"} onClick={() => setOrientation("map")}>Map up</button>
        </div>
        <button type="button" className="ob-all" aria-pressed={showAll} onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show less" : "Show all"}
        </button>
        {showAll && (
          <>
            <div className="ob-scale" aria-label={`Scale: ${scaleM} metres`}>
              <i style={{ width: `${scaleM * (hud.scale || 1)}px` }} />
              <span>{scaleM >= 1000 ? `${scaleM / 1000} km` : `${scaleM} m`}</span>
            </div>
            <div className="ob-speedkey" aria-label={`Line colour shows speed, ${Math.round(map.speedRange[0])} to ${Math.round(map.speedRange[1])} km/h`}>
              <span>{Math.round(map.speedRange[0])}</span>
              <i style={{ background: SPEED_GRADIENT }} />
              <span>{Math.round(map.speedRange[1])} km/h</span>
            </div>
          </>
        )}
      </div>

      <div className="ob-controls">
        <div className="ob-controls-row">
          <button type="button" className="ob-play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
          <div className="ob-speeds" role="group" aria-label="Playback speed">
            {SPEEDS.map((v) => <button key={v} type="button" aria-pressed={speed === v} onClick={() => setSpeed(v)}>{v}×</button>)}
          </div>
          <button type="button" className="ob-sound" aria-pressed={soundOn} aria-label="Engine sound" onClick={() => onSoundChange(!soundOn)}>
            {soundOn ? "🔊" : "🔈"}
          </button>
          <span className="ob-dist">{formatNumber(m?.distance ?? 0, 0)} M</span>
        </div>
        <div
          className="ob-scrub"
          role="slider"
          tabIndex={0}
          aria-label="Position in lap"
          aria-valuemin={0}
          aria-valuemax={Math.round(lapMs)}
          aria-valuenow={Math.round(ariaT)}
          aria-valuetext={`${lapClock(ariaT)}, ${formatNumber(momentAt(ordered, steer, ariaT)?.distance ?? 0, 0)} metres`}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); scrubTo(e); }}
          onPointerMove={(e) => { if (e.buttons & 1) scrubTo(e); }}
          onKeyDown={onScrubKey}
        >
          <svg viewBox="0 0 1000 70" preserveAspectRatio="none" aria-hidden="true">
            {trace.brakes.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={70} fill="rgba(255,54,84,0.2)" />)}
            <polyline points={trace.pts} fill="none" stroke={color} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
            <rect x={headX} y={0} width={Math.max(0, 1000 - headX)} height={70} fill="rgba(8,10,14,0.6)" />
            <line x1={headX} y1={0} x2={headX} y2={70} stroke="#FFFFFF" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>

      <div className="ob-wheel">
        <SteeringWheel
          angle={m?.steer ?? 0}
          gloves={color}
          compact={!showAll}
          lapLabel={`${lapLabel.toUpperCase()} · ${telemetryLap}`}
          readout={{
            rpm: m?.rpm ?? null,
            speed: m?.speed ?? null,
            gear: m?.gear ?? null,
            throttle: m?.throttle ?? null,
            brake: m?.brake ?? null,
            drs: m?.drs ?? null,
            gLong: m?.gLong ?? null,
            gLat: m?.gLat ?? null,
            gTotal: m?.gTotal ?? null,
          }}
        />
      </div>

      <div className="ob-steer">
        <span className="ob-caption">Steering · estimated</span>
        <span className="ob-steer-val">{Math.abs(steerDeg) < 3 ? "STRAIGHT" : `${Math.abs(steerDeg)}° ${steerDeg > 0 ? "RIGHT" : "LEFT"}`}</span>
        <div className="ob-steer-bar"><i style={{ left: `${50 + Math.max(-50, Math.min(50, steerDeg / 2.2))}%`, background: color }} /><b /></div>
      </div>
    </section>
  );
}
