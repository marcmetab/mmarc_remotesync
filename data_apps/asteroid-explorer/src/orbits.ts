// Two-body orbit propagation. Positions are heliocentric ecliptic J2000, in AU.
// Accurate enough to visualize where things are; not for impact analysis.

const DEG = Math.PI / 180;
const GAUSS_K_DEG_PER_DAY = 0.9856076686; // mean motion of a 1 AU orbit
export const J2000_JD = 2451545.0;

export type OrbitalElements = {
  a: number; // semi-major axis, AU
  e: number;
  i: number; // inclination, deg
  node: number; // longitude of ascending node, deg
  peri: number; // argument of perihelion, deg
  meanAnomaly: number; // at epoch, deg
  epochJd: number;
  meanMotion?: number | null; // deg/day; derived from `a` when absent
};

export type Vec3 = [number, number, number];

export function jdFromDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function dateFromJd(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

function solveKepler(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI;
  for (let k = 0; k < 30; k++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  return E;
}

// Rotates an in-plane point (x toward perihelion) into ecliptic coordinates.
function toEcliptic(xp: number, yp: number, el: OrbitalElements): Vec3 {
  const O = el.node * DEG, w = el.peri * DEG, i = el.i * DEG;
  const cO = Math.cos(O), sO = Math.sin(O), cw = Math.cos(w), sw = Math.sin(w), ci = Math.cos(i), si = Math.sin(i);
  return [
    (cO * cw - sO * sw * ci) * xp + (-cO * sw - sO * cw * ci) * yp,
    (sO * cw + cO * sw * ci) * xp + (-sO * sw + cO * cw * ci) * yp,
    sw * si * xp + cw * si * yp,
  ];
}

export function meanMotion(el: OrbitalElements): number {
  return el.meanMotion ?? GAUSS_K_DEG_PER_DAY / Math.pow(el.a, 1.5);
}

export function positionAt(el: OrbitalElements, jd: number): Vec3 {
  const M = ((el.meanAnomaly + meanMotion(el) * (jd - el.epochJd)) % 360) * DEG;
  const E = solveKepler(M, el.e);
  const xp = el.a * (Math.cos(E) - el.e);
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  return toEcliptic(xp, yp, el);
}

// Closed orbit outline, sampled evenly in eccentric anomaly (denser near perihelion).
export function orbitPath(el: OrbitalElements, segments = 256): Vec3[] {
  const pts: Vec3[] = [];
  const b = el.a * Math.sqrt(1 - el.e * el.e);
  for (let k = 0; k <= segments; k++) {
    const E = (k / segments) * 2 * Math.PI;
    pts.push(toEcliptic(el.a * (Math.cos(E) - el.e), b * Math.sin(E), el));
  }
  return pts;
}

export function distance(p: Vec3, q: Vec3): number {
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

// Planets: JPL "Keplerian Elements for Approximate Positions of the Major Planets",
// Table 1 (valid 1800-2050). [a, e, I, L, varpi, node] at J2000 and their rates per century.
type PlanetRow = { name: string; color: string; radius: number; el: number[]; rate: number[] };

export const PLANETS: PlanetRow[] = [
  { name: "Mercury", color: "#a8a29e", radius: 0.9, el: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593], rate: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081] },
  { name: "Venus", color: "#e7c98a", radius: 1.3, el: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255], rate: [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418] },
  { name: "Earth", color: "#5fa8ff", radius: 1.4, el: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0], rate: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0] },
  { name: "Mars", color: "#e0714f", radius: 1.1, el: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891], rate: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343] },
  { name: "Jupiter", color: "#d9b38c", radius: 2.6, el: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], rate: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106] },
  { name: "Saturn", color: "#e6d3a3", radius: 2.3, el: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], rate: [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794] },
];

export function planetElements(p: PlanetRow, jd: number): OrbitalElements {
  const T = (jd - J2000_JD) / 36525;
  const [a, e, I, L, varpi, node] = p.el.map((v, k) => v + p.rate[k] * T);
  return { a, e, i: I, node, peri: varpi - node, meanAnomaly: L - varpi, epochJd: jd };
}

// The Moon, as a mean circular orbit around Earth (good to a few degrees): enough to show
// where it sits during a close pass. Heliocentric ecliptic AU, like everything else here.
export const MOON_DISTANCE_AU = 0.00257;
export const EARTH_RADIUS_AU = 4.2635e-5;
export const MOON_RADIUS_AU = 1.1614e-5;

export function moonOffset(jd: number): Vec3 {
  const d = jd - J2000_JD;
  const L = (218.316 + 13.176396 * d) * DEG; // mean longitude
  const node = (125.045 - 0.0529538 * d) * DEG;
  const inc = 5.145 * DEG;
  const u = L - node;
  const r = MOON_DISTANCE_AU;
  return [
    r * (Math.cos(node) * Math.cos(u) - Math.sin(node) * Math.sin(u) * Math.cos(inc)),
    r * (Math.sin(node) * Math.cos(u) + Math.cos(node) * Math.sin(u) * Math.cos(inc)),
    r * Math.sin(u) * Math.sin(inc),
  ];
}
