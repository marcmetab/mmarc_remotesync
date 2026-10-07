import { InteractiveQuestion, type MetabaseCard } from "@metabase/embedding-sdk-react";
import { type DefinedQuery, type MetabaseQueryObject, type MetabaseQueryOptions, useMetabaseQueryObject } from "@metabase/embedding-sdk-react/data-app";
import { type KeyboardEvent, type MouseEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import * as queries from "../../../queries/live.query";
import "../../components/define.css";
import { Icon, Legend, type LegendItem, PanelState } from "../../components/ui";
import { EXPLORE, type ExploreKey, metricId, metricUrl } from "../../definitions";
import { hexPalette, palette, sdkLoadTheme } from "../../theme";
import { COUNTRIES, type CountryCode } from "../../types";
import { apiCard, QuestionFrame, type QuestionHandle, SaveInMetabase, useQuestionHandle } from "../explore/QuestionFrame";

/*
 * Explore: one Library metric by day and country as a Metabase question (InteractiveQuestion), in a sheet
 * over the page (from the right; from the bottom on phones). A definition card's "Explore" opens it.
 *
 * This is the only piece of Business that talks to the SDK, so only the live container (App.tsx) renders
 * it, through BusinessPage's `explore` prop: `explore={(key, close) => <Explore k={key} close={close}/>}`.
 * The page itself and the static preview never import it.
 *
 * The questions are the static queries `Explore<Key>` in queries/live.query.ts (ExploreRevenue,
 * ExploreGrossMargin, ExploreAverageSellingPrice, ExplorePumpkinsSold, ExploreLostSales,
 * ExploreDeliveryCost, ExploreShrink): the Library metric on daily_store_sales by local_date (day) and
 * country_name. They are looked up by name so this file builds before they exist.
 *
 * The question is an ad-hoc card: a line chart whose own settings read the metric in whole dollars (the
 * average selling price keeps its cents, pumpkins are a count), dates as "Sep 1, 2026", and drop the axis
 * titles ("Local Date: Day"): the sheet's title names the metric and the axis reads as dates. Nothing in
 * Metabase changes: the field formatting of the instance (and every dashboard on it) stays as it is.
 *
 * The sheet is in the app's theme, and so is the question in it: the SDK loads in the system's theme, and a
 * QuestionFrame repaints it when the in-app switch moves away from that (explore/sdk-theme.css). The head
 * has "Save in Metabase ↗" next to "Open in Metabase ↗": the question as it is now, edits and all, opened
 * in Metabase as an unsaved question for Nobi to save there (explore/QuestionFrame.tsx).
 *
 * Each country has its own line colour. Under 400px Metabase leaves out the legend of a five-line chart, so
 * phones get the countries' key above the question, until the question's editor is opened: from then on its
 * lines may no longer be the countries. (The SDK's onRun does not fire when an ad-hoc card is changed in its
 * editor, so the key goes when the question's own "Edit question" button is pressed.)
 *
 * The Explore tab (src/pages/explore/ExploreQuestion.tsx) starts its metric questions from the same queries
 * and the same card (queryFor, cardOf, COUNTRY_KEY), so a metric reads alike in both places.
 */

export type ExploreQuery = MetabaseQueryOptions<undefined> & DefinedQuery;
const QUERY_NAME: Record<ExploreKey, string> = {
  revenue: "ExploreRevenue",
  grossMargin: "ExploreGrossMargin",
  averageSellingPrice: "ExploreAverageSellingPrice",
  pumpkinsSold: "ExplorePumpkinsSold",
  lostSales: "ExploreLostSales",
  deliveryCost: "ExploreDeliveryCost",
  shrink: "ExploreShrink",
};
/** The static query `Explore<Key>` of a metric, or undefined while queries/live.query.ts does not have it. */
export const queryFor = (key: ExploreKey) => (queries as Record<string, unknown>)[QUERY_NAME[key]] as ExploreQuery | undefined;

export type ExploreProps = {
  /** Which metric. */
  k: ExploreKey;
  /** Closes the sheet (the page then returns focus to the label that opened it). */
  close: () => void;
};

/** How the metric's numbers read in the question (its result column is named after the metric). */
const NUMBERS: Record<ExploreKey, Record<string, unknown>> = {
  revenue: { number_style: "currency", currency: "USD", currency_style: "symbol", decimals: 0 },
  grossMargin: { number_style: "currency", currency: "USD", currency_style: "symbol", decimals: 0 },
  averageSellingPrice: { number_style: "currency", currency: "USD", currency_style: "symbol", decimals: 2 },
  pumpkinsSold: { number_style: "decimal", decimals: 0 },
  lostSales: { number_style: "currency", currency: "USD", currency_style: "symbol", decimals: 0 },
  deliveryCost: { number_style: "currency", currency: "USD", currency_style: "symbol", decimals: 0 },
  shrink: { number_style: "currency", currency: "USD", currency_style: "symbol", decimals: 0 },
};

/**
 * A line colour per country (by country_name, the breakout's values), so the phones' key can name them.
 * The chart gets hex in the theme the SDK loaded in (Metabase draws the lines itself; sdk-theme.css repaints
 * them after the switch); the key, drawn by the app, the same colours as CSS variables, so it follows too.
 */
const COUNTRY_TONE: Record<CountryCode, "plum" | "rose" | "olive" | "candle" | "pumpkin"> = { US: "plum", CA: "rose", GB: "olive", DE: "candle", JP: "pumpkin" };
const COUNTRY_COLOR = (code: CountryCode) => hexPalette(sdkLoadTheme)[COUNTRY_TONE[code]];
export const COUNTRY_KEY: LegendItem[] = COUNTRIES.map(c => ({ label: c.name, color: palette[COUNTRY_TONE[c.code]], shape: "dot" }));

/** The ad-hoc card: the query as a line chart, with this question's own formatting and no axis titles. */
export function cardOf(query: MetabaseQueryObject, k: ExploreKey, metric: string): MetabaseCard {
  return {
    query,
    visualization: "line",
    // The axis title switches (labels_enabled) are real chart settings the SDK's typed subset leaves out.
    visualizationSettings: {
      "graph.x_axis.labels_enabled": false,
      "graph.y_axis.labels_enabled": false,
      column_settings: { [JSON.stringify(["name", metric])]: NUMBERS[k], [JSON.stringify(["name", "local_date"])]: { date_abbreviate: true } },
      series_settings: Object.fromEntries(COUNTRIES.map(c => [c.name, { color: COUNTRY_COLOR(c.code) }])),
    } as NonNullable<Extract<MetabaseCard, { visualization: "line" }>["visualizationSettings"]>,
  };
}

/** Everything in the sheet that Tab can reach, in order. */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The sheet: title, "Open in Metabase ↗" (the Library metric), "Save in Metabase ↗" (the question as it is
 * now), close, and the question. Escape or a click outside closes it. It is modal: Tab and Shift+Tab wrap
 * around inside it (an edge stop sends focus to the other end).
 */
export function Explore({ k, close }: ExploreProps) {
  const sheetRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const { title, metric } = EXPLORE[k];
  const id = metricId(metric);
  const query = queryFor(k);
  const handle = useQuestionHandle();
  useEffect(() => { sheetRef.current?.focus({ preventScroll: true }); }, []);
  // Escape inside the question's own popovers (rendered elsewhere in the DOM) closes those, not the sheet.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !e.defaultPrevented && sheetRef.current?.contains(e.target as Node)) { e.stopPropagation(); close(); }
  };
  const wrapTo = (end: "first" | "last") => {
    const list = [...(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(el => el.getClientRects().length > 0);
    ((end === "first" ? list[0] : list[list.length - 1]) ?? sheetRef.current)?.focus();
  };
  return <div className="pd-explore">
    <button type="button" className="pd-explore-scrim" tabIndex={-1} aria-hidden="true" onClick={close}/>
    <span className="pd-sr" tabIndex={0} onFocus={() => wrapTo("last")}/>
    <section ref={sheetRef} className="pd-explore-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="pd-explore-head">
        <h2 id={titleId} className="pd-explore-title">{title}</h2>
        <div className="pd-explore-links">
          {id != null && <a className="pd-define-open" href={metricUrl(id)} target="_blank" rel="noopener" aria-label={`Open in Metabase: ${metric} (new tab)`}>Open in Metabase<span aria-hidden="true">↗</span></a>}
          {query && <SaveInMetabase handle={handle} className="pd-define-open"/>}
        </div>
        <button type="button" className="pd-explore-close" aria-label={`Close ${title}`} onClick={close}><Icon name="close" size={18} strokeWidth={2}/></button>
      </div>
      <div className="pd-explore-body">
        {query ? <ExploreQuestion query={query} k={k} metric={metric} title={title} handle={handle}/> : <PanelState state="error" message={`${title} cannot be explored yet`}/>}
      </div>
    </section>
    <span className="pd-sr" tabIndex={0} onFocus={() => wrapTo("first")}/>
  </div>;
}

/** The question itself: the static query resolved into a query object, then an InteractiveQuestion that cannot save. */
function ExploreQuestion({ query, k, metric, title, handle }: { query: ExploreQuery; k: ExploreKey; metric: string; title: string; handle: QuestionHandle }) {
  const { query: object, error, isLoading } = useMetabaseQueryObject(query);
  const card = useMemo(() => object ? cardOf(object, k, metric) : null, [object, k, metric]);
  // Once the question's editor opens (or it runs again), its lines may no longer be the countries: the key goes.
  const [edited, setEdited] = useState(false);
  const onClickCapture = (e: MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('button[aria-label="Edit question"]')) setEdited(true);
  };
  if (error) return <PanelState state="error" message={`Could not load ${title.toLowerCase()}`}/>;
  if (isLoading || !card) return <PanelState state="loading" chart minHeight={320}/>;
  return <QuestionFrame handle={handle} start={apiCard(card)} className={edited ? "pd-explore-q" : "pd-explore-q has-key"} onClickCapture={onClickCapture}>
    {!edited && <Legend className="pd-explore-key" items={COUNTRY_KEY}/>}
    <InteractiveQuestion card={card} isSaveEnabled={false} title={false} height="var(--pd-explore-q-h)" onRun={() => setEdited(true)}/>
  </QuestionFrame>;
}
