import { type CSSProperties, type RefObject, useEffect, useRef, useState } from "react";
import "./salesheet.css";
import { type Box, endSale, saleHandoff, type SaleHandoff, type SaleInfo, setSalePhase, useSaleHandoff } from "../motion";
import { useNav } from "../nav";
import { Icon, Tag } from "./ui";

/*
 * The sheet a Live sales row becomes (motion.ts has the whole story). It is drawn over the app, fixed:
 *   open     it starts as the row (the row's own cells, redrawn from the sale) and grows to fill the content column
 *            while the page sinks behind it; once it covers the view the store page opens under it, and it fades.
 *   closing  the banner's "Live sales": it fades in over the store page, then Business opens under it.
 *   return   Live sales has found the row and scrolled it into view (its box is `to`): the sheet shrinks into it,
 *            the row's cells fade back in, and it is gone; the row glows once (livesales.css).
 * Without the row (it has left the list since) the sheet just fades. Nothing here runs on the server.
 */

/** When the store page opens under the growing sheet, when the sheet starts to fade, when it is gone (ms). */
const SWAP_MS = 470, FADE_MS = 620, DONE_MS = 980;
/** On the way back: Business opens this long after the sheet covers the store page; the row has this long to report. */
const COVER_MS = 190, FIND_MS = 1100, SHRINK_MS = 560;

const boxStyle = (b: Box): CSSProperties => ({ top: b.top, left: b.left, width: b.width, height: b.height });

/** The content column's box in the window, a little inset: what the sheet grows to (and shrinks back from). */
function pageBox(content: HTMLElement | null): Box {
  const vw = document.documentElement.clientWidth || window.innerWidth, vh = window.innerHeight;
  if (!content) return { top: 12, left: 12, width: vw - 24, height: vh - 24 };
  const r = content.getBoundingClientRect(), css = getComputedStyle(content);
  const left = Math.max(8, r.left + (parseFloat(css.paddingLeft) || 0) - 10);
  const right = Math.min(vw - 8, r.right - (parseFloat(css.paddingRight) || 0) + 10);
  return { top: 12, left, width: Math.max(0, right - left), height: vh - 24 };
}

/** The row as Live sales draws it (the same classes), at the row's own width so it does not reflow as the sheet grows. */
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

type Shown = { h: SaleHandoff; box: Box; step: "row" | "grown" | "fading" | "covering" | "covered" | "shrunk" };

export function SaleSheet({ contentRef }: { contentRef: RefObject<HTMLElement> }) {
  const handoff = useSaleHandoff();
  const { navigate } = useNav();
  const [shown, setShown] = useState<Shown | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const phase = handoff?.phase, key = handoff ? `${handoff.sale.id}|${handoff.at}` : "";
  useEffect(() => {
    const h = saleHandoff();
    if (!h) return;
    if (h.phase === "open") {
      // The row, then the page: grown on the next frame, so the move is a transition from the row's box.
      setShown({ h, box: h.from, step: "row" });
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(s => s && { ...s, box: pageBox(contentRef.current), step: "grown" })));
      later(SWAP_MS, () => { navigate(h.path); setSalePhase("shown"); });
      later(FADE_MS, () => setShown(s => s && { ...s, step: "fading" }));
      later(DONE_MS, () => setShown(null));
    } else if (h.phase === "closing") {
      setShown({ h, box: pageBox(contentRef.current), step: "covering" });
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(s => s && { ...s, step: "covered" })));
      later(COVER_MS, () => navigate("/"));
      // The row never reported (it has left the list): the sheet fades away over Business.
      later(COVER_MS + FIND_MS, () => {
        if (saleHandoff()?.phase !== "closing") return;
        setShown(s => s && { ...s, step: "fading" });
        later(360, () => { setShown(null); endSale(); });
      });
    } else if (h.phase === "return" && h.to) {
      const to = h.to;
      setShown(s => s ? { ...s, h, box: to, step: "shrunk" } : null);
      later(SHRINK_MS, () => { setShown(null); endSale(); });
    }
    // Keyed on the phase of this hand-off: each step starts once.
  }, [phase, key]);

  if (!shown) return null;
  const { h, box, step } = shown;
  const sinking = step === "row" || step === "grown";
  return <>
    <div className={`pd-salesheet-scrim${sinking || step === "covered" ? " is-on" : ""}`} aria-hidden="true"/>
    <div className={`pd-salesheet is-${step}`} style={boxStyle(box)} aria-hidden="true">
      <RowCells sale={h.sale} width={h.from.width}/>
    </div>
  </>;
}
