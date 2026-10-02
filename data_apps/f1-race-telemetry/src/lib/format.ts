/** Formatting helpers. Every input comes from a Metabase row, so all are nullable. */

/** `92608` → `"1:32.608"`; under a minute → `"58.214"`. */
export function formatLapTime(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms <= 0) {
    return "—";
  }
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  if (minutes === 0) {
    return seconds.toFixed(3);
  }
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

/** `3734000` → `"1:02:14"`. Clock-style, for elapsed session time. */
export function formatClock(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) {
    return "—";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Interval behind the leader: `11342` → `"+11.342"`. */
export function formatGap(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) {
    return "—";
  }
  if (ms <= 0) {
    return "—";
  }
  if (ms >= 60_000) {
    const minutes = Math.floor(ms / 60_000);
    const seconds = (ms - minutes * 60_000) / 1000;
    return `+${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
  }
  return `+${(ms / 1000).toFixed(3)}`;
}

/** Signed delta against a reference lap: `-412` → `"-0.412"`. */
export function formatDelta(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) {
    return "—";
  }
  const seconds = ms / 1000;
  return `${seconds >= 0 ? "+" : "-"}${Math.abs(seconds).toFixed(3)}`;
}

export function formatSector(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms <= 0) {
    return "—";
  }
  return (ms / 1000).toFixed(3);
}

export function formatNumber(
  value: number | null | undefined,
  digits = 0,
): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** `1` → `"1st"`. */
export function ordinal(position: number | null | undefined): string {
  if (position == null || !Number.isFinite(position)) {
    return "—";
  }
  const n = Math.round(position);
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) {
    return `${n}th`;
  }
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** Tyre compounds carry fixed FIA colours; the letter is the sidewall marking. */
const COMPOUNDS: Record<string, { label: string; color: string; letter: string }> =
  {
    SOFT: { label: "Soft", color: "#E8002D", letter: "S" },
    MEDIUM: { label: "Medium", color: "#F5C518", letter: "M" },
    HARD: { label: "Hard", color: "#F0F0F0", letter: "H" },
    INTERMEDIATE: { label: "Intermediate", color: "#43B02A", letter: "I" },
    WET: { label: "Wet", color: "#0067AD", letter: "W" },
  };

export function compoundStyle(compound: string | null | undefined) {
  const key = (compound ?? "").toUpperCase();
  return (
    COMPOUNDS[key] ?? {
      label: compound ? String(compound) : "Unknown",
      color: "#6B7280",
      letter: compound ? String(compound).charAt(0).toUpperCase() : "?",
    }
  );
}

/** `"3671c6"` → `"#3671c6"`. Team colours arrive without the hash. */
export function teamColor(raw: string | null | undefined): string {
  if (!raw) {
    return "#6B7280";
  }
  const value = String(raw).trim();
  return value.startsWith("#") ? value : `#${value}`;
}

/** Wind direction in degrees → compass point. */
export function windCompass(degrees: number | null | undefined): string {
  if (degrees == null || !Number.isFinite(degrees)) {
    return "";
  }
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return points[Math.round(((degrees % 360) + 360) % 360 / 45) % 8];
}

/**
 * `laps.track_status` is not a single code: it concatenates every status seen
 * during that lap, so a lap can read "124" (green, then yellow, then safety
 * car) or "671". Report the most severe condition of the lap.
 *
 * Distinct from `track_status.status`, which is one code per change and is
 * what `trackStatusLabel` handles.
 */
export function lapTrackStatus(codes: string | null | undefined): {
  label: string;
  color: string;
} {
  const seen = new Set(String(codes ?? "").split(""));
  // Most severe first.
  if (seen.has("5")) {
    return { label: "Red flag", color: "#E8002D" };
  }
  if (seen.has("4")) {
    return { label: "Safety car", color: "#EA580C" };
  }
  if (seen.has("6") || seen.has("7")) {
    // A lighter orange than the safety car: the two were previously identical
    // and the dot could not distinguish them.
    return { label: "Virtual safety car", color: "#FB923C" };
  }
  if (seen.has("2")) {
    return { label: "Yellow flag", color: "#F5C518" };
  }
  if (seen.has("1")) {
    return { label: "Track clear", color: "#22C55E" };
  }
  return { label: "Unknown", color: "#6B7280" };
}

/** Track-status codes as reported by race control. */
export function trackStatusLabel(status: string | null | undefined): {
  label: string;
  color: string;
} {
  switch (String(status ?? "")) {
    case "1":
      return { label: "Track clear", color: "#22C55E" };
    case "2":
      return { label: "Yellow flag", color: "#F5C518" };
    case "4":
      return { label: "Safety car", color: "#F59E0B" };
    case "5":
      return { label: "Red flag", color: "#E8002D" };
    case "6":
    case "7":
      return { label: "Virtual safety car", color: "#F59E0B" };
    default:
      return { label: "Unknown", color: "#6B7280" };
  }
}

/**
 * Results carry three-letter codes (`NED`, `MON`, `GER`), mostly IOC-style;
 * flags need ISO alpha-2. Unknown codes return null and render nothing.
 */
const COUNTRY_ALPHA2: Record<string, string> = {
  ARG: "AR", AUS: "AU", AUT: "AT", BEL: "BE", BRA: "BR", CAN: "CA", CHE: "CH",
  CHN: "CN", COL: "CO", DEN: "DK", DNK: "DK", ESP: "ES", EST: "EE", FIN: "FI",
  FRA: "FR", GBR: "GB", GER: "DE", DEU: "DE", IND: "IN", IDN: "ID", ITA: "IT",
  JPN: "JP", MEX: "MX", MON: "MC", MCO: "MC", NED: "NL", NLD: "NL", NZL: "NZ",
  POL: "PL", RSA: "ZA", RUS: "RU", SUI: "CH", SWE: "SE", THA: "TH", USA: "US",
  VEN: "VE",
};

export function flagEmoji(code: string | null | undefined): string | null {
  const alpha2 = code ? COUNTRY_ALPHA2[code.toUpperCase()] : undefined;
  if (!alpha2) {
    return null;
  }
  return String.fromCodePoint(...[...alpha2].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
