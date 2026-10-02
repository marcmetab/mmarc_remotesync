import { filter, useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";
import { type PointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { CloseApproaches, NeoDetails, TorinoHistory } from "../queries/orbits.query";
import { PROSE, TYPED } from "./fonts";
import { type OrbitalElements, PLANETS, dateFromJd, distance, jdFromDate, planetElements, positionAt } from "./orbits";
import { INK, PLATE, RED, SLEEVE, SLEEVE_SHADOW } from "./palette";
import type { RailApproach } from "./TimeRail";
import {
  ORBIT_CLASS_WORDS, diameterFromH, distanceWords, fmt0, fmt1, fmt2, fmtDate, lunarDistances, oddsWords, palermoWords, sizeWords,
} from "./words";

export type Picked = { id: string; name: string; el: OrbitalElements };

export function elementsFromRow(r: {
  a_au: unknown; e: unknown; i_deg: unknown; node_deg: unknown; peri_deg: unknown;
  mean_anomaly_deg: unknown; mean_motion_deg_day: unknown; epoch_jd: unknown;
}): OrbitalElements {
  return {
    a: Number(r.a_au), e: Number(r.e), i: Number(r.i_deg), node: Number(r.node_deg), peri: Number(r.peri_deg),
    meanAnomaly: Number(r.mean_anomaly_deg), meanMotion: Number(r.mean_motion_deg_day), epochJd: Number(r.epoch_jd),
  };
}

export const displayName = (fullName: unknown) => String(fullName ?? "").trim().replace(/^\((.*)\)$/, "$1");

// Typed search terms: names are capitalized ("Apophis"), provisional designations upper-case ("2024 YR4").
function normalizeTerm(t: string) {
  const s = t.trim();
  return /\d/.test(s) ? s.toUpperCase() : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const SUGGESTIONS = ["Apophis", "Bennu", "Didymos", "2024 YR4", "Toutatis"];

const earthAt = (jd: number) => positionAt(planetElements(PLANETS[2], jd), jd);

// ---------------------------------------------------------------- search

function Search({ onPick, full }: { onPick: (p: Picked) => void; full: boolean }) {
  const [text, setText] = useState("");
  const [term, setTerm] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setTerm(text.trim().length >= 2 ? normalizeTerm(text) : ""), 250);
    return () => clearTimeout(t);
  }, [text]);
  const { data, isLoading, error } = useMetabaseQuery(NeoDetails, {
    filters: [filter(NeoDetails.source.fields.fullName, "contains", term)],
    limit: 6,
    enabled: term !== "",
  });
  const rows = term ? data?.rows ?? [] : [];

  return (
    <div className="plate-search" style={{ display: "grid", gap: 10, padding: "14px 16px 16px", background: SLEEVE.stock, borderRadius: 4, boxShadow: SLEEVE_SHADOW }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontFamily: TYPED, fontSize: 13, fontWeight: 700, color: INK }}>Look up any near-Earth asteroid</span>
        <input
          className="plate-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Name or designation"
          style={{ height: 38, padding: "0 12px", border: `1px solid ${SLEEVE.rule}`, borderRadius: 3, background: "#fffdf7", color: SLEEVE.text, fontFamily: PROSE, fontSize: 15 }}
        />
      </label>
      {!term && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="plate-chip" onClick={() => setText(s)}
              style={{ padding: "4px 10px", border: `1px dashed ${PLATE.graphite}`, borderRadius: 3, background: "transparent", color: INK, fontFamily: TYPED, fontSize: 12, cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>
      )}
      {term && (
        <div role="list" style={{ display: "grid", gap: 2 }}>
          {isLoading && <div style={{ fontSize: 14, color: SLEEVE.textSoft }}>Searching…</div>}
          {error ? <div style={{ fontSize: 14, color: SLEEVE.text }}>Search failed. Check your connection and try again.</div> : null}
          {!isLoading && !error && rows.length === 0 && (
            <div style={{ fontSize: 14, color: SLEEVE.textSoft }}>No near-Earth asteroid matches “{text.trim()}”.</div>
          )}
          {rows.map((r) => (
            <button
              key={String(r.designation)} type="button" role="listitem" className="plate-result" disabled={full}
              onClick={() => { onPick({ id: String(r.designation), name: displayName(r.full_name), el: elementsFromRow(r) }); setText(""); }}
              style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 10px", border: 0, borderRadius: 3, background: "transparent", textAlign: "left", cursor: full ? "not-allowed" : "pointer", color: SLEEVE.text }}
            >
              <span style={{ fontFamily: TYPED, fontSize: 14 }}>{displayName(r.full_name)}</span>
              <span style={{ fontSize: 13, color: SLEEVE.textSoft }}>{Number(r.is_pha) ? "potentially hazardous" : "near-Earth"}</span>
            </button>
          ))}
          {full && rows.length > 0 && <div style={{ fontSize: 13, color: SLEEVE.textSoft }}>Four asteroids are circled. Remove one to add another.</div>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- rolling counter

function Odometer({ value }: { value: string }) {
  return (
    <span aria-label={value} style={{ display: "inline-flex", fontFamily: TYPED, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
      {value.split("").map((ch, k) =>
        /\d/.test(ch) ? (
          <span key={k} aria-hidden style={{ display: "inline-block", height: "1em", overflow: "hidden" }}>
            <span className="plate-odometer-strip" style={{ display: "block", transform: `translateY(${-Number(ch)}em)`, transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
              {"0123456789".split("").map((d) => <span key={d} style={{ display: "block", height: "1em" }}>{d}</span>)}
            </span>
          </span>
        ) : (
          <span key={k} aria-hidden>{ch}</span>
        ),
      )}
    </span>
  );
}

// ---------------------------------------------------------------- distance curve

function DistanceCurve({ el, jd, todayJd, passes, onJump }: { el: OrbitalElements; jd: number; todayJd: number; passes: RailApproach[]; onJump: (jd: number) => void }) {
  const W = 340, H = 110, LEFT = 44, start = todayJd - 20 * 365.25, end = todayJd + 30 * 365.25;
  // Daily samples: close passes last hours, so coarser steps skip the dips.
  const samples = useMemo(() => {
    const out: [number, number][] = [];
    for (let t = start; t <= end; t += 1) out.push([t, lunarDistances(distance(positionAt(el, t), earthAt(t)))]);
    return out;
  }, [el, start, end]);
  const lo = Math.log10(0.1), hi = Math.log10(3000);
  const x = (t: number) => LEFT + ((t - start) / (end - start)) * (W - LEFT);
  const y = (ld: number) => H - ((Math.log10(Math.min(3000, Math.max(0.1, ld))) - lo) / (hi - lo)) * H;
  const path = samples.map(([t, ld], k) => `${k ? "L" : "M"}${x(t).toFixed(1)},${y(ld).toFixed(1)}`).join("");
  const inRange = passes.filter((p) => p.jd >= start && p.jd <= end);
  // Click or drag to move the plate's date; a click near a ring lands exactly on that pass.
  const jump = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    if (sx < LEFT - 4) return;
    const ring = inRange.find((p) => Math.abs(x(p.jd) - sx) < 5);
    onJump(ring ? ring.jd : start + (Math.min(W, Math.max(LEFT, sx)) - LEFT) / (W - LEFT) * (end - start));
  };
  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} width="100%" role="img" aria-label="Distance from Earth over 50 years, in Moon distances on a log scale. Click to move the plate to that date."
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); jump(e); }}
      onPointerMove={(e) => e.buttons && jump(e)}
      style={{ display: "block", overflow: "visible", cursor: "crosshair", touchAction: "none" }}>
      {[0.1, 1, 10, 100, 1000].map((ld) => (
        <g key={ld}>
          <line x1={LEFT} x2={W} y1={y(ld)} y2={y(ld)} stroke={SLEEVE.rule} strokeDasharray={ld === 1 ? undefined : "2 3"} />
          <text x={LEFT - 6} y={y(ld) + 3} textAnchor="end" fontFamily={TYPED} fontSize={10} fill={ld === 1 ? INK : SLEEVE.textSoft}>{ld === 1 ? "Moon" : `${fmt1(ld)}×`}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
      {inRange.map((p) => (
        <circle key={p.jd} cx={x(p.jd)} cy={y(p.distLunar)} r={3.2} fill={SLEEVE.stock} stroke={INK} strokeWidth={1.4} />
      ))}
      <line x1={x(jd)} x2={x(jd)} y1={0} y2={H} stroke={PLATE.graphiteDark} strokeWidth={1} strokeDasharray="3 2" />
      <text x={LEFT} y={H + 13} fontFamily={TYPED} fontSize={10} fill={SLEEVE.textSoft}>{dateFromJd(start).getUTCFullYear()}</text>
      <text x={W} y={H + 13} textAnchor="end" fontFamily={TYPED} fontSize={10} fill={SLEEVE.textSoft}>{dateFromJd(end).getUTCFullYear()}</text>
    </svg>
  );
}

// ---------------------------------------------------------------- sleeve

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "grid", gap: 6, paddingTop: 14, borderTop: `1px solid ${SLEEVE.rule}` }}>
      <h3 style={{ margin: 0, fontFamily: TYPED, fontSize: 14, fontWeight: 700, color: INK }}>{title}</h3>
      {children}
    </section>
  );
}

const P = ({ children, soft }: { children: ReactNode; soft?: boolean }) => (
  <p style={{ margin: 0, fontSize: soft ? 14 : 15.5, lineHeight: 1.45, color: soft ? SLEEVE.textSoft : SLEEVE.text, textWrap: "pretty" }}>{children}</p>
);

function Sleeve({ picked, mark, jd, todayJd, plateDate, following, onFollow, onWatch, onJump, onRemove, onPasses }: {
  picked: Picked; mark: string; jd: number; todayJd: number; plateDate: string;
  following: boolean; onFollow: () => void; onWatch: (pass: RailApproach) => void; onJump: (jd: number) => void;
  onRemove: () => void; onPasses: (list: RailApproach[]) => void;
}) {
  const details = useMetabaseQuery(NeoDetails, { filters: [filter(NeoDetails.source.fields.designation, "=", picked.id)], limit: 1 });
  const approaches = useMetabaseQuery(CloseApproaches, { filters: [filter(CloseApproaches.source.fields.des, "=", picked.id)] });
  const history = useMetabaseQuery(TorinoHistory, { filters: [filter(TorinoHistory.source.fields.des, "=", picked.id)] });
  const row = details.data?.rows[0];

  const passes = useMemo<RailApproach[]>(
    () => (approaches.data?.rows ?? []).map((r) => {
      const date = new Date(String(r.approach_at));
      return { mark, jd: jdFromDate(date), date, distLunar: Number(r.dist_lunar) };
    }),
    [approaches.data, mark],
  );
  // Report passes up for the time rail; the callback identity changes every render, the list does not.
  const onPassesRef = useRef(onPasses);
  onPassesRef.current = onPasses;
  useEffect(() => onPassesRef.current(passes), [passes]);

  // "99942 Apophis (2004 MN4)" -> name "99942 Apophis", provisional designation "2004 MN4".
  const parts = picked.name.match(/^(.+?)\s*\((.+)\)$/);
  const title = parts ? { primary: parts[1], secondary: parts[2] } : { primary: picked.name, secondary: "" };

  const au = distance(positionAt(picked.el, jd), earthAt(jd));
  const dist = distanceWords(au);
  const ld = lunarDistances(au);
  const next = passes.find((p) => p.jd >= todayJd);
  const closest = passes.reduce<RailApproach | undefined>((m, p) => (!m || p.distLunar < m.distLunar ? p : m), undefined);

  const measured = row?.diameter_km != null && Number(row.diameter_km) > 0;
  const meters = row ? (measured ? Number(row.diameter_km) * 1000 : diameterFromH(Number(row.abs_magnitude_h))) : null;
  const size = meters ? sizeWords(meters) : null;
  const onRisk = row ? Number(row.on_risk_list) === 1 : false;

  return (
    <article className="plate-sleeve" aria-label={`Sleeve ${mark}: ${picked.name}`}
      style={{ display: "grid", gap: 14, padding: "22px 20px 20px", background: SLEEVE.stock, borderRadius: 4, boxShadow: SLEEVE_SHADOW }}>
      {/* The sleeve's typed label: plate, mark and catalogue number, ruled like a form. */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 6, borderBottom: `1px solid ${SLEEVE.rule}`, fontFamily: TYPED, fontSize: 12, color: SLEEVE.textSoft }}>
        <span>Plate {plateDate} · mark <span style={{ color: RED, fontWeight: 700 }}>{mark}</span></span>
        <span>No. {picked.id}</span>
      </div>

      <header style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span aria-hidden style={{ flex: "none", width: 30, height: 30, borderRadius: "50%", border: `1.8px solid ${RED}`, display: "grid", placeItems: "center", fontFamily: TYPED, fontWeight: 700, color: RED }}>{mark}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontFamily: TYPED, fontSize: 20, fontWeight: 700, color: SLEEVE.text, letterSpacing: "-0.01em", textWrap: "balance" }}>{title.primary}</h2>
          <div style={{ fontSize: 13.5, color: SLEEVE.textSoft }}>
            {title.secondary && <span style={{ fontFamily: TYPED, color: INK }}>{title.secondary} · </span>}
            {row ? (Number(row.is_pha) ? "Potentially hazardous asteroid" : "Near-Earth asteroid") : details.error ? "Details unavailable" : "Reading the sleeve…"}
          </div>
        </div>
        <button type="button" className="plate-chip" onClick={onFollow} aria-pressed={following}
          style={{ flex: "none", height: 30, padding: "0 10px", border: `1px ${following ? "solid" : "dashed"} ${following ? INK : PLATE.graphite}`, borderRadius: 3, background: following ? INK : "transparent", color: following ? SLEEVE.stock : INK, fontFamily: TYPED, fontSize: 12, cursor: "pointer" }}>
          {following ? "Following" : "Follow"}
        </button>
        <button type="button" className="plate-remove" onClick={onRemove} aria-label={`Remove ${picked.name}`}
          style={{ flex: "none", width: 30, height: 30, display: "grid", placeItems: "center", border: 0, borderRadius: 3, background: "transparent", color: SLEEVE.textSoft, cursor: "pointer" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </header>

      <p style={{ margin: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 8, color: INK }}>
        <span style={{ fontSize: 34, fontWeight: 700 }}><Odometer value={ld < 10 ? fmt2(ld) : fmt1(ld)} /></span>
        <span style={{ fontSize: 15, lineHeight: 1.4 }}>× the Moon's distance from Earth on {plateDate}</span>
        <span style={{ flexBasis: "100%", fontSize: 14, color: SLEEVE.textSoft }}>{dist.detail}</span>
      </p>


      {details.error ? <P>Couldn't load this asteroid's details from Metabase. Remove it and circle it again to retry.</P> : null}

      {size && meters && (
        <Section title="How big">
          <P>{size.size} across, {size.compare}.</P>
          <P soft>{measured ? "Measured size." : "Estimated from how bright it looks; the real size could be about half or double."}</P>
          {(() => {
            const max = Math.max(meters, size.reference[1]);
            const refName = size.reference[0].replace(/^(a|the) /, "");
            return (
              <svg viewBox="0 0 340 44" width="100%" role="img" aria-label={`${title.primary} ${size.size} next to ${refName}`} style={{ display: "block" }}>
                <text x={0} y={9} fontFamily={TYPED} fontSize={10.5} fill={INK}>{title.primary.replace(/^\d+\s+/, "")} · {size.size}</text>
                <rect x={0} y={13} height={7} width={Math.max(2, (meters / max) * 340)} fill={INK} />
                <text x={0} y={32} fontFamily={TYPED} fontSize={10.5} fill={SLEEVE.textSoft}>{refName.charAt(0).toUpperCase() + refName.slice(1)} · {fmt0(size.reference[1])} m</text>
                <rect x={0.5} y={36} height={6} width={Math.max(2, (size.reference[1] / max) * 339)} fill="none" stroke={PLATE.graphiteDark} strokeDasharray="3 2" />
              </svg>
            );
          })()}
        </Section>
      )}

      <Section title="How close it gets">
        {approaches.isLoading ? <P soft>Checking JPL's list of close passes…</P> : next ? (
          <P>Next close pass: <strong>{fmtDate(next.date)}</strong>, {distanceWords(next.distLunar * 384400 / 149597870.7).headline}.</P>
        ) : (
          <P>No pass closer than 19× the Moon's distance is expected between now and 2200.</P>
        )}
        {next && (
          <button type="button" className="plate-chip" onClick={() => onWatch(next)}
            style={{ justifySelf: "start", padding: "6px 12px", border: `1px solid ${INK}`, borderRadius: 3, background: "transparent", color: INK, fontFamily: TYPED, fontSize: 13, cursor: "pointer" }}>
            Watch the {fmtDate(next.date, false)} pass from Earth
          </button>
        )}
        {closest && closest !== next && <P soft>Closest on record: {fmtDate(closest.date)}, {fmt2(closest.distLunar)}× the Moon's distance.</P>}
        <DistanceCurve el={picked.el} jd={jd} todayJd={todayJd} passes={passes} onJump={onJump} />
        <P soft>Line: distance worked out from its orbit. Rings: JPL's official close passes. Dashed: the plate's date. Click the chart to jump there.</P>
      </Section>

      {row && (
        <Section title="Is it dangerous">
          {onRisk ? (
            <>
              <P>On NASA's impact watch list. Chance of hitting Earth: <strong>{oddsWords(Number(row.impact_probability))}</strong>, in {String(row.impact_year_range).replace(/^(\d+)-\1$/, "$1")}.</P>
              <P soft>Torino scale {String(row.torino_max ?? 0)}: {Number(row.torino_max ?? 0) === 0 ? "no hazard." : "merits attention."} Palermo scale {fmt2(Number(row.palermo_cum))}: {palermoWords(Number(row.palermo_cum))}.</P>
            </>
          ) : (
            <P>Not on NASA's impact watch list: no known chance of hitting Earth in the next 100 years or more.</P>
          )}
          {Number(row.is_pha) === 1 && (
            <P soft>“Potentially hazardous” means it's bigger than about 140 m and its orbit passes within 7.5 million km of Earth's. It's a reason to keep watching it, not a prediction.</P>
          )}
        </Section>
      )}

      {row && (
        <Section title="Its story">
          <P>
            Found in {String(row.discovery_year ?? "an unknown year")}. {ORBIT_CLASS_WORDS[String(row.orbit_class)] ?? ""} A year there lasts {fmt2(Number(row.period_years))} Earth years.
          </P>
          <P soft>Its orbit is pinned down by {fmt0(Number(row.n_obs_used))} observations.</P>
          {(history.data?.rows ?? []).map((h) => (
            <P key={String(h.event_date)} soft>
              <span style={{ fontFamily: TYPED, color: INK }}>{fmtDate(new Date(String(h.event_date)))}</span>: {String(h.event)}
            </P>
          ))}
        </Section>
      )}
    </article>
  );
}

// ---------------------------------------------------------------- stack

export const MARKS = ["A", "B", "C", "D"];

export function Sleeves({ picked, jd, todayJd, plateDate, follow, onFollow, onWatch, onJump, onTour, onAdd, onRemove, onPasses }: {
  follow: string | null;
  onJump: (jd: number) => void;
  onTour: () => void;
  onFollow: (id: string) => void;
  onWatch: (id: string, pass: RailApproach) => void;
  picked: (Picked & { mark: string })[];
  jd: number;
  todayJd: number;
  plateDate: string;
  onAdd: (p: Picked) => void;
  onRemove: (id: string) => void;
  onPasses: (id: string, list: RailApproach[]) => void;
}) {
  return (
    <aside className="plate-sleeves" aria-label="Circled asteroids" style={{ display: "grid", alignContent: "start", gap: 12, fontFamily: PROSE, color: SLEEVE.text }}>
      <Search onPick={onAdd} full={picked.length >= MARKS.length} />
      {picked.length === 0 && (
        <p className="plate-hint" style={{ margin: 0, padding: "10px 14px", background: PLATE.labelWash, borderRadius: 3, fontSize: 14.5, lineHeight: 1.45, color: SLEEVE.text }}>
          Or click any asteroid in the view to circle it. Press <span style={{ fontFamily: TYPED, color: INK }}>BLINK</span> to flip between two dates, the way asteroids were discovered: the ones that jump are moving.{" "}
          New here? <button type="button" className="plate-chip" onClick={onTour}
            style={{ padding: "1px 6px", border: `1px solid ${INK}`, borderRadius: 3, background: "transparent", color: INK, fontFamily: TYPED, fontSize: 13.5, cursor: "pointer" }}>Take the tour</button>
        </p>
      )}
      {picked.map((p) => (
        <Sleeve key={p.id} picked={p} mark={p.mark} jd={jd} todayJd={todayJd} plateDate={plateDate}
          following={follow === `sel:${p.id}`} onFollow={() => onFollow(p.id)} onWatch={(pass) => onWatch(p.id, pass)} onJump={onJump} onRemove={() => onRemove(p.id)} onPasses={(l) => onPasses(p.id, l)} />
      ))}
    </aside>
  );
}
