import { memo, type ReactNode, useCallback, useState } from "react";
import { DefineProvider, type ExploreKey } from "../components/Define";
import { useBarAccessory } from "../components/TabBar";
import { UnderlineTabs } from "../components/ui";
import { dollars, plural } from "../format";
import type { PageProps } from "../types";
import { Breakdown as BreakdownPanel } from "./business/Breakdown";
import { Bridge as BridgePanel } from "./business/Bridge";
import { DailyRevenue as DailyRevenuePanel } from "./business/DailyRevenue";
import { Hero } from "./business/Hero";
import { LiveSales } from "./business/LiveSales";
import { LostAndCosts as LostAndCostsPanel } from "./business/LostAndCosts";
import { Mix as MixPanel } from "./business/Mix";
import type { BusinessPeriod, BusinessState, BusinessViewModel } from "./business/model";
import { SeasonCurve as SeasonCurvePanel } from "./business/SeasonCurve";
import { StockAtRisk as StockAtRiskPanel } from "./business/StockAtRisk";
import { Tiles as TilesRow } from "./business/Tiles";

/* The view model lives in ./business/model.ts; it is re-exported here for the files that import it from the page. */
export type * from "./business/model";

/*
 * The live sales arrive every 10 seconds and only change the hero and Live sales (vm.pulse); the live hook
 * keeps every other part the same object until its own query refreshes. These sections skip those re-renders.
 */
const Tiles = memo(TilesRow);
const DailyRevenue = memo(DailyRevenuePanel);
const LostAndCosts = memo(LostAndCostsPanel);
const Bridge = memo(BridgePanel);
const Mix = memo(MixPanel);
const SeasonCurve = memo(SeasonCurvePanel);
const StockAtRisk = memo(StockAtRiskPanel);
const Breakdown = memo(BreakdownPanel);

const PERIODS: { value: BusinessPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "season", label: "Season" },
];

export type BusinessPageProps = PageProps<BusinessViewModel, BusinessState> & {
  /**
   * Renders the Explore sheet of a definition card (a Metabase question for one Library metric). The live
   * container supplies it; the static preview does not, so its cards have no Explore button.
   */
  explore?: (key: ExploreKey, close: () => void) => ReactNode;
};

/**
 * Business: is the season paying off. Period tabs; the revenue hero (live), its comparisons, the latest sale
 * and the season bar; three tiles; Live sales (the newest sales as they come in, whatever the period); Daily
 * revenue with its events beside Lost sales and costs; Plan to actual
 * beside Mix; Season beside Stock at risk; and the Breakdown table. A label with a dotted underline opens
 * its definition. Every section is in ./business/ and takes its part of the view model; each part loads and
 * fails on its own.
 */
export function BusinessPage({ vm, scope, clock, initial, refreshing, explore }: BusinessPageProps) {
  const [period, setPeriod] = useState<BusinessPeriod>(initial?.period ?? "7d");
  // The picked Daily revenue column, by its date: a new date at the end (a market's new day) keeps the pick.
  const [dayDate, setDayDate] = useState<string | null>(() => initial?.day != null ? vm.days?.[initial.day]?.date ?? null : null);
  const picked = dayDate != null ? vm.days?.findIndex(d => d.date === dayDate) ?? -1 : -1;
  const day = picked >= 0 ? picked : null;
  const setDay = useCallback((index: number | null) => setDayDate(index == null ? null : vm.days?.[index]?.date ?? null), [vm.days]);
  const retry = vm.retry;
  const failed = vm.failed;
  const totals = vm.totals?.[period];
  // The compact tab bar's line (phones): the last hour's sales, as Live sales heads them.
  const pulse = vm.pulse;
  useBarAccessory(pulse ? { label: `Live · ${plural(pulse.salesLastHour, "sale")}`, detail: pulse.revenueLastHour != null ? `${dollars(pulse.revenueLastHour)} in the last hour` : "in the last hour" } : null);

  return <DefineProvider clockNow={clock?.now} updatedAt={vm.updatedAt} explore={explore} initialOpen={initial?.define}>
    <UnderlineTabs label="Period" options={PERIODS} value={period} onChange={next => { setPeriod(next); setDay(null); }}/>

    <Hero period={period} totals={totals} season={vm.season} pulse={vm.pulse} today={vm.today ?? vm.days?.[vm.days.length - 1]?.date} failed={failed} onRetry={retry} busy={refreshing}
      scopeKey={`${scope.region}-${scope.country ?? ""}`}/>
    <Tiles period={period} totals={totals} mix={vm.mix?.[period]} mixError={failed?.mix} failed={failed} busy={refreshing}/>
    <LiveSales pulse={vm.pulse} error={failed?.pulse} onRetry={retry} scopeKey={`${scope.region}-${scope.country ?? ""}`} initialMore={initial?.liveMore}/>

    <div className="pd-split">
      <DailyRevenue days={vm.days} events={vm.events} selected={day} onSelect={setDay} busy={refreshing}
        error={failed?.days} eventsError={failed?.events} onRetry={retry}/>
      <LostAndCosts totals={totals} period={period} clockNow={clock?.now} busy={refreshing} error={failed?.totals} onRetry={retry}/>
    </div>

    <div className="pd-split">
      <Bridge period={period} bridge={vm.bridge?.[period]} busy={refreshing} error={failed?.bridge} onRetry={retry}/>
      <Mix mix={vm.mix?.[period]} busy={refreshing} error={failed?.mix} onRetry={retry}/>
    </div>

    <div className="pd-split">
      <SeasonCurve season={vm.season} busy={refreshing} error={failed?.season} onRetry={retry}/>
      <StockAtRisk stock={vm.stock} clockNow={clock?.now} busy={refreshing} error={failed?.stock} onRetry={retry}/>
    </div>

    <Breakdown breakdown={vm.breakdown} period={period} initial={initial}
      busy={refreshing} error={failed?.breakdown} onRetry={retry}/>
  </DefineProvider>;
}
