import { useMemo } from "react";

import type { CornerRow } from "../hooks/useRaceData";
import { MONO, T } from "../lib/tokens";

export type TrackCar = {
  driverNumber: number;
  abbreviation: string;
  color: string;
  x: number;
  y: number;
  onTrack: boolean;
};

export type TrackPoint = { x: number; y: number };

const PAD = 0.06;

/**
 * The circuit drawn from a real telemetry lap's x/y trace, with numbered
 * corners and one dot per car. Track coordinates are y-up; SVG is y-down, so
 * y is flipped on projection.
 */
export function TrackMap({
  line,
  corners,
  cars,
  showLabels = true,
  height = 320,
}: {
  line: readonly TrackPoint[];
  corners: readonly CornerRow[];
  cars: readonly TrackCar[];
  showLabels?: boolean;
  height?: number;
}) {
  const view = useMemo(() => {
    const points = [
      ...line,
      ...corners.map((c) => ({ x: c.x, y: c.y })),
      ...cars.map((c) => ({ x: c.x, y: c.y })),
    ].filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

    if (points.length === 0) {
      return null;
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const padX = spanX * PAD;
    const padY = spanY * PAD;

    return {
      minX: minX - padX,
      minY: minY - padY,
      width: spanX + padX * 2,
      height: spanY + padY * 2,
      maxY: maxY + padY,
    };
  }, [line, corners, cars]);

  if (!view) {
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

  // Flip y so the map reads the same way round as a circuit diagram.
  const px = (x: number) => x - view.minX;
  const py = (y: number) => view.maxY - y;

  const path = line
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    .map((p, i) => `${i === 0 ? "M" : "L"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`)
    .join(" ");

  const unit = Math.max(view.width, view.height);
  const strokeWidth = unit * 0.022;
  const carRadius = unit * 0.016;
  const cornerRadius = unit * 0.008;
  const labelSize = unit * 0.026;

  return (
    <svg
      viewBox={`0 0 ${view.width} ${view.height}`}
      style={{ width: "100%", height, display: "block", overflow: "visible" }}
      role="img"
      aria-label="Circuit map with car positions"
    >
      {path && (
        <>
          <path
            d={`${path} Z`}
            fill="none"
            stroke={T.borderSoft}
            strokeWidth={strokeWidth * 1.7}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={`${path} Z`}
            fill="none"
            stroke="#2C3543"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      )}

      {corners.map((corner) => (
        <circle
          key={`${corner.cornerNumber}${corner.letter ?? ""}`}
          cx={px(corner.x)}
          cy={py(corner.y)}
          r={cornerRadius}
          fill={T.textFaint}
          opacity={0.55}
        />
      ))}

      {cars.map((car) => (
        <g key={car.driverNumber} opacity={car.onTrack ? 1 : 0.35}>
          <circle
            cx={px(car.x)}
            cy={py(car.y)}
            r={carRadius}
            fill={car.color}
            stroke={T.pageBg}
            strokeWidth={carRadius * 0.35}
          />
          {showLabels && (
            <text
              x={px(car.x) + carRadius * 1.6}
              y={py(car.y) + labelSize * 0.35}
              fill={T.text}
              fontSize={labelSize}
              fontFamily={MONO}
              fontWeight={700}
              style={{ paintOrder: "stroke" }}
              stroke={T.pageBg}
              strokeWidth={labelSize * 0.22}
            >
              {car.abbreviation}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
