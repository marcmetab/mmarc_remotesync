import { type FocusEvent, type KeyboardEvent, memo, type PointerEvent, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./stores.css";
import { StockPumpkin } from "../components/Pumpkin";
import { SelectMenu } from "../components/SelectMenu";
import { useBarAccessory } from "../components/TabBar";
import { Icon, Meter, type Option, PanelState, Segmented, Stat } from "../components/ui";
import { type DayRow, totalsByStore } from "../data/periods";
import { bothTimes, coverLabel, dayLabel, duration, int, money, openHoursPerDay, plural, time, yourTime } from "../format";
import { useViewerZone } from "../viewer";
import { Link } from "../nav";
import { routes } from "../routes";
import type { CityShelf } from "./CityPage";
import { type CountryCode, DELAY_CAUSE_LABEL, DRILL_PERIOD, DRILL_PERIODS, type DrillPeriod, inScope, LATE_MINUTES, type LateInfo, type PageProps, type RegionCode, type StockStatus, type TripStatus, type Variety } from "../types";

/*
 * Stores (/stores): every store at a glance. Three counters (the first two filter the cards), a sort control
 * (A–Z, Top revenue, Lowest stock), the revenue period ("Revenue: Today ▾": Today, Yesterday, 7 days, 30 days)
 * and the key, then one row of city cards per country. A city card is a small table: one row per store
 * (pumpkin, name, the van on the way, its revenue in the period) that opens the store, and a header that opens
 * the city. With no van on the way, the city's next planned van shows, muted, on the row of the store it goes
 * to. Hovering or focusing a row shows the store's card beside it (stock, cover, van).
 *
 * The period is App's, the one the City and Store pages' time switch shows, so a pick here holds there too.
 * Every revenue follows it (stores, cities, countries, the hover card, Top revenue); the counters, stock and
 * vans are right now. Presentational: the view model comes in through props (src/data/useStoresData.ts live,
 * fixtures/stores.ts in the static preview). Styles: stores.css.
 */

/* ── View model ──────────────────────────────────────────── */

/** A country title row. countries: country_code, country_name, region_code, tz. */
export type StoresCountry = { code: CountryCode; name: string; regionCode: RegionCode; tz: string };

/** One store_now row (100 in all). The page groups these by city and country and adds them up. */
export type StoresStoreRow = {
  /** store_now: store_id, store_name. */
  storeId: number;
  storeName: string;
  /** store_now: city_key, city_name, country_code, region_code, tz. */
  cityKey: string;
  cityName: string;
  countryCode: CountryCode;
  regionCode: RegionCode;
  tz: string;
  /** store_now: is_open, opens_at (today's or the next opening), closes_at (today's closing). */
  isOpen: boolean;
  opensAt: string | null;
  closesAt: string | null;
  /** store_now: stock_status, out_variety, out_since (null unless out), low_variety (the variety that runs out first; null unless low). */
  stockStatus: StockStatus;
  outVariety: Variety | null;
  outSince: string | null;
  lowVariety: Variety | null;
  /** store_now: on_hand_*, cap_*, cover_hours_* (Carving, Cooking, Mini in that order): the hover card's stock and cover. */
  shelves: CityShelf[];
  /** store_now: sold_today_units, lost_today_usd (the store's local day). */
  soldTodayUnits: number;
  lostTodayUsd: number;
  /** store_now: revenue_today_usd (the local day so far), revenue_7d_usd: Today's and 7 days' revenue until the view model's `revenue` is in. */
  revenueTodayUsd: number;
  revenue7dUsd: number;
  /** The van heading to this store now. store_now: next_trip_id (null: none), next_status, next_eta_at, next_late_minutes, next_delay_cause, next_delay_note. */
  nextVan: { status: TripStatus; etaAt: string | null; late: LateInfo } | null;
  /** store_now: next_planned_delivery_at (the next planned delivery when no van is on the way). */
  nextPlannedAt: string | null;
};

export type StoresViewModel = {
  /** countries. Undefined while it loads. */
  countries?: StoresCountry[];
  /** store_now. May hold every store: the page narrows it to the scope itself. Undefined while it loads. */
  stores?: StoresStoreRow[];
  /** Set when store_now could not be read and there is nothing to show. */
  error?: string | null;
  /**
   * Each period's revenue by store_id: daily_store_sales (DailyByStore, every store, the last 30 days) added up
   * (revenueByPeriod). Undefined while it loads: Today and 7 days show store_now's meanwhile, the others wait.
   */
  revenue?: Record<DrillPeriod, Record<number, number>>;
  /** Set when DailyByStore could not be read: Yesterday and 30 days show a dash (Today and 7 days keep store_now's). */
  revenueError?: string | null;
};

/**
 * DailyByStore's day rows as the view model's `revenue`: Today is days_ago 0 (so far), Yesterday 1, 7 days 0..6
 * and 30 days 0..29. The live hook and the fixture both build it with this, so the preview shows what the app will.
 */
export function revenueByPeriod(rows: DayRow[]): Record<DrillPeriod, Record<number, number>> {
  return Object.fromEntries(DRILL_PERIODS.map(p => [p, Object.fromEntries(Object.entries(totalsByStore(rows, p)).map(([id, t]) => [id, t.revenueUsd]))])) as Record<DrillPeriod, Record<number, number>>;
}

type Sort = "az" | "revenue" | "stock";
type Filter = "out" | "low" | null;
/**
 * The page's own state: the sort (countries, cities and stores alike) and the counter filter. `period` stands in
 * for App's in the static preview only (`--state '{"period":"30d"}'`); the app passes the `period` prop.
 */
export type StoresState = { sort: Sort; filter: Filter; period: DrillPeriod };

/** A revenue in the picked period: a number, undefined while it loads (a skeleton), null when it failed (a dash). */
type Rev = number | null | undefined;
/** A store_now row with its revenue in the picked period. */
type Store = StoresStoreRow & { revenue: Rev };
/** Revenues added up: unknown while any is, a dash when any failed. */
const addUp = (values: Rev[]): Rev => values.some(v => v === undefined) ? undefined : values.some(v => v === null) ? null : values.reduce<number>((a, b) => a + (b ?? 0), 0);
/** Most revenue first; one not known yet goes last (then by name, like A–Z). */
const byRevenue = (a: Rev, b: Rev) => (b ?? -1) - (a ?? -1);

/* ── Grouping: store rows → city cards → countries ───────── */

type City = {
  key: string;
  name: string;
  countryCode: CountryCode;
  tz: string;
  /** In the sort's order. */
  stores: Store[];
  out: number;
  low: number;
  /** Closed, and today's opening is still ahead: there is no "today" to report yet. */
  notOpenYet: boolean;
  /** Closed, nothing sold, and the next opening is on a later day (German stores on a Sunday). */
  closedToday: boolean;
  lost: number;
  revenue: Rev;
  /** The store shortest on stock: what Lowest stock ranks the city by. */
  worst: Store;
  /**
   * No van is on the way to any store: the store that gets the city's next planned delivery, whose row shows
   * that van (quieter, as planned). Null when a van is on the way or nothing is planned.
   */
  plannedStoreId: number | null;
};
type Group = { country: StoresCountry; meta: string; revenue: Rev; cities: City[] };

const SORTS: Option<Sort>[] = [{ value: "az", label: "A–Z" }, { value: "revenue", label: "Top revenue", short: "Revenue" }, { value: "stock", label: "Lowest stock", short: "Low stock" }];
/** A counter's words, in full and, on a phone (three counters in one strip), in short. */
const Words = ({ full, short }: { full: string; short: string }) => <><span className="pd-segmented-full">{full}</span><span className="pd-segmented-short">{short}</span></>;
/** The revenue period's options, as the City and Store pages' time switch names them. */
const PERIODS: Option<DrillPeriod>[] = DRILL_PERIODS.map(p => ({ value: p, label: DRILL_PERIOD[p].label }));
/** How the period names a revenue: the hover card's label, and for the ear after an amount ("$3.4k today so far"). */
const REVENUE: Record<DrillPeriod, { label: string; after: string }> = {
  today: { label: "Revenue, today so far", after: "today so far" },
  yesterday: { label: "Revenue, yesterday", after: "yesterday" },
  "7d": { label: "Revenue, last 7 days", after: "in the last 7 days" },
  "30d": { label: "Revenue, last 30 days", after: "in the last 30 days" },
};
const STOCK_RANK: Record<StockStatus, number> = { out: 0, low: 1, ok: 2 };
const STOCK_WORD: Record<StockStatus, string> = { out: "out of stock", low: "low", ok: "stocked" };
/** The hover card waits this long, so a pointer passing over the rows does not flash cards. */
const SHOW_MS = 250;
/** And stays this long after the pointer leaves, so it can be reached and read. */
const HIDE_MS = 120;

/** Names as a reader sorts them: "Neukölln" next to "Neustadt", not after "Winterhude". */
const collate = new Intl.Collator("en").compare;
const sum = <T,>(rows: T[], pick: (row: T) => number) => rows.reduce((total, row) => total + (pick(row) || 0), 0);
const ms = (iso: string | null | undefined) => iso ? Date.parse(iso) : NaN;
/** The earliest (or latest) of some timestamps; null when there is none. */
function edge(values: (string | null | undefined)[], pick: "first" | "last"): string | null {
  const known = values.filter((v): v is string => !Number.isNaN(ms(v))).sort((a, b) => ms(a) - ms(b));
  return known.length ? known[pick === "first" ? 0 : known.length - 1] : null;
}
/** The calendar day of an instant in a zone, as a day number, so two can be subtracted. */
function localDay(iso: string, tz: string): number {
  const parts: Record<string, number> = {};
  for (const p of new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso))) parts[p.type] = Number(p.value);
  return Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000;
}
/** A local clock time and, when it is not on the local today, the day: "tomorrow", "yesterday" or "Mon 2 Nov". */
function localWhen(iso: string, now: string | undefined, tz: string): { at: string; day: string } {
  const days = now ? localDay(iso, tz) - localDay(now, tz) : 0;
  return { at: time(iso, tz), day: days === 0 ? "" : days === 1 ? "tomorrow" : days === -1 ? "yesterday" : dayLabel(iso, tz) };
}
const whenWords = (w: { at: string; day: string }) => [w.day, w.at].filter(Boolean).join(" ");

/** Open hours until the first variety still on the shelf runs out (an empty shelf is the out line, not cover); Infinity when unknown. */
function shortestCover(store: StoresStoreRow): number {
  let best = Infinity;
  for (const shelf of store.shelves) if (shelf.onHand > 0 && shelf.coverHours != null && shelf.coverHours < best) best = shelf.coverHours;
  return best;
}
/** Lowest stock first: out, then low, then stocked; the same status by the shortest cover. */
const worse = (a: Store, b: Store) => STOCK_RANK[a.stockStatus] - STOCK_RANK[b.stockStatus] || shortestCover(a) - shortestCover(b);

/** Each sort at every level: countries, the cities in a country, the stores in a city. Ties go by name. */
const ORDER: Record<Sort, { store: (a: Store, b: Store) => number; city: (a: City, b: City) => number; country: (a: Group, b: Group) => number }> = {
  az: {
    store: (a, b) => collate(a.storeName, b.storeName),
    city: (a, b) => collate(a.name, b.name),
    country: (a, b) => collate(a.country.name, b.country.name),
  },
  revenue: {
    store: (a, b) => byRevenue(a.revenue, b.revenue) || collate(a.storeName, b.storeName),
    city: (a, b) => byRevenue(a.revenue, b.revenue) || collate(a.name, b.name),
    country: (a, b) => byRevenue(a.revenue, b.revenue) || collate(a.country.name, b.country.name),
  },
  // A city ranks by its worst store and a country by its worst city (the first one shown).
  stock: {
    store: (a, b) => worse(a, b) || collate(a.storeName, b.storeName),
    city: (a, b) => worse(a.worst, b.worst) || collate(a.name, b.name),
    country: (a, b) => worse(a.cities[0].worst, b.cities[0].worst) || collate(a.country.name, b.country.name),
  },
};

function toCity(stores: Store[], now: string | undefined, sort: Sort): City {
  const first = stores[0];
  const opensAt = edge(stores.map(s => s.opensAt), "first");
  const closed = !stores.some(s => s.isOpen);
  return {
    key: first.cityKey, name: first.cityName, countryCode: first.countryCode, tz: first.tz,
    stores: [...stores].sort(ORDER[sort].store),
    out: stores.filter(s => s.stockStatus === "out").length,
    low: stores.filter(s => s.stockStatus === "low").length,
    notOpenYet: closed && !!opensAt && !!now && ms(opensAt) > ms(now) && localDay(opensAt, first.tz) === localDay(now, first.tz),
    closedToday: closed && sum(stores, s => s.soldTodayUnits) === 0 && !!opensAt && !!now && localDay(opensAt, first.tz) > localDay(now, first.tz),
    lost: sum(stores, s => s.lostTodayUsd),
    revenue: addUp(stores.map(s => s.revenue)),
    worst: [...stores].sort(ORDER.stock.store)[0],
    plannedStoreId: stores.some(s => s.nextVan) ? null : firstPlanned(stores)?.storeId ?? null,
  };
}
/** The store with the earliest next planned delivery, if any. */
function firstPlanned(stores: Store[]): Store | undefined {
  return stores.filter(s => !Number.isNaN(ms(s.nextPlannedAt))).sort((a, b) => ms(a.nextPlannedAt) - ms(b.nextPlannedAt))[0];
}
/** One city per city key, its stores in the sort's order. */
function toCities(stores: Store[], now: string | undefined, sort: Sort): City[] {
  const byCity = new Map<string, Store[]>();
  for (const store of stores) byCity.set(store.cityKey, [...(byCity.get(store.cityKey) ?? []), store]);
  return [...byCity.values()].map(rows => toCity(rows, now, sort));
}

/** "14:20 EDT (20:20 CEST) · open until 21:00": the country's clock, the viewer's, and its stores' hours. */
function countryMeta(country: StoresCountry, stores: StoresStoreRow[], now: string | undefined, yours: string): string {
  const open = stores.filter(s => s.isOpen);
  const closes = edge(open.map(s => s.closesAt), "last");
  const opens = edge(stores.map(s => s.opensAt), "first");
  const when = opens ? localWhen(opens, now, country.tz) : null;
  const hours = open.length ? (closes ? `open until ${time(closes, country.tz)}` : "open") : when ? `closed, opens ${whenWords(when)}` : "closed";
  return now ? `${bothTimes(now, country.tz, yours, true)} · ${hours}` : hours;
}

/* ── Words shared by a row's name and its hover card ─────── */

/** "Out of Carving since 12:55" (a day in front when it is not today). */
function outWords(s: StoresStoreRow, now: string | undefined): string {
  const since = s.outSince ? localWhen(s.outSince, now, s.tz) : null;
  return `Out of ${s.outVariety ?? "stock"}${since ? ` since ${whenWords(since)}` : ""}`;
}
/** The variety a low store runs short of: store_now.low_variety, else the shelf with the least cover. */
function lowVarietyOf(s: StoresStoreRow): Variety | null {
  if (s.lowVariety) return s.lowVariety;
  const known = s.shelves.filter(shelf => shelf.onHand > 0 && shelf.coverHours != null);
  return known.length ? known.reduce((a, b) => b.coverHours! < a.coverHours! ? b : a).variety : null;
}
const lowWords = (s: StoresStoreRow) => `${lowVarietyOf(s) ?? "A variety"} runs out before the next van`;
/** A van time on the place's clock ("tomorrow 07:10") and, where it reads differently, the viewer's ("12:10 CET"). */
const twoClocks = (at: string, now: string | undefined, tz: string, yours: string) => ({ here: whenWords(localWhen(at, now, tz)), yours: yourTime(at, tz, yours) });
/** On screen: "tomorrow 07:10 (12:10 CET)", the bracket never broken across lines. */
function TwoClocks({ at, now, tz }: { at: string; now: string | undefined; tz: string }) {
  const c = twoClocks(at, now, tz, useViewerZone());
  return <>{c.here}{c.yours && <> <span className="pd-stores-yours">({c.yours})</span></>}</>;
}
const isLate = (late: LateInfo) => late.minutes >= LATE_MINUTES;
/** "2 h 10 m late · Breakdown on the 417": the delay and its first fact (or its cause). */
function lateWords(late: LateInfo): string {
  const why = late.note?.split(" · ")[0]?.trim() || (late.cause ? DELAY_CAUSE_LABEL[late.cause] : null);
  return `${duration(late.minutes)} late${why ? ` · ${why}` : ""}`;
}

/** The row's accessible name: everything the row shows, in words. `planned`: the row shows the city's next planned van (VanCell). */
function rowLabel(s: Store, planned: boolean, period: DrillPeriod, now: string | undefined, yours: string): string {
  const stock = s.stockStatus === "out" ? outWords(s, now).replace(/^O/, "o") : s.stockStatus === "low" ? `low, ${lowWords(s)}` : STOCK_WORD.ok;
  const words = (c: { here: string; yours: string | null }) => `${c.here}${c.yours ? ` (${c.yours})` : ""}`;
  const eta = s.nextVan?.etaAt ? twoClocks(s.nextVan.etaAt, now, s.tz, yours) : null;
  const van = s.nextVan
    ? s.nextVan.status === "unloading" ? ", van unloading now"
    : `, van ${eta ? words(eta) : "on the way"}${isLate(s.nextVan.late) ? `, ${duration(s.nextVan.late.minutes)} late` : ""}`
    : planned && s.nextPlannedAt ? `, next van ${words(twoClocks(s.nextPlannedAt, now, s.tz, yours))}` : "";
  const revenue = s.revenue != null ? `, ${money(s.revenue)} ${REVENUE[period].after}` : "";
  return `${s.storeName}, ${stock}${revenue}${van}`;
}

/** A revenue: the amount (the page's numeral), a skeleton while it loads, a dash when it failed. `words` name it for the ear. */
function Revenue({ value, words, className }: { value: Rev; words?: string; className?: string }) {
  if (value === undefined) return <span className={`pd-skeleton pd-stores-skel${className ? ` ${className}` : ""}`} aria-hidden="true"/>;
  return <span className={`pd-stores-num${className ? ` ${className}` : ""}`}>{words && <span className="pd-sr">{words}: </span>}{money(value)}</span>;
}

/* ── Hover card: when it shows, and where ────────────────── */

type PeekAt = { storeId: number; anchor: HTMLElement };
/** Keyboard focus only: a click or a tap focuses the link too, and that opens the store instead. */
const byKeyboard = (el: Element) => { try { return el.matches(":focus-visible"); } catch { return true; } };

/**
 * One hover card for the page. A row shows it after SHOW_MS on mouse hover or keyboard focus (never on touch,
 * where a tap opens the store), at once when it is already showing for another row. It hides on leave, blur
 * or Escape; the pointer may cross into it on the way. Its handlers are stable (`row` builds a row's from its
 * store and whether its card is the open one), so a hover re-renders the card that changed, not the page's cities.
 */
function usePeek() {
  const id = useId();
  const [at, setAt] = useState<PeekAt | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = useRef(false);
  open.current = at != null;
  const stop = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = null; }, []);
  useEffect(() => stop, [stop]);
  const show = useCallback((storeId: number, anchor: HTMLElement) => {
    stop();
    if (open.current) setAt({ storeId, anchor });
    else timer.current = setTimeout(() => setAt({ storeId, anchor }), SHOW_MS);
  }, [stop]);
  const hide = useCallback((wait = 0) => {
    stop();
    if (wait) timer.current = setTimeout(() => setAt(null), wait);
    else setAt(null);
  }, [stop]);
  const row = useCallback((storeId: number, isOpen: boolean) => ({
    "aria-describedby": isOpen ? id : undefined,
    onPointerEnter: (e: PointerEvent<HTMLAnchorElement>) => { if (e.pointerType === "mouse") show(storeId, e.currentTarget); },
    onPointerLeave: (e: PointerEvent<HTMLAnchorElement>) => { if (e.pointerType === "mouse") hide(HIDE_MS); },
    onFocus: (e: FocusEvent<HTMLAnchorElement>) => { if (byKeyboard(e.currentTarget)) show(storeId, e.currentTarget); },
    // Not at once: a Tab to the next row moves the open card there instead of starting the wait again.
    onBlur: () => hide(HIDE_MS),
    onKeyDown: (e: KeyboardEvent<HTMLAnchorElement>) => { if (e.key === "Escape") hide(); },
  }), [id, show, hide]);
  const card = useMemo(() => ({ onPointerEnter: stop, onPointerLeave: () => hide(HIDE_MS) }), [stop, hide]);
  return { id, at, hide, row, card };
}

/** Space between the row and the card, and the least the card keeps from the window's edges. */
const GAP = 8, EDGE = 8;
/**
 * Beside the row: to its right, else to its left, else (a narrow window) under or over it. Measured against
 * the window, then written in the coordinates of the card's frame (.pd-stores-body), so it scrolls with the row.
 */
function placeBeside(card: HTMLElement, anchor: HTMLElement) {
  const frame = card.offsetParent;
  if (!frame) return;
  const row = anchor.getBoundingClientRect(), base = frame.getBoundingClientRect();
  const vw = document.documentElement.clientWidth || window.innerWidth, vh = window.innerHeight;
  const w = card.offsetWidth, h = card.offsetHeight;
  const fits = (x: number) => x >= EDGE && x + w <= vw - EDGE;
  const clamp = (v: number, max: number) => Math.max(EDGE, Math.min(v, max));
  let x: number, y: number;
  if (fits(row.right + GAP) || fits(row.left - GAP - w)) {
    x = fits(row.right + GAP) ? row.right + GAP : row.left - GAP - w;
    // The card's pumpkin level with the row's.
    y = clamp(row.top + row.height / 2 - 34, vh - EDGE - h);
  } else {
    x = clamp(row.left, vw - EDGE - w);
    y = row.bottom + GAP + h <= vh - EDGE ? row.bottom + GAP : Math.max(EDGE, row.top - GAP - h);
  }
  card.style.left = `${Math.round(x - base.left)}px`;
  card.style.top = `${Math.round(y - base.top)}px`;
}

/* ── Hover card ──────────────────────────────────────────── */

type PeekCardProps = {
  id: string;
  store: Store;
  period: DrillPeriod;
  countryName: string;
  anchor: HTMLElement;
  now: string | undefined;
  onGone: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};
/** The store at a glance, beside its row: stock problem, revenue, today, cover, what is on the shelf, the van. */
function PeekCard({ id, store: s, period, countryName, anchor, now, onGone, onPointerEnter, onPointerLeave }: PeekCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // The row went away (a filter, a refresh): so does its card.
    if (!anchor.isConnected) { onGone(); return; }
    if (ref.current) placeBeside(ref.current, anchor);
  });

  const onHand = sum(s.shelves, shelf => shelf.onHand), capacity = sum(s.shelves, shelf => shelf.capacity);
  const cover = shortestCover(s);
  // The Store page's phrasing; the label already says "about", so its "≈" goes.
  const lasts = Number.isFinite(cover) ? coverLabel(cover, openHoursPerDay(s))?.replace(/^≈ /, "") : null;
  const van = s.nextVan;

  return <div ref={ref} id={id} role="tooltip" className="pd-stores-peek" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
    <div className="pd-stores-peek-head">
      <StockPumpkin status={s.stockStatus} size={34}/>
      <div><strong>{s.storeName}</strong><span>{s.cityName} · {countryName}</span></div>
    </div>
    {s.stockStatus === "out" && <p className="pd-stores-peek-note is-out">{outWords(s, now)}</p>}
    {s.stockStatus === "low" && <p className="pd-stores-peek-note is-low">{lowWords(s)}</p>}
    <dl className="pd-stores-peek-facts">
      <div><dt>{REVENUE[period].label}</dt><dd><Revenue value={s.revenue}/></dd></div>
      <div><dt>Sold today</dt><dd className="pd-stores-num">{int(s.soldTodayUnits)}</dd></div>
      <div><dt>Lasts about</dt><dd className="pd-stores-num">{lasts ?? "—"}</dd></div>
      <div><dt>In stock</dt><dd className="pd-stores-peek-stock">
        <Meter className="pd-stores-peek-bar" value={capacity > 0 ? onHand / capacity : 0} height={6}/>
        <span className="pd-stores-num">{int(onHand)}<span className="pd-sr"> of {int(capacity)} on the shelves</span></span>
      </dd></div>
    </dl>
    <div className="pd-stores-peek-van">
      <span className="pd-stores-peek-van-main">
        <Icon name="truck" size={16} strokeWidth={1.9}/>
        <span>{van ? (van.status === "unloading" ? "Unloading now" : van.etaAt ? <>Van <TwoClocks at={van.etaAt} now={now} tz={s.tz}/></> : "Van on the way")
          : s.nextPlannedAt ? <>Next van <TwoClocks at={s.nextPlannedAt} now={now} tz={s.tz}/></> : "No van planned"}</span>
      </span>
      {van && van.status !== "unloading" && isLate(van.late) && <span className="pd-stores-peek-late">{lateWords(van.late)}</span>}
    </div>
  </div>;
}

/* ── City card ───────────────────────────────────────────── */

type PeekRow = ReturnType<typeof usePeek>["row"];

/**
 * The van cell of a row: nothing, "unloading", or the ETA on the city's clock ("late" in terracotta). With
 * `planned` (no van is on the way to the city), the store's next planned delivery, muted, with its day when it
 * is not today ("tomorrow 07:10").
 */
function VanCell({ store: s, planned, now }: { store: Store; planned: boolean; now: string | undefined }) {
  const van = s.nextVan;
  if (!van) {
    if (!planned || !s.nextPlannedAt) return <span/>;
    const when = localWhen(s.nextPlannedAt, now, s.tz);
    return <span className="pd-stores-van is-planned"><Icon name="truck" size={15} strokeWidth={1.9}/>{`${when.day} ${when.at}`.trim()}</span>;
  }
  if (van.status === "unloading") return <span className="pd-stores-van"><Icon name="truck" size={15} strokeWidth={1.9}/>unloading</span>;
  const late = isLate(van.late);
  return <span className={`pd-stores-van${late ? " is-late" : ""}`}><Icon name="truck" size={15} strokeWidth={1.9}/>{time(van.etaAt, s.tz)}{late && <b>late</b>}</span>;
}

/** `openId`: the store whose hover card shows, when it is one of this city's (else null, so the other cards keep still). */
const CityCard = memo(function CityCard({ city, twinOf, period, now, openId, row }: { city: City; /** Set when another country has a city of this name: the country to tell it apart by. */ twinOf: StoresCountry | null; period: DrillPeriod; now: string | undefined; openId: number | null; row: PeekRow }) {
  const yours = useViewerZone();
  return <article className="pd-stores-card">
    <div className="pd-stores-card-head">
      <h3 className="pd-stores-city"><Link to={routes.city(city.key)}>{city.name}{twinOf && <span> {twinOf.code}</span>}</Link></h3>
      <Revenue value={city.revenue} words={REVENUE[period].label} className="pd-stores-city-rev"/>
    </div>
    <ul className="pd-stores-rows" role="list">
      {city.stores.map(s => <li key={s.storeId}>
        <Link to={routes.store(s.storeId)} className={`pd-stores-row${openId === s.storeId ? " is-open" : ""}`} aria-label={rowLabel(s, city.plannedStoreId === s.storeId, period, now, yours)} {...row(s.storeId, openId === s.storeId)}>
          <StockPumpkin status={s.stockStatus} size={20}/>
          <span className="pd-stores-name">{s.storeName}</span>
          <VanCell store={s} planned={city.plannedStoreId === s.storeId} now={now}/>
          <Revenue value={s.revenue}/>
        </Link>
      </li>)}
    </ul>
  </article>;
});

/* ── Page ────────────────────────────────────────────────── */

export type StoresPageProps = PageProps<StoresViewModel, StoresState> & {
  onRetry?: () => void;
  /** App's period (the City and Store pages' time switch shows the same one). Without it the page keeps its own. */
  period?: DrillPeriod;
  onPeriod?: (period: DrillPeriod) => void;
};

/**
 * Stores: three counters (the first two filter the cards), the sort, the revenue period and the key, then one
 * row of city cards per country. The counters follow the region, never the filter; the sort orders countries,
 * cities and stores; the period picks every revenue on the cards.
 */
export function StoresPage({ vm, scope, clock, initial, refreshing, onRetry, period: picked, onPeriod }: StoresPageProps) {
  // An unknown sort (an old saved state: "attention") starts at A–Z.
  const [sort, setSort] = useState<Sort>(SORTS.find(o => o.value === initial?.sort)?.value ?? "az");
  const [filter, setFilter] = useState<Filter>(initial?.filter ?? null);
  const [ownPeriod, setOwnPeriod] = useState<DrillPeriod>(DRILL_PERIODS.find(p => p === initial?.period) ?? "today");
  const period = picked ?? ownPeriod;
  const now = clock?.now;
  const yours = useViewerZone();
  const peek = usePeek();

  const ready = !!vm.stores && !!vm.countries;
  // Each store's revenue in the period. Until the daily rows are in, Today and 7 days show store_now's own
  // figures; Yesterday and 30 days wait for them (a skeleton), or show a dash when they could not be read.
  const sums = vm.revenue?.[period];
  const revenueFailed = ready && !sums && !!vm.revenueError && (period === "yesterday" || period === "30d");
  // The stores, cities and country groups: worked out again when the data, the scope, the period, the sort or the
  // filter change, not when a hover card opens.
  const { stores, cities, isTwin, outTotal, lowTotal, opened, lostTotal, lostCities, groups } = useMemo(() => {
    const standIn = (s: StoresStoreRow): Rev => period === "today" ? s.revenueTodayUsd : period === "7d" ? s.revenue7dUsd : vm.revenueError ? null : undefined;
    const stores: Store[] = (vm.stores ?? []).filter(s => inScope(scope, s.regionCode, s.countryCode))
      .map(s => ({ ...s, revenue: sums ? sums[s.storeId] ?? 0 : standIn(s) }));
    const cities = toCities(stores, now, sort);
    // "London" is in Canada and in the United Kingdom: a name used twice carries its country code.
    const names = [...new Map((vm.stores ?? []).map(s => [s.cityKey, s.cityName])).values()];
    const isTwin = (name: string) => names.indexOf(name) !== names.lastIndexOf(name);

    const outTotal = stores.filter(s => s.stockStatus === "out").length;
    const lowTotal = stores.filter(s => s.stockStatus === "low").length;
    const opened = cities.filter(c => !c.notOpenYet && !c.closedToday);
    const lostTotal = opened.reduce((total, c) => total + c.lost, 0);
    const lostCities = opened.filter(c => c.lost > 0).length;

    const matches = (c: City) => filter === "out" ? c.out > 0 : filter === "low" ? c.low > 0 : true;
    const order = ORDER[sort];
    const groups: Group[] = (vm.countries ?? []).filter(k => inScope(scope, k.regionCode, k.code)).map(country => {
      const mine = stores.filter(s => s.countryCode === country.code);
      return {
        country,
        meta: countryMeta(country, mine, now, yours),
        revenue: addUp(mine.map(s => s.revenue)),
        cities: cities.filter(c => c.countryCode === country.code && matches(c)).sort(order.city),
      };
    }).filter(g => g.cities.length > 0).sort(order.country);
    return { stores, cities, isTwin, outTotal, lowTotal, opened, lostTotal, lostCities, groups };
  }, [vm.stores, vm.countries, vm.revenueError, sums, period, scope, now, sort, filter, yours]);
  const openId = peek.at?.storeId ?? null;
  // The compact tab bar's line (phones): the two stock counters.
  const lowLine = lowTotal ? `${plural(lowTotal, "store")} running low` : "None running low";
  useBarAccessory(!ready ? null
    : outTotal > 0 ? { label: `${plural(outTotal, "store")} out of stock`, detail: lowLine, tone: "alert" }
    : { label: "No store out of stock", detail: lowLine });

  const peekStore = peek.at ? stores.find(s => s.storeId === peek.at!.storeId) : undefined;
  const peekCountry = peekStore && vm.countries?.find(k => k.code === peekStore.countryCode);

  const busy = refreshing ? " pd-busy" : "";
  return <>
    <div className={`pd-cards pd-stores-counters${busy}`}>
      <Stat label="Out of stock" size={25} value={ready ? int(outTotal) : "—"} note={<Words full={`${outTotal === 1 ? "store" : "stores"}, right now`} short={`${outTotal === 1 ? "store" : "stores"} now`}/>} pressed={filter === "out"} onClick={() => setFilter(filter === "out" ? null : "out")}/>
      <Stat label="Low stock" size={25} value={ready ? int(lowTotal) : "—"} note={<Words full="runs out before the next van" short="before the next van"/>} pressed={filter === "low"} onClick={() => setFilter(filter === "low" ? null : "low")}/>
      <Stat label={<Words full="Lost sales today" short="Lost today"/>} size={25} value={ready && opened.length ? money(lostTotal) : "—"} tone={ready && lostTotal > 0 ? "alert" : "default"}
        note={!ready ? " " : opened.length ? <Words full={`across ${plural(lostCities, "city", "cities")}`} short={`in ${plural(lostCities, "city", "cities")}`}/> : cities.length ? "Not open yet" : " "}/>
    </div>

    <div className="pd-stores-sort">
      <div className="pd-stores-controls">
        <Segmented label="Sort" options={SORTS} value={sort} onChange={setSort}/>
        <SelectMenu label="Revenue" options={PERIODS} value={period} onChange={onPeriod ?? setOwnPeriod}/>
      </div>
      <div className="pd-stores-key">
        <span><Icon name="truck" size={14} strokeWidth={1.9}/>Van on the way</span>
        <span><StockPumpkin status="out" size={16}/>Out</span>
        <span><StockPumpkin status="low" size={16}/>Low</span>
        <span><StockPumpkin status="ok" size={16}/>Stocked</span>
      </div>
    </div>
    {revenueFailed && <PanelState state="error" message={vm.revenueError ?? undefined} onRetry={onRetry}/>}

    {/* The hover card's frame: it is placed in these coordinates, so it scrolls with its row. */}
    <div className="pd-stores-body">
      <div className={`pd-stores-groups${busy}`}>
        {groups.map(g => <section key={g.country.code} aria-label={g.country.name} className="pd-stores-group">
          <div className="pd-stores-group-head">
            <h2>{g.country.name}</h2>
            <Revenue value={g.revenue} words={REVENUE[period].label} className="pd-stores-group-rev"/>
            <span className="pd-stores-group-meta">{g.meta}</span>
          </div>
          <div className="pd-stores-grid">{g.cities.map(c => <CityCard key={c.key} city={c} twinOf={isTwin(c.name) ? g.country : null} period={period} now={now}
            openId={openId != null && c.stores.some(s => s.storeId === openId) ? openId : null} row={peek.row}/>)}</div>
        </section>)}
        {!ready
          ? (vm.error ? <PanelState state="error" message={vm.error} onRetry={onRetry}/> : <PanelState state="loading" rows={4} minHeight={160}/>)
          : groups.length === 0 && <PanelState state="empty" message={cities.length ? "No matching cities" : "No stores"}/>}
      </div>
      {peek.at && peekStore && <PeekCard id={peek.id} store={peekStore} period={period} countryName={peekCountry?.name ?? peekStore.countryCode} anchor={peek.at.anchor} now={now}
        onGone={() => peek.hide()} {...peek.card}/>}
    </div>
  </>;
}
