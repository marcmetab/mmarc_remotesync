import { DataAppLink } from "@metabase/embedding-sdk-react/data-app";
import { useState, type CSSProperties } from "react";

import { EmptyState, Spinner } from "../components/Card";
import { Headshot } from "../components/Headshot";
import type { DriverResult, RaceData } from "../hooks/useRaceData";
import { formatClock, formatGap, formatNumber, ordinal, teamColor } from "../lib/format";
import { DISPLAY, T } from "../lib/tokens";

type FieldFilter = "all" | "classified" | "out";

const PODIUM_ORDER = [2, 1, 3];
const PODIUM_LABELS: Record<number, string> = { 1: "Race winner", 2: "Second place", 3: "Third place" };

function isClassified(driver: DriverResult): boolean {
  return driver.status === "Finished" || /^\d+$/.test(driver.classifiedPosition ?? "");
}

function raceGap(driver: DriverResult): string {
  if (!isClassified(driver)) return driver.status ?? "Out";
  if (driver.position === 1) return formatClock(driver.raceTimeMs);
  return driver.raceTimeMs == null ? driver.status ?? "—" : formatGap(driver.raceTimeMs);
}

function positionLabel(driver: DriverResult): string {
  if (isClassified(driver)) return String(driver.position ?? driver.classifiedPosition ?? "—");
  return /did not start|dns/i.test(driver.status ?? "") ? "DNS" : "DNF";
}

function placeChange(driver: DriverResult): { label: string; direction: "up" | "down" | "held" } {
  if (!isClassified(driver) || driver.gridPosition == null || driver.position == null) {
    return { label: "—", direction: "held" };
  }
  const delta = driver.gridPosition - driver.position;
  return delta > 0
    ? { label: `▲ ${delta}`, direction: "up" }
    : delta < 0
      ? { label: `▼ ${Math.abs(delta)}`, direction: "down" }
      : { label: "—", direction: "held" };
}

export function RaceResults({ race }: { race: RaceData }) {
  const [filter, setFilter] = useState<FieldFilter>("all");

  if (race.resultsLoading) {
    return <Spinner label="Loading race results…" />;
  }

  if (race.results.length === 0) {
    return <EmptyState>No classification for this session.</EmptyState>;
  }

  const results = [...race.results].sort(
    (a, b) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER),
  );
  const podium = PODIUM_ORDER.flatMap((position) => {
    const driver = results.find((result) => result.position === position);
    return driver ? [driver] : [];
  });
  const podiumNumbers = new Set(podium.map((driver) => driver.driverNumber));
  const field = results.filter((driver) => !podiumNumbers.has(driver.driverNumber));
  const visibleField = field.filter((driver) =>
    filter === "all" ? true : filter === "classified" ? isClassified(driver) : !isClassified(driver),
  );

  return (
    <div className="f1-drivers-page">
      <style>{`
        .f1-drivers-page { display: flex; flex-direction: column; gap: 22px; }
        .f1-drivers-heading h1 { margin: 0 0 4px; font-size: 32px; line-height: 1.15; }
        .f1-drivers-heading p { margin: 0; color: ${T.textDim}; font-size: 14px; }
        .f1-podium {
          position: relative; overflow: hidden; padding: 22px 22px 0;
          border: 1px solid ${T.border}; border-radius: 14px;
          background: radial-gradient(ellipse 58% 65% at 50% 78%, rgba(235, 28, 36, .10), transparent 72%),
            linear-gradient(180deg, #27272E, #1D1D24 80%);
        }
        .f1-podium-title { color: ${T.textFaint}; font: 700 11px ${DISPLAY}; letter-spacing: 2.2px; text-transform: uppercase; }
        .f1-podium-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: end; gap: 14px; margin: 0 auto; max-width: 1100px; }
        .f1-podium-entry {
          --medal: #D8A474; display: flex; min-width: 0; flex-direction: column; align-items: center;
          text-align: center; color: ${T.text}; text-decoration: none; outline-offset: -3px;
          transition: transform 260ms ease;
        }
        .f1-podium-entry[data-place="1"] { --medal: #FFD776; }
        .f1-podium-entry[data-place="2"] { --medal: #D8E0EE; }
        .f1-podium-entry:is(:hover, :focus-visible) { transform: translateY(-6px); color: ${T.text}; }
        .f1-podium-entry:focus-visible { outline: 2px solid var(--medal); border-radius: 8px; }
        .f1-podium-reveal {
          display: flex; align-items: center; gap: 5px; height: 28px; padding: 0 11px; margin-bottom: 8px;
          border: 1px solid color-mix(in srgb, var(--medal) 60%, transparent); border-radius: 100px;
          background: color-mix(in srgb, var(--medal) 13%, #15151B); color: var(--medal);
          font: 700 11px ${DISPLAY}; letter-spacing: .6px; text-transform: uppercase;
          opacity: 0; transform: translateY(8px); transition: opacity 220ms ease, transform 220ms ease;
        }
        .f1-podium-entry:is(:hover, :focus-visible) .f1-podium-reveal { opacity: 1; transform: translateY(0); }
        .f1-podium-portrait { position: relative; isolation: isolate; border-radius: 50%; }
        .f1-podium-portrait::before {
          content: ""; position: absolute; inset: -15px; z-index: -1; border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--medal) 26%, transparent), transparent 70%);
          opacity: 0; transform: scale(.75); transition: opacity 300ms ease, transform 360ms ease;
        }
        .f1-podium-entry:is(:hover, :focus-visible) .f1-podium-portrait::before { opacity: 1; transform: scale(1.45); }
        .f1-podium-portrait > img, .f1-podium-portrait > div { transition: transform 300ms ease, box-shadow 300ms ease; }
        .f1-podium-entry:is(:hover, :focus-visible) .f1-podium-portrait > img,
        .f1-podium-entry:is(:hover, :focus-visible) .f1-podium-portrait > div {
          transform: scale(1.06); box-shadow: 0 0 0 5px color-mix(in srgb, var(--medal) 25%, transparent), 0 16px 32px #0007;
        }
        .f1-podium-name { margin-top: 13px; font: 700 clamp(14px, 1.8vw, 20px) ${DISPLAY}; line-height: 1.15; }
        .f1-podium-team { margin-top: 4px; color: ${T.textDim}; font-size: 12px; }
        .f1-podium-metrics { display: flex; justify-content: center; gap: 15px; margin: 14px 0 16px; color: ${T.textFaint}; font-size: 12px; font-variant-numeric: tabular-nums; }
        .f1-podium-metrics b { color: ${T.text}; font-weight: 700; }
        .f1-podium-step {
          position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column;
          width: 100%; height: var(--step-height); overflow: hidden;
          border-top: 4px solid var(--team-color); border-radius: 5px 5px 0 0;
          background: linear-gradient(145deg, #34343D 0%, #24242C 45%, #16161C 100%);
          box-shadow: inset 0 1px #ffffff28, 0 -6px 24px #0004;
        }
        .f1-podium-step::before { content: ""; position: absolute; top: 11px; left: 10%; right: 10%; height: 1px; background: #ffffff19; }
        .f1-podium-step::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(110deg, transparent 25%, color-mix(in srgb, var(--medal) 30%, transparent) 50%, transparent 75%);
          transform: translateX(-120%); transition: transform 700ms ease;
        }
        .f1-podium-entry:is(:hover, :focus-visible) .f1-podium-step::after { transform: translateX(120%); }
        .f1-podium-number { color: ${T.text}; font: 700 clamp(48px, 7vw, 86px) ${DISPLAY}; line-height: 1; text-shadow: 0 4px 20px #0007; }
        .f1-podium-place { margin-top: 1px; color: var(--medal); font: 700 11px ${DISPLAY}; letter-spacing: 2px; text-transform: uppercase; }
        .f1-podium-base { height: 13px; margin: 0 -22px; background: linear-gradient(180deg, #373740, #18181E); border-top: 1px solid #ffffff24; }
        .f1-field-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .f1-field-heading h2 { margin: 0; font-size: 18px; }
        .f1-field-heading p { margin: 2px 0 0; color: ${T.textFaint}; font-size: 12px; }
        .f1-field-filters { display: flex; gap: 3px; padding: 3px; border: 1px solid ${T.border}; border-radius: 9px; background: ${T.cardBg}; }
        .f1-field-filters button { border: 0; border-radius: 6px; padding: 6px 11px; background: transparent; color: ${T.textDim}; cursor: pointer; font-size: 12px; font-weight: 700; }
        .f1-field-filters button[aria-pressed="true"] { background: ${T.cardBgRaised}; color: ${T.text}; box-shadow: 0 1px 4px #0004; }
        .f1-field-filters button:is(:hover, :focus-visible) { color: ${T.text}; outline-color: ${T.accent}; }
        .f1-classification { overflow: hidden; border: 1px solid ${T.border}; border-radius: 12px; background: ${T.cardBg}; }
        .f1-classification-head, .f1-classification-row {
          display: grid; grid-template-columns: 58px 58px minmax(180px, 1fr) 110px 70px 60px 110px;
          align-items: center; gap: 12px; padding: 10px 18px;
        }
        .f1-classification-head { border-bottom: 1px solid ${T.border}; color: ${T.textFaint}; font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; }
        .f1-classification-row { position: relative; min-height: 64px; border-bottom: 1px solid ${T.borderSoft}; color: ${T.text}; text-decoration: none; transition: background 150ms ease; }
        .f1-classification-row:last-child { border-bottom: 0; }
        .f1-classification-row::before { content: ""; position: absolute; top: 11px; bottom: 11px; left: 0; width: 4px; border-radius: 0 3px 3px 0; background: var(--team-color); }
        .f1-classification-row:is(:hover, :focus-visible) { background: ${T.cardBgRaised}; color: ${T.text}; }
        .f1-classification-row:focus-visible { outline: 2px solid ${T.accent}; outline-offset: -2px; }
        .f1-classification-pos { font: 700 20px ${DISPLAY}; font-variant-numeric: tabular-nums; }
        .f1-classification-change { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .f1-classification-change[data-direction="up"] { color: ${T.green}; }
        .f1-classification-change[data-direction="down"] { color: ${T.accent}; }
        .f1-classification-change[data-direction="held"] { color: ${T.textFaint}; }
        .f1-classification-driver { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .f1-classification-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 700; }
        .f1-classification-team { color: ${T.textDim}; font-size: 12px; }
        .f1-classification-gap, .f1-classification-points, .f1-classification-num { text-align: right; font-variant-numeric: tabular-nums; }
        .f1-classification-gap { font-size: 13px; }
        .f1-classification-gap[data-out="true"] { color: ${T.amber}; }
        .f1-classification-points { font-weight: 700; }
        .f1-classification-num { color: ${T.textFaint}; font-size: 12px; }
        .f1-classification-action { text-align: right; color: ${T.purple}; font-size: 12px; font-weight: 700; }
        .f1-classification-action[data-unavailable="true"] { color: ${T.textFaint}; font-weight: 400; }
        .f1-classification-empty { padding: 30px; text-align: center; color: ${T.textFaint}; font-size: 13px; }
        @media (max-width: 900px) {
          .f1-classification-head, .f1-classification-row { grid-template-columns: 48px 44px minmax(140px, 1fr) 90px 52px 82px; gap: 9px; padding-left: 14px; padding-right: 14px; }
          .f1-classification-num { display: none; }
        }
        @media (max-width: 650px) {
          .f1-podium { padding: 16px 10px 0; }
          .f1-podium-grid { gap: 5px; }
          .f1-podium-portrait > img, .f1-podium-portrait > div { width: 72px !important; height: 72px !important; }
          .f1-podium-entry[data-place="1"] .f1-podium-portrait > img,
          .f1-podium-entry[data-place="1"] .f1-podium-portrait > div { width: 82px !important; height: 82px !important; }
          .f1-podium-name { font-size: 13px; }
          .f1-podium-team { font-size: 11px; }
          .f1-podium-metrics { flex-direction: column; gap: 1px; margin: 10px 0 12px; }
          .f1-podium-step { height: calc(var(--step-height) * .72); }
          .f1-podium-number { font-size: 48px; }
          .f1-podium-base { margin: 0 -10px; }
          .f1-classification-head, .f1-classification-row { grid-template-columns: 38px minmax(120px, 1fr) 80px 64px; gap: 8px; padding: 9px 11px; }
          .f1-classification-change, .f1-classification-points, .f1-classification-num { display: none; }
        }
        @media (max-width: 430px) {
          .f1-classification-head, .f1-classification-row { grid-template-columns: 34px minmax(105px, 1fr) 65px; }
          .f1-classification-gap { display: none; }
          .f1-classification-driver { gap: 8px; }
          .f1-classification-driver > img, .f1-classification-driver > div:first-child { width: 34px !important; height: 34px !important; }
          .f1-classification-name { font-size: 12px; }
        }
        @media (hover: none) { .f1-podium-reveal { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .f1-podium-entry, .f1-podium-reveal, .f1-podium-portrait::before,
          .f1-podium-portrait > img, .f1-podium-portrait > div, .f1-podium-step::after,
          .f1-classification-row { transition: none; }
        }
      `}</style>

      <header className="f1-drivers-heading">
        <h1>Race Results</h1>
        <p>Race classification. Open a driver for lap telemetry — speed, RPM, throttle, brake and g-force.</p>
      </header>

      {podium.length > 0 && (
        <section className="f1-podium" aria-label="Race podium">
          <div className="f1-podium-title">The podium</div>
          <div className="f1-podium-grid">
            {podium.map((driver) => {
              const position = driver.position ?? 0;
              const color = teamColor(driver.teamColorRaw);
              const stepHeight = position === 1 ? 170 : position === 2 ? 125 : 100;
              return (
                <DataAppLink
                  key={driver.driverNumber}
                  to={`/drivers/${driver.driverNumber}`}
                  className="f1-podium-entry"
                  data-place={position}
                  aria-label={`${ordinal(position)}: ${driver.fullName}. Open driver telemetry`}
                  style={{ "--team-color": color, "--step-height": `${stepHeight}px` } as CSSProperties}
                >
                  <span className="f1-podium-reveal" aria-hidden="true">
                    <span>{position === 1 ? "✦" : "★"}</span>{PODIUM_LABELS[position]}
                  </span>
                  <span className="f1-podium-portrait">
                    <Headshot url={driver.headshotUrl} color={color} size={position === 1 ? 108 : 88} initials={driver.abbreviation} />
                  </span>
                  <span className="f1-podium-name">{driver.fullName}</span>
                  <span className="f1-podium-team">{driver.teamName ?? "—"} · #{driver.driverNumber}</span>
                  <span className="f1-podium-metrics">
                    <span><b>{raceGap(driver)}</b></span>
                    <span><b>{formatNumber(driver.points)}</b> pts</span>
                  </span>
                  <span className="f1-podium-step">
                    <span className="f1-podium-number">{position}</span>
                    <span className="f1-podium-place">{position === 1 ? "Winner" : ordinal(position)}</span>
                  </span>
                </DataAppLink>
              );
            })}
          </div>
          <div className="f1-podium-base" aria-hidden="true" />
        </section>
      )}

      <div className="f1-field-heading">
        <div>
          <h2>Rest of the field</h2>
          <p>Classification from P4 onward</p>
        </div>
        <div className="f1-field-filters" role="group" aria-label="Filter classification">
          {(["all", "classified", "out"] as const).map((option) => (
            <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>
              {option === "all" ? `All ${field.length}` : option === "classified" ? "Classified" : "Out"}
            </button>
          ))}
        </div>
      </div>

      <section className="f1-classification" aria-label="Remaining driver classification">
        <div className="f1-classification-head" aria-hidden="true">
          <span>Pos</span><span className="f1-classification-change">+/−</span><span>Driver</span>
          <span className="f1-classification-gap">Gap</span><span className="f1-classification-points">Pts</span>
          <span className="f1-classification-num">No.</span><span />
        </div>
        {visibleField.length === 0 ? (
          <div className="f1-classification-empty">No drivers in this group.</div>
        ) : visibleField.map((driver) => {
          const color = teamColor(driver.teamColorRaw);
          const change = placeChange(driver);
          const hasTelemetry = race.telemetryLapByDriver.has(driver.driverNumber);
          return (
            <DataAppLink
              key={driver.driverNumber}
              to={`/drivers/${driver.driverNumber}`}
              className="f1-classification-row"
              aria-label={`${positionLabel(driver)}: ${driver.fullName}. Open driver detail`}
              style={{ "--team-color": color } as CSSProperties}
            >
              <span className="f1-classification-pos">{positionLabel(driver)}</span>
              <span className="f1-classification-change" data-direction={change.direction}>{change.label}</span>
              <span className="f1-classification-driver">
                <Headshot url={driver.headshotUrl} color={color} size={38} initials={driver.abbreviation} />
                <span style={{ minWidth: 0 }}>
                  <span className="f1-classification-name" style={{ display: "block" }}>{driver.fullName}</span>
                  <span className="f1-classification-team">{driver.teamName ?? "—"}</span>
                </span>
              </span>
              <span className="f1-classification-gap" data-out={!isClassified(driver)}>{raceGap(driver)}</span>
              <span className="f1-classification-points">{formatNumber(driver.points)}</span>
              <span className="f1-classification-num">#{driver.driverNumber}</span>
              <span className="f1-classification-action" data-unavailable={!hasTelemetry}>
                {hasTelemetry ? "Telemetry →" : "No lap"}
              </span>
            </DataAppLink>
          );
        })}
      </section>
    </div>
  );
}
