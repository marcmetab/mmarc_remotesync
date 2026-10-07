import type { ReactNode } from "react";
import business from "../assets/banner-business.svg";
import fleet from "../assets/banner-fleet.svg";
import flow from "../assets/banner-flow.svg";
import stores from "../assets/banner-stores.svg";

export type BannerVariant = "business" | "fleet" | "stores" | "explore" | "flow";
/** Each scene is an SVG cropped to a wide strip; the bundle inlines it as a data URI. Explore reuses the harvest fields. */
const ART: Record<BannerVariant, string> = { business, fleet, stores, explore: business, flow };

/**
 * The illustrated strip at the top of every page: art only, no title (148px, 104px on phones).
 * business: the harvest truck on the hill road · fleet: three trucks on the road (also the truck page) ·
 * stores: the market stall (also city and store pages) · explore: the harvest fields of business (on phones
 * cropped to the barn and the truck) · flow: the mini PC on its hill sending pumpkins to the barn in the clouds. `chip` is the one small status the Business
 * banner carries ("Halloween in 3 days"); other pages pass nothing.
 */
export function Banner({ variant, chip }: { variant: BannerVariant; chip?: ReactNode }) {
  return <section className={`pd-banner is-${variant}`}>
    <img src={ART[variant]} alt=""/>
    {chip && <div className="pd-banner-top"><span className="pd-banner-chip">{chip}</span></div>}
  </section>;
}
