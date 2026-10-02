/** Continuous circuit positions inferred from recorded lap start/end times.
 * Position-data windows cannot be fetched quickly enough for 40× playback.
 */
import type { LapRow } from "../hooks/useRaceData";

type TimedLap = {
  start: number;
  end: number;
  pitIn: number | null;
  pitOut: number | null;
};

export type RaceMotionIndex = Map<number, TimedLap[]>;

export function buildRaceMotionIndex(laps: readonly LapRow[]): RaceMotionIndex {
  const byDriver: RaceMotionIndex = new Map();
  for (const lap of laps) {
    const start = lap.lapStartMs ?? (lap.lapEndMs != null && lap.lapTimeMs != null ? lap.lapEndMs - lap.lapTimeMs : null);
    const end = lap.lapEndMs ?? (start != null && lap.lapTimeMs != null ? start + lap.lapTimeMs : null);
    if (start == null || end == null || end <= start) continue;
    const rows = byDriver.get(lap.driverNumber) ?? [];
    rows.push({ start, end, pitIn: lap.pitInMs, pitOut: lap.pitOutMs });
    byDriver.set(lap.driverNumber, rows);
  }
  byDriver.forEach((rows) => rows.sort((a, b) => a.start - b.start));
  return byDriver;
}

/** Reference-lap timestamps preserve the slowing and acceleration at corners. */
export function referenceProgress(samples: readonly { timeInLapMs: number | null }[]): number[] {
  if (samples.length < 2) return samples.map(() => 0);
  const first = samples[0].timeInLapMs;
  const last = samples[samples.length - 1].timeInLapMs;
  const duration = first != null && last != null ? last - first : 0;
  const fromTime = duration > 0 && samples.every((sample, i) => sample.timeInLapMs != null && (i === 0 || sample.timeInLapMs >= samples[i - 1].timeInLapMs!));
  return samples.map((sample, i) => fromTime ? ((sample.timeInLapMs ?? first!) - first!) / duration : i / (samples.length - 1));
}

/** A car's place in its current lap, as a fraction of the lap's duration. */
export type CarProgress = {
  driverNumber: number;
  /** 0 at the lap's start, 1 at its end, by elapsed time. */
  progress: number;
  inPit: boolean;
  /** Eases 0 → 1 over the first and last seconds of a pit stop, for drawing the pit lane. */
  pitBlend: number;
};

const PIT_EASE_MS = 3000;

export function raceProgressAt(index: RaceMotionIndex, timeMs: number | null): CarProgress[] {
  if (timeMs == null) return [];
  const cars: CarProgress[] = [];
  index.forEach((rows, driverNumber) => {
    if (rows.length === 0 || timeMs < rows[0].start || timeMs > rows[rows.length - 1].end + 5000) return;
    let lo = 0;
    let hi = rows.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (rows[mid].end < timeMs) lo = mid + 1;
      else hi = mid;
    }
    const row = rows[lo];
    const progress = Math.min(1, Math.max(0, (timeMs - row.start) / (row.end - row.start)));
    const next = rows[lo + 1];
    const inPit = row.pitIn != null && timeMs >= row.pitIn && (next?.pitOut == null || timeMs < next.pitOut);
    const pitBlend = !inPit
      ? 0
      : Math.min(1, (timeMs - row.pitIn!) / PIT_EASE_MS, next?.pitOut != null ? (next.pitOut - timeMs) / PIT_EASE_MS : 1);
    cars.push({ driverNumber, progress, inPit, pitBlend: Math.max(0, pitBlend) });
  });
  return cars;
}
