/*
 * City page (/stores/city/:cityKey): one city. A calm band of figures, the period's chart and the stores.
 * The band's left part and the chart follow the top bar's time switch (Today · Yesterday · 7 days · 30 days); its
 * right part is always right now: the shelf that runs out first and the vans on the way. The chart shows a small
 * card per column on hover, keyboard focus or a finger's scrub (ChartTip). The Stores table keeps its shelves,
 * cover and next van right now, and its Sold, Lost, Revenue and vs plan follow the switch. Stores link to the
 * store page, vans to the truck page. The band is DrillBand (shared with the Store page). Styles: city.css.
 */
import "./city.css";
import { ChartTip, columnLabel, periodAxis, useChartTip } from "../components/ChartTip";
import { Bit, BLANK, DrillBand, dotted, leastCover, LOW_COVER_HOURS, NowFigure, type Place, RunsOutFigure, runsShort, VanMark, vanTime, whenLabel, whenWords } from "../components/DrillBand";
import { BackTitle, ChartFrame, DeltaText, Icon, Legend, type LegendItem, Meter, Panel, PanelState, StatusChip, Tag } from "../components/ui";
import { bothTimes, change, dayLabel, dollars, duration, int, money, niceScale, num, plural, time, yourTime } from "../format";
import { useViewerZone } from "../viewer";
import { Link } from "../nav";
import { routes } from "../routes";
import { palette } from "../theme";
import { DRILL_PERIOD, type DrillPeriod, type LateInfo, lateStatus, type PageProps, type PeriodColumn, type PeriodSeries, type PeriodTotals, type StockStatus, type StoreFormat, type TripStatus, type Variety, VARIETIES } from "../types";

/* ── View model ──────────────────────────────────────────── */

/** One variety on a store's shelf. store_now: on_hand_<variety>, cap_<variety>, cover_hours_<variety>. */
export type CityShelf = {
  variety: Variety;
  onHand: number;
  capacity: number;
  /** Open hours of cover at the recent selling rate; 0 on an empty shelf, null when unknown. */
  coverHours: number | null;
};

/**
 * A van heading to one of the city's stores now. fleet_now where dest_city_key = this city and status is loading,
 * driving, stopped or unloading; still on the road first, soonest arrival first (no ETA last), unloading last.
 */
export type CityVan = {
  /** fleet_now: truck_id, fleet_no, truck_label ("Express 107") */
  truckId: string;
  fleetNo: number;
  label: string;
  /** fleet_now.status: an unloading van has arrived, and its etaAt is when it did. */
  status: TripStatus;
  /** fleet_now: late_minutes, delay_cause, delay_note */
  late: LateInfo;
  /** fleet_now: dest_store_id, dest_store_name: the store it is heading to ("Express 311 to Ancoats"). */
  storeId: number | null;
  storeName: string | null;
  /** fleet_now.eta_at: when it arrives, or arrived while unloading (the hub's clock is the city's). */
  etaAt: string | null;
};

/** A stockout still running in the city. stockouts where city_key = this city and is_ongoing: store_id, store_name, variety_name, started_at. */
export type CityStockout = { storeId: number; storeName: string; variety: Variety; startedAt: string };

/** One row of the Stores table. store_now where city_key = this city. */
export type CityStore = {
  /** store_now: store_id, store_name, store_format */
  id: number;
  name: string;
  format: StoreFormat;
  /** store_now: stock_status, out_variety, out_since, low_variety */
  stockStatus: StockStatus;
  outVariety: Variety | null;
  outSince: string | null;
  lowVariety: Variety | null;
  /** store_now: on_hand_carving / _cooking / _mini, cap_*, cover_hours_* (Carving, Cooking, Mini in that order) */
  shelves: CityShelf[];
  /**
   * store_now.open_hours_to_next_delivery: open hours until the next van can restock the store. A shelf whose
   * cover is shorter runs out first (the contract's "low"). Left out, a shelf counts as short under 8 open hours.
   */
  restockHours?: number | null;
  /** store_now: sold_today_units, revenue_today_usd, lost_today_units, lost_today_usd (Today's figures until the period's rows arrive) */
  soldToday: number;
  revenueToday: number;
  lostToday: number;
  lostTodayUsd: number;
  /**
   * The van heading here now, else null. store_now: next_truck_id, next_truck_label, next_status, next_eta_at,
   * next_late_minutes, next_delay_cause, next_delay_note. While it unloads, etaAt is when it arrived.
   */
  nextVan: { truckId: string; label: string; status: TripStatus; etaAt: string | null; late: LateInfo } | null;
  /** The next planned delivery when no van is on the way. store_now: next_planned_delivery_at */
  nextPlannedAt: string | null;
};

/**
 * One option of the time switch: the city's figures, its stores' and the chart. Each part is undefined while
 * its query loads; `errors` says which failed.
 */
export type CityPeriod = {
  /** The band's Sold and Lost: daily_store_sales where city_key = this city and days_ago in the period, over its stores. */
  totals?: PeriodTotals;
  /** The store table's Sold, Lost, Revenue and vs plan, by store id (every store of the city; zero without sales). */
  byStore?: Record<number, PeriodTotals>;
  /**
   * The chart. Today and Yesterday: by local hour across the opening day, hourly_store_sales (days_ago 0 / 1)
   * summed over the stores; today's running hour is current and the hours after it are placeholders. 7 and 30
   * days: by local day from the same daily rows as the figures, today's column current while the city trades.
   */
  chart?: PeriodSeries;
  /** What failed to load: the figures (totals, byStore) or the chart. A short message for the panel. */
  errors?: { figures?: string; chart?: string };
};

/** The City page (/stores/city/:cityKey). Each part is undefined while its query loads. */
export type CityViewModel = {
  /** The title row. Undefined while loading; null when the key in the URL matches no city. */
  city?: {
    /** cities: city_key, city_name, country_name, tz */
    key: string;
    name: string;
    countryName: string;
    tz: string;
    /** store_now over the city's stores: bool_or(is_open), min(opens_at), max(closes_at) */
    isOpen: boolean;
    opensAt: string | null;
    closesAt: string | null;
    /** Open hours in a trading day, to print cover in days. stores: close_time − open_time (12; 11 in GB and DE) */
    openHours: number;
  } | null;
  /** Right now: the Stores table's shelves, cover and next van, and the band's "Runs out first". store_now. */
  stores?: CityStore[];
  /** Right now: stockouts still running (the shaded stretch on the Today chart). */
  stockouts?: CityStockout[];
  /** Right now: the band's "Vans on the way". */
  vans?: CityVan[];
  /**
   * The time switch's figures, by option. The live hook fills every option it has rows for (the figures and the
   * 7 and 30 days charts share one query; the Today and Yesterday charts load when picked); the fixture fills all four.
   */
  periods?: Partial<Record<DrillPeriod, CityPeriod>>;
  /** What failed to load, by right-now part: a short message for the panel. */
  errors?: { stores?: string; vans?: string };
};

/**
 * The page's own state. `period` stands in for the top bar's switch in the static preview only
 * (`--state '{"period":"7d"}'`); the app passes the `period` prop.
 */
export type CityState = { period?: DrillPeriod };

/* ── Helpers ─────────────────────────────────────────────── */

const FORMAT_LABEL: Record<StoreFormat, string> = { flagship: "Flagship", standard: "Standard", express: "Express" };
const STATUS_RANK: Record<StockStatus, number> = { out: 0, low: 1, ok: 2 };
const EMPTY_CHART: Record<DrillPeriod, string> = { today: "No sales yet today", yesterday: "No sales yesterday", "7d": "No sales in these days", "30d": "No sales in these days" };

const sum = <T,>(rows: T[], pick: (row: T) => number) => rows.reduce((total, row) => total + pick(row), 0);
const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
const share = (v: number) => `${(Math.max(0, Math.min(1, v)) * 100).toFixed(2)}%`;

/** Cover as words: "1.2 open hours" while it is tight (under LOW_COVER_HOURS), "1.6 days" after that. */
const coverLabel = (hours: number | null | undefined, openHours: number) =>
  hours == null ? "—" : hours < LOW_COVER_HOURS ? `${num(hours, 1)} open hours` : `${num(hours / openHours, 1)} days`;

/** The city's shelf with the least cover, its store, and how many other shelves are empty too. */
function firstToRunOut(stores: CityStore[]) {
  const first = leastCover(stores.flatMap(store => store.shelves.map(shelf => ({ ...shelf, store }))));
  return first && { store: first.shelf.store, shelf: first.shelf, hours: first.hours, moreOut: first.moreOut };
}

/* ── Page ────────────────────────────────────────────────── */

/**
 * One city: what it sold and lost in the picked period and by hour or day, what runs out first and what is on
 * the way right now, and its stores with their shelves, cover, the period's figures and next van.
 */
export function CityPage({ vm, clock, initial, refreshing, period: picked }: PageProps<CityViewModel, CityState> & { period?: DrillPeriod }) {
  const yours = useViewerZone();
  const { city, stores, stockouts, vans, errors } = vm;
  const now = clock?.now;
  const period = picked ?? initial?.period ?? "today";
  const info = DRILL_PERIOD[period];
  const part = vm.periods?.[period];

  if (city === null) return <>
    <BackTitle to={routes.stores()} backLabel="Stores" title="City"/>
    <PanelState state="empty" message="No such city"/>
  </>;

  const tz = city?.tz ?? "UTC";
  const place: Place = { tz, now, yours, openHours: city?.openHours || 12 };
  const opening = !city ? null
    : city.isOpen ? (city.closesAt ? `open until ${time(city.closesAt, tz)}` : "open")
    : city.opensAt ? `closed until ${whenWords(city.opensAt, now, tz)}` : "closed";
  // Today's figures come from store_now until the period's own rows arrive; another period waits for its rows.
  const live = period === "today" ? stores : undefined;
  const totals = part?.totals ?? (live && todayTotals(live));
  const byStore = part?.byStore ?? (live && Object.fromEntries(live.map(s => [s.id, todayTotals([s])])));
  const chart = part?.chart;
  const out = period === "today" && chart ? outSpan(chart.columns, stockouts ?? [], tz, now) : null;
  const legend: LegendItem[] = [{ label: "Sold", color: palette.olive }, { label: "Lost", color: palette.pumpkin }];
  if (out) legend.push({ label: out.label, color: palette.blush, shape: "box", border: palette.pumpkin });

  return <>
    <BackTitle to={routes.stores()} backLabel="Stores" title={city?.name ?? BLANK}
      meta={city && [city.countryName, now && bothTimes(now, tz, yours, true), stores && plural(stores.length, "store"), opening]}/>

    {/* The Store band's rule: Today keeps store_now's figures when the daily rows fail; the error shows only with nothing to show. */}
    <DrillBand period={period} totals={totals} figuresError={!totals ? part?.errors?.figures : undefined} busy={refreshing}>
      <RunsOutFirst stores={stores} stockouts={stockouts} error={errors?.stores} place={place}/>
      <VansOnTheWay vans={vans} stores={stores} error={errors?.vans} place={place}/>
    </DrillBand>

    <Panel title={info.chart} gap={16} busy={refreshing} className="pd-city-chart-panel"
      aside={chart && chart.columns.length > 0 && <Legend items={legend}/>}>
      {part?.errors?.chart ? <PanelState state="error" message={part.errors.chart}/>
        : !chart ? <PanelState state="loading" chart minHeight={250}/>
        : !chart.columns.length ? <PanelState state="empty" message={EMPTY_CHART[period]}/>
        : <PeriodChart key={period} series={chart} out={out}/>}
    </Panel>

    <Panel title="Stores" pad="flush" gap={10} busy={refreshing} aside={<span className="pd-city-stores-when">Sales · {info.title}</span>}>
      {errors?.stores ? <div className="pd-city-inset"><PanelState state="error" message={errors.stores}/></div>
        : !stores ? <div className="pd-city-inset"><PanelState state="loading" rows={4} minHeight={240}/></div>
        : !stores.length ? <div className="pd-city-inset"><PanelState state="empty" message="No stores"/></div>
        : <StoresTable stores={stores} byStore={byStore} title={info.title} place={place}/>}
    </Panel>
  </>;
}

/** store_now's today columns added up: the stand-in for Today's figures (no plan: store_now has none for today). */
const todayTotals = (stores: CityStore[]): PeriodTotals => ({
  soldUnits: sum(stores, s => s.soldToday), revenueUsd: sum(stores, s => s.revenueToday),
  lostUnits: sum(stores, s => s.lostToday), lostUsd: sum(stores, s => s.lostTodayUsd), planUsd: null,
});

/* ── The band (DrillBand): right now ───────────────────── */

/**
 * The shelf with the least cover in the city, at which store, and when it runs dry next to when its next van
 * comes (RunsOutFigure). The mark is the store's stock status; the figure opens the store.
 */
function RunsOutFirst({ stores, stockouts, error, place }: { stores?: CityStore[]; stockouts?: CityStockout[]; error?: string; place: Place }) {
  const first = stores && firstToRunOut(stores);
  if (!first) return <RunsOutFigure first={null} ready={!!stores} error={error} place={place}/>;
  const { store, shelf, hours, moreOut } = first;
  const since = hours <= 0 ? (store.outVariety === shelf.variety && store.outSince) || stockouts?.find(o => o.storeId === store.id && o.variety === shelf.variety)?.startedAt : null;
  const vanAt = store.nextVan?.etaAt ?? store.nextPlannedAt;
  return <RunsOutFigure ready error={error} place={place} first={{
    what: `${shelf.variety} at ${store.name}`, status: store.stockStatus, hours, short: runsShort(shelf, store.restockHours), since,
    van: vanAt ? { at: vanAt, arrived: store.nextVan?.status === "unloading" } : null, moreOut, to: routes.store(store.id),
  }}/>;
}

/**
 * How many vans are heading to the city's stores, and the first to arrive: where to, when (both clocks), how
 * late. A van already unloading leads only when no other is on the road, as "at Ancoats · arrived 14:15".
 */
function VansOnTheWay({ vans, stores, error, place }: { vans?: CityVan[]; stores?: CityStore[]; error?: string; place: Place }) {
  const first = vans?.[0];
  if (!vans || !first) {
    // None on the road: the next planned delivery to any of the stores, if one is known.
    const planned = stores?.map(s => s.nextPlannedAt).filter((at): at is string => !!at).sort()[0];
    return <NowFigure area="van" label="Vans on the way" mark={<VanMark/>} main={vans ? "No vans" : error ? "—" : null}
      note={error ?? (!vans ? BLANK : planned ? `next delivery ${vanTime(planned, place)}` : "none on the road now")}/>;
  }
  // The time, the delay and the count each wrap as a whole, the dot before them staying on the line above.
  const arrived = first.status === "unloading";
  return <NowFigure area="van" to={routes.truck(first.truckId)} label="Vans on the way" mark={<VanMark/>} main={plural(vans.length, "van")}
    note={dotted([
      `${first.label}${first.storeName ? ` ${arrived ? "at" : "to"} ${first.storeName}` : ""}`,
      first.etaAt && <Bit>{arrived && "arrived "}{vanTime(first.etaAt, place)}</Bit>,
      lateStatus(first.late) !== "on_schedule" && <Bit alert>{duration(first.late.minutes)} late</Bit>,
      vans.length > 1 && <Bit>+{vans.length - 1} more</Bit>,
    ])}/>;
}

/* ── The period's chart ──────────────────────────────────── */

/** The plot's height (px), and how far above it a column's card may rise, over the panel's title row (px). */
const PLOT_H = 220;
const TIP_REACH = 48;

/** The stretch of today a stockout has been running, as shares of the hour axis, and what it says. */
type OutSpan = { from: number; to: number; label: string };

/**
 * Where the shaded stockout stretch lies on today's hour axis (0..1, each hour one equal column): from the
 * earliest stockout still running (the left edge when it began on an earlier day) to now.
 */
function outSpan(columns: PeriodColumn[], stockouts: CityStockout[], tz: string, now?: string): OutSpan | null {
  const firstHour = columns[0]?.hour;
  if (!stockouts.length || firstHour == null) return null;
  const at = (iso: string) => { const [h, m] = time(iso, tz).split(":").map(Number); return (h + m / 60 - firstHour) / columns.length; };
  const first = stockouts.reduce((a, b) => a.startedAt <= b.startedAt ? a : b);
  const earlier = now != null && dayLabel(first.startedAt, tz) !== dayLabel(now, tz);
  const from = earlier ? 0 : Math.max(0, at(first.startedAt));
  const to = now ? Math.min(1, at(now)) : 1;
  if (!(to > from)) return null;
  const names = new Set(stockouts.map(s => s.storeName));
  const label = names.size > 1 ? `${names.size} stores out` : `${first.storeName} out of ${Array.from(new Set(stockouts.map(s => s.variety))).join(", ")}`;
  return { from, to, label };
}

/**
 * Sold and lost pumpkins per column as stacked bars: by hour across the city's opening day (hours not reached
 * yet are faint stubs) or by day. The running hour or today's bar is faded, still filling. A column under the
 * mouse, the keyboard focus or a finger shows its card (ChartTip); the stockout stretch is shaded on Today.
 * Mount it per period (`key`), so a card picked in one period does not reappear over another's column.
 */
function PeriodChart({ series, out }: { series: PeriodSeries; out: OutSpan | null }) {
  const { columns } = series;
  const count = columns.length;
  // Tab lands on the running column, else the last one reached.
  const current = columns.findIndex(c => c.isCurrent);
  const tip = useChartTip(count, current >= 0 ? current : columns.reduce((last, c, i) => c.isFuture ? last : i, -1));
  // Hours not reached yet have nothing to show.
  const shown = tip.index != null && !columns[tip.index].isFuture ? tip.index : null;
  const picked = shown != null ? columns[shown] : null;
  // At least 0–5, so an empty day still has a plain axis (and no two ticks print the same).
  const scale = niceScale(Math.max(5, ...columns.map(c => c.soldUnits + c.lostUnits)));
  const height = (units: number) => share(units / scale.top);

  return <div className={cx("pd-city-chart", count > 14 && "is-dense")}>
    <ChartFrame height={PLOT_H} ticks={scale.ticks.map(t => ({ at: t / scale.top, label: int(t) }))}
      backdrop={out && <span className="pd-city-out" aria-hidden="true" style={{ left: share(out.from), right: share(1 - out.to) }}/>}
      xAxis={periodAxis(columns)}>
      <div className="pd-city-bars" {...tip.track}>
        {/* The label holds every figure the card shows, so the card is not read out again (no aria-describedby). */}
        {columns.map((c, i) => c.isFuture
          ? <span key={c.key} className="pd-city-col is-future" aria-hidden="true"><span className="pd-city-stub"/></span>
          : <button type="button" key={c.key} {...tip.column(i, false)} className={cx("pd-city-col", i === shown && "is-on", c.isCurrent && "is-current")}
            aria-label={`${columnLabel(c)}${c.isCurrent && c.hour == null ? ", so far" : ""}: ${int(c.soldUnits)} sold, ${int(c.lostUnits)} lost, ${dollars(c.revenueUsd)} revenue`}>
            <span className={cx("pd-city-bar-sold", c.lostUnits > 0 && "is-capped")} style={{ height: height(c.soldUnits) }}/>
            {c.lostUnits > 0 && <span className="pd-city-bar-lost" style={{ bottom: `calc(${height(c.soldUnits)} + 2px)`, height: height(c.lostUnits) }}/>}
          </button>)}
      </div>
      {/* The card's room: the plot and a strip above it, so a card clears all but the tallest bars, as on the design. */}
      {picked && shown != null && <span className="pd-city-tip-room" style={{ top: -TIP_REACH }}>
        <ChartTip id={tip.id} heading={columnLabel(picked)}
          at={(shown + 0.5) / count} span={1 / count} top={(picked.soldUnits + picked.lostUnits) / scale.top * PLOT_H / (PLOT_H + TIP_REACH)}
          rows={[
            { label: "Sold", value: int(picked.soldUnits), color: palette.olive },
            { label: "Lost", value: int(picked.lostUnits), color: palette.pumpkin },
            { label: "Revenue", value: dollars(picked.revenueUsd) },
          ]}/>
      </span>}
    </ChartFrame>
  </div>;
}

/* ── Stores ──────────────────────────────────────────────── */

/**
 * The city's stores, shortest on stock first. A wide grid that scrolls sideways when the panel is narrower
 * (the store stays put); on phones each store becomes a stacked block and the cell labels show. Two quiet group
 * headings say what is right now (Pumpkins on hand) and what follows the switch (the period's name).
 */
function StoresTable({ stores, byStore, title, place }: { stores: CityStore[]; byStore?: Record<number, PeriodTotals>; title: string; place: Place }) {
  const cover = (s: CityStore) => leastCover(s.shelves)?.hours ?? Infinity;
  const rows = [...stores].sort((a, b) => STATUS_RANK[a.stockStatus] - STATUS_RANK[b.stockStatus] || cover(a) - cover(b));
  return <div className="pd-table-scroll has-fade">
    <div className="pd-table pd-city-table">
      {/* Every cell carries its own label (read out, and shown on phones), so the header rows are for the eye only. */}
      <div className="pd-thead" aria-hidden="true">
        <span className="pd-sticky-col pd-city-th-store">Store</span>
        <span className="pd-city-th-group is-stock">Pumpkins on hand</span>
        <span className="pd-city-th-group is-period">{title}</span>
        <span className="pd-city-th-stock">{VARIETIES.map(v => <span key={v}>{v}</span>)}</span>
        <span>Runs out first</span>
        <span className="pd-right">Sold</span>
        <span className="pd-right">Lost</span>
        <span className="pd-right">Revenue</span>
        <span className="pd-right">vs plan</span>
        <span className="pd-city-th-van">Next van</span>
      </div>
      {rows.map(s => <StoreRow key={s.id} store={s} figures={byStore?.[s.id]} title={title} place={place}/>)}
    </div>
    {/* The right edge fades while columns are off to the side (not on phones, where nothing scrolls). */}
    <span className="pd-table-fade pd-city-fade" aria-hidden="true"/>
  </div>;
}

/** A cell's label: shown on phones, read out always; a period figure's names the period for the ear. */
const CellLabel = ({ children, title }: { children: string; title?: string }) =>
  <span className="pd-city-k">{children}{title && <span className="pd-sr">, {title}</span>}</span>;

function StoreRow({ store: s, figures: f, title, place: { tz, now, yours, openHours } }: { store: CityStore; figures?: PeriodTotals; title: string; place: Place }) {
  const tight = leastCover(s.shelves);
  // Van times on the hub's clock (the city's); the viewer's goes on a small line of its own under it.
  const also = (at: string | null) => { const y = at ? yourTime(at, tz, yours) : null; return y && <small className="pd-city-van-yours">{y}</small>; };
  const out = s.stockStatus === "out", low = s.stockStatus === "low";
  const lost = f?.lostUnits ?? 0;
  return <div className="pd-tr">
    <Link to={routes.store(s.id)} className="pd-sticky-col pd-city-store">
      <span className="pd-city-store-name">{s.name}<Icon name="chevronRight" size={14} strokeWidth={2}/></span>
      <span className="pd-city-store-sub">{FORMAT_LABEL[s.format]}{out && <Tag tone="out" size="sm">Out</Tag>}{low && <Tag tone="low" size="sm">Low</Tag>}</span>
    </Link>

    <div className="pd-city-stock">
      {s.shelves.map(shelf => {
        const empty = shelf.onHand <= 0;
        // Short is the contract's "low": this variety runs out before the next van can restock it.
        const short = !empty && runsShort(shelf, s.restockHours);
        return <div key={shelf.variety} className={cx("pd-city-shelf", empty ? "is-empty" : short && "is-short")}>
          <CellLabel>{shelf.variety}</CellLabel>
          <strong>{int(shelf.onHand)}</strong>
          <span className="pd-sr"> of {int(shelf.capacity)} on the shelf{empty ? ", out of stock" : short ? ", low" : ""}</span>
          <Meter value={shelf.capacity > 0 ? shelf.onHand / shelf.capacity : 0} height={6} color={short ? palette.pumpkin : undefined}/>
        </div>;
      })}
    </div>

    <div className={cx("pd-city-cover", out ? "is-out" : low && "is-low")}>
      <CellLabel>Runs out first</CellLabel>
      <strong>{out ? "Out" : coverLabel(tight?.hours, openHours)}</strong>
      <small>{out
        ? [s.outVariety, s.outSince && `since ${whenLabel(s.outSince, now, tz)}`].filter(Boolean).join(" ")
        : (low && s.lowVariety) || tight?.shelf.variety}</small>
    </div>

    <div className="pd-right pd-city-num"><CellLabel title={title}>Sold</CellLabel>{int(f?.soldUnits)}</div>
    <div className={cx("pd-right pd-city-lost", lost > 0 && "is-some")}>
      <CellLabel title={title}>Lost</CellLabel>
      <strong>{int(f?.lostUnits)}</strong>
      {f && lost > 0 && <small>{money(f.lostUsd, 2)}</small>}
    </div>
    <div className="pd-right pd-city-num"><CellLabel title={title}>Revenue</CellLabel>{money(f?.revenueUsd)}</div>
    <div className="pd-right pd-city-num"><CellLabel title={title}>vs plan</CellLabel><DeltaText value={f ? change(f.revenueUsd, f.planUsd) : null}/></div>

    <div className="pd-city-van">
      <CellLabel>Next van</CellLabel>
      {s.nextVan
        ? <Link to={routes.truck(s.nextVan.truckId)}>
          <span>{s.nextVan.label}{s.nextVan.etaAt && ` · ${whenLabel(s.nextVan.etaAt, now, tz)}`}</span>
          {also(s.nextVan.etaAt)}
          {lateStatus(s.nextVan.late) !== "on_schedule" && <StatusChip status={lateStatus(s.nextVan.late)} minutes={s.nextVan.late.minutes} size="sm"/>}
        </Link>
        : <span className="pd-city-van-plan">{s.nextPlannedAt ? <><span>{whenLabel(s.nextPlannedAt, now, tz, "Today")}</span>{also(s.nextPlannedAt)}</> : "—"}</span>}
    </div>
  </div>;
}
