/*
 * The van page's trip arithmetic (no JSX): the van's local dates, which trips a period covers, the band's figures,
 * the week groups of the Trips list and the days of the season chart. Times are ISO strings; dates are the hub's
 * local dates ("2026-10-28"), as deliveries.local_date carries them. Every function takes the trips newest first.
 */
import { dayLabel, localDate, time } from "../../format";
import { type Clock, type FaultSeverity, TRUCK_PERIOD, type TruckPeriod, type TruckStatus } from "../../types";
import type { TruckFault, TruckTrip } from "../TruckPage";

const DAY_MS = 864e5;

/* ── Dates ───────────────────────────────────────────────── */

/** The local date of an instant in a zone: "2026-10-28" (UTC when the zone is unknown). */
export function ymdIn(at: string, tz: string): string {
  const d = new Date(at);
  if (Number.isNaN(d.valueOf())) return "";
  try {
    const p: Record<string, string> = {};
    for (const part of new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d)) p[part.type] = part.value;
    return `${p.year}-${p.month}-${p.day}`;
  } catch { return d.toISOString().slice(0, 10); }
}
/** A date some days later (or earlier, negative). */
export const addDays = (ymd: string, days: number) => new Date(localDate(ymd).getTime() + days * DAY_MS).toISOString().slice(0, 10);
/** Whole days from one date to another. */
export const daysBetween = (from: string, to: string) => Math.round((localDate(to).getTime() - localDate(from).getTime()) / DAY_MS);
/** Monday 0 … Sunday 6. */
const weekday = (ymd: string) => (localDate(ymd).getUTCDay() + 6) % 7;
/** "21 Sep" */
const dayMonth = (ymd: string) => dayLabel(localDate(ymd)).split(" ").slice(1).join(" ");

/** The van's today: the clock's date in the van's zone, else the date its trips' days_ago count from. */
export function vanToday(now: string | undefined, tz: string, trips: TruckTrip[] | undefined): string | null {
  if (now) return ymdIn(now, tz) || null;
  const t = trips?.[0];
  return t ? addDays(t.localDate, t.daysAgo) : null;
}
/** Halloween on the van's calendar: today plus the clock's days to go, else 31 October of today's year. */
export const halloweenOf = (today: string, clock?: Clock) =>
  clock?.daysToHalloween != null ? addDays(today, clock.daysToHalloween) : `${today.slice(0, 4)}-10-31`;

/** "12:02" for a moment on the clock's local day, "Mon 26 Oct" for any other day. */
export const whenLabel = (iso: string, now: string | undefined, tz: string) =>
  now && dayLabel(iso, tz) !== dayLabel(now, tz) ? dayLabel(iso, tz) : time(iso, tz);
/** A note is short facts joined by " · "; a short line shows the first one. */
export const firstFact = (note: string | null | undefined) => note?.split(" · ")[0]?.trim() || null;

/* ── Trips ───────────────────────────────────────────────── */

/** On these the van is on the hub → store leg (fleet_now.status). */
export const HEADING: readonly TruckStatus[] = ["loading", "driving", "stopped", "unloading"];
/** deliveries.wave */
export const waveLabel = (wave: number) => wave === 1 ? "Morning" : wave === 2 ? "Midday" : `Wave ${wave}`;
/** Still running: loading, on the road, unloading or on the way back (deliveries.status is not "done"). */
export const isUnderWay = (trip: TruckTrip) => trip.status !== "done";
/** In the period: days_ago inside its span; the season takes every trip. */
export function inPeriod(daysAgo: number, period: TruckPeriod) {
  const span = TRUCK_PERIOD[period].daysAgo;
  return !span || (daysAgo >= span[0] && daysAgo <= span[1]);
}

/** The band's figures over a period's trips. */
export type TripFigures = {
  trips: number;
  /** Trips that reached their store (is_delivered), and of those on time (is_on_time) and late (the rest). */
  delivered: number;
  onTime: number;
  late: number;
  /** units_total and damaged_units of the delivered trips. */
  units: number;
  damaged: number;
  /** km_total of the finished trips plus km_done of any still under way. */
  km: number;
  /** The trip running now, if it is in the period. */
  underWay: TruckTrip | null;
  /** The period's oldest trip. */
  first: TruckTrip | null;
};
export function tripFigures(trips: TruckTrip[]): TripFigures {
  const f: TripFigures = { trips: trips.length, delivered: 0, onTime: 0, late: 0, units: 0, damaged: 0, km: 0, underWay: null, first: trips[trips.length - 1] ?? null };
  for (const t of trips) {
    if (t.isDelivered) {
      f.delivered++;
      if (t.isOnTime) f.onTime++; else f.late++;
      f.units += t.units;
      f.damaged += t.damaged;
    }
    if (isUnderWay(t)) { f.km += t.kmDone; f.underWay ??= t; } else f.km += t.kmTotal;
  }
  return f;
}

/** A week of the Trips list, Monday to Sunday on the van's dates. */
export type WeekGroup = { monday: string; title: string; trips: TruckTrip[] };
/** The trips by week, newest first: "This week", "Last week", then "21 – 27 Sep" or "28 Sep – 4 Oct". */
export function weekGroups(trips: TruckTrip[], today: string | null): WeekGroup[] {
  const thisWeek = today ? addDays(today, -weekday(today)) : null;
  const groups: WeekGroup[] = [];
  for (const trip of trips) {
    const monday = addDays(trip.localDate, -weekday(trip.localDate));
    let group = groups.find(g => g.monday === monday);
    if (!group) {
      const sunday = addDays(monday, 6);
      const ago = thisWeek ? daysBetween(monday, thisWeek) / 7 : null;
      const [from, to] = [dayMonth(monday), dayMonth(sunday)];
      const range = from.split(" ")[1] === to.split(" ")[1] ? `${from.split(" ")[0]} – ${to}` : `${from} – ${to}`;
      group = { monday, title: ago === 0 ? "This week" : ago === 1 ? "Last week" : range, trips: [] };
      groups.push(group);
    }
    group.trips.push(trip);
  }
  return groups.sort((a, b) => (a.monday < b.monday ? 1 : -1));
}

/* ── The season chart ────────────────────────────────────── */

/** One column of the season chart: a local day from the season's start to Halloween. */
export type SeasonDay = {
  date: string;
  /** Days before today; negative after it. */
  daysAgo: number;
  /** After today: a dashed stub. */
  future: boolean;
  /** The day's trips (usually one), newest first. */
  trips: TruckTrip[];
  /** Faults raised that day (truck_faults.raised_at on the van's dates), and the worst severity among them. */
  faults: TruckFault[];
  fault: FaultSeverity | null;
};

/**
 * The season by day: from the earlier of the van's first trip and Halloween − 60 days, to Halloween (or today, or
 * the last trip, when either is later).
 */
export function seasonDays(trips: TruckTrip[], faults: TruckFault[], today: string, halloween: string, tz: string): SeasonDay[] {
  const first = trips[trips.length - 1]?.localDate;
  const opens = addDays(halloween, -60);
  const start = first && first < opens ? first : opens;
  const last = trips[0]?.localDate ?? today;
  const end = [halloween, today, last].sort()[2];
  const days: SeasonDay[] = [];
  const count = daysBetween(start, end) + 1;
  for (let i = 0; i < count; i++) {
    const date = addDays(start, i);
    days.push({ date, daysAgo: daysBetween(date, today), future: date > today, trips: [], faults: [], fault: null });
  }
  const at = (date: string) => days[daysBetween(start, date)];
  for (const trip of trips) at(trip.localDate)?.trips.push(trip);
  for (const fault of faults) {
    const day = fault.raisedAt ? at(ymdIn(fault.raisedAt, tz)) : undefined;
    if (!day) continue;
    day.faults.push(fault);
    day.fault = day.fault === "critical" || fault.severity === "critical" ? "critical" : "warning";
  }
  return days;
}
