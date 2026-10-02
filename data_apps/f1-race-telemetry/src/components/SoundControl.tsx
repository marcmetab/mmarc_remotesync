import { SANS, T } from "../lib/tokens";

/** Speaker toggle + volume slider for lap-replay engine sound. */
export function SoundControl({
  enabled,
  volume,
  onEnabledChange,
  onVolumeChange,
  disabled,
}: {
  enabled: boolean;
  volume: number;
  onEnabledChange: (next: boolean) => void;
  onVolumeChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        fontFamily: SANS,
      }}
    >
      <button
        type="button"
        aria-pressed={enabled}
        aria-label={enabled ? "Mute engine sound" : "Enable engine sound"}
        disabled={disabled}
        onClick={() => onEnabledChange(!enabled)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 12px",
          borderRadius: T.radiusSm,
          border: `1px solid ${enabled ? T.accent : T.border}`,
          background: enabled ? T.accentSoft : T.cardBg,
          color: enabled ? T.accent : T.textDim,
          font: "inherit",
          fontSize: 12,
          fontWeight: 650,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <SpeakerIcon muted={!enabled} />
        Sound {enabled ? "on" : "off"}
      </button>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: T.textDim,
          opacity: disabled || !enabled ? 0.55 : 1,
        }}
      >
        Volume
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          disabled={disabled || !enabled}
          aria-label="Engine sound volume"
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          style={{
            width: 110,
            accentColor: T.accent,
            cursor: disabled || !enabled ? "not-allowed" : "pointer",
          }}
        />
      </label>

      <span style={{ fontSize: 11, color: T.textFaint }}>
        pitch follows RPM · turns on with a click
      </span>
    </div>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      {muted ? (
        <>
          <path d="m16 9 5 5" />
          <path d="m21 9-5 5" />
        </>
      ) : (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" />
        </>
      )}
    </svg>
  );
}
