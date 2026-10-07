import { type CSSProperties, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode, type UIEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ALL_SCOPE, type Clock, type RegionCode, type Scope } from "../../types";
import { useViewerZone } from "../../viewer";
import { useVisible, visibleKey } from "../../visible";
import { GEO } from "./geo";
import { Decor, Fields, Fog, Hubs, Labels, Landmarks, litKey, NightShade, Overview, type PlacedVan, Roads, shadeKey, Stores, Terrain, Vans, Workshops } from "./layers";
import { ALL_LAYERS, anchorCamera, bays, calloutsFor, type Camera, cardFor, cardPlace, clampCamera, cx, daylight, DEFAULT_SIZE, homeCamera, indexWorld, labelSize, type LayerId, miniToPlane, type Motion, overviewAmount, planeTransform, project, queueOnRoads, REGION_MIN_Z, screenToPlane, shownFrac, type Size, vanSpot, ZOOM_STEP } from "./model";
import type { Pt, WorldStat, WorldViewModel } from "./types";
import { WorldCard } from "./WorldCard";
import { Callouts, LayersMenu, LiveActivity, MapControls, Minimap } from "./WorldOverlays";

/*
 * The World map: a viewport looking straight down at a big plane (GEO.w × GEO.h plane pixels) through a camera — a
 * point and a zoom. The plane holds the terrain, the roads, the night and the sprites
 * (world/layers.tsx); the viewport holds what floats over it (world/WorldOverlays.tsx) and the card.
 *
 * Full view (the last button under the zoom) lifts the whole stage out of the page to fill the window, over the app's
 * sidebar and tab bar, and brings the page's counters along (`stats`, small, over the map); the viewport's new size
 * refits the camera at home, or keeps its point and zoom. The data-app sandbox blocks the Fullscreen API, so it is the
 * window, not the screen. Escape leaves it (after closing a card); in it the stage takes focus from a click on the
 * map, so Escape is heard there too, and Tab goes round within it (the page under it is hidden; for screen readers
 * it is a modal dialog). A spacer keeps the stage's height in the page meanwhile, so the page keeps its scroll.
 *
 * The camera rests at home (the scope's region, or the whole land fitted to the viewport) until the viewer drags
 * it, zooms it (the wheel zooms at the pointer; the buttons by ZOOM_STEP), clicks the minimap or tabs to a sprite off
 * screen; a new scope brings it home again. CSS eases each move (world.css), except a drag's and the wheel's, which
 * land frame by frame as they come. The floating controls come before the plane in the DOM, so the keyboard reaches them first; the
 * viewport itself never scrolls (focus on a sprite off screen pans the camera instead).
 *
 * Between polls the vans keep moving: a one-second tick advances them along their roads from the simulated clock
 * (model.ts shownFrac). Nothing here measures or listens during render; the static preview renders the default
 * viewport (DEFAULT_SIZE) with the camera at home and the vans where the data puts them.
 */

/** A layout effect in the browser; on the server (the static preview) nothing runs, without React's warning. */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

const inUi = (target: EventTarget | null) => target instanceof Element && !!target.closest("[data-ui]");
/** The card a sprite or label opens (its data-pick), or null on the ground and over the floating UI. */
const pickOf = (target: EventTarget | null) =>
  target instanceof Element && !inUi(target) ? target.closest("[data-pick]")?.getAttribute("data-pick") ?? null : null;
const inCard = (target: EventTarget | null) => target instanceof Element && !!target.closest(".pd-world-card");
/** Focus the keyboard moved (not a click's): only that pans the map to a sprite. */
const byKeyboard = (el: Element) => { try { return el.matches(":focus-visible"); } catch { return true; } };
/** A client point as an offset from the viewport's middle, in its CSS pixels (the host may scale the app). */
function fromMiddle(el: HTMLElement, size: Size, x: number, y: number): Pt {
  const box = el.getBoundingClientRect(), scale = box.width / (el.offsetWidth || box.width) || 1;
  return [(x - box.left) / scale - el.clientLeft - size.w / 2, (y - box.top) / scale - el.clientTop - size.h / 2];
}
/** The viewport never scrolls (world.css clips it); where `overflow: clip` is unknown, focus could scroll it. */
const unscroll = (e: UIEvent<HTMLElement>) => { e.currentTarget.scrollLeft = 0; e.currentTarget.scrollTop = 0; };

/* ── The simulated clock ─────────────────────────────────── */

/** Where the count runs from: the simulated time `base` at the real time `at` (ms), and the reading it came from. */
type Anchor = { iso?: string; base: number; at: number };
/** Readings trail the count by the poll's latency: within this, the count keeps its anchor and never steps back. */
const AHEAD_MS = 1000, BEHIND_MS = 15_000;
function reanchor(prev: Anchor, iso: string | undefined, at: number): Anchor {
  const reading = iso ? Date.parse(iso) : NaN;
  const drift = reading - (prev.base + (at - prev.at));
  return drift <= AHEAD_MS && drift >= -BEHIND_MS ? { ...prev, iso } : { iso, base: reading, at };
}
/**
 * The simulated time now (the last clock reading plus the real time since it arrived, like the Halloween
 * countdown), ticking each second while the vans can move, and the vans' Motion since they arrived. Without
 * `vansAt` (the static preview) nothing ticks and the vans stand still.
 */
function useSimClock(iso: string | undefined, vansAt: number | undefined): { sim: number | null; motion: Motion | null } {
  const [now, setNow] = useState(() => Date.now());
  const [anchor, setAnchor] = useState<Anchor>(() => ({ iso, base: iso ? Date.parse(iso) : NaN, at: now }));
  // A new reading (state adjusted while rendering, not in an effect).
  if (anchor.iso !== iso) {
    const at = Date.now();
    setAnchor(reanchor(anchor, iso, at));
    setNow(at);
  }
  const ticking = vansAt != null;
  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ticking]);
  const sim = anchor.base + Math.max(0, now - anchor.at);
  if (!Number.isFinite(sim)) return { sim: null, motion: null };
  return { sim, motion: vansAt == null ? null : { simAtVans: anchor.base + (vansAt - anchor.at), elapsedS: Math.max(0, now - vansAt) / 1000 } };
}

/* ── The map ─────────────────────────────────────────────── */

export type WorldMapProps = {
  vm: WorldViewModel;
  scope: Scope;
  onScope: (scope: Scope) => void;
  clock?: Clock;
  layersOpen: boolean;
  onLayersOpen: (open: boolean) => void;
  focus: WorldStat | null;
  pinned: string | null;
  onPin: (pick: string | null) => void;
  busy?: boolean;
  /** The counters, drawn over the map in its full view (the page shows its own above the map). */
  stats?: ReactNode;
};

export function WorldMap({ vm, scope, onScope, clock, layersOpen, onLayersOpen, focus, pinned, onPin, busy, stats }: WorldMapProps) {
  const viewerTz = useViewerZone();
  const [size, setSize] = useState<Size>(DEFAULT_SIZE);
  // null: at home, which follows the viewport's size.
  const [camera, setCamera] = useState<Camera | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const [gesture, setGesture] = useState<"drag" | "zoom" | null>(null);
  const [show, setShow] = useState(ALL_LAYERS);
  const [full, setFull] = useState(false);
  // The stage's height when the full view opened: a spacer holds its place in the page.
  const stageRef = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(0);
  const toggleFull = () => {
    if (!full) setHeld(stageRef.current?.offsetHeight ?? 0);
    setFull(f => !f);
  };

  // The countries this viewer may see ("CA"; empty: all, src/visible.ts): the map draws those alone, the rest under fog.
  const seen = visibleKey(useVisible());
  // A new scope flies home (adjusted while rendering, so the move starts with the frame that shows it); so does
  // learning which countries the viewer may see, which moves home onto them.
  const homeKey = `${scope.region}|${scope.country ?? ""}|${seen}`;
  const [home, setHome] = useState(homeKey);
  if (home !== homeKey) {
    setHome(homeKey);
    setCamera(null);
    setHover(null);
  }
  const cam = camera ?? homeCamera(scope, size, seen);
  // The native listeners read the latest camera through this.
  const live = useRef({ cam, size });
  live.current = { cam, size };

  // The viewport's size, before the first paint and whenever it changes.
  const vpRef = useRef<HTMLElement>(null);
  useBrowserLayoutEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w && h) setSize(s => Math.abs(s.w - w) > 1 || Math.abs(s.h - h) > 1 ? { w, h } : s);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  // The first measurement moves the camera from the default viewport's fit: it lands without easing (two frames on, moves ease).
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => setSettled(true)); });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Camera moves from a drag or the wheel land once per frame.
  const frame = useRef<{ raf: number; next: Camera | null }>({ raf: 0, next: null });
  const schedule = useCallback((next: Camera, kind: "drag" | "zoom") => {
    const f = frame.current;
    f.next = next;
    if (f.raf) return;
    f.raf = requestAnimationFrame(() => {
      f.raf = 0;
      if (f.next) setCamera(f.next);
      f.next = null;
      setGesture(kind);
      setHover(null);
    });
  }, []);
  const flush = () => {
    const f = frame.current;
    if (f.raf) cancelAnimationFrame(f.raf);
    if (f.next) setCamera(f.next);
    f.raf = 0;
    f.next = null;
  };

  // The wheel zooms at the pointer: the plane point under it stays under it. A native listener, so it can keep the page from scrolling.
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    let idle = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Over the full view's counters, when they overflow their row (a narrow window), the wheel scrolls them sideways.
      const bar = e.target instanceof Element ? e.target.closest<HTMLElement>(".pd-world-statbar") : null;
      if (bar && bar.scrollWidth > bar.clientWidth) {
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
        bar.scrollLeft += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
        return;
      }
      const { size } = live.current, from = frame.current.next ?? live.current.cam;
      const [mx, my] = fromMiddle(el, size, e.clientX, e.clientY);
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      const z = clampCamera({ ...from, z: from.z * Math.exp(-dy * 0.0016) }, size).z;
      schedule(clampCamera(anchorCamera(screenToPlane(from, mx, my), mx, my, z), size), "zoom");
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setGesture(g => g === "zoom" ? null : g), 220);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(idle);
    };
  }, [schedule]);
  useEffect(() => () => cancelAnimationFrame(frame.current.raf), []);

  /*
   * Drag to pan: the plane point pressed stays under the pointer. A press that moves under 5px stays a click; one that
   * moved is not read as a click on what is under it. The press captures the pointer on what it pressed (so its click
   * still lands there), and the release comes back here wherever it happens; a cancelled or lost capture, or a move
   * with no button down (a release this map never saw), ends the drag where it is.
   */
  const drag = useRef<{ x: number; y: number; at: Pt; z: number; moved: boolean; id: number } | null>(null);
  const justDragged = useRef(false);
  // Where the pointer last moved (the hover below reads it).
  const pointer = useRef<Pt>([NaN, NaN]);
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || inUi(e.target) || !(e.target instanceof Element)) return;
    const at = screenToPlane(cam, ...fromMiddle(e.currentTarget, size, e.clientX, e.clientY));
    drag.current = { x: e.clientX, y: e.clientY, at, z: cam.z, moved: false, id: e.pointerId };
    try { e.target.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ }
  };
  const endDrag = (e: PointerEvent<HTMLElement>, released: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    flush();
    setGesture(null);
    if (!released) return;
    justDragged.current = true;
    window.setTimeout(() => { justDragged.current = false; }, 0);
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    pointer.current = [e.clientX, e.clientY];
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!(e.buttons & 1)) return endDrag(e, false);
    if (!d.moved) {
      if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) < 5) return;
      d.moved = true;
    }
    const [mx, my] = fromMiddle(e.currentTarget, size, e.clientX, e.clientY);
    schedule(clampCamera(anchorCamera(d.at, mx, my, d.z), size), "drag");
  };

  /*
   * A sprite pins its card; the ground clears it. Hover and keyboard focus show a card without pinning it; a click on
   * that card (not on its link) pins it. Leaving a sprite for the ground clears its card a moment later, so the pointer
   * can cross to the card, which keeps it. The card follows the pointer's moves, not the map's: with the pointer where
   * it last moved, a sprite sliding under it (a camera move, a van driving by) leaves the card as it is. Escape closes
   * the card, pinned or not; focus in it goes back to its sprite.
   */
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if (justDragged.current) return;
    if (inCard(e.target)) {
      if (!pinned && hover && !(e.target as Element).closest("a, button")) onPin(hover);
      return;
    }
    if (!inUi(e.target)) onPin(pickOf(e.target));
  };
  const leave = useRef(0);
  useEffect(() => () => window.clearTimeout(leave.current), []);
  const hoverOn = (pick: string | null) => {
    window.clearTimeout(leave.current);
    if (pick) setHover(pick);
    else leave.current = window.setTimeout(() => setHover(null), 250);
  };
  const onMouseOver = (e: MouseEvent<HTMLElement>) => {
    if (drag.current?.moved || (e.clientX === pointer.current[0] && e.clientY === pointer.current[1])) return;
    if (inCard(e.target)) window.clearTimeout(leave.current);
    else hoverOn(pickOf(e.target));
  };
  const onMouseLeave = () => {
    window.clearTimeout(leave.current);
    setHover(null);
  };
  // A sprite the keyboard reaches off screen (or under the floating panels) is brought to the middle, at the same zoom;
  // focus coming back to a sprite from its card (`refocus`) leaves the camera where it is.
  const refocus = useRef(false);
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    const pick = pickOf(e.target);
    if (!pick || !(e.target instanceof HTMLElement)) return;
    hoverOn(pick);
    const el = e.target, foot = project(el.offsetLeft, el.offsetTop, cam, size);
    const off = foot.x < 70 || foot.x > size.w - 70 || foot.y < 130 || foot.y > size.h - 110;
    // From the overview, a sprite reached by keyboard brings the full map in (the overview's marks are no tab stops).
    const z = overviewAmount(cam.z) > 0 ? Math.max(cam.z, REGION_MIN_Z) : cam.z;
    if ((off || z !== cam.z) && !refocus.current && byKeyboard(el)) setCamera(clampCamera({ fx: el.offsetLeft, fy: el.offsetTop, z }, size));
  };
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    const pick = pickOf(e.target);
    if (pick && !inCard(e.relatedTarget)) setHover(h => h === pick ? null : h);
  };
  const closeCard = (from: EventTarget | null) => {
    const pick = pinned ?? hover;
    if (pick && inCard(from)) {
      refocus.current = true;
      vpRef.current?.querySelector<HTMLElement>(`button[data-pick="${pick}"]`)?.focus({ preventScroll: true });
      refocus.current = false;
    }
    window.clearTimeout(leave.current);
    setHover(null);
    onPin(null);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Escape" || !(pinned ?? hover)) return;
    e.stopPropagation();
    closeCard(e.target);
  };
  // Escape with focus elsewhere in the app closes the card too (the pointer's card must be dismissible). The sandbox
  // allows element listeners only, so this listens on the app's root; with focus on the body nothing hears it.
  const open = !!(pinned ?? hover);
  useEffect(() => {
    const root = vpRef.current?.closest<HTMLElement>(".pd-app");
    if (!open || !root) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || (e.target instanceof Node && vpRef.current?.contains(e.target))) return;
      e.preventDefault(); // this Escape is spent on the card: the full view stays (onStageKeyDown)
      window.clearTimeout(leave.current);
      setHover(null);
      onPin(null);
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [open, onPin]);
  // In the full view Tab goes round within the stage (the page under it is hidden), and Escape leaves it once no card
  // is left to close: the viewport's handler closes the card first and stops the key; the root's runs before this one
  // (a native listener) and marks the key spent.
  const onStageKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Tab" && full) {
      const stage = e.currentTarget, at = document.activeElement;
      const items = [...stage.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])")]
        .filter(el => el.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (first && last && (e.shiftKey ? at === first || at === stage : at === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
      return;
    }
    if (e.key !== "Escape" || !full || open || e.defaultPrevented) return;
    e.stopPropagation();
    setFull(false);
    // the stage stops being focusable: focus goes back to the button that opened it
    vpRef.current?.querySelector<HTMLElement>(".pd-world-zoom [aria-pressed]")?.focus({ preventScroll: true });
  };

  const zoomBy = (step: 1 | -1) => setCamera(clampCamera({ ...cam, z: step > 0 ? cam.z * ZOOM_STEP : cam.z / ZOOM_STEP }, size));
  const recenter = () => {
    onPin(null);
    setCamera(null);
    if (scope.region !== "all" || scope.country) onScope(ALL_SCOPE);
  };
  const flyTo = (region: RegionCode) => {
    onPin(null);
    setCamera(null);
    onScope({ region, country: null });
  };
  const moveTo = (at: [number, number] | null) => {
    if (!at) return setCamera(null);
    const [fx, fy] = miniToPlane(at[0], at[1]);
    setCamera(clampCamera({ fx, fy, z: Math.max(cam.z, 0.9) }, size));
  };

  // The vans where they are now, from the latest data and the simulated time since it arrived.
  const { sim, motion } = useSimClock(clock?.now, vm.vansAt);
  const bayOf = useMemo(() => bays(vm.vans ?? []), [vm.vans]);
  const elapsed = motion?.elapsedS, simAtVans = motion?.simAtVans;
  const placed = useMemo(() => {
    const at: Motion | null = elapsed != null && simAtVans != null ? { elapsedS: elapsed, simAtVans } : null;
    const out: PlacedVan[] = [];
    const fracs = queueOnRoads(vm.vans ?? [], new Map((vm.vans ?? []).map(v => [v.truckId, shownFrac(v, at)])));
    for (const van of vm.vans ?? []) {
      const frac = fracs.get(van.truckId) ?? van.frac, spot = vanSpot(van, bayOf.get(van.truckId) ?? 0, frac);
      if (spot) out.push({ van, spot, frac });
    }
    return out;
  }, [vm.vans, bayOf, elapsed, simAtVans]);

  const light = useMemo(() => daylight(clock?.now), [clock?.now]);
  const { hubs, cities, stores, vans } = vm;
  const idx = useMemo(() => indexWorld({ hubs, cities, stores, vans }), [hubs, cities, stores, vans]);
  const callouts = useMemo(() => calloutsFor(vm.vans, vm.stores, clock?.now, light, seen), [vm.vans, vm.stores, clock?.now, light, seen]);

  const shown = pinned ?? hover;
  const card = shown ? cardFor(shown, { idx, vans: vm.vans, now: clock?.now, sim, viewerTz, spots: new Map(placed.map(p => [p.van.truckId, p])), scope }) : null;
  const hotOf = (kind: string) => shown?.startsWith(`${kind}:`) ? shown : null;
  const loading = !vm.vans || !vm.stores || !vm.hubs;
  const layer = (id: LayerId) => show[id];
  const ovShow = useMemo(() => ({ stores: show.stores, vans: show.vans, hubs: show.hubs }), [show.stores, show.vans, show.hubs]);
  // Far out, the overview (marks at screen size) over a quiet map; closer in, the full map: they cross-fade (world.css).
  const ov = overviewAmount(cam.z), overview = ov >= 0.5;

  return <><div ref={stageRef} className={cx("pd-world-stage", full && "is-full")} aria-busy={busy || undefined} tabIndex={full ? -1 : undefined} onKeyDown={onStageKeyDown}
    role={full ? "dialog" : undefined} aria-modal={full || undefined} aria-label={full ? "World map, full view" : undefined}>
    <section ref={vpRef} aria-label="World map" className={cx("pd-world-vp", gesture && `is-${gesture}`, !settled && "is-still", overview && "is-overview")}
      style={{ "--pdw-ov": ov.toFixed(3) } as CSSProperties}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={e => endDrag(e, true)} onPointerCancel={e => endDrag(e, false)} onLostPointerCapture={e => endDrag(e, false)}
      onClick={onClick} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} onScroll={unscroll}>
      <MapControls onZoom={zoomBy} onRecenter={recenter} full={full} onFull={toggleFull}/>
      {full && stats}
      <LayersMenu open={layersOpen} onOpen={onLayersOpen} show={show} onShow={(id, on) => setShow(s => ({ ...s, [id]: on }))}/>
      <Callouts items={callouts} cam={cam} size={size} scope={scope} onPick={flyTo} lettered={overview}/>
      {/* the minimap shows the whole world: not for a viewer who may see part of it */}
      {!overview && !seen && <Minimap cam={cam} size={size} onMove={moveTo}/>}
      <div className="pd-world-scene"><div className="pd-world-plane" style={{ width: GEO.w, height: GEO.h, marginLeft: -GEO.w / 2, marginTop: -GEO.h / 2, transform: planeTransform(cam) }}>
        <Terrain/>
        <div className={cx("pd-world-roads", !layer("roads") && "is-off")}><Roads/></div>
        <NightShade shades={shadeKey(light)}/>
        <Fog seen={seen}/>
        <div className="pd-world-detail">
          <Decor seen={seen}/>
          <Fields on={layer("fields")} scope={scope} hot={hotOf("field")} hubs={vm.hubs} seen={seen}/>
          <Workshops on={layer("workshops")} scope={scope} hot={hotOf("workshop")} hubs={vm.hubs} seen={seen}/>
          <Hubs on={layer("hubs")} scope={scope} hot={hotOf("hub")} hubs={vm.hubs} lit={litKey(light)} seen={seen}/>
          <Stores on={layer("stores")} scope={scope} hot={hotOf("store")} stores={vm.stores} cities={vm.cities} focus={focus} lit={litKey(light)} seen={seen}/>
          <Landmarks scope={scope} hot={hotOf("city")} cities={vm.cities} seen={seen}/>
          <div className="pd-world-labels" style={{ "--pdw-ls": `${labelSize(cam.z)}px` } as CSSProperties}><Labels scope={scope} cities={vm.cities} hubs={vm.hubs} seen={seen}/></div>
          <Vans on={layer("vans")} scope={scope} hot={hotOf("van")} vans={placed} focus={focus}/>
        </div>
        {/* 1 / zoom, for the overview's marks alone: set on the whole plane it would restyle every sprite on each zoom */}
        <div className="pd-world-ov-k" style={{ "--pdw-k": (1 / cam.z).toFixed(4) } as CSSProperties}>
          <Overview scope={scope} hot={shown} show={ovShow} vans={placed} stores={vm.stores} cities={vm.cities}
            hubs={vm.hubs} focus={focus} seen={seen}/>
        </div>
      </div></div>
      <div className="pd-world-gold" aria-hidden="true"/>
      {loading && <p className="pd-world-float pd-world-loading" role="status" data-ui><i aria-hidden="true"/>Loading the map…</p>}
      {card && <WorldCard card={card} pinned={pinned === shown} style={cardPlace(card, cam, size, cardHeight)} onClose={() => closeCard(document.activeElement)} onScope={onScope} onHeight={setCardHeight}/>}
    </section>
    <LiveActivity events={vm.events}/>
  </div>{full && <div className="pd-world-held" style={{ height: held }} aria-hidden="true"/>}</>;
}
