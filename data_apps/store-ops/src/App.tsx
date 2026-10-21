import type { MetabaseCard } from "@metabase/embedding-sdk-react";
import { useState } from "react";

import {
  OpenOrderCountKpi,
  OpenOrderRevenueKpi,
  OrderCountKpi,
  OrdersByRegion,
  OrdersByStatus,
  RevenueAndOrdersByMonth,
  RevenueByProduct,
  TotalRevenueKpi,
} from "../queries/orders.query";
import { StoreCountKpi, StoreDirectory } from "../queries/stores.query";
import { OrderEditor } from "./components/OrderEditor";
import { Panel, colors } from "./components/Panel";
import { QuestionView } from "./components/QuestionPanel";
import { TargetsByRegionPanel } from "./components/TargetsByRegion";

const scalar = { visualization: "scalar" } satisfies Omit<MetabaseCard, "query">;

const revenueByMonth = {
  visualization: "combo",
  visualizationSettings: {
    "graph.x_axis.title_text": "Month",
    "graph.y_axis.title_text": "Revenue",
    "graph.y_axis.right.title_text": "Orders",
    series_settings: {
      revenue: { display: "bar", title: "Revenue" },
      count: { display: "line", title: "Orders" },
    },
  },
} satisfies Omit<MetabaseCard, "query">;

const ordersByStatus = {
  visualization: "bar",
  visualizationSettings: {
    "graph.show_values": true,
    "graph.x_axis.title_text": "Status",
    "graph.y_axis.title_text": "Orders",
  },
} satisfies Omit<MetabaseCard, "query">;

const ordersByRegion = {
  visualization: "bar",
  visualizationSettings: {
    "graph.show_values": true,
    "graph.x_axis.title_text": "Region",
    "graph.y_axis.title_text": "Orders",
  },
} satisfies Omit<MetabaseCard, "query">;

const revenueByProduct = {
  visualization: "row",
  visualizationSettings: {
    "graph.show_values": true,
    "graph.y_axis.title_text": "Revenue",
  },
} satisfies Omit<MetabaseCard, "query">;

const storeDirectory = { visualization: "table" } satisfies Omit<MetabaseCard, "query">;

const kpis = [
  { title: "Orders", subtitle: "DAv65 Order count", definition: OrderCountKpi },
  { title: "Total revenue", subtitle: "DAv65 Total revenue", definition: TotalRevenueKpi },
  { title: "Open orders", subtitle: "Order count, DAv65 Open orders", definition: OpenOrderCountKpi },
  { title: "Open order revenue", subtitle: "Total revenue, DAv65 Open orders", definition: OpenOrderRevenueKpi },
  { title: "Stores", subtitle: "Stores in the Library", definition: StoreCountKpi },
] as const;

export default function App() {
  // Bumped after a write, so every chart re-runs and shows the new statuses
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshCharts = () => setRefreshKey((key) => key + 1);

  return (
    <div
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: 24,
        background: colors.page,
        color: colors.text,
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: 24 }}>Store Ops</h1>
        <p style={{ margin: "4px 0 0", color: colors.muted, fontSize: 14 }}>
          Orders, revenue, and open order follow-up across every store.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {kpis.map((kpi) => (
          <Panel key={kpi.title} title={kpi.title} subtitle={kpi.subtitle}>
            <QuestionView
              definition={kpi.definition}
              options={scalar}
              height={72}
              refreshKey={refreshKey}
            />
          </Panel>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)", gap: 16 }}>
        <Panel title="Revenue and orders by month">
          <QuestionView
            definition={RevenueAndOrdersByMonth}
            options={revenueByMonth}
            height={320}
            refreshKey={refreshKey}
          />
        </Panel>
        <Panel title="Orders by status">
          <QuestionView
            definition={OrdersByStatus}
            options={ordersByStatus}
            height={320}
            refreshKey={refreshKey}
          />
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
        <Panel title="Orders by region">
          <QuestionView
            definition={OrdersByRegion}
            options={ordersByRegion}
            height={300}
            refreshKey={refreshKey}
          />
        </Panel>
        <Panel title="Revenue by product">
          <QuestionView
            definition={RevenueByProduct}
            options={revenueByProduct}
            height={300}
            refreshKey={refreshKey}
          />
        </Panel>
      </div>

      <TargetsByRegionPanel />

      <OrderEditor onSaved={refreshCharts} />

      <Panel title="Stores" subtitle="Every store, its region, and its manager">
        <QuestionView definition={StoreDirectory} options={storeDirectory} height={320} />
      </Panel>
    </div>
  );
}
