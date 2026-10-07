import { useRef, useState } from "react";
import "./livesales.css";
import { Define, elapsed } from "../../components/Define";
import { Icon, Panel, PanelState, Tag } from "../../components/ui";
import { dollars, int, plural, price, timeTz, yourTime } from "../../format";
import { Link } from "../../nav";
import { routes } from "../../routes";
import { varietyColor } from "../../theme";
import { COUNTRIES, countryName } from "../../types";
import { useViewerZone } from "../../viewer";
import { useNow } from "./Hero";
import type { BusinessChannel, BusinessPulse, BusinessSale } from "./model";

/*
 * Live sales (full width, under the tiles): the newest sales in scope as they come in, newest first. Each row
 * is one sale: how long ago (counting every second between polls) with the store's own clock time, the store
 * with its city and country (the row opens the store), the variety, how many, the channel and the amount. A
 * sale that arrives while the page is open slides in at the top with a soft olive wash that fades. The title's
 * olive dot pulses while the newest sale is under two minutes old; the aside counts the last hour.
 * Data: vm.pulse (recent_sales, the newest 20 in scope; sales_pulse for the last hour), polled every 10 s.
 * Styles: livesales.css (a list of stacked rows when the panel is narrower than 660px).
 */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** Rows shown before "Show more" (the hook keeps up to 20). */
const FIRST = 8;
/** The title's dot pulses while the newest sale is younger than this (seconds). */
const LIVE_SECONDS = 120;
/** How long a new row keeps its arrival look (ms): the slide and the wash are done well before. */
const FRESH_MS = 3200;

const CHANNEL_LABEL: Record<BusinessChannel, string> = { in_store: "In store", online: "Online" };
const TZ = Object.fromEntries(COUNTRIES.map(c => [c.code, c.tz])) as Record<string, string>;

/**
 * Which sales arrived while the panel was showing (id → client time they first rendered). The first sales of
 * a scope never count, nor does an older sale that only turns up because the list grew (a scope's own rows
 * replacing the narrowed ones): a sale is new when it is later than every sale shown before it. Kept in a ref
 * and updated while rendering, the same way on every render, so a re-render keeps a row's arrival time.
 */
function useArrivals(sales: BusinessSale[] | undefined, scopeKey: string): Map<string, number> {
  const memory = useRef({ scope: scopeKey, primed: false, newest: -Infinity, known: new Set<string>(), arrived: new Map<string, number>() });
  const m = memory.current;
  if (m.scope !== scopeKey) Object.assign(m, { scope: scopeKey, primed: false, newest: -Infinity, known: new Set<string>(), arrived: new Map<string, number>() });
  if (!sales) return m.arrived;
  const now = Date.now();
  const before = m.newest;
  let newest = before;
  for (const sale of sales) {
    const at = Date.parse(sale.soldAt);
    if (Number.isFinite(at) && at > newest) newest = at;
    if (m.known.has(sale.id)) continue;
    if (m.primed && Number.isFinite(at) && at > before) m.arrived.set(sale.id, now);
  }
  m.newest = newest;
  m.known = new Set(sales.map(s => s.id));
  for (const [id, at] of m.arrived) if (now - at > FRESH_MS || !m.known.has(id)) m.arrived.delete(id);
  m.primed = true;
  return m.arrived;
}

/** A small pumpkin in the variety's colour (the side lobes a shade into the panel, as on the brand pumpkin). */
function PumpkinMark({ color }: { color: string }) {
  return <svg className="pd-business-ls-pumpkin" width={18} height={17} viewBox="0 0 32 30" aria-hidden="true">
    <path d="M15 8c0-3 1.5-5.5 5-6.5l1 2.5c-2 .6-3 2-3 4z" style={{ fill: "var(--pd-leaf)" }}/>
    <ellipse cx="9.5" cy="18.5" rx="7.5" ry="9.5" style={{ fill: color, opacity: .78 }}/>
    <ellipse cx="22.5" cy="18.5" rx="7.5" ry="9.5" style={{ fill: color, opacity: .78 }}/>
    <ellipse cx="16" cy="18.5" rx="7" ry="10.5" style={{ fill: color }}/>
  </svg>;
}

export type LiveSalesProps = {
  /** vm.pulse */
  pulse?: BusinessPulse;
  /** vm.failed.pulse */
  error?: string;
  onRetry?: () => void;
  /** The shell's scope as a string ("EU-DE"): a new scope's first rows arrive without the slide. */
  scopeKey?: string;
  /** Start with every row shown (the preview's `liveMore`). */
  initialMore?: boolean;
};

/** The Live sales panel: the newest sales in scope as a table (stacked rows on narrow widths). */
export function LiveSales({ pulse, error, onRetry, scopeKey = "", initialMore = false }: LiveSalesProps) {
  const viewerTz = useViewerZone();
  const [more, setMore] = useState(initialMore);
  const sales = pulse?.recent;
  const arrived = useArrivals(sales, scopeKey);
  const now = useNow(!!sales?.length);
  // A sale's age is its seconds_ago at the poll plus the seconds since the poll arrived.
  const ageOf = (sale: BusinessSale) => sale.secondsAgo + Math.max(0, (now - (pulse?.receivedAt ?? now)) / 1000);
  const live = !!sales?.length && ageOf(sales[0]) < LIVE_SECONDS;

  const title = <span className="pd-business-ls-title">
    <Define k="liveSales" part="pulse">Live sales</Define>
    {live && <i className="pd-business-live-dot" aria-hidden="true"/>}
  </span>;
  const aside = pulse && (pulse.salesLastHour || sales?.length)
    ? <span>{pulse.salesLastHour
      ? <>{plural(pulse.salesLastHour, "sale")}{pulse.revenueLastHour != null && <> · {dollars(pulse.revenueLastHour)}</>} in the last hour</>
      : "No sales in the last hour"}</span>
    : null;

  let body;
  if (!pulse || !sales) body = <div className="pd-business-ls-state">
    {error ? <PanelState state="error" message={error} onRetry={onRetry}/> : <PanelState state="loading" rows={6} minHeight={FIRST * 56}/>}
  </div>;
  else if (!sales.length) body = <div className="pd-business-ls-state"><PanelState state="empty" message="No sales in the last 2 hours" line/></div>;
  else {
    const shown = more ? sales : sales.slice(0, FIRST);
    const rest = sales.length - FIRST;
    body = <>
      <div className="pd-business-ls-wrap">
        <div role="table" id="pd-business-ls-table" className="pd-business-ls-table" aria-label="Newest sales, newest first">
          <div role="row" className="pd-business-ls-head">
            <span role="columnheader">Time</span>
            <span role="columnheader">Store</span>
            <span role="columnheader">Variety</span>
            <span role="columnheader" className="pd-right">Qty</span>
            <span role="columnheader" className="pd-business-ls-channel-head">Channel</span>
            <span role="columnheader" className="pd-right pd-business-ls-amount-head">Amount</span>
          </div>
          {shown.map(sale => {
            const tz = TZ[sale.countryCode] ?? "UTC";
            // The store's clock, then the viewer's when it reads differently: "17:02 JST · 10:02 CEST".
            const yours = yourTime(sale.soldAt, tz, viewerTz);
            const local = `${timeTz(sale.soldAt, tz)}${yours ? ` · ${yours}` : ""}`;
            const country = countryName(sale.countryCode);
            const label = `${sale.storeName}, ${sale.cityName}, ${country}: ${sale.units} ${sale.variety}, ${CHANNEL_LABEL[sale.channel].toLowerCase()}, ${price(sale.amount)}, at ${local}. Open ${sale.storeName}`;
            return <div role="row" key={sale.id} className={cx("pd-business-ls-row", arrived.has(sale.id) && "is-new")}>
              <div className="pd-business-ls-clip">
                <div className="pd-business-ls-cells">
                  <span role="cell" className="pd-business-ls-time"><strong>{elapsed(ageOf(sale))}</strong><small>{local}</small></span>
                  <span role="rowheader" className="pd-business-ls-store">
                    <Link to={routes.store(sale.storeId)} className="pd-business-ls-hit" aria-label={label}><strong>{sale.storeName}</strong></Link>
                    <small>{sale.cityName} · {country}</small>
                  </span>
                  <span role="cell" className="pd-business-ls-variety">
                    <PumpkinMark color={varietyColor[sale.variety]}/>
                    <span><span className="pd-business-ls-qty-inline">{int(sale.units)} </span>{sale.variety}</span>
                  </span>
                  <span role="cell" className="pd-right pd-business-ls-qty">{int(sale.units)}</span>
                  <span role="cell" className="pd-business-ls-channel"><Tag tone={sale.channel === "online" ? "neutral" : "stone"} size="sm">{CHANNEL_LABEL[sale.channel]}</Tag></span>
                  <span role="cell" className="pd-business-ls-amount"><span>{price(sale.amount)}</span><Icon name="chevronRight" size={16} strokeWidth={2}/></span>
                </div>
              </div>
            </div>;
          })}
        </div>
      </div>
      {rest > 0 && <button type="button" className="pd-business-ls-more" aria-expanded={more} aria-controls="pd-business-ls-table" onClick={() => setMore(!more)}>
        <span>{more ? "Show fewer" : `Show ${rest} more`}</span>
        <Icon name="chevronDown" size={16} strokeWidth={2} style={more ? { transform: "rotate(180deg)" } : undefined}/>
      </button>}
    </>;
  }

  return <Panel title={title} label="Live sales" aside={aside} pad="flush" gap={0} className="pd-business-ls">
    {body}
  </Panel>;
}
