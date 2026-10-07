import { Fragment, type ReactNode, useId, useState } from "react";
import "./explore.css";
import { Icon, PanelState, Pill } from "../components/ui";
import { EXPLORE, type ExploreKey, questionUrl } from "../definitions";
import type { PageProps } from "../types";

/*
 * Explore (/explore): Metabase's query builder inside the app, so Nobi can calculate and aggregate the data
 * his own way. A "Start from" row of pills picks what the question starts from: a new question (the notebook
 * editor with its data picker) or one of the Library metrics the Business page explores (by day and
 * country), which he can then regroup, filter, summarize and chart in the question's editor. Under it, the
 * question in one card, full width, in the app's theme (it follows the switch too:
 * src/pages/explore/sdk-theme.css). The card's head has "Save in Metabase ↗": the app cannot save a question
 * itself (ExploreQuestion.tsx SAVE_ENABLED), so the link opens the question as it is in Metabase, where Nobi
 * saves it to his collection.
 *
 * Presentational: the question and the link come from the live container (App.tsx) through `question` and
 * `saveLink`, which render src/pages/explore/ExploreQuestion.tsx, the only part that talks to the SDK. The
 * static preview passes neither and shows a placeholder in the question's place. Styles: explore.css.
 */

/**
 * Nobi's Metabase collection: "Nobi" (id 146, at the root of the instance's collections), made for this tab.
 * "Save in Metabase ↗" opens the question with it as its collection, so Metabase's own save form starts on
 * it. It is also where a save from the app would go, once Metabase lets a data app save.
 */
export const NOBI_COLLECTION_ID = 146;
/** Its name, for the line that confirms a save. */
const NOBI_COLLECTION_NAME = "Nobi";

/* ── View model ──────────────────────────────────────────── */

/** What a question starts from: a new question, or a Library metric by day and country (queries/live.query.ts Explore<Key>). */
export type ExploreStart = "new" | ExploreKey;
/** A question Nobi saved (the SDK's onSave): its card id, for the link to it in Metabase, and its name. */
export type SavedQuestion = { id: number; name: string };
/** Nothing to load up front: the page's data is the Metabase question itself. */
export type ExploreViewModel = Record<string, never>;
/** The page's own state: the start that is open, and the question saved from it (cleared on another start). */
export type ExploreState = { start: ExploreStart; saved: SavedQuestion | null };
/** Renders the question for a start; `onSaved` reports a save. Only the live app has one. */
export type ExploreQuestionRender = (start: ExploreStart, onSaved: (saved: SavedQuestion) => void) => ReactNode;

export type ExplorePageProps = PageProps<ExploreViewModel, ExploreState> & {
  /** The Metabase question (App.tsx). Without it (the static preview) a placeholder stands in. */
  question?: ExploreQuestionRender;
  /** "Save in Metabase ↗" for the question (App.tsx). */
  saveLink?: () => ReactNode;
};

/** "New question" first, then the metrics in the Business page's order. */
const STARTS: { value: ExploreStart; label: string }[] = [
  { value: "new", label: "New question" },
  ...(Object.keys(EXPLORE) as ExploreKey[]).map(key => ({ value: key, label: EXPLORE[key].title })),
];

/* ── Page ────────────────────────────────────────────────── */

export function ExplorePage({ initial, question, saveLink }: ExplorePageProps) {
  const [start, setStart] = useState<ExploreStart>(initial?.start ?? "new");
  const [saved, setSaved] = useState<SavedQuestion | null>(initial?.saved ?? null);
  const titleId = useId();
  const title = STARTS.find(s => s.value === start)?.label ?? "New question";
  const pick = (next: ExploreStart) => { if (next !== start) { setStart(next); setSaved(null); } };
  return <>
    <div className="pd-explore-start">
      <span className="pd-label" aria-hidden="true">Start from</span>
      <div className="pd-explore-start-pills" role="group" aria-label="Start from">
        {STARTS.map(s => <Pill key={s.value} pressed={s.value === start} onClick={() => pick(s.value)}>{s.label}</Pill>)}
      </div>
    </div>

    <section className="pd-explore-card" aria-labelledby={titleId}>
      <div className="pd-explore-card-head">
        <h2 id={titleId} className="pd-panel-title">{title}</h2>
        <div className="pd-explore-actions">
          {!saved && saveLink?.()}
          {/* Always in the page, so the confirmation is read out when it appears. */}
          <p className="pd-explore-saved" role="status">
            {saved && <>
              <span className="pd-explore-saved-note"><Icon name="check" size={15} strokeWidth={2.2}/>Saved to {NOBI_COLLECTION_NAME}</span>
              <a href={questionUrl(saved.id)} target="_blank" rel="noopener" aria-label={`Open ${saved.name} in Metabase (new tab)`}>Open in Metabase<span aria-hidden="true">↗</span></a>
            </>}
          </p>
        </div>
      </div>
      {/* Keyed by the start: another start is a new question. */}
      <div className="pd-explore-question">
        {question
          ? <Fragment key={start}>{question(start, setSaved)}</Fragment>
          : <PanelState state="loading" rows={9} message="The Metabase question loads in the live app"/>}
      </div>
    </section>
  </>;
}
