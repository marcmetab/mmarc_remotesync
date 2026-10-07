import { InteractiveQuestion, type MetabaseQuestion } from "@metabase/embedding-sdk-react";
import { useMetabaseQueryObject } from "@metabase/embedding-sdk-react/data-app";
import { type MouseEvent, useMemo, useState } from "react";
import { Legend, PanelState } from "../../components/ui";
import { EXPLORE, type ExploreKey } from "../../definitions";
import { cardOf, COUNTRY_KEY, type ExploreQuery, queryFor } from "../business/Explore";
import { type ExploreStart, NOBI_COLLECTION_ID, type SavedQuestion } from "../ExplorePage";
import { apiCard, QuestionFrame, type QuestionHandle, SaveInMetabase } from "./QuestionFrame";

/*
 * The Explore tab's question and its "Save in Metabase ↗" link (ExplorePage renders them through its
 * `question` and `saveLink` props; only App.tsx supplies them, the static preview never loads this file).
 * The two share a frame (QuestionFrame): the question renders in it, the link reads the question from it.
 *
 *   New question  InteractiveQuestion questionId="new": the notebook editor, opening on its data picker. The
 *                 SDK's picker goes database → schema → table (postgres → Pumpkin Live → Daily Store Sales);
 *                 unlike Metabase's own, it has no Library section, and its entity types are table, model and
 *                 question only (no metric). It offers tables only here (entityTypes), so the app's saved
 *                 questions stay out of it. The Library metrics come in at the summarize step, under
 *                 "Metrics": the metrics of the table picked (daily_store_sales: Revenue, Gross margin…).
 *   A metric      the static query Explore<Key> (queries/live.query.ts: the Library metric by day and
 *                 country), resolved with useMetabaseQueryObject into the same ad-hoc card the Business
 *                 page's Explore sheet shows (business/Explore.tsx: a line per country, the metric's own
 *                 number format). Its editor regroups, filters, summarizes and charts it from there.
 *
 * The question follows the app's theme (QuestionFrame, sdk-theme.css). Its height is --pd-explore-h
 * (explore.css), set on the card around it.
 */

const HEIGHT = "var(--pd-explore-h)";

/**
 * Whether the question shows Metabase's Save button. Off: Metabase refuses to save a question from a data
 * app. Every SDK request from a data app carries the data-app client headers, which give it an app-scoped
 * token, and POST /api/card answers 403 "Scoped tokens cannot access this endpoint" (scope_not_permitted),
 * so the save form only ever showed that error. Checked on this instance (v0.64.0-alpha.4 SDK), with the
 * API key alone allowed to write to the collection. Saving goes through "Save in Metabase ↗" instead (the
 * question opens in Metabase, where Nobi saves it). When Metabase lets a data app save, turn this on and a
 * save lands in NOBI_COLLECTION_ID, and the card says so with a link to it.
 */
const SAVE_ENABLED = false;

export type ExploreQuestionProps = {
  start: ExploreStart;
  /** A save landed: the saved question's id and name. */
  onSaved: (saved: SavedQuestion) => void;
  /** The question's frame, shared with ExploreSaveLink. */
  handle: QuestionHandle;
};

export function ExploreQuestion({ start, onSaved, handle }: ExploreQuestionProps) {
  const onSave = (question: MetabaseQuestion) => onSaved({ id: question.id, name: question.name });
  if (start === "new") {
    return <QuestionFrame handle={handle}>
      <InteractiveQuestion questionId="new" entityTypes={["table"]} isSaveEnabled={SAVE_ENABLED} targetCollection={NOBI_COLLECTION_ID} onSave={onSave} title={false} height={HEIGHT}/>
    </QuestionFrame>;
  }
  const query = queryFor(start);
  if (!query) return <PanelState state="error" message={`${EXPLORE[start].title} cannot be explored yet`}/>;
  return <MetricQuestion k={start} query={query} onSave={onSave} handle={handle}/>;
}

/**
 * One Library metric by day and country. Under 400px Metabase leaves out the legend of a five-line chart, so
 * phones get the countries' key above it, until the question's editor opens (its lines may then no longer
 * be the countries; see business/Explore.tsx).
 */
function MetricQuestion({ k, query, onSave, handle }: { k: ExploreKey; query: ExploreQuery; onSave: (question: MetabaseQuestion) => void; handle: QuestionHandle }) {
  const { title, metric } = EXPLORE[k];
  const { query: object, error, isLoading } = useMetabaseQueryObject(query);
  const card = useMemo(() => object ? cardOf(object, k, metric) : null, [object, k, metric]);
  const [edited, setEdited] = useState(false);
  const onClickCapture = (e: MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('button[aria-label="Edit question"]')) setEdited(true);
  };
  if (error) return <PanelState state="error" message={`Could not load ${title.toLowerCase()}`}/>;
  if (isLoading || !card) return <div className="pd-explore-pending" style={{ height: HEIGHT }}><PanelState state="loading" chart/></div>;
  return <QuestionFrame handle={handle} start={apiCard(card)} className={edited ? "pd-explore-metric" : "pd-explore-metric has-key"} onClickCapture={onClickCapture}>
    {!edited && <Legend className="pd-explore-countries" items={COUNTRY_KEY}/>}
    <InteractiveQuestion card={card} isSaveEnabled={SAVE_ENABLED} targetCollection={NOBI_COLLECTION_ID} onSave={onSave} onRun={() => setEdited(true)} title={false} height={HEIGHT}/>
  </QuestionFrame>;
}

/** "Save in Metabase ↗" for the question in the handle's frame. */
export function ExploreSaveLink({ handle }: { handle: QuestionHandle }) {
  return <SaveInMetabase handle={handle} className="pd-explore-savelink"/>;
}
