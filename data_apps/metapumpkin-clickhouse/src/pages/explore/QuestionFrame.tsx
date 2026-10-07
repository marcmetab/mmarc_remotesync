import type { MetabaseCard } from "@metabase/embedding-sdk-react";
import { type MouseEvent, type ReactNode, useRef, useState } from "react";
import { INSTANCE_URL } from "../../metrics.generated";
import { chartColors, sdkLoadTheme } from "../../theme";
import { NOBI_COLLECTION_ID } from "../ExplorePage";
import "./sdk-theme.css";

/*
 * Two live-only pieces around a Metabase question. Neither imports the SDK; ExploreQuestion.tsx (the
 * Explore tab) and business/Explore.tsx (the Explore sheet) put them around InteractiveQuestion.
 *
 *   QuestionFrame    The element around a question. It carries the theme the SDK loaded in (data-sdk-theme,
 *                    theme.ts sdkLoadTheme), so sdk-theme.css can repaint the question in the other theme when
 *                    the in-app switch moves away from it. It fills a QuestionHandle (its element and the
 *                    card the question starts from), which the link reads.
 *   SaveInMetabase   "Save in Metabase ↗": opens the question as it is now, with every edit, in full Metabase
 *                    as an unsaved question, where Nobi saves it to his collection himself. Saving from the
 *                    app is refused by Metabase (ExploreQuestion.tsx SAVE_ENABLED).
 */

/** A Metabase card as its API and its /question#… links have it (only the parts a link carries). */
export type QuestionCard = {
  dataset_query: unknown;
  display?: string;
  visualization_settings?: Record<string, unknown>;
  [key: string]: unknown;
};

/** What a frame shares with its link: its element (the question is read from it) and the card it starts from. */
export type QuestionHandle = { el: HTMLDivElement | null; start: QuestionCard | null };
/** A handle for one frame and its link, made where both are rendered. */
export const useQuestionHandle = (): QuestionHandle => useRef<QuestionHandle>({ el: null, start: null }).current;

/** A question card as the SDK's `card` prop has it, as the API (and a link) has it. */
export const apiCard = (card: MetabaseCard): QuestionCard =>
  ({ dataset_query: card.query, display: card.visualization, visualization_settings: card.visualizationSettings as Record<string, unknown> | undefined });

export type QuestionFrameProps = {
  /** Filled with the frame's element and `start`, for SaveInMetabase. */
  handle?: QuestionHandle;
  /** The card the question starts from (none for a new question). */
  start?: QuestionCard | null;
  className?: string;
  onClickCapture?: (e: MouseEvent) => void;
  children: ReactNode;
};

export function QuestionFrame({ handle, start = null, className, onClickCapture, children }: QuestionFrameProps) {
  const ref = (el: HTMLDivElement | null) => { if (handle) { handle.el = el; handle.start = el ? start : null; } };
  return <div ref={ref} className={className ? `pd-mb ${className}` : "pd-mb"} data-sdk-theme={sdkLoadTheme} onClickCapture={onClickCapture}>{children}</div>;
}

/* ── The question as it is now ───────────────────────────── */

/** The parts of a React fiber the walk reads. */
type Fiber = { child?: Fiber | null; sibling?: Fiber | null; memoizedProps?: { value?: { question?: { card?: () => QuestionCard } } } | null };

/**
 * The question inside a frame, as a card. The SDK has no public way to read the question being edited (onRun
 * hands over only its id and name), so this reads it where InteractiveQuestion keeps it: the value of its
 * question context, found by walking React's fiber tree down from the frame (the context value holds a
 * Metabase Question, whose card() is the card with its query, chart type and chart settings). Null when it
 * cannot be found (the SDK's insides changed, or the question has not loaded): the link then falls back.
 */
function currentCard(el: HTMLElement | null): QuestionCard | null {
  if (!el) return null;
  try {
    const key = Object.keys(el).find(k => k.startsWith("__reactFiber$"));
    const root = key ? (el as unknown as Record<string, Fiber | undefined>)[key] : undefined;
    const queue: Fiber[] = root?.child ? [root.child] : [];
    for (let seen = 0; queue.length > 0 && seen < 5000; seen++) {
      const fiber = queue.shift()!;
      const question = fiber.memoizedProps?.value?.question;
      if (question && typeof question.card === "function") return question.card();
      if (fiber.child) queue.push(fiber.child);
      if (fiber.sibling) queue.push(fiber.sibling);
    }
  } catch { /* not readable: fall back */ }
  return null;
}

/** Dusk series colours back to their Golden Hour originals, for a question that will live in Metabase. */
const DUSK_TO_LIGHT = chartColors("dark").map((dusk, i) => [dusk, chartColors("light")[i]] as const).filter(([dusk, light]) => dusk !== light);

/**
 * The /question#… link Metabase opens an unsaved question from (as in this instance's frontend: the card's
 * JSON as UTF-8, in base64 with + and / made URL-safe). It carries the query, the chart type, locked
 * (displayIsLocked, as Metabase's own links do: otherwise Metabase picks its default chart for the result),
 * the chart's settings, and Nobi's collection, which Metabase's save form then starts on. Null when the
 * card has no data yet (a new question with nothing picked).
 */
export function questionLink(card: QuestionCard): string | null {
  const query = card.dataset_query as { database?: unknown } | null | undefined;
  if (query == null || query.database == null) return null;
  let json = JSON.stringify({
    dataset_query: card.dataset_query, display: card.display ?? "table", displayIsLocked: true,
    visualization_settings: card.visualization_settings ?? {}, type: "question", collection_id: NOBI_COLLECTION_ID,
  });
  if (sdkLoadTheme === "dark") for (const [dusk, light] of DUSK_TO_LIGHT) json = json.replace(new RegExp(dusk, "gi"), light);
  let binary = "";
  for (const byte of new TextEncoder().encode(json)) binary += String.fromCharCode(byte);
  return `${INSTANCE_URL}/question#${btoa(binary).replace(/\+/g, "-").replace(/\//g, "_")}`;
}

/** A new question in Metabase's own editor: where the link goes while the question has no data. */
export const NEW_QUESTION_URL = `${INSTANCE_URL}/question/notebook`;

export type SaveInMetabaseProps = {
  /** The frame's handle (QuestionFrame's `handle`). */
  handle: QuestionHandle;
  className?: string;
};

/**
 * "Save in Metabase ↗": a plain link (the sandbox opens nothing itself) whose href is refreshed from the
 * question right before it can be used: on pointer down, hover and focus, so Enter, a click, a middle click
 * and "open in new tab" all take the question as it is then. Until the live question can be read it links
 * the card the frame starts from, or a new question in Metabase.
 */
export function SaveInMetabase({ handle, className }: SaveInMetabaseProps) {
  const [href, setHref] = useState(NEW_QUESTION_URL);
  const refresh = () => {
    const card = currentCard(handle.el) ?? handle.start;
    setHref((card && questionLink(card)) ?? (handle.start && questionLink(handle.start)) ?? NEW_QUESTION_URL);
  };
  return <a className={className} href={href} target="_blank" rel="noopener" onPointerDown={refresh} onMouseEnter={refresh} onFocus={refresh}
    aria-label="Save in Metabase: opens this question in Metabase (new tab)">
    {/* A save mark (a disk) and the words; the label says it opens in a new tab. */}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6"/></svg>
    <span>Save in Metabase</span>
  </a>;
}
