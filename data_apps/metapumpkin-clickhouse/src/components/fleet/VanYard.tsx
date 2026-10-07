/*
 * The yard: "All vans" on the Harvest & fleet page (FleetPage.tsx), from the approved board (vans-design, Yard).
 * One card per hub in scope, in the hub cards' order: the hub, its clock, a line counting what its vans are doing,
 * then a tile per van in fleet-number order. A tile is a small van in the colour of what it is doing (olive on the
 * road, deep pumpkin when late, plum at the hub, muted and facing left on its way back, a wrench in the workshop),
 * its fleet number and one short line, and links to the van's page. A mouse resting on a tile, or keyboard focus,
 * shows the van's card after a moment (the Stores page's hover card, StoresPage.tsx: the same timing and rules).
 * The page's filters narrow the tiles: a van that does not match is not drawn, and a hub with none left is left out.
 * Presentational: the vans come in through props. Styles: van-yard.css.
 */
import { type FocusEvent, type KeyboardEvent, type PointerEvent, type RefObject, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import "./van-yard.css";
import type { FleetHub, FleetStage, FleetYardVan } from "../../pages/FleetPage";
import { HubGlyph, Icon, Meter, Panel, PanelState, StatusChip, Tag } from "../ui";
import { bothTimes, dayLabel, duration, int, km, pct, plural, share } from "../../format";
import { Link } from "../../nav";
import { routes } from "../../routes";
import { palette } from "../../theme";
import { type CountryCode, countryName, lateStatus, type TruckStatus } from "../../types";
import { useViewerZone } from "../../viewer";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/* ── Words shared with the hub cards ─────────────────────── */

/** Two markets have a London; the label says which. */
export const cityLabel = (name: string, country: CountryCode) => name === "London" ? `London, ${country === "GB" ? "UK" : countryName(country)}` : name;

/** The hub's country and own clock, then the viewer's; the hub's day too when it is not the day the top bar shows. */
export function hubWhere(hub: Pick<FleetHub, "country" | "tz">, now: string | undefined, yours: string): string {
  const otherDay = now != null && dayLabel(now, hub.tz) !== dayLabel(now, yours);
  return [hub.country, now != null && bothTimes(now, hub.tz, yours, true), otherDay && dayLabel(now, hub.tz)].filter(Boolean).join(" · ");
}

/* ── What a van is doing ─────────────────────────────────── */

/** A tile's look: on the road on time, late, at the hub, loading, heading back, in the workshop. */
type Kind = "road" | "late" | "hub" | "load" | "back" | "shop";
const ON_TRIP: readonly TruckStatus[] = ["driving", "stopped", "unloading"];
const onTrip = (van: FleetYardVan) => ON_TRIP.includes(van.status);
/** Late as on the rest of the page: on a trip and behind plan by 15 minutes or more (lateStatus). */
const isLate = (van: FleetYardVan) => onTrip(van) && lateStatus(van.late) !== "on_schedule";
function kindOf(van: FleetYardVan): Kind {
  if (onTrip(van)) return isLate(van) ? "late" : "road";
  return van.status === "loading" ? "load" : van.status === "returning" ? "back" : van.status === "workshop" ? "shop" : "hub";
}
const AWAY_LINE: Record<Exclude<Kind, "road" | "late">, string> = { hub: "At the hub", load: "Loading", back: "Heading back", shop: "Workshop" };
/** The tile's short line: the store it is heading to, "Unloading", or where it is. */
const tileLine = (van: FleetYardVan) => {
  const kind = kindOf(van);
  if (kind !== "road" && kind !== "late") return AWAY_LINE[kind];
  return van.status === "unloading" ? "Unloading" : van.store ?? "On the road";
};
/** The tile's name, in words: "Express 106, late 1 h 31 m, to Shadyside". */
function tileLabel(van: FleetYardVan): string {
  const late = isLate(van) ? `late ${duration(van.late.minutes)}` : "on time";
  const store = van.store ?? "a store";
  switch (van.status) {
    case "driving": return `${van.label}, ${late}, to ${store}`;
    case "stopped": return `${van.label}, stopped, ${late}, to ${store}`;
    case "unloading": return `${van.label}, unloading at ${store}, ${late}`;
    case "loading": return `${van.label}, loading${van.store ? ` for ${van.store}` : " at the hub"}`;
    case "returning": return `${van.label}, heading back to the hub`;
    case "workshop": return `${van.label}, in the workshop`;
    default: return `${van.label}, at the hub`;
  }
}

/** The vans a stage column picks out; null: every van (Picking is about the fields, not the vans). */
const STAGE_VANS: Record<FleetStage, readonly TruckStatus[] | null> = {
  picking: null, hubs: ["at_hub", "loading"], road: ["driving", "stopped", "returning"], unload: ["unloading"], workshop: ["workshop"],
};
/** What none of in a hub means, under a filter: "No late van on the road". */
const STAGE_NONE: Record<FleetStage, string> = { picking: "", hubs: "at a hub", road: "on the road", unload: "unloading", workshop: "in the workshop" };

export type YardFilter = { stage: FleetStage | null; lateOnly: boolean };
const matches = (van: FleetYardVan, f: YardFilter) => {
  const statuses = f.stage ? STAGE_VANS[f.stage] : null;
  return (!statuses || statuses.includes(van.status)) && (!f.lateOnly || isLate(van));
};

/** "10 on the road · 1 late · 8 at the hub · 1 heading back · 1 in the workshop": every van of the hub, whatever the filters. */
function countWords(vans: FleetYardVan[]): { text: string; late?: boolean }[] {
  const n = (...statuses: TruckStatus[]) => vans.filter(v => statuses.includes(v.status)).length;
  const late = vans.filter(isLate).length, unloading = n("unloading"), back = n("returning"), shop = n("workshop");
  return [
    { text: `${int(n("driving", "stopped"))} on the road` },
    ...late ? [{ text: `${int(late)} late`, late: true }] : [],
    ...unloading ? [{ text: `${int(unloading)} unloading` }] : [],
    { text: `${int(n("at_hub", "loading"))} at the hub` },
    ...back ? [{ text: `${int(back)} heading back` }] : [],
    ...shop ? [{ text: `${int(shop)} in the workshop` }] : [],
  ];
}

/* ── Glyphs ──────────────────────────────────────────────── */

/** The yard's van (24 units): box, cab, window, two wheels, in the tile's colour (van-yard.css). Faces right; `back` faces left. */
function VanGlyph({ back }: { back?: boolean }) {
  return <svg className="pd-yard-glyph" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <g transform={back ? "translate(24 0) scale(-1 1)" : undefined}>
      <path d="M2.5 6.5h11.5V16H2.5z" fill="currentColor"/>
      <path d="M14 9h3.8l3.2 3.2V16H14z" fill="currentColor" opacity=".82"/>
      <path className="pd-yard-glyph-window" d="M15.3 10.2h2l1.8 2h-3.8z"/>
      <circle className="pd-yard-glyph-wheel" cx="6.5" cy="17" r="2"/>
      <circle className="pd-yard-glyph-wheel" cx="17" cy="17" r="2"/>
    </g>
  </svg>;
}
/** A van in the workshop: the stage card's wrench, in the same box as the van. */
const WrenchGlyph = () =>
  <svg className="pd-yard-glyph" width="28" height="28" viewBox="-2 -2 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>
  </svg>;

/* ── Hover card: when it shows, and where ────────────────── */

/** The card waits this long, so a pointer passing over the tiles does not flash cards (as on Stores). */
const SHOW_MS = 250;
/** And stays this long after the pointer leaves, so it can be reached and read. */
const HIDE_MS = 120;
/** Keyboard focus only: a click or a tap focuses the link too, and that opens the van instead. */
const byKeyboard = (el: Element) => { try { return el.matches(":focus-visible"); } catch { return true; } };

/**
 * One hover card for the yard, keyed by truck id. A tile shows it after SHOW_MS on mouse hover or keyboard focus
 * (never on touch, where a tap opens the van), at once when it is already showing for another tile. It hides on
 * leave, blur or Escape; the pointer may cross into it on the way. `initial` opens one from the start.
 */
function usePeek(initial: string | null) {
  const id = useId();
  const [at, setAt] = useState<string | null>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = useRef(false);
  open.current = at != null;
  const stop = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => stop, []);
  const show = (truckId: string) => {
    stop();
    if (open.current) setAt(truckId);
    else timer.current = setTimeout(() => setAt(truckId), SHOW_MS);
  };
  const hide = (wait = 0) => {
    stop();
    if (wait) timer.current = setTimeout(() => setAt(null), wait);
    else setAt(null);
  };
  return {
    id, at, hide,
    tile: (truckId: string) => ({
      "aria-describedby": at === truckId ? id : undefined,
      onPointerEnter: (e: PointerEvent<HTMLAnchorElement>) => { if (e.pointerType === "mouse") show(truckId); },
      onPointerLeave: (e: PointerEvent<HTMLAnchorElement>) => { if (e.pointerType === "mouse") hide(HIDE_MS); },
      onFocus: (e: FocusEvent<HTMLAnchorElement>) => { if (byKeyboard(e.currentTarget)) show(truckId); },
      // Not at once: a Tab to the next tile moves the open card there instead of starting the wait again.
      onBlur: () => hide(HIDE_MS),
      onKeyDown: (e: KeyboardEvent<HTMLAnchorElement>) => { if (e.key === "Escape") hide(); },
    }),
    card: { onPointerEnter: stop, onPointerLeave: () => hide(HIDE_MS) },
  };
}
type Peek = ReturnType<typeof usePeek>;

/** Space between the tile and the card, and the least the card keeps from the window's edges. */
const GAP = 8, EDGE = 8;
/** A layout effect in the browser; on the server (the static preview, where a card can start open) a plain one, which never runs. */
const useBrowserLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;
/**
 * Over the tile and centred on it, else under it, slid sideways to stay inside the window; when neither side has
 * room, the roomier one, held inside the window. Measured against the window, then written in the coordinates of
 * the card's frame (.pd-yard), so it scrolls with its tile.
 */
function placeNear(card: HTMLElement, tile: HTMLElement, frame: HTMLElement) {
  const t = tile.getBoundingClientRect(), base = frame.getBoundingClientRect();
  const vw = document.documentElement.clientWidth || window.innerWidth, vh = window.innerHeight;
  const w = card.offsetWidth, h = card.offsetHeight;
  const x = Math.max(EDGE, Math.min(t.left + t.width / 2 - w / 2, vw - EDGE - w));
  const above = t.top - GAP - h, below = t.bottom + GAP;
  const y = above >= EDGE ? above : below + h <= vh - EDGE ? below : t.top > vh - t.bottom ? Math.max(EDGE, above) : Math.max(EDGE, Math.min(below, vh - EDGE - h));
  card.style.left = `${Math.round(x - base.left)}px`;
  card.style.right = "auto";
  card.style.top = `${Math.round(y - base.top)}px`;
}

/* ── Hover card ──────────────────────────────────────────── */

/** "Shadyside, Pittsburgh": the store and its city (London says which). */
const placeOf = (van: FleetYardVan, country: CountryCode) => van.store && [van.store, van.city && cityLabel(van.city, country)].filter(Boolean).join(", ");
function doingWords(van: FleetYardVan, place: string | null): string {
  switch (van.status) {
    case "driving": return place ? `To ${place}` : "On the road";
    case "stopped": return place ? `Stopped on the way to ${place}` : "Stopped on the road";
    case "unloading": return place ? `Unloading at ${place}` : "Unloading";
    case "loading": return place ? `Loading for ${place}` : "Loading at the hub";
    case "returning": return "Heading back to the hub";
    case "workshop": return "In the workshop";
    default: return "At the hub";
  }
}

/** Under what it is doing: the late chip and why, the ETA and how far along, the arrival, or the service it is in for. */
function DoingDetail({ van, tz }: { van: FleetYardVan; tz: string }) {
  const yours = useViewerZone();
  if (isLate(van)) return <span className="pd-yard-peek-late"><StatusChip status={lateStatus(van.late)} minutes={van.late.minutes} size="sm"/>{van.late.note && <span>{van.late.note}</span>}</span>;
  if (!van.etaAt) return van.status === "workshop" && van.kmToService < 0 ? <span className="pd-yard-peek-soft">Service, {km(-van.kmToService)} overdue</span> : null;
  const at = bothTimes(van.etaAt, tz, yours);
  if (van.status === "driving" || van.status === "stopped") {
    return <span className="pd-yard-peek-eta"><Meter className="pd-yard-peek-bar" value={van.progressPct / 100} color={palette.olive} height={6}/>ETA {at}</span>;
  }
  if (van.status === "unloading") return <span className="pd-yard-peek-soft">Arrived {at} · on time</span>;
  return van.status === "loading" ? <span className="pd-yard-peek-soft">ETA {at}</span> : null;
}

/** The next service, as the Maintenance list words it; nothing for a van in the workshop (what it is doing says so). */
function ServiceLine({ van }: { van: FleetYardVan }) {
  if (van.status === "workshop") return null;
  if (van.service === "in_workshop") return <p className="pd-yard-peek-service"><Tag tone="neutral" size="sm">In the workshop</Tag></p>;
  const tag = van.service === "overdue" ? <Tag tone="severe" size="sm">Overdue {km(Math.abs(van.kmToService))}</Tag>
    : van.service === "due_soon" ? <Tag tone="low" size="sm">Due in {km(van.kmToService)}</Tag> : null;
  return <p className="pd-yard-peek-service">{tag ? <>Next service {tag}</> : <>Next service in {km(van.kmToService)}</>}</p>;
}

function SeasonLine({ season }: { season: NonNullable<FleetYardVan["season"]> }) {
  if (season.trips === 0) return <p className="pd-yard-peek-season">No trips yet this season</p>;
  const rate = share(season.onTime, season.delivered);
  return <p className="pd-yard-peek-season">
    This season: <strong>{int(season.trips)}</strong> {season.trips === 1 ? "trip" : "trips"}{rate != null && <> · <strong>{pct(rate)}</strong> on time</>}
  </p>;
}

type PeekCardProps = {
  id: string;
  van: FleetYardVan;
  hub: FleetHub;
  frame: RefObject<HTMLDivElement | null>;
  onGone: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};
/** The van at a glance, over its tile: who, what it is doing, its load, its service, its season. */
function PeekCard({ id, van, hub, frame, onGone, onPointerEnter, onPointerLeave }: PeekCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  useBrowserLayoutEffect(() => {
    const card = ref.current, box = frame.current;
    if (!card || !box) return;
    // The tile went away (a filter, a refresh): so does its card.
    const tile = Array.from(box.querySelectorAll<HTMLElement>("[data-van]")).find(el => el.dataset.van === van.truckId);
    if (!tile) { onGone(); return; }
    placeNear(card, tile, box);
  });

  const place = placeOf(van, hub.countryCode);
  return <div ref={ref} id={id} role="tooltip" className="pd-yard-peek" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
    <div className="pd-yard-peek-head"><strong>{van.label}</strong>{van.driver && <span>{van.driver}</span>}</div>
    <div className="pd-yard-peek-now">
      <strong>{doingWords(van, place || null)}</strong>
      <DoingDetail van={van} tz={hub.tz}/>
    </div>
    <p className="pd-yard-peek-soft">{van.units > 0 ? `${plural(van.units, "pumpkin")} aboard` : "Nothing aboard"}</p>
    <ServiceLine van={van}/>
    {van.fault && van.status !== "workshop" && !(isLate(van) && van.late.note?.startsWith(van.fault.desc)) && <p className={cx("pd-yard-peek-fault", van.fault.severity === "critical" && "is-critical")}>
      <Icon name="alert" size={14} strokeWidth={2}/><span>{van.fault.desc}</span>
    </p>}
    {van.season && <SeasonLine season={van.season}/>}
  </div>;
}

/* ── Hub card and tiles ──────────────────────────────────── */

function Tile({ van, peek }: { van: FleetYardVan; peek: Peek }) {
  const kind = kindOf(van);
  return <Link to={routes.truck(van.truckId)} className={`pd-yard-tile is-${kind}`} aria-label={tileLabel(van)} data-van={van.truckId} {...peek.tile(van.truckId)}>
    {kind === "shop" ? <WrenchGlyph/> : <VanGlyph back={kind === "back"}/>}
    <span className="pd-num pd-yard-no">{van.fleetNo}</span>
    <span className="pd-yard-line">{tileLine(van)}</span>
  </Link>;
}

function YardHub({ hub, vans, shown, now, peek, busy }: { hub: FleetHub; vans: FleetYardVan[]; shown: FleetYardVan[]; now: string | undefined; peek: Peek; busy?: boolean }) {
  const yours = useViewerZone();
  return <Panel as="article" label={hub.name} className="pd-yard-hub" busy={busy}>
    <div className="pd-yard-head">
      <div className="pd-yard-id">
        <span className="pd-fleet-disc"><HubGlyph/></span>
        <div><h2 className="pd-panel-title">{hub.name}</h2><div className="pd-yard-where">{hubWhere(hub, now, yours)}</div></div>
      </div>
      <p className="pd-yard-counts">{countWords(vans).map(w => <span key={w.text} className={w.late ? "is-late" : undefined}>{w.text}</span>)}</p>
    </div>
    {shown.length
      ? <ul className="pd-yard-tiles" role="list">{shown.map(v => <li key={v.truckId}><Tile van={v} peek={peek}/></li>)}</ul>
      : <PanelState state="empty" message="No vans"/>}
  </Panel>;
}

/* ── The yard ────────────────────────────────────────────── */

export type VanYardProps = {
  /** The hubs in scope, in the page's order: each one's card, name and clock. */
  hubs: FleetHub[] | undefined;
  /** Every van of those hubs. */
  vans: FleetYardVan[] | undefined;
  error?: string;
  filter: YardFilter;
  now: string | undefined;
  busy?: boolean;
  /** A truck id whose card shows from the start (the static preview, where nothing hovers). */
  peek?: string | null;
};

export function VanYard({ hubs, vans, error, filter, now, busy, peek: initialPeek = null }: VanYardProps) {
  const peek = usePeek(initialPeek);
  const frame = useRef<HTMLDivElement>(null);

  if (error) return <Panel className="pd-yard-hub"><PanelState state="error" message={error}/></Panel>;
  if (!hubs || !vans) return <div className="pd-yard">{[0, 1, 2].map(i => <Panel key={i} className="pd-yard-hub"><PanelState state="loading" rows={4} minHeight={168}/></Panel>)}</div>;
  if (hubs.length === 0) return <Panel className="pd-yard-hub"><PanelState state="empty" message="No hubs in this region"/></Panel>;

  const filtered = filter.lateOnly || (filter.stage != null && STAGE_VANS[filter.stage] != null);
  const groups = hubs.map(hub => {
    const mine = vans.filter(v => v.hubId === hub.hubId).sort((a, b) => a.fleetNo - b.fleetNo);
    return { hub, vans: mine, shown: mine.filter(v => matches(v, filter)) };
  }).filter(g => !filtered || g.shown.length > 0);
  const none = `No ${filter.lateOnly ? "late " : ""}van${filter.stage && STAGE_NONE[filter.stage] ? ` ${STAGE_NONE[filter.stage]}` : filter.lateOnly ? " right now" : ""}`;

  // A card whose tile a filter has just taken away finds no tile to sit on, and closes (PeekCard).
  const peekVan = peek.at ? vans.find(v => v.truckId === peek.at) : undefined;
  const peekHub = peekVan && hubs.find(h => h.hubId === peekVan.hubId);

  // The hover card's frame: it is placed in these coordinates, so it scrolls with its tile.
  return <div className="pd-yard" ref={frame}>
    {groups.length
      ? groups.map(g => <YardHub key={g.hub.hubId} hub={g.hub} vans={g.vans} shown={g.shown} now={now} peek={peek} busy={busy}/>)
      : <Panel className="pd-yard-hub"><PanelState state="empty" message={none}/></Panel>}
    {peekVan && peekHub && <PeekCard id={peek.id} van={peekVan} hub={peekHub} frame={frame} onGone={() => peek.hide()} {...peek.card}/>}
  </div>;
}
