import type { Clock } from "../types";

/**
 * What the shell shows before live data is wired: the mockups' clock (Wed 28 Oct, 18:20 UTC, three days
 * before Halloween) and six late vans. Live: `clock` maps from sim_status (sim_now, mode,
 * days_to_halloween) and `lateVans` from hub_now (sum of vans_late).
 */
export const shellFixture: { clock: Clock; lateVans: number; footnote: string } = {
  clock: { now: "2026-10-28T18:20:00Z", mode: "live", daysToHalloween: 3 },
  lateVans: 6,
  footnote: "Mock data · simulated clock",
};
