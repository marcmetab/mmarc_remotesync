import { type KeyboardEvent, type PointerEvent, type ReactNode, useRef } from "react";

import { PROSE, TYPED } from "./fonts";
import { jdFromDate } from "./orbits";
import type { SceneTheme } from "./themes";
import { fmt2, fmtDate } from "./words";

export type RailApproach = { mark: string; jd: number; date: Date; distLunar: number };

export const SPEEDS = [
  { label: "1 day/s", days: 1 },
  { label: "1 wk/s", days: 7 },
  { label: "1 mo/s", days: 30 },
  { label: "1 yr/s", days: 365 },
];
export const BLINK_GAPS = [
  { label: "1 day", days: 1 },
  { label: "1 week", days: 7 },
  { label: "30 days", days: 30 },
  { label: "1 year", days: 365 },
];
export const BLINK_RATES = [
  { label: "slow", ms: 1000 },
  { label: "medium", ms: 520 },
  { label: "fast", ms: 240 },
];

type Props = {
  theme: SceneTheme;
  jd: number;
  todayJd: number;
  onChange: (jd: number) => void;
  onPickDate: (jd: number) => void;
  direction: -1 | 0 | 1;
  onPlay: (direction: -1 | 0 | 1) => void;
  speedDays: number;
  onSpeed: (days: number) => void;
  blinking: boolean;
  onToggleBlink: () => void;
  blinkGap: number;
  onBlinkGap: (days: number) => void;
  blinkMs: number;
  onBlinkMs: (ms: number) => void;
  approaches: RailApproach[];
};

const YEARS_BACK = 20;
const YEARS_AHEAD = 30;
const DAYS_PER_YEAR = 365.25;

function Icon({ d }: { d: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden style={{ display: "block" }}>
      <path d={d} fill="currentColor" />
    </svg>
  );
}
const PLAY = "M3 1.5v11l9.5-5.5z";
const REVERSE = "M11 1.5v11L1.5 7z";
const PAUSE = "M2.5 1.5h3.2v11H2.5zM8.3 1.5h3.2v11H8.3z";

export function RailButton({ theme, label, pressed, onClick, children }: { theme: SceneTheme; label: string; pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className="plate-button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 11px",
        border: `1px solid ${pressed ? theme.control : theme.label}`, borderRadius: 3,
        background: pressed ? theme.control : theme.controlBg, color: pressed ? theme.controlBg : theme.control,
        fontFamily: TYPED, fontSize: 12, letterSpacing: "0.04em", cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// A row of mutually exclusive choices, e.g. playback speed.
export function Segmented<T extends number | string>({ theme, label, options, value, onChange }: {
  theme: SceneTheme; label: string; options: { label: string; value: T }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontFamily: TYPED, fontSize: 11.5, color: theme.textSoft, marginRight: 2 }}>{label}</span>
      {options.map((o) => (
        <button
          key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} className="plate-seg" onClick={() => onChange(o.value)}
          style={{
            height: 24, padding: "0 7px", borderRadius: 3, cursor: "pointer", fontFamily: TYPED, fontSize: 11.5,
            border: `1px solid ${o.value === value ? theme.control : "transparent"}`,
            background: o.value === value ? theme.controlBg : "transparent", color: o.value === value ? theme.control : theme.textSoft,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TimeRail(p: Props) {
  const { theme, jd, todayJd, onChange, approaches } = p;
  const railRef = useRef<HTMLDivElement>(null);
  const start = todayJd - YEARS_BACK * DAYS_PER_YEAR;
  const end = todayJd + YEARS_AHEAD * DAYS_PER_YEAR;
  const frac = (x: number) => Math.min(1, Math.max(0, (x - start) / (end - start)));
  const firstYear = new Date((start - 2440587.5) * 86400000).getUTCFullYear() + 1;
  const years: number[] = [];
  for (let y = Math.ceil(firstYear / 5) * 5; y <= firstYear + YEARS_BACK + YEARS_AHEAD; y += 5) years.push(y);

  const setFromPointer = (e: PointerEvent) => {
    const rect = railRef.current!.getBoundingClientRect();
    onChange(start + ((e.clientX - rect.left) / rect.width) * (end - start));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 365.25 : e.key.startsWith("Page") ? 30 : 1;
    if (e.key === "ArrowRight" || e.key === "PageUp") onChange(Math.min(end, jd + step));
    else if (e.key === "ArrowLeft" || e.key === "PageDown") onChange(Math.max(start, jd - step));
    else if (e.key === "Home") onChange(todayJd);
    else return;
    e.preventDefault();
  };

  return (
    <div style={{ display: "grid", gap: 8, fontFamily: PROSE }}>
      {/* Time and blink settings. */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 18px" }}>
        <Segmented theme={theme} label="Speed" value={p.speedDays} onChange={p.onSpeed}
          options={SPEEDS.map((s) => ({ label: s.label, value: s.days }))} />
        <Segmented theme={theme} label="Blink gap" value={p.blinkGap} onChange={p.onBlinkGap}
          options={BLINK_GAPS.map((s) => ({ label: s.label, value: s.days }))} />
        <Segmented theme={theme} label="Blink rate" value={p.blinkMs} onChange={p.onBlinkMs}
          options={BLINK_RATES.map((s) => ({ label: s.label, value: s.ms }))} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "10px 16px" }}>
        <div style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
          <RailButton theme={theme} label={p.direction === -1 ? "Pause" : "Run time backward"} pressed={p.direction === -1} onClick={() => p.onPlay(p.direction === -1 ? 0 : -1)}>
            <Icon d={p.direction === -1 ? PAUSE : REVERSE} />
          </RailButton>
          <RailButton theme={theme} label={p.direction === 1 ? "Pause" : "Run time forward"} pressed={p.direction === 1} onClick={() => p.onPlay(p.direction === 1 ? 0 : 1)}>
            <Icon d={p.direction === 1 ? PAUSE : PLAY} />
          </RailButton>
          <RailButton theme={theme} label="Blink between this date and a later one" pressed={p.blinking} onClick={p.onToggleBlink}>
            BLINK
          </RailButton>
          <RailButton theme={theme} label="Back to today" onClick={() => onChange(todayJd)}>
            TODAY
          </RailButton>
          {/* Any day from 1900 to 2100: a birthday, an anniversary. */}
          <input
            type="date" aria-label="Go to a date, like your birthday" title="Go to a date, like your birthday"
            className="plate-date" min="1900-01-01" max="2100-12-31"
            value={new Date((jd - 2440587.5) * 86400000).toISOString().slice(0, 10)}
            onChange={(e) => {
              const d = new Date(`${e.target.value}T12:00:00Z`);
              if (!Number.isNaN(d.getTime()) && d.getUTCFullYear() >= 1900 && d.getUTCFullYear() <= 2100) p.onPickDate(jdFromDate(d));
            }}
            style={{ height: 30, padding: "0 8px", border: `1px solid ${theme.label}`, borderRadius: 3, background: theme.controlBg, color: theme.control, fontFamily: TYPED, fontSize: 12, colorScheme: theme.glowBlending ? "dark" : "light" }}
          />
        </div>

        <div
          ref={railRef}
          role="slider"
          tabIndex={0}
          aria-label="Plate date"
          aria-valuemin={Math.round(start)}
          aria-valuemax={Math.round(end)}
          aria-valuenow={Math.round(jd)}
          aria-valuetext={fmtDate(new Date((jd - 2440587.5) * 86400000))}
          className="plate-rail"
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            setFromPointer(e);
          }}
          onPointerMove={(e) => e.buttons && setFromPointer(e)}
          style={{ position: "relative", flex: "1 1 320px", height: 58, cursor: "ew-resize", touchAction: "none", borderRadius: 2 }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, height: 1, background: theme.textSoft }} />
          {years.map((y) => {
            const x = frac(jdFromDate(new Date(Date.UTC(y, 0, 1))));
            return (
              <div key={y} className={y % 10 === 0 ? undefined : "plate-year-minor"} style={{ position: "absolute", left: `${x * 100}%`, bottom: 0 }}>
                <div style={{ position: "absolute", bottom: 16, width: 1, height: y % 10 === 0 ? 8 : 5, background: theme.textSoft }} />
                <div style={{ position: "absolute", bottom: 0, transform: "translateX(-50%)", fontFamily: TYPED, fontSize: 10, color: theme.textSoft }}>{y}</div>
              </div>
            );
          })}
          {/* close approaches of the circled asteroids: taller = closer, dashed = already happened */}
          {approaches.map((a) => {
            const h = 10 + 30 * Math.min(1, Math.max(0, (Math.log10(20) - Math.log10(Math.max(0.05, a.distLunar))) / Math.log10(400)));
            const past = a.jd < todayJd;
            return (
              <button
                key={`${a.mark}-${a.jd}`}
                type="button"
                className="plate-tick"
                title={`${a.mark}: ${fmtDate(a.date)}, ${fmt2(a.distLunar)}× the Moon's distance`}
                aria-label={`Jump to close pass of ${a.mark} on ${fmtDate(a.date)}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onChange(a.jd)}
                style={{ position: "absolute", left: `${frac(a.jd) * 100}%`, bottom: 17, width: 11, height: h + 12, marginLeft: -5, padding: 0, border: 0, background: "transparent", cursor: "pointer" }}
              >
                <span style={{ position: "absolute", left: 5, bottom: 0, height: h, borderLeft: `1.5px ${past ? "dashed" : "solid"} ${theme.control}` }} />
                <span style={{ position: "absolute", left: 0, bottom: h + 1, width: 11, textAlign: "center", fontFamily: TYPED, fontSize: 10, fontWeight: 700, color: theme.ring }}>{a.mark}</span>
              </button>
            );
          })}
          <div style={{ position: "absolute", left: `${frac(todayJd) * 100}%`, bottom: 16, height: 14, borderLeft: `1px dotted ${theme.textSoft}` }} />
          <div style={{ position: "absolute", left: `${frac(jd) * 100}%`, bottom: 12, width: 2, height: 46, marginLeft: -1, background: theme.control }} />
        </div>
      </div>
    </div>
  );
}
