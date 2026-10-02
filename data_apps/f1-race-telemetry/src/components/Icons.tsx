import type { ReactNode } from "react";

/** Line icons for the driver page's info rows; 16px, stroke follows `color`. */
function Icon({ children, color, size = 16 }: { children: ReactNode; color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export type IconName = "flag" | "session" | "clock" | "laps" | "trophy" | "points" | "status";

export function RowIcon({ name, color }: { name: IconName; color: string }) {
  switch (name) {
    case "flag":
      return (
        <Icon color={color}>
          <path d="M5 21V4" />
          <path d="M5 4h13l-2 4 2 4H5" />
          <path d="M9 4v8M13 4v8M5 8h13" opacity={0.6} />
        </Icon>
      );
    case "session":
      return (
        <Icon color={color}>
          <path d="M4 15a8 8 0 0 1 16-2v3H9l-2 3H5a1 1 0 0 1-1-1z" />
          <path d="M12 13h8" />
        </Icon>
      );
    case "clock":
      return (
        <Icon color={color}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2M10 2h4" />
        </Icon>
      );
    case "laps":
      return (
        <Icon color={color}>
          <path d="M20 12a8 8 0 1 1-2.3-5.7" />
          <path d="M20 4v5h-5" />
        </Icon>
      );
    case "trophy":
      return (
        <Icon color={color}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
          <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" />
        </Icon>
      );
    case "points":
      return (
        <Icon color={color}>
          <circle cx="12" cy="15" r="5" />
          <path d="M8.5 11.5 6 3h4l2 5 2-5h4l-2.5 8.5" />
        </Icon>
      );
    case "status":
      return (
        <Icon color={color}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </Icon>
      );
  }
}

/** A laurel wreath, for a podium finish. */
export function Laurel({ color, size = 30 }: { color: string; size?: number }) {
  // Leaves sit along an arc on each side, tilted to follow it.
  const leaves = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    const a = Math.PI * (0.62 + t * 0.62);
    const r = 12;
    return {
      x: 16 + Math.cos(a) * r,
      y: 15 - Math.sin(a) * r,
      rot: (a * 180) / Math.PI + 60,
    };
  });
  const branch = (mirror: boolean) => (
    <g transform={mirror ? "translate(32 0) scale(-1 1)" : undefined}>
      <path d="M14.5 28 A12 12 0 0 1 7.4 6.6" stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.x}
          cy={l.y}
          rx={1.7}
          ry={3.6}
          fill={color}
          transform={`rotate(${l.rot} ${l.x} ${l.y})`}
        />
      ))}
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      {branch(false)}
      {branch(true)}
    </svg>
  );
}
