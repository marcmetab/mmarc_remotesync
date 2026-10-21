import {
  aggregations,
  breakout,
  defineQuery,
  orderBy,
} from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/metabase.data";

const targetsTable = schema.tables.storeTargets;
const ordersTable = schema.tables.storeOrders;

export const TargetsByRegion = defineQuery({
  savedQuestionEntityId: "4nOd2mnRA2jajpGzIrUt_",
  source: targetsTable,
  fields: [targetsTable.fields.region, targetsTable.fields.monthlyTarget],
  orderBys: [orderBy(targetsTable.fields.region, "asc")],
});

const orderRegion = breakout(ordersTable.fields.region, { name: "region" });
const orderMonth = breakout(ordersTable.fields.createdAt, {
  unit: "month",
  name: "created_month",
});

// Monthly revenue per region, to set beside each region's monthly target
export const RevenueByRegionAndMonth = defineQuery({
  savedQuestionEntityId: "bVAflQqFIlDKyAaVAgo41",
  source: ordersTable,
  aggregations: [
    aggregations.measure(ordersTable.measures.dAv65TotalRevenue, { name: "revenue" }),
  ],
  breakouts: [orderRegion, orderMonth],
  orderBys: [orderBy(orderRegion, "asc"), orderBy(orderMonth, "asc")],
});
