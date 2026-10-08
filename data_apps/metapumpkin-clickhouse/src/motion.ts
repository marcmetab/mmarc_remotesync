import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { Route } from "./routes";

/*
 * Motion between pages, and the one thing a page hands to the next: the sale a Live sales row opened.
 *
 * Pages (App.tsx Root): most open with the short fade (base.css). A few pairs play their own way across:
 *   right / left   Business ↔ Stores (and the city and store pages, which share the Stores banner): the banner's
 *                  camera pans across one world (banner/HarvestScene.tsx) and the page slides the way it went.
 *   liftoff        Business → World: the Business rows fall away, then the World page rises out of the banner
 *                  (world/Liftoff.tsx): a balloon, the night, the clouds, and the map assembles under them.
 *   land           World → Business: the way back down, and the Business rows drop in.
 *   sale / return  a Live sales row opened as its store, and back (below).
 * The page being left stays on screen for EXIT_MS, playing its way out, while the next one mounts unseen (its
 * queries start at once). Reduced motion: every change is the plain fade, with nothing held.
 *
 * The sale (SaleSheet.tsx): a click on a Live sales row lifts the row out of the table and grows it to fill the
 * view while the list sinks behind it, then the store page opens under it: its banner unrolls, the van drives in,
 * the sale plays out at the stall (one pumpkin hops per pumpkin sold, the amount rises), and the page keeps the
 * sale ringed ("This sale"). The banner's "Live sales" button shrinks it back into its row, which glows once.
 * The hand-off lives here, outside React, so the row, the sheet, the store page and the banner all read one copy.
 */

/** The viewer asked for less motion: transitions are cut to the plain fade and nothing plays on its own. */
export function reducedMotion(): boolean {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}

export type PageMotion = "fade" | "right" | "left" | "liftoff" | "land" | "sale" | "return";

/** The harvest world's two cameras: Business's hill road, and the stall the Stores pages share. */
export type Camera = "biz" | "stores";
export function cameraOf(route: Route): Camera | null {
  if (route.page === "Business") return "biz";
  return route.page === "Stores" || route.page === "City" || route.page === "Store" ? "stores" : null;
}

/** How a page change looks, from the two routes (a sale's own hand-off is checked first: `saleMotion`). */
export function motionBetween(from: Route, to: Route): PageMotion {
  const a = cameraOf(from), b = cameraOf(to);
  if (a === "biz" && b === "stores") return "right";
  if (a === "stores" && b === "biz") return "left";
  if (from.page === "Business" && to.page === "World") return "liftoff";
  if (from.page === "World" && to.page === "Business") return "land";
  return "fade";
}

/** How long the page being left stays, playing its way out, before the next one shows (ms). */
export const EXIT_MS: Record<PageMotion, number> = { fade: 0, right: 280, left: 280, liftoff: 620, land: 760, sale: 0, return: 0 };

/**
 * The pages on screen: the one shown, and while a change plays its way out, the one being left (`from`, for
 * EXIT_MS of the change's motion; meanwhile the shown page is mounted unseen, so its queries start). `n` counts the
 * changes, so a timer knows whether its change is still the latest.
 */
export type PageStage = { shown: string; from: string | null; motion: PageMotion; n: number };

/**
 * The stage for the path the app is on (App.tsx Root). A new path: how its page comes in, and whether the page it
 * replaces plays its way out first (state adjusted while rendering). A change during another's way out cuts that
 * short: the page being left goes at once.
 */
export function usePageStage(path: string, routeFor: (path: string) => Route): PageStage {
  const [stage, setStage] = useState<PageStage>({ shown: path, from: null, motion: "fade", n: 0 });
  let next = stage;
  if (stage.shown !== path) {
    const motion = reducedMotion() ? "fade" : saleMotion(path) ?? motionBetween(routeFor(stage.shown), routeFor(path));
    next = { shown: path, from: EXIT_MS[motion] > 0 && !stage.from ? stage.shown : null, motion, n: stage.n + 1 };
    setStage(next);
  }
  useEffect(() => {
    if (!stage.from) return;
    const id = setTimeout(() => setStage(s => s.n === stage.n ? { ...s, from: null } : s), EXIT_MS[stage.motion]);
    return () => clearTimeout(id);
  }, [stage.n, stage.from, stage.motion]);
  return next;
}

/**
 * The change a page is part of, and its part in it: "leaving" (playing its way out), "waiting" (mounted, unseen) or
 * "shown". App.tsx gives each page its own, as "motion:role" (a string, so it only changes when they do). Outside it,
 * as in the static preview: a plain fade, shown.
 */
export const PageMotionContext = createContext("fade:shown");
export function usePageMotion(): { motion: PageMotion; role: "leaving" | "waiting" | "shown" } {
  const [motion, role] = useContext(PageMotionContext).split(":");
  return { motion: motion as PageMotion, role: role as "leaving" | "waiting" | "shown" };
}

/* ── The sale hand-off ───────────────────────────────────── */

/** One sale as its row showed it, frozen at the click: the sheet redraws the row from it, the store page rings it. */
export type SaleInfo = {
  id: string;
  storeId: number;
  storeName: string;
  /** "Toronto · Canada" */
  place: string;
  /** "29 s ago" at the click. */
  ago: string;
  /** The store's clock, then the viewer's: "18:12 EDT · 00:12 CEST". */
  local: string;
  variety: string;
  color: string;
  units: number;
  channel: string;
  /** "$23.97" */
  amount: string;
};

export type Box = { top: number; left: number; width: number; height: number };

/**
 * open    the row is growing into the sheet (`from` is its box at the click); the store page opens under it
 * shown   the store page is showing the sale
 * closing the banner's "Live sales" was pressed: the sheet covers the store page, then Business opens under it
 * return  Business is back: its Live sales row reports its box (`to`), the sheet shrinks into it and is gone
 */
export type SaleHandoff = { sale: SaleInfo; phase: "open" | "shown" | "closing" | "return"; from: Box; to?: Box | null; path: string; at: number };

let handoff: SaleHandoff | null = null;
const listeners = new Set<() => void>();
const emit = (next: SaleHandoff | null) => { handoff = next; listeners.forEach(l => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const read = () => handoff;
const none = () => null;

/** The sale on its way to or from its store page, or null. Rendered on the server (the preview): always null. */
export function useSaleHandoff(): SaleHandoff | null {
  return useSyncExternalStore(subscribe, read, none);
}
export const saleHandoff = read;

/** A Live sales row was clicked: the sheet takes it from here (SaleSheet.tsx). `path` is the store page's. */
export function openSale(sale: SaleInfo, from: Box, path: string) {
  emit({ sale, phase: "open", from, to: null, path, at: Date.now() });
}
export function setSalePhase(phase: SaleHandoff["phase"], to?: Box | null) {
  if (handoff) emit({ ...handoff, phase, to: to === undefined ? handoff.to : to, at: Date.now() });
}
export function endSale() { if (handoff) emit(null); }

/** The motion a sale's hand-off gives the page change to `path` (null: not the sale's). */
export function saleMotion(path: string): PageMotion | null {
  const h = handoff;
  if (!h || Date.now() - h.at > 4000) return null;
  // The sheet marks the sale shown as it opens the store page, before the page renders.
  if ((h.phase === "open" || h.phase === "shown") && h.path === path) return "sale";
  if ((h.phase === "closing" || h.phase === "return") && path === "/") return "return";
  return null;
}
