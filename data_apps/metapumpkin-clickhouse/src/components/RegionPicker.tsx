/*
 * The region control (Shell.tsx): the Golden Hour segmented control, All regions · North America · Europe ·
 * Asia-Pacific, filtering the whole app. The selected region (not All) carries a chevron and, once a country is
 * picked, that country in place of the region's name ("Canada"; on phones "Canada" or "UK"). The raised option
 * slides from one region to the next (a lens measured under the picked option; until it is measured, as in the
 * static preview, the option draws its own raised look). A click on another region selects it, with no country. A
 * click on the selected one opens a small menu under it: "All of North America", then the region's countries, the
 * current choice checked. Picking closes it; so do Escape and a click anywhere else (a transparent backdrop), and
 * focus goes back to the pill; Tab closes it and moves on from the pill. A change of region by any other way closes
 * it too. Up and Down move through the menu, Home and End jump to its ends. On a phone (with `onSheet`) the same
 * click opens the shell's Region sheet instead (RegionSheet.tsx), regions and countries together. The pill is a menu
 * button marked aria-current, not a pressed toggle as well (a screen reader would announce only one of the two).
 *
 * Two looks: `bar`, in the top bar; `glass`, the capsule that floats over the page once the top bar has scrolled
 * away (FloatBar.tsx): a glass lens slides (and squashes a little as it lands), the picked region reads in
 * pumpkin, and the country menu is glass too, growing out of the highlight with its items following one by one.
 * `extra` is drawn inside the control's box after the options (the capsule's compact pill).
 *
 * Placement: the segmented control sits in a box that scrolls sideways on a very narrow screen (the capsule's box
 * clips as it shrinks), either of which would clip a menu inside it. So the menu is the box's sibling, placed under
 * the pill from their measured rects (the bar's lined up with the pill's left edge, the capsule's centred under it;
 * kept 16px inside the window) and placed again when the app resizes or the box scrolls. Styles: region.css.
 */
import { type CSSProperties, Fragment, type KeyboardEvent, type ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import "./region.css";
import { COUNTRIES, type CountryCode, REGIONS, type RegionCode, type RegionFilter, type Scope, regionName } from "../types";
import { useSegmentLens } from "./lens";
import { Icon } from "./ui";
import { sees, seesRegion, useVisible } from "../visible";

/** A layout effect in the browser; on the server (the static preview) nothing runs, without React's warning. */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

/** The four options. On phones they print short (`short`) so all four fit; `label` stays the accessible name. */
export const REGION_OPTIONS: { value: RegionFilter; label: string; short?: string }[] = [
  { value: "all", label: "All regions", short: "All" },
  ...REGIONS.map(r => ({ value: r.code, label: r.name, short: r.code === "NA" ? "N. America" : r.code === "APAC" ? "APAC" : undefined })),
];

/** Phone labels for the longer country names, as the regions have; the full name stays in the accessible name. */
export const COUNTRY_SHORT: Partial<Record<CountryCode, string>> = { US: "USA", GB: "UK" };

/** The menu's narrowest width, its gap under the pill (the capsule's), and the window margin it keeps (px). */
const MENU_MIN = 220, GAP = 6, GLASS_GAP = 10, EDGE = 16;
/** The menu's place in the picker, the pill's width (the bar's menu is at least as wide), and where it grows from. */
type Place = { x: number; y: number; w: number; ox: number } | null;
const samePlace = (a: Place, b: Place) => a === b || (a != null && b != null && a.x === b.x && a.y === b.y && a.w === b.w && a.ox === b.ox);

/** Under the pill's raised look (not its 44px tap target): the bar's lined up with its left edge, the capsule's centred. */
function placeMenu(root: HTMLElement | null, pill: HTMLElement | null, menu: HTMLElement | null, glass: boolean): Place {
  if (!root || !pill?.isConnected) return null;
  const look = pill.firstElementChild ?? pill;
  const p = look.getBoundingClientRect(), r = root.getBoundingClientRect();
  const viewport = document.documentElement.clientWidth || window.innerWidth;
  const w = Math.round(p.width);
  const width = Math.min(Math.max(menu?.offsetWidth ?? 0, glass ? 0 : w, MENU_MIN), viewport - 2 * EDGE);
  const want = glass ? p.left + p.width / 2 - width / 2 : p.left;
  const left = Math.max(EDGE, Math.min(viewport - EDGE - width, want));
  // The capsule's menu drops below the capsule (the pill's box is inside it), and grows from the pill's middle.
  const below = glass ? (pill.closest(".pd-region-scroll")?.getBoundingClientRect().bottom ?? p.bottom) + GLASS_GAP : p.bottom + GAP;
  return { x: Math.round(left - r.left), y: Math.round(below - r.top), w, ox: Math.round(p.left + p.width / 2 - left) };
}

export type RegionPickerProps = {
  scope: Scope;
  /** A region (country cleared), or a country inside the selected region (null: all of it). */
  onScope: (scope: Scope) => void;
  /** Phones (under 600px): opens the shell's Region sheet in place of the menu. */
  onSheet?: () => void;
  look?: "bar" | "glass";
  /** Drawn inside the control's box after the options (the floating capsule's compact pill). */
  extra?: ReactNode;
};

/** Under 600px the selected region opens the Region sheet rather than the menu under it. */
const PHONE = "(max-width: 599.98px)";
const onPhone = () => { try { return window.matchMedia(PHONE).matches; } catch { return false; } };

/**
 * The region segmented control with a country menu on its selected region. Clicking another region selects
 * it; clicking the selected one (or Up / Down on it) opens the menu of its countries.
 */
export function RegionPicker({ scope, onScope, onSheet, look = "bar", extra }: RegionPickerProps) {
  const glass = look === "glass";
  // The region the menu is open on, so a change of region (another region's button, "All regions", a page)
  // closes it rather than carrying it over to the next region.
  const [openFor, setOpenFor] = useState<RegionCode | null>(null);
  const [place, setPlace] = useState<Place>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Which item takes focus when the menu opens: the current choice, or the last one (Up on the pill).
  const focusAt = useRef<"checked" | "last">("checked");
  const menuId = `${useId()}-menu`;

  // Only the regions and countries this viewer may see (src/visible.ts): the rest would show nothing.
  const visible = useVisible();
  const options = REGION_OPTIONS.filter(o => o.value === "all" || seesRegion(visible, o.value));
  const region: RegionCode | null = scope.region === "all" ? null : scope.region;
  const isOpen = region != null && openFor === region;
  const countries = region ? COUNTRIES.filter(c => c.region === region && sees(visible, c.code)) : [];
  // Shown only when it is one of the region's own (the scope keeps it inside the region; this is a guard).
  const country = countries.find(c => c.code === scope.country) ?? null;
  const items: { country: CountryCode | null; label: string }[] = region
    ? [{ country: null, label: `All of ${regionName(region)}` }, ...countries.map(c => ({ country: c.code, label: c.name }))]
    : [];

  const menuItems = () => [...(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitemradio']") ?? [])];
  const focusItem = (at: "checked" | "last") => {
    const list = menuItems();
    const checked = list.find(el => el.getAttribute("aria-checked") === "true");
    (at === "last" ? list[list.length - 1] : checked ?? list[0])?.focus({ preventScroll: true });
  };
  const openMenu = (at: "checked" | "last") => {
    if (onSheet && onPhone()) { onSheet(); return; }
    focusAt.current = at;
    if (isOpen) focusItem(at);
    else setOpenFor(region);
  };
  const close = useCallback((refocus: boolean) => {
    setOpenFor(null);
    setPlace(null);
    if (refocus) pillRef.current?.focus();
  }, []);
  const pick = (next: CountryCode | null) => {
    if (region) onScope({ region, country: next });
    close(true);
  };

  // Closed for good when the region changes, so going back to that region does not reopen it.
  useEffect(() => { setOpenFor(null); setPlace(null); }, [region]);
  // Focus moves into the menu as it opens (a modal menu: the backdrop takes every click outside it).
  useEffect(() => { if (isOpen) focusItem(focusAt.current); }, [isOpen]);
  // The raised option slides from one region to the next (lens.tsx).
  const { lens, className: lensClass, style: lensStyle } = useSegmentLens(groupRef, options.findIndex(o => o.value === scope.region), glass);
  // Placed before it paints, and again whenever it renders (a picked country changes the pill's width).
  useBrowserLayoutEffect(() => {
    if (!isOpen) return;
    const at = placeMenu(rootRef.current, pillRef.current, menuRef.current, glass);
    if (!samePlace(at, place)) setPlace(at);
  });
  // The pill moves when the window resizes or the box scrolls sideways: follow it.
  useEffect(() => {
    const root = rootRef.current, scroller = scrollRef.current;
    if (!isOpen || !root) return;
    const update = () => setPlace(now => {
      const next = placeMenu(root, pillRef.current, menuRef.current, glass);
      return samePlace(next, now) ? now : next;
    });
    const watch = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    for (const el of [root.closest(".pd-app"), pillRef.current, menuRef.current]) if (el) watch?.observe(el);
    scroller?.addEventListener("scroll", update, { passive: true });
    return () => {
      watch?.disconnect();
      scroller?.removeEventListener("scroll", update);
    };
  }, [isOpen, glass]);

  const onPillKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); openMenu(e.key === "ArrowUp" ? "last" : "checked"); }
    else if (e.key === "Escape" && isOpen) { e.stopPropagation(); close(true); }
  };
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = menuItems();
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    const go = (i: number) => list[(i + list.length) % list.length]?.focus();
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at < 0 ? list.length - 1 : at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") close(true);
    // Tab leaves the menu: focus back on the pill, then the browser's own Tab (not prevented) moves on from it,
    // forward or back.
    else if (e.key === "Tab") { close(true); return; }
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const style = place ? { "--pd-region-x": `${place.x}px`, "--pd-region-y": `${place.y}px`, "--pd-region-w": `${place.w}px`, "--pd-region-ox": `${place.ox}px` } as CSSProperties : undefined;
  return <div ref={rootRef} className={`pd-region${glass ? " is-glass" : ""}`}>
    <div ref={scrollRef} className={`pd-region-scroll${glass ? " pd-glassbar pd-glass" : ""}`}>
      <div ref={groupRef} role="group" aria-label="Region" className={`pd-segmented${lensClass}`} style={lensStyle}>
        {lens}
        {options.map(o => {
          const on = o.value === scope.region;
          if (!on || o.value === "all") return <button type="button" key={o.value} aria-pressed={on} aria-label={o.short ? o.label : undefined}
            onClick={e => {
              // Activated past the backdrop (a screen reader does not hit-test) with focus in the menu: keep focus
              // on this button as the menu goes, not on the page.
              if (menuRef.current?.contains(document.activeElement)) e.currentTarget.focus();
              onScope({ region: o.value, country: null });
            }}>
            <span>{o.short ? <><span className="pd-segmented-full">{o.label}</span><span className="pd-segmented-short">{o.short}</span></> : o.label}</span>
          </button>;
          // The selected region: the raised option (region.css), and the button of its country menu.
          return <button type="button" key={o.value} ref={pillRef} className="pd-region-pill" aria-current="true" aria-haspopup="menu"
            aria-expanded={isOpen} aria-controls={isOpen ? menuId : undefined} aria-label={country ? `${o.label}, ${country.name}` : o.label}
            onClick={() => isOpen ? close(true) : openMenu("checked")} onKeyDown={onPillKey}>
            <span>
              <span className="pd-region-label">
                {/* A picked country takes the region's place: the region is plain from it. */}
                <span className="pd-segmented-full">{country ? country.name : o.label}</span>
                <span className="pd-segmented-short">{country ? COUNTRY_SHORT[country.code] ?? country.name : o.short ?? o.label}</span>
              </span>
              <Icon name="chevronDown" size={16} strokeWidth={2}/>
            </span>
          </button>;
        })}
      </div>
      {extra}
    </div>
    {isOpen && region && <>
      <button type="button" className="pd-region-backdrop" tabIndex={-1} aria-hidden="true" onClick={() => close(true)}/>
      <div ref={menuRef} id={menuId} role="menu" aria-label={regionName(region)} className={`pd-region-menu${glass ? " pd-glass" : ""}${place ? " is-placed" : ""}`} style={style} onKeyDown={onMenuKey}>
        {items.map((item, i) => {
          const checked = item.country === (country?.code ?? null);
          return <Fragment key={item.country ?? "all"}>
            {/* A hairline between the whole region and its countries. */}
            {i === 1 && <span role="separator" className="pd-region-sep"/>}
            <button type="button" role="menuitemradio" aria-checked={checked} tabIndex={-1} className="pd-region-item" style={{ "--pd-i": i } as CSSProperties} onClick={() => pick(item.country)}>
              <span>{item.label}</span>
              {checked && <Icon name="check" size={16} strokeWidth={2.2}/>}
            </button>
          </Fragment>;
        })}
      </div>
    </>}
  </div>;
}
