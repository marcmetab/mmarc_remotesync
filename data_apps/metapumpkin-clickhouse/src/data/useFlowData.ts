import { useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useMemo } from "react";
import { OpsParts, OpsQueries, OpsSaleEvents } from "../../queries/flow.query";
import type { DataFlowViewModel, Part, PartEvent, QueryRun } from "../pages/flow/types";
import { iso, type LivePage, n0, POLL, ROW_CAP, safely, sOrNull, useLive, whole } from "./live";

/*
 * Data flow's Queries and Parts tabs: the pumpkin_live.ops_* views, polled every 15 s (one tick of the simulator, so
 * each poll on Parts brings about one insert and one merge). Only the open tab's hook runs (App.tsx). A list that
 * hits Metabase's 2,000-row cap fails rather than showing a part of the hour.
 */

export function useFlowQueries(): LivePage<DataFlowViewModel> {
  const q = useLive(useMetabaseQuery(OpsQueries), "ops-queries", POLL.flow, "the query log");
  const runs = useMemo(() => safely(() => whole(q.data, ROW_CAP.rows)?.rows.map((r): QueryRun => ({
    at: iso(r.ran_at) ?? "",
    view: sOrNull(r.view_name) ?? "",
    hash: sOrNull(r.query_hash) ?? "",
    ms: n0(r.duration_ms),
    readRows: n0(r.read_rows),
    readBytes: n0(r.read_bytes),
    returned: n0(r.result_rows),
    memory: n0(r.memory_bytes),
    parts: n0(r.selected_parts),
    granules: n0(r.selected_granules),
    sql: sOrNull(r.sql_text) ?? "",
  })) ?? null, "the query log"), [q.data]);
  return {
    vm: { queries: { rows: runs.value, error: q.error ?? runs.error, receivedAt: q.receivedAt } },
    refreshing: q.refreshing,
    retry: q.refetch,
  };
}

export function useFlowParts(): LivePage<DataFlowViewModel> {
  const p = useLive(useMetabaseQuery(OpsParts), "ops-parts", POLL.flow, "the parts");
  const e = useLive(useMetabaseQuery(OpsSaleEvents), "ops-events", POLL.flow, "the merges");
  const parts = useMemo(() => safely(() => whole(p.data, ROW_CAP.rows)?.rows.map((r): Part => ({
    table: sOrNull(r.table_name) ?? "",
    name: sOrNull(r.part_name) ?? "",
    minBlock: n0(r.min_block_number),
    maxBlock: n0(r.max_block_number),
    level: n0(r.level),
    rows: n0(r.rows),
    bytesOnDisk: n0(r.bytes_on_disk),
    compressed: n0(r.data_compressed_bytes),
    uncompressed: n0(r.data_uncompressed_bytes),
  })) ?? null, "the parts"), [p.data]);
  const events = useMemo(() => safely(() => whole(e.data, ROW_CAP.rows)?.rows.map((r): PartEvent => {
    const from = sOrNull(r.merged_from) ?? "";
    return {
      at: iso(r.event_at) ?? "",
      kind: r.event_type === "MergeParts" ? "merge" : "insert",
      part: sOrNull(r.part_name) ?? "",
      rows: n0(r.rows),
      bytes: n0(r.size_in_bytes),
      ms: n0(r.duration_ms),
      from: from ? from.split(" + ") : [],
    };
  }) ?? null, "the merges"), [e.data]);
  return {
    vm: {
      parts: { rows: parts.value, error: p.error ?? parts.error, receivedAt: p.receivedAt },
      events: { rows: events.value, error: e.error ?? events.error, receivedAt: e.receivedAt },
    },
    refreshing: p.refreshing || e.refreshing,
    retry: () => { p.refetch(); e.refetch(); },
  };
}
