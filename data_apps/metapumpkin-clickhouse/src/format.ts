/**
 * Number, time and label formats used across the app. Every helper takes null / undefined / NaN and
 * returns an em dash, so a loading or missing value never prints "NaN". Negatives use a true minus (−).
 */

const DASH = "—";
const MINUS = "−";
type Num = number | null | undefined;
const ok = (v: Num): v is number => typeof v === "number" && Number.isFinite(v);
const grouped = (v: number, digits = 0) => v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const signed = (v: number, body: string) => (v < 0 ? MINUS : "") + body;

/** Compact USD: $612.0k · $2.14M · $940. `kDigits` 2 gives $1.94k. */
export function money(value: Num, kDigits = 1): string {
  if (!ok(value)) return DASH;
  const a = Math.abs(value);
  // Switch to M where the k form would round up to "1000.0k".
  if (a >= 1e6 - 0.5 * 10 ** (3 - kDigits)) return signed(value, `$${(a / 1e6).toFixed(2)}M`);
  if (a >= 1e3) return signed(value, `$${(a / 1e3).toFixed(kDigits)}k`);
  return signed(value, `$${grouped(Math.round(a))}`);
}
/** Whole USD with thousands separators: $1,940 · $2,881. */
export const dollars = (value: Num) => ok(value) ? signed(value, `$${grouped(Math.round(Math.abs(value)))}`) : DASH;
/** A unit price: $6.38. */
export const price = (value: Num) => ok(value) ? signed(value, `$${grouped(Math.abs(value), 2)}`) : DASH;
/** A whole number with thousands separators: 95,925. */
export const int = (value: Num) => ok(value) ? signed(Math.round(value), grouped(Math.abs(Math.round(value)))) : DASH;
/** A decimal: num(1.9, 1) → "1.9". */
export const num = (value: Num, digits = 1) => ok(value) ? signed(value, grouped(Math.abs(value), digits)) : DASH;

/** A share from a ratio: pct(0.685, 1) → "68.5%", pct(0.65) → "65%". */
export const pct = (ratio: Num, digits = 0) => ok(ratio) ? signed(ratio, `${(Math.abs(ratio) * 100).toFixed(digits)}%`) : DASH;
/** A change from a ratio, always signed: +6.4% · −1.4% · ±0.0%. */
export function signedPct(ratio: Num, digits = 1): string {
  if (!ok(ratio)) return DASH;
  const v = Number((ratio * 100).toFixed(digits));
  return `${v > 0 ? "+" : v < 0 ? MINUS : "±"}${Math.abs(v).toFixed(digits)}%`;
}
/** A change in percentage points from a ratio difference: signedPts(-0.032) → "−3.2 pts". */
export function signedPts(diff: Num, digits = 1): string {
  if (!ok(diff)) return DASH;
  const v = Number((diff * 100).toFixed(digits));
  return `${v > 0 ? "+" : v < 0 ? MINUS : "±"}${Math.abs(v).toFixed(digits)} pts`;
}
/** actual / base − 1, or null when there is no base (so the formats above print a dash). */
export const change = (actual: Num, base: Num) => ok(actual) && ok(base) && base !== 0 ? actual / base - 1 : null;
/** a / b, or null when b is zero or missing. */
export const share = (a: Num, b: Num) => ok(a) && ok(b) && b !== 0 ? a / b : null;

/** Minutes as a duration: 25 min · 1 h 25 m · 2 h. */
export function duration(minutes: Num): string {
  if (!ok(minutes)) return DASH;
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  return m % 60 ? `${Math.floor(m / 60)} h ${m % 60} m` : `${m / 60} h`;
}
/** "Late · 1 h 25 m": the words on a late chip. */
export const lateLabel = (minutes: Num) => `Late · ${duration(minutes)}`;

export const km = (value: Num) => ok(value) ? `${int(value)} km` : DASH;
export const kg = (value: Num) => ok(value) ? `${int(value)} kg` : DASH;
/** 17.8 °C */
export const tempC = (value: Num, digits = 1) => ok(value) ? `${num(value, digits)} °C` : DASH;
/** plural(1, "van") → "1 van", plural(3, "van") → "3 vans". */
export const plural = (n: number, one: string, many = `${one}s`) => `${int(n)} ${n === 1 ? one : many}`;

/* ---- Time. Inputs are ISO strings (timestamptz) or Dates; output is local to the given IANA zone. ---- */

type When = string | number | Date | null | undefined;
const toDate = (value: When) => {
  if (value == null || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.valueOf()) ? null : d;
};
const partsIn = (d: Date, tz: string, options: Intl.DateTimeFormatOptions) => {
  const out: Record<string, string> = {};
  // en-GB spells September "Sept"; every other month (and the rest of the app) has three letters.
  for (const p of new Intl.DateTimeFormat("en-GB", { timeZone: tz, ...options }).formatToParts(d)) out[p.type] = p.type === "month" && p.value === "Sept" ? "Sep" : p.value;
  return out;
};
/** Minutes east of UTC for a zone at an instant. */
function offsetMinutes(d: Date, tz: string) {
  const p = partsIn(d, tz, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const local = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
  return Math.round((local - Math.floor(d.getTime() / 60000) * 60000) / 60000);
}
/** Abbreviations of the five market zones (Intl only knows them in some locales): [standard, daylight, standard offset]. */
const ZONES: Record<string, [string, string, number]> = {
  "UTC": ["UTC", "UTC", 0],
  "America/New_York": ["EST", "EDT", -300],
  "America/Toronto": ["EST", "EDT", -300],
  "Europe/London": ["GMT", "BST", 0],
  "Europe/Berlin": ["CET", "CEST", 60],
  "Asia/Tokyo": ["JST", "JST", 540],
};
/** "EDT", "GMT", "CET", "JST": the zone's abbreviation at that instant. */
export function tzAbbr(value: When, tz: string): string {
  const d = toDate(value) ?? new Date();
  const zone = ZONES[tz];
  if (zone) return offsetMinutes(d, tz) === zone[2] ? zone[0] : zone[1];
  return partsIn(d, tz, { timeZoneName: "short" }).timeZoneName ?? tz;
}
/** Local clock time: "14:20". */
export function time(value: When, tz = "UTC"): string {
  const d = toDate(value);
  if (!d) return DASH;
  const p = partsIn(d, tz, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${p.hour}:${p.minute}`;
}
/**
 * The same instant on the viewer's own clock, when it reads differently from the place's: "22:44 CEST",
 * with the weekday when the two clocks are on different dates ("Sun 20:00 CEST"); null when they agree.
 */
export function yourTime(value: When, placeTz: string, viewerTz: string): string | null {
  const d = toDate(value);
  if (!d || offsetMinutes(d, placeTz) === offsetMinutes(d, viewerTz)) return null;
  const day = dayLabel(d, placeTz) !== dayLabel(d, viewerTz) ? `${dayLabel(d, viewerTz).split(" ")[0]} ` : "";
  return `${day}${time(d, viewerTz)} ${tzAbbr(d, viewerTz)}`;
}
/**
 * A time on both clocks: the place's (where the van left from, where the store is) and the viewer's.
 * "16:44 (22:44 CEST)", or with the place's zone named, "16:44 EDT (22:44 CEST)". One clock when they agree.
 */
export function bothTimes(value: When, placeTz: string, viewerTz: string, zone = false): string {
  if (!toDate(value)) return DASH;
  const here = zone ? timeTz(value, placeTz) : time(value, placeTz);
  const yours = yourTime(value, placeTz, viewerTz);
  return yours ? `${here} (${yours})` : here;
}
/** Local clock time with its zone: "14:20 EDT". */
export const timeTz = (value: When, tz = "UTC") => toDate(value) ? `${time(value, tz)} ${tzAbbr(value, tz)}` : DASH;
/** "Wed 28 Oct" */
export function dayLabel(value: When, tz = "UTC"): string {
  const d = toDate(value);
  if (!d) return DASH;
  const p = partsIn(d, tz, { weekday: "short", day: "numeric", month: "short" });
  return `${p.weekday} ${p.day} ${p.month}`;
}
/** "12 Jul 2026" */
export function dateLabel(value: When, tz = "UTC"): string {
  const d = toDate(value);
  if (!d) return DASH;
  const p = partsIn(d, tz, { day: "numeric", month: "short", year: "numeric" });
  return `${p.day} ${p.month} ${p.year}`;
}
/** "Oct 28": chart ticks. */
export function monthDay(value: When, tz = "UTC"): string {
  const d = toDate(value);
  if (!d) return DASH;
  const p = partsIn(d, tz, { day: "numeric", month: "short" });
  return `${p.month} ${p.day}`;
}
/** The shell clock: "Wed 28 Oct · 18:20 UTC". */
export const clockLabel = (value: When, tz = "UTC") => toDate(value) ? `${dayLabel(value, tz)} · ${timeTz(value, tz)}` : DASH;
/** Whole minutes from `from` to `to` (negative when `to` is earlier); null when either is missing. */
export function minutesBetween(from: When, to: When): number | null {
  const a = toDate(from), b = toDate(to);
  return a && b ? Math.round((b.getTime() - a.getTime()) / 60000) : null;
}
/** "1 min ago", "2 h 5 m ago": age of a timestamp against the simulated clock. */
export function ago(value: When, now: When): string {
  const m = minutesBetween(value, now);
  return m == null ? DASH : m < 1 ? "just now" : `${duration(m)} ago`;
}
/** A plain date column ("2026-10-28", no time) as a Date at UTC midnight, safe to pass to the helpers above with tz "UTC". */
export const localDate = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00Z`);

/* ---- Stock cover. One phrasing for the Store page and the Stores hover card. ---- */

/** Hours a store is open per day, from one opening and one closing time (whichever day each falls on); 12 when unknown. */
export function openHoursPerDay(store: { opensAt: When; closesAt: When }): number {
  const m = minutesBetween(store.opensAt, store.closesAt);
  const day = m == null ? 0 : ((m % 1440) + 1440) % 1440;
  return day > 0 ? day / 60 : 12;
}
/** Open hours of cover as words: "≈ 9 open hours" under one open day, else "1.6 days". null when unknown. */
export const coverLabel = (hours: Num, perDay: number) =>
  !ok(hours) ? null : hours < perDay ? `≈ ${num(hours, hours < 3 ? 1 : 0)} open hours` : `${num(hours / perDay, 1)} days`;

/* ---- Chart scales ---- */

/**
 * A round axis for a bar chart: the smallest "nice" top at or above `max` and at most `maxTicks` steps.
 * niceScale(104000) → { top: 125000, step: 25000, ticks: [0, 25000, 50000, 75000, 100000, 125000] }.
 */
export function niceScale(max: Num, maxTicks = 5): { top: number; step: number; ticks: number[] } {
  const hi = ok(max) && max > 0 ? max : 1;
  const rough = hi / maxTicks;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = ([1, 2, 2.5, 5, 10].find(m => m * pow >= rough) ?? 10) * pow;
  const top = Math.ceil(hi / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= top + step / 2; t += step) ticks.push(Number(t.toPrecision(12)));
  return { top, step, ticks };
}
