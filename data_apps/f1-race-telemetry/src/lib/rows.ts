/**
 * Metabase row values arrive as `unknown` at the edges and are always nullable.
 * These narrow them once, at the mapping layer, so pages never guard inline.
 */

export function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** For values the UI must have a number for — positions, counts, indexes. */
export function numOr(value: unknown, fallback: number): number {
  return num(value) ?? fallback;
}

export function str(value: unknown): string | null {
  if (typeof value === "string") {
    return value === "" ? null : value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

export function bool(value: unknown): boolean {
  return num(value) === 1 || value === true;
}
