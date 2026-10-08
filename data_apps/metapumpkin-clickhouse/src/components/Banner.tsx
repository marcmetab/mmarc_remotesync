import type { ReactNode } from "react";
import { reducedMotion } from "../motion";
import type { TabId } from "../routes";
import fleet from "../assets/banner-fleet.svg";
import business from "../assets/banner-business.svg";
import flow from "../assets/banner-flow.svg";
import { HarvestScene, type SceneSale } from "./banner/HarvestScene";

/** A tab's art (routes.ts bannerOf: which page shows which). */
export type BannerVariant = Exclude<TabId, "world">;
/** The still scenes: SVG cropped to a wide strip; the bundle inlines it as a data URI. Explore reuses the harvest fields. */
const ART: Record<"fleet" | "explore" | "flow", string> = { fleet, explore: business, flow };

/**
 * The illustrated strip at the top of every page: art only, no title (148px, 104px on phones).
 * business and stores: one living world (banner/HarvestScene.tsx), the harvest truck on the hill road and the market
 * stall (also the city and store pages), panned between as the pages change · fleet: three trucks on the road (also
 * the truck page) · explore: the harvest fields of business (on phones cropped to the barn and the truck) · flow:
 * the mini PC on its hill sending pumpkins to the barn in the clouds. `chip` is the one small status the Business
 * banner carries ("Halloween in 3 days"); other pages pass nothing. `sale` and `onBack` are the harvest world's (a
 * store page opened from a Live sales row). `landing`: the page opening on the way down from World: its art rises into
 * view as the night lifts.
 */
export function Banner({ variant, chip, sale, onBack, landing }: { variant: BannerVariant; chip?: ReactNode; sale?: SceneSale | null; onBack?: () => void; landing?: boolean }) {
  if (variant === "business" || variant === "stores") {
    return <HarvestScene at={variant === "business" ? "biz" : "stores"} chip={chip} sale={sale} onBack={onBack} landing={landing}/>;
  }
  const land = landing && !reducedMotion();
  return <section className={`pd-banner is-${variant}${land ? " is-landing" : ""}`}>
    <img src={ART[variant]} alt=""/>
    {land && <div className="pd-scene-night" aria-hidden="true"/>}
    {chip && <div className="pd-banner-top"><span className="pd-banner-chip">{chip}</span></div>}
  </section>;
}
