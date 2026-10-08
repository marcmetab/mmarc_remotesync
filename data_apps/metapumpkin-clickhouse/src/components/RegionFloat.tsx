import { type RefObject, useEffect, useLayoutEffect } from "react";
import { type Scope, scopeLabel } from "../types";
import { RegionPicker } from "./RegionPicker";
import { Icon } from "./ui";

/*
 * The region control that floats over the page from 900px up (Shell.tsx; under 900px the floating top's region pill
 * does this job). Once the top bar has scrolled away (`on`) the regions lift into a glass capsule at the top of the
 * page, over a fade; scrolling down (`compact`) it shrinks to the picked region, a live dot and a chevron, and
 * scrolling up, or a click on it (`onExpand`), opens it again. The capsule is the same control as the top bar's
 * (RegionPicker, glass look), with its country menu. The capsule's two widths are measured from what it holds
 * (--pd-cap-full, --pd-cap-mini), so it can glide between them. Styles: region.css (the capsule), tabbar.css (the layer).
 */

const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

export function RegionFloat({ scope, onScope, on, compact, onExpand, rootRef }: {
  scope: Scope; onScope: (scope: Scope) => void; on: boolean; compact: boolean; onExpand: () => void; rootRef: RefObject<HTMLDivElement>;
}) {
  const label = scopeLabel(scope);
  // Both widths, every render (a country or the viewer's own regions change them): set on the box, not through state.
  useBrowserLayoutEffect(() => {
    const box = rootRef.current?.querySelector<HTMLElement>(".pd-region-scroll");
    const group = box?.querySelector<HTMLElement>(".pd-segmented");
    const mini = box?.querySelector<HTMLElement>(".pd-regionfloat-mini > span");
    if (!box || !group) return;
    const edge = box.offsetWidth - box.clientWidth;
    box.style.setProperty("--pd-cap-full", `${group.offsetWidth + 10 + edge}px`);
    if (mini) box.style.setProperty("--pd-cap-mini", `${mini.offsetWidth + 36 + edge}px`);
  });
  const mini = <button type="button" className="pd-regionfloat-mini" tabIndex={compact ? undefined : -1} aria-hidden={compact ? undefined : true}
    aria-label={`Region: ${label}. Show all regions`} onClick={onExpand}>
    <span><i className="pd-regionfloat-dot" aria-hidden="true"/><span className="pd-regionfloat-label">{label}</span><Icon name="chevronDown" size={16} strokeWidth={2}/></span>
  </button>;
  return <div ref={rootRef} className={`pd-regionfloat${on ? " is-on" : ""}${compact ? " is-compact" : ""}`}>
    <div className="pd-regionfloat-fade" aria-hidden="true"/>
    {/* Remounted each time it lifts in: a menu left open as it went does not come back open. */}
    <RegionPicker key={on ? "on" : "off"} scope={scope} onScope={onScope} look="glass" extra={mini}/>
  </div>;
}
