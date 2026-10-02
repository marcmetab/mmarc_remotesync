import { useId, type ReactNode } from "react";

import { formatNumber } from "../lib/format";
import { MONO, SANS } from "../lib/tokens";

export type WheelReadout = {
  rpm: number | null;
  speed: number | null;
  gear: number | null;
  throttle: number | null;
  /** 0/1 flag in this dataset. */
  brake: number | null;
  /** FIA code: 10/12/14 open, 8 eligible in the next zone. */
  drs: number | null;
  gLong: number | null;
  gLat: number | null;
  gTotal: number | null;
};

const CX = 320;
const CY = 200;
const RPM_LIGHTS_FROM = 9800;
const RPM_LIGHTS_TO = 12000;
const RPM_MAX = 13000;
const LIGHTS = 15;

/** Fixed square camera: the wheel turns at one scale with room for the grips. */
const WHEEL_VIEW_BOX = "-65 -185 770 770";

const C = {
  line: "#344253",
  label: "#C5CCD5",
  value: "#F9FBFF",
  green: "#13D88C",
  red: "#FF3654",
  blue: "#168BFF",
  magenta: "#F531D6",
  amber: "#F9C62B",
};

/** The entire wheel turns with the estimated steering angle; all readouts stay live. */
export function SteeringWheel({
  angle,
  readout,
  lapLabel,
  gloves,
  compact,
}: {
  /** Degrees, clockwise-positive. */
  angle: number;
  readout: WheelReadout;
  lapLabel?: string;
  /** Glove colour; draws the driver's hands on the grips (onboard view). */
  gloves?: string;
  /** A calmer screen: drops the g-force row and the lap caption. */
  compact?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const carbon = `wheel-carbon-${uid}`;
  const rubber = `wheel-rubber-${uid}`;
  const metal = `wheel-metal-${uid}`;
  const screen = `wheel-screen-${uid}`;
  const glow = `wheel-glow-${uid}`;

  const { rpm, speed, gear, throttle, brake, drs, gLong, gLat, gTotal } = readout;
  const litLights = rpm == null ? 0 : Math.round(Math.min(Math.max((rpm - RPM_LIGHTS_FROM) / (RPM_LIGHTS_TO - RPM_LIGHTS_FROM), 0), 1) * LIGHTS);
  const rpmRatio = rpm == null ? 0 : Math.min(Math.max(rpm / RPM_MAX, 0), 1);
  const throttleRatio = throttle == null ? 0 : Math.min(Math.max(throttle / 100, 0), 1);
  const braking = brake == null ? null : brake >= 1;
  const drsOpen = drs != null && drs >= 10;
  const drsEligible = drs === 8;
  const gearRatio = gear == null ? 0 : Math.min(Math.max(gear / 8, 0), 1);

  return (
    <svg
      viewBox={WHEEL_VIEW_BOX}
      style={{ width: "100%", height: "auto", display: "block", overflow: "hidden" }}
      role="img"
      aria-label={`Steering wheel turned ${Math.abs(Math.round(angle))} degrees ${angle > 1 ? "right" : angle < -1 ? "left" : "straight"}; ${formatNumber(speed, 0)} km/h, gear ${gear ?? "—"}`}
    >
      <defs>
        <pattern id={carbon} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <rect width="6" height="6" fill="#111922" />
          <path d="M0 0h3v3H0zm3 3h3v3H3z" fill="#24303A" opacity=".55" />
          <path d="M3 0h3v3H3zM0 3h3v3H0z" fill="#05090E" opacity=".55" />
        </pattern>
        <linearGradient id={rubber} x1="0" x2="1" y1="0" y2=".15">
          <stop stopColor="#04070A" />
          <stop offset=".2" stopColor="#2B3139" />
          <stop offset=".5" stopColor="#080D13" />
          <stop offset=".8" stopColor="#333A43" />
          <stop offset="1" stopColor="#05080D" />
        </linearGradient>
        <linearGradient id={metal} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#596674" />
          <stop offset=".17" stopColor="#131B24" />
          <stop offset=".55" stopColor="#35414D" />
          <stop offset="1" stopColor="#080D13" />
        </linearGradient>
        <linearGradient id={screen} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#0C1725" />
          <stop offset=".52" stopColor="#071019" />
          <stop offset="1" stopColor="#0B131C" />
        </linearGradient>
        <filter id={glow} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <g transform={`rotate(${angle.toFixed(2)} ${CX} ${CY})`}>
        <Grip side="left" fill={`url(#${rubber})`} />
        <Grip side="right" fill={`url(#${rubber})`} />
        {gloves && <Gloves color={gloves} />}
        <path d={BODY} fill={`url(#${metal})`} stroke="#05070A" strokeWidth="4" />
        <path d={BODY_INSET} fill={`url(#${carbon})`} stroke="#3D4A58" strokeWidth="2" />
        <path d="M112 71 Q320 -11 528 71" fill="none" stroke="#A1AAB1" strokeOpacity=".5" strokeWidth="2" />
        <path d="M146 62 Q320 3 494 62" fill="none" stroke="#0A0E13" strokeWidth="8" />
        <path d="M155 63 Q320 9 485 63" fill="none" stroke="#56616E" strokeOpacity=".7" strokeWidth="1.5" />
        <path d="M158 344 Q320 389 482 344" fill="none" stroke="#71808C" strokeOpacity=".5" strokeWidth="2" />

        {/* Paddle tips, shoulders, recesses and small fasteners. */}
        <path d="M27 125q-13 7-14 22l2 13q4 5 9-2l13-26zM613 125q13 7 14 22l-2 13q-4 5-9-2l-13-26z" fill="#F11F37" stroke="#FF7B88" strokeWidth="2" />
        <path d="M105 76 Q145 42 189 64 L181 98 Q151 80 119 110Z" fill="#0A1017" stroke="#424E5B" />
        <path d="M535 76 Q495 42 451 64 L459 98 Q489 80 521 110Z" fill="#0A1017" stroke="#424E5B" />
        <circle cx="148" cy="86" r="17" fill="#0A0F15" stroke="#293541" />
        <circle cx="492" cy="86" r="17" fill="#0A0F15" stroke="#293541" />
        {[128, 166, 474, 512].map((x) => <circle key={x} cx={x} cy="62" r="3" fill="#090D12" stroke="#56616D" strokeWidth="1" />)}

        {/* Rev lights follow RPM and bloom over the carbon shell. */}
        <path d="M228 55 Q320 37 412 55 L414 73 Q320 57 226 73Z" fill="#020508" stroke="#384451" strokeWidth="1.5" />
        {Array.from({ length: LIGHTS }, (_, i) => {
          const x = 242 + i * 11.1;
          const y = 62 - 11 * (1 - Math.pow((i - 7) / 7, 2));
          const on = i < litLights;
          const color = i < 9 ? C.blue : i < 13 ? C.red : C.amber;
          return <g key={i}>
            {on && <circle cx={x} cy={y} r="7" fill={color} opacity=".8" filter={`url(#${glow})`} />}
            <circle cx={x} cy={y} r="3.9" fill={on ? color : "#19232D"} stroke={on ? "#CBE7FF" : "#333C47"} strokeWidth=".8" />
          </g>;
        })}

        <Rotary cx={99} cy={88} r={16} label="FG" />
        <Rotary cx={541} cy={88} r={16} label="CH" />
        <WheelButton cx={148} cy={97} r={18} color="#20D645" label="N" dark />
        <WheelButton cx={492} cy={97} r={18} color="#F9C51A" label="PL" dark />
        <WheelButton cx={177} cy={137} r={11} color="#7CCB93" label="N" dark />
        <WheelButton cx={463} cy={137} r={11} color="#EFAB33" label="PC" dark />
        <WheelButton cx={150} cy={175} r={10} color="#8B55A9" label="AK" />
        <WheelButton cx={490} cy={175} r={10} color="#9C55B8" label="PIC" />
        <WheelButton cx={128} cy={193} r={9} color="#1558CA" label="OT" />
        <WheelButton cx={512} cy={193} r={9} color="#1678D3" label="D" />
        <WheelButton cx={153} cy={222} r={10} color="#D5A727" label="MO" dark />
        <WheelButton cx={487} cy={222} r={10} color="#DE3547" label="OK" />
        <Rotary cx={149} cy={269} r={14} label="SOC" />
        <Rotary cx={491} cy={269} r={14} label="DIF" />
        <Rotary cx={147} cy={324} r={12} label="BS" />
        <Rotary cx={493} cy={324} r={12} label="CC" />

        {/* LCD bezel and the three rows of live telemetry. */}
        <rect x="170" y="82" width="300" height={compact ? 200 : 273} rx="21" fill="#03070B" stroke="#101A24" strokeWidth="8" />
        <rect x="174" y="86" width="292" height={compact ? 192 : 265} rx="17" fill={`url(#${screen})`} stroke="#4D5E70" strokeWidth="1.5" />
        <path d="M184 104 Q320 84 456 104" fill="none" stroke="#718398" strokeOpacity=".4" />
        <text x="320" y="108" textAnchor="middle" fill="#DCE2E9" fontFamily={SANS} fontSize="12" letterSpacing="1.4">ORACLE</text>

        <DashTile x={183} y={115} w={83} h={78}>
          <text x="224.5" y="155" textAnchor="middle" fill={C.value} fontFamily={MONO} fontSize="22" fontWeight="800">{rpm == null ? "—" : Math.round(rpm)}</text>
          <text x="224.5" y="172" textAnchor="middle" fill={C.label} fontFamily={SANS} fontSize="11">RPM</text>
          <Meter x={190} y={181} width={69} ratio={rpmRatio} color={C.magenta} />
        </DashTile>
        <DashTile x={271} y={112} w={98} h={83} prominent>
          <text x="320" y="160" textAnchor="middle" fill={C.value} fontFamily={MONO} fontSize="39" fontWeight="800">{speed == null ? "—" : Math.round(speed)}</text>
          <text x="320" y="181" textAnchor="middle" fill={C.label} fontFamily={SANS} fontSize="11" letterSpacing=".5">KM/H</text>
        </DashTile>
        <DashTile x={374} y={115} w={83} h={78}>
          <text x="415.5" y="160" textAnchor="middle" fill={C.value} fontFamily={MONO} fontSize="35" fontWeight="800">{gear == null || gear === 0 ? "N" : gear}</text>
          <text x="415.5" y="174" textAnchor="middle" fill={C.label} fontFamily={SANS} fontSize="11">GEAR</text>
          <Meter x={381} y={181} width={69} ratio={gearRatio} color="#3AA79C" />
        </DashTile>

        <DashTile x={183} y={201} w={91} h={72}>
          <text x="228.5" y="234" textAnchor="middle" fill={C.value} fontFamily={MONO} fontSize="24" fontWeight="800">{throttle == null ? "—" : `${Math.round(throttle)}%`}</text>
          <text x="228.5" y="251" textAnchor="middle" fill={C.label} fontFamily={SANS} fontSize="11">Throttle</text>
          <Meter x={190} y={260} width={77} ratio={throttleRatio} color={C.green} />
        </DashTile>
        <rect x="282" y="207" width="76" height="49" rx="8" fill={drsOpen ? "#092820" : "#0B1820"} stroke={drsOpen ? C.green : drsEligible ? C.amber : C.line} strokeWidth="1.5" />
        <text x="320" y="238" textAnchor="middle" fill={drsOpen ? C.green : drsEligible ? C.amber : C.label} fontFamily={SANS} fontSize="20" fontWeight="800">DRS</text>
        <text x="320" y="267" textAnchor="middle" fill={drsOpen ? C.green : drsEligible ? C.amber : C.label} fontFamily={SANS} fontSize="11">{drs == null ? "—" : drsOpen ? "ACTIVE" : drsEligible ? "ELIGIBLE" : "CLOSED"}</text>
        <DashTile x={366} y={201} w={91} h={72}>
          <text x="411.5" y="234" textAnchor="middle" fill={braking ? C.red : C.value} fontFamily={MONO} fontSize="23" fontWeight="800">{braking == null ? "—" : braking ? "ON" : "OFF"}</text>
          <text x="411.5" y="251" textAnchor="middle" fill={C.label} fontFamily={SANS} fontSize="11">Brake</text>
          <Meter x={373} y={260} width={77} ratio={braking ? 1 : 0} color={C.red} />
        </DashTile>

        {!compact && ([["G Long", gLong, 184], ["G Lat", gLat, 276], ["G Total", gTotal, 368]] as const).map(([label, value, x]) => (
          <g key={label}>
            <DashTile x={x} y={282} w={88} h={57} />
            <text x={x + 44} y="309" textAnchor="middle" fill={C.value} fontFamily={MONO} fontSize="18" fontWeight="700">{formatNumber(value, 2)}</text>
            <text x={x + 44} y="329" textAnchor="middle" fill={C.label} fontFamily={SANS} fontSize="10">{label}</text>
          </g>
        ))}

        {lapLabel && !compact && <text x="320" y="367" textAnchor="middle" fill="#83929E" fontFamily={MONO} fontSize="9" letterSpacing="1.2">{lapLabel}</text>}
      </g>
    </svg>
  );
}

const BODY = "M116 56 Q157 30 229 31 Q320 12 411 31 Q483 30 524 56 C552 74 565 117 566 188 L566 294 Q564 339 529 359 Q504 374 478 356 Q442 369 320 370 Q198 369 162 356 Q136 374 111 359 Q76 339 74 294 L74 188 C75 117 88 74 116 56Z";
const BODY_INSET = "M129 58 Q179 36 231 40 Q320 24 409 40 Q461 36 511 58 C531 81 545 122 545 182 L545 306 Q539 338 512 343 L474 333 Q414 353 320 353 Q226 353 166 333 L128 343 Q101 338 95 306 L95 182 C95 122 109 81 129 58Z";

function Grip({ side, fill }: { side: "left" | "right"; fill: string }) {
  const mirrored = side === "right" ? "translate(640 0) scale(-1 1)" : undefined;
  const shape = "M105 43 C69 39 39 77 23 132 C6 192 14 296 34 341 C46 373 73 392 102 377 C128 364 143 332 148 293 L150 111 C149 71 134 47 105 43Z M101 112 C85 109 68 142 60 185 C50 235 58 292 77 315 C87 329 100 318 105 303 C113 273 116 162 113 129 C112 117 108 113 101 112Z";
  return <g transform={mirrored}>
    <path d={shape} fill={fill} fillRule="evenodd" stroke="#05080C" strokeWidth="3" />
    <path d="M41 142 C21 219 29 315 55 355" fill="none" stroke="#74808B" strokeOpacity=".35" strokeWidth="3" />
    <path d="M92 58 C58 68 38 115 28 160" fill="none" stroke="#89949C" strokeOpacity=".4" strokeWidth="2" />
    <path d="M63 351 C82 377 111 366 124 329" fill="none" stroke="#ADB5BB" strokeOpacity=".3" strokeWidth="2" />
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${24 + i % 3} ${151 + i * 13} q12 5 23 7`} fill="none" stroke="#626D77" strokeOpacity=".26" strokeWidth="1" />)}
  </g>;
}

function Gloves({ color }: { color: string }) {
  const palm = "M48 150 C22 160 20 262 50 282 C84 300 126 284 132 246 L130 168 C128 140 84 136 48 150Z";
  const fingers = "M60 176 L118 172 M58 204 L120 200 M60 232 L120 228 M66 258 L118 252";
  return <>
    {[undefined, "translate(640 0) scale(-1 1)"].map((transform, i) => (
      <g key={i} transform={transform}>
        <path d={palm} fill={color} stroke="#05080C" strokeWidth="3" />
        <path d={palm} fill="none" stroke="#FFFFFF" strokeOpacity=".12" strokeWidth="1.5" transform="translate(2 -2)" />
        <path d={fingers} fill="none" stroke="#05080C" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
      </g>
    ))}
  </>;
}

function DashTile({ x, y, w, h, prominent, children }: { x: number; y: number; w: number; h: number; prominent?: boolean; children?: ReactNode }) {
  return <g>
    <rect x={x} y={y} width={w} height={h} rx="7" fill={prominent ? "#0B1825" : "#0B151F"} stroke={prominent ? "#435467" : C.line} strokeWidth="1" />
    {children}
  </g>;
}

function WheelButton({ cx, cy, r, color, label, dark }: { cx: number; cy: number; r: number; color: string; label: string; dark?: boolean }) {
  return <g>
    <circle cx={cx} cy={cy + 2} r={r + 5} fill="#03070A" stroke="#48525B" strokeWidth="1.5" />
    <circle cx={cx} cy={cy} r={r + 2} fill="#59636C" />
    <circle cx={cx} cy={cy} r={r} fill={color} stroke="#101820" strokeWidth="1" />
    <path d={`M${cx - r * .65} ${cy - r * .35} Q${cx} ${cy - r * 1.2} ${cx + r * .65} ${cy - r * .35}`} fill="none" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="1.5" />
    <text x={cx} y={cy + r * .34} textAnchor="middle" fill={dark ? "#12181D" : "#FFFFFF"} fontFamily={SANS} fontWeight="800" fontSize={label.length > 2 ? r * .7 : r * .95}>{label}</text>
  </g>;
}

function Rotary({ cx, cy, r, label }: { cx: number; cy: number; r: number; label: string }) {
  return <g>
    <circle cx={cx} cy={cy} r={r + 4} fill="#04080C" stroke="#4C5967" />
    <circle cx={cx} cy={cy} r={r} fill="#1E2933" stroke="#89929B" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = i * Math.PI / 6;
      return <line key={i} x1={cx + Math.cos(a) * r * .78} y1={cy + Math.sin(a) * r * .78} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke="#030608" strokeWidth="2" />;
    })}
    <circle cx={cx} cy={cy} r={r * .63} fill="#111820" stroke="#59616A" />
    <text x={cx} y={cy + 2} textAnchor="middle" fill="#D6DCE0" fontFamily={SANS} fontSize={r < 14 ? 6 : 7} fontWeight="700">{label}</text>
  </g>;
}

function Meter({ x, y, width, ratio, color }: { x: number; y: number; width: number; ratio: number; color: string }) {
  return <g>
    <rect x={x} y={y} width={width} height="7" rx="3.5" fill="#24303A" stroke="#3A4855" strokeWidth=".5" />
    <rect x={x} y={y} width={width * ratio} height="7" rx="3.5" fill={color} />
  </g>;
}
