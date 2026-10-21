import { StaticQuestion, type MetabaseCard } from "@metabase/embedding-sdk-react";
import { useMetabaseQueryObject } from "@metabase/embedding-sdk-react/data-app";
import { useMemo } from "react";

import {
  OpenOrderCountKpi,
  OpenOrderRevenueKpi,
  OrderCountKpi,
  OrdersByRegion,
  OrdersByStatus,
  RevenueAndOrdersByMonth,
  RevenueByProduct,
  TotalRevenueKpi,
} from "../../queries/orders.query";
import { StoreCountKpi, StoreDirectory } from "../../queries/stores.query";
import { PanelError, Spinner } from "./Panel";

type RenderedQuery =
  | typeof OrderCountKpi
  | typeof TotalRevenueKpi
  | typeof OpenOrderCountKpi
  | typeof OpenOrderRevenueKpi
  | typeof RevenueAndOrdersByMonth
  | typeof OrdersByRegion
  | typeof OrdersByStatus
  | typeof RevenueByProduct
  | typeof StoreCountKpi
  | typeof StoreDirectory;

// Distributes over the card union, so each visualization keeps its own settings type
type CardOptions = MetabaseCard extends infer C
  ? C extends unknown
    ? Omit<C, "query">
    : never
  : never;

// Renders one query with a Metabase visualization. `refreshKey` changes after a
// write, which hands StaticQuestion a new card and re-runs the question.
export function QuestionView({
  definition,
  options,
  height,
  refreshKey = 0,
}: {
  definition: RenderedQuery;
  options?: CardOptions;
  height: number;
  refreshKey?: number;
}) {
  const { query, isLoading, error } = useMetabaseQueryObject(definition);

  // A new card object re-runs the question, so refreshKey is a dependency even
  // though the card doesn't read it. Options are module-level constants.
  const card = useMemo(
    () => ({ ...options, query }) satisfies MetabaseCard,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, refreshKey],
  );

  if (error) {
    return <PanelError error={error} />;
  }
  if (isLoading || !query) {
    return <Spinner height={height} />;
  }

  return (
    <div style={{ height }}>
      <StaticQuestion card={card} height="100%" width="100%" />
    </div>
  );
}
