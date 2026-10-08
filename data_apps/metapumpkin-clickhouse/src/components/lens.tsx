import { type CSSProperties, type ReactNode, type RefObject, useEffect, useLayoutEffect, useState } from "react";

/*
 * The raised option of a segmented control as a lens that slides (Segmented in ui.tsx, RegionPicker): a box drawn
 * under the options at the picked option's look (its first child), measured, so a new pick glides there. Until it is
 * measured (the static preview; a page mounted unseen) the picked option draws its own raised look (base.css). In
 * the glass capsules (FloatBar.tsx) the lens also squashes a little as it lands. Styles: base.css .pd-segmented-lens,
 * float.css (glass).
 */

/** A layout effect in the browser; on the server (the static preview) nothing runs, without React's warning. */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

type Box = { x: number; y: number; w: number; h: number } | null;
const same = (a: Box, b: Box) => a === b || (a != null && b != null && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h);

function measure(group: HTMLElement | null): Box {
  const on = group?.querySelector<HTMLElement>(":scope > [aria-current='true'], :scope > [aria-pressed='true']");
  const look = on?.firstElementChild as HTMLElement | null | undefined;
  if (!group || !look?.offsetWidth) return null;
  const g = group.getBoundingClientRect(), l = look.getBoundingClientRect();
  return { x: Math.round(l.left - g.left - group.clientLeft), y: Math.round(l.top - g.top - group.clientTop), w: Math.round(l.width), h: Math.round(l.height) };
}

/**
 * The lens for the group `ref` points at: the element to draw first inside it, and the class and style for the group.
 * `pick` is the picked option's index (the glass squash alternates between two copies of its keyframes so each new
 * pick plays it again).
 */
export function useSegmentLens(ref: RefObject<HTMLElement>, pick: number, glass = false): { lens: ReactNode; className: string; style?: CSSProperties } {
  const [box, setBox] = useState<Box>(null);
  // It glides once it has been placed; its first place it takes at once.
  const [settled, setSettled] = useState(false);
  useBrowserLayoutEffect(() => {
    const next = measure(ref.current);
    if (!same(next, box)) setBox(next);
  });
  useEffect(() => {
    if (!box || settled) return;
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, [box, settled]);
  // A label that changes width, a window that resizes, a page shown after mounting unseen: measured again.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(() => setBox(now => { const next = measure(el); return same(next, now) ? now : next; }));
    watch.observe(el);
    return () => watch.disconnect();
  }, [ref]);
  if (!box) return { lens: null, className: "" };
  return {
    lens: <span className={`pd-segmented-lens${glass ? (pick % 2 ? " is-jelly-b" : " is-jelly-a") : ""}`} aria-hidden="true"/>,
    className: ` has-lens${settled ? " is-settled" : ""}`,
    style: { "--pd-lens-x": `${box.x}px`, "--pd-lens-y": `${box.y}px`, "--pd-lens-w": `${box.w}px`, "--pd-lens-h": `${box.h}px` } as CSSProperties,
  };
}
