import { useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useMemo } from "react";
import { Countries, LateVans, SimStatus } from "../../queries/live.query";
import type { Clock } from "../types";
import { type Visible, visibleFrom } from "../visible";
import { iso, n0, nOrNull, POLL, positional, useLive } from "./live";

/**
 * The shell's live parts: the clock pill and the Business banner chip (sim_status: sim_now, mode,
 * days_to_halloween) and the late dot on Harvest & fleet (fleet_now: count where is_late), both polled every
 * 30 s; and the countries the viewer may see (countries, read once: src/visible.ts).
 */
export function useShellData(): { clock?: Clock; lateVans: number; visible: Visible } {
  const sim = useLive(useMetabaseQuery(SimStatus), "sim", POLL.clock, "the clock");
  const late = useLive(useMetabaseQuery(LateVans), "late", POLL.clock, "late vans");
  const countries = useLive(useMetabaseQuery(Countries), "countries", 0, "the countries");

  const row = sim.data?.rows[0];
  const now = row ? iso(row.sim_now) : null;
  const mode = row?.mode === "live" ? "live" : "shifted";
  const days = row ? nOrNull(row.days_to_halloween) : null;
  // One object per reading, so the pages only re-render when the clock moves.
  const clock = useMemo((): Clock | undefined => now ? { now, mode, daysToHalloween: days } : undefined, [now, mode, days]);

  let lateVans = 0;
  try { lateVans = n0(positional(late.data, ["count"] as const)?.[0]?.count); } catch { /* no dot */ }
  // One string per answer, so the set (and everything that reads it) only changes when the countries do.
  const codes = countries.data?.rows.map(r => String(r.country_code)).join(",");
  const visible = useMemo(() => visibleFrom(codes?.split(",")), [codes]);
  return { clock, lateVans, visible };
}
