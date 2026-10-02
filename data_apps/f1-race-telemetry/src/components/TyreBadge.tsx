import { compoundStyle } from "../lib/format";
import { MONO, T } from "../lib/tokens";

export function TyreBadge({
  compound,
  size = 22,
  withLabel = false,
}: {
  compound: string | null | undefined;
  size?: number;
  withLabel?: boolean;
}) {
  const style = compoundStyle(compound);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        aria-hidden
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `${Math.max(2, size * 0.11)}px solid ${style.color}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.45,
          fontWeight: 700,
          fontFamily: MONO,
          color: style.color,
          flexShrink: 0,
        }}
      >
        {style.letter}
      </span>
      {withLabel && (
        <span style={{ fontSize: 12, color: T.textDim, letterSpacing: 0.4 }}>
          {style.label.toUpperCase()}
        </span>
      )}
    </span>
  );
}
