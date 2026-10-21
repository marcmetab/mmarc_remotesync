import type { CSSProperties, ReactNode } from "react";

export const colors = {
  page: "#f4f6f9",
  card: "white",
  border: "#e5e7eb",
  text: "#1f2937",
  muted: "#6b7280",
  brand: "#4D96FF",
  danger: "#b91c1c",
  success: "#15803d",
};

const cardStyle: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
};

export function Panel({
  title,
  subtitle,
  actions,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section style={{ ...cardStyle, ...style }}>
      <header style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: colors.text }}>
            {title}
          </h2>
          {subtitle ? (
            <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.muted }}>{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function Spinner({ height = 120 }: { height?: number | string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ height, display: "grid", placeItems: "center", color: colors.muted, fontSize: 13 }}
    >
      Loading…
    </div>
  );
}

export function PanelError({ error }: { error: unknown }) {
  return (
    <pre
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        color: colors.danger,
        background: "#fef2f2",
        borderRadius: 8,
        padding: 12,
        fontSize: 12,
      }}
    >
      {error instanceof Error ? error.message : String(error)}
    </pre>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: 24, textAlign: "center", color: colors.muted, fontSize: 13 }}>
      {children}
    </div>
  );
}
