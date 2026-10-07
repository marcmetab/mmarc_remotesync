import { createContext, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./define.css";
import { DEFINITIONS, type DefinitionKey, type ExploreKey, isDefinitionKey, metricName, metricUrl } from "../definitions";
import { clockLabel } from "../format";
import { Icon } from "./ui";

/*
 * Definitions: a label that opens a card saying what the number means. The card holds the definition
 * (from src/definitions.ts, which takes its text from the Library metrics' Metabase descriptions), the
 * formula of a composite number, a box of the label's own numbers (its `extra`: today's figures, say, from
 * the page's view model), the other Library metrics it is built from, how fresh the data is, an "Open in
 * Metabase ↗" link to the primary Library metric, and "Explore" where the page can show that metric in a
 * Metabase question.
 *
 * Peeks and pins: a label may name an `area`, the figure or tile it heads. Resting the mouse on the area for
 * a moment peeks the card: no backdrop, focus stays where it is, and it closes once the pointer has left both
 * the area and the card (so the pointer can cross into the card and use its links), or on Escape from anywhere
 * in the app. A click on the label or anywhere in the area, a tap, or Enter pins it: the modal card (a
 * transparent backdrop, focus inside, Tab kept inside, Escape / close / backdrop close it and focus goes back
 * to the label). Closing a layer (a card, the Explore sheet) never peeks the card under a resting pointer.
 * Touch never peeks, and nothing peeks under 600px, where a pinned card is a bottom sheet.
 *
 * `DefineProvider` wraps a page: it keeps one card open at a time and renders it in its own layer after the
 * page, never inside the label (a label can sit in a panel's <h2>, and a dialog does not belong in a
 * heading). It knows the clock and when each view-model part arrived, and renders the Explore sheet the
 * live container supplies (the static preview supplies none, so there is no Explore button there). A
 * `Define` outside a provider is plain text.
 *
 * The box: the label renders its `extra` into a slot in the card with a portal, so it follows the label's
 * props while the card is open. The server render has no slot to portal into and leaves the box out.
 *
 * Placement: when a card opens, the provider reads where the area (else the label) is and puts the card under
 * it (lined up with its start or end, kept inside the window, above it when it only fits there; when it fits
 * neither, on the side with more room, its height capped to it so its actions stay in reach). The server
 * render cannot measure, so a card open from the start (the preview's `define` state) is tied to its label
 * with CSS anchor positioning instead. Styles: define.css.
 */

export type { DefinitionKey, ExploreKey } from "../definitions";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
/** A layout effect in the browser; on the server (the static preview) nothing runs, without React's warning. */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

/** The card's width before it is measured (define.css; wider with a box), the gap to its anchor, how far it reaches past a label's edge, and the window margin it keeps. */
const CARD_WIDTH = 320, CARD_WIDTH_BOX = 340, CARD_GAP = 10, CARD_OUTSET = 10, EDGE = 16;
/** How long the mouse rests on an area before its card peeks, and how long a peek outlives the pointer leaving it (ms). */
const PEEK_DELAY = 250, LEAVE_DELAY = 150;
/** The least height a card capped to the room beside its anchor keeps (px). */
const MIN_CAPPED = 160;
/** Under 600px a card is a bottom sheet (define.css), and nothing peeks. */
const narrow = () => (document.documentElement.clientWidth || window.innerWidth) < 600;

/* ── Provider ────────────────────────────────────────────── */

export type DefineProviderProps = {
  /** The simulated clock (clock.now): the card's "As of" line. */
  clockNow?: string;
  /** Client time (Date.now()) when each view-model part arrived, by part name: the card's "Updated 12 s ago". */
  updatedAt?: Partial<Record<string, number>>;
  /** Renders the Explore sheet for a metric; `close` closes it. Without it the cards have no Explore button. */
  explore?: (key: ExploreKey, close: () => void) => ReactNode;
  /** A definition to show open from the start (the preview's `define` state): the first label of that key. */
  initialOpen?: string | null;
  children?: ReactNode;
};

type Align = "start" | "end";
/** What a label tells its card: its part, alignment and whether it has a box (the wider card, until it is measured). */
type LabelInfo = { part?: string; align: Align; wide?: boolean };
/** What a label opens: its definition, the label and its area (`id` null: the first label of that key, for the preview). */
type Target = LabelInfo & { key: DefinitionKey; id: string | null; trigger: HTMLButtonElement | null; area?: HTMLElement | null };
/** The open card: a hover peek (not modal) or pinned (modal). */
type Opened = Target & { mode: "peek" | "pin" };
/**
 * The card's place in the layer, in px, and its height cap when it fits neither under nor over its anchor.
 * null until measured (always, in the server render).
 */
type Place = { x: number; y: number; maxH?: number } | null;
type Point = { x: number; y: number };

type DefineContextValue = {
  /** Whether label `id` has its card open. The first label of a key claims a card opened without a label. */
  isOpen: (key: DefinitionKey, id: string, info: LabelInfo) => boolean;
  /**
   * A click on a label or in its area: pins its peeking card, closes its pinned card, else opens it pinned
   * (closing any other). `at`: where a pointer clicked (none from the keyboard).
   */
  activate: (target: Target, at?: Point | null) => void;
  /** The mouse entered a label's area: peek its card after a moment, or at once when another card is peeking. */
  hoverIn: (target: Target) => void;
  /**
   * The mouse left label `id`'s area (at `at`): drop its pending peek, and close its peek unless the pointer
   * reaches the card. While a card is pinned this is its backdrop covering a resting pointer.
   */
  hoverOut: (id: string, at?: Point) => void;
  /** Closes the card; `refocus` moves focus back to its label. */
  close: (refocus: boolean) => void;
  /** A label that claimed the initial card hands over its button and area once they are in the page. */
  adopt: (id: string, trigger: HTMLButtonElement | null, area: HTMLElement | null) => void;
  /** The open card's element id, for the label's aria-controls. */
  cardId: string;
  /** The open card's slot for its label's box; null while none is open, and in the server render. */
  slot: HTMLElement | null;
};
const DefineContext = createContext<DefineContextValue | null>(null);

/**
 * Where the open card goes in `layer`: under its area (else its label), lined up with its start (or end) and
 * kept inside the window; above it when the measured card does not fit under it but does above; when it fits
 * neither, on the side with more room, capped to it (define.css scrolls it inside).
 */
function placeFor(open: Opened | null, layer: HTMLElement | null): Place {
  const anchor = open?.area?.isConnected ? open.area : open?.trigger;
  if (!open || !anchor || !layer || !anchor.isConnected) return null;
  const a = anchor.getBoundingClientRect(), l = layer.getBoundingClientRect();
  const viewport = document.documentElement.clientWidth || window.innerWidth;
  // The card is measured once it is in the page (the layout effect places it again before it paints).
  const card = layer.querySelector<HTMLElement>(".pd-define-card");
  const width = Math.min(card?.offsetWidth || (open.wide ? CARD_WIDTH_BOX : CARD_WIDTH), viewport - 2 * EDGE);
  // A label's card reaches a little past its text (their text lines up); an area's lines up with its edge.
  const outset = anchor === open.area ? 0 : CARD_OUTSET;
  const wanted = open.align === "end" ? a.right + outset - width : a.left - outset;
  const left = Math.max(EDGE, Math.min(viewport - EDGE - width, wanted));
  // Its full height, not the capped one (a capped card scrolls: scrollHeight is its content, plus the borders).
  const height = card ? card.scrollHeight + card.offsetHeight - card.clientHeight : 0;
  const below = a.bottom + CARD_GAP;
  const roomBelow = window.innerHeight - EDGE - below, roomAbove = a.top - CARD_GAP - EDGE;
  let top = below, maxH: number | undefined;
  if (height > 0 && height > roomBelow) {
    if (height <= roomAbove) top = a.top - CARD_GAP - height;
    else if (roomAbove > roomBelow) { maxH = Math.max(MIN_CAPPED, Math.floor(roomAbove)); top = a.top - CARD_GAP - Math.min(height, maxH); }
    else maxH = Math.max(MIN_CAPPED, Math.floor(roomBelow));
  }
  return { x: Math.round(left - l.left), y: Math.round(top - l.top), maxH };
}
const samePlace = (a: Place, b: Place) => a === b || (a != null && b != null && a.x === b.x && a.y === b.y && a.maxH === b.maxH);
const within = (el: HTMLElement, p: Point) => {
  const r = el.getBoundingClientRect();
  return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
};

/** Holds the open definition card (one at a time), renders it after the page, and the Explore sheet. */
export function DefineProvider({ clockNow, updatedAt, explore, initialOpen, children }: DefineProviderProps) {
  const [open, setOpen] = useState<Opened | null>(() => isDefinitionKey(initialOpen) ? { key: initialOpen, id: null, align: "start", trigger: null, mode: "pin" } : null);
  const [place, setPlace] = useState<Place>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [exploring, setExploring] = useState<ExploreKey | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const cardId = `${useId()}-card`;

  // The first label of the initial card's key claims it while the page renders (the server render too,
  // where this is all there is): its part, alignment and box, and that it carries the anchor.
  const claim = useRef<LabelInfo & { open: Opened; id: string } | null>(null);
  const isOpen = useCallback((key: DefinitionKey, id: string, info: LabelInfo) => {
    if (!open || open.key !== key) return false;
    if (open.id !== null) return open.id === id;
    if (claim.current?.open !== open) claim.current = { ...info, open, id };
    return claim.current.id === id;
  }, [open]);

  const openRef = useRef(open);
  openRef.current = open;
  // The pending peek (and whose it is) and the pending close of a peek.
  const timers = useRef<{ peek?: { id: string | null; timer: ReturnType<typeof setTimeout> }; leave?: ReturnType<typeof setTimeout> }>({});
  const stopTimers = useCallback(() => {
    clearTimeout(timers.current.peek?.timer);
    clearTimeout(timers.current.leave);
    timers.current = {};
  }, []);
  useEffect(() => stopTimers, [stopTimers]);
  // Where the pointer last clicked a label or area or moved over the backdrop or the card, and where it was
  // when a card was closed (a click on the backdrop or the close button, Escape): the area under that point
  // gets a pointerenter as the backdrop or the card goes, which must not peek the card straight back.
  const lastPoint = useRef<Point | null>(null);
  const closedAt = useRef<Point | null>(null);
  const notePoint = useCallback((p: Point) => { lastPoint.current = p; }, []);

  /** Shows `next` (or nothing) and places it; the layout effect below places it again once the card is measured. */
  const show = useCallback((next: Opened | null) => {
    stopTimers();
    if (!next) closedAt.current = lastPoint.current;
    lastPoint.current = null;
    openRef.current = next;
    setOpen(next);
    setPlace(placeFor(next, layerRef.current));
  }, [stopTimers]);

  const activate = useCallback((target: Target, at?: Point | null) => {
    if (at) lastPoint.current = at;
    const current = openRef.current;
    const next: Opened | null = current && current.key === target.key && current.id === target.id
      ? current.mode === "peek" ? { ...current, ...target, mode: "pin" } : null
      : { ...target, mode: "pin" };
    show(next);
    // The pointer stays where it clicked until it moves over the backdrop or the card: closing with Escape
    // before then must not peek the card straight back under it (the area gets a pointerenter as the backdrop goes).
    if (next && at) lastPoint.current = at;
  }, [show]);

  const leaveSoon = useCallback(() => {
    clearTimeout(timers.current.leave);
    timers.current.leave = setTimeout(() => {
      timers.current.leave = undefined;
      // The pointer has gone elsewhere: nothing under where it last was on the card needs holding back.
      lastPoint.current = null;
      if (openRef.current?.mode === "peek") show(null);
    }, LEAVE_DELAY);
  }, [show]);
  const hoverIn = useCallback((target: Target) => {
    const closed = closedAt.current;
    closedAt.current = null;
    if (closed && target.area && within(target.area, closed)) return;
    const current = openRef.current;
    if (current?.mode === "pin" || narrow()) return;
    if (current && current.id === target.id) { clearTimeout(timers.current.leave); timers.current.leave = undefined; return; }
    if (current) { show({ ...target, mode: "peek" }); return; }
    clearTimeout(timers.current.peek?.timer);
    timers.current.peek = { id: target.id, timer: setTimeout(() => {
      timers.current.peek = undefined;
      if (openRef.current?.mode !== "pin") show({ ...target, mode: "peek" });
    }, PEEK_DELAY) };
  }, [show]);
  const hoverOut = useCallback((id: string, at?: Point) => {
    // Leaving an area means the next entry is the pointer's own (a browser may not re-enter it as the backdrop goes).
    closedAt.current = null;
    // A pinned card's backdrop has just covered the resting pointer, however the card opened (a click, Enter,
    // Space): closing it must not peek the card of the area still under that point.
    if (at && openRef.current?.mode === "pin") lastPoint.current = at;
    if (timers.current.peek?.id === id) { clearTimeout(timers.current.peek.timer); timers.current.peek = undefined; }
    const current = openRef.current;
    if (current?.mode === "peek" && current.id === id) leaveSoon();
  }, [leaveSoon]);
  // The pointer on the card keeps a peek open; leaving it closes the peek as leaving the area does.
  const cardHover = useCallback((inside: boolean) => {
    if (inside) { clearTimeout(timers.current.leave); timers.current.leave = undefined; }
    else if (openRef.current?.mode === "peek") leaveSoon();
  }, [leaveSoon]);

  const close = useCallback((refocus: boolean) => {
    const trigger = openRef.current?.trigger;
    show(null);
    if (refocus) trigger?.focus();
  }, [show]);
  const adopt = useCallback((id: string, trigger: HTMLButtonElement | null, area: HTMLElement | null) => {
    setOpen(current => current && current.id === null && claim.current?.open === current && claim.current.id === id
      ? { ...current, id, part: claim.current.part, align: claim.current.align, wide: claim.current.wide, trigger, area } : current);
  }, []);

  // While a card is open its anchor may move (a section above refreshes, the window narrows) and the card may
  // grow (its box arrives): follow them.
  useBrowserLayoutEffect(() => {
    if (!open) return;
    const next = placeFor(open, layerRef.current);
    if (next && !samePlace(next, place)) setPlace(next);
  });
  useEffect(() => {
    const layer = layerRef.current, host = layer?.parentElement;
    if (!open || !layer || !host || typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(() => setPlace(now => { const next = placeFor(open, layer); return samePlace(next, now) ? now : next; }));
    watch.observe(host);
    const card = layer.querySelector(".pd-define-card");
    if (card) watch.observe(card);
    return () => watch.disconnect();
  }, [open]);

  // The sheet keeps track of the pointer (from the Explore button, then over the sheet): its scrim goes from
  // over the pointer as it closes, and the area under it must not peek while focus goes back to the label.
  const startExplore = useCallback((key: ExploreKey) => {
    returnTo.current = openRef.current?.trigger ?? null;
    const at = lastPoint.current;
    show(null);
    closedAt.current = null;
    lastPoint.current = at;
    setExploring(key);
  }, [show]);
  const endExplore = useCallback(() => {
    setExploring(null);
    closedAt.current = lastPoint.current;
    lastPoint.current = null;
    const back = returnTo.current;
    returnTo.current = null;
    back?.focus();
  }, []);

  // Escape closes a peek wherever focus is in the app (hover content must be dismissible), not only on its
  // label or in the card, which handle their own Escape and send focus back to the label. The sandbox allows
  // element listeners only, so with focus on the body nothing hears it.
  useEffect(() => {
    if (open?.mode !== "peek") return;
    const root = layerRef.current?.closest<HTMLElement>(".pd-app");
    if (!root) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const current = openRef.current;
      if (e.key !== "Escape" || current?.mode !== "peek") return;
      const from = e.target instanceof Element ? e.target : null;
      if (from && (from === current.trigger || from.closest(".pd-define-card"))) return;
      show(null);
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [open, show]);

  const value = useMemo<DefineContextValue>(() => ({ isOpen, activate, hoverIn, hoverOut, close, adopt, cardId, slot }),
    [isOpen, activate, hoverIn, hoverOut, close, adopt, cardId, slot]);
  return <DefineContext.Provider value={value}>
    {children}
    {/* The layer sits at the start of the page's column (out of its flow): the card is placed relative to it. */}
    <div ref={layerRef} className={cx("pd-define-layer", open && !place && "is-anchored")}>
      {open && <DefineCard key={open.id ?? ""} id={cardId} k={open.key} label={() => open.id === null ? claim.current : open} pinned={open.mode === "pin"}
        place={place} clockNow={clockNow} updatedAt={updatedAt} canExplore={!!explore} onExplore={startExplore} onClose={close}
        onSlot={setSlot} onHover={cardHover} onPoint={notePoint}/>}
    </div>
    {exploring && <div className="pd-define-explore-host" onPointerMove={e => notePoint({ x: e.clientX, y: e.clientY })}>{explore?.(exploring, endExplore)}</div>}
  </DefineContext.Provider>;
}

/* ── Label ───────────────────────────────────────────────── */

/** A box of the label's own numbers in its card, after the definition and formula. */
export type DefineExtra = {
  /** The box's heading: "Today so far", "Last 7 days", "Season to date", "Season so far". */
  title: string;
  /** Label left, value right; tone colours the value (good: olive, bad: terracotta). */
  rows?: { label: string; value: ReactNode; tone?: "good" | "bad" }[];
  /** One short line under the rows. */
  note?: ReactNode;
};

export type DefineProps = {
  /** Which definition to open. */
  k: DefinitionKey;
  /** The view-model part the number comes from, for "Updated 12 s ago" (BusinessPart). */
  part?: string;
  /** The label itself: "Gross margin", "Plan to actual". */
  children: ReactNode;
  /**
   * Which edge of the label (or its area) the card lines up with: "start" (default) opens it to the right,
   * "end" to the left, for one near the right edge of its panel. Phones always get a bottom sheet.
   */
  align?: Align;
  /** The label's own numbers, in a box in its card while this label has it open; it follows the prop live. */
  extra?: DefineExtra;
  /**
   * The element the label heads (a figure, a tile, the season vine): resting the mouse on it peeks the card, a
   * click anywhere in it (or a tap) pins it, and the card goes under it. The label stays the keyboard and
   * screen-reader way in; links and buttons inside the area keep their own clicks.
   */
  area?: RefObject<HTMLElement | null>;
  /** No dotted underline at rest (its area shows it opens); the open label gets a 2px terracotta underline. */
  quiet?: boolean;
};

/** What a click in an area leaves to the element itself: the label, and any other link or control. */
const INTERACTIVE = "a[href], button, input, select, textarea, summary, [role='button']";
/** Clicks an area has dealt with, so an area inside another does not open two cards. */
const handledClicks = new WeakSet<Event>();

/** Listens on a label's area: mouse hover peeks, a click (not on a control, not ending a text selection) pins. Returns the cleanup. */
function listenArea(el: HTMLElement, id: string, api: () => DefineContextValue | null, target: () => Target): () => void {
  const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") api()?.hoverIn(target()); };
  const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") api()?.hoverOut(id, { x: e.clientX, y: e.clientY }); };
  const click = (e: MouseEvent) => {
    if (handledClicks.has(e)) return;
    handledClicks.add(e);
    const hit = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
    if (hit && el.contains(hit)) return;
    const selection = window.getSelection?.();
    if (selection && !selection.isCollapsed && el.contains(selection.anchorNode)) return;
    api()?.activate(target(), { x: e.clientX, y: e.clientY });
  };
  el.addEventListener("pointerenter", enter);
  el.addEventListener("pointerleave", leave);
  el.addEventListener("click", click);
  // define.css gives the area a pointer: all of it opens the card.
  el.setAttribute("data-pd-define-area", "");
  return () => {
    el.removeEventListener("pointerenter", enter);
    el.removeEventListener("pointerleave", leave);
    el.removeEventListener("click", click);
    el.removeAttribute("data-pd-define-area");
  };
}

/**
 * A label that opens its definition: a button that looks like the label, with a dotted underline (none when
 * `quiet`). A click, Enter or a tap pins the card; with an `area`, hovering the area peeks it and a click
 * anywhere in the area pins it. Escape, the close button or a click anywhere else closes a pinned card, and
 * focus goes back to the label.
 */
export function Define({ k, part, children, align = "start", extra, area, quiet }: DefineProps) {
  const ctx = useContext(DefineContext);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wide = extra != null;
  const isOpen = ctx ? ctx.isOpen(k, id, { part, align, wide }) : false;
  // A card open from the start (no label yet) gets this label's button and area once they are in the page.
  const claimed = isOpen && ctx != null;
  useBrowserLayoutEffect(() => { if (claimed) ctx?.adopt(id, triggerRef.current, area?.current ?? null); }, [claimed]);

  // The area's listeners outlive renders: they read the context and this label's props through refs.
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const props = useRef({ k, part, align, wide, area });
  props.current = { k, part, align, wide, area };
  const target = useCallback((): Target => {
    const p = props.current;
    return { key: p.k, id, part: p.part, align: p.align, wide: p.wide, trigger: triggerRef.current, area: p.area?.current ?? null };
  }, [id]);
  // Listen on the area's element, again only when it changes; on unmount stop, and let a peek of this label go.
  const listening = useRef<{ el: HTMLElement; stop: () => void } | null>(null);
  useEffect(() => {
    const el = ctx ? area?.current ?? null : null;
    if (listening.current?.el === el) return;
    listening.current?.stop();
    listening.current = el ? { el, stop: listenArea(el, id, () => ctxRef.current, target) } : null;
  });
  useEffect(() => () => {
    listening.current?.stop();
    listening.current = null;
    ctxRef.current?.hoverOut(id);
  }, [id]);

  if (!ctx) return <>{children}</>;

  const name = typeof children === "string" ? children : DEFINITIONS[k].title;
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) { e.stopPropagation(); ctx.close(true); }
  };
  return <>
    <button type="button" ref={triggerRef} className={cx("pd-define-trigger", quiet && "is-quiet", isOpen && "is-open")} aria-haspopup="dialog" aria-expanded={isOpen}
      aria-controls={isOpen ? ctx.cardId : undefined} aria-label={`${name}. Show what it means`}
      onClick={e => ctx.activate(target(), e.detail > 0 ? { x: e.clientX, y: e.clientY } : null)} onKeyDown={onKeyDown}>{children}</button>
    {isOpen && extra && ctx.slot && createPortal(<DefineExtraBox extra={extra}/>, ctx.slot)}
  </>;
}

/** The label's box in its card: a heading, label/value rows and a note. */
function DefineExtraBox({ extra }: { extra: DefineExtra }) {
  const titleId = `${useId()}-title`;
  const rows = extra.rows ?? [];
  // Portalled: React passes its events up through the label's ancestors, which are not where the click was.
  return <div className="pd-define-extra" role="group" aria-labelledby={titleId} onClick={e => e.stopPropagation()}>
    <strong id={titleId} className="pd-define-extra-title">{extra.title}</strong>
    {rows.length > 0 && <dl className="pd-define-extra-rows">
      {rows.map(r => <div key={r.label}>
        <dt className="pd-define-extra-label">{r.label}</dt>
        <dd className={cx("pd-define-extra-value", r.tone && `is-${r.tone}`)}>{r.value}</dd>
      </div>)}
    </dl>}
    {extra.note != null && extra.note !== false && <p className="pd-define-extra-note">{extra.note}</p>}
  </div>;
}

/* ── Card ────────────────────────────────────────────────── */

/** Everything in the card that Tab can reach, in order. */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type DefineCardProps = {
  id: string;
  k: DefinitionKey;
  /**
   * The label's part, alignment and box. A function: a card open from the start learns them from the label
   * that claims it, which renders before the card (in page order) but after the provider.
   */
  label: () => LabelInfo | null;
  /** Pinned (modal: backdrop, focus inside) rather than peeking. */
  pinned: boolean;
  place: Place;
  clockNow?: string;
  updatedAt?: Partial<Record<string, number>>;
  canExplore: boolean;
  onExplore: (key: ExploreKey) => void;
  onClose: (refocus: boolean) => void;
  /** Receives the slot the label's box is portalled into. */
  onSlot: (el: HTMLElement | null) => void;
  /** The mouse entered (true) or left (false) the card. */
  onHover: (inside: boolean) => void;
  /** Where the pointer is over the card or the backdrop. */
  onPoint: (p: Point) => void;
};

/**
 * The open card: title and close, the definition, the label's box, its facts and its actions. Pinned, it sits
 * over a transparent backdrop that closes it, focus moves into it and Tab stays inside it; peeking, it is a
 * plain non-modal dialog. Escape closes it and focus goes back to the label.
 */
function DefineCard({ id, k, label, pinned, place, clockNow, updatedAt, canExplore, onExplore, onClose, onSlot, onHover, onPoint }: DefineCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { part, align = "start" } = label() ?? {};
  const def = DEFINITIONS[k];
  const titleId = `${id}-title`;
  // Each label's card mounts afresh (the provider keys it by label); focus moves in when it opens pinned or a peek is pinned.
  useEffect(() => { if (pinned) cardRef.current?.focus({ preventScroll: true }); }, [pinned]);
  // Native listeners: React's enter and leave follow the component tree, and the box is portalled in from the label.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") onHover(true); };
    const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") onHover(false); };
    const move = (e: PointerEvent) => onPoint({ x: e.clientX, y: e.clientY });
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("pointermove", move);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("pointermove", move);
    };
  }, [onHover, onPoint]);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") { e.stopPropagation(); onClose(true); }
  };
  const wrapTo = (end: "first" | "last") => {
    const list = [...(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    ((end === "first" ? list[0] : list[list.length - 1]) ?? cardRef.current)?.focus();
  };
  const style = place
    ? { "--pd-define-x": `${place.x}px`, "--pd-define-y": `${place.y}px`, "--pd-define-max-h": place.maxH != null ? `${place.maxH}px` : undefined } as CSSProperties
    : undefined;
  return <>
    {pinned && <button type="button" className="pd-define-backdrop" tabIndex={-1} aria-hidden="true"
      onPointerMove={e => onPoint({ x: e.clientX, y: e.clientY })} onClick={e => { onPoint({ x: e.clientX, y: e.clientY }); onClose(true); }}/>}
    {pinned && <span className="pd-sr" tabIndex={0} onFocus={() => wrapTo("last")}/>}
    <div ref={cardRef} id={id} className={cx("pd-define-card", align === "end" && "is-end")} style={style} role="dialog" aria-modal={pinned}
      aria-labelledby={titleId} tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="pd-define-head">
        <strong id={titleId} className="pd-define-title">{def.title}</strong>
        <button type="button" className="pd-define-close" aria-label={`Close what ${def.title} means`} onClick={() => onClose(true)}><Icon name="close" size={16} strokeWidth={2}/></button>
      </div>
      <p className="pd-define-text">{def.text}</p>
      {def.formula && <p className="pd-define-formula">{def.formula}</p>}
      {/* The label's box (Define's `extra`) is portalled in here: after the text and formula, before the facts. */}
      <div ref={onSlot} className="pd-define-slot"/>
      <DefinitionFacts k={k} part={part} clockNow={clockNow} updatedAt={updatedAt}/>
      <DefinitionActions k={k} canExplore={canExplore} onExplore={onExplore}/>
    </div>
    {pinned && <span className="pd-sr" tabIndex={0} onFocus={() => wrapTo("first")}/>}
  </>;
}

/** The other metrics and how fresh the number is, as rows on hairlines. */
function DefinitionFacts({ k, part, clockNow, updatedAt }: { k: DefinitionKey; part?: string; clockNow?: string; updatedAt?: Partial<Record<string, number>> }) {
  const def = DEFINITIONS[k];
  // The first metric is the card's own ("Open in Metabase") only when it bears the card's name; a composite
  // (Contribution: Gross margin, Delivery cost, Shrink) is built from all of them.
  const [first, ...rest] = def.metrics;
  const others = first != null && metricName(first).toLowerCase() === def.title.toLowerCase() ? rest : def.metrics;
  const updated = part ? updatedAt?.[part] : undefined;
  // The metrics list goes under its label (names wrap); the short facts sit label left, value right.
  const rows: { label: string; value: ReactNode; list?: boolean }[] = [];
  if (others.length) rows.push({
    label: def.formula ? "Built from" : "See also",
    list: true,
    value: others.map((id, i) => <span key={id}>{i > 0 && " · "}<a href={metricUrl(id)} target="_blank" rel="noopener" aria-label={`Open in Metabase: ${metricName(id)} (new tab)`}>{metricName(id)}</a></span>),
  });
  if (updated != null) rows.push({ label: "Updated", value: <Since at={updated}/> });
  if (clockNow) rows.push({ label: "As of", value: clockLabel(clockNow) });
  if (!rows.length) return null;
  return <div className="pd-define-facts">
    {rows.map(r => <div className={cx("pd-define-row", r.list && "is-list")} key={r.label}><span className="pd-define-row-label">{r.label}</span><span className="pd-define-row-value">{r.value}</span></div>)}
  </div>;
}

/** "Open in Metabase ↗" for the primary Library metric, and "Explore" where the page offers it. */
function DefinitionActions({ k, canExplore, onExplore }: { k: DefinitionKey; canExplore: boolean; onExplore: (key: ExploreKey) => void }) {
  const def = DEFINITIONS[k];
  const primary = def.metrics[0];
  const explore = canExplore ? def.explore : undefined;
  if (primary == null && !explore) return null;
  return <div className="pd-define-actions">
    {primary != null && <a className="pd-define-open" href={metricUrl(primary)} target="_blank" rel="noopener"
      aria-label={`Open in Metabase: ${metricName(primary)} (new tab)`}>Open in Metabase<span aria-hidden="true">↗</span></a>}
    {explore && <button type="button" className="pd-define-explore" aria-label={`Explore ${def.title} by day and country`} onClick={() => onExplore(explore)}><span>Explore</span></button>}
  </div>;
}

/** "12 s ago", counting while it is on screen. */
function Since({ at }: { at: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <>{elapsed((now - at) / 1000)}</>;
}

/** Seconds as "just now", "12 s ago", "4 min ago", "2 h ago". */
export function elapsed(seconds: number): string {
  if (!Number.isFinite(seconds)) return "—";
  const s = Math.max(0, Math.floor(seconds));
  if (s < 1) return "just now";
  if (s < 60) return `${s} s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
