import { INSTANCE_URL, LIBRARY_METRICS } from "./metrics.generated";

/*
 * What each number on the Business page means: the card a label opens (src/components/Define.tsx).
 *
 * A definition that is one Library metric takes its text from that metric's Metabase description
 * (src/metrics.generated.ts, refreshed with `npm run metrics`), so Metabase stays the source of truth; the
 * text written here is only the fallback while the metric or its description is missing. A composite
 * number (built from several metrics: contribution, plan to actual, landing, stock at risk…) is written
 * here in the same plain style, with a formula line. Metrics are named by their Library name, so one
 * Metabase does not have yet simply drops out of the card until the schema and `npm run metrics` catch up.
 */

/** Every definition a label can open. */
export type DefinitionKey =
  | "revenue" | "revenueVsPlan" | "growthVsLastSeason" | "season" | "seasonLanding"
  | "grossMargin" | "averageSellingPrice" | "pumpkinsSold" | "contribution"
  | "lostSales" | "deliveryCost" | "shrink" | "markdowns"
  | "dailyRevenue" | "events" | "bridge" | "seasonCurve" | "stockAtRisk" | "markdownExposure"
  | "breakdown" | "mix" | "liveSales";

/**
 * The Library metrics that can be explored inside the app: one metric by day and country on
 * daily_store_sales (queries/live.query.ts exports `Explore<Key>`, e.g. ExploreGrossMargin).
 */
export type ExploreKey = "revenue" | "grossMargin" | "averageSellingPrice" | "pumpkinsSold" | "lostSales" | "deliveryCost" | "shrink";

export type Definition = {
  /** The card's title: "Gross margin". */
  title: string;
  /** What it means, in plain sentences. */
  text: string;
  /** The Library metric ids it is built from. The first is the primary one ("Open in Metabase"). */
  metrics: number[];
  /** How a composite number is put together: "Gross margin − Delivery cost − Shrink". */
  formula?: string;
  /** The Explore sheet it opens, where it maps to one Library metric. */
  explore?: ExploreKey;
};

/* ── Library metrics by name ─────────────────────────────── */

const ID_BY_NAME = new Map(Object.entries(LIBRARY_METRICS).map(([id, metric]) => [metric.name.toLowerCase(), Number(id)]));
/** The id of the Library metric with this name, or null while the schema does not have it. */
export const metricId = (name: string): number | null => ID_BY_NAME.get(name.toLowerCase()) ?? null;
/** Library metric ids by name, in order, leaving out the names the schema does not have (yet). */
const ids = (...names: string[]) => names.map(metricId).filter((id): id is number => id != null);
/** A Library metric's Metabase description, or `fallback` while the metric or its description is missing. */
const described = (name: string, fallback: string) => {
  const id = metricId(name);
  return (id != null && LIBRARY_METRICS[id]?.description) || fallback;
};
/** The Library metric's page in Metabase (not the app's own copies of the metrics). */
export const metricUrl = (id: number) => `${INSTANCE_URL}/metric/${id}`;
/** A saved question's page in Metabase (the Explore tab links to what Nobi saves). */
export const questionUrl = (id: number) => `${INSTANCE_URL}/question/${id}`;
/** The Library metric's name, for links: "Plan gross margin". */
export const metricName = (id: number) => LIBRARY_METRICS[id]?.name ?? `Metric ${id}`;

/* ── Definitions ─────────────────────────────────────────── */

export const DEFINITIONS: Record<DefinitionKey, Definition> = {
  revenue: {
    title: "Revenue",
    text: described("Revenue", "Money taken from pumpkins sold, in USD, after markdowns."),
    metrics: ids("Revenue", "Revenue plan", "Last season revenue"),
    explore: "revenue",
  },
  revenueVsPlan: {
    title: "Revenue vs plan",
    text: described("Revenue vs plan", "Revenue against the plan for the same period: +0.05 = 5% ahead of plan."),
    metrics: ids("Revenue vs plan", "Revenue", "Revenue plan"),
    formula: "Revenue ÷ Revenue plan − 1",
  },
  growthVsLastSeason: {
    title: "Growth vs last season",
    text: described("Growth vs last season", "Revenue against last season for the same days: +0.05 = 5% up."),
    metrics: ids("Growth vs last season", "Revenue", "Last season revenue"),
    formula: "Revenue ÷ Last season revenue − 1",
  },
  season: {
    title: "Season",
    text: "Revenue from Sep 1 to today against the season plan, which runs to Nov 15. The landing is where the season should end up at the pace of the last 7 days.",
    metrics: ids("Revenue", "Revenue plan", "Projected season revenue"),
  },
  seasonLanding: {
    title: "Season landing",
    text: "Where season revenue should end up on Nov 15: revenue to date, plus the plan still to come at the pace of the last 7 days against plan. The range runs from the 10th to the 90th percentile of the daily pace over the last 14 days.",
    metrics: ids("Projected season revenue", "Revenue", "Revenue plan"),
    formula: "Revenue to date + plan still to come × pace of the last 7 days",
  },
  grossMargin: {
    title: "Gross margin",
    text: described("Gross margin", "Revenue minus the cost of the pumpkins sold, in USD."),
    metrics: ids("Gross margin", "Plan gross margin", "Last season gross margin", "Gross margin rate"),
    explore: "grossMargin",
  },
  averageSellingPrice: {
    title: "Average selling price",
    text: described("Average selling price", "Revenue per pumpkin sold, in USD."),
    metrics: ids("Average selling price", "Revenue", "Pumpkins sold"),
    formula: "Revenue ÷ Pumpkins sold",
    explore: "averageSellingPrice",
  },
  pumpkinsSold: {
    title: "Pumpkins sold",
    text: described("Pumpkins sold", "Pumpkins sold, all channels."),
    metrics: ids("Pumpkins sold", "Average selling price"),
    explore: "pumpkinsSold",
  },
  contribution: {
    title: "Contribution",
    text: "What is left of gross margin once the pumpkins are delivered and the damaged ones written off, in USD. Delivery and shrink have no plan or last season, so it compares with the prior 7 days only.",
    metrics: ids("Gross margin", "Delivery cost", "Shrink"),
    formula: "Gross margin − Delivery cost − Shrink",
  },
  lostSales: {
    title: "Lost sales",
    text: described("Lost sales", "Revenue we could not take because a store ran out of a variety, in USD."),
    metrics: ids("Lost sales", "Lost sales to late deliveries", "Fill rate"),
    explore: "lostSales",
  },
  deliveryCost: {
    title: "Delivery cost",
    text: described("Delivery cost", "Cost of the van runs that restocked the stores, in USD."),
    metrics: ids("Delivery cost", "Deliveries"),
    explore: "deliveryCost",
  },
  shrink: {
    title: "Shrink",
    text: described("Shrink", "Pumpkins damaged in transit or spoiled on the shelf, at cost, in USD."),
    metrics: ids("Shrink"),
    explore: "shrink",
  },
  markdowns: {
    title: "Markdowns",
    text: "Price given away after Halloween: from Nov 1 carving pumpkins sell at 30% off and cooking pumpkins at 15% off; minis keep their price. Revenue is already net of it. Zero before Nov 1.",
    metrics: [],
  },
  dailyRevenue: {
    title: "Daily revenue",
    text: "Revenue per local calendar date: each store's sales count on its own local date, so Japan's Thursday is its own column while Europe and North America are still on Wednesday. Against the plan and last season on the matching day. A date that is still running somewhere in scope is marked so far, with its plan and last season paced to now.",
    metrics: ids("Revenue", "Revenue plan", "Last season revenue"),
    explore: "revenue",
  },
  events: {
    title: "Events",
    text: "Storms, van breakdowns and hubs that ran short, from the moment they started. The amount is the sales lost to each so far. Ventilation faults are listed, not marked.",
    metrics: ids("Lost sales", "Lost sales to late deliveries"),
  },
  bridge: {
    title: "Plan to actual",
    text: "How revenue got from plan to actual. Volume: customers asked for more or fewer pumpkins than planned, valued at the plan's average price. Mix: the demand fell on dearer or cheaper varieties and stores than planned. Then the sales lost, by cause. Pumpkins always sell at the plan price, so there is no price step.",
    metrics: ids("Revenue", "Revenue plan", "Lost sales", "Lost sales to late deliveries"),
    formula: "Plan + Volume + Mix − Lost sales = Revenue",
  },
  seasonCurve: {
    title: "Season",
    text: "Revenue added up from Sep 1, against the plan and last season on the matching days. After today the line is a projection: the plan still to come at the recent pace, with its range.",
    metrics: ids("Revenue", "Revenue plan", "Last season revenue", "Projected season revenue"),
  },
  stockAtRisk: {
    title: "Stock at risk",
    text: "Pumpkins projected to be left on Nov 1: what is in stores, at hubs and on vans now, plus the harvest still planned, minus the sales expected to Oct 31 at the recent pace against plan. Below zero a variety runs short before Halloween. What is left sells at markdown in November; what is still left on Nov 15 is written off.",
    metrics: ids("Projected leftover after Halloween", "Leftover stock at cost", "Markdown exposure"),
    formula: "On hand + harvest still planned − sales expected to Oct 31",
  },
  markdownExposure: {
    title: "Markdown exposure",
    text: described("Markdown exposure", "What the Nov 1 markdowns are projected to give away on the stock left after Halloween, in USD."),
    metrics: ids("Markdown exposure", "Projected leftover after Halloween"),
  },
  breakdown: {
    title: "Breakdown",
    text: "The period's revenue, gross margin, pumpkins sold or lost sales, split by country, city, store format, variety or channel, each against plan and last season. Share is the row's part of the total; the trend runs over Daily revenue's 28 local dates.",
    metrics: ids("Revenue", "Gross margin", "Pumpkins sold", "Lost sales"),
  },
  mix: {
    title: "Mix",
    text: "Revenue split by variety and by channel. A variety's shift is the change in its share of revenue against last season, in percentage points.",
    metrics: ids("Revenue", "Gross margin"),
  },
  liveSales: {
    title: "Live sales",
    text: "Sales from the stores in scope as they happen, on the simulated clock, checked every 10 seconds. Revenue counts each sale as it comes in.",
    metrics: ids("Revenue"),
  },
};

/** True for a string that names a definition (the preview's `define` state is a plain string). */
export const isDefinitionKey = (value: unknown): value is DefinitionKey => typeof value === "string" && Object.prototype.hasOwnProperty.call(DEFINITIONS, value);

/* ── Explore ─────────────────────────────────────────────── */

/** Each Explore sheet: its title and the Library metric it shows (by name, like the definitions). */
export const EXPLORE: Record<ExploreKey, { title: string; metric: string }> = {
  revenue: { title: "Revenue", metric: "Revenue" },
  grossMargin: { title: "Gross margin", metric: "Gross margin" },
  averageSellingPrice: { title: "Average selling price", metric: "Average selling price" },
  pumpkinsSold: { title: "Pumpkins sold", metric: "Pumpkins sold" },
  lostSales: { title: "Lost sales", metric: "Lost sales" },
  deliveryCost: { title: "Delivery cost", metric: "Delivery cost" },
  shrink: { title: "Shrink", metric: "Shrink" },
};
