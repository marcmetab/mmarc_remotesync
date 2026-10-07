/**
 * Store: one store. Route /stores/store/:storeId.
 * Under the title, the band the City page has (DrillBand): the period's Sold and Lost, which follow the top bar's
 * time switch, then right now (the variety that runs out first, the next van). Left: Stock (shelf per variety,
 * with what is on the way), the period's chart (by hour or by day, the stockouts shaded), Week and season. Right:
 * Next delivery (links to the van), Stockouts, Deliveries, Details. Stock, cover and the next delivery are always
 * right now. Every time on the page is local to the store (`tz`); van times add the viewer's clock.
 */
import { type CSSProperties, type ReactNode } from "react";
import "./store.css";
import { ChartTip, columnLabel, periodAxis, useChartTip } from "../components/ChartTip";
import { Bit, BLANK, DrillBand, dotted, leastCover, NowFigure, type Place, RunsOutFigure, runsShort, VanMark, vanTime } from "../components/DrillBand";
import { BackTitle, ChartFrame, DeltaText, Facts, Icon, Legend, Meter, Panel, PanelState, RowLink, StatusChip, Tag } from "../components/ui";
import { localYmd } from "../data/periods";
import { bothTimes, change, coverLabel, dayLabel, dollars, duration, int, km, localDate, minutesBetween, money, niceScale, openHoursPerDay, pct, plural, time } from "../format";
import { useViewerZone } from "../viewer";
import { Link } from "../nav";
import { routes } from "../routes";
import { palette } from "../theme";
import { DELAY_CAUSE_LABEL, type DelayCause, DRILL_PERIOD, type DrillPeriod, type LateInfo, lateStatus, type LostCause, type PageProps, type PeriodSeries, type PeriodTotals, type ServiceStatus, type StockStatus, type StoreFormat, type TripStatus, type Variety } from "../types";

/* ── View model ──────────────────────────────────────────── */

/**
 * One part per query. A part is undefined while its query loads and null when the query failed: its
 * panels show a skeleton or an error, the rest of the page keeps working.
 */
export type StoreViewModel = {
  /** store_now where store_id = :storeId (one row). */
  store?: StoreNow | null;
  /**
   * The top bar's time switch, by option: the store's figures and the chart. The live hook fills every option it
   * has rows for (the figures and the 7 and 30 days charts share one query; the Today and Yesterday charts load
   * when picked); the fixture fills all four.
   */
  periods?: Partial<Record<DrillPeriod, StorePeriodPart>>;
  /** stockouts where store_id = :storeId and days_ago <= 6 (the view keeps 14 days; the page shows 7). */
  stockouts?: StoreStockout[] | null;
  /** deliveries where store_id = :storeId and days_ago <= 6. The page lists the newest five. */
  deliveries?: StoreDelivery[] | null;
  /** stores where store_id = :storeId (one row). */
  details?: StoreDetails | null;
  /** fleet_now where truck_id = store_now.next_truck_id: service_status, km_to_service (negative = overdue). Optional: without it the "Service overdue" line is left out. */
  nextTruck?: { serviceStatus: ServiceStatus; kmToService: number } | null;
  /** True when no store has the id in the URL: the page says so instead of waiting. */
  notFound?: boolean;
};

export type StoreNow = {
  /* store_now: store_id, store_name, store_format, city_key, city_name, country_name, tz */
  storeId: number;
  name: string;
  format: StoreFormat;
  cityKey: string;
  cityName: string;
  countryName: string;
  tz: string;
  /* store_now: is_open, opens_at, closes_at (timestamps: this opening period when open, the next one when closed) */
  isOpen: boolean;
  opensAt: string | null;
  closesAt: string | null;
  /* store_now: stock_status, out_variety, out_since, low_variety */
  stockStatus: StockStatus;
  outVariety: Variety | null;
  outSince: string | null;
  lowVariety: Variety | null;
  /** One line per variety, in the order Carving, Cooking, Mini. */
  stock: StoreStock[];
  /**
   * store_now.open_hours_to_next_delivery: open hours until the next van can restock the store. A variety
   * whose cover is shorter runs out first (the contract's "low"). Left out, low means under 8 open hours.
   */
  restockHours?: number | null;
  /* store_now: sold_today_units, revenue_today_usd, lost_today_units, lost_today_usd */
  today: { soldUnits: number; revenueUsd: number; lostUnits: number; lostUsd: number };
  /* store_now: revenue_7d_usd, plan_7d_usd, ly_7d_usd, fill_rate_7d, availability_7d, shrink_7d_usd */
  week: StorePeriod;
  /* store_now: revenue_season_usd, plan_season_usd, ly_season_usd, fill_rate_season, availability_season, shrink_season_usd */
  season: StorePeriod;
  /** The trip heading to this store now; null when no van is on the way. */
  next: StoreNextTrip | null;
  /** store_now.next_planned_delivery_at: the next planned delivery when none is on the way. */
  nextPlannedAt: string | null;
};
/** One option of the time switch. Each part is undefined while its query loads and null when it failed. */
export type StorePeriodPart = {
  /** daily_store_sales where store_id = :storeId and days_ago in the period: sold, revenue, lost, and the plan for vs plan. */
  totals?: PeriodTotals | null;
  /**
   * The chart. Today and Yesterday: by local hour across the store's opening day, hourly_store_sales (days_ago
   * 0 / 1); today's running hour is current and the hours after it are placeholders. 7 and 30 days: by local day
   * from the same daily rows as `totals`, today's column current while the store trades.
   */
  chart?: PeriodSeries | null;
};
export type StoreStock = {
  variety: Variety;
  /** store_now.on_hand_carving / on_hand_cooking / on_hand_mini */
  onHand: number;
  /** store_now.cap_carving / cap_cooking / cap_mini */
  capacity: number;
  /** store_now.cover_hours_carving / _cooking / _mini: open hours of cover; null when unknown. */
  coverHours: number | null;
  /** store_now.next_carving / next_cooking / next_mini: aboard the van on the way; 0 when there is none. */
  incoming: number;
};
/** A column of "Week and season". Rates are ratios (0.86 prints "86%"). */
export type StorePeriod = { revenueUsd: number; planUsd: number | null; lyUsd: number | null; fillRate: number | null; availability: number | null; shrinkUsd: number | null };
export type StoreNextTrip = {
  /* store_now: next_trip_id, next_truck_id, next_truck_label, next_driver_name, next_status */
  tripId: string;
  truckId: string;
  truckLabel: string;
  driverName: string;
  status: TripStatus;
  /* store_now: next_eta_at, next_planned_at */
  etaAt: string;
  plannedAt: string;
  /* store_now: next_late_minutes, next_delay_cause, next_delay_note */
  late: LateInfo;
  /** store_now.next_units (the split by variety is StoreStock.incoming). */
  units: number;
};
export type StoreStockout = {
  /* stockouts: variety_name, started_at, ended_at (null while ongoing), is_ongoing, days_ago (of the start) */
  variety: Variety;
  startedAt: string;
  endedAt: string | null;
  isOngoing: boolean;
  daysAgo: number;
  /* stockouts: units_lost, lost_revenue_usd (so far), cause */
  lostUnits: number;
  lostUsd: number;
  cause: LostCause | null;
  /* stockouts: truck_id, truck_label (the late van; null for other causes) */
  truckId: string | null;
  truckLabel: string | null;
  /** deliveries.delay_cause of stockouts.trip_id: why that van was late. */
  delayCause: DelayCause | null;
};
export type StoreDelivery = {
  /* deliveries: trip_id, local_date ("2026-10-27"), days_ago, truck_id, truck_label */
  tripId: string;
  localDate: string;
  daysAgo: number;
  truckId: string;
  truckLabel: string;
  /** deliveries.is_delivered = 1 */
  isDelivered: boolean;
  /** deliveries.arrived_at once delivered, else eta_at. */
  at: string;
  /* deliveries: late_minutes, delay_cause, delay_note */
  late: LateInfo;
  /* deliveries: units_total, damaged_units */
  units: number;
  damagedUnits: number;
};
export type StoreDetails = {
  /* stores: store_format, tz; the hours from store_now: opens_at, closes_at on the store's clock ("09:00") */
  format: StoreFormat;
  tz: string;
  openTime: string;
  closeTime: string;
  /** "every day", or "Mon–Sat" in Germany. Not a column yet: derive it from stores.country_code. */
  openDays: string;
  /* stores: shelf_capacity_units, opened_year, store_lead */
  shelfCapacityUnits: number;
  openedYear: number;
  storeLead: string;
};

/**
 * The page's own state. `period` stands in for the top bar's switch in the static preview only
 * (`--state '{"period":"7d"}'`); the app passes the `period` prop.
 */
type StoreState = { period?: DrillPeriod };

/* ── Helpers ─────────────────────────────────────────────── */

const MAX_DELIVERIES = 5;
/** Share of an hour chart's axis left free above the tallest bar when a stockout label hangs there. */
const HEADROOM = 1.1;
/** The y axis reaches at least this many pumpkins, so a quiet chart does not print "0, 1, 1". */
const MIN_TOP = 4;
/** Minutes in a day. */
const DAY = 1440;
const CAUSE: Record<LostCause, string> = { late_delivery: "Late delivery", hub_shortage: "Hub ran short", demand_above_plan: "Demand above plan" };

const pad2 = (n: number) => String(n).padStart(2, "0");
const hhmm = (minutes: number) => `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(minutes % 60)}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const sameDay = (a: string | Date, b: string | Date, tz: string) => dayLabel(a, tz) === dayLabel(b, tz);
/** Minutes after the store's local midnight. */
const minuteOfDay = (iso: string, tz: string) => { const [h, m] = time(iso, tz).split(":").map(Number); return h * 60 + m; };
/** Whole days from local date `b` to local date `a` ("2026-10-28"). */
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 864e5);
/** "Today", "Tomorrow" or "Thu 29 Oct", in the store's zone. */
function dayWord(iso: string, now: string | undefined, tz: string) {
  if (now && sameDay(iso, now, tz)) return "Today";
  if (now && sameDay(iso, new Date(Date.parse(now) + 864e5), tz)) return "Tomorrow";
  return dayLabel(iso, tz);
}
/** "London" exists in the United Kingdom and in Canada: it always carries its country. */
const cityLabel = (store: Pick<StoreNow, "cityName" | "countryName">) => store.cityName === "London" ? `${store.cityName}, ${store.countryName}` : store.cityName;

/**
 * A stockout as a stretch of one local day, in minutes after its midnight. `from` is -Infinity when it began on an
 * earlier day; `to` is Infinity while it is still going, or when it ended on a later day.
 */
type Outage = { variety: Variety; from: number; to: number };
/** The stockouts that touched the local day `date` ("2026-10-28"), earliest first. */
function outagesOn(stockouts: StoreStockout[], tz: string, date: string | undefined): Outage[] {
  if (!date) return [];
  const at = (iso: string) => daysBetween(localYmd(iso, tz), date) * DAY + minuteOfDay(iso, tz);
  return stockouts
    .map(e => {
      const from = at(e.startedAt), to = e.endedAt && !e.isOngoing ? at(e.endedAt) : Infinity;
      return { variety: e.variety, from: from < 0 ? -Infinity : from, to: to > DAY ? Infinity : to };
    })
    // A zone that cannot be read gives NaN, which no comparison keeps.
    .filter(o => o.from < DAY && o.to > 0)
    .sort((a, b) => a.from - b.from);
}
/** What was out during an hour: "Carving out from 13:40", "Carving out". */
function hourNote(outages: Outage[], hour: number) {
  const start = hour * 60, end = start + 60;
  return outages.filter(o => o.from < end && o.to > start).map(o => {
    const startsIn = o.from >= start, endsIn = o.to <= end;
    return `${o.variety} out${startsIn && endsIn ? ` ${hhmm(o.from)}–${hhmm(o.to)}` : startsIn ? ` from ${hhmm(o.from)}` : endsIn ? ` until ${hhmm(o.to)}` : ""}`;
  }).join(" · ");
}

/** In place of a part that is not there: a skeleton while it loads (undefined), an error once it failed (null). */
function Pending({ part, what, rows, chart, minHeight }: { part: null | undefined; what: string; rows?: number; chart?: boolean; minHeight?: number }) {
  return part === null ? <PanelState state="error" message={`Could not load ${what}`}/> : <PanelState state="loading" rows={rows} chart={chart} minHeight={minHeight}/>;
}

/* ── Page ────────────────────────────────────────────────── */

/**
 * One store: the band (the period's figures, what runs out first and the next van), its stock, the period's
 * chart, its week and season, and the next delivery, stockouts, deliveries and details.
 */
export function StorePage({ vm, clock, initial, refreshing, period: picked }: PageProps<StoreViewModel, StoreState> & { period?: DrillPeriod }) {
  const { store, stockouts, deliveries, details, nextTruck } = vm;
  const yours = useViewerZone();
  const now = clock?.now;
  const period = picked ?? initial?.period ?? "today";
  const tz = store?.tz ?? details?.tz;
  const part = vm.periods?.[period];
  // Times are local to the store: a list waits for the zone before it prints any.
  const timed = <T,>(part: T | null | undefined) => tz ? part : store === null && details === null ? null : undefined;

  if (vm.notFound) return <>
    <BackTitle to={routes.stores()} backLabel="Stores" title="Store"/>
    <PanelState state="empty" message="No such store"/>
  </>;

  return <>
    <StoreTitle store={store} now={now}/>
    <StoreBand store={store} period={period} part={part} stockouts={stockouts} busy={refreshing}
      place={{ tz: tz ?? "UTC", now, yours, openHours: store ? openHoursPerDay(store) : 12 }}/>
    <div className="pd-store-wrap">
      <div className="pd-split pd-store-cols">
        <div className="pd-split-main pd-stack pd-store-main">
          <StockPanel store={store} now={now} busy={refreshing}/>
          <SalesPanel period={period} part={part} tz={tz} stockouts={stockouts} busy={refreshing}/>
          <WeekPanel store={store} busy={refreshing}/>
        </div>
        <div className="pd-split-rail pd-stack pd-store-rail">
          <NextPanel store={store} nextTruck={nextTruck} now={now} busy={refreshing}/>
          <StockoutsPanel stockouts={timed(stockouts)} tz={tz ?? "UTC"} busy={refreshing}/>
          <DeliveriesPanel deliveries={timed(deliveries)} tz={tz ?? "UTC"} busy={refreshing}/>
          <DetailsPanel details={details} busy={refreshing}/>
        </div>
      </div>
    </div>
  </>;
}

/** Back to the city, the name, the stock status, and one line of facts. */
function StoreTitle({ store, now }: { store: StoreNow | null | undefined; now?: string }) {
  if (!store) return <BackTitle to={routes.stores()} backLabel="Stores" title="Store"/>;
  const { tz } = store;
  const chip = store.stockStatus === "out" ? <Tag tone="out" size="lg">{store.outVariety ? `Out of ${store.outVariety}` : "Out of stock"}</Tag>
    : store.stockStatus === "low" ? <Tag tone="low" size="lg">{store.lowVariety ? `Low on ${store.lowVariety}` : "Low stock"}</Tag>
    : undefined;
  // "open until 21:00 · closes in 6 h 40 m", or "closed · opens 09:00" (with the day when that is not today).
  const left = minutesBetween(now, store.closesAt);
  const opensDay = store.opensAt ? dayWord(store.opensAt, now, tz) : "Today";
  const opening = store.isOpen
    ? [store.closesAt ? `open until ${time(store.closesAt, tz)}` : "open", left != null && left >= 0 && `closes in ${duration(left).replace(/ /g, "\u00a0")}`]
    : ["closed", store.opensAt && `opens ${opensDay === "Today" ? "" : opensDay === "Tomorrow" ? "tomorrow " : `${opensDay} `}${time(store.opensAt, tz)}`];
  return <BackTitle to={routes.city(store.cityKey)} backLabel={cityLabel(store)} title={store.name} chip={chip} meta={[capitalize(store.format), cityLabel(store), ...opening]}/>;
}

/* ── The band ────────────────────────────────────────────── */

type BandProps = {
  store: StoreNow | null | undefined;
  period: DrillPeriod;
  part: StorePeriodPart | undefined;
  stockouts: StoreStockout[] | null | undefined;
  place: Place;
  busy?: boolean;
};

/**
 * The City page's band, for one store (DrillBand): the period's Sold and Lost on the left, then right now on the
 * right, which never follows the switch: the variety that runs out first and the next van.
 */
function StoreBand({ store, period, part, stockouts, place, busy }: BandProps) {
  // Another period waits for its own rows: today's store_now figures would be read as that period's.
  const totals = part?.totals ?? (period === "today" ? store?.today : undefined);
  return <DrillBand period={period} totals={totals} figuresError={!totals && part?.totals === null ? "Could not load the figures" : undefined} busy={busy}>
    <RunsOutFirst store={store} stockouts={stockouts} place={place}/>
    <NextVan store={store} place={place}/>
  </DrillBand>;
}

/**
 * The store's variety with the least cover, when it runs dry and when its next van comes (RunsOutFigure, the
 * City band's rule: terracotta when it runs out first). The mark is that variety's own stock.
 */
function RunsOutFirst({ store, stockouts, place }: { store: StoreNow | null | undefined; stockouts: StoreStockout[] | null | undefined; place: Place }) {
  const first = store && leastCover(store.stock);
  if (!store || !first) return <RunsOutFigure first={null} ready={!!store} error={store === null ? "Could not load the stock" : undefined} place={place}/>;
  const { shelf: line, hours, moreOut } = first;
  const short = runsShort(line, store.restockHours);
  const since = hours <= 0 ? (store.outVariety === line.variety && store.outSince) || stockouts?.find(o => o.isOngoing && o.variety === line.variety)?.startedAt : null;
  const vanAt = store.next?.etaAt ?? store.nextPlannedAt;
  return <RunsOutFigure ready place={place} first={{
    what: line.variety, status: hours <= 0 ? "out" : short ? "low" : "ok", hours, short, since,
    van: vanAt ? { at: vanAt, arrived: store.next?.status === "unloading" } : null, moreOut,
  }}/>;
}

/** What a van heading here is doing, in the band's words. */
const VAN_DOING: Partial<Record<TripStatus, string>> = { loading: "loading at the hub", stopped: "stopped on the way", unloading: "unloading now" };

/**
 * The van heading here: its label, what it is doing and when it comes (both clocks), its delay in terracotta;
 * it opens the van. With none on the way, the next planned delivery.
 */
function NextVan({ store, place }: { store: StoreNow | null | undefined; place: Place }) {
  const next = store?.next;
  if (!store || !next) return <NowFigure area="van" label="Next van" mark={<VanMark/>}
    main={store ? "None on the way" : store === null ? "—" : null}
    note={store === null ? "Could not load the next delivery" : !store ? BLANK : store.nextPlannedAt ? `next delivery ${vanTime(store.nextPlannedAt, place)}` : "none planned"}/>;
  // An unloading van has come: its time is when it arrived.
  const arrived = next.status === "unloading";
  return <NowFigure area="van" to={routes.truck(next.truckId)} label="Next van" mark={<VanMark/>} main={next.truckLabel}
    note={dotted([
      VAN_DOING[next.status] ?? "on the way",
      <Bit>{arrived && "arrived "}{vanTime(next.etaAt, place)}</Bit>,
      lateStatus(next.late) !== "on_schedule" && <Bit alert>{duration(next.late.minutes)} late</Bit>,
    ])}/>;
}

/* ── Stock ───────────────────────────────────────────────── */

/** On the way has its own colour on this page (store.css): the dark incoming token is as light as the plum bar beside it. */
const INCOMING = "var(--pd-store-incoming)";
const STOCK_LEGEND = [{ label: "On shelf", color: palette.plum }, { label: "On the way", color: INCOMING }];

function StockPanel({ store, now, busy }: { store: StoreNow | null | undefined; now?: string; busy?: boolean }) {
  // The second bar segment and its legend only exist while a van is heading here.
  const onTheWay = store?.next != null;
  return <Panel title="Stock" aside={onTheWay ? <Legend items={STOCK_LEGEND}/> : undefined} busy={busy} className="pd-store-stock">
    {store
      ? <div className="pd-store-cells">{store.stock.map(line => <StockCell key={line.variety} line={line} store={store} now={now} onTheWay={onTheWay}/>)}</div>
      : <Pending part={store} what="stock" minHeight={126}/>}
  </Panel>;
}

/** One variety: what is on the shelf against its capacity, how long it lasts, and what the van brings. */
function StockCell({ line, store, now, onTheWay }: { line: StoreStock; store: StoreNow; now?: string; onTheWay: boolean }) {
  const { tz } = store;
  const out = line.onHand <= 0;
  // Low is the contract's: this variety runs out before the next van can restock it (the band's rule too).
  const low = !out && runsShort(line, store.restockHours);
  const cover = coverLabel(line.coverHours, openHoursPerDay(store));
  // Out since 13:40, or since a weekday when it ran out before today.
  const since = out && store.outVariety === line.variety && store.outSince
    ? `${now && !sameDay(store.outSince, now, tz) ? `${dayLabel(store.outSince, tz).split(" ")[0]} ` : ""}${time(store.outSince, tz)}`
    : null;
  const share = (units: number) => line.capacity > 0 ? units / line.capacity : 0;
  const arriving = Math.min(line.incoming, Math.max(0, line.capacity - line.onHand));
  return <article className="pd-store-cell">
    <div className="pd-store-cell-head">
      <strong>{line.variety}</strong>
      {out ? <Tag tone="out" size="sm">{since ? `Out since ${since}` : "Out"}</Tag>
        : low ? <Tag tone="low" size="sm">{cover}</Tag>
        : cover && <span className="pd-store-cover">{cover}</span>}
    </div>
    <div className="pd-store-cell-num"><span className={`pd-num${out ? " is-out" : ""}`}>{int(line.onHand)}</span><span>of {int(line.capacity)}</span></div>
    <Meter segments={[{ value: share(line.onHand), color: palette.plum }, { value: share(arriving), color: INCOMING }]}
      aria-label={`${line.variety}: ${int(line.onHand)} of ${int(line.capacity)} on the shelf${onTheWay ? `, ${int(line.incoming)} on the way` : ""}`}/>
    {onTheWay && <div className={`pd-store-cell-inc${line.incoming > 0 ? "" : " is-none"}`}>{line.incoming > 0 ? `+${int(line.incoming)} on the way` : "None on the way"}</div>}
  </article>;
}

/* ── The period's sales ──────────────────────────────────── */

const SALES_LEGEND = [{ label: "Sold", color: palette.olive }, { label: "Lost", color: palette.pumpkin }];

type SalesProps = {
  period: DrillPeriod;
  /** The period's chart: undefined while it loads, a null chart once its query failed. */
  part: StorePeriodPart | undefined;
  tz: string | undefined;
  stockouts: StoreStockout[] | null | undefined;
  busy?: boolean;
};
/**
 * The period picked on the top bar as a chart; its title names the period. Its sold and lost totals are the
 * band's (StoreBand), so the panel no longer repeats them.
 */
function SalesPanel({ period, part, tz, stockouts, busy }: SalesProps) {
  const info = DRILL_PERIOD[period];
  const chart = part?.chart;
  const started = chart?.columns.some(c => !c.isFuture) ?? false;
  const outages = chart?.by === "hour" && tz ? outagesOn(stockouts ?? [], tz, chart.columns[0]?.date) : [];
  return <Panel title={info.chart} aside={started ? <Legend items={SALES_LEGEND}/> : undefined} gap={16} busy={busy} className="pd-store-sales">
    {!chart ? <Pending part={chart} what="the sales" chart minHeight={320}/>
      : started ? <PeriodChart key={period} chart={chart} outages={outages}/>
      : <PanelState state="empty" line message={period === "today" ? "No sales yet" : "No sales"}/>}
  </Panel>;
}

/**
 * The period's chart: sold with lost stacked on it, one column per local hour (Today, Yesterday) or per day (7 and
 * 30 days). Today's hours not reached yet are faint placeholders, and the column still running (this hour, or
 * today's bar) is drawn lighter. On an hour chart the time a variety was out is shaded behind the bars. Hovering,
 * focusing or scrubbing a column shows its card (ChartTip).
 */
function PeriodChart({ chart, outages }: { chart: PeriodSeries; outages: Outage[] }) {
  const cols = chart.columns, n = cols.length;
  // Tab lands on the running column, else the last one reached.
  const current = cols.findIndex(c => c.isCurrent);
  const tip = useChartTip(n, current >= 0 ? current : cols.reduce((last, c, i) => c.isFuture ? last : i, -1));
  const dense = n > 12;
  const first = (cols[0].hour ?? 0) * 60, span = n * 60;
  // A stockout still going is shaded to the end of the last hour reached, not across the hours to come.
  const reached = cols.filter(c => !c.isFuture);
  const shadeEnd = ((reached[reached.length - 1]?.hour ?? 0) + 1) * 60;
  const bands = chart.by === "hour" ? outages
    .map(o => ({ ...o, left: clamp01((o.from - first) / span), right: clamp01((Math.min(o.to, shadeEnd) - first) / span) }))
    .filter(b => b.right > b.left) : [];
  const labels = labelAnchors(bands.map(b => b.left));
  const peak = Math.max(...cols.map(c => c.soldUnits + c.lostUnits));
  const scale = niceScale(Math.max(MIN_TOP, peak * (bands.length ? HEADROOM : 1)), 3);
  const share = (units: number) => units / scale.top;
  const at = tip.index, shown = at != null && !cols[at].isFuture ? cols[at] : null;
  const note = shown?.hour != null ? hourNote(outages, shown.hour) : "";

  return <div className={`pd-store-chart${dense ? " is-dense" : ""}`}>
    <ChartFrame height={276} axisWidth={26} ticks={scale.ticks.map(t => ({ at: t / scale.top, label: int(t) }))} xAxis={periodAxis(cols)}>
      {bands.map((b, i) => <span key={`band-${i}`} className="pd-store-out" style={{ left: `${b.left * 100}%`, right: `${(1 - b.right) * 100}%` }} aria-hidden="true"/>)}
      {/* The label sits right of the line where the band starts; late in the day (on a phone, from mid-day) it sits left of it. */}
      {bands.map((b, i) => <span key={`label-${i}`} className={`pd-store-outlabel${labels[i].flip > 0.45 ? (labels[i].at > 0.78 ? " is-flip" : labels[i].at > 0.55 ? " is-flip-narrow" : "") : ""}`}
        style={{ top: 4 + i * 18, "--pd-store-at": `${labels[i].at * 100}%`, "--pd-store-flip": `${labels[i].flip * 100}%` } as CSSProperties} aria-hidden="true">
        <i/><b>{b.variety} out{Number.isFinite(b.from) && ` ${hhmm(b.from)}`}</b>
      </span>)}
      <div className="pd-store-bars" {...tip.track}>
        {cols.map((c, i) => c.isFuture
          ? <span key={c.key} className="pd-store-col is-future" aria-hidden="true"><i/></span>
          : <button type="button" key={c.key} className={`pd-store-col${c.isCurrent ? " is-current" : ""}${at === i ? " is-tip" : ""}`} {...tip.column(i)}
            aria-label={`${columnLabel(c)}: ${int(c.soldUnits)} sold, ${int(c.lostUnits)} lost`}>
            <i className={`is-sold${c.lostUnits > 0 ? " is-under" : ""}`} style={{ height: `${share(c.soldUnits) * 100}%` }}/>
            {c.lostUnits > 0 && <i className="is-lost" style={{ bottom: `calc(${share(c.soldUnits) * 100}% + 2px)`, height: `${share(c.lostUnits) * 100}%` }}/>}
          </button>)}
      </div>
      {shown && <ChartTip id={tip.id} at={(at! + 0.5) / n} span={1 / n} top={share(shown.soldUnits + shown.lostUnits)}
        heading={<>{columnLabel(shown)}{note && <span className="pd-store-tipnote">{note}</span>}</>}
        rows={[
          { label: "Sold", value: int(shown.soldUnits), color: palette.olive },
          { label: "Lost", value: int(shown.lostUnits), color: palette.pumpkin },
          { label: "Revenue", value: dollars(shown.revenueUsd) },
        ]}/>}
    </ChartFrame>
  </div>;
}

/**
 * Where each stockout label hangs, given where the bands start (0..1, in order). Lines closer than LABEL_ROOM
 * form a group whose labels share one anchor: right of the group's last line, or, flipped, left of its first.
 * So no dashed line runs through a label (the labels themselves are stacked one per line of text).
 */
const LABEL_ROOM = 0.4;
function labelAnchors(lefts: number[]): { at: number; flip: number }[] {
  const out: { at: number; flip: number }[] = [];
  for (let i = 0; i < lefts.length;) {
    let j = i + 1;
    while (j < lefts.length && lefts[j] - lefts[j - 1] < LABEL_ROOM) j++;
    const group = { at: Math.max(...lefts.slice(i, j)), flip: Math.min(...lefts.slice(i, j)) };
    for (; i < j; i++) out.push(group);
  }
  return out;
}

/* ── Week and season ─────────────────────────────────────── */

const PERIOD_ROWS: { label: string; cell: (p: StorePeriod) => ReactNode }[] = [
  { label: "Revenue", cell: p => money(p.revenueUsd) },
  { label: "vs plan", cell: p => <DeltaText value={change(p.revenueUsd, p.planUsd)}/> },
  { label: "vs last season", cell: p => <DeltaText value={change(p.revenueUsd, p.lyUsd)}/> },
  { label: "Fill rate", cell: p => pct(p.fillRate) },
  { label: "Shelf availability", cell: p => pct(p.availability) },
  { label: "Shrink", cell: p => money(p.shrinkUsd) },
];

function WeekPanel({ store, busy }: { store: StoreNow | null | undefined; busy?: boolean }) {
  return <Panel title="Week and season" pad="flush" gap={10} busy={busy} className="pd-store-week is-grow">
    {store ? <div className="pd-table-scroll">
      <div className="pd-table pd-store-periods" role="table" aria-label="Week and season">
        <div className="pd-thead" role="row"><span role="columnheader"><span className="pd-sr">Measure</span></span><span className="pd-right" role="columnheader">Last 7 days</span><span className="pd-right" role="columnheader">Season to date</span></div>
        {PERIOD_ROWS.map(row => <div className="pd-tr" role="row" key={row.label}>
          <span role="rowheader">{row.label}</span>
          <span className="pd-right" role="cell">{row.cell(store.week)}</span>
          <span className="pd-right" role="cell">{row.cell(store.season)}</span>
        </div>)}
      </div>
    </div> : <div className="pd-store-pending is-flush"><Pending part={store} what="the week and season" rows={6} minHeight={280}/></div>}
  </Panel>;
}

/* ── Next delivery ───────────────────────────────────────── */

function NextPanel({ store, nextTruck, now, busy }: { store: StoreNow | null | undefined; nextTruck: StoreViewModel["nextTruck"]; now?: string; busy?: boolean }) {
  const yours = useViewerZone();
  return <Panel title="Next delivery" gap={12} busy={busy} className="pd-store-nextdel">
    {!store ? <Pending part={store} what="the next delivery" minHeight={96}/>
      : store.next ? <NextTrip store={store} next={store.next} nextTruck={nextTruck}/>
      : <div className="pd-store-next is-none">
        <strong>None on the way</strong>
        {store.nextPlannedAt && <span>Next planned · {dayWord(store.nextPlannedAt, now, store.tz)} {bothTimes(store.nextPlannedAt, store.tz, yours)}</span>}
      </div>}
  </Panel>;
}

/** The van heading here, as one link to its page: blush when it is late, stone when it is on schedule. */
function NextTrip({ store, next, nextTruck }: { store: StoreNow; next: StoreNextTrip; nextTruck: StoreViewModel["nextTruck"] }) {
  const { tz } = store;
  const yours = useViewerZone();
  const status = lateStatus(next.late);
  const cause = next.late.note ?? (next.late.cause ? DELAY_CAUSE_LABEL[next.late.cause] : null);
  const loads = store.stock.filter(l => l.incoming > 0).map(l => `${l.variety} ${int(l.incoming)}`).join(" · ") || plural(next.units, "pumpkin");
  const overdueKm = nextTruck && nextTruck.kmToService < 0 ? -nextTruck.kmToService : null;
  return <Link to={routes.truck(next.truckId)} className={`pd-store-next${status === "on_schedule" ? "" : " is-problem"}`}>
    <span className="pd-store-next-body">
      <strong>{next.truckLabel} · {next.driverName}</strong>
      <span className="pd-store-next-status">
        <StatusChip status={status} minutes={next.late.minutes} size="lg"/>
        <span><strong>{next.status === "unloading" ? "Arrived" : "ETA"} {bothTimes(next.etaAt, tz, yours)}</strong> · planned {bothTimes(next.plannedAt, tz, yours)}</span>
      </span>
      {status !== "on_schedule" && cause && <span>{cause}</span>}
      <span>{loads}</span>
      {overdueKm != null && <span className="pd-store-next-flag">Service overdue by {km(overdueKm)}</span>}
    </span>
    <Icon name="chevronRight" size={16} strokeWidth={2}/>
  </Link>;
}

/* ── Stockouts ───────────────────────────────────────────── */

function StockoutsPanel({ stockouts, tz, busy }: { stockouts: StoreStockout[] | null | undefined; tz: string; busy?: boolean }) {
  const rows = stockouts && [...stockouts].sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  const lostUsd = rows?.reduce((sum, e) => sum + e.lostUsd, 0) ?? 0;
  return <Panel title="Stockouts" aside={rows?.length ? `Last 7 days · ${money(lostUsd, 2)} lost` : "Last 7 days"} pad="list" gap={12} busy={busy} className="pd-store-outs pd-store-list">
    {!rows ? <Pending part={rows} what="stockouts" minHeight={120}/>
      : rows.length === 0 ? <PanelState state="empty" line/>
      : <div>{rows.map(e => <StockoutRow key={`${e.variety}-${e.startedAt}`} episode={e} tz={tz}/>)}</div>}
  </Panel>;
}

/** One episode. It links to the van when a late delivery caused it; otherwise it is a plain row. */
function StockoutRow({ episode: e, tz }: { episode: StoreStockout; tz: string }) {
  const when = `${e.daysAgo === 0 ? "Today" : dayLabel(e.startedAt, tz)} · ${time(e.startedAt, tz)}–${e.endedAt && !e.isOngoing ? time(e.endedAt, tz) : "now"}`;
  const cause = [e.cause && CAUSE[e.cause], e.delayCause && DELAY_CAUSE_LABEL[e.delayCause].toLowerCase()].filter(Boolean).join(", ");
  const lost = <span className="pd-store-lost"><strong>{int(e.lostUnits)} lost</strong><span>{money(e.lostUsd, 2)}</span></span>;
  const top = <span className="pd-store-row-top"><strong>{e.variety}</strong><span>{when}</span>{e.isOngoing && <Tag tone="out" size="sm">now</Tag>}</span>;
  if (e.truckId) return <RowLink to={routes.truck(e.truckId)} pad={10} trailing={lost}>
    {top}
    <span className="pd-store-row-sub">{cause}{cause && e.truckLabel && " · "}{e.truckLabel && <span className="pd-store-truck">{e.truckLabel}</span>}</span>
  </RowLink>;
  return <div className="pd-store-row">
    <span>{top}<span className="pd-store-row-sub">{cause}</span></span>
    {lost}
  </div>;
}

/* ── Deliveries ──────────────────────────────────────────── */

function DeliveriesPanel({ deliveries, tz, busy }: { deliveries: StoreDelivery[] | null | undefined; tz: string; busy?: boolean }) {
  const rows = deliveries && [...deliveries].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, MAX_DELIVERIES);
  return <Panel title="Deliveries" pad="list" gap={12} busy={busy} className="pd-store-drops pd-store-list">
    {!rows ? <Pending part={rows} what="deliveries" minHeight={120}/>
      : rows.length === 0 ? <PanelState state="empty" line/>
      : <div>{rows.map(d => <DeliveryRow key={d.tripId} delivery={d} tz={tz}/>)}</div>}
  </Panel>;
}

function DeliveryRow({ delivery: d, tz }: { delivery: StoreDelivery; tz: string }) {
  const status = lateStatus(d.late);
  const yours = useViewerZone();
  const detail = [d.truckLabel, plural(d.units, "pumpkin"), d.damagedUnits > 0 && `${int(d.damagedUnits)} damaged`].filter(Boolean).join(" · ");
  return <RowLink to={routes.truck(d.truckId)} pad={10}>
    <span className="pd-store-row-top is-spread">
      <span><strong>{d.daysAgo === 0 ? "Today" : dayLabel(localDate(d.localDate))}</strong> <span>· {d.isDelivered ? "" : "ETA "}{bothTimes(d.at, tz, yours)}</span></span>
      <StatusChip status={status} minutes={d.late.minutes} label={status === "on_schedule" ? (d.isDelivered ? "On time" : "On schedule") : undefined}/>
    </span>
    <span className="pd-store-row-sub">{detail}</span>
  </RowLink>;
}

/* ── Details ─────────────────────────────────────────────── */

function DetailsPanel({ details, busy }: { details: StoreDetails | null | undefined; busy?: boolean }) {
  return <Panel title="Details" pad="list" gap={12} busy={busy} className="pd-store-details pd-store-list is-grow">
    {details ? <Facts items={[
      { label: "Format", value: capitalize(details.format) },
      { label: "Hours", value: `${details.openTime.slice(0, 5)}–${details.closeTime.slice(0, 5)} ${details.openDays}` },
      { label: "Shelf capacity", value: plural(details.shelfCapacityUnits, "pumpkin") },
      { label: "Opened", value: String(details.openedYear) },
      { label: "Store lead", value: details.storeLead },
    ]}/> : <Pending part={details} what="store details" rows={5} minHeight={180}/>}
  </Panel>;
}
