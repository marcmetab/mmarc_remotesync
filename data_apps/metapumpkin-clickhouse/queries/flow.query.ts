import { defineQuery, filter, orderBy } from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/live.metabase.data";

/*
 * The Data flow page's live tabs: ClickHouse watching itself, through three pumpkin_live views over its system
 * tables (clickhouse/pumpkin_live/views/90_ops.sql). Each covers the last hour, or now; the page filters nothing.
 * Read by src/data/useFlowData.ts.
 */

const t = schema.tables;

/** ops_queries: every query Metabase ran on pumpkin_live in the last hour, newest first, one row per run. */
export const OpsQueries = defineQuery({
    source: t.opsQueries,
    orderBys: [orderBy(t.opsQueries.fields.ranAt, "desc")],
    limit: 2000,
    savedQuestionSourceId: 480
});

/** ops_parts: the active parts of every pumpkin_raw table. */
export const OpsParts = defineQuery({
    source: t.opsParts,
    limit: 2000,
    savedQuestionSourceId: 481
});

/** ops_part_events: the sales table's inserts and merges in the last hour, oldest first. */
export const OpsSaleEvents = defineQuery({
    source: t.opsPartEvents,
    filters: [filter(t.opsPartEvents.fields.tableName, "=", "pumpkin_feed_sale")],
    orderBys: [orderBy(t.opsPartEvents.fields.eventAt, "asc")],
    limit: 2000,
    savedQuestionSourceId: 482
});
