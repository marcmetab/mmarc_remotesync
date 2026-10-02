/**
 * The app's data layer.
 *
 * Each schema entry is queried exactly once, here, and the result handed down
 * as props — the session-scoped tables are small (20 results, ~1.1k laps, 157
 * weather samples), so scrubbing through the race is pure React with no
 * refetch per frame.
 */
import { filter, useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useMemo } from "react";

import {
  SessionCorners,
  SessionLaps,
  SessionList,
  SessionResults,
  SessionTrackStatus,
  SessionWeather,
} from "../../queries/session.query";
import { TelemetryLapIndex } from "../../queries/telemetry.query";
import schema from "../metabase.data";
import { bool, num, numOr, str } from "../lib/rows";

const sessionsT = schema.tables.sessions420;
const resultsT = schema.tables.results;
const lapsT = schema.tables.laps;
const weatherT = schema.tables.weather;
const trackStatusT = schema.tables.trackStatus;
const cornersT = schema.tables.circuitCorners;
const lapTelemetryT = schema.tables.lapTelemetry;

export type SessionOption = {
  sessionId: number;
  year: number | null;
  round: number | null;
  eventName: string;
  officialName: string | null;
  sessionName: string;
  location: string | null;
  country: string | null;
};

export type DriverResult = {
  driverNumber: number;
  abbreviation: string;
  fullName: string;
  teamName: string | null;
  teamColorRaw: string | null;
  headshotUrl: string | null;
  countryCode: string | null;
  position: number | null;
  classifiedPosition: string | null;
  gridPosition: number | null;
  points: number | null;
  status: string | null;
  raceTimeMs: number | null;
};

export type CatalogDriver = DriverResult & {
  /** A race or sprint where this driver appears; opens their detail page. */
  sessionId: number;
  year: number | null;
  sessionCount: number;
  seasons: number[];
  teams: string[];
  aliases: string[];
};

export type LapRow = {
  driverNumber: number;
  driver: string;
  team: string | null;
  lapNumber: number;
  position: number | null;
  lapTimeMs: number | null;
  sector1Ms: number | null;
  sector2Ms: number | null;
  sector3Ms: number | null;
  speedSt: number | null;
  compound: string | null;
  tyreLife: number | null;
  freshTyre: boolean;
  stint: number | null;
  lapStartMs: number | null;
  lapEndMs: number | null;
  pitInMs: number | null;
  pitOutMs: number | null;
  isPersonalBest: boolean;
  trackStatus: string | null;
};

export type WeatherRow = {
  sessionTimeMs: number;
  airTemp: number | null;
  trackTemp: number | null;
  humidity: number | null;
  pressure: number | null;
  rainfall: boolean;
  windSpeed: number | null;
  windDirection: number | null;
};

export type TrackStatusRow = {
  sessionTimeMs: number;
  status: string | null;
  message: string | null;
};

export type CornerRow = {
  cornerNumber: number;
  letter: string | null;
  x: number;
  y: number;
  distanceM: number | null;
  /** Direction (degrees) to place the corner's label, in track coordinates. */
  angle: number | null;
};

/** Which single lap of each driver has rich (distance / x-y / g-force) telemetry. */
export type TelemetryLap = { driverNumber: number; lapNumber: number };

type Rows = readonly Record<string, unknown>[];

/**
 * 52 result rows carry the literal string "None" rather than a URL — rookies
 * and reserves whose photo was missing when the season was loaded. Treat it as
 * absent so nothing requests `src="None"`.
 */
function headshotUrlOf(value: unknown): string | null {
  const url = str(value);
  return url == null || url === "None" ? null : url;
}

function rowsOf(data: { rows?: unknown } | null): Rows {
  const rows = data?.rows;
  return Array.isArray(rows) ? (rows as Rows) : [];
}

function driverResultOf(row: Record<string, unknown>): DriverResult {
  return {
    driverNumber: numOr(row[resultsT.fields.driverNumber.name], 0),
    abbreviation: str(row[resultsT.fields.abbreviation.name]) ?? "—",
    fullName: str(row[resultsT.fields.fullName.name]) ?? "Unknown driver",
    teamName: str(row[resultsT.fields.teamName.name]),
    teamColorRaw: str(row[resultsT.fields.teamColor.name]),
    headshotUrl: headshotUrlOf(row[resultsT.fields.headshotUrl.name]),
    countryCode: str(row[resultsT.fields.countryCode.name]),
    position: num(row[resultsT.fields.position.name]),
    classifiedPosition: str(row[resultsT.fields.classifiedPosition.name]),
    gridPosition: num(row[resultsT.fields.gridPosition.name]),
    points: num(row[resultsT.fields.points.name]),
    status: str(row[resultsT.fields.status.name]),
    raceTimeMs: num(row[resultsT.fields.raceTimeMs.name]),
  };
}

function compareSessionRecency(a: SessionOption, b: SessionOption): number {
  const yearDifference = (a.year ?? -1) - (b.year ?? -1);
  if (yearDifference !== 0) return yearDifference;

  const roundDifference = (a.round ?? -1) - (b.round ?? -1);
  if (roundDifference !== 0) return roundDifference;

  // The full race represents a weekend more completely than its sprint.
  const raceDifference = Number(a.sessionName.toLowerCase() === "race") -
    Number(b.sessionName.toLowerCase() === "race");
  return raceDifference || a.sessionId - b.sessionId;
}

/** The session picker's options. Runs unfiltered; there are only a handful. */
export function useSessionCatalog() {
  const { data, isLoading, error } = useMetabaseQuery(SessionList);

  const sessions = useMemo<SessionOption[]>(
    () =>
      rowsOf(data)
        .map((row) => ({
          sessionId: numOr(row[sessionsT.fields.sessionId.name], 0),
          year: num(row[sessionsT.fields.year.name]),
          round: num(row[sessionsT.fields.round.name]),
          eventName: str(row[sessionsT.fields.eventName.name]) ?? "Unknown event",
          officialName: str(row[sessionsT.fields.officialName.name]),
          sessionName: str(row[sessionsT.fields.sessionName.name]) ?? "Session",
          location: str(row[sessionsT.fields.location.name]),
          country: str(row[sessionsT.fields.country.name]),
        }))
        .filter((s) => s.sessionId > 0),
    [data],
  );

  /** Prefer a full race; that is the only session type with a complete field. */
  const defaultSessionId = useMemo(() => {
    const race = sessions.find((s) => s.sessionName.toLowerCase() === "race");
    return (race ?? sessions[0])?.sessionId ?? null;
  }, [sessions]);

  return { sessions, defaultSessionId, isLoading, isReady: data != null || error != null, error };
}

/** Driver identities across the loaded races and sprints, independent of the selected race. */
export function useDriverCatalog(sessions: readonly SessionOption[]) {
  const { data, isLoading, error } = useMetabaseQuery(SessionResults, {
    enabled: sessions.length > 0,
  });

  const drivers = useMemo<CatalogDriver[]>(() => {
    const sessionsById = new Map(sessions.map((session) => [session.sessionId, session]));
    const byIdentity = new Map<string, {
      latest: DriverResult;
      latestSession: SessionOption;
      sessionIds: Set<number>;
      seasons: Set<number>;
      teams: Set<string>;
      names: Set<string>;
    }>();

    for (const row of rowsOf(data)) {
      const sessionId = numOr(row[resultsT.fields.sessionId.name], 0);
      const session = sessionsById.get(sessionId);
      if (!session) continue;

      const result = driverResultOf(row);
      const name = result.fullName.trim().replace(/\s+/g, " ");
      if (result.driverNumber <= 0 || name.toLowerCase() === "unknown driver") continue;
      // Names and even car numbers can vary between seasons in this dataset.
      // The timing abbreviation plus family name joins known name variants
      // such as "Andrea Kimi Antonelli" and "Kimi Antonelli".
      const nameParts = name.split(" ");
      const familyName = nameParts[nameParts.length - 1]?.toLowerCase() ?? name.toLowerCase();
      const abbreviation = result.abbreviation.toUpperCase();
      const identity = abbreviation === "—" ? name.toLowerCase() : `${abbreviation}:${familyName}`;

      let entry = byIdentity.get(identity);
      if (!entry) {
        entry = {
          latest: result,
          latestSession: session,
          sessionIds: new Set<number>(),
          seasons: new Set<number>(),
          teams: new Set<string>(),
          names: new Set<string>(),
        };
        byIdentity.set(identity, entry);
      } else if (compareSessionRecency(session, entry.latestSession) > 0) {
        entry.latest = result;
        entry.latestSession = session;
      }

      entry.sessionIds.add(sessionId);
      if (session.year != null) entry.seasons.add(session.year);
      if (result.teamName) entry.teams.add(result.teamName);
      entry.names.add(name);
    }

    return [...byIdentity.values()]
      .map(({ latest, latestSession, sessionIds, seasons, teams, names }) => {
        const fullName = [...names].sort((a, b) => b.length - a.length)[0] ?? latest.fullName;
        return {
          ...latest,
          fullName,
          sessionId: latestSession.sessionId,
          year: latestSession.year,
          sessionCount: sessionIds.size,
          seasons: [...seasons].sort((a, b) => b - a),
          teams: [latest.teamName, ...teams]
            .filter((team): team is string => team != null)
            .filter((team, index, list) => list.indexOf(team) === index),
          aliases: [...names].filter((name) => name !== fullName),
        };
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [data, sessions]);

  return { drivers, isLoading, isReady: data != null || error != null, error };
}

export function useRaceData(sessionId: number | null) {
  const enabled = sessionId != null;
  const id = sessionId ?? -1;

  const resultsQ = useMetabaseQuery(SessionResults, {
    enabled,
    filters: [filter(resultsT.fields.sessionId, "=", id)],
  });
  const lapsQ = useMetabaseQuery(SessionLaps, {
    enabled,
    filters: [filter(lapsT.fields.sessionId, "=", id)],
  });
  const weatherQ = useMetabaseQuery(SessionWeather, {
    enabled,
    filters: [filter(weatherT.fields.sessionId, "=", id)],
  });
  const statusQ = useMetabaseQuery(SessionTrackStatus, {
    enabled,
    filters: [filter(trackStatusT.fields.sessionId, "=", id)],
  });
  const cornersQ = useMetabaseQuery(SessionCorners, {
    enabled,
    filters: [filter(cornersT.fields.sessionId, "=", id)],
  });
  const telemetryIndexQ = useMetabaseQuery(TelemetryLapIndex, {
    enabled,
    filters: [filter(lapTelemetryT.fields.sessionId, "=", id)],
  });

  const results = useMemo<DriverResult[]>(
    () => rowsOf(resultsQ.data).map(driverResultOf),
    [resultsQ.data],
  );

  const laps = useMemo<LapRow[]>(
    () =>
      rowsOf(lapsQ.data).map((row) => ({
        driverNumber: numOr(row[lapsT.fields.driverNumber.name], 0),
        driver: str(row[lapsT.fields.driver.name]) ?? "—",
        team: str(row[lapsT.fields.team.name]),
        lapNumber: numOr(row[lapsT.fields.lapNumber.name], 0),
        position: num(row[lapsT.fields.position.name]),
        lapTimeMs: num(row[lapsT.fields.lapTimeMs.name]),
        sector1Ms: num(row[lapsT.fields.sector1Ms.name]),
        sector2Ms: num(row[lapsT.fields.sector2Ms.name]),
        sector3Ms: num(row[lapsT.fields.sector3Ms.name]),
        speedSt: num(row[lapsT.fields.speedSt.name]),
        compound: str(row[lapsT.fields.compound.name]),
        tyreLife: num(row[lapsT.fields.tyreLife.name]),
        freshTyre: bool(row[lapsT.fields.freshTyre.name]),
        stint: num(row[lapsT.fields.stint.name]),
        lapStartMs: num(row[lapsT.fields.lapStartMs.name]),
        lapEndMs: num(row[lapsT.fields.lapEndMs.name]),
        pitInMs: num(row[lapsT.fields.pitInMs.name]),
        pitOutMs: num(row[lapsT.fields.pitOutMs.name]),
        isPersonalBest: bool(row[lapsT.fields.isPersonalBest.name]),
        trackStatus: str(row[lapsT.fields.trackStatus.name]),
      })),
    [lapsQ.data],
  );

  const weather = useMemo<WeatherRow[]>(
    () =>
      rowsOf(weatherQ.data).map((row) => ({
        sessionTimeMs: numOr(row[weatherT.fields.sessionTimeMs.name], 0),
        airTemp: num(row[weatherT.fields.airTemp.name]),
        trackTemp: num(row[weatherT.fields.trackTemp.name]),
        humidity: num(row[weatherT.fields.humidity.name]),
        pressure: num(row[weatherT.fields.pressure.name]),
        rainfall: bool(row[weatherT.fields.rainfall.name]),
        windSpeed: num(row[weatherT.fields.windSpeed.name]),
        windDirection: num(row[weatherT.fields.windDirection.name]),
      })),
    [weatherQ.data],
  );

  const trackStatus = useMemo<TrackStatusRow[]>(
    () =>
      rowsOf(statusQ.data).map((row) => ({
        sessionTimeMs: numOr(row[trackStatusT.fields.sessionTimeMs.name], 0),
        status: str(row[trackStatusT.fields.status.name]),
        message: str(row[trackStatusT.fields.message.name]),
      })),
    [statusQ.data],
  );

  const corners = useMemo<CornerRow[]>(
    () =>
      rowsOf(cornersQ.data)
        .map((row) => ({
          cornerNumber: numOr(row[cornersT.fields.cornerNumber.name], 0),
          letter: str(row[cornersT.fields.letter.name]),
          x: numOr(row[cornersT.fields.x.name], Number.NaN),
          y: numOr(row[cornersT.fields.y.name], Number.NaN),
          distanceM: num(row[cornersT.fields.distanceM.name]),
          angle: num(row[cornersT.fields.angle.name]),
        }))
        .filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y)),
    [cornersQ.data],
  );

  /** Official map orientation for the circuit, in degrees; 0 when unknown. */
  const circuitRotation = useMemo(() => {
    const row = rowsOf(cornersQ.data)[0];
    return row ? numOr(row[cornersT.fields.rotation.name], 0) : 0;
  }, [cornersQ.data]);

  const telemetryLaps = useMemo<TelemetryLap[]>(
    () =>
      rowsOf(telemetryIndexQ.data)
        .map((row) => ({
          driverNumber: numOr(row[lapTelemetryT.fields.driverNumber.name], 0),
          lapNumber: numOr(row[lapTelemetryT.fields.lapNumber.name], 0),
        }))
        .filter((t) => t.driverNumber > 0 && t.lapNumber > 0),
    [telemetryIndexQ.data],
  );

  /** driverNumber → the one lap with rich telemetry. */
  const telemetryLapByDriver = useMemo(() => {
    const map = new Map<number, number>();
    telemetryLaps.forEach((t) => map.set(t.driverNumber, t.lapNumber));
    return map;
  }, [telemetryLaps]);

  const isLoading =
    resultsQ.isLoading ||
    lapsQ.isLoading ||
    weatherQ.isLoading ||
    statusQ.isLoading ||
    cornersQ.isLoading ||
    telemetryIndexQ.isLoading;

  const error =
    resultsQ.error ??
    lapsQ.error ??
    weatherQ.error ??
    statusQ.error ??
    cornersQ.error ??
    telemetryIndexQ.error;

  return {
    results,
    resultsLoading: resultsQ.isLoading,
    laps,
    weather,
    trackStatus,
    corners,
    circuitRotation,
    telemetryLapByDriver,
    isLoading,
    error,
  };
}

export type RaceData = ReturnType<typeof useRaceData>;
