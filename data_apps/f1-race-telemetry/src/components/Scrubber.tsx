import { useEffect, useRef } from "react";

import { MONO, SANS, T } from "../lib/tokens";

/**
 * Transport control for stepping through a race (laps) or a lap (samples).
 * Playback advances one step per tick and stops at the end.
 */
export function Scrubber({
  value,
  min,
  max,
  onChange,
  playing,
  onPlayingChange,
  intervalMs = 700,
  primaryLabel,
  secondaryLabel,
  disabled,
  ariaLabel,
  canAdvance = true,
  advanceOnPlay = false,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  playing: boolean;
  onPlayingChange: (next: boolean) => void;
  intervalMs?: number;
  primaryLabel: string;
  secondaryLabel?: string;
  disabled?: boolean;
  ariaLabel?: string;
  /** Pause the playback clock while the next frame is being prepared. */
  canAdvance?: boolean;
  /** Show the prepared next frame as soon as Play is pressed. */
  advanceOnPlay?: boolean;
}) {
  const pendingFirstStep = useRef(false);

  useEffect(() => {
    if (!playing || disabled || max <= min || !canAdvance) {
      return;
    }
    if (pendingFirstStep.current) {
      pendingFirstStep.current = false;
      const next = Math.min(value + 1, max);
      onChange(next);
      if (next >= max) onPlayingChange(false);
      return;
    }
    const timer = window.setTimeout(() => {
      const next = Math.min(value + 1, max);
      onChange(next);
      if (next >= max) {
        onPlayingChange(false);
      }
    }, intervalMs);
    return () => window.clearTimeout(timer);
  }, [playing, value, max, min, intervalMs, disabled, canAdvance, onChange, onPlayingChange]);

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const atEnd = value >= max;

  return (
    <div
      className="f1-scrubber"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 18px",
        background: T.cardBg,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius,
        fontFamily: SANS,
      }}
    >
      <TransportButton
        label="Start"
        onClick={() => {
          onPlayingChange(false);
          onChange(min);
        }}
        disabled={disabled || value <= min}
        glyph="⏮"
      />

      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        disabled={disabled || max <= min}
        onClick={() => {
          if (atEnd) {
            pendingFirstStep.current = false;
            onChange(min);
            onPlayingChange(true);
            return;
          }
          if (!playing && advanceOnPlay && canAdvance) {
            const next = value + 1;
            onChange(next);
            onPlayingChange(next < max);
            return;
          }
          pendingFirstStep.current = !playing && advanceOnPlay && !canAdvance;
          onPlayingChange(!playing);
        }}
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          flexShrink: 0,
          border: `2px solid ${T.accent}`,
          background: T.accentSoft,
          color: T.text,
          fontSize: 14,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {playing ? "❚❚" : "▶"}
      </button>

      <div className="f1-scrubber-range" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
        <input
          type="range"
          aria-label={ariaLabel ?? "Scrub position"}
          min={min}
          max={Math.max(min, max)}
          value={value}
          disabled={disabled || max <= min}
          onChange={(event) => {
            onPlayingChange(false);
            onChange(Number(event.target.value));
          }}
          style={{
            width: "100%",
            accentColor: T.accent,
            height: 6,
            cursor: disabled ? "not-allowed" : "pointer",
            background: `linear-gradient(to right, ${T.accent} 0%, ${T.accent} ${ratio * 100}%, ${T.borderSoft} ${ratio * 100}%, ${T.borderSoft} 100%)`,
            borderRadius: 999,
            appearance: "none",
            WebkitAppearance: "none",
          }}
        />
      </div>

      <div className="f1-scrubber-label" style={{ textAlign: "right", minWidth: 128, flexShrink: 0 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: T.text,
            fontFamily: MONO,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {primaryLabel}
        </div>
        {secondaryLabel && (
          <div style={{ fontSize: 12, color: T.textDim, marginTop: 2, whiteSpace: "nowrap" }}>
            {secondaryLabel}
          </div>
        )}
      </div>

      <TransportButton
        label="End"
        onClick={() => {
          onPlayingChange(false);
          onChange(max);
        }}
        disabled={disabled || atEnd}
        glyph="⏭"
        trailing
      />
    </div>
  );
}

function TransportButton({
  label,
  glyph,
  onClick,
  disabled,
  trailing,
}: {
  label: string;
  glyph: string;
  onClick: () => void;
  disabled?: boolean;
  trailing?: boolean;
}) {
  return (
    <button
      className={`f1-transport-button${trailing ? " f1-scrubber-end" : ""}`}
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        padding: "9px 16px",
        background: T.cardBgRaised,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm,
        color: disabled ? T.textFaint : T.text,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        fontFamily: SANS,
      }}
    >
      {!trailing && <span aria-hidden>{glyph}</span>}
      <span className="f1-transport-text">{label}</span>
      {trailing && <span aria-hidden>{glyph}</span>}
    </button>
  );
}
