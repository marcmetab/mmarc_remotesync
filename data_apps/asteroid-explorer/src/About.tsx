import { type ReactNode, useEffect, useRef } from "react";

import { CloseApproaches, HazardousOrbitsBefore2008, HazardousOrbitsSince2008, NeoDetails, TorinoHistory } from "../queries/orbits.query";
import { PROSE, TYPED } from "./fonts";
import { INK, PLATE, RED, SLEEVE, SLEEVE_SHADOW } from "./palette";

const METABASE = "https://bob.metabaseapp.com";

// Every query the app runs is a saved question in Metabase; list them with links.
const QUESTIONS = [
  { def: HazardousOrbitsBefore2008, what: "Orbits of hazardous asteroids found before 2008" },
  { def: HazardousOrbitsSince2008, what: "Orbits of hazardous asteroids found since 2008" },
  { def: NeoDetails, what: "Size, risk and discovery details for one asteroid" },
  { def: CloseApproaches, what: "JPL's close passes for one asteroid" },
  { def: TorinoHistory, what: "Past Torino-scale ratings and removals" },
];
const questionId = (def: unknown) => (def as { savedQuestionSourceId?: number; source?: { savedQuestionSourceId?: number } }).savedQuestionSourceId
  ?? (def as { source?: { savedQuestionSourceId?: number } }).source?.savedQuestionSourceId;

const SOURCES = [
  { name: "JPL Small-Body Database", use: "Orbits, sizes and discovery details for all ~1.57 million known asteroids. The plate shows the 2,549 potentially hazardous ones.", refresh: "weekly" },
  { name: "JPL Sentry", use: "NASA's impact watch list: chance of hitting Earth, Torino and Palermo ratings.", refresh: "live, plus a daily snapshot so ratings build a history" },
  { name: "JPL close-approach data", use: "Every pass within 0.05 AU (about 19 Moon distances) of Earth, 1900–2200: the rings on the charts and the ticks on the time rail.", refresh: "daily" },
  { name: "Notable Torino cases", use: "A hand-made table of past alarms (Apophis, 2024 YR4…) from JPL and public reports.", refresh: "by hand" },
];

function H({ children }: { children: ReactNode }) {
  return <h3 style={{ margin: "6px 0 0", paddingTop: 14, borderTop: `1px solid ${SLEEVE.rule}`, fontFamily: TYPED, fontSize: 14, fontWeight: 700, color: INK }}>{children}</h3>;
}
const P = ({ children, soft }: { children: ReactNode; soft?: boolean }) => (
  <p style={{ margin: 0, fontSize: soft ? 14 : 15, lineHeight: 1.5, color: soft ? SLEEVE.textSoft : SLEEVE.text, textWrap: "pretty" }}>{children}</p>
);
const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ color: INK, textDecorationThickness: 1, textUnderlineOffset: 2 }}>{children}</a>
);

// The data's route from NASA to this page.
function Pipeline() {
  const steps = [
    ["NASA / JPL", "public APIs"],
    ["ClickHouse", "fetches & refreshes"],
    ["Metabase", "saved questions, credentials"],
    ["This data app", "3D, in your browser"],
  ];
  return (
    <ol aria-label="Where the data goes" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: 6 }}>
      {steps.map(([name, sub], k) => (
        <li key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "grid", padding: "6px 9px", border: `1px ${k === 2 ? "solid" : "dashed"} ${k === 2 ? INK : PLATE.graphite}`, borderRadius: 3, background: k === 2 ? PLATE.labelWash : "transparent" }}>
            <span style={{ fontFamily: TYPED, fontSize: 12.5, fontWeight: 700, color: INK }}>{name}</span>
            <span style={{ fontSize: 12, color: SLEEVE.textSoft }}>{sub}</span>
          </span>
          {k < steps.length - 1 && <span aria-hidden style={{ color: RED, fontFamily: TYPED }}>→</span>}
        </li>
      ))}
    </ol>
  );
}

export function About({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  return (
    <div role="presentation" onClick={onClose}
      style={{ position: "absolute", inset: 0, zIndex: 20, display: "grid", placeItems: "center", padding: 16, background: "rgba(20, 24, 40, 0.35)" }}>
      <div role="dialog" aria-modal="true" aria-labelledby="about-title" className="plate-sleeve"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        style={{ width: "min(640px, 100%)", maxHeight: "calc(100vh - 32px)", overflowY: "auto", display: "grid", gap: 10, padding: "22px 24px 24px", background: SLEEVE.stock, borderRadius: 4, boxShadow: SLEEVE_SHADOW, fontFamily: PROSE, color: SLEEVE.text }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <h2 id="about-title" style={{ margin: 0, fontFamily: TYPED, fontSize: 20, fontWeight: 700, color: INK }}>About this plate</h2>
          <button ref={closeRef} type="button" className="plate-remove" onClick={onClose} aria-label="Close"
            style={{ flex: "none", width: 30, height: 30, display: "grid", placeItems: "center", border: 0, borderRadius: 3, background: "transparent", color: SLEEVE.textSoft, cursor: "pointer" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
        <P>Everything here comes from NASA's Jet Propulsion Laboratory, queried through Metabase. Positions are then worked out in your browser from each orbit, so you can move through 50 years without asking the server again.</P>
        <Pipeline />

        <H>Where the data comes from</H>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
          {SOURCES.map((s) => (
            <li key={s.name} style={{ fontSize: 14.5, lineHeight: 1.45 }}>
              <strong style={{ fontFamily: TYPED, color: INK }}>{s.name}</strong>: {s.use} <span style={{ color: SLEEVE.textSoft }}>Refreshed {s.refresh}.</span>
            </li>
          ))}
        </ul>
        <P soft>ClickHouse Cloud reads the JPL APIs itself and keeps its tables fresh on a schedule, so there's no separate loader to run. Positions use a simple two-body orbit: within about 5,000 km of JPL's own figures on normal days, but they miss Earth's pull during very close passes, so Apophis in 2029 looks about twice as far as it really will be.</P>

        <H>What Metabase does</H>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6, fontSize: 14.5, lineHeight: 1.45 }}>
          <li><strong>One connection, no secrets in the page.</strong> The app never talks to ClickHouse directly: Metabase holds the database credentials and runs the queries; the page only ever receives results.</li>
          <li><strong>Every number is a Metabase question.</strong> The app's queries live in its code and are saved as questions in the “Data App: asteroid-explorer” collection, so anyone can open, explore or reuse them.</li>
          <li><strong>Queries fetched only when needed.</strong> Opening a sleeve runs three small filtered questions for that one asteroid instead of loading everything up front.</li>
          <li><strong>The same data, two ways.</strong> The <A href={`${METABASE}/dashboard/67`}>Asteroids dashboard</A> covers the live feed, the full catalogue and risk history with regular charts; this app is the hands-on 3D view.</li>
        </ul>

        <H>What Data Apps add</H>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6, fontSize: 14.5, lineHeight: 1.45 }}>
          <li><strong>Any interface, not just charts.</strong> A custom React app with a three.js 3D scene, sound and a guided tour, running inside Metabase next to its dashboards.</li>
          <li><strong>Shipped from Git.</strong> The code lives in a GitHub repository, changes go through pull requests, and Metabase serves the reviewed version at <span style={{ fontFamily: TYPED }}>/apps/asteroid-explorer</span>.</li>
          <li><strong>Safe to run.</strong> Apps run in a sandbox that can only reach data through Metabase.</li>
        </ul>

        <H>The questions behind this app</H>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4, fontSize: 14, lineHeight: 1.45 }}>
          {QUESTIONS.map((q) => {
            const id = questionId(q.def);
            return (
              <li key={q.what}>
                {id ? <A href={`${METABASE}/question/${id}`}>{q.what}</A> : q.what}
                {id ? <span style={{ fontFamily: TYPED, fontSize: 12, color: SLEEVE.textSoft }}> · question {id}</span> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
