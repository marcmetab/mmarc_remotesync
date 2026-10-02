import type { CSSProperties, ReactNode } from "react";

import { SANS, T } from "../lib/tokens";

export function Card({
  title,
  icon,
  right,
  children,
  style,
  bodyStyle,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}) {
  return (
    <section
      style={{
        background: T.cardBg,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        fontFamily: SANS,
        ...style,
      }}
    >
      {(title || right) && (
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
            borderBottom: `1px solid ${T.borderSoft}`,
            minHeight: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            {icon}
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: T.text,
                letterSpacing: 0.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </h2>
          </div>
          {right}
        </header>
      )}
      <div style={{ padding: 16, flex: 1, minHeight: 0, ...bodyStyle }}>
        {children}
      </div>
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  color,
  mono,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.7,
          color: T.textFaint,
          marginBottom: 6,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: color ?? T.text,
          fontVariantNumeric: "tabular-nums",
          fontFamily: mono ? "inherit" : undefined,
          lineHeight: 1.15,
        }}
      >
        {value}
      </div>
      {sub != null && (
        <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>{sub}</div>
      )}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 28,
        color: T.textDim,
        fontSize: 13,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: `2px solid ${T.border}`,
          borderTopColor: T.accent,
          display: "inline-block",
          animation: "f1spin 0.8s linear infinite",
        }}
      />
      {label ?? "Loading…"}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 28,
        textAlign: "center",
        color: T.textFaint,
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  color,
  background,
}: {
  children: ReactNode;
  color?: string;
  background?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        color: color ?? T.textDim,
        background: background ?? T.cardBgRaised,
        border: `1px solid ${T.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
