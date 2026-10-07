import { useCallback, useEffect, useRef } from "react";

/*
 * What every live hook shares: polling, keeping the last good result on screen, and reading values.
 *
 * The SDK's `useMetabaseQuery` answers { data, isLoading, error, refetch }. While a refetch runs, and after
 * one fails, it has no data (a failed refetch replaces data with the error). `useLive` wraps that result:
 * it remembers the last data that arrived for the same request (`key`) and keeps returning it, so a page
 * never blanks during a poll or after a hiccup. It remembers it for the session too (CACHE): a page left and
 * opened again (every navigation mounts the page anew) shows its last data at once while the SDK fetches it
 * again behind it, rather than starting from nothing. A refresh behind data on screen (a poll, that mount) is
 * quiet: only one the viewer asked for (a retry) reports `refreshing`, which dims the part. An error only reaches the page when there is nothing to show,
 * and only after the query has been tried again up to three times (RETRY_MS): a page starts all its queries
 * at once, and Metabase can briefly run out of connections to the database ("ResourcePool could not acquire a
 * resource"); a try a few seconds later usually gets one.
 */

/** The part of a `useMetabaseQuery` result this file needs. */
type QueryResultLike<D> = { data: D | null; isLoading: boolean; error: unknown; refetch: () => Promise<void> };

export type Live<D> = {
  /** The latest data, or the last good data for this request while a refetch runs or after it failed. */
  data: D | null;
  /** Only set when there is no data to show. */
  error: string | null;
  /** True while a refetch the viewer asked for (`refetch`, a retry) runs behind data already on screen. */
  refreshing: boolean;
  /** Client time (Date.now()) when `data` arrived; null while there is none. */
  receivedAt: number | null;
  /** Runs the query again now (the viewer's retry: the part shows `refreshing` until it lands). */
  refetch: () => void;
};

/** What a page hook returns: the page's view model, whether a refetch runs behind it, and a retry. */
export type LivePage<VM> = { vm: VM; refreshing: boolean; retry: () => void };

/** Milliseconds between polls, by page (the clock has its own; the Business page's live sales poll faster; flow: Data flow's Queries and Parts, one simulator tick). */
export const POLL = { clock: 30_000, fleet: 20_000, stores: 60_000, business: 120_000, pulse: 10_000, flow: 15_000 } as const;

/**
 * A query that fails with nothing on screen is tried again after each of these delays (give or take a quarter,
 * so a page's failed queries do not all come back at once) before its error shows.
 */
const RETRY_MS = [2_000, 5_000, 10_000] as const;

const errorText = (error: unknown, what: string) => {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : null;
  return raw ? `Could not load ${what}: ${raw.length > 140 ? `${raw.slice(0, 140)}…` : raw}` : `Could not load ${what}`;
};

const isHidden = () => {
  try { return typeof document !== "undefined" && document.hidden === true; } catch { return false; }
};

/**
 * The last good data of every request this session, by its label and key (`what` and `key` together name one query
 * with its filters), with when it arrived; the oldest go past CACHE_MAX. Read when a page mounts, written as data arrives.
 */
const CACHE = new Map<string, { data: unknown; at: number }>();
const CACHE_MAX = 120;
function remember(id: string, data: unknown, at: number) {
  CACHE.delete(id);
  CACHE.set(id, { data, at });
  if (CACHE.size > CACHE_MAX) CACHE.delete(CACHE.keys().next().value as string);
}

/**
 * Keeps the last good data of a query for the same `key` (for the session: CACHE), and polls it every `everyMs`
 * (0 = never). Polls skip while the document is hidden and catch up as soon as it is visible again. A failure with
 * nothing to show is retried (RETRY_MS) while the part stays loading; the error reaches the page after the last try.
 */
export function useLive<D>(result: QueryResultLike<D>, key: string, everyMs: number, what: string): Live<D> {
  const id = `${what}|${key}`;
  // The SDK keeps the previous filter's result until the new filter's lands: a result object is this key's data only
  // if it arrived under this key (else a van's page could show the van asked about before it, and cache it as this one).
  const seen = useRef<{ key: string; data: D } | null>(null);
  if (result.data != null && seen.current?.data !== result.data) seen.current = { key, data: result.data };
  const fresh = result.data != null && seen.current?.key === key ? result.data : null;
  const last = useRef<{ key: string; data: D; at: number } | null>(null);
  // A new result object is new data: note when it arrived (the same object on a re-render keeps its time).
  if (fresh != null && (last.current?.data !== fresh || last.current.key !== key)) {
    last.current = { key, data: fresh, at: Date.now() };
    remember(id, fresh, last.current.at);
  }
  // Nothing yet for this key on this mount: the session's last data for it, if any.
  if (!last.current || last.current.key !== key) {
    const cached = CACHE.get(id);
    if (cached) last.current = { key, data: cached.data as D, at: cached.at };
  }
  const kept = last.current && last.current.key === key ? last.current : null;
  const data = fresh ?? kept?.data ?? null;

  // The interval reads the latest refetch through a ref, so it is set up once per key.
  const refetchRef = useRef(result.refetch);
  refetchRef.current = result.refetch;
  const inFlight = useRef(false);
  const poll = useCallback(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    refetchRef.current().catch(() => { /* the hook reports it through `error` */ }).finally(() => { inFlight.current = false; });
  }, []);
  // A refetch the viewer asked for: shown as `refreshing` until the query is done.
  const asked = useRef(false);
  if (asked.current && !result.isLoading && !inFlight.current) asked.current = false;
  const refetch = useCallback(() => { asked.current = true; poll(); }, [poll]);

  // A failure with nothing to show: try again (the part keeps loading) before the page sees the error.
  const tries = useRef({ key, count: 0 });
  if (tries.current.key !== key) tries.current = { key, count: 0 };
  if (fresh != null) tries.current.count = 0;
  const failed = data == null && result.error != null && !result.isLoading;
  const attempt = tries.current.count;
  const retrying = failed && attempt < RETRY_MS.length;
  useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => { tries.current.count = attempt + 1; poll(); }, RETRY_MS[attempt] * (0.75 + Math.random() * 0.5));
    return () => clearTimeout(id);
  }, [retrying, attempt, key, poll]);

  useEffect(() => {
    if (!everyMs) return;
    let stale = false;
    const id = setInterval(() => {
      if (isHidden()) { stale = true; return; }
      poll();
    }, everyMs);
    const onVisible = () => {
      if (!isHidden() && stale) { stale = false; poll(); }
    };
    let listening = false;
    try { document.addEventListener("visibilitychange", onVisible); listening = true; } catch { /* not available here */ }
    return () => {
      clearInterval(id);
      if (listening) try { document.removeEventListener("visibilitychange", onVisible); } catch { /* ignore */ }
    };
  }, [everyMs, key, poll]);
  // A query that starts polling again (its period picked: the hour queries fetched ahead are kept but idle) fetches
  // at once, quietly, rather than a whole interval later. Not on mount: the SDK fetches then.
  const pollingWas = useRef(everyMs);
  useEffect(() => {
    const was = pollingWas.current;
    pollingWas.current = everyMs;
    if (everyMs && !was && !isHidden()) poll();
  }, [everyMs, poll]);

  return {
    data,
    error: failed && !retrying ? errorText(result.error, what) : null,
    refreshing: asked.current && result.isLoading && data != null,
    receivedAt: data != null ? kept?.at ?? null : null,
    refetch,
  };
}

/* ── Reading values ──────────────────────────────────────── */

type Cell = unknown;
/** A number, or 0 for null and anything unparsable (sums of nothing). */
export const n0 = (v: Cell): number => {
  const x = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(x) ? x : 0;
};
/** A number, or null. */
export const nOrNull = (v: Cell): number | null => {
  if (v == null || v === "") return null;
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : null;
};
/** A string, or null. */
export const sOrNull = (v: Cell): string | null => v == null ? null : String(v);
/** A timestamp as an ISO string, or null. */
export const iso = (v: Cell): string | null => {
  if (v == null || v === "") return null;
  if (v instanceof Date) return Number.isNaN(v.valueOf()) ? null : v.toISOString();
  return String(v);
};
/** A date column ("2026-10-04" or "2026-10-04T00:00:00Z") as "2026-10-04". */
export const ymd = (v: Cell): string => (iso(v) ?? "").slice(0, 10);
/** Booleans come back as true/false (sometimes 1/0 or strings). */
export const bool = (v: Cell): boolean => v === true || v === 1 || v === "true" || v === "1";
/** A value that must be one of a closed set, else null. */
export const oneOf = <T extends string>(v: Cell, allowed: readonly T[]): T | null => (allowed as readonly unknown[]).includes(v) ? v as T : null;

/**
 * The rows of an aggregated query as objects keyed by the names given here, in the query's column order:
 * its breakouts, then its aggregations. This SDK cannot name aggregations, so two sums would both be called
 * "sum"; reading by position (checked against the column count) is the reliable way.
 */
export function positional<K extends string>(data: { columns: unknown[]; rawRows: unknown[][] } | null, names: readonly K[]): Record<K, Cell>[] | null {
  if (!data) return null;
  if (data.columns.length !== names.length) throw new Error(`expected ${names.length} columns, got ${data.columns.length}`);
  return data.rawRows.map(raw => Object.fromEntries(names.map((name, i) => [name, raw[i]])) as Record<K, Cell>);
}

/** Metabase's row cap for aggregated queries (10,000) and for plain row lists (2,000): a result that long was cut off. */
export const ROW_CAP = { aggregated: 10_000, rows: 2_000 } as const;
/** Throws when a result hit the row cap, so the part that reads it fails instead of showing partial sums. */
export function whole<D extends { rowCount: number | null; rawRows: unknown[][] } | null>(data: D, cap: number): D {
  const count = data ? data.rowCount ?? data.rawRows.length : 0;
  if (count >= cap) throw new Error(`the result was cut off at ${count.toLocaleString("en-US")} rows`);
  return data;
}

/** Runs `read`, turning a thrown error into an error message, so one bad result fails its part, not the page. */
export function safely<T>(read: () => T, what: string): { value: T | null; error: string | null } {
  try { return { value: read(), error: null }; } catch (e) { return { value: null, error: errorText(e, what) }; }
}
