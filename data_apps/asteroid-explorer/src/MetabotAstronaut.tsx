import metabotAstronaut from "./assets/metabot-astronaut.png";

// Metabot in an astronaut helmet, beside the title. The build inlines the PNG into the bundle.
export function MetabotAstronaut({ size = 64 }: { size?: number }) {
  return (
    <img
      className="plate-metabot" src={metabotAstronaut} alt="" draggable={false}
      width={Math.round(size * (1360 / 1440))} height={size} style={{ flex: "none" }}
    />
  );
}
