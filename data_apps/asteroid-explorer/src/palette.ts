// The Discovery Plate: a glass negative on an observatory light box.
// Blue-black observer's ink annotates; red ink only ever circles what you picked.
export const INK = "#1f3a8a";
export const RED = "#c8321e";

export const PLATE = {
  glass: "#e9ebe6", // backlit emulsion, center of the light box
  glassEdge: "#cdd3cc", // where the light box falls off
  speck: "#16181a", // an asteroid on the negative
  burn: "#0f1112", // the overexposed Sun
  graphite: "#8a908c", // pencil orbits
  graphiteDark: "#4a4f4c", // pencil labels
  labelWash: "rgba(233, 235, 230, 0.82)", // keeps inked labels legible over specks
};

// Plate sleeves: acid-free card stock with typed labels.
export const SLEEVE = {
  stock: "#f6f3ea",
  stockEdge: "#e4ded0",
  rule: "#d3ccbb",
  text: "#23262a",
  textSoft: "#565b61",
};

// Sleeves and the search card declare elevation once: a soft shadow, no border.
export const SLEEVE_SHADOW = "0 1px 2px rgba(40, 36, 28, 0.10), 0 10px 24px -12px rgba(40, 36, 28, 0.35)";
