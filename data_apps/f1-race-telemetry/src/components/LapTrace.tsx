import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

import type { TelemetrySample } from "../hooks/useTelemetry";
import { formatNumber } from "../lib/format";
import { MONO, SANS, T } from "../lib/tokens";

const SPEED = "#3B82F6";
const THROTTLE = "#22C55E";
const BRAKE = "#EF4444";

const M = { top: 22, right: 46, bottom: 34, left: 48 };

/**
 * Speed, throttle and brake against lap distance, with a playhead tied to the
 * page's scrubber. Hand-drawn rather than a Metabase chart because it is part
 * of the scrubbing control: the playhead follows playback, and clicking or
 * dragging anywhere on it seeks the wheel and the map to that point of the lap.
 * `brake` is an on/off flag here, so it is drawn as shaded braking zones, not
 * a percentage line.
 */
export function LapTrace({
  samples,
  index,
  onSeek,
  corners,
  height = 290,
}: {
  samples: readonly TelemetrySample[];
  index: number;
  onSeek: (index: number) => void;
  corners: readonly { label: string; distanceM: number }[];
  height?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);

  useEffect(() => {
    const el = wrap.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(320, Math.round(entry.contentRect.width)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pts = useMemo(
    () => samples.filter((s) => s.distanceM != null) as (TelemetrySample & { distanceM: number })[],
    [samples],
  );

  const maxDistance = pts.length > 0 ? pts[pts.length - 1].distanceM : 1;
  const maxSpeed = Math.max(350, ...pts.map((p) => p.speed ?? 0));
  const speedTop = Math.ceil(maxSpeed / 50) * 50;

  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;
  const x = (d: number) => M.left + (d / maxDistance) * innerW;
  const ySpeed = (v: number) => M.top + innerH - (v / speedTop) * innerH;
  const yPct = (v: number) => M.top + innerH - (v / 100) * innerH;

  const paths = useMemo(() => {
    const line = (f: (p: (typeof pts)[number]) => number | null, y: (v: number) => number) =>
      pts
        .map((p, i) => {
          const v = f(p);
          return v == null ? "" : `${i === 0 ? "M" : "L"}${x(p.distanceM).toFixed(1)},${y(v).toFixed(1)}`;
        })
        .join(" ");

    const brakeZones: [number, number][] = [];
    let start: number | null = null;
    pts.forEach((p, i) => {
      const on = (p.brake ?? 0) >= 1;
      if (on && start == null) start = p.distanceM;
      if ((!on || i === pts.length - 1) && start != null) {
        brakeZones.push([start, p.distanceM]);
        start = null;
      }
    });

    return {
      speed: line((p) => p.speed, ySpeed),
      throttle: line((p) => p.throttle, yPct),
      brakeZones,
    };
    // The x/y scales are pure functions of these inputs.
  }, [pts, width, height, speedTop, maxDistance]);

  const seekAt = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    const d = ((px - M.left) / innerW) * maxDistance;
    let best = 0;
    let bestGap = Number.POSITIVE_INFINITY;
    samples.forEach((s, i) => {
      if (s.distanceM == null) return;
      const gap = Math.abs(s.distanceM - d);
      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    });
    onSeek(best);
  };

  // Tight sequences (T1–T3, T6–T7) would print on top of each other; keep a
  // marker line for every turn but only label those with room.
  const labelled = new Set<string>();
  let lastLabelX = Number.NEGATIVE_INFINITY;
  [...corners]
    .sort((a, b) => a.distanceM - b.distanceM)
    .forEach((c) => {
      if (x(c.distanceM) - lastLabelX >= 26) {
        labelled.add(c.label);
        lastLabelX = x(c.distanceM);
      }
    });

  const current = samples[index] ?? null;
  const cx = current?.distanceM != null ? x(current.distanceM) : null;
  const kmTicks = Array.from({ length: Math.floor(maxDistance / 1000) + 1 }, (_, i) => i * 1000);
  const speedTicks = Array.from({ length: speedTop / 100 + 1 }, (_, i) => i * 100).filter((v) => v <= speedTop);

  return (
    <div ref={wrap} style={{ width: "100%", overflowX: "auto", fontFamily: SANS }}>
      <svg
        width={width}
        height={height}
        style={{ display: "block", cursor: "ew-resize", touchAction: "none" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          seekAt(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) seekAt(e);
        }}
        role="img"
        aria-label="Speed, throttle and braking against lap distance"
      >
        {/* Braking zones */}
        {paths.brakeZones.map(([a, b], i) => (
          <rect
            key={i}
            x={x(a)}
            y={M.top}
            width={Math.max(x(b) - x(a), 1.5)}
            height={innerH}
            fill={BRAKE}
            opacity={0.16}
          />
        ))}
        {paths.brakeZones.map(([a, b], i) => (
          <rect key={`b${i}`} x={x(a)} y={M.top + innerH - 4} width={Math.max(x(b) - x(a), 1.5)} height={4} fill={BRAKE} />
        ))}

        {/* Grid and axes */}
        {speedTicks.map((v) => (
          <g key={v}>
            <line x1={M.left} x2={M.left + innerW} y1={ySpeed(v)} y2={ySpeed(v)} stroke={T.borderSoft} />
            <text x={M.left - 8} y={ySpeed(v) + 4} textAnchor="end" fontSize={10.5} fill={T.textFaint} fontFamily={MONO}>
              {v}
            </text>
          </g>
        ))}
        {[0, 50, 100].map((v) => (
          <text key={v} x={M.left + innerW + 8} y={yPct(v) + 4} fontSize={10.5} fill={T.textFaint} fontFamily={MONO}>
            {v}
          </text>
        ))}
        {kmTicks.map((d) => (
          <text key={d} x={x(d)} y={M.top + innerH + 16} textAnchor="middle" fontSize={10.5} fill={T.textFaint} fontFamily={MONO}>
            {(d / 1000).toFixed(1)}
          </text>
        ))}
        <text x={M.left + innerW / 2} y={height - 3} textAnchor="middle" fontSize={11} fill={T.textDim}>
          Distance (km)
        </text>
        <text
          transform={`translate(12 ${M.top + innerH / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={11}
          fill={T.textDim}
        >
          Speed (km/h)
        </text>
        <text
          transform={`translate(${width - 8} ${M.top + innerH / 2}) rotate(90)`}
          textAnchor="middle"
          fontSize={11}
          fill={T.textDim}
        >
          Throttle (%)
        </text>

        {/* Corner markers */}
        {corners.map((c) => (
          <g key={c.label}>
            <line x1={x(c.distanceM)} x2={x(c.distanceM)} y1={M.top} y2={M.top + innerH} stroke={T.border} strokeDasharray="2 4" />
            {labelled.has(c.label) && (
              <text x={x(c.distanceM)} y={M.top - 7} textAnchor="middle" fontSize={9.5} fill={T.textFaint} fontWeight={600}>
                {c.label}
              </text>
            )}
          </g>
        ))}

        <path d={paths.throttle} fill="none" stroke={THROTTLE} strokeWidth={1.6} strokeLinejoin="round" opacity={0.95} />
        <path d={paths.speed} fill="none" stroke={SPEED} strokeWidth={2.2} strokeLinejoin="round" />

        {/* Playhead */}
        {cx != null && current && (
          <g pointerEvents="none">
            <line x1={cx} x2={cx} y1={M.top} y2={M.top + innerH} stroke={T.text} strokeWidth={1.2} opacity={0.85} />
            {current.speed != null && (
              <circle cx={cx} cy={ySpeed(current.speed)} r={4.5} fill={SPEED} stroke="#0A0C10" strokeWidth={2} />
            )}
            {current.throttle != null && (
              <circle cx={cx} cy={yPct(current.throttle)} r={4} fill={THROTTLE} stroke="#0A0C10" strokeWidth={2} />
            )}
            <g transform={`translate(${Math.min(cx + 8, M.left + innerW - 118)} ${M.top + 6})`}>
              <rect width={110} height={44} rx={6} fill={T.cardBg} stroke={T.border} opacity={0.97} />
              <text x={9} y={17} fontSize={11} fill={T.text} fontFamily={MONO} fontWeight={700}>
                {formatNumber(current.speed, 0)} km/h
              </text>
              <text x={9} y={33} fontSize={10.5} fill={T.textDim} fontFamily={MONO}>
                {formatNumber(current.throttle, 0)}% · {(current.brake ?? 0) >= 1 ? "BRAKE" : "no brake"}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

export function LapTraceLegend() {
  const item = (color: string, label: string, swatch: "line" | "band") => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textDim }}>
      <span
        aria-hidden
        style={
          swatch === "line"
            ? { width: 14, height: 3, borderRadius: 2, background: color }
            : { width: 12, height: 10, borderRadius: 2, background: color, opacity: 0.55 }
        }
      />
      {label}
    </span>
  );
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {item(SPEED, "Speed (km/h)", "line")}
      {item(THROTTLE, "Throttle (%)", "line")}
      {item(BRAKE, "Braking", "band")}
    </div>
  );
}
