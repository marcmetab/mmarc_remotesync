/*
 * A small dropdown: a label, then a menu button showing the current option ("Revenue: Today ▾"). The button
 * opens a menu of the options under it, the current one checked. It follows the region control's menu
 * (RegionPicker.tsx): picking closes it, so do Escape and a click anywhere else (a transparent backdrop), and
 * focus goes back to the button; Tab closes it and moves on from the button. Up and Down move through the
 * menu (and open it from the button, on the current option or the last), Home and End jump to its ends.
 * Nothing listens on the document or the window.
 *
 * Placement: the menu hangs under the button in CSS, lined up with its left edge, so it needs no measuring
 * to show. Where that would run past the window's right edge, it moves left (measured before it paints, and
 * again when the app resizes), keeping 16px inside the window. Styles: select.css.
 */
import { type CSSProperties, type KeyboardEvent, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import "./select.css";
import { Icon, type Option } from "./ui";

/** A layout effect in the browser; on the server (the static preview) nothing runs, without React's warning. */
const useBrowserLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

/** The margin the menu keeps from the window's edges (px). */
const EDGE = 16;

/** How far (px) the menu moves left of the button's left edge to stay inside the window; 0 when it fits. */
function shiftOf(anchor: HTMLElement | null, menu: HTMLElement | null): number {
  if (!anchor || !menu) return 0;
  const viewport = document.documentElement.clientWidth || window.innerWidth;
  const left = anchor.getBoundingClientRect().left;
  return Math.max(0, Math.round(left - Math.max(EDGE, Math.min(left, viewport - EDGE - menu.offsetWidth))));
}

export type SelectMenuProps<T extends string> = {
  /** The words in front of the button, printed with a colon ("Revenue" → "Revenue:"). Also the menu's name. */
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** "Label: Current ▾": a menu button that picks one of a few options from a small menu under it. */
export function SelectMenu<T extends string>({ label, options, value, onChange, className }: SelectMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Which item takes focus when the menu opens: the current one, or the last (Up on the button).
  const focusAt = useRef<"checked" | "last">("checked");
  const id = useId();
  const current = options.find(o => o.value === value) ?? options[0];

  const items = () => [...(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitemradio']") ?? [])];
  const focusItem = (at: "checked" | "last") => {
    const list = items();
    const checked = list.find(el => el.getAttribute("aria-checked") === "true");
    (at === "last" ? list[list.length - 1] : checked ?? list[0])?.focus({ preventScroll: true });
  };
  const openMenu = (at: "checked" | "last") => {
    focusAt.current = at;
    if (open) focusItem(at);
    else setOpen(true);
  };
  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    setShift(0);
    if (refocus) buttonRef.current?.focus();
  }, []);
  const pick = (next: T) => {
    if (next !== value) onChange(next);
    close(true);
  };

  // Focus moves into the menu as it opens (a modal menu: the backdrop takes every click outside it).
  useEffect(() => { if (open) focusItem(focusAt.current); }, [open]);
  // Kept inside the window before it paints.
  useBrowserLayoutEffect(() => {
    if (!open) return;
    const next = shiftOf(anchorRef.current, menuRef.current);
    if (next !== shift) setShift(next);
  });
  // The button moves when the app resizes (the row wraps): measure again.
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!open || !anchor || typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(() => setShift(shiftOf(anchorRef.current, menuRef.current)));
    for (const el of [anchor.closest(".pd-app"), menuRef.current]) if (el) watch.observe(el);
    return () => watch.disconnect();
  }, [open]);

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); openMenu(e.key === "ArrowUp" ? "last" : "checked"); }
    else if (e.key === "Escape" && open) { e.stopPropagation(); close(true); }
  };
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    const go = (i: number) => list[(i + list.length) % list.length]?.focus();
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at < 0 ? list.length - 1 : at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") close(true);
    // Tab leaves the menu: focus back on the button, then the browser's own Tab (not prevented) moves on from it.
    else if (e.key === "Tab") { close(true); return; }
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const menuId = `${id}-menu`, labelId = `${id}-label`, valueId = `${id}-value`;
  const style = shift ? { "--pd-select-shift": `${shift}px` } as CSSProperties : undefined;
  return <div className={`pd-select${className ? ` ${className}` : ""}`}>
    {/* A label for the button: clicking the words opens the menu too. */}
    <label id={labelId} htmlFor={`${id}-button`} className="pd-select-label">{label}:</label>
    <div ref={anchorRef} className="pd-select-anchor">
      <button type="button" ref={buttonRef} id={`${id}-button`} className="pd-select-button" aria-haspopup="menu" aria-expanded={open}
        aria-controls={open ? menuId : undefined} aria-labelledby={`${labelId} ${valueId}`}
        onClick={() => open ? close(true) : openMenu("checked")} onKeyDown={onButtonKey}>
        <span><span id={valueId}>{current?.label}</span><Icon name="chevronDown" size={16} strokeWidth={2}/></span>
      </button>
      {open && <>
        <button type="button" className="pd-select-backdrop" tabIndex={-1} aria-hidden="true" onClick={() => close(true)}/>
        <div ref={menuRef} id={menuId} role="menu" aria-label={label} className="pd-select-menu" style={style} onKeyDown={onMenuKey}>
          {options.map(o => {
            const checked = o.value === value;
            return <button type="button" key={o.value} role="menuitemradio" aria-checked={checked} tabIndex={-1} className="pd-select-item" onClick={() => pick(o.value)}>
              <span>{o.label}</span>
              {checked && <Icon name="check" size={16} strokeWidth={2.2}/>}
            </button>;
          })}
        </div>
      </>}
    </div>
  </div>;
}
