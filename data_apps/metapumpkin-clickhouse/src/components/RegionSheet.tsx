import { type KeyboardEvent, useRef } from "react";
import { timeTz } from "../format";
import { type Clock, COUNTRIES, type CountryCode, regionName, type Scope } from "../types";
import { REGION_OPTIONS } from "./RegionPicker";
import { Sheet } from "./Sheet";
import { Icon, Segmented } from "./ui";
import { sees, seesRegion, useVisible } from "../visible";

/**
 * The region and country, in a bottom sheet (phones: a tap on the selected region in the top bar, or on the
 * floating region pill once the top bar has scrolled away). The four regions on the segmented control, then,
 * for a region, "All of <region>" and its countries with their local time. Picking a country (or All regions)
 * closes the sheet; picking a region keeps it open on that region's countries. The list is a radio group:
 * Up and Down move through it, as they do in the desktop menu. Styles: sheet.css.
 */
export function RegionSheet({ scope, onScope, clock, onClose }: { scope: Scope; onScope: (scope: Scope) => void; clock?: Clock; onClose: () => void }) {
  const listRef = useRef<HTMLDivElement>(null);
  const visible = useVisible();
  const region = scope.region === "all" ? null : scope.region;
  const countries = region ? COUNTRIES.filter(c => c.region === region && sees(visible, c.code)) : [];
  const items: { code: CountryCode | null; name: string; note: string }[] = region ? [
    { code: null, name: `All of ${regionName(region)}`, note: countries.map(c => c.name).join(" · ") },
    ...countries.map(c => ({ code: c.code, name: c.name, note: clock ? timeTz(clock.now, c.tz) : "" })),
  ] : [];
  const pick = (code: CountryCode | null) => {
    if (region) onScope({ region, country: code });
    onClose();
  };
  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const list = [...(listRef.current?.querySelectorAll<HTMLButtonElement>("[role='radio']") ?? [])];
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    list[(at + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length]?.focus();
    e.preventDefault();
  };
  return <Sheet title="Region" onClose={onClose}>
    <div className="pd-regionsheet-regions">
      <Segmented label="Region" options={REGION_OPTIONS.filter(o => o.value === "all" || seesRegion(visible, o.value))} value={scope.region} onChange={next => {
        onScope({ region: next, country: null });
        if (next === "all") onClose();
      }}/>
    </div>
    {region && <div ref={listRef} role="radiogroup" aria-label={`Countries in ${regionName(region)}`} className="pd-regionsheet-list" onKeyDown={onListKey}>
      {items.map(item => {
        const checked = item.code === (scope.country ?? null);
        return <button type="button" key={item.code ?? "all"} role="radio" aria-checked={checked} className="pd-regionsheet-item" onClick={() => pick(item.code)}>
          <span className="pd-sheet-tile" aria-hidden="true">{item.code ?? <Icon name="globe" size={18} strokeWidth={1.8}/>}</span>
          <span className="pd-sheet-text"><b>{item.name}</b>{item.note && <span>{item.note}</span>}</span>
          {checked && <Icon name="check" size={20} strokeWidth={2.4}/>}
        </button>;
      })}
    </div>}
  </Sheet>;
}
