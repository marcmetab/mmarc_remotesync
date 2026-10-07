/*
 * The pumpkin as a small mark: before "Pumpkins sold", on the live line while sales come in, and on the
 * season vine (where the plan is today, and a faint one at the end of the season). StockPumpkin is the same
 * shape as one store's stock (the Stores cards, the City page's "Runs out first"). Colours come from the theme
 * tokens (pumpkin.css), so both follow dark mode. No data.
 */
import { useId } from "react";
import "./pumpkin.css";
import type { StockStatus } from "../types";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export type PumpkinMarkProps = {
  /** Width in px; the height follows the shape (30/32 of it). */
  size?: number;
  /** A dashed outline in the faint ink, filled with the page: something still to come (the end of the season). */
  ghost?: boolean;
  className?: string;
  /** What it stands for, for screen readers. Without it the mark is decorative (aria-hidden). */
  title?: string;
};

/** A pumpkin: leaf-green stem, two deep sides, a lighter middle. */
export function PumpkinMark({ size = 16, ghost = false, className, title }: PumpkinMarkProps) {
  return <svg className={cx("pd-pumpkin", ghost && "is-ghost", className)} width={size} height={size * 30 / 32} viewBox="0 0 32 30"
    role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
    {title && <title>{title}</title>}
    <path className="pd-pumpkin-stem" d="M15 8c0-3 1.5-5.5 5-6.5l1 2.5c-2 .6-3 2-3 4z"/>
    <ellipse className="pd-pumpkin-side" cx="9.5" cy="18.5" rx="7.5" ry="9.5"/>
    <ellipse className="pd-pumpkin-side" cx="22.5" cy="18.5" rx="7.5" ry="9.5"/>
    <ellipse className="pd-pumpkin-mid" cx="16" cy="18.5" rx="7" ry="10.5"/>
  </svg>;
}

/**
 * One store as a pumpkin: whole when stocked, half full when low (a variety runs out before the next van),
 * a dashed outline when a variety is out.
 */
export function StockPumpkin({ status, size = 22, title }: { status: StockStatus; size?: number; title?: string }) {
  const clip = `pd-pk-${useId().replace(/:/g, "")}`;
  const shape = <>
    <path className="pd-pk-stem" d="M15 8c0-3 1.5-5.5 5-6.5l1 2.5c-2 .6-3 2-3 4z"/>
    <ellipse className="pd-pk-side" cx="9.5" cy="18.5" rx="7.5" ry="9.5"/>
    <ellipse className="pd-pk-side" cx="22.5" cy="18.5" rx="7.5" ry="9.5"/>
    <ellipse className="pd-pk-mid" cx="16" cy="18.5" rx="7" ry="10.5"/>
  </>;
  return <svg className={`pd-pk is-${status}`} width={size} height={size * 30 / 32} viewBox="0 0 32 30"
    role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
    {title && <title>{title}</title>}
    {status === "low"
      ? <><defs><clipPath id={clip}><rect x="0" y="17" width="32" height="13"/></clipPath></defs><g className="pd-pk-ghost">{shape}</g><g clipPath={`url(#${clip})`}>{shape}</g></>
      : shape}
  </svg>;
}
