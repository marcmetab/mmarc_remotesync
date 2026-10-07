import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import "./sheet.css";
import { Icon } from "./ui";

/** Everything in the sheet that Tab can reach, in order. */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type SheetProps = {
  /** The dialog's name, and its heading unless `head` replaces it. */
  title: string;
  /** Replaces the plain heading (the Me sheet's profile row). The close button stays at its end. */
  head?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

/**
 * A glass bottom sheet (the phone shell's Me and Region sheets): a grabber, a heading with a round close
 * button, then the content. It is modal: the scrim takes every click outside it and closes it, Escape closes
 * it, and Tab and Shift+Tab wrap around inside it. Focus moves into it as it opens and back to whatever had
 * it (the button that opened it) as it closes. Styles: sheet.css.
 */
export function Sheet({ title, head, onClose, children }: SheetProps) {
  const sheetRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus({ preventScroll: true });
    return () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); };
  }, []);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !e.defaultPrevented) { e.stopPropagation(); onClose(); }
  };
  const wrapTo = (end: "first" | "last") => {
    const list = [...(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(el => el.getClientRects().length > 0);
    ((end === "first" ? list[0] : list[list.length - 1]) ?? sheetRef.current)?.focus();
  };
  return <div className="pd-sheet-layer">
    <button type="button" className="pd-sheet-scrim" tabIndex={-1} aria-hidden="true" onClick={onClose}/>
    <span className="pd-sr" tabIndex={0} onFocus={() => wrapTo("last")}/>
    <section ref={sheetRef} className="pd-sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onKeyDown={onKeyDown}>
      <span className="pd-sheet-grabber" aria-hidden="true"/>
      <div className="pd-sheet-head">
        {head ?? <h2 className="pd-sheet-title">{title}</h2>}
        <button type="button" className="pd-round" aria-label={`Close ${title}`} onClick={onClose}><Icon name="close" size={18} strokeWidth={2.2}/></button>
      </div>
      {children}
    </section>
    <span className="pd-sr" tabIndex={0} onFocus={() => wrapTo("first")}/>
  </div>;
}
