import { INK, PLATE, RED } from "./palette";

// Two ways to print the same sky: the glass negative, and representative colour on black.
export type ThemeName = "plate" | "sky";

export type SceneTheme = {
  background: string; // CSS for the stage behind the transparent canvas
  speck: string;
  speckOpacity: number;
  glowBlending: boolean; // additive light (sky) vs. dark silver (plate)
  sun: string;
  sunScale: number;
  planet: Record<string, string>;
  orbit: string;
  earthOrbit: string;
  selectedOrbit: string;
  ring: string;
  moon: string;
  label: string;
  labelStrong: string;
  labelWash: string;
  // Title, stamp, rail and controls sitting directly on the stage.
  text: string;
  textSoft: string;
  control: string;
  controlBg: string;
};

export const THEMES: Record<ThemeName, SceneTheme> = {
  plate: {
    background: `radial-gradient(ellipse 80% 90% at 42% 45%, #f4f5f1 0%, ${PLATE.glass} 48%, ${PLATE.glassEdge} 100%)`,
    speck: PLATE.speck,
    speckOpacity: 0.8,
    glowBlending: false,
    sun: PLATE.burn,
    sunScale: 0.14,
    planet: { Mercury: PLATE.graphiteDark, Venus: PLATE.graphiteDark, Earth: INK, Mars: PLATE.graphiteDark, Jupiter: PLATE.graphiteDark, Saturn: PLATE.graphiteDark },
    orbit: PLATE.graphite,
    earthOrbit: INK,
    selectedOrbit: INK,
    ring: RED,
    moon: PLATE.graphiteDark,
    label: PLATE.graphiteDark,
    labelStrong: INK,
    labelWash: PLATE.labelWash,
    text: INK,
    textSoft: PLATE.graphiteDark,
    control: INK,
    controlBg: "rgba(246, 243, 234, 0.9)",
  },
  sky: {
    background: "radial-gradient(ellipse 80% 90% at 42% 45%, #0d1426 0%, #070b16 55%, #03050a 100%)",
    speck: "#c9d4ea",
    speckOpacity: 0.75,
    glowBlending: true,
    sun: "#ffc93c",
    sunScale: 0.22,
    planet: { Mercury: "#a39e98", Venus: "#e8cf8f", Earth: "#3f8fe0", Mars: "#d8573a", Jupiter: "#d9a86c", Saturn: "#e3cc8a" },
    orbit: "#44506b",
    earthOrbit: "#3f8fe0",
    selectedOrbit: "#9ec5ff",
    ring: "#ff7a59",
    moon: "#cfd2d6",
    label: "#8f9bb5",
    labelStrong: "#cfe2ff",
    labelWash: "rgba(7, 11, 22, 0.7)",
    text: "#e6ecf7",
    textSoft: "#9aa6bf",
    control: "#cfe2ff",
    controlBg: "rgba(13, 20, 38, 0.85)",
  },
};
