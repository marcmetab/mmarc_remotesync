import { useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { HazardousOrbitsBefore2008, HazardousOrbitsSince2008 } from "../queries/orbits.query";
import { About } from "./About";
import { Ambient } from "./audio";
import { MetabotAstronaut } from "./MetabotAstronaut";
import { FONT_CSS, HAND, PROSE, TYPED } from "./fonts";
import { PLANETS, dateFromJd, distance, jdFromDate, planetElements, positionAt } from "./orbits";
import { INK, PLATE, SLEEVE, SLEEVE_SHADOW } from "./palette";
import { type FollowTarget, Scene, type SceneAsteroid, type SceneSelection, type ZoomRequest } from "./Scene";
import { MARKS, type Picked, Sleeves, displayName, elementsFromRow } from "./Sleeves";
import { THEMES, type ThemeName } from "./themes";
import { TOUR } from "./tour";
import { RailButton, type RailApproach, Segmented, TimeRail } from "./TimeRail";
import { fmt0, fmtDate, lunarDistances } from "./words";

const YEAR = 365.25;
// Close-up of a pass: follow Earth from ~15 Moon distances out, playing half a day per second.
const CLOSEUP_DISTANCE_AU = 0.04;
const CLOSEUP_DAYS_PER_SECOND = 0.5;
const CLOSEUP_LEAD_DAYS = 3;
// The date picker's range; planet positions come from JPL elements good for 1800-2050, fine a few decades past.
// Earth's easter egg: the other team's F1 data app, on the same Metabase.
const F1_URL = "https://bob.metabaseapp.com/apps/f1-race-telemetry/map";
const MIN_JD = jdFromDate(new Date("1900-01-01T00:00:00Z"));
const MAX_JD = jdFromDate(new Date("2100-12-31T00:00:00Z"));

// Browser surfaces (selection, focus, scrollbars, hover) themed from the plate's own inks.
const CSS = `
${FONT_CSS}
.plate-root ::selection { background: ${INK}; color: ${SLEEVE.stock}; }
.plate-root :focus-visible { outline: 2px solid ${INK}; outline-offset: 2px; }
.plate-root .plate-input::placeholder { color: ${SLEEVE.textSoft}; }
.plate-root .plate-input { caret-color: ${INK}; }
.plate-root .plate-button:hover:not([aria-pressed="true"]), .plate-root .plate-seg:hover { filter: brightness(1.08); }
.plate-root .plate-result:hover:not(:disabled), .plate-root .plate-remove:hover, .plate-root .plate-chip:hover:not([aria-pressed="true"]) { background: ${SLEEVE.stockEdge}; }
.plate-root .plate-result:disabled { opacity: 0.55; }
.plate-root .plate-dock { scrollbar-width: thin; scrollbar-color: ${PLATE.graphite} transparent; }
.plate-root .plate-dock > *, .plate-root .plate-toolbar { pointer-events: auto; }
.plate-root .plate-sleeve { animation: plate-sleeve-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.plate-root .plate-metabot { animation: plate-float 6s ease-in-out infinite; }
@keyframes plate-float { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-5px) rotate(3deg); } }
@keyframes plate-tour { from { width: 0; } to { width: 100%; } }
@keyframes plate-sleeve-in { from { opacity: 0; transform: translateX(28px); filter: blur(3px); } to { opacity: 1; transform: none; filter: none; } }
@media (prefers-reduced-motion: reduce) { .plate-root .plate-sleeve, .plate-root .plate-metabot { animation: none; } .plate-root .plate-odometer-strip { transition: none !important; } }
@media (max-width: 860px) {
  .plate-root { height: auto !important; overflow: visible !important; }
  .plate-root .plate-stage { position: relative !important; inset: auto !important; height: 64vh; }
  .plate-root .plate-rail-dock { top: calc(100% + 8px) !important; bottom: auto !important; left: 12px !important; right: 12px !important; }
  .plate-root .plate-dock { position: static !important; width: auto !important; max-height: none !important; overflow: visible !important; padding: 230px 12px 24px !important; }
  .plate-root .plate-year-minor { display: none; }
  .plate-root .plate-label { top: 12px !important; left: 14px !important; max-width: calc(100% - 28px) !important; }
  .plate-root .plate-label h1 { font-size: 30px !important; }
  .plate-root .plate-label .plate-metabot { width: 42px; height: 44px; }
  .plate-root .plate-label p { display: none; }
}
`;

export default function App() {
  const older = useMetabaseQuery(HazardousOrbitsBefore2008);
  const newer = useMetabaseQuery(HazardousOrbitsSince2008);
  const isLoading = older.isLoading || newer.isLoading;
  const error = older.error ?? newer.error;

  const asteroids = useMemo<SceneAsteroid[]>(
    () => [...(older.data?.rows ?? []), ...(newer.data?.rows ?? [])].map((r) => ({
      id: String(r.designation), name: displayName(r.full_name), el: elementsFromRow(r),
    })),
    [older.data, newer.data],
  );

  const [themeName, setThemeName] = useState<ThemeName>("sky");
  const theme = THEMES[themeName];

  // ---------------------------------------------------------------- time
  const todayJd = useMemo(() => jdFromDate(new Date()), []);
  const [baseJd, setBaseJd] = useState(todayJd);
  const [direction, setDirection] = useState<-1 | 0 | 1>(0);
  const [speedDays, setSpeedDays] = useState(30);
  const [blinking, setBlinking] = useState(false);
  const [blinkB, setBlinkB] = useState(false);
  const [blinkGap, setBlinkGap] = useState(30);
  const [blinkMs, setBlinkMs] = useState(520);
  const jd = baseJd + (blinking && blinkB ? blinkGap : 0);
  // A close-up plays at its own slow rate and stops a few days after the pass.
  const closeup = useRef<{ endJd: number } | null>(null);

  const baseRef = useRef(baseJd);
  baseRef.current = baseJd;
  const rate = closeup.current ? CLOSEUP_DAYS_PER_SECOND : speedDays;
  useEffect(() => {
    if (!direction) return;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const next = baseRef.current + direction * ((now - last) / 1000) * rate;
      last = now;
      const end = closeup.current?.endJd;
      if ((end && next >= end) || next > MAX_JD || next < MIN_JD) {
        closeup.current = null;
        return setDirection(0);
      }
      setBaseJd(next);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [direction, rate, todayJd]);

  useEffect(() => {
    if (!blinking) return setBlinkB(false);
    const t = setInterval(() => setBlinkB((b) => !b), blinkMs);
    return () => clearInterval(t);
  }, [blinking, blinkMs]);

  const setDate = (v: number) => {
    closeup.current = null;
    setDirection(0);
    setBaseJd(v);
  };

  // ---------------------------------------------------------------- selection
  const [picked, setPicked] = useState<Picked[]>([]);
  // Plate marks A-D, in the order asteroids were circled.
  const withMarks = useMemo(() => picked.map((p, k) => ({ ...p, mark: MARKS[k] })), [picked]);
  const add = useCallback((p: Picked) => setPicked((cur) => (cur.some((c) => c.id === p.id) || cur.length >= MARKS.length ? cur : [...cur, p])), []);

  const [passesById, setPassesById] = useState<Record<string, RailApproach[]>>({});
  const onPasses = useCallback((id: string, list: RailApproach[]) => setPassesById((cur) => ({ ...cur, [id]: list })), []);
  const railPasses = withMarks.flatMap((p) => (passesById[p.id] ?? []).map((a) => ({ ...a, mark: p.mark })))
    .filter((a) => a.jd >= todayJd - 20 * YEAR && a.jd <= todayJd + 30 * YEAR);

  // ---------------------------------------------------------------- camera
  const [follow, setFollow] = useState<FollowTarget>(null);
  const [zoom, setZoom] = useState<ZoomRequest>(null);
  const zoomTo = (distance: number) => setZoom({ distance, key: Math.random() });
  const centreOn = (target: FollowTarget) => {
    setFollow(target);
    zoomTo(target === null ? 4.2 : target === "planet:Earth" ? 0.12 : 0.08);
  };
  const remove = useCallback((id: string) => {
    setPicked((cur) => cur.filter((c) => c.id !== id));
    setFollow((f) => (f === `sel:${id}` ? null : f));
  }, []);
  // Watch a close pass: centre on Earth, move in until the Moon's orbit fills the view, and play through it.
  const watchPass = (pass: RailApproach, distance = CLOSEUP_DISTANCE_AU) => {
    setBlinking(false);
    setFollow("planet:Earth");
    zoomTo(distance);
    setBaseJd(pass.jd - CLOSEUP_LEAD_DAYS);
    closeup.current = { endJd: pass.jd + CLOSEUP_LEAD_DAYS };
    setDirection(1);
  };

  // ---------------------------------------------------------------- a chosen day
  // Picking a date (a birthday, say) names the hazardous asteroid that came closest to Earth that day.
  const [dayJd, setDayJd] = useState<number | null>(null);
  const pickDate = (v: number) => {
    setBlinking(false);
    setDate(v);
    setDayJd(v);
  };
  const onDay = dayJd != null && Math.abs(jd - dayJd) < 0.5 ? dayJd : null;
  const closestThatDay = useMemo(() => {
    if (onDay == null || !asteroids.length) return null;
    const earth = positionAt(planetElements(PLANETS[2], onDay), onDay);
    let best = asteroids[0], bestAu = Infinity;
    for (const a of asteroids) {
      const au = distance(positionAt(a.el, onDay), earth);
      if (au < bestAu) { best = a; bestAu = au; }
    }
    return { asteroid: best, ld: lunarDistances(bestAu) };
  }, [onDay, asteroids]);

  // ---------------------------------------------------------------- tour
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [tourPaused, setTourPaused] = useState(false);
  const showStop = (k: number) => {
    const stop = TOUR[k];
    const a = asteroids.find((x) => x.id === stop.id);
    setTourStep(k);
    if (!a) return;
    setPicked([a]);
    setBlinking(false);
    const at = stop.date ? jdFromDate(new Date(stop.date)) : todayJd;
    if (stop.kind === "watch") {
      watchPass({ mark: "A", jd: at, date: new Date(stop.date!), distLunar: 0 }, stop.zoom);
    } else {
      closeup.current = null;
      setFollow(`sel:${a.id}`);
      zoomTo(stop.zoom);
      setBaseJd(at);
      if (stop.play) setSpeedDays(stop.play);
      setDirection(stop.play ? 1 : 0);
    }
  };
  const endTour = () => {
    setTourStep(null);
    setTourPaused(false);
  };
  useEffect(() => {
    if (tourStep == null || tourPaused) return;
    const t = setTimeout(() => (tourStep + 1 < TOUR.length ? showStop(tourStep + 1) : endTour()), TOUR[tourStep].seconds * 1000);
    return () => clearTimeout(t);
    // showStop is recreated every render; the step and pause state are what matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep, tourPaused]);
  const stop = tourStep == null ? null : TOUR[tourStep];

  // ---------------------------------------------------------------- sound
  const [aboutOpen, setAboutOpen] = useState(false);
  // Clicking Earth up close offers a detour to the F1 app; going there dives into Earth first.
  const rootRef = useRef<HTMLDivElement>(null);
  const [earthMenu, setEarthMenu] = useState<{ x: number; y: number } | null>(null);
  const openEarthMenu = (cx: number, cy: number) => {
    const r = rootRef.current!.getBoundingClientRect();
    setEarthMenu({ x: Math.min(cx - r.left, r.width - 220), y: cy - r.top });
  };
  // The menu item is a real link opening a new tab: Metabase's app iframe may open tabs
  // (allow-popups) but not replace the page, and the sandbox blocks scripted navigation.
  // The dive plays here meanwhile, so coming back lands on Earth.
  const goWatchF1 = () => {
    setEarthMenu(null);
    endTour();
    setDirection(0);
    setFollow("planet:Earth");
    zoomTo(0.00025);
  };
  const [soundOn, setSoundOn] = useState(false);
  const ambient = useRef<Ambient | null>(null);
  const jdRef = useRef(jd);
  jdRef.current = jd;
  const soundInputs = useRef({ asteroids, withMarks });
  soundInputs.current = { asteroids, withMarks };
  const toggleSound = () => {
    if (ambient.current) {
      ambient.current.close();
      ambient.current = null;
      setSoundOn(false);
    } else {
      ambient.current = new Ambient(); // created inside the click, as browsers require
      setSoundOn(true);
    }
  };
  useEffect(() => {
    if (!soundOn) return;
    const t = setInterval(() => {
      const t0 = jdRef.current;
      const earth = positionAt(planetElements(PLANETS[2], t0), t0);
      let nearest = Infinity;
      for (const a of soundInputs.current.asteroids) nearest = Math.min(nearest, distance(positionAt(a.el, t0), earth));
      const circled = soundInputs.current.withMarks.map((p) => lunarDistances(distance(positionAt(p.el, t0), earth)));
      ambient.current?.update(lunarDistances(nearest), circled);
    }, 200);
    return () => clearInterval(t);
  }, [soundOn]);
  useEffect(() => () => ambient.current?.close(), []);

  // ---------------------------------------------------------------- layout
  const selection: SceneSelection[] = withMarks;
  const stamp = fmtDate(dateFromJd(jd));
  // Sleeves float over the plate on wide screens only; on narrow ones they stack below it.
  const [wide, setWide] = useState(() => window.innerWidth > 860);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth > 860);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const sleevesOpen = wide && picked.length > 0;
  const followOptions: { label: string; value: string }[] = [
    { label: "Sun", value: "sun" },
    { label: "Earth", value: "planet:Earth" },
    ...withMarks.map((p) => ({ label: p.mark, value: `sel:${p.id}` })),
  ];

  return (
    <div
      className="plate-root" ref={rootRef}
      style={{ position: "relative", height: "100vh", overflow: "hidden", background: theme.background, fontFamily: PROSE, color: SLEEVE.text, transition: "background 400ms" }}
    >
      <style>{CSS}</style>

      <main className="plate-stage" style={{ position: "absolute", inset: 0 }} onPointerDownCapture={() => earthMenu && setEarthMenu(null)}>
        <Scene
          theme={theme} asteroids={asteroids} selected={selection} jd={jd}
          blinkFromJd={blinking ? baseJd : null} blinkGapDays={blinkGap} rightInset={sleevesOpen ? 432 : 0}
          follow={follow} zoom={zoom} onPick={(a) => { setEarthMenu(null); add(a); }} onEarthClick={openEarthMenu}
        />

        {/* The observer's lettering, written straight onto the glass. */}
        <header className="plate-label" style={{ position: "absolute", top: 16, left: 26, maxWidth: "min(560px, calc(100% - 460px))", pointerEvents: "none", display: "grid", gap: 4 }}>
          <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, fontFamily: HAND, fontSize: 46, fontWeight: 400, lineHeight: 1.1, color: theme.text }}>
            <MetabotAstronaut size={64} />
            Asteroid Explorer
          </h1>
          <span aria-live={direction || blinking ? "off" : "polite"} style={{ justifySelf: "start", fontFamily: TYPED, fontSize: 14.5, letterSpacing: "0.03em", color: theme.text, background: theme.labelWash, padding: "0 4px" }}>
            {blinking ? `${blinkB ? "B" : "A"} · ` : ""}{themeName === "plate" ? "Plate of" : "Sky on"} {stamp}
          </span>
          {closestThatDay && (
            <div className="plate-toolbar" aria-live="polite"
              style={{ justifySelf: "start", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px", marginTop: 2, padding: "6px 10px", background: SLEEVE.stock, borderRadius: 3, fontSize: 14, color: SLEEVE.text }}>
              <span>
                On {stamp}, the closest hazardous asteroid was <strong style={{ fontFamily: TYPED, color: INK }}>{closestThatDay.asteroid.name}</strong>,{" "}
                {closestThatDay.ld < 10 ? closestThatDay.ld.toFixed(1) : fmt0(closestThatDay.ld)}× the Moon's distance from Earth.
              </span>
              {!picked.some((p) => p.id === closestThatDay.asteroid.id) && (
                <button type="button" className="plate-chip" onClick={() => add(closestThatDay.asteroid)}
                  style={{ height: 26, padding: "0 9px", border: `1px solid ${INK}`, borderRadius: 3, background: "transparent", color: INK, fontFamily: TYPED, fontSize: 12, cursor: "pointer" }}>
                  Circle it
                </button>
              )}
            </div>
          )}
          <p style={{ margin: "4px 0 0", maxWidth: "50ch", fontSize: 14.5, lineHeight: 1.55, color: theme.textSoft }}>
            <span style={{ background: theme.labelWash, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "1px 4px" }}>
              {error
                ? "Couldn't load orbits from Metabase. Refresh the page to try again."
                : isLoading
                  ? "Developing the plate…"
                  : themeName === "plate"
                    ? `${fmt0(asteroids.length)} potentially hazardous asteroids, printed like a glass negative: each dark speck is one asteroid, the dark disc is the Sun.`
                    : `${fmt0(asteroids.length)} potentially hazardous asteroids, each point of light is one. Planets in their own colours, not to scale.`}
            </span>
          </p>
          <div className="plate-toolbar" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px", marginTop: 6 }}>
            <Segmented theme={theme} label="View" value={themeName} onChange={setThemeName}
              options={[{ label: "Plate", value: "plate" as ThemeName }, { label: "Sky", value: "sky" as ThemeName }]} />
            <Segmented theme={theme} label="Centre" value={follow ?? "sun"} onChange={(v) => centreOn(v === "sun" ? null : v)} options={followOptions} />
            <RailButton theme={theme} label="About the data: where it comes from and how Metabase serves it" pressed={aboutOpen} onClick={() => setAboutOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden style={{ display: "block" }}>
                <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 6v4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="7" cy="4" r="0.9" fill="currentColor" />
              </svg>
              ABOUT
            </RailButton>
            <RailButton theme={theme} label={stop ? "End the tour" : "Take a guided tour of notable asteroids"} pressed={!!stop} onClick={() => (stop ? endTour() : showStop(0))}>
              {stop ? "END TOUR" : "TOUR"}
            </RailButton>
            <RailButton theme={theme} label={soundOn ? "Turn sound off" : "Turn on ambient sound: it rises as asteroids near Earth"} pressed={soundOn} onClick={toggleSound}>
              <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden style={{ display: "block" }}>
                <path d="M1.5 5h2.8L8 2v10L4.3 9H1.5z" fill="currentColor" />
                {soundOn
                  ? <path d="M10.3 4.6a3.4 3.4 0 0 1 0 4.8M12.3 2.8a6 6 0 0 1 0 8.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  : <path d="M10.5 5l4 4M14.5 5l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
              </svg>
            </RailButton>
          </div>
          {stop && tourStep != null && (
            <div className="plate-toolbar" role="region" aria-label="Tour" aria-live="polite"
              style={{ marginTop: 10, maxWidth: 440, padding: "12px 14px", background: SLEEVE.stock, borderRadius: 4, color: SLEEVE.text, display: "grid", gap: 6 }}>
              <div style={{ fontFamily: TYPED, fontSize: 12, color: SLEEVE.textSoft }}>Tour · stop {tourStep + 1} of {TOUR.length}</div>
              <h2 style={{ margin: 0, fontFamily: TYPED, fontSize: 18, fontWeight: 700, color: INK }}>{stop.title}</h2>
              <div style={{ fontSize: 14.5, lineHeight: 1.45, textWrap: "pretty" }}>{stop.text}</div>
              <div style={{ height: 2, background: SLEEVE.rule, overflow: "hidden" }}>
                <div key={`${tourStep}-${tourPaused}`} className="plate-tour-bar"
                  style={{ height: "100%", background: INK, animation: tourPaused ? "none" : `plate-tour ${stop.seconds}s linear both` }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { label: "Back", disabled: tourStep === 0, onClick: () => showStop(tourStep - 1) },
                  { label: tourPaused ? "Resume" : "Pause", onClick: () => setTourPaused((v) => !v) },
                  { label: tourStep + 1 < TOUR.length ? "Next" : "Finish", onClick: () => (tourStep + 1 < TOUR.length ? showStop(tourStep + 1) : endTour()) },
                ].map((b) => (
                  <button key={b.label} type="button" className="plate-chip" disabled={b.disabled} onClick={b.onClick}
                    style={{ height: 28, padding: "0 10px", border: `1px solid ${INK}`, borderRadius: 3, background: "transparent", color: INK, fontFamily: TYPED, fontSize: 12.5, cursor: b.disabled ? "default" : "pointer", opacity: b.disabled ? 0.4 : 1 }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="plate-rail-dock" style={{ position: "absolute", left: 26, right: 440, bottom: 16 }}>
          <TimeRail
            theme={theme} jd={jd} todayJd={todayJd} onChange={setDate} onPickDate={pickDate}
            direction={direction} onPlay={(d) => { closeup.current = null; setDirection(d); }}
            speedDays={speedDays} onSpeed={setSpeedDays}
            blinking={blinking} onToggleBlink={() => setBlinking((b) => !b)}
            blinkGap={blinkGap} onBlinkGap={setBlinkGap} blinkMs={blinkMs} onBlinkMs={setBlinkMs}
            approaches={railPasses}
          />
        </div>
      </main>

      {/* Sleeves float over the plate's right edge; with nothing circled, only the lookup shows. */}
      <div className="plate-dock" style={{ position: "absolute", top: 16, right: 16, bottom: 16, width: 400, overflowY: "auto", pointerEvents: "none", padding: "2px 4px 12px" }}>
        <Sleeves
          picked={withMarks} jd={jd} todayJd={todayJd} plateDate={fmtDate(dateFromJd(jd))}
          follow={follow} onFollow={(id) => centreOn(follow === `sel:${id}` ? null : `sel:${id}`)} onWatch={(_, pass) => watchPass(pass)} onJump={setDate} onTour={() => showStop(0)}
          onAdd={add} onRemove={remove} onPasses={onPasses}
        />
      </div>

      {earthMenu && (
        <div role="menu" aria-label="Earth"
          onKeyDown={(e) => e.key === "Escape" && setEarthMenu(null)}
          style={{ position: "absolute", left: earthMenu.x, top: earthMenu.y + 8, zIndex: 15, minWidth: 200, padding: 4, background: SLEEVE.stock, borderRadius: 4, boxShadow: SLEEVE_SHADOW, fontFamily: TYPED }}>
          <div style={{ padding: "4px 10px 2px", fontSize: 11.5, color: SLEEVE.textSoft }}>Earth</div>
          <a href={F1_URL} target="_blank" rel="noopener" role="menuitem" className="plate-result" autoFocus onClick={goWatchF1}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 3, color: INK, fontFamily: TYPED, fontSize: 13.5, textDecoration: "none" }}>
            <span aria-hidden>🏁</span> Let's go watch F1 <span aria-hidden style={{ marginLeft: "auto", color: SLEEVE.textSoft }}>↗</span>
          </a>
          <button type="button" role="menuitem" className="plate-result" onClick={() => setEarthMenu(null)}
            style={{ display: "block", width: "100%", padding: "6px 10px", border: 0, borderRadius: 3, background: "transparent", color: SLEEVE.textSoft, fontFamily: TYPED, fontSize: 12.5, textAlign: "left", cursor: "pointer" }}>
            Stay in orbit
          </button>
        </div>
      )}

      {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
    </div>
  );
}
