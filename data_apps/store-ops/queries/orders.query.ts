import {
  aggregations,
  breakout,
  defineQuery,
  orderBy,
} from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/metabase.data";

const ordersTable = schema.tables.storeOrders;
const orderCount = schema.metrics.dAv65OrderCount;
const totalRevenue = aggregations.measure(ordersTable.measures.dAv65TotalRevenue, {
  name: "revenue",
});

const createdMonth = breakout(orderCount.dimensions.storeOrders.createdAt, {
  unit: "month",
  name: "created_month",
});

// KPIs

export const OrderCountKpi = defineQuery({
  savedQuestionEntityId: "5UJ3eqFw95kH3HDeCplE_",
  source: ordersTable,
  aggregations: [orderCount],
});

export const TotalRevenueKpi = defineQuery({
  savedQuestionEntityId: "Ex5PGWX46EzuIBQtwbXWw",
  source: ordersTable,
  aggregations: [totalRevenue],
});

export const OpenOrderCountKpi = defineQuery({
  savedQuestionEntityId: "PSaXFPfPVtlMD53NTiaXM",
  source: ordersTable,
  filters: [ordersTable.segments.dAv65OpenOrders],
  aggregations: [orderCount],
});

export const OpenOrderRevenueKpi = defineQuery({
  savedQuestionEntityId: "VV8fUkrtZ5g0CSN-H8sp7",
  source: ordersTable,
  filters: [ordersTable.segments.dAv65OpenOrders],
  aggregations: [totalRevenue],
});

// Trends and breakdowns

export const RevenueAndOrdersByMonth = defineQuery({
  savedQuestionEntityId: "On2ZO11GvajIGrak4BATD",
  source: ordersTable,
  aggregations: [totalRevenue, orderCount],
  breakouts: [createdMonth],
  orderBys: [orderBy(createdMonth, "asc")],
});

export const OrdersByRegion = defineQuery({
  savedQuestionEntityId: "013TzEWsO8YH6ULKPZ326",
  source: ordersTable,
  aggregations: [orderCount],
  breakouts: [breakout(orderCount.dimensions.storeOrders.region)],
});

export const OrdersByStatus = defineQuery({
  savedQuestionEntityId: "XlVNHKqEs_WjaNnl_bcaN",
  source: ordersTable,
  aggregations: [orderCount],
  breakouts: [breakout(orderCount.dimensions.storeOrders.status)],
});

export const RevenueByProduct = defineQuery({
  savedQuestionEntityId: "PwpMQ3jVo7EwvqY4sgw5R",
  source: ordersTable,
  aggregations: [totalRevenue],
  breakouts: [breakout(ordersTable.fields.product)],
  orderBys: [orderBy(totalRevenue, "desc")],
});

// Status values already in use, offered as suggestions in the edit form
export const StatusOptions = defineQuery({
  savedQuestionEntityId: "3Y73VN43dMSkiHFoMBJWq",
  source: ordersTable,
  aggregations: [aggregations.count()],
  breakouts: [breakout(ordersTable.fields.status)],
});

// Order lists for the status editor

const orderListFields = [
  ordersTable.fields.id,
  ordersTable.fields.createdAt,
  ordersTable.fields.region,
  ordersTable.fields.product,
  ordersTable.fields.quantity,
  ordersTable.fields.total,
  ordersTable.fields.status,
  ordersTable.fields.notes,
] as const;

export const OpenOrderList = defineQuery({
  savedQuestionEntityId: "O17uWw8rcR13Y9le2HbHm",
  source: ordersTable,
  filters: [ordersTable.segments.dAv65OpenOrders],
  fields: [...orderListFields],
  orderBys: [orderBy(ordersTable.fields.createdAt, "desc")],
  limit: 200,
});

export const RecentOrderList = defineQuery({
  savedQuestionEntityId: "lwngO6IO3OIEQ4UzHtitl",
  source: ordersTable,
  fields: [...orderListFields],
  orderBys: [orderBy(ordersTable.fields.createdAt, "desc")],
  limit: 200,
});
