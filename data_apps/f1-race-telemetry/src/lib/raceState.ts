/**
 * Derivations over the lap table. Everything here is a deterministic transform
 * of rows Metabase returned — no values are invented.
 */
import type {
  DriverResult,
  LapRow,
  TrackStatusRow,
  WeatherRow,
} from "../hooks/useRaceData";

export type Standing = {
  driverNumber: number;
  driver: string;
  team: string | null;
  position: number | null;
  /** Milliseconds behind the leader at the end of this lap; null for the leader. */
  gapMs: number | null;
  lastLapMs: number | null;
  compound: string | null;
  tyreLife: number | null;
  /** Positions gained (+) or lost (-) against the previous lap; null if unknown. */
  change: number | null;
  /** Recent positions, oldest first — drives the trend sparkline. */
  recentPositions: number[];
  isPersonalBest: boolean;
  lapEndMs: number | null;
};

export function lapsByNumber(laps: readonly LapRow[]): Map<number, LapRow[]> {
  const map = new Map<number, LapRow[]>();
  for (const lap of laps) {
    const bucket = map.get(lap.lapNumber);
    if (bucket) {
      bucket.push(lap);
    } else {
      map.set(lap.lapNumber, [lap]);
    }
  }
  return map;
}

export function maxLapNumber(laps: readonly LapRow[]): number {
  return laps.reduce((max, lap) => Math.max(max, lap.lapNumber), 0);
}

/** How far into the session each lap ended, for the leader. */
export function leaderLapEnd(
  byLap: Map<number, LapRow[]>,
  lapNumber: number,
): number | null {
  const rows = byLap.get(lapNumber) ?? [];
  const leader = rows.find((r) => r.position === 1);
  if (leader?.lapEndMs != null) {
    return leader.lapEndMs;
  }
  // No classified leader on this lap — fall back to the earliest lap end.
  const ends = rows
    .map((r) => r.lapEndMs)
    .filter((v): v is number => v != null);
  return ends.length > 0 ? Math.min(...ends) : null;
}

const TREND_WINDOW = 10;

export function standingsAtLap(
  byLap: Map<number, LapRow[]>,
  lapNumber: number,
): Standing[] {
  const current = byLap.get(lapNumber) ?? [];
  const previous = byLap.get(lapNumber - 1) ?? [];
  const prevPositionByDriver = new Map<number, number>();
  for (const lap of previous) {
    if (lap.position != null) {
      prevPositionByDriver.set(lap.driverNumber, lap.position);
    }
  }

  const leaderEnd = leaderLapEnd(byLap, lapNumber);

  const standings = current.map<Standing>((lap) => {
    const previousPosition = prevPositionByDriver.get(lap.driverNumber);
    const change =
      previousPosition != null && lap.position != null
        ? previousPosition - lap.position
        : null;

    const recentPositions: number[] = [];
    for (let n = Math.max(1, lapNumber - TREND_WINDOW + 1); n <= lapNumber; n++) {
      const row = (byLap.get(n) ?? []).find(
        (r) => r.driverNumber === lap.driverNumber,
      );
      if (row?.position != null) {
        recentPositions.push(row.position);
      }
    }

    return {
      driverNumber: lap.driverNumber,
      driver: lap.driver,
      team: lap.team,
      position: lap.position,
      gapMs:
        leaderEnd != null && lap.lapEndMs != null && lap.position !== 1
          ? lap.lapEndMs - leaderEnd
          : null,
      lastLapMs: lap.lapTimeMs,
      compound: lap.compound,
      tyreLife: lap.tyreLife,
      change,
      recentPositions,
      isPersonalBest: lap.isPersonalBest,
      lapEndMs: lap.lapEndMs,
    };
  });

  return standings.sort((a, b) => {
    if (a.position == null) return 1;
    if (b.position == null) return -1;
    return a.position - b.position;
  });
}

/** The fastest lap set at or before `lapNumber`. */
export function fastestLapUpTo(
  laps: readonly LapRow[],
  lapNumber: number,
): LapRow | null {
  let best: LapRow | null = null;
  for (const lap of laps) {
    if (lap.lapNumber > lapNumber || lap.lapTimeMs == null || lap.lapTimeMs <= 0) {
      continue;
    }
    if (best?.lapTimeMs == null || lap.lapTimeMs < best.lapTimeMs) {
      best = lap;
    }
  }
  return best;
}

/** Mean of every valid lap time up to `lapNumber` — the fastest-lap comparison. */
export function averageLapTimeUpTo(
  laps: readonly LapRow[],
  lapNumber: number,
): number | null {
  let total = 0;
  let count = 0;
  for (const lap of laps) {
    if (lap.lapNumber <= lapNumber && lap.lapTimeMs != null && lap.lapTimeMs > 0) {
      total += lap.lapTimeMs;
      count += 1;
    }
  }
  return count > 0 ? total / count : null;
}

/** The last sample at or before `timeMs`; falls back to the first sample. */
export function sampleAt<T extends { sessionTimeMs: number }>(
  rows: readonly T[],
  timeMs: number | null,
): T | null {
  if (rows.length === 0) {
    return null;
  }
  if (timeMs == null) {
    return rows[0] ?? null;
  }
  let match: T | null = null;
  for (const row of rows) {
    if (row.sessionTimeMs <= timeMs) {
      match = row;
    } else {
      break;
    }
  }
  return match ?? rows[0] ?? null;
}

export function weatherAt(
  weather: readonly WeatherRow[],
  timeMs: number | null,
): WeatherRow | null {
  return sampleAt(weather, timeMs);
}

export function trackStatusAt(
  statuses: readonly TrackStatusRow[],
  timeMs: number | null,
): TrackStatusRow | null {
  return sampleAt(statuses, timeMs);
}

/** driverNumber → classification row, for joining identity onto lap rows. */
export function resultsByDriver(
  results: readonly DriverResult[],
): Map<number, DriverResult> {
  const map = new Map<number, DriverResult>();
  for (const result of results) {
    map.set(result.driverNumber, result);
  }
  return map;
}

/** Each driver's best lap time in the session. */
export function personalBestByDriver(
  laps: readonly LapRow[],
): Map<number, number> {
  const map = new Map<number, number>();
  for (const lap of laps) {
    if (lap.lapTimeMs == null || lap.lapTimeMs <= 0) {
      continue;
    }
    const current = map.get(lap.driverNumber);
    if (current == null || lap.lapTimeMs < current) {
      map.set(lap.driverNumber, lap.lapTimeMs);
    }
  }
  return map;
}
