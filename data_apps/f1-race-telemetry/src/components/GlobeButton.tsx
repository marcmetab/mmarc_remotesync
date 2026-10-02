import { DataAppLink, useDataAppLocation } from "@metabase/embedding-sdk-react/data-app";

import { T } from "../lib/tokens";

/** Header control that opens the season world-map page. */
export function GlobeButton() {
  const { pathname } = useDataAppLocation();
  const active = pathname === "/map" || pathname.startsWith("/map/");

  return (
    <DataAppLink
      to="/map"
      aria-label="Season map"
      title="Season map"
      aria-current={active ? "page" : undefined}
      className="f1-globe-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: T.radiusSm,
        border: `1px solid ${active ? T.accent : T.border}`,
        background: active ? T.accentSoft : T.cardBg,
        color: active ? T.accent : T.textDim,
        textDecoration: "none",
        transition: "color 150ms, border-color 150ms, background 150ms",
      }}
    >
      <GlobeIcon />
    </DataAppLink>
  );
}

function GlobeIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
