import { type RefObject, useEffect, useRef, useState } from "react";
import "./salesheet.css";
import { type Box, endSale, saleHandoff, type SaleInfo, setSalePhase, useSaleHandoff } from "../motion";
import { useNav } from "../nav";
import { Icon, Tag } from "./ui";

/*
 * A Live sales row growing into its store's page, and back (motion.ts has the story). The page that grows is the
 * store page itself: the main column opens on it at once, clipped to the row's box (its top at the row's top), and the
 * clip opens to the whole window while the column rides up into place. Behind it, a still copy of the Business page
 * as it was (`snap`, cloned from the column at the click: it is gone from React by then) sinks back and dims. Over
 * the opening box, the row's own cells (redrawn from the sale) fade out, so the row turns into the page.
 *   open     the click: the copy is laid behind, the row's cells over it, and the store page opens (still unseen)
 *   shown    the store page is on screen (App.tsx): the clip opens, the copy sinks, then both are gone
 *   closing  the banner's "Live sales": a still copy of the store page is laid over everything and Business opens
 *            under it
 *   return   Live sales has scrolled the row into view and reports its box (`to`): the copy closes down into the row,
 *            the row's cells fade in over it, and it is gone; the row glows once (livesales.css). Without the row
 *            (it has left the list since) the copy just fades.
 * The copy is plain DOM (cloneNode) inside a box React keeps empty; if the host refuses it, the page still opens out of
 * the row, over the plain page. Nothing here runs on the server.
 */

/** The opening and the closing (ms; salesheet.css has the curves). */
const OPEN_MS = 740, CLOSE_MS = 560;
/** On the way back: how long the row has to report before the copy just fades. */
const FIND_MS = 1200;

/** A still copy of the main column as it is on screen, laid in `into` at the same place. False if the host refused. */
function snapshot(main: HTMLElement, into: HTMLElement): boolean {
  try {
    const at = main.getBoundingClientRect();
    const copy = main.cloneNode(true) as HTMLElement;
    copy.classList.add("pd-salesnap-page");
    copy.removeAttribute("style");
    copy.style.top = `${at.top}px`;
    // It sinks towards the middle of the window.
    copy.style.transformOrigin = `50% ${Math.round(window.innerHeight / 2 - at.top)}px`;
    copy.setAttribute("aria-hidden", "true");
    copy.setAttribute("inert", "");
    into.style.left = `${at.left}px`;
    into.style.width = `${at.width}px`;
    into.textContent = "";
    into.appendChild(copy);
    return true;
  } catch {
    return false;
  }
}

/** The clip and the offset that show the box `b` (window coordinates) of an element whose top is at `top`, `left`. */
function window_(el: HTMLElement, b: Box, top: number, left: number, ride: boolean) {
  const w = el.offsetWidth, h = el.offsetHeight;
  // Riding: the element's own top shows at the box's top (the page opens from its banner down); otherwise the box
  // cuts out whatever is there.
  const y0 = ride ? -top : b.top - top;
  return {
    clip: `inset(${Math.max(0, y0)}px ${Math.max(0, left + w - (b.left + b.width))}px ${Math.max(0, h - y0 - b.height)}px ${Math.max(0, b.left - left)}px)`,
    shift: ride ? b.top : 0,
  };
}

/** The row as Live sales draws it (the same classes), at the row's own width so it does not reflow. */
function RowCells({ sale, width }: { sale: SaleInfo; width: number }) {
  return <div className="pd-business-ls-wrap pd-salesheet-row" style={{ width }} aria-hidden="true">
    <div className="pd-business-ls-table"><div className="pd-business-ls-cells">
      <span className="pd-business-ls-time"><strong>{sale.ago}</strong><small>{sale.local}</small></span>
      <span className="pd-business-ls-store"><strong>{sale.storeName}</strong><small>{sale.place}</small></span>
      <span className="pd-business-ls-variety">
        <svg className="pd-business-ls-pumpkin" width={18} height={17} viewBox="0 0 32 30">
          <path d="M15 8c0-3 1.5-5.5 5-6.5l1 2.5c-2 .6-3 2-3 4z" style={{ fill: "var(--pd-leaf)" }}/>
          <ellipse cx="9.5" cy="18.5" rx="7.5" ry="9.5" style={{ fill: sale.color, opacity: .78 }}/>
          <ellipse cx="22.5" cy="18.5" rx="7.5" ry="9.5" style={{ fill: sale.color, opacity: .78 }}/>
          <ellipse cx="16" cy="18.5" rx="7" ry="10.5" style={{ fill: sale.color }}/>
        </svg>
        <span><span className="pd-business-ls-qty-inline">{sale.units} </span>{sale.variety}</span>
      </span>
      <span className="pd-right pd-business-ls-qty">{sale.units}</span>
      <span className="pd-business-ls-channel"><Tag tone={sale.channel === "Online" ? "neutral" : "stone"} size="sm">{sale.channel}</Tag></span>
      <span className="pd-business-ls-amount"><span>{sale.amount}</span><Icon name="chevronRight" size={16} strokeWidth={2}/></span>
    </div></div>
  </div>;
}

/** The row's cells over the opening (or closing) box: where they are, and whether they are fading out or in. */
type Cells = { sale: SaleInfo; box: Box; width: number; step: "on" | "out" | "in" };

export function SaleSheet({ mainRef }: { mainRef: RefObject<HTMLElement> }) {
  const handoff = useSaleHandoff();
  const { navigate } = useNav();
  const snapRef = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<"behind" | "sinking" | "over" | "fading" | null>(null);
  const [cells, setCells] = useState<Cells | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); };
  const frame = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clear = () => {
    const main = mainRef.current;
    if (main) {
      main.classList.remove("is-opening");
      for (const prop of ["clip-path", "translate", "transition"]) main.style.removeProperty(prop);
    }
    if (snapRef.current) snapRef.current.textContent = "";
    setSnap(null);
    setCells(null);
  };

  const phase = handoff?.phase, key = handoff ? `${handoff.sale.id}|${handoff.at}` : "";
  useEffect(() => {
    const h = saleHandoff(), main = mainRef.current, layer = snapRef.current;
    if (!h || !main || !layer) return;
    if (h.phase === "open") {
      // Behind: the Business page as it is. Over the row: its cells. Then the store page opens, unseen until shown.
      if (snapshot(main, layer)) setSnap("behind");
      setCells({ sale: h.sale, box: h.from, width: h.from.width, step: "on" });
      main.style.transition = "none";
      main.classList.add("is-opening");
      main.style.clipPath = "inset(0 0 100% 0)";
      navigate(h.path);
      // The store page never showed (a navigation that went elsewhere): put everything back.
      later(3000, () => { if (saleHandoff()?.phase === "open") { clear(); endSale(); } });
    } else if (h.phase === "shown") {
      // The store page is on screen, at its top: it opens out of the row's box to the whole window.
      const at = main.getBoundingClientRect();
      const from = window_(main, h.from, at.top, at.left, true);
      const full = window_(main, { top: 0, left: at.left, width: main.offsetWidth, height: window.innerHeight }, at.top, at.left, true);
      main.style.transition = "none";
      main.style.clipPath = from.clip;
      main.style.translate = `0 ${from.shift}px`;
      main.getBoundingClientRect(); // the start, laid out before the move
      main.style.removeProperty("transition");
      frame(() => {
        main.style.clipPath = full.clip;
        main.style.translate = "0 0";
        setSnap(s => s && "sinking");
        setCells(c => c && { ...c, box: { ...c.box, top: 0 }, step: "out" });
      });
      later(OPEN_MS + 40, clear);
    } else if (h.phase === "closing") {
      // Over everything: the store page as it is. Business opens under it.
      if (snapshot(main, layer)) setSnap("over");
      navigate("/");
      later(FIND_MS, () => {
        if (saleHandoff()?.phase !== "closing") return;
        setSnap("fading");
        later(360, () => { clear(); endSale(); });
      });
    } else if (h.phase === "return" && h.to) {
      // The copy closes down into the row, riding down with it; the row's cells fade in over it.
      const copy = layer.firstElementChild as HTMLElement | null;
      const to = h.to;
      if (copy) {
        const at = copy.getBoundingClientRect(), box = layer.getBoundingClientRect();
        const end = window_(copy, to, at.top, box.left, true);
        const start = window_(copy, { top: 0, left: box.left, width: copy.offsetWidth, height: window.innerHeight }, at.top, box.left, true);
        copy.style.clipPath = start.clip;
        copy.getBoundingClientRect();
        copy.classList.add("is-closing");
        frame(() => { copy.style.clipPath = end.clip; copy.style.translate = `0 ${end.shift}px`; });
      }
      setCells({ sale: h.sale, box: to, width: to.width, step: "in" });
      later(CLOSE_MS, () => { clear(); endSale(); });
    }
    // Keyed on the phase of this hand-off: each step starts once.
  }, [phase, key]);

  return <>
    <div ref={snapRef} className={`pd-salesnap${snap ? ` is-${snap}` : ""}`} aria-hidden="true"/>
    {cells && <div className={`pd-salesheet is-${cells.step}`} style={{ top: cells.box.top, left: cells.box.left, width: cells.box.width, height: cells.box.height }} aria-hidden="true">
      <RowCells sale={cells.sale} width={cells.width}/>
    </div>}
  </>;
}
