/*
 * The Halloween card's landscape: peach sky, a cream moon, three clouds, two small bats, layered hills, bare
 * trees, the haunted house and a small pumpkin. This component is the card's copy of the art; the artist's
 * file, src/assets/halloween/halloween-background.svg (1444 x 696, text-free), is the original it was made
 * from and is not imported, so an edit there reaches the card only when copied here. Same paths and colours;
 * changed for the card:
 *   - no title, description, role or rounded clip (#card-clip; the card rounds its own corners);
 *   - bat-1 moved from 850,174 (behind the countdown) to 1036,438, at .82; bat-2 from 1370,300 (under the
 *     MetaBot's wing) to 1322,86, at .9 (BAT_1, BAT_2 below);
 *   - the small pumpkin a fifth smaller, its foot where it was (1089,586 at .8; the card crops the art large),
 *     and on the day (`patch`) two smaller pumpkins beside it;
 *   - cloud-1, cloud-3 and the bats drawn as sprites over the still art (below); gradient ids per instance.
 * Source group → class: #sky, #moon, #cloud-2, #hills-distant, -far, -mid, -house-ridge, #trees (tree-left,
 * -right), #house (windows, door), #hills-front, #grass-left, -right, #small-pumpkin → pd-scene-<the same
 * name> in the still art; #cloud-1, #cloud-3 → pd-scene-cloud is-1 / is-3; #bat-1, #bat-2 → pd-scene-bat
 * is-1 / is-2.
 * Inline, so halloween.css can move the bats and the clouds: each of those is its own small <svg> (a sprite),
 * placed over the still art in the art's coordinates, so its motion is a transform on an HTML element that the
 * compositor runs without repainting the landscape (the bats' drift on the sprite, their wingbeat on its <svg>,
 * both about the bat's own 0,0; cloud-2 stays still, off the card's crop).
 * The scene is a box at the art's ratio, as tall as the card and anchored bottom right (halloween.css): the card,
 * taller than the art, keeps the moon, the house and the pumpkin and crops empty sky on the left, where the
 * countdown sits.
 */
import type { CSSProperties, ReactNode } from "react";
import { useSvgIds } from "./FlyingMetabot";

const ART_W = 1444, ART_H = 696;
const pct = (n: number) => `${+(n * 100).toFixed(3)}%`;

/** A place in the art: x, y (the part's own 0,0) and a scale. */
type At = [x: number, y: number, scale: number];
/** Where the moving parts sit, in the art's coordinates (the clouds as in the source; the bats moved). */
const BAT_1: At = [1036, 438, .82], BAT_2: At = [1322, 86, .9], CLOUD_1: At = [1227, 112, 1], CLOUD_3: At = [644, 445, 1];

/**
 * A moving part of the scene: its own <svg>, drawn about the part's own 0,0 within `box` (x, y, w, h), placed
 * at `at` in % of the scene, so it lines up with the still art at any size. The sprite and its <svg> turn and
 * scale about the part's 0,0.
 */
function Sprite({ className, at: [x, y, k], box: [bx, by, bw, bh], children }: { className: string; at: At; box: [number, number, number, number]; children: ReactNode }) {
  const transformOrigin = `${pct(-bx / bw)} ${pct(-by / bh)}`;
  const place: CSSProperties = { left: pct((x + bx * k) / ART_W), top: pct((y + by * k) / ART_H), width: pct(bw * k / ART_W), height: pct(bh * k / ART_H), transformOrigin };
  return <span className={`pd-scene-sprite ${className}`} style={place}>
    <svg viewBox={`${bx} ${by} ${bw} ${bh}`} style={{ transformOrigin }} fill="none" aria-hidden="true" focusable="false">{children}</svg>
  </span>;
}

/** The landscape, decorative (aria-hidden). `patch`: two more pumpkins on the hill (Halloween day). */
export function HalloweenScene({ className, patch = false }: { className?: string; patch?: boolean }) {
  const id = useSvgIds();
  const sky = `${id}-sky`, moon = `${id}-moon`, far = `${id}-far`, mid = `${id}-mid`, front = `${id}-front`, ridge = `${id}-ridge`,
    bat1 = `${id}-bat-1`, bat2 = `${id}-bat-2`, glow = `${id}-glow`, pumpkin = `${id}-pumpkin`;
  /** The bats' fill (each bat's sprite carries its own copy). */
  const batFill = (gid: string) => <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
    <stop stopColor="#533144"/><stop offset="1" stopColor="#3F2635"/>
  </linearGradient></defs>;
  /** The small pumpkin, drawn about its own centre (so the patch can reuse it at other places and sizes). */
  const smallPumpkin = (transform: string, key?: string) => <g key={key} className="pd-scene-pumpkin" transform={transform}>
    <path fill="#61463C" d="M -9 -25 C -9 -43 1 -61 18 -68 C 29 -73 24 -61 25 -57 C 15 -51 11 -40 12 -26 Z"/>
    <path fill="#DF6C2D" d="M -21 -38 C -47 -44 -60 -23 -59 0 C -58 23 -42 47 -21 45 C -4 42 6 22 4 3 C 4 -17 -3 -34 -21 -38 Z"/>
    <path fill="#DF702F" d="M 18 -38 C 42 -41 61 -20 61 3 C 60 26 45 47 24 46 C 7 43 -4 21 -2 0 C -1 -20 5 -33 18 -38 Z"/>
    <path fill={`url(#${pumpkin})`} d="M 0 -39 C -20 -40 -33 -19 -33 6 C -33 32 -21 49 -5 50 C 16 52 28 31 29 6 C 30 -18 19 -38 0 -39 Z"/>
  </g>;
  return <div className={className} aria-hidden="true"><svg className="pd-scene-art" viewBox="0 0 1444 696" preserveAspectRatio="xMaxYMax slice" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={sky} x1="140" y1="0" x2="1200" y2="696" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBD6B7"/><stop offset="0.5" stopColor="#FDD8B8"/><stop offset="1" stopColor="#FBD4B2"/>
      </linearGradient>
      <linearGradient id={moon} x1="1100" y1="42" x2="1205" y2="397" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCECD9"/><stop offset="1" stopColor="#FBE7CF"/>
      </linearGradient>
      <linearGradient id={far} x1="0" y1="510" x2="1444" y2="647" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D49D97"/><stop offset="1" stopColor="#CE9891"/>
      </linearGradient>
      <linearGradient id={mid} x1="0" y1="555" x2="1444" y2="674" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BF6244"/><stop offset="0.55" stopColor="#C56847"/><stop offset="1" stopColor="#B95C40"/>
      </linearGradient>
      <linearGradient id={front} x1="0" y1="610" x2="1444" y2="696" gradientUnits="userSpaceOnUse">
        <stop stopColor="#603848"/><stop offset="0.6" stopColor="#5B3344"/><stop offset="1" stopColor="#613747"/>
      </linearGradient>
      <linearGradient id={ridge} x1="1320" y1="518" x2="1230" y2="696" gradientUnits="userSpaceOnUse">
        <stop stopColor="#482A39"/><stop offset="1" stopColor="#512E3E"/>
      </linearGradient>
      <linearGradient id={glow} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#FFBA66"/><stop offset="1" stopColor="#F4A34E"/>
      </linearGradient>
      <linearGradient id={pumpkin} x1="-20" y1="-34" x2="28" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F28C44"/><stop offset="1" stopColor="#F49A4D"/>
      </linearGradient>
    </defs>
    <rect className="pd-scene-sky" width="1444" height="696" fill={`url(#${sky})`}/>
    <circle className="pd-scene-moon" cx="1152" cy="219" r="177" fill={`url(#${moon})`}/>
    {/* cloud-2 stays in the still art (the card crops it); cloud-1, cloud-3 and the bats are sprites, below. */}
    <g className="pd-scene-cloud-2" transform="translate(0 441)" fill="#FACBA6">
      <path d="M -9 46 C -1 30 12 25 32 31 C 37 11 50 0 67 0 C 83 0 95 13 98 31 C 115 26 126 35 133 47 C 138 57 111 56 97 56 C 56 56 18 56 -9 52 Z"/>
    </g>
    <path className="pd-scene-hills-distant" fill="#E7B5A1" d="M 1040 573 C 1104 551 1156 492 1200 497 C 1268 494 1301 539 1378 532 C 1404 530 1424 526 1444 530 L 1444 696 H 1040 Z"/>
    <path className="pd-scene-hills-far" fill={`url(#${far})`} d="M 0 541 C 142 493 259 478 416 511 C 550 535 656 571 785 562 C 938 552 1030 535 1158 532 C 1279 529 1355 518 1444 545 L 1444 696 H 0 Z"/>
    <path className="pd-scene-hills-mid" fill={`url(#${mid})`} d="M 0 622 C 149 581 308 555 465 571 C 615 586 735 608 881 584 C 1036 559 1212 545 1444 554 L 1444 696 H 0 Z"/>
    <path className="pd-scene-hills-house-ridge" fill={`url(#${ridge})`} d="M 876 696 C 999 659 1128 613 1248 570 C 1305 549 1337 536 1380 544 C 1403 539 1425 541 1444 550 L 1444 696 Z"/>
    <g className="pd-scene-trees" fill="none" stroke="#4A2C3B" strokeLinecap="round" strokeLinejoin="round">
      <g className="pd-scene-tree-left">
        <path strokeWidth="10" d="M 1288 550 C 1290 523 1282 505 1273 482"/>
        <path strokeWidth="5.5" d="M 1285 520 L 1265 504 L 1253 480 M 1276 490 L 1268 470 L 1260 456 M 1276 490 L 1284 474 L 1287 458 M 1266 478 L 1252 473 M 1274 513 L 1260 507 L 1250 499 M 1286 525 L 1298 508 L 1301 493"/>
        <path strokeWidth="3.1" d="M 1268 470 L 1261 456 M 1252 473 L 1251 463 M 1287 458 L 1288 454 M 1260 507 L 1255 493"/>
      </g>
      <g className="pd-scene-tree-right">
        <path strokeWidth="7" d="M 1418 555 L 1424 532 L 1430 525"/>
        <path strokeWidth="3.8" d="M 1423 536 L 1414 522 L 1412 511 M 1427 529 L 1434 509 M 1430 525 L 1441 516 M 1434 509 L 1436 506"/>
      </g>
    </g>
    <g className="pd-scene-house" transform="translate(1294 359)">
      <path fill="#452A38" stroke="#452A38" strokeWidth="3.2" strokeLinejoin="round" d="M 1 113 C 19 97 29 76 34 55 C 38 77 46 97 64 112 L 64 61 L 57 60 C 68 43 75 18 81 0 C 84 24 92 45 100 62 L 93 62 L 93 131 C 101 119 108 102 112 80 C 116 101 122 118 130 132 L 124 132 L 124 197 L 8 197 L 8 113 Z"/>
      <g className="pd-scene-house-windows" fill={`url(#${glow})`}>
        <path d="M 75 91 L 75 76 C 75 69 84 69 84 76 L 84 91 Z"/>
        <path d="M 29 135 L 29 122 C 29 113 42 113 42 122 L 42 135 Z"/>
        <path d="M 72 173 L 72 156 C 72 145 86 145 86 156 L 86 173 Z"/>
        <path d="M 108 154 L 108 143 C 108 137 115 137 115 143 L 115 154 Z"/>
      </g>
      <path stroke="#452A38" strokeWidth="2.4" d="M 73 81 H 86 M 35.5 114 V 137 M 27 124 H 44 M 79 146 V 175 M 70 159 H 88"/>
      <path className="pd-scene-house-door" fill={`url(#${glow})`} d="M 28 197 L 28 170 C 28 155 47 151 47 170 L 47 197 Z"/>
    </g>
    <path className="pd-scene-hills-front" fill={`url(#${front})`} d="M 0 626 C 104 643 250 615 393 629 C 529 652 672 632 817 614 C 959 596 1049 602 1167 632 C 1269 654 1367 680 1444 696 H 0 Z"/>
    <path className="pd-scene-grass-left" fill="#603848" d="M 8 655 C 0 639 -8 624 -9 616 C 4 617 14 631 21 639 C 21 625 21 610 27 596 C 34 593 38 629 37 637 C 41 619 49 599 60 592 C 68 586 64 608 50 636 C 60 622 73 614 83 616 C 87 618 70 633 65 645 C 75 637 89 631 96 634 C 100 636 83 653 77 660 Z"/>
    <path className="pd-scene-grass-right" fill="#653D4F" d="M 1327 658 C 1320 642 1311 626 1313 618 C 1318 615 1334 636 1337 646 C 1337 621 1344 604 1356 596 C 1366 588 1361 614 1351 648 C 1363 635 1377 629 1385 630 C 1394 630 1372 653 1365 661 Z"/>
    {patch && smallPumpkin("translate(1008 600) scale(.56)", "left")}
    {smallPumpkin("translate(1089 586) scale(.8)")}
    {patch && smallPumpkin("translate(1164 610) scale(.62)", "right")}
  </svg>
    {/* Over the still art, in the source's order (clouds, then bats); none of them overlaps the hills. */}
    <Sprite className="pd-scene-cloud is-1" at={CLOUD_1} box={[-4, -1, 194, 80]}>
      <path fill="#FACBA6" d="M 2 57 C 13 41 28 34 45 40 C 49 14 66 0 88 0 C 111 0 127 17 129 38 C 150 31 171 41 183 60 C 188 67 179 70 167 72 C 123 78 50 72 10 70 C 0 69 -3 65 2 57 Z"/>
    </Sprite>
    <Sprite className="pd-scene-cloud is-3" at={CLOUD_3} box={[-4, -1, 160, 63]}>
      <path fill="#FACBA6" d="M 2 46 C 13 33 24 28 38 33 C 43 13 55 0 75 0 C 95 0 108 14 112 32 C 127 26 140 34 149 46 C 154 53 147 56 136 58 C 94 61 50 59 10 57 C 1 57 -3 54 2 46 Z"/>
    </Sprite>
    <Sprite className="pd-scene-bat is-1" at={BAT_1} box={[-62, -47, 125, 79]}>
      {batFill(bat1)}
      <path fill={`url(#${bat1})`} stroke="#432A39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M -59 6 C -43 -15 -24 -16 -9 -2 L -3 1 L -6 -10 L 5 -4 L 9 -15 L 17 -2 C 25 -8 21 -27 33 -35 C 42 -42 55 -45 61 -42 C 46 -33 45 -24 52 -12 C 38 -10 34 -3 38 7 C 21 7 20 19 17 29 C 6 23 1 13 -7 17 C -15 19 -17 25 -18 25 C -22 17 -25 11 -33 14 C -37 5 -49 3 -59 6 Z"/>
    </Sprite>
    <Sprite className="pd-scene-bat is-2" at={BAT_2} box={[-48, -29, 93, 52]}>
      {batFill(bat2)}
      <path fill={`url(#${bat2})`} stroke="#432A39" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" d="M -46 -25 C -24 -27 -15 -17 -16 -5 L -8 -8 L -2 0 L 1 -12 L 7 0 C 17 -11 27 -9 43 0 C 29 -4 26 1 24 10 C 14 7 7 15 7 21 C -2 14 -7 13 -12 18 C -14 9 -18 5 -24 8 C -23 -3 -30 -8 -37 -7 C -32 -15 -37 -22 -46 -25 Z"/>
    </Sprite>
  </div>;
}
