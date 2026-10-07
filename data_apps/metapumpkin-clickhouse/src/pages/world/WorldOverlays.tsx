import { type CSSProperties, memo, type MouseEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "../../components/ui";
import { int, timeTz } from "../../format";
import { inScope, type RegionCode, type Scope } from "../../types";
import { GEO } from "./geo";
import { type CalloutModel, type Camera, cx, LAYERS, type LayerId, miniRect, project, type Size, TONE_COLOR, tzOf } from "./model";
import type { WorldEvent } from "./types";

/*
 * What floats over the map: the region callouts, the zoom buttons, the Live pill, "Show on map",
 * the minimap, Live activity and the loading pill. Each carries `data-ui`, so WorldMap neither starts a drag nor
 * reads a click on the ground through it.
 */

/** 24-unit stroke glyphs the shared Icon set has no use for elsewhere. */
const GLYPH = {
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  target: <><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
  // four corners out (open the full view) and in (leave it)
  expand: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>,
  shrink: <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/>,
};
function Glyph({ name }: { name: keyof typeof GLYPH }) {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "plus" || name === "minus" ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {GLYPH[name]}
  </svg>;
}

const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

/**
 * One callout per region, over its land: the local time with a sun or a moon, its stores, the vans out and the
 * alerts (stopped vans, stores out). It fades when its point leaves the viewport; a region outside the scope steps
 * back. Near the map's side it slides inside, its arrow still on the point. Clicking one picks that region in the
 * top bar, which flies the map there. From far out (the overview) it is lettered on the map rather than a card, and
 * a lettering that would overlap the one below it moves up.
 */
export function Callouts({ items, cam, size, scope, onPick, lettered = false }: { items: CalloutModel[]; cam: Camera; size: Size; scope: Scope; onPick: (region: RegionCode) => void; lettered?: boolean }) {
  const els = useRef(new Map<string, HTMLElement>());
  const [boxes, setBoxes] = useState<Record<string, [number, number]>>({});
  // Measured when what they say or how they are drawn changes (the viewport's width moves the type's breakpoints), not
  // on every camera move: a measurement forces a layout of the whole page, once per frame of a zoom.
  useBrowserLayoutEffect(() => {
    const next: Record<string, [number, number]> = {};
    els.current.forEach((el, id) => { next[id] = [el.offsetWidth, el.offsetHeight]; });
    setBoxes(b => Object.keys(next).some(id => b[id]?.[0] !== next[id][0] || b[id]?.[1] !== next[id][1]) ? next : b);
  }, [items, lettered, size.w]);
  const placed = items.map(c => {
    const p = project(c.at[0], c.at[1], cam, size), [w, h] = boxes[c.id] ?? [200, 60], half = w / 2;
    const left = Math.max(half + 12, Math.min(size.w - half - 12, p.x));
    // lettered, it stands a little above its point, clear of the land and the names under it
    return { c, p, half, h, left, top: lettered ? p.y - 26 : p.y };
  });
  if (lettered) {
    // lowest first: a lettering overlapping one already placed below it moves up, clear of it
    const done: typeof placed = [];
    for (const it of [...placed].sort((a, b) => b.top - a.top)) {
      for (const o of done) {
        const apart = it.left + it.half < o.left - o.half || o.left + o.half < it.left - it.half;
        if (!apart && it.top > o.top - o.h - 6) it.top = o.top - o.h - 6;
      }
      done.push(it);
    }
  }
  return <>
    {placed.map(({ c, p, half, left, top }) => {
      const visible = p.x > -60 && p.x < size.w + 60 && p.y > 30 && p.y < size.h + 80;
      const inside = inScope(scope, c.id);
      const arrow = Math.max(16 - half, Math.min(half - 16, p.x - left));
      return <button type="button" key={c.id} data-ui className={cx("pd-world-float pd-world-callout", lettered && "is-lettered")} onClick={() => onPick(c.id)}
        ref={el => { if (el) els.current.set(c.id, el); else els.current.delete(c.id); }}
        aria-label={`${c.name}: ${int(c.stores)} stores, ${int(c.out)} vans out, ${int(c.alerts)} alerts. Zoom in`}
        aria-hidden={visible ? undefined : true} tabIndex={visible ? undefined : -1}
        style={{ left: Math.round(left), top: Math.round(top), "--pdw-arrow": `${Math.round(arrow)}px`, opacity: visible ? (inside ? 1 : 0.55) : 0, pointerEvents: visible ? undefined : "none" } as CSSProperties}>
        {lettered ? <>
          <span className="pd-world-callout-name">{c.name}</span>
          <span className="pd-world-callout-line">
            <Icon name={c.day ? "sun" : "moon"} size={14} strokeWidth={2}/>{c.times}<b>·</b>{int(c.stores)} stores<b>·</b>{int(c.out)} vans out<b>·</b>{int(c.alerts)} alerts
          </span>
        </> : <>
        <span className="pd-world-callout-head">
          <b>{c.name}</b>
          <span className="pd-world-callout-time"><span className={c.day ? "is-day" : "is-night"}><Icon name={c.day ? "sun" : "moon"} size={14} strokeWidth={2}/></span>{c.times}</span>
        </span>
        <span className="pd-world-callout-figs">
          <span><Icon name="store" size={15} strokeWidth={2}/>{int(c.stores)}</span>
          <span><Icon name="truck" size={15} strokeWidth={2}/>{int(c.out)}</span>
          <span className={cx("is-alerts", !!c.alerts && "has-alerts")}><Icon name="alert" size={15} strokeWidth={2}/>{int(c.alerts)}</span>
        </span>
        </>}
      </button>;
    })}
  </>;
}

/** Zoom in, zoom out, back to the whole world, and the full view (on or off); the Live pill. */
export function MapControls({ onZoom, onRecenter, full, onFull }: { onZoom: (step: 1 | -1) => void; onRecenter: () => void; full: boolean; onFull: () => void }) {
  return <>
    <div className="pd-world-float pd-world-zoom" data-ui>
      <button type="button" className="pd-world-iconbtn" aria-label="Zoom in" onClick={() => onZoom(1)}><Glyph name="plus"/></button>
      <button type="button" className="pd-world-iconbtn" aria-label="Zoom out" onClick={() => onZoom(-1)}><Glyph name="minus"/></button>
      <button type="button" className="pd-world-iconbtn" aria-label="Show the whole world" onClick={onRecenter}><Glyph name="target"/></button>
      {/* focused in code too: Safari and Firefox on macOS give a clicked button no focus, and the full view hears Escape
          and keeps Tab only with focus inside it */}
      <button type="button" className="pd-world-iconbtn" aria-label="Full view" aria-pressed={full} title={full ? "Leave full view (Esc)" : "Full view"}
        onClick={e => { e.currentTarget.focus({ preventScroll: true }); onFull(); }}>
        <Glyph name={full ? "shrink" : "expand"}/>
      </button>
    </div>
    <div className="pd-world-float pd-world-live" data-ui><i aria-hidden="true"/>Live</div>
  </>;
}

/** "Show on map": a checkbox per layer, with its swatch. */
export function LayersMenu({ open, onOpen, show, onShow }: { open: boolean; onOpen: (open: boolean) => void; show: Record<LayerId, boolean>; onShow: (id: LayerId, on: boolean) => void }) {
  const id = useId();
  return <div className="pd-world-float pd-world-layers" data-ui>
    <button type="button" className="pd-world-layers-head" aria-expanded={open} aria-controls={id} onClick={() => onOpen(!open)}>
      Show on map<Icon name="chevronDown" size={16} strokeWidth={1.8}/>
    </button>
    {open && <div id={id} className="pd-world-layers-list">
      {LAYERS.map(l => <label key={l.id} className="pd-world-check">
        <input type="checkbox" checked={show[l.id]} onChange={e => onShow(l.id, e.currentTarget.checked)}/>
        <i aria-hidden="true" style={{ background: l.color }}/>{l.label}
      </label>)}
    </div>}
  </div>;
}

/** The newest three things vans and stores did, at the place's local time. */
export const LiveActivity = memo(function LiveActivity({ events }: { events?: WorldEvent[] }) {
  const latest = events ? events.slice(-3).reverse() : null;
  return <section className="pd-world-float pd-world-feed" aria-label="Live activity" data-ui>
    <div className="pd-world-feed-head"><h2>Live activity</h2><span>Live</span></div>
    {!latest ? <p className="pd-world-feed-note">Loading…</p>
      : !latest.length ? <p className="pd-world-feed-note">Nothing yet today</p>
      : <ul>
        {latest.map(e => <li key={e.key} className="pd-world-feed-row">
          <i aria-hidden="true" style={{ background: TONE_COLOR[e.tone] }}/>
          <span className="pd-world-feed-text">{e.text}</span>
          <span className="pd-world-feed-time">{timeTz(e.at, tzOf(e.countryCode))}</span>
        </li>)}
      </ul>}
  </section>;
});

/** The whole land small, with the viewport's frame; clicking a spot moves the map there (`onMove(null)`: back home). */
export function Minimap({ cam, size, onMove }: { cam: Camera; size: Size; onMove: (at: [u: number, v: number] | null) => void }) {
  const [w, h] = GEO.mini.size, r = miniRect(cam, size);
  const click = (e: MouseEvent<HTMLButtonElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    // A keyboard press has no point to move to: it brings the map home.
    onMove(e.detail === 0 || !box.width ? null : [(e.clientX - box.left) / box.width, (e.clientY - box.top) / box.height]);
  };
  return <div className="pd-world-float pd-world-mini" data-ui>
    <button type="button" aria-label="Move the map" onClick={click} style={{ width: w, height: h }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <path d={GEO.mini.d} className="w-land"/>
        <rect x={r.x.toFixed(1)} y={r.y.toFixed(1)} width={r.w.toFixed(1)} height={r.h.toFixed(1)} rx={2}/>
      </svg>
    </button>
  </div>;
}
