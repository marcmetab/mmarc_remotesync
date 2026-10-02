import type { CSSProperties } from "react";

export const colors = {
  brand: "#4D96FF",
  text: "#1f2937",
  textMuted: "#4b5563",
  border: "#e5e7eb",
  surface: "#f9fafb",
  background: "white",
};

export const container: CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  padding: "0 24px",
};

export const card: CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: 20,
  background: colors.background,
};

export const primaryButton: CSSProperties = {
  background: colors.brand,
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "10px 18px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
