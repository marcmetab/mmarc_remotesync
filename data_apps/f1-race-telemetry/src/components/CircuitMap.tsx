import { useId, useMemo } from "react";

import type { CornerRow } from "../hooks/useRaceData";
import { nearestIndex, rotate, type XY } from "../lib/lapGeometry";
import { MONO, SANS, T } from "../lib/tokens";
import type { TrackCar } from "./TrackMap";

/** One sample of the reference lap the circuit is drawn from. */
export type LapPoint = {
  x: number;
  y: number;
  speed: number | null;
  gear: number | null;
  drs: number | null;
};

export type MapView = "circuit" | "speed" | "gear" | "sectors";

export const MAP_VIEWS: { value: MapView; label: string }[] = [
  { value: "circuit", label: "Circuit" },
  { value: "speed", label: "Speed" },
  { value: "gear", label: "Gear" },
  { value: "sectors", label: "Sectors" },
];

const PAD = 0.04;
/** Samples either side of a corner's apex that get a kerb (~±30 m). */
const KERB_SPAN = 4;

export const SECTOR_COLORS = ["#E8002D", "#3D7BFF", "#F5C518"] as const;
export const GEAR_COLORS = [
  "#6B7280", // N / unknown
  "#7C3AED",
  "#2563EB",
  "#0891B2",
  "#16A34A",
  "#84CC16",
  "#EAB308",
  "#F97316",
  "#EF4444",
];

/** Slow → fast, dark blue through cyan and yellow to red. */
const SPEED_STOPS = ["#1E3A8A", "#2563EB", "#06B6D4", "#84CC16", "#FACC15", "#F97316", "#DC2626"];

export function speedColor(ratio: number): string {
  const r = Math.min(Math.max(ratio, 0), 1) * (SPEED_STOPS.length - 1);
  const i = Math.min(Math.floor(r), SPEED_STOPS.length - 2);
  return mix(SPEED_STOPS[i], SPEED_STOPS[i + 1], r - i);
}

export const SPEED_GRADIENT = `linear-gradient(90deg, ${SPEED_STOPS.join(", ")})`;

function mix(a: string, b: string, k: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) =>
    Math.round(((pa >> shift) & 255) * (1 - k) + ((pb >> shift) & 255) * k);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

/**
 * The circuit as broadcast graphics draw it: the reference lap's racing line
 * rotated to the official map orientation, run-off, white track limits,
 * red-and-white kerbs at every numbered corner, the start/finish line, and the
 * field's cars. Track coordinates are y-up; SVG is y-down, so y flips on
 * projection.
 */
export function CircuitMap({
  lap,
  rotation,
  corners,
  progressIndex,
  focus,
  field,
  view,
  sectorSplits,
  speedRange,
  height = 300,
  variant = "default",
  labelMode = "all",
  priorityDriverNumbers = [],
  onSelectCar,
}: {
  lap: readonly LapPoint[];
  rotation: number;
  corners: readonly CornerRow[];
  progressIndex: number;
  focus: TrackCar | null;
  field: readonly TrackCar[];
  view: MapView;
  sectorSplits: [number, number] | null;
  speedRange: [number, number] | null;
  height?: number;
  variant?: "default" | "replay";
  labelMode?: "all" | "smart" | "off";
  priorityDriverNumbers?: readonly number[];
  onSelectCar?: (driverNumber: number) => void;
}) {
  const uid = useId().replace(/:/g, "");
  const checker = `checker-${uid}`;

  const geo = useMemo(() => {
    const pts = lap
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
      .map((p) => ({ ...p, ...rotate(p, rotation) }));
    if (pts.length < 3) {
      return null;
    }

    const cornerPts = corners.map((c) => rotate({ x: c.x, y: c.y }, rotation));

    // FastF1 places each corner number along the corner's `angle`, then
    // rotates it with the track. The offset scales with the circuit's size.
    const trackXs = pts.map((p) => p.x);
    const trackYs = pts.map((p) => p.y);
    const trackSize = Math.max(
      Math.max(...trackXs) - Math.min(...trackXs),
      Math.max(...trackYs) - Math.min(...trackYs),
      1,
    );
    const labelPts = corners.map((corner) => {
      const offset = rotate({ x: trackSize * 0.05, y: 0 }, corner.angle ?? 0);
      return rotate({ x: corner.x + offset.x, y: corner.y + offset.y }, rotation);
    });

    // Frame the track, its corners and their labels so nothing is clipped.
    const all = [...pts, ...cornerPts, ...labelPts];
    const xs = all.map((p) => p.x);
    const ys = all.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const unit = Math.max(spanX, spanY);
    const pad = unit * PAD;

    const px = (x: number) => x - minX + pad;
    const py = (y: number) => maxY - y + pad;
    const proj = (p: XY) => ({ x: px(p.x), y: py(p.y) });
    const screen = pts.map((p) => ({ ...p, sx: px(p.x), sy: py(p.y) }));
    const toPath = (list: readonly { sx: number; sy: number }[]) =>
      list.map((p, i) => `${i === 0 ? "M" : "L"}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ");

    const kerbs = corners.map((corner, i) => {
      const at = nearestIndex(pts, cornerPts[i]);
      const seg: { sx: number; sy: number }[] = [];
      for (let k = -KERB_SPAN; k <= KERB_SPAN; k++) {
        seg.push(screen[(at + k + screen.length) % screen.length]);
      }
      return { key: `${corner.cornerNumber}${corner.letter ?? ""}`, d: toPath(seg) };
    });

    const cornerLabels = corners.map((corner, i) => ({
      key: `${corner.cornerNumber}${corner.letter ?? ""}`,
      text: `${corner.cornerNumber}${corner.letter ?? ""}`,
      at: proj(cornerPts[i]),
      label: proj(labelPts[i]),
    }));

    const s0 = screen[0];
    const s1 = screen[Math.min(2, screen.length - 1)];
    const startAngle = (Math.atan2(s1.sy - s0.sy, s1.sx - s0.sx) * 180) / Math.PI;

    return {
      width: spanX + pad * 2,
      height: spanY + pad * 2,
      unit,
      screen,
      path: `${toPath(screen)} Z`,
      toPath,
      kerbs,
      cornerLabels,
      start: { x: s0.sx, y: s0.sy, angle: startAngle },
      project: (p: XY) => proj(rotate(p, rotation)),
    };
  }, [lap, rotation, corners]);

  // Coloured overlays depend on the view, never on the playhead.
  const overlay = useMemo(() => {
    if (!geo) {
      return null;
    }
    const { screen, toPath, unit } = geo;
    const w = unit * 0.02;

    if (view === "speed" || view === "gear") {
      const [lo, hi] = speedRange ?? [0, 350];
      return screen.slice(1).map((p, i) => {
        const prev = screen[i];
        const color =
          view === "speed"
            ? p.speed == null
              ? T.textFaint
              : speedColor((p.speed - lo) / Math.max(hi - lo, 1))
            : GEAR_COLORS[Math.min(Math.max(p.gear ?? 0, 0), 8)];
        return (
          <line
            key={i}
            x1={prev.sx}
            y1={prev.sy}
            x2={p.sx}
            y2={p.sy}
            stroke={color}
            strokeWidth={w * 0.78}
            strokeLinecap="round"
          />
        );
      });
    }

    if (view === "sectors" && sectorSplits) {
      const [a, b] = sectorSplits;
      const parts = [screen.slice(0, a + 1), screen.slice(a, b + 1), screen.slice(b)];
      return parts.map((part, i) => (
        <path
          key={i}
          d={toPath(part)}
          fill="none"
          stroke={SECTOR_COLORS[i]}
          strokeWidth={w * 0.78}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ));
    }

    // Circuit view: DRS activation zones from where the reference car opened
    // its flap on this lap.
    const zones: { sx: number; sy: number }[][] = [];
    let run: { sx: number; sy: number }[] = [];
    screen.forEach((p) => {
      if (p.drs != null && p.drs >= 10) {
        run.push(p);
      } else if (run.length > 0) {
        zones.push(run);
        run = [];
      }
    });
    if (run.length > 0) {
      zones.push(run);
    }
    return zones
      .filter((z) => z.length > 2)
      .map((z, i) => (
        <path
          key={i}
          d={toPath(z)}
          fill="none"
          stroke={T.green}
          strokeWidth={w * 0.22}
          strokeDasharray={`${w * 0.9} ${w * 0.5}`}
          opacity={0.9}
        />
      ));
  }, [geo, view, sectorSplits, speedRange]);

  if (!geo) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.textFaint,
          fontSize: 13,
        }}
      >
        No track geometry for this session.
      </div>
    );
  }

  const { unit, screen } = geo;
  const w = unit * 0.02;
  const carR = unit * 0.012;
  const labelSize = unit * 0.024;
  const progress = Math.min(Math.max(progressIndex, 0), screen.length - 1);
  const trail = view === "circuit" && focus ? geo.toPath(screen.slice(0, progress + 1)) : null;

  const place = (car: TrackCar) => geo.project({ x: car.x, y: car.y });

  return (
    <svg
      viewBox={`0 0 ${geo.width} ${geo.height}`}
      style={{ width: "100%", height, display: "block" }}
      role={onSelectCar ? "group" : "img"}
      aria-label="Circuit map with car positions"
    >
      <defs>
        <pattern id={checker} width={w * 0.5} height={w * 0.5} patternUnits="userSpaceOnUse">
          <rect width={w * 0.5} height={w * 0.5} fill="#F8FAFC" />
          <rect width={w * 0.25} height={w * 0.25} fill="#0A0C10" />
          <rect x={w * 0.25} y={w * 0.25} width={w * 0.25} height={w * 0.25} fill="#0A0C10" />
        </pattern>
      </defs>

      {/* Run-off */}
      <path d={geo.path} fill="none" stroke={variant === "replay" ? "#1A202B" : "#171C25"} strokeWidth={w * 3.2} strokeLinejoin="round" />
      <path d={geo.path} fill="none" stroke={variant === "replay" ? "#232B37" : "#1D2430"} strokeWidth={w * 2.1} strokeLinejoin="round" />

      {/* Kerbs: white base with red blocks, wider than the track so they show at its edges */}
      {variant === "default" && geo.kerbs.map((k) => (
        <g key={k.key}>
          <path d={k.d} fill="none" stroke="#F1F5F9" strokeWidth={w * 1.55} strokeLinejoin="round" />
          <path
            d={k.d}
            fill="none"
            stroke="#E10600"
            strokeWidth={w * 1.55}
            strokeDasharray={`${w * 0.55} ${w * 0.55}`}
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* Track limits and asphalt */}
      {variant === "default" && <path d={geo.path} fill="none" stroke="#C9D1DC" strokeWidth={w * 1.16} strokeLinejoin="round" opacity={0.55} />}
      <path d={geo.path} fill="none" stroke={variant === "replay" ? "#2C3543" : "#2E3440"} strokeWidth={w} strokeLinejoin="round" />

      {overlay}

      {variant === "replay" && sectorSplits?.map((at, index) => {
        const a = screen[Math.max(0, at - 2)];
        const p = screen[Math.min(screen.length - 1, at)];
        const b = screen[Math.min(screen.length - 1, at + 2)];
        if (!a || !p || !b) return null;
        const dx = b.sx - a.sx;
        const dy = b.sy - a.sy;
        const length = Math.hypot(dx, dy) || 1;
        const nx = -dy / length;
        const ny = dx / length;
        const size = unit * 0.018;
        const color = index === 0 ? "#3B82F6" : "#F5C518";
        return <g key={index}>
          <line x1={p.sx - nx * size} y1={p.sy - ny * size} x2={p.sx + nx * size} y2={p.sy + ny * size} stroke={color} strokeWidth={unit * .0035}/>
          <text x={p.sx + nx * size * 2.2} y={p.sy + ny * size * 2.2} textAnchor="middle" fontSize={unit * .018} fontFamily={MONO} fontWeight={700} fill={color}>S{index + 2}</text>
        </g>;
      })}

      {trail && (
        <path
          d={trail}
          fill="none"
          stroke={focus?.color ?? T.accent}
          strokeWidth={w * 0.34}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
        />
      )}

      {/* Start / finish */}
      <g transform={`translate(${geo.start.x} ${geo.start.y}) rotate(${geo.start.angle + 90})`}>
        <rect x={-w * 0.75} y={-w * 0.25} width={w * 1.5} height={w * 0.5} fill={`url(#${checker})`} />
      </g>

      {/* Corner numbers */}
      {geo.cornerLabels.map((c) => (
        <g key={c.key}>
          <line x1={c.at.x} y1={c.at.y} x2={c.label.x} y2={c.label.y} stroke="#3A4250" strokeWidth={unit * 0.0025} />
          <circle cx={c.label.x} cy={c.label.y} r={labelSize * 0.72} fill="#0E1219" stroke="#2C3441" strokeWidth={unit * 0.002} />
          <text
            x={c.label.x}
            y={c.label.y + labelSize * 0.34}
            textAnchor="middle"
            fontSize={labelSize * 0.9}
            fontFamily={SANS}
            fontWeight={700}
            fill="#8C95A6"
          >
            {c.text}
          </text>
        </g>
      ))}

      {/* The field */}
      {field.map((car) => {
        const p = place(car);
        const showLabel = labelMode === "all" || (labelMode === "smart" && priorityDriverNumbers.includes(car.driverNumber));
        return (
          <g key={car.driverNumber} transform={`translate(${p.x} ${p.y})`} opacity={car.onTrack ? 1 : 0.35} role={onSelectCar ? "button" : undefined} tabIndex={onSelectCar ? 0 : undefined} aria-label={onSelectCar ? `Select ${car.abbreviation}` : undefined} onClick={onSelectCar ? () => onSelectCar(car.driverNumber) : undefined} onKeyDown={onSelectCar ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelectCar(car.driverNumber); } } : undefined} style={{ cursor: onSelectCar ? "pointer" : undefined }}>
            <circle r={carR} fill={car.color} stroke="#0A0C10" strokeWidth={carR * 0.35} />
            {showLabel && <text
              x={carR * 1.5}
              y={labelSize * 0.33}
              fontSize={labelSize * 0.85}
              fontFamily={MONO}
              fontWeight={700}
              fill="#C3CAD6"
              stroke="#0A0C10"
              strokeWidth={labelSize * 0.2}
              style={{ paintOrder: "stroke" }}
            >
              {car.abbreviation}
            </text>}
          </g>
        );
      })}

      {/* The selected driver, on top */}
      {focus && (() => {
        const p = place(focus);
        return (
          <g transform={`translate(${p.x} ${p.y})`} role={onSelectCar ? "button" : undefined} tabIndex={onSelectCar ? 0 : undefined} aria-label={onSelectCar ? `Select ${focus.abbreviation}` : undefined} onClick={onSelectCar ? () => onSelectCar(focus.driverNumber) : undefined} onKeyDown={onSelectCar ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelectCar(focus.driverNumber); } } : undefined} style={{ cursor: onSelectCar ? "pointer" : undefined }}>
            <circle r={carR * 2.4} fill={focus.color} opacity={0.25}>
              <animate attributeName="r" values={`${carR * 1.6};${carR * 3};${carR * 1.6}`} dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle r={carR * 1.5} fill={focus.color} stroke="#FFFFFF" strokeWidth={carR * 0.45} />
            {labelMode !== "off" && <g transform={`translate(${carR * 2.2} ${-carR * 2.4})`}>
              <rect
                width={labelSize * 2.5}
                height={labelSize * 1.35}
                rx={labelSize * 0.3}
                fill={focus.color}
                stroke="#0A0C10"
                strokeWidth={unit * 0.002}
              />
              <text
                x={labelSize * 1.25}
                y={labelSize * 0.98}
                textAnchor="middle"
                fontSize={labelSize * 0.95}
                fontFamily={MONO}
                fontWeight={800}
                fill="#FFFFFF"
              >
                {focus.abbreviation}
              </text>
            </g>}
          </g>
        );
      })()}
    </svg>
  );
}
