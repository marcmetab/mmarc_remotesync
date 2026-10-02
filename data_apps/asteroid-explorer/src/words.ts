// Plain-language translations of orbital and risk numbers, for readers new to the subject.

export const KM_PER_AU = 149597870.7;
export const KM_PER_LUNAR_DISTANCE = 384400;

const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export const fmt0 = (n: number) => nf0.format(n);
export const fmt1 = (n: number) => nf1.format(n);
export const fmt2 = (n: number) => nf2.format(n);

export function fmtDate(d: Date, withDay = true) {
  return d.toLocaleDateString("en-GB", { day: withDay ? "numeric" : undefined, month: "short", year: "numeric", timeZone: "UTC" });
}

export function lunarDistances(au: number) {
  return (au * KM_PER_AU) / KM_PER_LUNAR_DISTANCE;
}

export function distanceWords(au: number) {
  const ld = lunarDistances(au);
  const km = au * KM_PER_AU;
  const kmText = km >= 1e6 ? `${fmt1(km / 1e6)} million km` : `${fmt0(km)} km`;
  if (ld < 1) return { headline: `${fmt2(ld)}× the Moon's distance`, detail: `${kmText}, closer than the Moon` };
  return { headline: `${ld < 10 ? fmt1(ld) : fmt0(ld)}× the Moon's distance`, detail: kmText };
}

// Estimated diameter from absolute magnitude H, assuming a typical albedo of 0.14.
export function diameterFromH(h: number) {
  return (1329 / Math.sqrt(0.14)) * Math.pow(10, -0.2 * h) * 1000;
}

const REFERENCES: [string, number][] = [
  ["a car", 4.5],
  ["a bus", 12],
  ["a blue whale", 30],
  ["the Statue of Liberty", 93],
  ["a football pitch", 105],
  ["the Great Pyramid of Giza", 139],
  ["the Eiffel Tower", 330],
  ["the Empire State Building", 443],
  ["the Golden Gate Bridge's main span", 1280],
  ["Mount Everest's height", 8849],
  ["the length of Manhattan", 21600],
];

export function sizeWords(meters: number) {
  let best = REFERENCES[0];
  for (const r of REFERENCES) {
    if (Math.abs(Math.log(meters / r[1])) < Math.abs(Math.log(meters / best[1]))) best = r;
  }
  const ratio = meters / best[1];
  const size = meters >= 1000 ? `${fmt1(meters / 1000)} km` : `${fmt0(meters)} m`;
  let compare: string;
  if (ratio > 0.8 && ratio < 1.25) compare = `about the size of ${best[0]}`;
  else if (ratio >= 1.25) compare = `about ${fmt1(ratio)}× ${best[0]}`;
  else compare = `about ${fmt0(ratio * 100)}% of ${best[0]}`;
  return { size, compare, reference: best };
}

export function oddsWords(p: number) {
  const n = Math.round(1 / p);
  const pct = p >= 0.001 ? ` (${fmt2(p * 100)}%)` : "";
  return `1 in ${fmt0(n)}${pct}`;
}

export function palermoWords(ps: number) {
  if (ps < -2) return "far below the everyday background risk of an unknown impact: no concern";
  if (ps < 0) return "below the everyday background risk, but worth keeping an eye on";
  return "above the everyday background risk: merits careful attention";
}

export const ORBIT_CLASS_WORDS: Record<string, string> = {
  APO: "Crosses Earth's orbit, spending most of its time outside it (an Apollo asteroid).",
  ATE: "Crosses Earth's orbit, spending most of its time inside it (an Aten asteroid).",
  AMO: "Comes close to Earth's orbit but stays just outside it (an Amor asteroid).",
  IEO: "Circles the Sun entirely inside Earth's orbit (an Atira asteroid).",
};
