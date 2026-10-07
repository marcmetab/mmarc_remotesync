import type { FlowTab } from "../../routes";

/*
 * The Data flow page's view model. Lines is drawn from what was measured and loads nothing; Queries and Parts read
 * ClickHouse watching itself, through three pumpkin_live views over its system tables
 * (clickhouse/pumpkin_live/views/90_ops.sql), polled by src/data/useFlowData.ts.
 */

/** One run of a query Metabase sent to ClickHouse in the last hour (pumpkin_live.ops_queries). */
export type QueryRun = {
  /** When it finished, ISO (UTC). */
  at: string;
  /** The first pumpkin_live view it reads ("fleet_now"). */
  view: string;
  /** Metabase's queryHash: the same question with the same filters always has the same one. */
  hash: string;
  ms: number;
  readRows: number;
  readBytes: number;
  returned: number;
  /** Peak memory, bytes. */
  memory: number;
  /** Data parts and granules (index marks, 8,192 rows each at most) the query had to open. */
  parts: number;
  granules: number;
  /** The SQL Metabase sent, with its comment line, cut at 1,500 characters. */
  sql: string;
};

/** An active part of a pumpkin_raw table (pumpkin_live.ops_parts). */
export type Part = {
  table: string;
  /** partition_minblock_maxblock_level, e.g. "all_407_1029_511". */
  name: string;
  minBlock: number;
  maxBlock: number;
  level: number;
  rows: number;
  bytesOnDisk: number;
  compressed: number;
  uncompressed: number;
};

/** An insert or a merge on the sales table in the last hour (pumpkin_live.ops_part_events). */
export type PartEvent = {
  /** ISO (UTC), to the microsecond. */
  at: string;
  kind: "insert" | "merge";
  /** The part written: the new one, or the merge's result. */
  part: string;
  rows: number;
  bytes: number;
  ms: number;
  /** A merge's input parts. */
  from: string[];
};

/** One live list: its rows (null while the first read is on its way), its error, and when it arrived. */
export type Feed<T> = { rows: T[] | null; error: string | null; receivedAt: number | null };

/** Lines needs nothing; each other tab gets its own lists from its live container (App.tsx). */
export type DataFlowViewModel = { queries?: Feed<QueryRun>; parts?: Feed<Part>; events?: Feed<PartEvent> };

export type { FlowTab };
