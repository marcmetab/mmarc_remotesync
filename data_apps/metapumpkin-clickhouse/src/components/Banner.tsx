import type { ReactNode } from "react";
import fleet from "../assets/banner-fleet.svg";
import business from "../assets/banner-business.svg";
import flow from "../assets/banner-flow.svg";
import { HarvestScene, type SceneSale } from "./banner/HarvestScene";

export type BannerVariant = "business" | "fleet" | "stores" | "explore" | "flow";
/** The still scenes: SVG cropped to a wide strip; the bundle inlines it as a data URI. Explore reuses the harvest fields. */
const ART: Record<"fleet" | "explore" | "flow", string> = { fleet, explore: business, flow };

/**
 * The illustrated strip at the top of every page: art only, no title (148px, 104px on phones).
 * business and stores: one living world (banner/HarvestScene.tsx), the harvest truck on the hill road and the market
 * stall (also the city and store pages), panned between as the pages change · fleet: three trucks on the road (also
 * the truck page) · explore: the harvest fields of business (on phones cropped to the barn and the truck) · flow:
 * the mini PC on its hill sending pumpkins to the barn in the clouds. `chip` is the one small status the Business
 * banner carries ("Halloween in 3 days"); other pages pass nothing. `sale`, `onBack` and `landing` are the
 * harvest world's (a store page opened from a Live sales row; Business back from World).
 */
export function Banner({ variant, chip, sale, onBack, landing }: { variant: BannerVariant; chip?: ReactNode; sale?: SceneSale | null; onBack?: () => void; landing?: boolean }) {
  if (variant === "business" || variant === "stores") {
    return <HarvestScene at={variant === "business" ? "biz" : "stores"} chip={chip} sale={sale} onBack={onBack} landing={landing}/>;
  }
  return <section className={`pd-banner is-${variant}`}>
    <img src={ART[variant]} alt=""/>
    {chip && <div className="pd-banner-top"><span className="pd-banner-chip">{chip}</span></div>}
  </section>;
}
