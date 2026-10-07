import { createContext, type RefObject, useCallback, useContext, useEffect, useRef, useState } from "react";
import "./tabbar.css";
import { Link } from "../nav";
import { routes, TABS, type TabId } from "../routes";
import { Icon, type IconName } from "./ui";

/*
 * The floating glass tab bar (under 900px; the sidebar takes over from 900px up). Two states:
 *   full     a capsule of four tabs (Business · Fleet · Stores · World) and, beside it, a round Explore button
 *   compact  while you scroll down a page: a round button with the current tab's icon (it brings the full bar
 *            back), the page's live line (the "accessory": a tap goes back to the top) and Explore, smaller
 * Scrolling up, or reaching the top, brings the full bar back. Both states are always in the DOM: the hidden one
 * fades and shrinks away and then turns `visibility: hidden`, so it leaves the Tab order and the accessibility
 * tree. Styles: tabbar.css.
 */

export const TAB_ICON: Record<TabId, IconName> = { business: "dollar", fleet: "truck", stores: "store", world: "globe", explore: "chart", flow: "route" };
/** The capsule's four tabs: Explore has its own round button, and Data flow is reached from the Me sheet. */
const BAR_TABS = TABS.filter(t => t.id !== "explore" && t.id !== "flow");
const EXPLORE = TABS.find(t => t.id === "explore")!;

/** The compact bar's live line: two short lines and the dot's tone (olive live, pumpkin simulated, terracotta alert). */
export type BarAccessory = { label: string; detail?: string; tone?: "live" | "shifted" | "alert" };

const AccessoryContext = createContext<((accessory: BarAccessory | null) => void) | null>(null);
export const AccessoryProvider = AccessoryContext.Provider;

/**
 * A page's line for the compact tab bar ("Live · 234 sales" on Business). Pass null while its data loads: the
 * bar then shows the clock. The line goes when the page does. Outside the shell (no provider) it does nothing.
 */
export function useBarAccessory(accessory: BarAccessory | null) {
  const set = useContext(AccessoryContext);
  const key = accessory ? `${accessory.label}\n${accessory.detail ?? ""}\n${accessory.tone ?? ""}` : "";
  useEffect(() => {
    if (!set) return undefined;
    set(key ? accessory : null);
    return () => set(null);
    // Keyed on the text: a new object with the same words does not set it again.
  }, [set, key]);
}

/** Pixels: the top of the page where the bar is always full, how far down before it may shrink, and the jitter it ignores. */
const TOP = 80, SHRINK_FROM = 160, JITTER = 8;
/** The top bar's height: past it, the floating region pill and avatar show. */
const PAST = 72;

/**
 * The window's scroll, read once a frame: `compact` (scrolling down past SHRINK_FROM; any scroll up or the top
 * clears it), `past` (scrolled beyond the top bar) and `expand()`, for the compact bar's tab button. A new
 * `resetKey` (the page's path) starts full. `hold` keeps the bar full while focus is in it.
 */
export function useBarScroll(resetKey: string, hold?: RefObject<HTMLElement>) {
  const [state, setState] = useState({ compact: false, past: false });
  const last = useRef(0);
  useEffect(() => {
    setState({ compact: false, past: false });
    if (typeof window === "undefined") return undefined;
    last.current = window.scrollY;
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const dy = y - last.current;
      const moved = Math.abs(dy) > JITTER;
      if (moved || y < TOP) last.current = y;
      const held = !!hold?.current && hold.current.contains(document.activeElement);
      setState(s => {
        let compact = s.compact;
        if (y < TOP || held) compact = false;
        else if (moved) compact = dy > 0 ? (y > SHRINK_FROM || compact) : false;
        const past = y > PAST;
        return compact === s.compact && past === s.past ? s : { compact, past };
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [resetKey, hold]);
  const expand = useCallback(() => setState(s => ({ ...s, compact: false })), []);
  return { ...state, expand };
}

const toTop = () => {
  try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* not scrollable here */ }
};

export type TabBarProps = {
  active: TabId;
  compact: boolean;
  onExpand: () => void;
  accessory: BarAccessory;
  /** Above zero, Fleet carries the orange dot. */
  lateVans: number;
  lateNote: string;
  navRef?: RefObject<HTMLElement>;
};

export function TabBar({ active, compact, onExpand, accessory, lateVans, lateNote, navRef }: TabBarProps) {
  const late = lateVans > 0;
  const current = TABS.find(t => t.id === active) ?? TABS[0];
  const exploreOn = active === "explore";
  return <nav ref={navRef} aria-label="Main navigation" className={`pd-tabbar${compact ? " is-compact" : ""}`}>
    <div className="pd-tabbar-full">
      <div className="pd-tabbar-tabs pd-glass">
        {BAR_TABS.map(tab => {
          const on = tab.id === active;
          return <Link key={tab.id} to={tab.to} aria-current={on ? "page" : undefined} className="pd-tab">
            <span className="pd-tab-icon"><Icon name={TAB_ICON[tab.id]} size={22} strokeWidth={on ? 1.9 : 1.75}/>{tab.id === "fleet" && late && <span className="pd-nav-dot"/>}</span>
            {/* The short label where there is one; screen readers get the full one. */}
            <span className="pd-tab-label">{tab.short ? <><span aria-hidden="true">{tab.short}</span><span className="pd-sr">{tab.label}</span></> : tab.label}{tab.id === "fleet" && late && <span className="pd-sr">. {lateNote}</span>}</span>
          </Link>;
        })}
      </div>
      <Link to={EXPLORE.to} aria-label={EXPLORE.label} aria-current={exploreOn ? "page" : undefined} className="pd-round pd-glass pd-tabbar-explore">
        <Icon name="chart" size={24} strokeWidth={exploreOn ? 2 : 1.9}/>
      </Link>
    </div>

    <div className="pd-tabbar-mini">
      <button type="button" className="pd-round pd-glass is-current" aria-label={`${current.label}. Show all tabs`} onClick={onExpand}>
        <Icon name={TAB_ICON[current.id]} size={22} strokeWidth={1.9}/>
        {current.id === "fleet" && late && <span className="pd-nav-dot"/>}
      </button>
      <button type="button" className="pd-tabbar-accessory pd-glass" aria-label={`${accessory.label}${accessory.detail ? `, ${accessory.detail}` : ""}. Back to the top`} onClick={toTop}>
        <i className={`pd-tabbar-pulse is-${accessory.tone ?? "live"}`}/>
        <span><b>{accessory.label}</b>{accessory.detail && <span>{accessory.detail}</span>}</span>
      </button>
      <Link to={routes.explore()} aria-label={EXPLORE.label} aria-current={exploreOn ? "page" : undefined} className="pd-round pd-glass pd-tabbar-explore">
        <Icon name="chart" size={22} strokeWidth={1.9}/>
      </Link>
    </div>
  </nav>;
}
