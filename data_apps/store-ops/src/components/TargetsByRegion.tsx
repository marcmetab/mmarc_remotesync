import { useDateFormatter, useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useMemo } from "react";

import { RevenueByRegionAndMonth, TargetsByRegion } from "../../queries/targets.query";
import schema from "../metabase.data";
import { EmptyState, Panel, PanelError, Spinner, colors } from "./Panel";

const targetFields = schema.tables.storeTargets.fields;

// Neither table gives these amounts a currency, so they're shown as plain amounts
const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

type RegionRow = {
  region: string;
  target: number | null;
  latestMonth: string | null;
  latestRevenue: number | null;
  averageRevenue: number | null;
  monthCount: number;
};

function toDateString(value: string | Date | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

// Targets come from store_targets and revenue from store_orders; the two tables
// share no metric, so the panel lines them up by region name.
// The order-status action changes neither table, so the panel needs no refresh after it.
export function TargetsByRegionPanel() {
  const targets = useMetabaseQuery(TargetsByRegion);
  const revenue = useMetabaseQuery(RevenueByRegionAndMonth);
  const { formatDate } = useDateFormatter();

  const rows = useMemo((): RegionRow[] => {
    const byRegion = new Map<string, RegionRow>();
    const rowFor = (region: string) => {
      let row = byRegion.get(region);
      if (!row) {
        row = { region, target: null, latestMonth: null, latestRevenue: null, averageRevenue: null, monthCount: 0 };
        byRegion.set(region, row);
      }
      return row;
    };

    for (const row of targets.data?.rows ?? []) {
      const region = row[targetFields.region.name];
      if (region != null) {
        rowFor(region).target = row[targetFields.monthlyTarget.name] ?? null;
      }
    }

    const totals = new Map<string, number>();
    // rows arrive ordered by region, then month, so the last one per region is its latest month
    for (const row of revenue.data?.rows ?? []) {
      const region = row.region;
      const value = row.revenue;
      if (region == null || value == null) {
        continue;
      }
      const entry = rowFor(region);
      entry.latestMonth = toDateString(row.created_month);
      entry.latestRevenue = value;
      entry.monthCount += 1;
      totals.set(region, (totals.get(region) ?? 0) + value);
    }
    for (const [region, total] of totals) {
      const entry = rowFor(region);
      entry.averageRevenue = entry.monthCount > 0 ? total / entry.monthCount : null;
    }

    return [...byRegion.values()].sort((a, b) => a.region.localeCompare(b.region));
  }, [targets.data, revenue.data]);

  const error = targets.error ?? revenue.error;
  const isLoading = !error && (targets.data === null || revenue.data === null);

  const cell = { padding: "10px 12px", borderBottom: `1px solid ${colors.border}` };
  const num = { ...cell, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" };
  const head = { ...cell, color: colors.muted, fontWeight: 500, background: "#f9fafb" };
  const show = (value: number | null) => (value == null ? "—" : amount.format(value));

  return (
    <Panel
      title="Targets by region"
      subtitle="Each region's monthly target (store_targets) beside its revenue (DAv65 Total revenue)"
    >
      {error ? (
        <PanelError error={error} />
      ) : isLoading ? (
        <Spinner height={200} />
      ) : rows.length === 0 ? (
        <EmptyState>No targets or revenue yet.</EmptyState>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: colors.text }}>
          <thead>
            <tr>
              <th style={{ ...head, textAlign: "left" }}>Region</th>
              <th style={{ ...head, textAlign: "right" }}>Monthly target</th>
              <th style={{ ...head, textAlign: "right" }}>Latest month revenue</th>
              <th style={{ ...head, textAlign: "right" }}>Avg. monthly revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.region}>
                <td style={{ ...cell, fontWeight: 600 }}>{row.region}</td>
                <td style={num}>{show(row.target)}</td>
                <td style={num}>
                  {show(row.latestRevenue)}
                  {row.latestMonth ? (
                    <div style={{ fontSize: 11, color: colors.muted }}>
                      {formatDate(row.latestMonth, { format: "MMMM YYYY" })}
                    </div>
                  ) : null}
                </td>
                <td style={num}>
                  {show(row.averageRevenue)}
                  {row.monthCount > 0 ? (
                    <div style={{ fontSize: 11, color: colors.muted }}>
                      over {row.monthCount} month{row.monthCount === 1 ? "" : "s"} with orders
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}
