import { createContext, useContext } from "react";
import { COUNTRIES, type CountryCode, type RegionCode } from "./types";

/**
 * The countries this viewer's data covers. Metabase decides it, not the app: with row and column security a
 * Canada group member's queries come back with Canadian rows only, and the shell's Countries question (one row
 * per country they may see) says which those are. Pages then leave out what the viewer cannot see, rather than
 * drawing it empty: the World map draws only these countries, and the region control offers only their regions.
 * null while it loads, when it fails, and when every country is there: nothing is left out.
 */
export type Visible = ReadonlySet<CountryCode> | null;

export const VisibleContext = createContext<Visible>(null);
export const useVisible = (): Visible => useContext(VisibleContext);

/** The set from the Countries rows: null when none came back or all five did. */
export function visibleFrom(codes: readonly unknown[] | undefined): Visible {
  if (!codes) return null;
  const known = new Set(COUNTRIES.map(c => c.code));
  const seen = new Set(codes.filter((c): c is CountryCode => typeof c === "string" && known.has(c as CountryCode)));
  return seen.size === 0 || seen.size === COUNTRIES.length ? null : seen;
}

export const sees = (visible: Visible, cc: CountryCode) => !visible || visible.has(cc);
export const seesRegion = (visible: Visible, region: RegionCode) => !visible || COUNTRIES.some(c => c.region === region && visible.has(c.code));
/** One country only: the region control has nothing to choose between. */
export const singleCountry = (visible: Visible) => visible?.size === 1;
/** A stable string for memo keys and props: "CA", "GB,DE"; "" when nothing is left out. */
export const visibleKey = (visible: Visible) => visible ? COUNTRIES.filter(c => visible.has(c.code)).map(c => c.code).join(",") : "";
/** The same test on a key (layers take the key, so they re-render only when it changes). */
export const seesKey = (key: string, cc: CountryCode) => key === "" || key.split(",").includes(cc);
