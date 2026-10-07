import { createContext, useContext } from "react";

/*
 * The viewer's own clock. The top clock always reads in it, and every shipment time shows it next to the
 * clock of the place the van left from, so "16:44 EDT (22:44 CEST)" is never mistaken for a stale time.
 * The live app provides the browser's zone; the static preview renders in UTC.
 */

/** The browser's time zone (IANA, "Europe/Berlin"), or UTC when it cannot be read. */
export function detectViewerZone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; }
}

export const ViewerZoneContext = createContext("UTC");
/** The zone the viewer's clock is in. */
export const useViewerZone = () => useContext(ViewerZoneContext);
