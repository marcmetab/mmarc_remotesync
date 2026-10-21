import {
  useAction,
  useDateFormatter,
  useMetabaseQuery,
} from "@metabase/embedding-sdk-react/data-app";
import { useMemo, useState, type FormEvent } from "react";

import { UpdateOrderStatus } from "../../actions/orders.action";
import {
  OpenOrderList,
  RecentOrderList,
  StatusOptions,
} from "../../queries/orders.query";
import schema from "../metabase.data";
import { EmptyState, Panel, PanelError, Spinner, colors } from "./Panel";

const orderFields = schema.tables.storeOrders.fields;
// The schema gives `total` no currency, so it's shown as a plain amount
const amount = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Scope = "open" | "recent";

function toDateString(value: string | Date | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

type OrderRow = {
  id: number;
  createdAt: string | null;
  region: string | null;
  product: string | null;
  quantity: number | null;
  total: number | null;
  status: string | null;
  notes: string | null;
};

export function OrderEditor({ onSaved }: { onSaved: () => void }) {
  const [scope, setScope] = useState<Scope>("open");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const orders = useMetabaseQuery(scope === "open" ? OpenOrderList : RecentOrderList);
  const statuses = useMetabaseQuery(StatusOptions);

  const rows = useMemo(
    (): OrderRow[] =>
      (orders.data?.rows ?? []).flatMap((row) => {
        const id = row[orderFields.id.name];
        if (id == null) {
          return [];
        }
        return [
          {
            id,
            createdAt: toDateString(row[orderFields.createdAt.name]),
            region: row[orderFields.region.name] ?? null,
            product: row[orderFields.product.name] ?? null,
            quantity: row[orderFields.quantity.name] ?? null,
            total: row[orderFields.total.name] ?? null,
            status: row[orderFields.status.name] ?? null,
            notes: row[orderFields.notes.name] ?? null,
          },
        ];
      }),
    [orders.data],
  );

  const statusOptions = useMemo(
    () =>
      (statuses.data?.rows ?? [])
        .map((row) => row[orderFields.status.name])
        .filter((value): value is string => typeof value === "string" && value !== ""),
    [statuses.data],
  );

  const selected = rows.find((row) => row.id === selectedId) ?? null;
  // Lives here, not in the form: an order that leaves the open list unmounts its form
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh(message: string) {
    await Promise.all([orders.refetch(), statuses.refetch()]);
    setNotice(message);
    onSaved();
  }

  return (
    <Panel
      title="Update an order"
      subtitle="Pick an order, then change its status and notes."
      actions={
        <ScopeToggle
          value={scope}
          onChange={(next) => {
            setScope(next);
            setSelectedId(null);
            setNotice(null);
          }}
        />
      }
    >
      {notice ? (
        <div
          role="status"
          style={{ background: "#f0fdf4", color: colors.success, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}
        >
          {notice}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 3fr) minmax(280px, 2fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <OrderList
          rows={rows}
          isLoading={orders.data === null && !orders.error}
          error={orders.error}
          scope={scope}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setNotice(null);
          }}
        />
        {selected ? (
          <OrderForm
            // remount per order so the inputs start from that order's values
            key={selected.id}
            order={selected}
            statusOptions={statusOptions}
            onSaved={refresh}
          />
        ) : (
          <div
            style={{
              border: `1px dashed ${colors.border}`,
              borderRadius: 10,
              padding: 24,
              color: colors.muted,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Select an order from the list to edit it.
          </div>
        )}
      </div>
    </Panel>
  );
}

function ScopeToggle({ value, onChange }: { value: Scope; onChange: (value: Scope) => void }) {
  const options: { value: Scope; label: string }[] = [
    { value: "open", label: "Open orders" },
    { value: "recent", label: "All recent orders" },
  ];
  return (
    <div
      role="tablist"
      style={{ display: "flex", border: `1px solid ${colors.border}`, borderRadius: 8, overflow: "hidden" }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            style={{
              border: "none",
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              background: isActive ? colors.brand : "white",
              color: isActive ? "white" : colors.text,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function OrderList({
  rows,
  isLoading,
  error,
  scope,
  selectedId,
  onSelect,
}: {
  rows: OrderRow[];
  isLoading: boolean;
  error: unknown;
  scope: Scope;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const { formatDate } = useDateFormatter();

  if (error) {
    return <PanelError error={error} />;
  }
  if (isLoading) {
    return <Spinner height={320} />;
  }
  if (rows.length === 0) {
    return <EmptyState>{scope === "open" ? "No open orders." : "No orders yet."}</EmptyState>;
  }

  const cell = { padding: "8px 10px", borderBottom: `1px solid ${colors.border}` };
  const head = { ...cell, textAlign: "left" as const, color: colors.muted, fontWeight: 500, background: "#f9fafb", position: "sticky" as const, top: 0 };

  return (
    <div style={{ maxHeight: 420, overflowY: "auto", border: `1px solid ${colors.border}`, borderRadius: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: colors.text }}>
        <thead>
          <tr>
            <th style={head}>Order</th>
            <th style={head}>Created</th>
            <th style={head}>Region</th>
            <th style={head}>Product</th>
            <th style={{ ...head, textAlign: "right" }}>Total</th>
            <th style={head}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = row.id === selectedId;
            return (
              <tr
                key={row.id}
                onClick={() => onSelect(row.id)}
                aria-selected={isSelected}
                style={{ cursor: "pointer", background: isSelected ? "#EAF4FF" : undefined }}
              >
                <td style={cell}>#{row.id}</td>
                <td style={cell}>{row.createdAt ? formatDate(row.createdAt) : "—"}</td>
                <td style={cell}>{row.region ?? "—"}</td>
                <td style={cell}>{row.product ?? "—"}</td>
                <td style={{ ...cell, textAlign: "right" }}>
                  {row.total == null ? "—" : amount.format(row.total)}
                </td>
                <td style={cell}>{row.status ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrderForm({
  order,
  statusOptions,
  onSaved,
}: {
  order: OrderRow;
  statusOptions: string[];
  onSaved: (message: string) => Promise<void>;
}) {
  const { execute, isExecuting, error, reset } = useAction(UpdateOrderStatus);
  const [status, setStatus] = useState(order.status ?? "");
  const [notes, setNotes] = useState(order.notes ?? "");
  const [isFormValid, setIsFormValid] = useState(status !== "");

  const fieldErrors = error?.data.errors ?? {};

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await execute({ order_id: order.id, status, notes });
      const affected = response?.["rows-affected"];
      await onSaved(
        affected === 0
          ? `Order #${order.id} was not found, so nothing changed.`
          : `Order #${order.id} saved with status “${status}”.`,
      );
    } catch {
      // the failure is also in `error`, rendered below
    }
  }

  const label = { display: "flex", flexDirection: "column" as const, gap: 4, fontSize: 12, color: colors.muted };
  const input = {
    font: "inherit",
    fontSize: 13,
    color: colors.text,
    padding: "8px 10px",
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
  };

  return (
    <form
      onSubmit={onSubmit}
      onChange={(event) => {
        setIsFormValid(event.currentTarget.checkValidity());
        reset();
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
        Order #{order.id}
        <div style={{ fontSize: 12, fontWeight: 400, color: colors.muted }}>
          {[order.product, order.region, order.quantity == null ? null : `qty ${order.quantity}`]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>

      <label style={label}>
        Status
        <input
          type="text"
          required
          list="store-ops-status-options"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-invalid={Boolean(fieldErrors.status)}
          style={{ ...input, borderColor: fieldErrors.status ? colors.danger : colors.border }}
        />
        <datalist id="store-ops-status-options">
          {statusOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        {fieldErrors.status ? <span role="alert" style={{ color: colors.danger }}>{fieldErrors.status}</span> : null}
      </label>

      <label style={label}>
        Notes
        <textarea
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          aria-invalid={Boolean(fieldErrors.notes)}
          style={{ ...input, resize: "vertical", borderColor: fieldErrors.notes ? colors.danger : colors.border }}
        />
        {fieldErrors.notes ? <span role="alert" style={{ color: colors.danger }}>{fieldErrors.notes}</span> : null}
      </label>

      <button
        type="submit"
        disabled={isExecuting || !isFormValid}
        style={{
          alignSelf: "flex-start",
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          color: "white",
          background: colors.brand,
          opacity: isExecuting || !isFormValid ? 0.5 : 1,
          cursor: isExecuting || !isFormValid ? "default" : "pointer",
        }}
      >
        {isExecuting ? "Saving…" : "Save changes"}
      </button>

      {error ? (
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: colors.danger, fontSize: 12 }}>
          {error.data.message ?? "Action failed."}
        </pre>
      ) : null}
    </form>
  );
}
