import { useEffect, useId, useRef, useState } from "react";
import "./glance.css";
import { Define, type DefineExtra, elapsed } from "../../components/Define";
import { PumpkinMark } from "../../components/Pumpkin";
import { DeltaChip, PanelState } from "../../components/ui";
import { change, dollars, int, money, pct, plural, price, share } from "../../format";
import { changeRow, type ExtraRow, PERIOD_TITLE } from "./extra";
import type { BusinessPeriod, BusinessPulse, BusinessSeason, BusinessTotals, BusinessViewModel } from "./model";

/*
 * The top of Business, for a glance: the period's revenue (whole dollars, climbing as sales come in) beside
 * the pumpkins sold, both in the sans with even digits, and the revenue's comparisons as chips; the latest
 * sale under them, with a pumpkin pulsing while sales come in; and the season vine, grown to the share of the
 * season plan taken so far, with a pumpkin where the plan is today. Hovering a figure or the vine (or pressing
 * its label) opens its definition card with the numbers behind it (Define's `extra`).
 * Data: vm.totals (daily_store_sales), vm.pulse (sales_pulse, recent_sales: both figures add how far the live
 * sales are ahead of the totals, so they are of the same moment; the comparisons stay on the totals),
 * vm.season (season_plan, season_landing). Styles: glance.css; the pumpkin: components/Pumpkin.tsx.
 */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

const HERO_LABEL: Record<BusinessPeriod, string> = {
  today: "Revenue · today so far",
  "7d": "Revenue · last 7 days",
  season: "Revenue · season to date",
};
/** A sale newer than this (seconds) keeps the live pumpkin pulsing. */
const LIVE_SECONDS = 15 * 60;

/** "Wednesday", from a local date ("2026-10-28"). */
const weekdayOf = (date?: string) => {
  const d = date ? new Date(`${date}T12:00:00Z`) : null;
  return d && !Number.isNaN(d.valueOf()) ? new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(d) : null;
};

export type HeroProps = {
  period: BusinessPeriod;
  /** vm.totals[period] */
  totals?: BusinessTotals;
  season?: BusinessSeason;
  pulse?: BusinessPulse;
  /**
   * The scope's local today (vm.today, "2026-10-29" for Japan in the UTC evening): "vs last Thursday" on the
   * Today tab, the same local weekday the comparison is made with.
   */
  today?: string;
  /** vm.failed: totals, season and pulse are read. */
  failed?: BusinessViewModel["failed"];
  onRetry?: () => void;
  /** A refresh is running: the numbers dim (the labels stay crisp, their cards may be open). */
  busy?: boolean;
  /**
   * The shell's scope as a string ("EU-DE"). A new scope, like a new period, is a different total: it shows
   * at once instead of counting there. Only changes within the same scope and period count up.
   */
  scopeKey?: string;
};

/**
 * Revenue and pumpkins sold side by side (counting up when they change), each label opening its definition;
 * the delta chips against plan, last season and the period before; the live line and the season vine.
 */
export function Hero({ period, totals, season, pulse, today, failed, onRetry, busy, scopeKey = "" }: HeroProps) {
  const revenueRef = useRef<HTMLDivElement>(null);
  const unitsRef = useRef<HTMLDivElement>(null);
  const weekday = weekdayOf(today);
  const prevLabel = period === "today" ? (weekday ? `vs last ${weekday}` : "vs last week") : "vs prior 7 days";
  let head;
  if (!totals && failed?.totals) head = <PanelState state="error" message={failed.totals} onRetry={onRetry}/>;
  else {
    // The comparisons are made of figures read together (the totals); a comparison without a base is left out.
    const deltas = totals ? [
      { value: change(totals.revenue, totals.planRevenue), label: "vs plan" },
      { value: change(totals.revenue, totals.lyRevenue), label: "vs last season" },
      ...(period !== "season" ? [{ value: change(totals.revenue, totals.prevRevenue), label: prevLabel }] : []),
    ].filter(d => d.value != null) : [];
    // Keyed by period and scope: switching either shows the new total at once; live changes count up.
    const countKey = `${period}|${scopeKey}`;
    // Both figures climb with the live sales between refreshes of the totals, together.
    const units = (totals?.unitsSold ?? 0) + (pulse?.unitsAhead ?? 0);
    head = <div className="pd-business-hero-row">
      <div className="pd-business-figures">
        <div ref={revenueRef} className="pd-business-figure">
          <span className="pd-business-figure-label">
            <Define k="revenue" part="totals" area={revenueRef} quiet extra={totals && revenueExtra(period, totals, weekday)}>{HERO_LABEL[period]}</Define>
          </span>
          {totals
            ? <strong className={cx("pd-business-figure-num", busy && "pd-busy")}><CountUp key={countKey} value={totals.revenue + (pulse?.revenueAhead ?? 0)} format={dollars}/></strong>
            : <span className="pd-skeleton pd-business-figure-skeleton"/>}
        </div>
        <i className="pd-business-figure-rule" aria-hidden="true"/>
        <div ref={unitsRef} className="pd-business-figure">
          <span className="pd-business-figure-label">
            <PumpkinMark size={16}/>
            <Define k="pumpkinsSold" part="totals" area={unitsRef} quiet extra={totals && unitsExtra(period, totals, units)}>Pumpkins sold</Define>
          </span>
          {totals
            ? <strong className={cx("pd-business-figure-num", busy && "pd-busy")}><CountUp key={countKey} value={units} format={int}/></strong>
            : <span className="pd-skeleton pd-business-figure-skeleton is-units"/>}
        </div>
      </div>
      {deltas.length > 0 && <div className={cx("pd-business-deltas", busy && "pd-busy")}>
        {deltas.map(d => <DeltaChip key={d.label} value={d.value} label={d.label}/>)}
      </div>}
      {!totals && <span className="pd-sr" role="status">Loading revenue</span>}
    </div>;
  }

  return <section aria-label="Revenue, pumpkins sold and the season" className="pd-business-hero">
    <div className="pd-business-hero-top">
      {head}
      <LiveLine pulse={pulse} error={failed?.pulse} onRetry={onRetry}/>
    </div>
    <SeasonVine season={season} error={failed?.season} onRetry={onRetry} busy={busy}/>
  </section>;
}

/** The Revenue card's numbers: the plan, last season and the period before, as of the same time of day. */
function revenueExtra(period: BusinessPeriod, totals: BusinessTotals, weekday: string | null): DefineExtra {
  const today = period === "today";
  // Today in whole dollars, as the numeral prints it; a week or a season in the compact form.
  const amount: (value: number) => string = today ? dollars : money;
  const rows: ExtraRow[] = [
    { label: today ? "Plan, same time" : "Plan", value: amount(totals.planRevenue) },
    { label: today ? "Last season, same time" : "Last season", value: amount(totals.lyRevenue) },
  ];
  if (period !== "season" && totals.prevRevenue != null) rows.push({
    label: today ? (weekday ? `Last ${weekday}, same time` : "Last week, same time") : "Prior 7 days",
    value: amount(totals.prevRevenue),
  });
  return { title: PERIOD_TITLE[period], rows };
}

/**
 * The Pumpkins sold card's numbers: against plan and last season, signed and coloured like the tiles' rows;
 * "No sales yet." while the numeral (`shown`) is 0, as the tiles say; no box with nothing to compare.
 */
function unitsExtra(period: BusinessPeriod, totals: BusinessTotals, shown: number): DefineExtra | undefined {
  const rows: ExtraRow[] = [
    ...changeRow("vs plan", change(totals.unitsSold, totals.planUnits)),
    ...changeRow("vs last season", change(totals.unitsSold, totals.lyUnits)),
  ];
  if (shown === 0) return { title: PERIOD_TITLE[period], rows: rows.length ? rows : undefined, note: "No sales yet." };
  return rows.length ? { title: PERIOD_TITLE[period], rows } : undefined;
}

/* ── Count-up numeral ────────────────────────────────────── */

const COUNT_MS = 900;
const reducedMotion = () => {
  try { return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};
const clockMs = () => typeof performance !== "undefined" ? performance.now() : Date.now();
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * A number that climbs from the value it showed to the new one over ~900 ms when it changes. The first
 * render (and the server render) prints the value as is; under reduced motion it jumps. Screen readers get
 * the final value only, not every frame.
 */
export function CountUp({ value, format }: { value: number; format: (value: number) => string }) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  useEffect(() => {
    const from = shownRef.current;
    if (from === value) return;
    const show = (v: number) => { shownRef.current = v; setShown(v); };
    if (!Number.isFinite(from) || !Number.isFinite(value) || reducedMotion()) { show(value); return; }
    const frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : null;
    const start = clockMs();
    let handle: number | undefined, stopped = false;
    const step = () => {
      if (stopped) return;
      const t = Math.min(1, (clockMs() - start) / COUNT_MS);
      show(t >= 1 ? value : from + (value - from) * easeOut(t));
      if (t < 1) handle = frame ? frame(step) : window.setTimeout(step, 40);
    };
    handle = frame ? frame(step) : window.setTimeout(step, 40);
    // A new value mid-way starts again from what is on screen.
    return () => {
      stopped = true;
      if (handle != null) frame ? cancelAnimationFrame(handle) : clearTimeout(handle);
    };
  }, [value]);
  // Fixed-width digits while counting, so the frames do not shuffle what is beside the numeral; lining too,
  // so a numeral set in lining figures keeps them.
  return <><span aria-hidden="true" style={shown !== value ? { fontVariantNumeric: "lining-nums tabular-nums" } : undefined}>{format(shown)}</span><span className="pd-sr">{format(value)}</span></>;
}

/* ── Live line ───────────────────────────────────────────── */

/** Client time, ticking every second while `active` (the live line here, the ages in Live sales). */
export function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

/**
 * The latest sale in scope: "Last sale 4 s ago · Old City, Philadelphia · 3 Cooking · $16.47". The age
 * counts every second between polls; while the sale is under 15 minutes old a small pumpkin sits before it
 * with a soft pulse. Nothing before the first pulse arrives.
 */
export function LiveLine({ pulse, error, onRetry }: { pulse?: BusinessPulse; error?: string; onRetry?: () => void }) {
  const sale = pulse?.recent[0];
  const now = useNow(!!sale);
  if (!pulse) return error
    ? <div className="pd-business-live is-error" role="alert">Live sales could not load{onRetry && <button type="button" className="pd-retry" onClick={onRetry}>Retry</button>}</div>
    : null;
  if (!sale) return <div className="pd-business-live"><span><Define k="liveSales" part="pulse">No sales</Define> in the last 2 h</span></div>;
  const age = sale.secondsAgo + Math.max(0, (now - pulse.receivedAt) / 1000);
  const live = age < LIVE_SECONDS;
  return <div className={cx("pd-business-live", live && "is-live")}>
    {live && <span className="pd-business-live-mark" aria-hidden="true"><PumpkinMark size={15}/></span>}
    <span>
      <Define k="liveSales" part="pulse">Last sale</Define> {elapsed(age)}
      {" · "}{sale.storeName}, {sale.cityName}
      {" · "}{sale.units} {sale.variety}
      {" · "}<strong>{price(sale.amount)}</strong>
      {sale.channel === "online" && " · online"}
    </span>
  </div>;
}

/* ── Season vine ─────────────────────────────────────────── */

/**
 * Season revenue against the season plan, as a vine: grown to the share of the plan taken so far, a pumpkin
 * on it where the plan stands today (behind plan the vine stops short of it, ahead it grows past), a faint
 * pumpkin at the end of the season (Nov 15). Under it the share and the days left; the plan to date and the
 * landing are in the Season card (hover the vine, or press the share).
 */
export function SeasonVine({ season, error, onRetry, busy }: { season?: BusinessSeason; error?: string; onRetry?: () => void; busy?: boolean }) {
  const areaRef = useRef<HTMLDivElement>(null);
  if (!season) return error
    ? <PanelState state="error" message={error} onRetry={onRetry}/>
    : <div className="pd-business-season" role="status">
      <Vine/>
      <div className="pd-business-season-caption"/>
      <span className="pd-sr">Loading the season</span>
    </div>;
  const { revenueToDate, planToDate, seasonPlan, daysLeft, landing } = season;
  const done = share(revenueToDate, seasonPlan);
  const rows: ExtraRow[] = [
    { label: "Revenue to date", value: money(revenueToDate) },
    { label: "Season plan", value: money(seasonPlan) },
    { label: "Plan to date", value: money(planToDate) },
  ];
  if (landing) rows.push({ label: "Likely landing", value: landingRange(landing) });
  rows.push({ label: "Days left", value: int(daysLeft) });
  const extra: DefineExtra = {
    title: "Season so far",
    rows,
    note: "The vine is the season so far. The pumpkin marks where the plan is today; the faint one is the end of the season.",
  };
  return <div ref={areaRef} className="pd-business-season">
    <Vine grown={done} plan={share(planToDate, seasonPlan)} busy={busy}/>
    <span className="pd-sr">Season revenue {money(revenueToDate)} of {money(seasonPlan)} plan; the plan to date is {money(planToDate)}</span>
    <div className="pd-business-season-caption">
      <span><Define k="season" part="season" area={areaRef} quiet extra={extra}>{`${pct(done)} of the season plan`}</Define></span>
      <span>{plural(daysLeft, "day")} left</span>
    </div>
  </div>;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/**
 * Where a share of the season plan sits along the vine: one scale for the grown vine and the plan pumpkin, so
 * ahead always reads ahead. It runs from half a pumpkin in (0, the plan pumpkin kept whole) to the faint
 * pumpkin's middle (1, the end of the season).
 */
const onVine = (share: number) => `calc(10px + ${clamp01(share).toFixed(4)} * (100% - 20px))`;

/**
 * The vine itself, fluid in width: a pale wave to the end of the season and the olive vine with its leaves over
 * it, both SVG patterns (one wave is 56px long), so they repeat rather than stretch; the grown vine is cut to
 * its length by an HTML box. The pumpkins are HTML on top. Without `grown` (loading) only the pale wave.
 */
function Vine({ grown, plan, busy }: { grown?: number | null; plan?: number | null; busy?: boolean }) {
  const id = useId().replace(/:/g, "");
  const track = `pd-vine-track-${id}`, vine = `pd-vine-${id}`;
  const loaded = grown !== undefined;
  // Each wave runs half a wave past both edges of its tile, so the tile cuts it straight and the next tile
  // picks it up seamlessly (a stroke ending at the edge would end in a slanted cap: a gap). Both SVGs start at
  // the vine's left edge, so the vine's waves lie on the track's.
  return <div className={cx("pd-business-vine", busy && "pd-busy")} aria-hidden="true">
    <svg className="pd-business-vine-art" height="30">
      <defs>
        <pattern id={track} width="56" height="30" patternUnits="userSpaceOnUse">
          <path className="pd-business-vine-track" d="M-28 18q14 4 28 0t28 0t28 0t28 0"/>
        </pattern>
      </defs>
      <rect width="100%" height="30" fill={`url(#${track})`}/>
    </svg>
    {grown != null && grown > 0 && <span className="pd-business-vine-grown" style={{ width: onVine(grown) }}>
      <svg className="pd-business-vine-art" height="30">
        <defs>
          {/* Two waves, a leaf up on the first and one down on the second; the leaves under the stem. */}
          <pattern id={vine} width="112" height="30" patternUnits="userSpaceOnUse">
            <path className="pd-business-vine-leaf" d="M18 16q5-8 13-5q-5 7-13 5z"/>
            <path className="pd-business-vine-leaf" d="M74 16.5q5 8 13 5q-5-7-13-5z"/>
            <path className="pd-business-vine-stem" d="M-28 18q14 4 28 0t28 0t28 0t28 0t28 0t28 0"/>
          </pattern>
        </defs>
        <rect width="100%" height="30" fill={`url(#${vine})`}/>
      </svg>
    </span>}
    {loaded && <PumpkinMark size={20} ghost className="pd-business-vine-end"/>}
    {loaded && plan != null && <span className="pd-business-vine-plan" style={{ left: onVine(plan) }}>
      <PumpkinMark size={20}/>
    </span>}
  </div>;
}

/** "$3.16M–$3.35M", or one amount when both ends print the same. */
function landingRange({ low, high }: { low: number; high: number }) {
  const a = money(Math.min(low, high)), b = money(Math.max(low, high));
  return a === b ? a : `${a}–${b}`;
}
