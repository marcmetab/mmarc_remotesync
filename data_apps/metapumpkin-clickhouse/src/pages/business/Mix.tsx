import type { ReactNode } from "react";
import "./business.css";
import { Define } from "../../components/Define";
import { Meter, Panel, PanelState, Swatch } from "../../components/ui";
import { pct, price, share, signedPts } from "../../format";
import { palette, varietyColor } from "../../theme";
import type { BusinessChannel, BusinessMix } from "./model";

/*
 * Mix (the rail beside Plan to actual): revenue split by variety, each with its margin and how its share
 * moved against last season, and by channel. Data: vm.mix[period] (daily_store_sales by variety_name, and
 * online_revenue_usd for the channels). Styles: business.css.
 */

/** In store is the plum block of the page (business.css): plum in light, the softer plum-hill in dark. */
export const CHANNEL: Record<BusinessChannel, { label: string; color: string }> = {
  in_store: { label: "In store", color: "var(--pd-business-plum-block)" },
  online: { label: "Online", color: palette.incoming },
};

type MixPart = { label: string; color: string; revenue: number; shift?: string | null; note: string | null };

export type MixProps = {
  /** vm.mix[period] */
  mix?: BusinessMix;
  busy?: boolean;
  /** vm.failed.mix */
  error?: string;
  onRetry?: () => void;
};

/** Revenue split by variety (with each variety's margin and its share against last season) and by channel. */
export function Mix({ mix, busy, error, onRetry }: MixProps) {
  const title = <Define k="mix" part="mix">Mix</Define>;
  if (!mix) return <Panel title={title} label="Mix" gap={16} className="pd-split-rail pd-business-rail">
    {error ? <PanelState state="error" message={error} onRetry={onRetry}/> : <PanelState state="loading" chart minHeight={220}/>}
  </Panel>;
  const revenue = mix.varieties.reduce((s, v) => s + v.revenue, 0);
  const lyRevenue = mix.varieties.reduce((s, v) => s + v.lyRevenue, 0);
  const groups: { title: string; parts: MixPart[] }[] = [
    {
      title: "Variety",
      parts: mix.varieties.map(v => {
        // The variety's share of revenue against its share last season, in points.
        const now = share(v.revenue, revenue), then = share(v.lyRevenue, lyRevenue);
        return {
          label: v.variety, color: varietyColor[v.variety], revenue: v.revenue,
          shift: now != null && then != null ? `${signedPts(now - then)} vs last season` : null,
          note: v.revenue ? `${pct(v.grossMargin / v.revenue, 1)} margin` : "—",
        };
      }),
    },
    { title: "Channel", parts: mix.channels.map(c => ({ ...CHANNEL[c.channel], revenue: c.revenue, note: c.units == null ? null : c.units ? `${price(c.revenue / c.units)} each` : "—" })) },
  ];
  return <Panel title={title} label="Mix" gap={16} busy={busy} className="pd-split-rail pd-business-rail">
    {groups.map(g => {
      const total = g.parts.reduce((s, p) => s + p.revenue, 0);
      return <div className="pd-business-mix" key={g.title}>
        <div className="pd-label">{g.title}</div>
        <Meter height={10} gap={total ? 2 : 0} segments={g.parts.map(p => ({ value: total ? p.revenue : 0, color: p.color }))}
          aria-label={`${g.title}: ${g.parts.map(p => `${p.label} ${pct(share(p.revenue, total))}`).join(", ")}`}/>
        <div>
          {g.parts.map(p => {
            const name: ReactNode = p.shift ? <span className="pd-business-mix-name">{p.label}<small>{p.shift}</small></span> : <span>{p.label}</span>;
            return <div className="pd-keyrow" key={p.label}>
              <Swatch color={p.color}/>
              {name}
              <strong>{pct(share(p.revenue, total))}</strong>
              <span className="pd-business-key-note">{p.note}</span>
            </div>;
          })}
        </div>
      </div>;
    })}
  </Panel>;
}
