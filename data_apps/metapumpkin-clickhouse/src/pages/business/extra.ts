import type { DefineExtra } from "../../components/Define";
import { signedPct } from "../../format";
import type { BusinessPeriod } from "./model";

/*
 * The glance's boxes of numbers in the definition cards (Define's `extra`), shared by the hero (Hero.tsx)
 * and the tiles (Tiles.tsx), so their headings and signed changes read the same. Data: whatever the caller
 * passes, from vm.totals[period].
 */

/** One label/value row of a card's box. */
export type ExtraRow = NonNullable<DefineExtra["rows"]>[number];

/** The heading of a figure's or a tile's numbers, by period. */
export const PERIOD_TITLE: Record<BusinessPeriod, string> = { today: "Today so far", "7d": "Last 7 days", season: "Season to date" };

/** A signed change: "+2.5%" olive when up, "−12.3%" terracotta when down; left out without a base. */
export function changeRow(label: string, value: number | null): ExtraRow[] {
  if (value == null) return [];
  // The tone follows the printed figure: a change that rounds to ±0.0% is not coloured.
  const shown = Number((value * 100).toFixed(1));
  return [{ label, value: signedPct(value, 1), tone: shown > 0 ? "good" : shown < 0 ? "bad" : undefined }];
}
