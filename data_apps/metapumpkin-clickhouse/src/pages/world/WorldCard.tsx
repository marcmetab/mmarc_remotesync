import { type CSSProperties, type MouseEvent, useEffect, useLayoutEffect, useRef } from "react";
import { Icon } from "../../components/ui";
import { Link } from "../../nav";
import type { Scope } from "../../types";
import { type CardModel, cx } from "./model";

/**
 * The card beside a sprite: what it is, a status pill, a progress bar where there is one, a few facts and a link to
 * its page. Hovering or focusing a sprite shows it (the pointer can move onto it and keep it); clicking pins it, with
 * a close button, until the ground is clicked, Escape is pressed or the region changes. Escape also dismisses a card
 * that is only shown. A link to a place outside the shell's scope switches the scope to it on the way (a plain click;
 * one for a new tab leaves this page alone). Content: model.ts cardFor.
 */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

export function WorldCard({ card, pinned, style, onClose, onScope, onHeight }: { card: CardModel; pinned: boolean; style: CSSProperties; onClose: () => void; onScope: (scope: Scope) => void; onHeight?: (height: number) => void }) {
  const { scope } = card.link;
  const ref = useRef<HTMLDivElement>(null);
  // Its height, for cardPlace to keep it inside the map (React skips the update while it is unchanged).
  useBrowserLayoutEffect(() => { if (ref.current) onHeight?.(ref.current.offsetHeight); });
  const follow = scope ? (e: MouseEvent) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) onScope(scope); } : undefined;
  return <div ref={ref} role="dialog" aria-label={card.title} data-ui className={cx("pd-world-card", card.moving && "is-following", pinned && "is-pinned")} style={style}>
    <div className="pd-world-card-head">
      <div>
        <p className="pd-world-card-kind">{card.kind}</p>
        <p className="pd-world-card-title">{card.title}</p>
        <p className="pd-world-card-sub">{card.sub}</p>
      </div>
      {pinned && <button type="button" className="pd-world-card-close" aria-label="Close" onClick={onClose}><Icon name="close" size={16} strokeWidth={1.8}/></button>}
    </div>
    <span className="pd-world-card-pill"><i style={{ background: card.pillColor }}/>{card.pill}</span>
    {card.bar && <div className="pd-world-card-bar">
      <div><span>{card.bar.label}</span><span>{card.bar.value}</span></div>
      <span className="pd-world-card-track"><span style={{ width: `${Math.round(Math.max(0.02, Math.min(1, card.bar.share)) * 100)}%`, background: card.bar.color }}/></span>
    </div>}
    {card.rows.length > 0 && <dl className="pd-world-card-rows">
      {card.rows.map((r, i) => <div key={i}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
    </dl>}
    <div className="pd-world-card-foot">
      <Link to={card.link.to} onClick={follow}>{card.link.label} ›</Link>
      {!pinned && <span>Click to pin</span>}
    </div>
  </div>;
}
