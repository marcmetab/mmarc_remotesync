import { DataAppLink, useDataAppLocation } from "@metabase/embedding-sdk-react/data-app";
import { useState } from "react";
import type { ReactNode } from "react";

import f1Logo from "../assets/f1-car-logo.png?inline";
import { FONT_CSS } from "../fonts";
import { DISPLAY, SANS, T } from "../lib/tokens";

const NAV = [
  { to: "/", label: "Race Replay" },
  { to: "/results", label: "Race Results" },
  { to: "/driver-catalog", label: "Driver Catalog" },
] as const;

export function Shell({
  children,
  headerRight,
}: {
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  const { pathname } = useDataAppLocation();

  return (
    <div className="f1-shell">
      <style>{`
        ${FONT_CSS}
        .f1-shell {
          min-height: 100vh;
          box-sizing: border-box;
          background: ${T.pageBg};
          color: ${T.text};
          font-family: ${SANS};
          color-scheme: dark;
        }
        .f1-shell h1, .f1-shell h2 { font-family: ${DISPLAY}; }
        .f1-shell button, .f1-shell input { font-family: ${SANS}; }
        .f1-demo-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 6px 40px 6px 20px;
          position: relative;
          background: ${T.headerBg};
          border-bottom: 1px solid ${T.borderSoft};
          color: ${T.textFaint};
          font-family: ${SANS};
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          text-align: center;
        }
        /*
         * Chequered, not the marshalling set. Green/yellow/red already mean
         * live track status elsewhere in this app (the race replay cards), so
         * reusing those colours on a demo notice would read as a flag being
         * shown. The chequer carries no status meaning.
         *
         * Drawn with a gradient rather than an asset: two of these cost
         * nothing in the bundle, and currentColor keeps them in step with
         * the banner's text colour in either theme.
         */
        .f1-demo-flag {
          width: 24px;
          height: 13px;
          flex-shrink: 0;
          border-radius: 2px;
          transform: skewX(-10deg);
          opacity: 0.6;
          background-image: repeating-conic-gradient(
            currentColor 0% 25%,
            transparent 0% 50%
          );
          background-size: 6.5px 6.5px;
        }
        @media (prefers-reduced-motion: no-preference) {
          .f1-demo-flag {
            animation: f1-flag-wave 3.2s ease-in-out infinite;
          }
        }
        @keyframes f1-flag-wave {
          0%, 100% { transform: skewX(-10deg) scaleY(1); }
          50% { transform: skewX(-4deg) scaleY(0.92); }
        }
        .f1-demo-banner-close {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: ${T.textFaint};
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 8px;
          opacity: 0.7;
        }
        .f1-demo-banner-close:hover {
          background: ${T.cardBg};
          color: ${T.text};
          opacity: 1;
        }
        .f1-header {
          position: sticky;
          top: 0;
          z-index: 30;
          display: grid;
          grid-template-columns: 130px minmax(0, 1fr) minmax(230px, 320px);
          align-items: center;
          column-gap: 24px;
          min-height: 78px;
          padding: 0 28px;
          background: ${T.headerBg};
          border-bottom: 1px solid ${T.border};
          border-top: 5px solid #34343B;
        }
        .f1-brand {
          display: inline-flex;
          align-items: center;
          color: ${T.text};
          text-decoration: none;
          white-space: nowrap;
        }
        .f1-logo {
          display: block;
          width: 120px;
          height: auto;
        }
        .f1-nav {
          display: flex;
          align-items: stretch;
          gap: 8px;
          align-self: stretch;
          min-width: 0;
        }
        .f1-nav-link {
          display: inline-flex;
          align-items: center;
          padding: 0 12px;
          border-bottom: 3px solid transparent;
          color: ${T.textDim};
          font-family: ${DISPLAY};
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: color 150ms, background 150ms;
        }
        .f1-nav-link:hover { color: ${T.text}; background: ${T.cardBg}; }
        .f1-nav-link[aria-current="page"] {
          color: ${T.accent};
          border-bottom-color: ${T.accent};
        }
        .f1-nav-link:focus-visible, .f1-brand:focus-visible {
          outline: 2px solid ${T.accent};
          outline-offset: -4px;
        }
        .f1-session { min-width: 0; width: 100%; }
        .f1-session-cluster {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          width: 100%;
        }
        .f1-session-cluster > :last-child { flex: 1; min-width: 0; }
        .f1-catalog-context {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          color: ${T.textDim};
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }
        .f1-globe-btn:hover {
          color: ${T.accent} !important;
          border-color: ${T.accent} !important;
          background: ${T.accentSoft} !important;
        }
        .f1-globe-btn:focus-visible {
          outline: 2px solid ${T.accent};
          outline-offset: 2px;
        }
        .f1-main { min-width: 0; padding: 28px; }
        .f1-attribution {
          display: flex;
          justify-content: space-between;
          gap: 10px 20px;
          flex-wrap: wrap;
          margin-top: 26px;
          padding-top: 14px;
          border-top: 1px solid ${T.borderSoft};
          color: ${T.textFaint};
          font-size: 11px;
        }
        @keyframes f1spin { to { transform: rotate(360deg); } }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${T.cardBg};
          border: 3px solid ${T.accent};
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${T.cardBg};
          border: 3px solid ${T.accent};
          cursor: pointer;
        }
        @media (max-width: 1100px) {
          .f1-nav { overflow-x: auto; }
        }
        @media (max-width: 760px) {
          .f1-header {
            grid-template-columns: auto minmax(160px, 1fr);
            column-gap: 16px;
            row-gap: 0;
            padding: 0 16px;
          }
          .f1-nav {
            grid-column: 1 / -1;
            min-height: 43px;
            overflow-x: auto;
          }
          .f1-nav-link { padding: 0 13px; font-size: 14px; }
          .f1-main { padding: 16px; }
        }
        @media (max-width: 480px) {
          .f1-header { grid-template-columns: minmax(0, 1fr); padding: 0 14px; }
          .f1-brand { min-height: 43px; }
          .f1-logo { width: 96px; }
          .f1-session { padding-bottom: 9px; }
          .f1-nav { grid-column: 1; }
          .f1-main { padding: 14px; }
        }
        @media (max-width: 600px) {
          .f1-scrubber { flex-wrap: wrap; gap: 10px !important; }
          .f1-scrubber-range { order: 5; flex: 1 0 100% !important; }
          .f1-scrubber-label { order: 3; margin-left: auto; min-width: 100px !important; }
          .f1-scrubber-end { order: 4; }
          .f1-transport-text { display: none; }
          .f1-transport-button { width: 38px; height: 38px; padding: 0 !important; justify-content: center; }
        }
      `}</style>

      <DemoBanner />

      <header className="f1-header">
        <DataAppLink to="/" className="f1-brand" aria-label="F1 Analytics home">
          <img className="f1-logo" src={f1Logo} alt="" aria-hidden="true" />
        </DataAppLink>

        <nav className="f1-nav" aria-label="Primary navigation">
          {NAV.map((item) => {
            const active = item.to === "/"
              ? pathname === "/"
              : item.to === "/results"
                ? pathname === "/results" || pathname.startsWith("/drivers")
                : pathname.startsWith(item.to);
            return (
              <DataAppLink
                key={item.to}
                to={item.to}
                className="f1-nav-link"
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </DataAppLink>
            );
          })}
        </nav>

        {headerRight && <div className="f1-session">{headerRight}</div>}
      </header>

      <main className="f1-main">
        {children}
        <div className="f1-attribution">
          <span>Unofficial fan analytics · Not affiliated with Formula 1</span>
          <span>Powered by Metabase · ClickHouse</span>
        </div>
      </main>
    </div>
  );
}

// A demo notice shown on every page. Dismiss is intentionally kept in component
// state only (not localStorage), so it reappears every time the app is opened.
function DemoBanner() {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className="f1-demo-banner" role="note">
      <span className="f1-demo-flag" aria-hidden="true" />
      <span>This is a demo, powered by ClickHouse and Metabase.</span>
      <span className="f1-demo-flag" aria-hidden="true" />
      <button
        type="button"
        className="f1-demo-banner-close"
        aria-label="Dismiss demo notice"
        onClick={() => setShow(false)}
      >
        ×
      </button>
    </div>
  );
}
