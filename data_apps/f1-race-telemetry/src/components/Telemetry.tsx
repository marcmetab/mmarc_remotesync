import type { ReactNode } from "react";

import { formatNumber } from "../lib/format";
import { MONO, T } from "../lib/tokens";

/** Circular dial: speed, RPM, throttle, brake. */
export function Gauge({
  value,
  max,
  label,
  unit,
  color,
  size = 78,
  digits = 0,
}: {
  value: number | null;
  max: number;
  label: string;
  unit?: string;
  color: string;
  size?: number;
  digits?: number;
}) {
  const stroke = size * 0.1;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Leave a gap at the bottom so the dial reads as a gauge, not a ring.
  const sweep = 0.78;
  const ratio =
    value == null || max <= 0 ? 0 : Math.min(Math.max(value / max, 0), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(140deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={T.borderSoft}
            strokeWidth={stroke}
            strokeDasharray={`${circumference * sweep} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${circumference * sweep * ratio} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <span
            style={{
              fontSize: size * 0.26,
              fontWeight: 700,
              color: T.text,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {value == null ? "—" : formatNumber(value, digits)}
          </span>
          {unit && (
            <span style={{ fontSize: size * 0.12, color: T.textFaint }}>{unit}</span>
          )}
        </div>
      </div>
      <span
        style={{
          fontSize: 11,
          color: T.textDim,
          letterSpacing: 0.3,
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** Horizontal meter for a 0–100 channel. */
export function ChannelBar({
  label,
  value,
  color,
  suffix = "%",
}: {
  label: string;
  value: number | null;
  color: string;
  suffix?: string;
}) {
  const ratio = value == null ? 0 : Math.min(Math.max(value / 100, 0), 1);
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 11, color: T.textDim, letterSpacing: 0.3 }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.text,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value == null ? "—" : `${Math.round(value)}${suffix}`}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: T.borderSoft,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
            transition: "width 120ms linear",
          }}
        />
      </div>
    </div>
  );
}

/** `brake` is a 0/1 flag in this dataset, not a percentage — show it as a state. */
export function FlagChannel({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean | null;
  color: string;
}) {
  const on = active === true;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 11, color: T.textDim, letterSpacing: 0.3 }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: active == null ? T.textFaint : on ? color : T.textFaint,
          }}
        >
          {active == null ? "—" : on ? "ON" : "OFF"}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: T.borderSoft,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: on ? "100%" : "0%",
            height: "100%",
            background: color,
            borderRadius: 999,
            transition: "width 90ms linear",
          }}
        />
      </div>
    </div>
  );
}

export function DrsIndicator({ active }: { active: boolean | null }) {
  const on = active === true;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: T.radiusSm,
        border: `1px solid ${on ? "rgba(34,197,94,0.4)" : T.border}`,
        background: on ? "rgba(34,197,94,0.10)" : T.cardBgRaised,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          color: T.textDim,
        }}
      >
        DRS
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.6,
          color: on ? T.green : T.textFaint,
        }}
      >
        {active == null ? "—" : on ? "ACTIVE" : "CLOSED"}
      </span>
    </div>
  );
}

/** The mockup's readout tiles: big mono number, small caption. */
export function Readout({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
  hint?: ReactNode;
}) {
  return (
    <div
      style={{
        background: T.cardBgRaised,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm,
        padding: "12px 14px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: T.textFaint,
          marginBottom: 6,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 19,
          fontWeight: 700,
          fontFamily: MONO,
          color: accent ?? T.text,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {hint != null && (
        <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

export function GearDisplay({ gear }: { gear: number | null }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 64,
      }}
    >
      <span
        style={{
          fontSize: 38,
          fontWeight: 800,
          fontFamily: MONO,
          color: T.text,
          lineHeight: 1,
        }}
      >
        {gear == null || gear === 0 ? "N" : gear}
      </span>
      <span style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>GEAR</span>
    </div>
  );
}
