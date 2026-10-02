/**
 * Race Replay HUD readouts at the playhead. Everything is derived from lap
 * rows: a sector or lap only counts once the car has actually completed it.
 */
import type { LapRow, WeatherRow } from "../hooks/useRaceData";
import { formatLapTime, lapTrackStatus } from "./format";

export type SectorCell = { value: string; color: string; bar: string };

const PURPLE = "#C084FC";
const GREEN = "#4ADE80";
const YELLOW = "#F5C518";
const DIM = "#98A1B3";
const NONE = "#6B7487";

function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function lapsByDriver(laps: readonly LapRow[]): Map<number, LapRow[]> {
  const map = new Map<number, LapRow[]>();
  for (const lap of laps) {
    const list = map.get(lap.driverNumber) ?? [];
    list.push(lap);
    map.set(lap.driverNumber, list);
  }
  map.forEach((list) => list.sort((a, b) => a.lapNumber - b.lapNumber));
  return map;
}

function lapStart(row: LapRow): number | null {
  return row.lapStartMs ?? (row.lapEndMs != null && row.lapTimeMs != null ? row.lapEndMs - row.lapTimeMs : null);
}

/** The lap a car is on at `timeMs`, and the one after it. */
export function lapAt(rows: readonly LapRow[], timeMs: number | null): { row: LapRow | null; next: LapRow | null } {
  if (timeMs == null || rows.length === 0) return { row: null, next: null };
  for (let i = 0; i < rows.length; i++) {
    const start = lapStart(rows[i]);
    const end = rows[i].lapEndMs;
    if (start != null && end != null && timeMs >= start && timeMs < end) return { row: rows[i], next: rows[i + 1] ?? null };
  }
  return { row: null, next: null };
}

const SECTOR_KEYS = ["sector1Ms", "sector2Ms", "sector3Ms"] as const;

/** When each of a lap's sectors was completed, in session time. */
function sectorEnds(row: LapRow): (number | null)[] {
  const start = lapStart(row);
  let at = start;
  return SECTOR_KEYS.map((key) => {
    const v = row[key];
    if (at == null || v == null || v <= 0) {
      at = null;
      return null;
    }
    at += v;
    return at;
  });
}

/** Session-best and personal-best sector times among sectors finished by `timeMs`. */
function sectorBests(laps: readonly LapRow[], driverNumber: number, timeMs: number) {
  const overall = [Infinity, Infinity, Infinity];
  const personal = [Infinity, Infinity, Infinity];
  for (const row of laps) {
    const ends = sectorEnds(row);
    SECTOR_KEYS.forEach((key, j) => {
      const v = row[key];
      const end = ends[j];
      if (v == null || v <= 0 || end == null || end > timeMs) return;
      overall[j] = Math.min(overall[j], v);
      if (row.driverNumber === driverNumber) personal[j] = Math.min(personal[j], v);
    });
  }
  return { overall, personal };
}

/**
 * The followed car's three sector tiles. Sectors already finished this lap
 * show their time (purple for the session best so far, green for a personal
 * best, yellow otherwise); the sector it is in counts up live; sectors still
 * ahead show the previous lap's times, dimmed.
 */
export function sectorCells(laps: readonly LapRow[], driverLaps: readonly LapRow[], driverNumber: number, timeMs: number | null): SectorCell[] {
  const empty = SECTOR_KEYS.map(() => ({ value: "—", color: NONE, bar: rgba(NONE, 0.35) }));
  if (timeMs == null || driverLaps.length === 0) return empty;
  const { overall, personal } = sectorBests(laps, driverNumber, timeMs);
  const colorOf = (v: number | null, j: number) => {
    if (v == null || v <= 0) return NONE;
    if (v <= overall[j]) return PURPLE;
    if (v <= personal[j]) return GREEN;
    return YELLOW;
  };
  const done = (v: number | null, j: number): SectorCell => {
    const c = colorOf(v, j);
    return { value: v == null || v <= 0 ? "—" : (v / 1000).toFixed(3), color: c, bar: c };
  };
  const previous = (v: number | null, j: number): SectorCell => {
    const c = colorOf(v, j);
    return { value: v == null || v <= 0 ? "—" : (v / 1000).toFixed(3), color: DIM, bar: rgba(c, 0.35) };
  };

  const { row } = lapAt(driverLaps, timeMs);
  const completed = driverLaps.filter((r) => r.lapEndMs != null && r.lapEndMs <= timeMs);
  const prevRow = completed[completed.length - 1] ?? null;
  if (!row) {
    return prevRow ? SECTOR_KEYS.map((key, j) => done(prevRow[key], j)) : empty;
  }
  const ends = sectorEnds(row);
  const start = lapStart(row)!;
  return SECTOR_KEYS.map((key, j) => {
    const end = ends[j];
    if (end != null && end <= timeMs) return done(row[key], j);
    const sectorStart = j === 0 ? start : ends[j - 1];
    const live = sectorStart != null && timeMs >= sectorStart && (end == null || timeMs < end);
    if (live) return { value: ((timeMs - sectorStart) / 1000).toFixed(1), color: "#E8EAF0", bar: "#FFFFFF" };
    return previous(prevRow ? prevRow[key] : null, j);
  });
}

/** The quickest lap finished by `timeMs`. */
export function fastestLapBefore(laps: readonly LapRow[], timeMs: number | null): LapRow | null {
  if (timeMs == null) return null;
  let best: LapRow | null = null;
  for (const row of laps) {
    if (row.lapEndMs == null || row.lapEndMs > timeMs || row.lapTimeMs == null || row.lapTimeMs <= 0) continue;
    if (best == null || row.lapTimeMs < best.lapTimeMs!) best = row;
  }
  return best;
}

/** A driver's last and best completed laps at `timeMs`. */
export function lapTimesAt(driverLaps: readonly LapRow[], timeMs: number | null) {
  let last: LapRow | null = null;
  let best: LapRow | null = null;
  if (timeMs != null) {
    for (const row of driverLaps) {
      if (row.lapEndMs == null || row.lapEndMs > timeMs) continue;
      last = row;
      if (row.lapTimeMs != null && row.lapTimeMs > 0 && (best == null || row.lapTimeMs < best.lapTimeMs!)) best = row;
    }
  }
  return { last: formatLapTime(last?.lapTimeMs), best, bestText: formatLapTime(best?.lapTimeMs) };
}

/**
 * The lap strip's colour per lap: red flag, safety car or VSC, yellow, and
 * rain take precedence over the played/unplayed shading.
 */
export function lapConditionColors(
  byLap: Map<number, LapRow[]>,
  lastLap: number,
  leaderEnds: readonly { lap: number; time: number }[],
  weather: readonly WeatherRow[],
): (string | null)[] {
  const endByLap = new Map(leaderEnds.map((e) => [e.lap, e.time]));
  return Array.from({ length: lastLap }, (_, i) => {
    const lap = i + 1;
    const rows = byLap.get(lap) ?? [];
    const leader = rows.find((r) => r.position === 1) ?? rows[0];
    const status = lapTrackStatus(leader?.trackStatus).label;
    if (status === "Red flag") return "#E8002D";
    if (status === "Safety car" || status === "Virtual safety car") return "#F59E0B";
    if (status === "Yellow flag") return YELLOW;
    const from = endByLap.get(lap - 1) ?? -Infinity;
    const to = endByLap.get(lap) ?? Infinity;
    if (weather.some((w) => w.rainfall && w.sessionTimeMs > from && w.sessionTimeMs <= to)) return "#3B82F6";
    return null;
  });
}
