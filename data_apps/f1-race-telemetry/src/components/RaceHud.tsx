import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

import type { HudTrack } from "../lib/hudGeometry";
import type { RaceMotionIndex } from "../lib/raceMotion";
import { HudWorld, type HudCameraMode, type HudCarInfo } from "./HudWorld";
import "./RaceHud.css";

export type { HudCameraMode, HudCarInfo };

export type HudOrderRow = {
  driverNumber: number;
  position: number | null;
  abbr: string;
  color: string;
  tyreColor: string;
  gap: string;
  inPit: boolean;
};

export type HudSector = { value: string; color: string; bar: string };

export type HudFocus = {
  driverNumber: number;
  abbr: string;
  position: number | null;
  name: string;
  team: string;
  color: string;
  gap: string;
  last: string;
  best: string;
  bestIsFastest: boolean;
  sectors: HudSector[];
};

export type HudDash = {
  speed: number | null;
  gear: number | null;
  rpm: number | null;
  throttle: number | null;
  brake: boolean;
  drs: "OPEN" | "CLOSED" | "OFF";
};

export type HudWeather = {
  air: number | null;
  track: number | null;
  humidity: number | null;
  wind: number | null;
  windDirection: number | null;
  compass: string;
  rain: boolean;
};

export type HudStatus = { label: string; color: string; green: boolean };

export type HudLapCell = { lap: number; color: string; state: "played" | "current" | "future" };

export const HUD_SPEEDS = [1, 5, 10] as const;

/** Shift lights span the top of the rev range, where F1 engines spend a lap. */
const RPM_LIGHTS_FROM = 10_000;
const RPM_LIGHTS_TO = 11_800;
const SPEED_ARC = 358.1;

export function RaceHud({
  track,
  trackLoading,
  motionIndex,
  timeRef,
  timeMs,
  playing,
  camera,
  onCamera,
  followedNumber,
  onFollow,
  cars,
  order,
  showAll,
  onShowAll,
  lapInProgress,
  lastLap,
  lapProgress,
  status,
  focus,
  fastest,
  weather,
  dash,
  laps,
  elapsed,
  speed,
  onSpeed,
  onTogglePlay,
  onSeekLap,
}: {
  track: HudTrack | null;
  trackLoading: boolean;
  motionIndex: RaceMotionIndex;
  timeRef: { current: number | null };
  timeMs: number | null;
  playing: boolean;
  camera: HudCameraMode;
  onCamera: (mode: HudCameraMode) => void;
  followedNumber: number | null;
  onFollow: (driverNumber: number) => void;
  cars: ReadonlyMap<number, HudCarInfo>;
  order: HudOrderRow[];
  showAll: boolean;
  onShowAll: (all: boolean) => void;
  lapInProgress: number;
  lastLap: number;
  lapProgress: number;
  status: HudStatus | null;
  focus: HudFocus | null;
  fastest: { abbr: string; time: string } | null;
  weather: HudWeather | null;
  dash: HudDash | null;
  laps: HudLapCell[];
  elapsed: string;
  speed: number;
  onSpeed: (speed: number) => void;
  onTogglePlay: () => void;
  onSeekLap: (lap: number) => void;
}) {
  const worldRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    const el = worldRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ width: Math.round(r.width), height: Math.round(r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="hud" aria-label="Race replay">
      <div className="hud-world" ref={worldRef}>
        {track && size ? (
          <HudWorld
            track={track}
            width={size.width}
            height={size.height}
            mode={camera}
            motionIndex={motionIndex}
            timeRef={timeRef}
            timeMs={timeMs}
            playing={playing}
            followedNumber={followedNumber}
            cars={cars}
            edgeColor={status && !status.green ? status.color : null}
            onFollow={onFollow}
          />
        ) : (
          <div className="hud-world-empty">{trackLoading ? "Preparing circuit…" : "No circuit trace for this session."}</div>
        )}
      </div>

      <RaceOrder order={order} followedNumber={followedNumber} showAll={showAll} onShowAll={onShowAll} onFollow={onFollow} />
      <LapHeader lap={lapInProgress} lastLap={lastLap} progress={lapProgress} status={status} />
      <FocusCard focus={focus} fastest={fastest} />
      <WeatherPanel weather={weather} />
      <CarDash dash={dash} color={focus?.color ?? "#FFFFFF"} />
      <HudTransport
        camera={camera}
        onCamera={onCamera}
        followedAbbr={focus?.abbr ?? "—"}
        playing={playing}
        onTogglePlay={onTogglePlay}
        laps={laps}
        lapInProgress={lapInProgress}
        onSeekLap={onSeekLap}
        elapsed={elapsed}
        speed={speed}
        onSpeed={onSpeed}
      />
    </section>
  );
}

function RaceOrder({ order, followedNumber, showAll, onShowAll, onFollow }: {
  order: HudOrderRow[];
  followedNumber: number | null;
  showAll: boolean;
  onShowAll: (all: boolean) => void;
  onFollow: (driverNumber: number) => void;
}) {
  const limit = showAll ? order.length : 10;
  const rows = order.slice(0, limit);
  const followed = order.find((row) => row.driverNumber === followedNumber);
  const appended = !showAll && followed != null && !rows.includes(followed);
  if (appended) rows.push(followed);
  return (
    <div className="hud-panel hud-order">
      <div className="hud-order-head">
        <h2 className="hud-caption">Race order</h2>
        {order.length > 10 && (
          <button type="button" className="hud-chip-btn" onClick={() => onShowAll(!showAll)}>
            {showAll ? "Top 10" : `All ${order.length}`}
          </button>
        )}
      </div>
      <div className="hud-order-rows">
        {rows.map((row, i) => {
          const isF = row.driverNumber === followedNumber;
          return (
            <button
              key={row.driverNumber}
              type="button"
              className={`hud-order-row${isF ? " is-followed" : ""}${appended && i === rows.length - 1 ? " is-appended" : ""}`}
              style={{ "--hud-team": row.color } as CSSProperties}
              aria-pressed={isF}
              aria-label={`Follow ${row.abbr}, position ${row.position ?? "unknown"}, ${row.gap}`}
              onClick={() => onFollow(row.driverNumber)}
            >
              <span className="hud-order-pos">{row.position ?? "–"}</span>
              <span className="hud-order-abbr">{row.abbr}</span>
              <span className="hud-order-tyre" style={{ background: row.tyreColor }} />
              <span className={`hud-order-gap${row.inPit ? " is-pit" : ""}`}>{row.gap}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function statusText(status: HudStatus): string {
  if (status.green) return "GREEN FLAG";
  const label = status.label.toUpperCase();
  return label.includes("SAFETY CAR") ? `▶▶ ${label}` : `▶ ${label}`;
}

function LapHeader({ lap, lastLap, progress, status }: {
  lap: number;
  lastLap: number;
  progress: number;
  status: HudStatus | null;
}) {
  return (
    <div className="hud-lap">
      <div className="hud-lap-count">
        <span className="hud-lap-word">LAP</span>
        <span className="hud-lap-num">{lap}</span>
        <span className="hud-lap-total">/{lastLap}</span>
      </div>
      <div className="hud-lap-bar"><div style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }} /></div>
      {status && (
        <div className="hud-status" style={{ borderColor: status.color, background: rgba(status.color, 0.16) }} role="status">
          <span style={{ color: status.color }}>{statusText(status)}</span>
        </div>
      )}
    </div>
  );
}

function FocusCard({ focus, fastest }: { focus: HudFocus | null; fastest: { abbr: string; time: string } | null }) {
  if (!focus) return null;
  return (
    <div className="hud-panel hud-focus">
      <div className="hud-focus-id" style={{ borderLeftColor: focus.color, background: `linear-gradient(90deg, ${rgba(focus.color, 0.45)}, rgba(8,10,14,0.88))` }}>
        <span className="hud-focus-pos">P{focus.position ?? "–"}</span>
        <div className="hud-focus-name">
          <strong>{focus.name.toUpperCase()}</strong>
          <span>{focus.team.toUpperCase()} · {focus.gap}</span>
        </div>
      </div>
      <div className="hud-focus-laps">
        <div className="hud-cell"><span className="hud-caption">Last lap</span><span className="hud-value">{focus.last}</span></div>
        <div className="hud-cell"><span className="hud-caption">Best lap</span><span className="hud-value" style={{ color: focus.bestIsFastest ? "#C084FC" : "#FFFFFF" }}>{focus.best}</span></div>
      </div>
      <div className="hud-focus-sectors">
        {focus.sectors.map((s, i) => (
          <div key={i} className="hud-cell hud-sector" aria-label={`Sector ${i + 1}: ${s.value}`}>
            <span className="hud-sector-bar" style={{ background: s.bar }} />
            <span className="hud-sector-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
      {fastest && (
        <div className="hud-focus-fastest">
          <span className="hud-caption">Fastest lap · {fastest.abbr}</span>
          <span>{fastest.time}</span>
        </div>
      )}
    </div>
  );
}

function fixed(value: number | null, digits: number): string {
  return value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits);
}

function WeatherPanel({ weather }: { weather: HudWeather | null }) {
  if (!weather) return null;
  return (
    <div className="hud-panel hud-weather">
      <div className="hud-weather-wind">
        <div className="hud-compass" aria-hidden="true">
          <span className="n">N</span><span className="e">E</span><span className="s">S</span><span className="w">W</span>
          {weather.windDirection != null && (
            <div className="hud-compass-arrow" style={{ transform: `rotate(${Math.round(weather.windDirection + 180)}deg)` }}><span /></div>
          )}
        </div>
        <div className="hud-weather-windval">
          <span className="hud-caption">Wind {weather.compass}</span>
          <span className="hud-weather-big">{fixed(weather.wind, 1)}<small> m/s</small></span>
        </div>
      </div>
      <div className="hud-weather-cells">
        <div className="hud-cell"><span className="hud-caption">Air</span><span className="hud-value">{fixed(weather.air, 1)}°</span></div>
        <div className="hud-cell"><span className="hud-caption">Track</span><span className="hud-value">{fixed(weather.track, 1)}°</span></div>
        <div className="hud-cell"><span className="hud-caption">Hum</span><span className="hud-value">{weather.humidity == null ? "—" : Math.round(weather.humidity)}%</span></div>
      </div>
      <div className={`hud-rain${weather.rain ? " is-wet" : ""}`}>{weather.rain ? "RAINFALL DETECTED" : "NO RAINFALL"}</div>
    </div>
  );
}

function CarDash({ dash, color }: { dash: HudDash | null; color: string }) {
  const rpm = dash?.rpm ?? null;
  const lit = rpm == null ? 0 : Math.round(Math.max(0, Math.min(1, (rpm - RPM_LIGHTS_FROM) / (RPM_LIGHTS_TO - RPM_LIGHTS_FROM))) * 15);
  const speed = dash?.speed ?? null;
  const arc = SPEED_ARC * Math.min(1, Math.max(0, (speed ?? 0) / 350));
  const throttle = Math.max(0, Math.min(100, dash?.throttle ?? 0));
  const gear = dash?.gear == null ? "–" : dash.gear === 0 ? "N" : String(dash.gear);
  return (
    <div className="hud-panel hud-dash" aria-label="Followed car telemetry">
      <div className="hud-leds" aria-hidden="true">
        {Array.from({ length: 15 }, (_, i) => {
          const c = i < 5 ? "#22C55E" : i < 10 ? "#E8002D" : "#3D7BFF";
          const on = i < lit;
          return <span key={i} style={{ background: on ? c : "#1A202B", boxShadow: on ? `0 0 8px ${c}` : "none" }} />;
        })}
      </div>
      <div className="hud-dash-main">
        <div className="hud-dash-bar" title="Brake"><div style={{ height: dash?.brake ? "100%" : "0%", background: "#E8002D" }} /></div>
        <div className="hud-dash-gauge">
          <svg viewBox="0 0 176 176" aria-hidden="true">
            <circle cx="88" cy="88" r="76" transform="rotate(135 88 88)" fill="none" stroke="#161B25" strokeWidth="10" strokeDasharray="358.1 999" />
            <circle cx="88" cy="88" r="76" transform="rotate(135 88 88)" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeDasharray={`${arc.toFixed(1)} 999`} />
            <circle cx="88" cy="88" r="76" transform="rotate(135 88 88)" fill="none" stroke={color} strokeWidth="10" strokeDasharray="0 316 42 999" opacity="0.55" />
          </svg>
          <div className="hud-dash-readout">
            <span className="hud-dash-gear">{gear}</span>
            <span className="hud-dash-speed">{speed == null ? "—" : Math.round(speed)}<small> KM/H</small></span>
          </div>
        </div>
        <div className="hud-dash-bar" title="Throttle"><div style={{ height: `${throttle}%`, background: "#22C55E" }} /></div>
      </div>
      <div className="hud-dash-chips">
        <span>{rpm == null ? "—" : Math.round(rpm).toLocaleString("en-US")} RPM</span>
        <span className={dash?.drs === "OPEN" ? "is-drs" : ""}>DRS {dash?.drs ?? "—"}</span>
        <span className={dash?.brake ? "is-brake" : ""}>BRAKE {dash == null ? "—" : dash.brake ? "ON" : "OFF"}</span>
      </div>
    </div>
  );
}

function HudTransport({ camera, onCamera, followedAbbr, playing, onTogglePlay, laps, lapInProgress, onSeekLap, elapsed, speed, onSpeed }: {
  camera: HudCameraMode;
  onCamera: (mode: HudCameraMode) => void;
  followedAbbr: string;
  playing: boolean;
  onTogglePlay: () => void;
  laps: HudLapCell[];
  lapInProgress: number;
  onSeekLap: (lap: number) => void;
  elapsed: string;
  speed: number;
  onSpeed: (speed: number) => void;
}) {
  const lastLap = laps.length;
  const lapFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    const q = Math.max(0, Math.min(0.9999, (event.clientX - r.left) / r.width));
    return 1 + Math.floor(q * lastLap);
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (lastLap === 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onSeekLap(lapFromPointer(event));
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (lastLap === 0 || !(event.buttons & 1)) return;
    const lap = lapFromPointer(event);
    if (lap !== lapInProgress) onSeekLap(lap);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[event.key];
    if (step != null) onSeekLap(Math.max(1, Math.min(lastLap, lapInProgress + step)));
    else if (event.key === "Home") onSeekLap(1);
    else if (event.key === "End") onSeekLap(lastLap);
    else return;
    event.preventDefault();
  };
  return (
    <div className="hud-transport">
      <div className="hud-cams">
        <div className="hud-seg" role="group" aria-label="Camera">
          <button type="button" aria-pressed={camera === "overview"} onClick={() => onCamera("overview")}>OVERVIEW</button>
          <button type="button" aria-pressed={camera === "chase"} onClick={() => onCamera("chase")}>CHASE · {followedAbbr}</button>
        </div>
        <span className="hud-hint">
          {camera === "chase"
            ? "Drag to orbit · double-click resets · click a car to follow"
            : "Click a car to follow"}
        </span>
      </div>
      <div className="hud-panel hud-controls">
        <button type="button" className="hud-play" onClick={onTogglePlay} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
        <div
          className="hud-strip"
          role="slider"
          tabIndex={0}
          aria-label="Lap"
          aria-valuemin={1}
          aria-valuemax={Math.max(1, lastLap)}
          aria-valuenow={lapInProgress}
          aria-valuetext={`Lap ${lapInProgress} of ${lastLap}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={onKeyDown}
        >
          {laps.map((cell) => (
            <span key={cell.lap} className={`hud-strip-cell is-${cell.state}`} style={{ background: cell.color }} />
          ))}
        </div>
        <span className="hud-clock">{elapsed}</span>
        <div className="hud-speeds" role="group" aria-label="Playback speed">
          {HUD_SPEEDS.map((value) => (
            <button key={value} type="button" aria-pressed={speed === value} onClick={() => onSpeed(value)}>{value}×</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return `rgba(107,116,135,${alpha})`;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
