/**
 * Telemetry reads.
 *
 * `lap_telemetry` carries the rich channels — distance, x/y, and the three
 * g-force axes — but only for one lap per driver (each driver's personal best).
 * `car_telemetry` and `position_data` are sampled across the whole session but
 * carry no distance or g-force, so they back the race-wide views instead.
 *
 * None of these declare a static `limit`: the hook supplies the session /
 * driver / time filters, and a static limit would truncate rows before those
 * filters ever run.
 */
import {
  aggregations,
  breakout,
  defineQuery,
  orderBy,
} from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/metabase.data";

const lapTelemetry = schema.tables.lapTelemetry;
const carTelemetry = schema.tables.carTelemetry;
const positionData = schema.tables.positionData;

/**
 * Which (driver, lap) pairs have rich telemetry — one lap per driver.
 *
 * Grouped, not a row dump: the raw table holds ~14k rows per session, well over
 * the result-row cap, so selecting rows silently returned only the first few
 * drivers. The breakouts collapse it to one row per driver.
 */
export const TelemetryLapIndex = defineQuery({
    source: lapTelemetry,
    aggregations: [aggregations.count()],
    breakouts: [
        breakout(lapTelemetry.fields.sessionId),
        breakout(lapTelemetry.fields.driverNumber),
        breakout(lapTelemetry.fields.lapNumber),
    ],
    orderBys: [orderBy(lapTelemetry.fields.driverNumber, "asc")],
    savedQuestionSourceId: 387
});

/** Full channel set for one driver's telemetry lap — the scrubber's source. */
export const DriverLapTelemetry = defineQuery({
    source: lapTelemetry,
    fields: [
        lapTelemetry.fields.sessionId,
        lapTelemetry.fields.driverNumber,
        lapTelemetry.fields.lapNumber,
        lapTelemetry.fields.sample,
        lapTelemetry.fields.sessionTimeMs,
        lapTelemetry.fields.timeInLapMs,
        lapTelemetry.fields.distanceM,
        lapTelemetry.fields.relDistance,
        lapTelemetry.fields.speed,
        lapTelemetry.fields.rpm,
        lapTelemetry.fields.gear,
        lapTelemetry.fields.throttle,
        lapTelemetry.fields.brake,
        lapTelemetry.fields.drs,
        lapTelemetry.fields.x,
        lapTelemetry.fields.y,
        lapTelemetry.fields.gLong,
        lapTelemetry.fields.gLat,
        lapTelemetry.fields.gTotal,
        lapTelemetry.fields.cornerNumber,
    ],
    orderBys: [orderBy(lapTelemetry.fields.sample, "asc")],
    savedQuestionSourceId: 381
});

/**
 * Speed / throttle / brake against lap distance — rendered by Metabase.
 *
 * No longer used: the driver page now draws its own trace, tied to the
 * scrubber. Kept until that build is deployed, because removing the definition
 * makes sync trash this card while the live build still renders it.
 */
export const DriverLapTrace = defineQuery({
    source: lapTelemetry,
    fields: [
        lapTelemetry.fields.sessionId,
        lapTelemetry.fields.driverNumber,
        lapTelemetry.fields.lapNumber,
        lapTelemetry.fields.distanceM,
        lapTelemetry.fields.speed,
        lapTelemetry.fields.throttle,
        lapTelemetry.fields.brake,
    ],
    orderBys: [orderBy(lapTelemetry.fields.distanceM, "asc")],
    savedQuestionSourceId: 382
});

/** X/Y of a single reference lap, used to draw the circuit outline. */
export const TrackOutline = defineQuery({
    source: lapTelemetry,
    fields: [
        lapTelemetry.fields.sessionId,
        lapTelemetry.fields.driverNumber,
        lapTelemetry.fields.lapNumber,
        lapTelemetry.fields.sample,
        lapTelemetry.fields.x,
        lapTelemetry.fields.y,
    ],
    orderBys: [orderBy(lapTelemetry.fields.sample, "asc")],
    savedQuestionSourceId: 383
});

/** Every car's position in a narrow time window — the track map's dots. */
export const FieldPositions = defineQuery({
    source: positionData,
    fields: [
        positionData.fields.sessionId,
        positionData.fields.driverNumber,
        positionData.fields.sessionTimeMs,
        positionData.fields.x,
        positionData.fields.y,
        positionData.fields.onTrack,
    ],
    orderBys: [orderBy(positionData.fields.sessionTimeMs, "asc")],
    savedQuestionSourceId: 384
});

/** Speed / RPM / throttle / brake / DRS for one car at one moment. */
export const CarTelemetryAt = defineQuery({
    source: carTelemetry,
    fields: [
        carTelemetry.fields.sessionId,
        carTelemetry.fields.driverNumber,
        carTelemetry.fields.sessionTimeMs,
        carTelemetry.fields.speed,
        carTelemetry.fields.rpm,
        carTelemetry.fields.gear,
        carTelemetry.fields.throttle,
        carTelemetry.fields.brake,
        carTelemetry.fields.drs,
    ],
    orderBys: [orderBy(carTelemetry.fields.sessionTimeMs, "asc")],
    savedQuestionSourceId: 385
});
