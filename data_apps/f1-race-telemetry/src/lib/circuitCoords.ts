/**
 * Approximate circuit coordinates keyed by OpenF1 `sessions.location`.
 * Used to place race markers on the season globe.
 */
export type CircuitCoord = { lat: number; lon: number };

const BY_LOCATION: Record<string, CircuitCoord> = {
  Melbourne: { lat: -37.8497, lon: 144.968 },
  Shanghai: { lat: 31.3389, lon: 121.22 },
  Suzuka: { lat: 34.8431, lon: 136.541 },
  Sakhir: { lat: 26.0325, lon: 50.511 },
  Jeddah: { lat: 21.6319, lon: 39.104 },
  Miami: { lat: 25.9581, lon: -80.239 },
  "Miami Gardens": { lat: 25.9581, lon: -80.239 },
  Imola: { lat: 44.3439, lon: 11.717 },
  Monaco: { lat: 43.7347, lon: 7.421 },
  Barcelona: { lat: 41.57, lon: 2.261 },
  Montréal: { lat: 45.5, lon: -73.523 },
  Montreal: { lat: 45.5, lon: -73.523 },
  Spielberg: { lat: 47.2197, lon: 14.765 },
  Silverstone: { lat: 52.0786, lon: -1.017 },
  "Spa-Francorchamps": { lat: 50.4372, lon: 5.971 },
  Budapest: { lat: 47.5789, lon: 19.249 },
  Zandvoort: { lat: 52.3888, lon: 4.541 },
  Monza: { lat: 45.6156, lon: 9.281 },
  Baku: { lat: 40.3725, lon: 49.853 },
  "Marina Bay": { lat: 1.2914, lon: 103.864 },
  Austin: { lat: 30.1328, lon: -97.641 },
  "Mexico City": { lat: 19.4042, lon: -99.091 },
  "São Paulo": { lat: -23.7036, lon: -46.7 },
  "Sao Paulo": { lat: -23.7036, lon: -46.7 },
  "Las Vegas": { lat: 36.1147, lon: -115.173 },
  Lusail: { lat: 25.49, lon: 51.454 },
  "Yas Island": { lat: 24.4672, lon: 54.603 },
};

export function coordsForLocation(location: string | null | undefined): CircuitCoord | null {
  if (!location) {
    return null;
  }
  return BY_LOCATION[location] ?? null;
}

/** Three.js / SphereGeometry convention: Y up, texture seam at ±180°. */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number,
): { x: number; y: number; z: number } {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}
