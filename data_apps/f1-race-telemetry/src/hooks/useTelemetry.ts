/**
 * Telemetry reads that depend on the current selection (driver, lap, moment).
 * Each is gated with `enabled` so nothing runs before its inputs are known.
 */
import { filter, useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  CarTelemetryAt,
  DriverLapTelemetry,
  FieldPositions,
  TrackOutline,
} from "../../queries/telemetry.query";
import type { TrackPoint } from "../components/TrackMap";
import schema from "../metabase.data";
import { bool, num, numOr } from "../lib/rows";

const lapTelemetryT = schema.tables.lapTelemetry;
const positionDataT = schema.tables.positionData;
const carTelemetryT = schema.tables.carTelemetry;

/**
 * The driver page animates the whole field, so it reads position_data in
 * windows rather than per frame: ~600 rows for 20 cars, well under the row
 * cap. The small overlap gives every window a sample past its end to
 * interpolate towards.
 */
const FIELD_WINDOW_MS = 8000;
const FIELD_OVERLAP_MS = 700;
/** Don't draw a car whose nearest sample is further than this from `timeMs`. */
const FIELD_MAX_GAP_MS = 1500;

type Rows = readonly Record<string, unknown>[];

function rowsOf(data: { rows?: unknown } | null): Rows {
  const rows = data?.rows;
  return Array.isArray(rows) ? (rows as Rows) : [];
}

export type TelemetrySample = {
  sample: number;
  sessionTimeMs: number;
  timeInLapMs: number | null;
  distanceM: number | null;
  relDistance: number | null;
  speed: number | null;
  rpm: number | null;
  gear: number | null;
  throttle: number | null;
  brake: number | null;
  drs: number | null;
  x: number;
  y: number;
  gLong: number | null;
  gLat: number | null;
  gTotal: number | null;
  cornerNumber: number | null;
};

export type FieldPosition = {
  driverNumber: number;
  x: number;
  y: number;
  onTrack: boolean;
};

export type CarSample = {
  speed: number | null;
  rpm: number | null;
  gear: number | null;
  throttle: number | null;
  brake: number | null;
  drs: number | null;
};

/** The x/y trace of one lap, used to draw the circuit. */
export function useTrackOutline(
  sessionId: number | null,
  driverNumber: number | null,
  lapNumber: number | null,
) {
  const enabled =
    sessionId != null && driverNumber != null && lapNumber != null;

  const { data, isLoading, error } = useMetabaseQuery(TrackOutline, {
    enabled,
    filters: [
      filter(lapTelemetryT.fields.sessionId, "=", sessionId ?? -1),
      filter(lapTelemetryT.fields.driverNumber, "=", driverNumber ?? -1),
      filter(lapTelemetryT.fields.lapNumber, "=", lapNumber ?? -1),
    ],
  });

  const line = useMemo<TrackPoint[]>(
    () =>
      rowsOf(data)
        .map((row) => ({
          x: numOr(row[lapTelemetryT.fields.x.name], Number.NaN),
          y: numOr(row[lapTelemetryT.fields.y.name], Number.NaN),
        }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
    [data],
  );

  return { line, isLoading, error };
}

export type TimedCarSample = CarSample & { sessionTimeMs: number };

/** Lap bounds, in session time, of a car's lap. */
export type LapWindow = { start: number; end: number };

/** One car's car_telemetry rows across a time window, in time order. */
function useCarWindow(sessionId: number | null, driverNumber: number | null, window: LapWindow | null) {
  const enabled = sessionId != null && driverNumber != null && window != null;
  const from = window?.start ?? 0;
  const to = window?.end ?? 0;
  const { data, isLoading } = useMetabaseQuery(CarTelemetryAt, {
    enabled,
    filters: [
      filter(carTelemetryT.fields.sessionId, "=", sessionId ?? -1),
      filter(carTelemetryT.fields.driverNumber, "=", driverNumber ?? -1),
      filter(carTelemetryT.fields.sessionTimeMs, "between", [from, to]),
    ],
  });

  // A client may hand back the previous window for a render while the filters
  // change; only accept rows that belong to this car and this window.
  const samples = useMemo<TimedCarSample[] | null>(() => {
    if (!enabled || data == null) return null;
    return rowsOf(data)
      .map((row) => ({
        sessionId: num(row[carTelemetryT.fields.sessionId.name]),
        driverNumber: num(row[carTelemetryT.fields.driverNumber.name]),
        sessionTimeMs: num(row[carTelemetryT.fields.sessionTimeMs.name]),
        speed: num(row[carTelemetryT.fields.speed.name]),
        rpm: num(row[carTelemetryT.fields.rpm.name]),
        gear: num(row[carTelemetryT.fields.gear.name]),
        throttle: num(row[carTelemetryT.fields.throttle.name]),
        brake: num(row[carTelemetryT.fields.brake.name]),
        drs: num(row[carTelemetryT.fields.drs.name]),
      }))
      .filter((row): row is typeof row & { sessionTimeMs: number } =>
        row.sessionId === sessionId && row.driverNumber === driverNumber &&
        row.sessionTimeMs != null && row.sessionTimeMs >= from && row.sessionTimeMs <= to,
      )
      .sort((a, b) => a.sessionTimeMs - b.sessionTimeMs)
      .map(({ sessionTimeMs, speed, rpm, gear, throttle, brake, drs }) => ({ sessionTimeMs, speed, rpm, gear, throttle, brake, drs }));
  }, [enabled, data, sessionId, driverNumber, from, to]);

  return { samples, isLoading };
}

/**
 * The followed car's dash channels, continuous through the lap. Race Replay
 * reads the car's whole current lap in one window (a few hundred rows) and the
 * next lap ahead of time, then picks the sample at the playhead. The last good
 * window is held while a new one loads so the dash never blanks mid-playback.
 */
export function useFollowedCarTelemetry(
  sessionId: number | null,
  driverNumber: number | null,
  lap: LapWindow | null,
  nextLap: LapWindow | null,
) {
  const current = useCarWindow(sessionId, driverNumber, lap);
  // Prefetch only: warms the query cache for when the car crosses the line.
  useCarWindow(sessionId, driverNumber, nextLap);

  const key = `${sessionId}:${driverNumber}`;
  const held = useRef<{ key: string; samples: TimedCarSample[] } | null>(null);
  useEffect(() => {
    if (current.samples && current.samples.length > 0) held.current = { key, samples: current.samples };
  }, [current.samples, key]);

  const samples = current.samples && current.samples.length > 0
    ? current.samples
    : held.current?.key === key ? held.current.samples : [];
  return { samples, isLoading: current.isLoading };
}

/** The last sample at or before `timeMs` (the first one if none precede it). */
export function carSampleAt(samples: readonly TimedCarSample[], timeMs: number | null): TimedCarSample | null {
  if (samples.length === 0 || timeMs == null) return null;
  let lo = 0;
  let hi = samples.length - 1;
  if (samples[0].sessionTimeMs > timeMs) return samples[0];
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (samples[mid].sessionTimeMs <= timeMs) lo = mid;
    else hi = mid - 1;
  }
  return samples[lo];
}

/** The full channel set for one driver's telemetry lap. */
export function useDriverLapTelemetry(
  sessionId: number | null,
  driverNumber: number | null,
  lapNumber: number | null,
) {
  const enabled =
    sessionId != null && driverNumber != null && lapNumber != null;

  const { data, isLoading, error } = useMetabaseQuery(DriverLapTelemetry, {
    enabled,
    filters: [
      filter(lapTelemetryT.fields.sessionId, "=", sessionId ?? -1),
      filter(lapTelemetryT.fields.driverNumber, "=", driverNumber ?? -1),
      filter(lapTelemetryT.fields.lapNumber, "=", lapNumber ?? -1),
    ],
  });

  const samples = useMemo<TelemetrySample[]>(
    () =>
      rowsOf(data)
        .map((row) => ({
          sample: numOr(row[lapTelemetryT.fields.sample.name], 0),
          sessionTimeMs: numOr(row[lapTelemetryT.fields.sessionTimeMs.name], 0),
          timeInLapMs: num(row[lapTelemetryT.fields.timeInLapMs.name]),
          distanceM: num(row[lapTelemetryT.fields.distanceM.name]),
          relDistance: num(row[lapTelemetryT.fields.relDistance.name]),
          speed: num(row[lapTelemetryT.fields.speed.name]),
          rpm: num(row[lapTelemetryT.fields.rpm.name]),
          gear: num(row[lapTelemetryT.fields.gear.name]),
          throttle: num(row[lapTelemetryT.fields.throttle.name]),
          brake: num(row[lapTelemetryT.fields.brake.name]),
          drs: num(row[lapTelemetryT.fields.drs.name]),
          x: numOr(row[lapTelemetryT.fields.x.name], Number.NaN),
          y: numOr(row[lapTelemetryT.fields.y.name], Number.NaN),
          gLong: num(row[lapTelemetryT.fields.gLong.name]),
          gLat: num(row[lapTelemetryT.fields.gLat.name]),
          gTotal: num(row[lapTelemetryT.fields.gTotal.name]),
          cornerNumber: num(row[lapTelemetryT.fields.cornerNumber.name]),
        }))
        .sort((a, b) => a.sample - b.sample),
    [data],
  );

  return { samples, isLoading, error };
}

type FieldSample = { t: number; x: number; y: number; onTrack: boolean };
type FieldTraces = Map<number, FieldSample[]>;

/** One window of every car's positions, grouped per driver in time order. */
function useFieldWindow(sessionId: number | null, windowStart: number | null) {
  const from = windowStart ?? 0;
  const { data } = useMetabaseQuery(FieldPositions, {
    enabled: sessionId != null && windowStart != null,
    filters: [
      filter(positionDataT.fields.sessionId, "=", sessionId ?? -1),
      filter(positionDataT.fields.sessionTimeMs, "between", [
        from,
        from + FIELD_WINDOW_MS + FIELD_OVERLAP_MS,
      ]),
    ],
  });

  return useMemo<FieldTraces | null>(() => {
    if (!data) {
      return null;
    }
    const traces: FieldTraces = new Map();
    for (const row of rowsOf(data)) {
      const driverNumber = numOr(row[positionDataT.fields.driverNumber.name], 0);
      const t = num(row[positionDataT.fields.sessionTimeMs.name]);
      const x = numOr(row[positionDataT.fields.x.name], Number.NaN);
      const y = numOr(row[positionDataT.fields.y.name], Number.NaN);
      if (driverNumber <= 0 || t == null || !Number.isFinite(x) || !Number.isFinite(y)) {
        continue;
      }
      const list = traces.get(driverNumber) ?? [];
      list.push({ t, x, y, onTrack: bool(row[positionDataT.fields.onTrack.name]) });
      traces.set(driverNumber, list);
    }
    traces.forEach((list) => list.sort((a, b) => a.t - b.t));
    return traces;
  }, [data]);
}

function positionAt(trace: readonly FieldSample[], timeMs: number): FieldPosition | null {
  if (trace.length === 0) {
    return null;
  }
  let hi = trace.findIndex((s) => s.t >= timeMs);
  if (hi < 0) {
    hi = trace.length - 1;
  }
  const b = trace[hi];
  const a = trace[Math.max(0, hi - 1)];
  if (Math.min(Math.abs(a.t - timeMs), Math.abs(b.t - timeMs)) > FIELD_MAX_GAP_MS) {
    return null;
  }
  const span = b.t - a.t;
  const k = span > 0 ? Math.min(Math.max((timeMs - a.t) / span, 0), 1) : 0;
  return {
    driverNumber: 0,
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    onTrack: k < 0.5 ? a.onTrack : b.onTrack,
  };
}

/**
 * Every car's interpolated position at `timeMs`, smooth enough to animate.
 * The next window is fetched ahead of time, and the last good window is held
 * while a new one loads, so cars never blink out mid-playback.
 */
export function useFieldMotion(sessionId: number | null, timeMs: number | null) {
  const windowStart =
    timeMs == null ? null : Math.floor(timeMs / FIELD_WINDOW_MS) * FIELD_WINDOW_MS;

  const current = useFieldWindow(sessionId, windowStart);
  // Prefetch only: warms the query cache for when playback crosses over.
  useFieldWindow(sessionId, windowStart == null ? null : windowStart + FIELD_WINDOW_MS);

  const held = useRef<{ key: string; traces: FieldTraces } | null>(null);
  const key = `${sessionId}:${windowStart}`;
  useEffect(() => {
    if (current) {
      held.current = { key, traces: current };
    }
  }, [current, key]);

  const traces = current ?? held.current?.traces ?? null;

  /** Positions at any moment inside the loaded windows, for per-frame animation. */
  const at = useCallback((ms: number): FieldPosition[] => {
    if (!traces) {
      return [];
    }
    const out: FieldPosition[] = [];
    traces.forEach((trace, driverNumber) => {
      const p = positionAt(trace, ms);
      if (p) {
        out.push({ ...p, driverNumber });
      }
    });
    return out;
  }, [traces]);

  const positions = useMemo<FieldPosition[]>(() => (timeMs == null ? [] : at(timeMs)), [at, timeMs]);

  return { positions, at, isLoading: current == null };
}
