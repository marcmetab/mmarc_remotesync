import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyState, Spinner } from "../components/Card";
import {
  RaceHud,
  rgba,
  type HudCameraMode,
  type HudCarInfo,
  type HudDash,
  type HudFocus,
  type HudLapCell,
  type HudOrderRow,
  type HudStatus,
  type HudWeather,
} from "../components/RaceHud";
import type { LapRow, RaceData, SessionOption } from "../hooks/useRaceData";
import { carSampleAt, useDriverLapTelemetry, useFollowedCarTelemetry, type LapWindow } from "../hooks/useTelemetry";
import { compoundStyle, formatClock, formatLapTime, teamColor, trackStatusLabel, windCompass } from "../lib/format";
import { buildHudTrack } from "../lib/hudGeometry";
import { fastestLapBefore, lapAt, lapConditionColors, lapTimesAt, lapsByDriver, sectorCells } from "../lib/hudState";
import { sectorSplitIndices } from "../lib/lapGeometry";
import { buildRaceMotionIndex, referenceProgress } from "../lib/raceMotion";
import {
  lapsByNumber,
  leaderLapEnd,
  maxLapNumber,
  resultsByDriver,
  standingsAtLap,
  trackStatusAt,
  weatherAt,
  type Standing,
} from "../lib/raceState";

/** A seek lands just after the leader starts the chosen lap. */
const SEEK_LEAD_MS = 500;

export function RaceReplay({
  sessionId,
  session,
  race,
}: {
  sessionId: number | null;
  session: SessionOption | null;
  race: RaceData;
}) {
  const [lap, setLap] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [camera, setCamera] = useState<HudCameraMode>("overview");
  const [showAll, setShowAll] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [playheadMs, setPlayheadMs] = useState<number | null>(null);
  const playheadRef = useRef<number | null>(null);
  const lapRef = useRef(1);

  useEffect(() => {
    setLap(1);
    lapRef.current = 1;
    setPlaying(false);
    setSelectedNumber(null);
    playheadRef.current = null;
    setPlayheadMs(null);
  }, [sessionId]);

  const byLap = useMemo(() => lapsByNumber(race.laps), [race.laps]);
  const byDriverLaps = useMemo(() => lapsByDriver(race.laps), [race.laps]);
  const lastLap = useMemo(() => maxLapNumber(race.laps), [race.laps]);
  const currentLap = Math.min(Math.max(lap, 1), Math.max(lastLap, 1));
  const leaderEnds = useMemo(() => {
    const ends: { lap: number; time: number }[] = [];
    for (let n = 1; n <= lastLap; n++) {
      const time = leaderLapEnd(byLap, n);
      if (time != null) ends.push({ lap: n, time });
    }
    return ends;
  }, [byLap, lastLap]);
  const raceEndMs = leaderEnds[leaderEnds.length - 1]?.time ?? null;
  const raceStartMs = useMemo(() => {
    const starts = (byLap.get(1) ?? [])
      .map((l) => l.lapStartMs)
      .filter((v): v is number => v != null);
    return starts.length > 0 ? Math.min(...starts) : null;
  }, [byLap]);

  // Cars without a position on this lap have stopped; they leave the order.
  const standings = useMemo(() => standingsAtLap(byLap, currentLap).filter((row) => row.position != null), [byLap, currentLap]);
  const byDriver = useMemo(() => resultsByDriver(race.results), [race.results]);
  const leaderTimeMs = leaderLapEnd(byLap, currentLap);
  const activeTimeMs = playheadMs ?? leaderTimeMs;

  // The leader's lap in progress: the lap strip, lap counter and seeks all
  // speak in these terms, while the tower shows the order at the last line.
  const completed = useMemo(() => {
    let done: { lap: number; time: number } | null = null;
    for (const end of leaderEnds) {
      if (activeTimeMs == null || end.time > activeTimeMs) break;
      done = end;
    }
    return done;
  }, [leaderEnds, activeTimeMs]);
  const completedLaps = completed?.lap ?? 0;
  const lapInProgress = Math.max(1, Math.min(lastLap, completedLaps + 1));
  const lapProgress = useMemo(() => {
    if (activeTimeMs == null) return 0;
    if (completedLaps >= lastLap) return 1;
    const from = completed?.time ?? raceStartMs;
    const to = leaderEnds.find((e) => e.lap === completedLaps + 1)?.time;
    return from != null && to != null && to > from ? (activeTimeMs - from) / (to - from) : 0;
  }, [activeTimeMs, completed, completedLaps, lastLap, leaderEnds, raceStartMs]);

  // A single reference lap draws the circuit for the whole session. Changing
  // leaders must not refetch the outline or blank the map during playback.
  const outlineRef = useMemo(() => {
    const entry = [...race.telemetryLapByDriver.entries()].sort(([a], [b]) => a - b)[0];
    return entry == null ? null : { driverNumber: entry[0], lapNumber: entry[1] };
  }, [race.telemetryLapByDriver]);
  const outline = useDriverLapTelemetry(sessionId, outlineRef?.driverNumber ?? null, outlineRef?.lapNumber ?? null);
  const referenceSamples = useMemo(() => outline.samples.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)), [outline.samples]);
  const referenceFractions = useMemo(() => referenceProgress(referenceSamples), [referenceSamples]);
  const referenceRow = useMemo(
    () => race.laps.find((row) => row.driverNumber === outlineRef?.driverNumber && row.lapNumber === outlineRef?.lapNumber),
    [race.laps, outlineRef],
  );
  const sectorSplits = useMemo(
    () => sectorSplitIndices(referenceSamples.map((point) => point.timeInLapMs), referenceRow?.sector1Ms ?? null, referenceRow?.sector2Ms ?? null),
    [referenceSamples, referenceRow?.sector1Ms, referenceRow?.sector2Ms],
  );
  const track = useMemo(
    () => buildHudTrack({ samples: referenceSamples, fractions: referenceFractions, rotation: race.circuitRotation, corners: race.corners, sectorSplits }),
    [referenceSamples, referenceFractions, race.circuitRotation, race.corners, sectorSplits],
  );
  const motionIndex = useMemo(() => buildRaceMotionIndex(race.laps), [race.laps]);

  useEffect(() => {
    if (!playing || raceEndMs == null) return;
    let lastTick = performance.now();
    let lastPublished = lastTick;
    let frame: number;
    const tick = (now: number) => {
      const elapsed = Math.min(100, Math.max(0, now - lastTick));
      lastTick = now;
      const current = playheadRef.current ?? leaderEnds[0]?.time ?? 0;
      const next = Math.min(raceEndMs, current + elapsed * speed);
      playheadRef.current = next;
      if (now - lastPublished >= 100 || next >= raceEndMs) {
        setPlayheadMs(next);
        lastPublished = now;
      }
      let reachedLap = 1;
      for (const end of leaderEnds) {
        if (end.time > next) break;
        reachedLap = end.lap;
      }
      if (reachedLap !== lapRef.current) {
        lapRef.current = reachedLap;
        setLap(reachedLap);
      }
      if (next >= raceEndMs) setPlaying(false);
      else frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing, speed, leaderEnds, raceEndMs]);

  const moveTo = (time: number | null, reached: number) => {
    const lapNumber = Math.max(1, reached);
    setLap(lapNumber);
    lapRef.current = lapNumber;
    playheadRef.current = time;
    setPlayheadMs(time);
  };
  /** Jump to the start of `lapNumber` (the leader's lap in progress). */
  const seekLap = (lapNumber: number) => {
    const target = Math.max(1, Math.min(lastLap, lapNumber));
    const start = target <= 1 ? raceStartMs : leaderLapEnd(byLap, target - 1);
    if (start == null) return;
    moveTo(start + SEEK_LEAD_MS, target - 1);
  };
  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      setPlayheadMs(playheadRef.current);
      return;
    }
    if (raceEndMs != null && (activeTimeMs ?? 0) >= raceEndMs) {
      moveTo(leaderLapEnd(byLap, 1), 1);
    } else if (playheadRef.current == null) {
      playheadRef.current = activeTimeMs;
    }
    setPlaying(true);
  };

  const leaderNumber = standings[0]?.driverNumber ?? null;
  const followedNumber = selectedNumber != null && standings.some((row) => row.driverNumber === selectedNumber) ? selectedNumber : leaderNumber;
  const lapRowsNow = useMemo(() => new Map((byLap.get(currentLap) ?? []).map((row) => [row.driverNumber, row])), [byLap, currentLap]);
  const fastest = useMemo(() => fastestLapBefore(race.laps, activeTimeMs), [race.laps, activeTimeMs]);

  const intervals = useMemo(() => intervalLabels(standings), [standings]);
  const order = useMemo<HudOrderRow[]>(() => standings.map((row) => {
    const result = byDriver.get(row.driverNumber);
    const inPit = lapRowsNow.get(row.driverNumber)?.pitInMs != null;
    return {
      driverNumber: row.driverNumber,
      position: row.position,
      abbr: result?.abbreviation ?? row.driver,
      color: teamColor(result?.teamColorRaw),
      tyreColor: compoundStyle(row.compound).color,
      gap: row.position === 1 ? "LEADER" : inPit ? "PIT" : intervals.get(row.driverNumber)?.short ?? "—",
      inPit,
    };
  }), [standings, byDriver, lapRowsNow, intervals]);

  const cars = useMemo(() => {
    const map = new Map<number, HudCarInfo>();
    const battles = standings
      .map((row, i) => ({ row, prev: standings[i - 1], interval: intervals.get(row.driverNumber)?.ms ?? null }))
      .filter(({ row, prev, interval }) => prev != null && interval != null && interval < 1000 && lapRowsNow.get(row.driverNumber)?.pitInMs == null && lapRowsNow.get(prev.driverNumber)?.pitInMs == null)
      .sort((a, b) => a.interval! - b.interval!)
      .slice(0, 3);
    const battleByDriver = new Map(battles.map((b) => [b.row.driverNumber, b.interval!]));
    const positionByDriver = new Map(standings.map((row) => [row.driverNumber, row]));
    for (const result of race.results) {
      const standing = positionByDriver.get(result.driverNumber);
      const battle = battleByDriver.get(result.driverNumber);
      const isFastest = fastest?.driverNumber === result.driverNumber;
      const top3 = standing?.position != null && standing.position <= 3;
      let tag: HudCarInfo["tag"] = null;
      if (battle != null) tag = { note: `+${(battle / 1000).toFixed(1)}`, noteColor: "#C9CFDB" };
      else if (isFastest) tag = { note: "FL", noteColor: "#C084FC" };
      else if (top3) tag = { note: standing.position === 1 || standing.gapMs == null ? "" : `+${(standing.gapMs / 1000).toFixed(1)}`, noteColor: "#C9CFDB" };
      map.set(result.driverNumber, {
        driverNumber: result.driverNumber,
        abbr: result.abbreviation,
        color: teamColor(result.teamColorRaw),
        position: standing?.position ?? null,
        tag,
      });
    }
    return map;
  }, [race.results, standings, intervals, lapRowsNow, fastest?.driverNumber]);

  const followedLaps = useMemo(() => (followedNumber == null ? [] : byDriverLaps.get(followedNumber) ?? []), [byDriverLaps, followedNumber]);
  const focus = useMemo<HudFocus | null>(() => {
    if (followedNumber == null) return null;
    const result = byDriver.get(followedNumber);
    const standing = standings.find((row) => row.driverNumber === followedNumber);
    const times = lapTimesAt(followedLaps, activeTimeMs);
    const interval = intervals.get(followedNumber);
    return {
      driverNumber: followedNumber,
      abbr: result?.abbreviation ?? String(followedNumber),
      position: standing?.position ?? null,
      name: result?.fullName ?? standing?.driver ?? String(followedNumber),
      team: result?.teamName ?? standing?.team ?? "—",
      color: teamColor(result?.teamColorRaw),
      gap: standing?.position === 1 ? "LEADING" : interval ? `${interval.long} INT` : "—",
      last: times.last,
      best: times.bestText,
      bestIsFastest: times.best != null && fastest != null && times.best.driverNumber === fastest.driverNumber && times.best.lapNumber === fastest.lapNumber,
      sectors: sectorCells(race.laps, followedLaps, followedNumber, activeTimeMs),
    };
  }, [followedNumber, byDriver, standings, followedLaps, activeTimeMs, intervals, fastest, race.laps]);

  const followedLap = useMemo(() => lapAt(followedLaps, activeTimeMs), [followedLaps, activeTimeMs]);
  // Keyed on the lap row, so a new window is only requested when the lap changes.
  const lapWindow = useMemo(() => lapWindowOf(followedLap.row), [followedLap.row]);
  const nextWindow = useMemo(() => lapWindowOf(followedLap.next), [followedLap.next]);
  const followedTelemetry = useFollowedCarTelemetry(sessionId, followedNumber, lapWindow, nextWindow);
  const dash = useMemo<HudDash | null>(() => {
    const sample = carSampleAt(followedTelemetry.samples, activeTimeMs);
    if (!sample) return null;
    const drs = sample.drs ?? 0;
    return {
      speed: sample.speed,
      gear: sample.gear,
      rpm: sample.rpm,
      throttle: sample.throttle,
      brake: (sample.brake ?? 0) >= 1,
      drs: drs >= 10 ? "OPEN" : drs >= 8 ? "CLOSED" : "OFF",
    };
  }, [followedTelemetry.samples, activeTimeMs]);

  const weather = useMemo<HudWeather | null>(() => {
    const row = weatherAt(race.weather, activeTimeMs);
    if (!row) return null;
    return {
      air: row.airTemp,
      track: row.trackTemp,
      humidity: row.humidity,
      wind: row.windSpeed,
      windDirection: row.windDirection,
      compass: windCompass(row.windDirection),
      rain: row.rainfall,
    };
  }, [race.weather, activeTimeMs]);

  const status = useMemo<HudStatus | null>(() => {
    const row = trackStatusAt(race.trackStatus, activeTimeMs);
    if (!row?.status) return null;
    const label = trackStatusLabel(row.status);
    if (label.label === "Unknown") return null;
    return { ...label, green: row.status === "1" };
  }, [race.trackStatus, activeTimeMs]);

  const conditions = useMemo(() => lapConditionColors(byLap, lastLap, leaderEnds, race.weather), [byLap, lastLap, leaderEnds, race.weather]);
  const laps = useMemo<HudLapCell[]>(() => conditions.map((base, i) => {
    const lapNumber = i + 1;
    const state = lapNumber === lapInProgress ? "current" : lapNumber < lapInProgress ? "played" : "future";
    const color = state === "current" ? "#FFFFFF" : state === "played" ? base ?? "#E10600" : base ? rgba(base, 0.35) : "#1E2430";
    return { lap: lapNumber, state, color };
  }), [conditions, lapInProgress]);

  const elapsedMs = activeTimeMs != null && raceStartMs != null ? activeTimeMs - raceStartMs : null;

  if (race.isLoading && race.laps.length === 0) {
    return <Spinner label="Loading race…" />;
  }

  if (!race.isLoading && race.laps.length === 0) {
    return (
      <EmptyState>
        No lap data for this session.
        <br />
        Pick another session above.
      </EmptyState>
    );
  }

  return (
    <div>
      <h1 className="hud-sr-only">
        Formula One Race Replay: {session ? `${session.eventName} ${session.year ?? ""} · ${session.sessionName}` : ""}
      </h1>
      <RaceHud
        track={track}
        trackLoading={outline.isLoading}
        motionIndex={motionIndex}
        timeRef={playheadRef}
        timeMs={activeTimeMs}
        playing={playing}
        camera={camera}
        onCamera={setCamera}
        followedNumber={followedNumber}
        onFollow={setSelectedNumber}
        cars={cars}
        order={order}
        showAll={showAll}
        onShowAll={setShowAll}
        lapInProgress={lapInProgress}
        lastLap={lastLap}
        lapProgress={lapProgress}
        status={status}
        focus={focus}
        fastest={fastest ? { abbr: byDriver.get(fastest.driverNumber)?.abbreviation ?? fastest.driver, time: formatLapTime(fastest.lapTimeMs) } : null}
        weather={weather}
        dash={dash}
        laps={laps}
        elapsed={`${formatClock(elapsedMs)} ELAPSED`}
        speed={speed}
        onSpeed={setSpeed}
        onTogglePlay={togglePlay}
        onSeekLap={seekLap}
      />
    </div>
  );
}

function lapWindowOf(row: LapRow | null): LapWindow | null {
  const start = row?.lapStartMs ?? (row?.lapEndMs != null && row.lapTimeMs != null ? row.lapEndMs - row.lapTimeMs : null);
  return start != null && row?.lapEndMs != null ? { start, end: row.lapEndMs } : null;
}

/**
 * Interval to the car ahead at the last timing line, as `+0.8` for the tower
 * and `+0.842` for the followed-car card. Lapped cars read `+1 LAP`.
 */
function intervalLabels(standings: readonly Standing[]) {
  const labels = new Map<number, { ms: number | null; short: string; long: string }>();
  const leaderLap = standings[0]?.lastLapMs ?? null;
  standings.forEach((row, i) => {
    if (i === 0 || row.gapMs == null) return;
    if (leaderLap != null && leaderLap > 0 && row.gapMs >= leaderLap) {
      const down = Math.floor(row.gapMs / leaderLap);
      const text = `+${down} LAP${down === 1 ? "" : "S"}`;
      labels.set(row.driverNumber, { ms: null, short: text, long: text });
      return;
    }
    const ahead = standings[i - 1]?.gapMs ?? 0;
    const ms = Math.max(0, row.gapMs - ahead);
    labels.set(row.driverNumber, { ms, short: `+${(ms / 1000).toFixed(1)}`, long: `+${(ms / 1000).toFixed(3)}` });
  });
  return labels;
}
