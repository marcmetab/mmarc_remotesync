/**
 * Session-scoped reference data.
 *
 * These tables are small once scoped to a session (20 results, ~1.1k laps,
 * 157 weather samples, 15 corners), so the app fetches each one once and does
 * all lap-by-lap scrubbing in React rather than refetching per frame.
 *
 * None of the session-scoped queries declare a static `limit`: it would cut
 * rows across every loaded session before the hook's session filter runs, and
 * the tables have outgrown any fixed number (349 corner rows across 19
 * sessions dropped Bahrain's turns 13–15 at a limit of 200).
 */
import {
  defineQuery,
  filter,
  orderBy,
} from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/metabase.data";

const sessions = schema.tables.sessions420;
const results = schema.tables.results;
const laps = schema.tables.laps;
const weather = schema.tables.weather;
const trackStatus = schema.tables.trackStatus;
const circuitCorners = schema.tables.circuitCorners;

/** Every loaded session — drives the session picker. */
export const SessionList = defineQuery({
    source: sessions,
    /**
     * Races only — the app is a race-replay and telemetry view, so practice and
     * qualifying sessions are excluded.
     *
     * Excluding by name rather than listing the two wanted values keeps
     * "Sprint Qualifying" out: it is a qualifying session that sets the sprint
     * grid, not a race, and an inclusion list would have to be extended for
     * every future race-session spelling. What survives today is `Race` (23)
     * and `Sprint` (6), out of 66 loaded sessions.
     */
    filters: [
        filter(sessions.fields.sessionName, "does-not-contain", "Practice"),
        filter(sessions.fields.sessionName, "does-not-contain", "Qualifying"),
    ],
    fields: [
        sessions.fields.sessionId,
        sessions.fields.year,
        sessions.fields.round,
        sessions.fields.eventName,
        sessions.fields.officialName,
        sessions.fields.sessionName,
        sessions.fields.location,
        sessions.fields.country,
        sessions.fields.startUtc,
    ],
    orderBys: [
        orderBy(sessions.fields.year, "desc"),
        orderBy(sessions.fields.round, "asc"),
        orderBy(sessions.fields.sessionNumber, "asc"),
    ],
    limit: 200,
    savedQuestionSourceId: 376
});

/** Classification + driver identity. Session is filtered at the hook. */
export const SessionResults = defineQuery({
    source: results,
    fields: [
        results.fields.sessionId,
        results.fields.driverNumber,
        results.fields.abbreviation,
        results.fields.fullName,
        results.fields.broadcastName,
        results.fields.countryCode,
        results.fields.teamName,
        results.fields.teamColor,
        results.fields.headshotUrl,
        results.fields.position,
        results.fields.classifiedPosition,
        results.fields.gridPosition,
        results.fields.points,
        results.fields.status,
        results.fields.raceTimeMs,
    ],
    orderBys: [orderBy(results.fields.position, "asc")],
    savedQuestionSourceId: 377
});

/**
 * Every lap of every driver. Ordered by session so the default session's laps
 * survive the row cap; the hook narrows to one session.
 */
export const SessionLaps = defineQuery({
    source: laps,
    fields: [
        laps.fields.sessionId,
        laps.fields.driverNumber,
        laps.fields.driver,
        laps.fields.team,
        laps.fields.lapNumber,
        laps.fields.position,
        laps.fields.lapTimeMs,
        laps.fields.sector1Ms,
        laps.fields.sector2Ms,
        laps.fields.sector3Ms,
        laps.fields.speedSt,
        laps.fields.compound,
        laps.fields.tyreLife,
        laps.fields.freshTyre,
        laps.fields.stint,
        laps.fields.lapStartMs,
        laps.fields.lapEndMs,
        laps.fields.pitInMs,
        laps.fields.pitOutMs,
        laps.fields.isPersonalBest,
        laps.fields.trackStatus,
    ],
    orderBys: [
        orderBy(laps.fields.sessionId, "asc"),
        orderBy(laps.fields.lapNumber, "asc"),
        orderBy(laps.fields.position, "asc"),
    ],
    savedQuestionSourceId: 378
});

/** Weather samples across the session (~1 per minute). */
export const SessionWeather = defineQuery({
    source: weather,
    fields: [
        weather.fields.sessionId,
        weather.fields.sessionTimeMs,
        weather.fields.airTemp,
        weather.fields.trackTemp,
        weather.fields.humidity,
        weather.fields.pressure,
        weather.fields.rainfall,
        weather.fields.windSpeed,
        weather.fields.windDirection,
    ],
    orderBys: [orderBy(weather.fields.sessionTimeMs, "asc")],
    savedQuestionSourceId: 379
});

/** Flag / safety-car state changes. */
export const SessionTrackStatus = defineQuery({
    source: trackStatus,
    fields: [
        trackStatus.fields.sessionId,
        trackStatus.fields.sessionTimeMs,
        trackStatus.fields.status,
        trackStatus.fields.message,
    ],
    orderBys: [orderBy(trackStatus.fields.sessionTimeMs, "asc")],
    savedQuestionSourceId: 380
});

/**
 * Numbered corners, for the track map. `rotation` is the circuit's official
 * map orientation (degrees), the same for every row of a session.
 */
export const SessionCorners = defineQuery({
    source: circuitCorners,
    fields: [
        circuitCorners.fields.sessionId,
        circuitCorners.fields.cornerNumber,
        circuitCorners.fields.letter,
        circuitCorners.fields.x,
        circuitCorners.fields.y,
        circuitCorners.fields.distanceM,
        circuitCorners.fields.angle,
        circuitCorners.fields.rotation,
    ],
    orderBys: [orderBy(circuitCorners.fields.cornerNumber, "asc")],
    savedQuestionSourceId: 386
});
