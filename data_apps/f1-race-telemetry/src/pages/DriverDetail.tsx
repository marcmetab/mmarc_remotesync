import { DataAppLink } from "@metabase/embedding-sdk-react/data-app";
import { useMemo, useState, type ReactNode } from "react";

import { HEADSHOTS } from "../assets/headshots.generated";
import { useEngineSound } from "../audio/useEngineSound";
import { OnboardView } from "../components/onboard/OnboardView";
import { Card, EmptyState, Spinner } from "../components/Card";
import {
  CircuitMap,
  GEAR_COLORS,
  MAP_VIEWS,
  SECTOR_COLORS,
  SPEED_GRADIENT,
  type MapView,
} from "../components/CircuitMap";
import { Laurel, RowIcon, type IconName } from "../components/Icons";
import { LapTrace, LapTraceLegend } from "../components/LapTrace";
import { Scrubber } from "../components/Scrubber";
import { SoundControl } from "../components/SoundControl";
import { SteeringWheel } from "../components/SteeringWheel";
import type { TrackCar } from "../components/TrackMap";
import { TyreBadge } from "../components/TyreBadge";
import type { DriverResult, LapRow, RaceData, SessionOption } from "../hooks/useRaceData";
import { useDriverLapTelemetry, useFieldMotion } from "../hooks/useTelemetry";
import {
  compoundStyle,
  flagEmoji,
  formatClock,
  formatDelta,
  formatGap,
  formatLapTime,
  formatNumber,
  formatSector,
  ordinal,
  teamColor,
} from "../lib/format";
import {
  nearestIndex,
  rotate,
  sectorSplitIndices,
  steeringAngles,
} from "../lib/lapGeometry";
import { lapsByNumber, personalBestByDriver } from "../lib/raceState";
import { MONO, T } from "../lib/tokens";

/** Formula-1 timing colours: purple session best, green personal best. */
const TIMING = { session: T.purple, personal: T.green, other: T.amber };

export function DriverDetail({
  sessionId,
  session,
  race,
  driverNumber,
  backTo,
  backLabel,
}: {
  sessionId: number | null;
  session: SessionOption | null;
  race: RaceData;
  driverNumber: number;
  backTo: string;
  backLabel: string;
}) {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mapView, setMapView] = useState<MapView>("circuit");
  const [showField, setShowField] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.7);
  const [view, setView] = useState<"onboard" | "dashboard">("onboard");

  const driver = race.results.find((r) => r.driverNumber === driverNumber) ?? null;
  const telemetryLap = race.telemetryLapByDriver.get(driverNumber) ?? null;
  const telemetry = useDriverLapTelemetry(sessionId, driverNumber, telemetryLap);

  const samples = telemetry.samples;
  const maxIndex = Math.max(samples.length - 1, 0);
  const index = Math.min(sampleIndex, maxIndex);
  const current = samples[index] ?? null;

  const engineSample = useMemo(
    () =>
      current
        ? {
            rpm: current.rpm,
            throttle: current.throttle,
            gear: current.gear,
            brake: current.brake,
          }
        : null,
    [current],
  );

  useEngineSound({
    enabled: soundOn && view === "dashboard",
    volume: soundVolume,
    playing,
    sample: engineSample,
    identity: `${sessionId ?? "none"}:${driverNumber}:${telemetryLap ?? "none"}`,
  });

  const wheelAngles = useMemo(() => steeringAngles(samples), [samples]);
  const wheelAngle = wheelAngles[index] ?? 0;

  const byLap = useMemo(() => lapsByNumber(race.laps), [race.laps]);
  const lapRowFor = (lap: number | null) =>
    lap == null
      ? null
      : (byLap.get(lap) ?? []).find((l) => l.driverNumber === driverNumber) ?? null;
  const lapRow = lapRowFor(telemetryLap);
  const previousLapRow = lapRowFor(telemetryLap != null ? telemetryLap - 1 : null);

  const personalBests = useMemo(() => personalBestByDriver(race.laps), [race.laps]);
  const personalBest = personalBests.get(driverNumber) ?? null;

  /**
   * The page shows one lap, because `lap_telemetry` carries one lap per driver.
   * It is nearly always that driver's fastest, but not universally — Piastri's
   * telemetry lap in the Bahrain race is 0.209s off his best — so compare
   * against the driver's best rather than asserting it.
   *
   * Do not substitute `laps.is_personal_best`: that flag marks a lap that was
   * the driver's best *at the time*, so it is set on many laps (eight of
   * Piastri's in that race) and cannot identify the quickest.
   */
  const isFastestLap =
    lapRow?.lapTimeMs != null &&
    personalBest != null &&
    lapRow.lapTimeMs <= personalBest;
  const offBestMs =
    lapRow?.lapTimeMs != null && personalBest != null
      ? lapRow.lapTimeMs - personalBest
      : null;
  const lapLabel = isFastestLap ? "Fastest lap" : "Telemetry lap";

  const driverLaps = useMemo(
    () =>
      race.laps
        .filter((l) => l.driverNumber === driverNumber)
        .sort((a, b) => a.lapNumber - b.lapNumber),
    [race.laps, driverNumber],
  );
  const totalLaps = useMemo(
    () => race.laps.reduce((max, l) => Math.max(max, l.lapNumber), 0),
    [race.laps],
  );

  const timing = useMemo(() => bestTimes(race.laps, driverNumber), [race.laps, driverNumber]);

  const topSpeed = useMemo(() => {
    const speeds = samples.map((s) => s.speed).filter((v): v is number => v != null);
    return speeds.length > 0 ? Math.max(...speeds) : null;
  }, [samples]);
  const speedRange = useMemo<[number, number] | null>(() => {
    const speeds = samples.map((s) => s.speed).filter((v): v is number => v != null);
    return speeds.length > 0 ? [Math.min(...speeds), Math.max(...speeds)] : null;
  }, [samples]);

  const sectorSplits = useMemo(
    () =>
      sectorSplitIndices(
        samples.map((s) => s.timeInLapMs),
        lapRow?.sector1Ms ?? null,
        lapRow?.sector2Ms ?? null,
      ),
    [samples, lapRow?.sector1Ms, lapRow?.sector2Ms],
  );

  // Corner positions along the lap, for the trace's turn markers.
  const cornerMarks = useMemo(
    () =>
      race.corners
        .map((c) => {
          const i = nearestIndex(samples, { x: c.x, y: c.y });
          const d = i >= 0 ? samples[i].distanceM : null;
          return d == null ? null : { label: `T${c.cornerNumber}${c.letter ?? ""}`, distanceM: d };
        })
        .filter((c): c is { label: string; distanceM: number } => c != null),
    [race.corners, samples],
  );

  const field = useFieldMotion(sessionId, showField && view === "dashboard" ? (current?.sessionTimeMs ?? null) : null);
  const resultsByNumber = useMemo(
    () => new Map(race.results.map((r) => [r.driverNumber, r])),
    [race.results],
  );
  const fieldCars = useMemo<TrackCar[]>(
    () =>
      showField
        ? field.positions
            .filter((p) => p.driverNumber !== driverNumber)
            .map((p) => {
              const r = resultsByNumber.get(p.driverNumber);
              return {
                driverNumber: p.driverNumber,
                abbreviation: r?.abbreviation ?? String(p.driverNumber),
                color: teamColor(r?.teamColorRaw ?? null),
                x: p.x,
                y: p.y,
                onTrack: p.onTrack,
              };
            })
        : [],
    [showField, field.positions, driverNumber, resultsByNumber],
  );

  const color = teamColor(driver?.teamColorRaw ?? null);

  if (race.resultsLoading) {
    return <Spinner label="Loading driver…" />;
  }

  if (!driver) {
    return (
      <EmptyState>
        No driver #{driverNumber} in this session.
        <br />
        <DataAppLink to={backTo} style={{ color: T.accent }}>
          Back to {backLabel}
        </DataAppLink>
      </EmptyState>
    );
  }

  const focusCar: TrackCar | null =
    current && Number.isFinite(current.x) && Number.isFinite(current.y)
      ? {
          driverNumber: driver.driverNumber,
          abbreviation: driver.abbreviation,
          color,
          x: current.x,
          y: current.y,
          onTrack: true,
        }
      : null;

  const isRace = (session?.sessionName ?? "").toLowerCase().includes("race");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{PAGE_CSS}</style>

      <DataAppLink
        to={backTo}
        style={{ color: T.textDim, textDecoration: "none", fontSize: 13, display: "inline-flex", gap: 8 }}
      >
        <span aria-hidden>‹</span> {backLabel}
      </DataAppLink>

      <DriverHero driver={driver} session={session} color={color} samples={samples} rotation={race.circuitRotation} />

      {telemetryLap == null ? (
        <Card title="Lap telemetry">
          <EmptyState>
            No detailed telemetry was loaded for {driver.abbreviation} in this session.
            <br />
            This dataset carries one telemetry lap per driver; {race.telemetryLapByDriver.size} of{" "}
            {race.results.length} drivers have one here.
          </EmptyState>
        </Card>
      ) : (
        <>
          <div className="dd-view-switch">
            <Segmented
              ariaLabel="Lap view"
              value={view}
              onChange={(v) => {
                setPlaying(false);
                setView(v);
              }}
              options={[
                { value: "onboard", label: "Onboard" },
                { value: "dashboard", label: "Dashboard" },
              ]}
            />
            <span>{view === "onboard" ? "Follow the lap on a map that turns with the car" : "Telemetry, map and timing for this lap"}</span>
          </div>

          {view === "onboard" ? (
            telemetry.isLoading ? (
              <Spinner label="Loading telemetry…" />
            ) : (
              <OnboardView
                sessionId={sessionId}
                session={session}
                driver={driver}
                samples={samples}
                lapRow={lapRow}
                lapLabel={lapLabel}
                telemetryLap={telemetryLap}
                totalLaps={totalLaps}
                corners={race.corners}
                rotation={race.circuitRotation}
                sectorSplits={sectorSplits}
                timing={timing}
                results={race.results}
                laps={race.laps}
                initialTimeMs={current?.timeInLapMs ?? 0}
                onTimeCommit={(ms) => {
                  const i = samples.findIndex((sample) => (sample.timeInLapMs ?? 0) >= ms);
                  setSampleIndex(i < 0 ? maxIndex : i);
                }}
                soundOn={soundOn}
                soundVolume={soundVolume}
                onSoundChange={setSoundOn}
              />
            )
          ) : (
          <>
          <Scrubber
            value={index}
            min={0}
            max={maxIndex}
            onChange={setSampleIndex}
            playing={playing}
            onPlayingChange={setPlaying}
            intervalMs={60}
            disabled={samples.length === 0}
            ariaLabel="Position in lap"
            primaryLabel={current?.timeInLapMs != null ? lapClock(current.timeInLapMs) : "—"}
            secondaryLabel={`${lapLabel} ${telemetryLap} · ${formatNumber(current?.distanceM, 0)} m${
              current?.cornerNumber != null ? ` · Turn ${current.cornerNumber}` : ""
            }`}
          />

          <SoundControl
            enabled={soundOn}
            volume={soundVolume}
            onEnabledChange={setSoundOn}
            onVolumeChange={setSoundVolume}
            disabled={samples.length === 0}
          />

          <div className="dd-top">
            <div className="dd-col">
              <Card title="Race Information">
                <InfoRow icon="flag" label="Event" value={session ? `${session.eventName} ${session.year ?? ""}` : "—"} />
                <InfoRow icon="session" label="Session" value={session?.sessionName ?? "—"} />
                {/*
                  `race_time_ms` is the winner's total race time for P1, but the
                  gap to the winner for everyone else — label it accordingly.
                */}
                {driver.position === 1 ? (
                  <InfoRow icon="clock" label="Race Time" value={formatClock(driver.raceTimeMs)} />
                ) : (
                  <InfoRow icon="clock" label="Gap to Winner" value={driver.raceTimeMs != null ? `${formatGap(driver.raceTimeMs)}s` : "—"} />
                )}
                <InfoRow icon="laps" label="Laps Completed" value={`${driverLaps.length} / ${totalLaps}`} />
                <InfoRow icon="trophy" label="Final Position" value={ordinal(driver.position)} />
                <InfoRow icon="points" label="Points Scored" value={formatNumber(driver.points, 0)} />
                <InfoRow
                  icon="status"
                  label="Status"
                  value={driver.status || "—"}
                  color={driver.status === "Finished" ? T.green : T.amber}
                  last
                />
              </Card>

              <Card title="Tyre Information">
                {lapRow ? <TyreInfo lap={lapRow} driverLaps={driverLaps} /> : <EmptyState>No tyre data for this lap.</EmptyState>}
              </Card>
            </div>

            <div className="dd-wheel">
              <section className="dd-wheel-panel" aria-label="Live telemetry">
                <header className="dd-wheel-header">
                  <h2>
                    Live Telemetry
                    <PlayState playing={playing} />
                  </h2>
                  <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: T.text }}>
                    Lap {telemetryLap}
                    <span style={{ color: T.textFaint }}> / {totalLaps}</span>
                  </span>
                </header>
                {telemetry.isLoading ? (
                  <Spinner label="Loading telemetry…" />
                ) : current ? (
                  <>
                    <div className="dd-wheel-canvas">
                      <SteeringWheel
                        angle={wheelAngle}
                        readout={current}
                        lapLabel={lapLabel.toUpperCase()}
                      />
                    </div>
                    <SteeringCaption angle={wheelAngle} turn={current.cornerNumber} />
                  </>
                ) : (
                  <EmptyState>No telemetry samples for this lap.</EmptyState>
                )}
              </section>
            </div>

            <div className="dd-col">
              <Card
                title="Track Map"
                right={<span style={{ fontSize: 12, color: T.textDim }}>{session?.location ?? ""}</span>}
                bodyStyle={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}
              >
                {telemetry.isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <div style={{ background: "#0B0E14", borderRadius: T.radiusSm, border: `1px solid ${T.borderSoft}`, padding: 6 }}>
                      <CircuitMap
                        lap={samples}
                        rotation={race.circuitRotation}
                        corners={race.corners}
                        progressIndex={index}
                        focus={focusCar}
                        field={fieldCars}
                        view={mapView}
                        sectorSplits={sectorSplits}
                        speedRange={speedRange}
                        height={250}
                      />
                    </div>
                    <MapLegend view={mapView} color={color} speedRange={speedRange} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <Segmented value={mapView} onChange={setMapView} options={MAP_VIEWS} />
                      <Toggle label="Show field" checked={showField} onChange={setShowField} />
                    </div>
                  </>
                )}
              </Card>

              <Card title="Sector Times">
                {lapRow ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                    {([lapRow.sector1Ms, lapRow.sector2Ms, lapRow.sector3Ms] as const).map((ms, i) => (
                      <SectorCell
                        key={i}
                        index={i}
                        ms={ms}
                        sessionBest={timing.sessionSectors[i]}
                        personalBest={timing.personalSectors[i]}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState>No sector times for this lap.</EmptyState>
                )}
              </Card>
            </div>
          </div>

          <div className="dd-bottom">
            <div className="dd-trace">
              <Card
                title={`Lap Telemetry — Lap ${telemetryLap}`}
                style={{ height: "100%" }}
                bodyStyle={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <LapTraceLegend />
                {telemetry.isLoading ? (
                  <Spinner label="Loading lap trace…" />
                ) : (
                  <LapTrace
                    samples={samples}
                    index={index}
                    onSeek={(i) => {
                      setPlaying(false);
                      setSampleIndex(i);
                    }}
                    corners={cornerMarks}
                  />
                )}
              </Card>
            </div>

            <Card title="Lap Details" style={{ height: "100%" }}>
              <InfoRow label={lapLabel} value={`${telemetryLap} / ${totalLaps}`} />
              <InfoRow
                label="Lap Time"
                value={formatLapTime(lapRow?.lapTimeMs)}
                extra={<LapTimeDelta lapMs={lapRow?.lapTimeMs ?? null} fastestMs={timing.sessionFastest} />}
              />
              <InfoRow label="Best Lap" value={formatLapTime(personalBest)} color={T.purple} />
              {!isFastestLap && offBestMs != null && (
                <InfoRow
                  label="Off this driver's best"
                  value={`${formatDelta(offBestMs)}s`}
                  color={T.amber}
                />
              )}
              <InfoRow label="Last Lap" value={formatLapTime(previousLapRow?.lapTimeMs)} />
              <InfoRow label="Top Speed" value={topSpeed != null ? `${formatNumber(topSpeed, 0)} km/h` : "—"} />
              <InfoRow
                label="Speed Trap"
                value={lapRow?.speedSt != null ? `${formatNumber(lapRow.speedSt, 0)} km/h` : "—"}
              />
              <InfoRow
                label="DRS State"
                value={drsLabel(current?.drs ?? null)}
                color={current?.drs != null && current.drs >= 10 ? T.green : current?.drs === 8 ? T.amber : T.textDim}
                last
              />
            </Card>

            <Card title="Position & Gaps" style={{ height: "100%" }}>
              <PositionGaps
                driver={driver}
                driverNumber={driverNumber}
                lapNumber={telemetryLap}
                byLap={byLap}
                showGained={isRace}
              />
            </Card>
          </div>
          </>
          )}
        </>
      )}
    </div>
  );
}

const PAGE_CSS = `
  .dd-view-switch { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .dd-view-switch > span { font-size: 13px; color: ${T.textDim}; }
  .dd-top {
    display: grid;
    gap: 16px;
    grid-template-columns: minmax(250px, 0.92fr) minmax(380px, 1.45fr) minmax(300px, 1.1fr);
    align-items: start;
  }
  .dd-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  .dd-wheel { min-width: 0; }
  .dd-wheel-panel { min-width: 0; }
  .dd-wheel-header {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 0 4px 8px; border-bottom: 1px solid ${T.borderSoft};
  }
  .dd-wheel-header h2 { display: inline-flex; align-items: center; gap: 10px; margin: 0; font-size: 16px; }
  .dd-wheel-canvas {
    min-width: 0;
    background: radial-gradient(ellipse 56% 43% at 50% 50%, rgba(84, 94, 110, 0.10), transparent);
  }
  .dd-bottom {
    display: grid;
    gap: 16px;
    grid-template-columns: minmax(0, 1.9fr) minmax(240px, 0.78fr) minmax(240px, 0.78fr);
    align-items: stretch;
  }
  .dd-trace { min-width: 0; }
  .dd-hero-stats {
    display: grid;
    grid-template-columns: minmax(96px, 0.85fr) minmax(118px, 1fr) minmax(90px, 0.8fr) minmax(128px, 1.15fr);
    gap: 10px;
    margin-top: 16px;
  }
  @media (max-width: 1280px) {
    .dd-top { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .dd-top > .dd-wheel { grid-column: 1 / -1; order: -1; }
    .dd-top > .dd-wheel > section { max-width: 760px; margin: 0 auto; width: 100%; }
    .dd-bottom { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .dd-bottom > .dd-trace { grid-column: 1 / -1; }
  }
  @media (max-width: 760px) {
    .dd-top, .dd-bottom { grid-template-columns: minmax(0, 1fr); }
    .dd-hero-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 480px) {
    .dd-driver-name { font-size: 34px !important; }
    .dd-hero-stats { margin-top: 6px; }
  }
`;

/** `0` → `"0.000"`, which `formatLapTime` would otherwise render as a dash. */
function lapClock(ms: number): string {
  return ms <= 0 ? "0.000" : formatLapTime(ms);
}

function drsLabel(drs: number | null): string {
  if (drs == null) return "—";
  if (drs >= 10) return "Open";
  if (drs === 8) return "Eligible";
  return "Closed";
}

/** Session-best and personal-best lap and sector times, for timing colours. */
function bestTimes(laps: readonly LapRow[], driverNumber: number) {
  const min = (values: (number | null)[]) => {
    const valid = values.filter((v): v is number => v != null && v > 0);
    return valid.length > 0 ? Math.min(...valid) : null;
  };
  const own = laps.filter((l) => l.driverNumber === driverNumber);
  const sectors = (rows: readonly LapRow[]) => [
    min(rows.map((l) => l.sector1Ms)),
    min(rows.map((l) => l.sector2Ms)),
    min(rows.map((l) => l.sector3Ms)),
  ];
  return {
    sessionFastest: min(laps.map((l) => l.lapTimeMs)),
    sessionSectors: sectors(laps),
    personalSectors: sectors(own),
  };
}

/* ------------------------------------------------------------------ hero */

function DriverHero({
  driver,
  session,
  color,
  samples,
  rotation,
}: {
  driver: DriverResult;
  session: SessionOption | null;
  color: string;
  samples: readonly { x: number; y: number }[];
  rotation: number;
}) {
  const flag = flagEmoji(driver.countryCode);
  const podium = driver.position != null && driver.position <= 3;

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: T.radius,
        border: `1px solid ${T.border}`,
        background: `radial-gradient(120% 140% at 0% 100%, ${color}18 0%, transparent 45%), linear-gradient(100deg, ${T.cardBg} 0%, ${T.cardBg} 42%, ${T.cardBgRaised} 100%)`,
        borderTop: `3px solid ${color}`,
        minHeight: 168,
      }}
    >
      <CircuitGlow samples={samples} rotation={rotation} />

      {session && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 20,
            textAlign: "right",
            fontSize: 11,
            lineHeight: 1.5,
            letterSpacing: 2.4,
            color: T.text,
            fontWeight: 600,
            textTransform: "uppercase",
            borderRight: `2px solid ${T.accent}`,
            paddingRight: 10,
          }}
        >
          <div>{session.eventName}</div>
          <div style={{ color: T.textFaint }}>
            {session.location}
            {session.year != null ? ` · ${session.year}` : ""}
          </div>
        </div>
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          gap: 22,
          flexWrap: "wrap",
          padding: "20px 22px 18px",
        }}
      >
        <Portrait driver={driver} color={color} />

        <div style={{ minWidth: 0, paddingBottom: 8, flex: "1 1 260px" }}>
          <h1 className="dd-driver-name" style={{ margin: "0 0 8px", fontSize: 40, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
            {driver.fullName}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.textDim, fontSize: 17 }}>
            {flag && (
              <span aria-label={driver.countryCode ?? undefined} style={{ fontSize: 20, lineHeight: 1 }}>
                {flag}
              </span>
            )}
            <span>{driver.teamName ?? "—"}</span>
            <span aria-hidden style={{ width: 22, height: 4, borderRadius: 2, background: color }} />
          </div>
        </div>

        <div className="dd-hero-stats" style={{ flex: "0 1 560px" }}>
          <HeroStat
            label="Position"
            value={driver.position != null ? `P${Math.round(driver.position)}` : "—"}
            color={T.accent}
            icon={podium ? <Laurel color={T.accent} /> : undefined}
          />
          <HeroStat label="Grid Position" value={formatNumber(driver.gridPosition, 0)} />
          <HeroStat label="Points" value={formatNumber(driver.points, 0)} />
          <HeroStat
            label="Status"
            value={driver.status || "—"}
            color={driver.status === "Finished" ? T.green : T.amber}
          />
        </div>
      </div>
    </section>
  );
}

/** The circuit, faint and glowing, behind the hero — drawn from the same lap. */
function CircuitGlow({ samples, rotation }: { samples: readonly { x: number; y: number }[]; rotation: number }) {
  const path = useMemo(() => {
    const pts = samples.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)).map((p) => rotate(p, rotation));
    if (pts.length < 3) return null;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxY = Math.max(...ys);
    const w = Math.max(...xs) - minX;
    const h = maxY - Math.min(...ys);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${(p.x - minX).toFixed(0)},${(maxY - p.y).toFixed(0)}`).join(" ");
    return { d: `${d} Z`, w, h };
  }, [samples, rotation]);

  if (!path) return null;
  const stroke = Math.max(path.w, path.h) * 0.012;
  return (
    <svg
      aria-hidden
      viewBox={`${-stroke * 4} ${-stroke * 4} ${path.w + stroke * 8} ${path.h + stroke * 8}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", right: "4%", top: "-8%", height: "116%", width: "44%", opacity: 0.38 }}
    >
      <path d={path.d} fill="none" stroke={T.accent} strokeWidth={stroke * 4} opacity={0.09} strokeLinejoin="round" />
      <path d={path.d} fill="none" stroke={T.accent} strokeWidth={stroke * 1.6} opacity={0.28} strokeLinejoin="round" />
      <path d={path.d} fill="none" stroke={T.accent} strokeWidth={stroke * 0.5} opacity={0.55} strokeLinejoin="round" />
    </svg>
  );
}

function Portrait({ driver, color }: { driver: DriverResult; color: string }) {
  const [failed, setFailed] = useState(false);
  // The embed CSP allows `data:` but not the remote host, so the inlined
  // copy is what renders in production; the URL is a fallback.
  const headshotSrc = driver.headshotUrl
    ? (HEADSHOTS[driver.headshotUrl] ?? driver.headshotUrl)
    : null;
  return (
    <div style={{ position: "relative", width: 150, height: 128, flexShrink: 0 }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 14,
          bottom: 0,
          width: 118,
          height: 112,
          transform: "skewX(-12deg)",
          borderRadius: 8,
          background: `linear-gradient(160deg, ${color} 0%, ${color}66 55%, #0E121A 100%)`,
          boxShadow: `0 0 0 1px ${color}55`,
        }}
      />
      {headshotSrc && !failed ? (
        <img
          src={headshotSrc}
          alt=""
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            left: 12,
            bottom: 0,
            width: 128,
            height: 128,
            objectFit: "cover",
            objectPosition: "top",
            filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.45))",
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 26,
            bottom: 10,
            width: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 800,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {driver.abbreviation}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 8,
          padding: "2px 8px",
          fontSize: 24,
          fontWeight: 900,
          fontStyle: "italic",
          color: "#FFFFFF",
          background: "#0A0C10",
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          letterSpacing: -0.5,
        }}
      >
        #{driver.driverNumber}
      </div>
    </div>
  );
}

function HeroStat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        background: T.cardBgRaised,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm,
        padding: "10px 14px",
        minWidth: 0,
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{ fontSize: 12, color: T.textDim, marginBottom: 4, whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: color ?? T.text,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </span>
        {icon}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- telemetry */

function PlayState({ playing }: { playing: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: playing ? T.green : T.textFaint,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: playing ? T.green : T.textFaint,
          boxShadow: playing ? `0 0 8px ${T.green}` : undefined,
        }}
      />
      {playing ? "Playing" : "Paused"}
    </span>
  );
}

/** The dataset has no steering sensor, so say where the angle comes from. */
function SteeringCaption({ angle, turn }: { angle: number; turn: number | null }) {
  const rounded = Math.round(Math.abs(angle));
  const direction = rounded < 2 ? "straight" : angle > 0 ? "right" : "left";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        fontSize: 12,
        lineHeight: 1.4,
        color: T.textDim,
        borderTop: `1px solid ${T.borderSoft}`,
        paddingTop: 10,
      }}
    >
      <span>
        Steering{" "}
        <span style={{ fontFamily: MONO, color: T.text, fontWeight: 700 }}>
          {direction === "straight" ? "0°" : `${rounded}° ${direction}`}
        </span>
        {turn != null && <span style={{ color: T.textFaint }}> · Turn {turn}</span>}
      </span>
      <span style={{ color: T.textFaint }}>estimated from the racing line's curvature</span>
    </div>
  );
}

/* ----------------------------------------------------------------- map */

function Segmented<V extends string>({
  value,
  onChange,
  options,
  ariaLabel = "Track view",
}: {
  value: V;
  onChange: (v: V) => void;
  options: readonly { value: V; label: string }[];
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        padding: 3,
        gap: 2,
        background: T.cardBgRaised,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            style={{
              border: "none",
              borderRadius: 6,
              padding: "5px 10px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              color: active ? T.text : T.textDim,
              background: active ? T.cardBg : "transparent",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        padding: 0,
        color: T.textDim,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
      <span
        aria-hidden
        style={{
          width: 34,
          height: 19,
          borderRadius: 999,
          background: checked ? T.accent : T.border,
          position: "relative",
          transition: "background 150ms",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 17 : 2,
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: "#FFFFFF",
            transition: "left 150ms",
          }}
        />
      </span>
    </button>
  );
}

function MapLegend({
  view,
  color,
  speedRange,
}: {
  view: MapView;
  color: string;
  speedRange: [number, number] | null;
}) {
  const chip = (swatch: ReactNode, label: string) => (
    <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {swatch}
      {label}
    </span>
  );
  const bar = (c: string, dashed?: boolean) => (
    <span
      aria-hidden
      style={{
        width: 16,
        height: 4,
        borderRadius: 2,
        background: dashed ? `repeating-linear-gradient(90deg, ${c} 0 4px, transparent 4px 6px)` : c,
      }}
    />
  );

  let content: ReactNode;
  if (view === "speed") {
    content = (
      <>
        <span style={{ fontFamily: MONO }}>{formatNumber(speedRange?.[0], 0)}</span>
        <span aria-hidden style={{ flex: 1, height: 6, borderRadius: 3, background: SPEED_GRADIENT, maxWidth: 180 }} />
        <span style={{ fontFamily: MONO }}>{formatNumber(speedRange?.[1], 0)} km/h</span>
      </>
    );
  } else if (view === "gear") {
    content = GEAR_COLORS.slice(1).map((c, i) => chip(bar(c), String(i + 1)));
  } else if (view === "sectors") {
    content = SECTOR_COLORS.map((c, i) => chip(bar(c), `Sector ${i + 1}`));
  } else {
    content = [
      chip(bar(color), "Lap so far"),
      chip(bar(T.green, true), "DRS open"),
      chip(bar("repeating-linear-gradient(90deg, #E10600 0 4px, #F1F5F9 4px 8px)"), "Kerbs"),
    ];
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 11.5, color: T.textDim }}>
      {content}
    </div>
  );
}

/* --------------------------------------------------------------- cards */

function TyreInfo({ lap, driverLaps }: { lap: LapRow; driverLaps: readonly LapRow[] }) {
  const compound = compoundStyle(lap.compound);
  // How far into this set of tyres the lap sits: its age against the oldest
  // the set got in this stint.
  const stintAge = driverLaps
    .filter((l) => l.stint === lap.stint)
    .reduce((max, l) => Math.max(max, l.tyreLife ?? 0), 0);
  const ratio = lap.tyreLife != null && stintAge > 0 ? Math.min(lap.tyreLife / stintAge, 1) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <TyreBadge compound={lap.compound} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{compound.label}</div>
          <div style={{ fontSize: 12, color: T.textDim }}>
            {lap.freshTyre ? "Fresh set" : "Used set"}
            {lap.stint != null ? ` · Stint ${lap.stint}` : ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: T.textDim }}>Tyre age</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: MONO }}>
            {formatNumber(lap.tyreLife, 0)}
            <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}> laps</span>
          </div>
        </div>
      </div>
      <div>
        <div style={{ height: 6, borderRadius: 999, background: T.borderSoft, overflow: "hidden" }}>
          <div style={{ width: `${ratio * 100}%`, height: "100%", background: compound.color, borderRadius: 999 }} />
        </div>
        <div style={{ fontSize: 11, color: T.textFaint, marginTop: 6 }}>
          {lap.tyreLife != null && stintAge > 0
            ? `Lap ${formatNumber(lap.tyreLife, 0)} of ${formatNumber(stintAge, 0)} on this set · no tyre pressure in this dataset`
            : "No tyre pressure in this dataset"}
        </div>
      </div>
    </div>
  );
}

function SectorCell({
  index,
  ms,
  sessionBest,
  personalBest,
}: {
  index: number;
  ms: number | null;
  sessionBest: number | null;
  personalBest: number | null;
}) {
  const isSessionBest = ms != null && sessionBest != null && ms <= sessionBest;
  const isPersonalBest = ms != null && personalBest != null && ms <= personalBest;
  const color = ms == null ? T.textFaint : isSessionBest ? TIMING.session : isPersonalBest ? TIMING.personal : TIMING.other;
  const delta = ms != null && sessionBest != null ? ms - sessionBest : null;

  return (
    <div
      style={{
        background: T.cardBgRaised,
        border: `1px solid ${T.border}`,
        borderTop: `2px solid ${SECTOR_COLORS[index]}`,
        borderRadius: T.radiusSm,
        padding: "10px 10px 9px",
        textAlign: "center",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, color: T.textDim, marginBottom: 4 }}>Sector {index + 1}</div>
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: MONO, color }}>{formatSector(ms)}</div>
      <div
        style={{
          fontSize: 10.5,
          marginTop: 3,
          fontFamily: MONO,
          whiteSpace: "nowrap",
          color: isSessionBest ? TIMING.session : T.textDim,
        }}
      >
        {delta == null ? "—" : isSessionBest ? "best" : formatDelta(delta)}
      </div>
    </div>
  );
}

function LapTimeDelta({ lapMs, fastestMs }: { lapMs: number | null; fastestMs: number | null }) {
  if (lapMs == null || fastestMs == null) return null;
  const delta = lapMs - fastestMs;
  return (
    <span style={{ fontFamily: MONO, fontSize: 11, color: delta <= 0 ? T.purple : T.textDim, whiteSpace: "nowrap" }}>
      {delta <= 0 ? "fastest" : formatDelta(delta)}
    </span>
  );
}

function PositionGaps({
  driver,
  driverNumber,
  lapNumber,
  byLap,
  showGained,
}: {
  driver: DriverResult;
  driverNumber: number;
  lapNumber: number;
  byLap: Map<number, LapRow[]>;
  showGained: boolean;
}) {
  const rows = byLap.get(lapNumber) ?? [];
  const self = rows.find((r) => r.driverNumber === driverNumber) ?? null;
  const previous = (byLap.get(lapNumber - 1) ?? []).find((r) => r.driverNumber === driverNumber) ?? null;

  if (!self || self.position == null) {
    return <EmptyState>No classification on this lap.</EmptyState>;
  }

  const pos = self.position;
  const at = (p: number) => rows.find((r) => r.position === p) ?? null;
  const gapTo = (other: LapRow | null) =>
    other?.lapEndMs != null && self.lapEndMs != null
      ? formatGap(Math.abs(self.lapEndMs - other.lapEndMs))
      : "—";

  const ahead = at(pos - 1);
  const behind = at(pos + 1);
  const leader = at(1);
  const gained =
    driver.gridPosition != null && driver.position != null
      ? Math.round(driver.gridPosition - driver.position)
      : null;

  return (
    <div>
      <InfoRow label={`Position (lap ${lapNumber})`} value={ordinal(pos)} />
      <InfoRow
        label={ahead ? `Gap to P${pos - 1} · ${ahead.driver}` : "Gap ahead"}
        value={ahead ? gapTo(ahead) : "—"}
      />
      <InfoRow
        label={behind ? `Gap to P${pos + 1} · ${behind.driver}` : "Gap behind"}
        value={behind ? gapTo(behind) : "—"}
      />
      <InfoRow label="Gap to Leader" value={pos === 1 ? "Leader" : gapTo(leader)} />
      <InfoRow label="Last Lap Position" value={ordinal(previous?.position ?? null)} />
      {showGained && (
        <InfoRow
          label="Positions Gained"
          value={gained == null ? "—" : gained > 0 ? `+${gained}` : String(gained)}
          color={gained == null || gained === 0 ? T.text : gained > 0 ? T.green : T.accent}
          last
        />
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  color,
  extra,
  last,
}: {
  icon?: IconName;
  label: string;
  value: string;
  color?: string;
  extra?: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        borderBottom: last ? "none" : `1px solid ${T.borderSoft}`,
        fontSize: 13,
      }}
    >
      {icon && <RowIcon name={icon} color={T.textDim} />}
      <span style={{ color: T.textDim, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
      {extra}
      <span style={{ color: color ?? T.text, fontWeight: 600, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
