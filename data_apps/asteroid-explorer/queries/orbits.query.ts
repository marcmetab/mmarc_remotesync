import { defineQuery, filter, orderBy } from "@metabase/embedding-sdk-react/data-app";

import schema from "../src/metabase.data";

const neo = schema.tables.astNeoOrbits;
const approaches = schema.tables.astCloseApproaches;
const torino = schema.tables.astTorinoHistory;

const orbitFields = [
  neo.fields.spkid,
  neo.fields.designation,
  neo.fields.fullName,
  neo.fields.aAu,
  neo.fields.e,
  neo.fields.iDeg,
  neo.fields.nodeDeg,
  neo.fields.periDeg,
  neo.fields.meanAnomalyDeg,
  neo.fields.meanMotionDegDay,
  neo.fields.epochJd,
];

// The default 3D point cloud: every potentially hazardous asteroid (~2,550).
// Metabase returns at most 2,000 rows per query, so the set is split by discovery year
// (about 900 before 2008 and 1,650 since).
export const HazardousOrbitsBefore2008 = defineQuery({
    source: neo,
    fields: orbitFields,
    filters: [filter(neo.fields.isPha, "=", 1), filter(neo.fields.discoveryYear, "<", 2008)],
    orderBys: [orderBy(neo.fields.spkid, "asc")],
    savedQuestionSourceId: 371
});

export const HazardousOrbitsSince2008 = defineQuery({
    source: neo,
    fields: orbitFields,
    filters: [filter(neo.fields.isPha, "=", 1), filter(neo.fields.discoveryYear, ">=", 2008)],
    orderBys: [orderBy(neo.fields.spkid, "asc")],
    savedQuestionSourceId: 372
});

// Everything a sleeve needs about one asteroid; the app filters by designation at runtime.
// Also serves search (name contains …), so any of the 42k near-Earth asteroids can be picked.
export const NeoDetails = defineQuery({
    source: neo,
    fields: [
        ...orbitFields,
        neo.fields.name,
        neo.fields.orbitClass,
        neo.fields.isPha,
        neo.fields.discoveryYear,
        neo.fields.periodYears,
        neo.fields.moidAu,
        neo.fields.absMagnitudeH,
        neo.fields.diameterKm,
        neo.fields.nObsUsed,
        neo.fields.onRiskList,
        neo.fields.torinoMax,
        neo.fields.palermoCum,
        neo.fields.impactProbability,
        neo.fields.impactYearRange,
    ],
    orderBys: [orderBy(neo.fields.absMagnitudeH, "asc")],
    savedQuestionSourceId: 373
});

// JPL close approaches (< 0.05 AU, 1900-2200); filtered to one asteroid at runtime.
export const CloseApproaches = defineQuery({
    source: approaches,
    fields: [
        approaches.fields.des,
        approaches.fields.approachAt,
        approaches.fields.distLunar,
        approaches.fields.distKm,
        approaches.fields.vRelKms,
    ],
    orderBys: [orderBy(approaches.fields.approachAt, "asc")],
    savedQuestionSourceId: 374
});

// Hand-made timeline of notable Torino ratings; filtered to one asteroid at runtime.
export const TorinoHistory = defineQuery({
    source: torino,
    fields: [torino.fields.des, torino.fields.eventDate, torino.fields.torino, torino.fields.event],
    orderBys: [orderBy(torino.fields.eventDate, "asc")],
    savedQuestionSourceId: 375
});
