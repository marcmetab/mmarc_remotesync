import { type ReactNode, type RefObject, useEffect, useLayoutEffect } from "react";
import "./float.css";
import { Icon } from "./ui";

/*
 * The glass capsule that floats over the page from 900px up (Shell.tsx; under 900px the floating top does this job).
 * Once the top bar has scrolled away (`on`) its control lifts into a glass capsule at the top of the page, over a
 * fade: the region control on most pages, the time switch on the City, Store and van pages. Scrolling down
 * (`compact`) it shrinks to the pick (`label`), a live dot and a chevron; scrolling up, or a click on it (`onExpand`),
 * opens it again. `render` draws the capsule's box (.pd-glassbar) with the control in it, and the compact pill it is
 * handed (`mini`) inside the box after the control. The box's two widths are measured from what it holds
 * (--pd-cap-full, --pd-cap-mini), so it can glide between them. Styles: float.css.
 */

const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

export function FloatBar({ on, compact, onExpand, rootRef, label, what, render }: {
  on: boolean; compact: boolean; onExpand: () => void; rootRef: RefObject<HTMLDivElement>;
  /** The pick, as the compact pill shows it ("Canada", "7 days"), and what it is ("Region", "Time"). */
  label: string; what: string;
  render: (mini: ReactNode) => ReactNode;
}) {
  // Both widths, every render (a new pick or the viewer's own regions change them): set on the box, not through state.
  useBrowserLayoutEffect(() => {
    const box = rootRef.current?.querySelector<HTMLElement>(".pd-glassbar");
    const group = box?.querySelector<HTMLElement>(".pd-segmented");
    const mini = box?.querySelector<HTMLElement>(".pd-float-mini > span");
    if (!box || !group) return;
    const edge = box.offsetWidth - box.clientWidth;
    box.style.setProperty("--pd-cap-full", `${group.offsetWidth + 10 + edge}px`);
    if (mini) box.style.setProperty("--pd-cap-mini", `${mini.offsetWidth + 36 + edge}px`);
  });
  const mini = <button type="button" className="pd-float-mini" tabIndex={compact ? undefined : -1} aria-hidden={compact ? undefined : true}
    aria-label={`${what}: ${label}. Show all`} onClick={onExpand}>
    <span><i className="pd-float-dot" aria-hidden="true"/><span>{label}</span><Icon name="chevronDown" size={16} strokeWidth={2}/></span>
  </button>;
  return <div ref={rootRef} className={`pd-float${on ? " is-on" : ""}${compact ? " is-compact" : ""}`}>
    <div className="pd-float-fade" aria-hidden="true"/>
    {render(mini)}
  </div>;
}
