/*
 * The Halloween countdown in the sidebar, above the profile (Shell.tsx): a small illustrated card, a peach
 * evening with the moon, bats, hills and the haunted house (halloween/HalloweenScene.tsx), and the MetaBot
 * flying on bat wings in front of the moon (halloween/FlyingMetabot.tsx). Top left: the days to go, the hours,
 * minutes and seconds under them. Halloween starts at midnight on 31 Oct on the viewer's clock, the zone the
 * top clock reads in, and the time left is counted on that wall clock, so it always agrees with the top clock.
 * On 30 Oct the hours take the large line ("2 h 59 m", "58 s to midnight"); on 31 Oct the card says "Happy
 * Halloween" (two more pumpkins on the hill, and the MetaBot bounces); after it, and while the clock loads,
 * nothing.
 * The time is the simulated clock (sim_status), which only moves when it is polled (every 30 s), so the card
 * counts on from its readings at real pace, one tick per second on the second. Screen readers get one quiet
 * sentence, never the ticking seconds; the art is decorative.
 * Motion (declared in halloween.css, the loop played from here by useMotion): the MetaBot flies (bobs, flaps,
 * blinks), the bats flutter and the clouds drift; a mouse over the card or the MetaBot, or a tap, sends the
 * MetaBot round one loop. Under reduced motion, none of it. Styles: halloween.css.
 */
import { memo, useCallback, useEffect, useRef, useState } from "react";
import "./halloween.css";
import type { Clock } from "../types";
import { useViewerZone } from "../viewer";
import { FlyingMetabot } from "./halloween/FlyingMetabot";
import { HalloweenScene } from "./halloween/HalloweenScene";

/** Time left to Halloween, in whole units, or where the date stands: before 31 Oct, on it, or after it. */
export type HalloweenCountdown = { days: number; hours: number; minutes: number; seconds: number; state: "before" | "today" | "after" };

/** One formatter per zone (the card asks every second); an unknown zone reads as UTC. */
const FORMATS = new Map<string, Intl.DateTimeFormat>();
function formatIn(tz: string) {
  let f = FORMATS.get(tz);
  if (!f) {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" };
    try { f = new Intl.DateTimeFormat("en-US", { ...options, timeZone: tz }); } catch { f = new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }); }
    FORMATS.set(tz, f);
  }
  return f;
}
/** The wall clock in a zone at an instant. */
function wallClock(ms: number, tz: string) {
  const p: Record<string, number> = {};
  for (const part of formatIn(tz).formatToParts(ms)) if (part.type !== "literal") p[part.type] = Number(part.value);
  return { year: p.year, month: p.month, day: p.day, hour: p.hour % 24, minute: p.minute, second: p.second };
}

const DAY_S = 86400;

/**
 * How long until Halloween (00:00 on 31 Oct of `nowMs`'s year, in `tz`), on the wall clock: whole calendar
 * days to 30 Oct plus the time to local midnight, so the hours match the top clock (a DST change in between
 * moves both by the same hour). Rounds up to the second, so "before" never reads all zeros. On 31 Oct local:
 * "today"; from 1 Nov (or for an unreadable time): "after".
 */
export function untilHalloween(nowMs: number, tz: string): HalloweenCountdown {
  const zero = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (!Number.isFinite(nowMs)) return { ...zero, state: "after" };
  const { year, month, day, hour, minute, second } = wallClock(nowMs, tz);
  if (month === 10 && day === 31) return { ...zero, state: "today" };
  if (month > 10) return { ...zero, state: "after" };
  const daysToEve = Math.round((Date.UTC(year, 9, 30) - Date.UTC(year, month - 1, day)) / (DAY_S * 1000));
  const intoDay = hour * 3600 + minute * 60 + second + (((nowMs % 1000) + 1000) % 1000) / 1000;
  const left = Math.max(1, Math.ceil(daysToEve * DAY_S + DAY_S - intoDay));
  return { days: Math.floor(left / DAY_S), hours: Math.floor(left / 3600) % 24, minutes: Math.floor(left / 60) % 60, seconds: left % 60, state: "before" };
}

/**
 * The short form for a chip (the phone banner), in calendar days on the same clock as the card: "Halloween
 * in 26 days" (the card: 25 days and some hours), "Halloween tomorrow" (30 Oct), "Happy Halloween" (31 Oct);
 * undefined after it.
 */
export function halloweenChip({ days, state }: HalloweenCountdown): string | undefined {
  if (state === "after") return undefined;
  if (state === "today") return "Happy Halloween";
  return days === 0 ? "Halloween tomorrow" : `Halloween in ${days + 1} days`;
}

/** Where the count runs from: the simulated time `base` at the real time `at` (ms), and the reading it came from. */
type Anchor = { iso?: string; base: number; at: number };
/** A reading ahead of the count by more than this moves it on (the count lags by the poll's latency). */
const AHEAD_MS = 1000;
/** A reading behind the count by more than this is a real jump back (a shifted clock), not a slow poll. */
const BEHIND_MS = 15_000;

/**
 * A new reading. Each one was read on the server before its poll came back, so it trails the count by a
 * second or so: within that, the count keeps its anchor and never steps back. A reading well ahead (a
 * faster poll, a clock shifted forward) or far behind (shifted back) restarts the count from it.
 */
function reanchor(prev: Anchor, iso: string | undefined, at: number): Anchor {
  const reading = iso ? Date.parse(iso) : NaN;
  const drift = reading - (prev.base + (at - prev.at));
  return drift <= AHEAD_MS && drift >= -BEHIND_MS ? { ...prev, iso } : { iso, base: reading, at };
}

/**
 * The countdown at the simulated time now: the anchored reading plus the real time since. While counting
 * down it re-renders on each whole second of that time (one timeout at a time). Null while the clock loads.
 */
function useCountdown(iso: string | undefined, tz: string): HalloweenCountdown | null {
  const [now, setNow] = useState(() => Date.now());
  const [anchor, setAnchor] = useState<Anchor>(() => ({ iso, base: iso ? Date.parse(iso) : NaN, at: now }));
  // A new reading (state adjusted while rendering, not in an effect).
  if (anchor.iso !== iso) {
    const at = Date.now();
    setAnchor(reanchor(anchor, iso, at));
    setNow(at);
  }
  const sim = anchor.base + Math.max(0, now - anchor.at);
  const left = Number.isFinite(sim) ? untilHalloween(sim, tz) : null;
  const ticking = left?.state === "before";
  useEffect(() => {
    if (!ticking) return;
    const id = setTimeout(() => setNow(Date.now()), 1000 - (((sim % 1000) + 1000) % 1000) + 8);
    return () => clearTimeout(id);
  }, [ticking, sim]);
  return left;
}

const pad = (n: number) => String(n).padStart(2, "0");
const count = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}s`}`;

/** What a screen reader hears: whole days, or on the last day the hours. Steady, unlike the seconds on screen. */
function sentence({ days, hours }: HalloweenCountdown) {
  if (days > 0) return `${count(days, "day")} until Halloween`;
  return hours > 0 ? `${count(hours, "hour")} until Halloween, at midnight` : "Less than an hour until Halloween, at midnight";
}

/** A number and its unit, the number in lining tabular figures. */
type Part = [value: string | number, unit: string];

/**
 * The large line and the small line under it. From a day out: "26 days" over "03 h 12 m 29 s". On the last
 * day the hours move up: "2 h 59 m" over "58 s to midnight", then "42 m 07 s" over "to midnight".
 */
function lines({ days, hours, minutes, seconds }: HalloweenCountdown): { big: Part[]; small: Part[]; note?: string } {
  if (days > 0) return { big: [[days, days === 1 ? "day" : "days"]], small: [[pad(hours), "h"], [pad(minutes), "m"], [pad(seconds), "s"]] };
  if (hours > 0) return { big: [[hours, "h"], [pad(minutes), "m"]], small: [[pad(seconds), "s"]], note: "to midnight" };
  if (minutes > 0) return { big: [[minutes, "m"], [pad(seconds), "s"]], small: [], note: "to midnight" };
  return { big: [[seconds, "s"]], small: [], note: "to midnight" };
}

/** The loop's animations (the turn, and the whoosh hiding while it turns): paused at their start until played. */
const LOOP = new Set(["pd-halloween-spin", "pd-halloween-hush"]);
const nameOf = (a: Animation) => (a as CSSAnimation).animationName ?? "";

/**
 * Plays the card's motion. halloween.css declares all of it, and only where motion is welcome, so under
 * reduced motion the card has no animations and these do nothing. The idle flight loops on its own; `wake`
 * resumes any part that was paused, from where it is (its phase kept, so nothing jumps). `spin` (a pointer
 * coming over the card or the MetaBot, a tap) plays the loop from its start, unless one is running.
 * The loop is replayed on its own animations (Web Animations), not by toggling a class: no state to clear
 * when it ends, so a pointer arriving as one loop ends always gets a fresh one.
 */
function useMotion() {
  const ref = useRef<HTMLElement>(null);
  const wake = useCallback(() => {
    for (const a of ref.current?.getAnimations({ subtree: true }) ?? []) {
      const period = Number(a.effect?.getComputedTiming().duration);
      if (LOOP.has(nameOf(a)) || !(period > 0) || typeof a.currentTime !== "number") continue;
      const into = a.currentTime % period;
      a.currentTime = period - into < 1 ? 0 : into; // a finished part can hold its end a hair short of it
      a.play();
    }
  }, []);
  const spin = useCallback(() => {
    const loop = ref.current?.getAnimations({ subtree: true }).filter(a => LOOP.has(nameOf(a))) ?? [];
    if (!loop.length || loop.some(a => a.playState === "running")) return;
    for (const a of loop) { a.currentTime = 0; a.play(); }
    wake();
  }, [wake]);
  return { ref, spin };
}

/**
 * The art behind the countdown: the landscape, and the MetaBot in front of the moon (its bob on the outer
 * box, the loop on the inner one, so the two never fight). Decorative; memoised, so the second's tick
 * leaves it alone.
 */
const Art = memo(function Art({ patch, spin }: { patch: boolean; spin: () => void }) {
  return <>
    <HalloweenScene className="pd-halloween-scene" patch={patch}/>
    <div className="pd-halloween-flight" aria-hidden="true" onPointerEnter={spin}>
      <div className="pd-halloween-loop">
        <FlyingMetabot className="pd-halloween-bot"/>
      </div>
    </div>
  </>;
});

/**
 * The countdown card. `clock` is sim_status; without it (loading) and after Halloween the card renders nothing,
 * so the profile keeps the sidebar's foot to itself. The card keeps the light illustration in both themes
 * (pinned light inside; dimmed a little in dark, like the page banners).
 */
export function HalloweenCard({ clock }: { clock?: Clock }) {
  const left = useCountdown(clock?.now, useViewerZone());
  const { ref, spin } = useMotion();
  if (!left || left.state === "after") return null;

  if (left.state === "today") return <section ref={ref} className="pd-halloween is-today is-wide" aria-label="Halloween" onPointerEnter={spin}>
    <div className="pd-halloween-card" data-theme="light">
      <Art patch spin={spin}/>
      <div className="pd-halloween-body">
        <p className="pd-halloween-label">Today</p>
        <p className="pd-halloween-here"><span>Happy</span> <span>Halloween</span></p>
      </div>
    </div>
  </section>;

  const { big, small, note } = lines(left);
  // The last day's hours ("23 h 59 m") and three-figure days run wider: the MetaBot keeps clear, a little smaller.
  const wide = left.days === 0 || left.days >= 100;
  return <section ref={ref} className={`pd-halloween${wide ? " is-wide" : ""}`} aria-label="Countdown to Halloween" onPointerEnter={spin}>
    <div className="pd-halloween-card" data-theme="light">
      <Art patch={false} spin={spin}/>
      <div className="pd-halloween-body" aria-hidden="true">
        <p className="pd-halloween-label">Until Halloween</p>
        <p className="pd-halloween-big">{big.map(([n, unit]) => <span key={unit}><b>{n}</b><i>{unit}</i></span>)}</p>
        <p className="pd-halloween-timer">
          {small.map(([n, unit]) => <span key={unit}><b>{n}</b><i>{unit}</i></span>)}
          {note && <em>{note}</em>}
        </p>
      </div>
      <p className="pd-sr">{sentence(left)}</p>
    </div>
  </section>;
}
