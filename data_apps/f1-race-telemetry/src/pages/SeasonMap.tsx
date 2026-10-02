import { useMemo, useState } from "react";

import { EmptyState, Spinner } from "../components/Card";
import { racesForYear, SeasonGlobe } from "../components/SeasonGlobe";
import type { SessionOption } from "../hooks/useRaceData";
import { SANS, T } from "../lib/tokens";

export function SeasonMap({
  sessions,
  isLoading,
  onSelectRace,
}: {
  sessions: readonly SessionOption[];
  isLoading: boolean;
  onSelectRace: (sessionId: number) => void;
}) {
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const session of sessions) {
      if (session.year != null) {
        set.add(session.year);
      }
    }
    return [...set].sort((a, b) => b - a);
  }, [sessions]);

  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years[0] ?? null;

  const races = useMemo(
    () => (activeYear == null ? [] : racesForYear(sessions, activeYear)),
    [sessions, activeYear],
  );

  if (isLoading && sessions.length === 0) {
    return <Spinner label="Loading season map…" />;
  }

  if (years.length === 0) {
    return <EmptyState>No race sessions are loaded for the map.</EmptyState>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: SANS }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>
            Season map
          </h1>
          <p style={{ margin: 0, color: T.textDim, fontSize: 14 }}>
            Drag the globe, zoom in, then click a circuit to open that race&apos;s replay.
          </p>
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 650,
            color: T.textDim,
          }}
        >
          Year
          <select
            value={activeYear ?? ""}
            onChange={(event) => setYear(Number(event.target.value))}
            aria-label="Season year"
            style={{
              minWidth: 108,
              height: 40,
              padding: "0 12px",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              background: T.cardBg,
              color: T.text,
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </header>

      <SeasonGlobe races={races} onSelect={onSelectRace} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        {races.map((race, index) => (
          <button
            key={race.sessionId}
            type="button"
            onClick={() => onSelectRace(race.sessionId)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              textAlign: "left",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              background: T.cardBg,
              color: T.text,
              cursor: "pointer",
              fontFamily: SANS,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "inline-grid",
                placeItems: "center",
                background: T.accentSoft,
                color: T.accent,
                fontSize: 12,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {index + 1}
            </span>
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 720,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {race.eventName}
              </span>
              <span style={{ display: "block", marginTop: 2, fontSize: 12, color: T.textDim }}>
                {race.location}
                {race.country ? ` · ${race.country}` : ""}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
