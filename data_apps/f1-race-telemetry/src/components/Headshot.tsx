import { useState } from "react";

import { HEADSHOTS } from "../assets/headshots.generated";
import { T } from "../lib/tokens";

export function Headshot({
  url,
  color,
  size = 44,
  initials,
}: {
  url: string | null;
  color: string;
  size?: number;
  initials?: string;
}) {
  // Metabase's embed CSP allows `data:` but not the remote image host. Keep
  // the remote URL as a fallback for photos absent from the generated bundle.
  const src = url ? (HEADSHOTS[url] ?? url) : null;
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: T.cardBgRaised,
          border: `2px solid ${color}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.34,
          fontWeight: 700,
          color: T.textDim,
        }}
      >
        {initials ?? ""}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: `2px solid ${color}`,
        background: T.cardBgRaised,
        flexShrink: 0,
      }}
    />
  );
}
