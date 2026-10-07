/*
 * The flying MetaBot: the pumpkin with the cream face on two plum bat wings, drawn inline so halloween.css can
 * move its parts (an <img> keeps its groups out of reach). This component is the card's copy of the art; the
 * artist's file, src/assets/halloween/flying-metabot.svg (640 x 400), is the original it was made from and is
 * not imported, so an edit there reaches the card only when copied here. Same paths and colours; changed for
 * the card:
 *   - cropped to the character with room for the wings' flap (viewBox 40 40 572 304, not 0 0 640 400);
 *   - split into layers (below), so the eyes leave #face for a layer of their own;
 *   - the whoosh wrapped in pd-metabot-hush, which hides it while the MetaBot loops;
 *   - no title, description or role (decorative), gradient ids made per instance (useId).
 * Each moving part is its own layer, an <svg> over the same box, so the motion is a transform on an HTML
 * element that the compositor runs without repainting the art. Layers, back to front (source group → class):
 *   #wing-left, #wing-right → pd-metabot-wing is-left / is-right (shoulder at 220,212 / 452,254, the source's
 *                             anchors); turns about the shoulder
 *   #stem, #pumpkin-shell, #face (panel, smile) → pd-metabot-body (pd-metabot-stem, -shell, -face, -smile)
 *   #eyes   → pd-metabot-eyes (they blink)
 *   #whoosh → pd-metabot-whoosh, in pd-metabot-hush
 */
import { type ReactNode, useId } from "react";

/** A per-instance prefix for SVG ids: useId without its colons, so it reads cleanly in url(#…). */
export function useSvgIds() {
  return useId().replace(/:/g, "");
}

/** The character's box in the source's coordinates: every layer draws in it. */
const BOX = "40 40 572 304";

/** One layer of the character. */
const Layer = ({ className, children }: { className: string; children: ReactNode }) =>
  <svg className={className} viewBox={BOX} fill="none" aria-hidden="true" focusable="false">{children}</svg>;

/** A wing's fill (each wing layer carries its own copy). */
const WingFill = ({ id }: { id: string }) => <linearGradient id={id} x1="0" y1="0" x2="0.8" y2="1">
  <stop stopColor="#704151"/><stop offset="1" stopColor="#512D40"/>
</linearGradient>;

/** The MetaBot, decorative (aria-hidden). Size the box from outside (572:304); the layers fill it. */
export function FlyingMetabot({ className }: { className?: string }) {
  const id = useSvgIds();
  const wingL = `${id}-wing-l`, wingR = `${id}-wing-r`, left = `${id}-left`, right = `${id}-right`, center = `${id}-center`, stem = `${id}-stem`, face = `${id}-face`;
  return <div className={className ? `pd-metabot ${className}` : "pd-metabot"} aria-hidden="true">
    <Layer className="pd-metabot-wing is-left">
      <defs><WingFill id={wingL}/></defs>
      <g transform="translate(220 212)" strokeLinejoin="round" strokeLinecap="round">
        <path fill={`url(#${wingL})`} stroke="#432738" strokeWidth="6.5" d="M 2 -27 L -43 -58 C -72 -75 -137 -43 -171 -8 Q -176 -2 -172 -4 C -142 -15 -99 -2 -85 38 C -60 19 -32 22 -4 39 L 14 6 Z"/>
        <path fill="#754557" opacity="0.32" d="M -164 -9 C -127 -42 -82 -58 -47 -53 C -72 -29 -77 5 -85 31 C -96 1 -130 -16 -164 -9 Z"/>
        <path stroke="#47283A" strokeWidth="6.5" d="M -43 -58 C -61 -30 -76 8 -85 38"/>
      </g>
    </Layer>
    <Layer className="pd-metabot-wing is-right">
      <defs><WingFill id={wingR}/></defs>
      <g transform="translate(452 254)" strokeLinejoin="round" strokeLinecap="round">
        <path fill={`url(#${wingR})`} stroke="#432738" strokeWidth="6.5" d="M 7 -16 L 46 -31 C 58 -35 86 -19 106 1 C 125 19 137 39 140 54 C 112 33 83 38 62 53 C 54 59 49 65 45 70 C 37 53 23 45 2 47 L -16 54 Z"/>
        <path fill="#774758" opacity="0.3" d="M 51 -23 C 81 -11 118 22 134 45 C 107 31 80 37 52 57 C 59 28 58 1 51 -23 Z"/>
        <path stroke="#47283A" strokeWidth="6.5" d="M 46 -31 C 54 -1 54 35 45 70"/>
      </g>
    </Layer>
    <Layer className="pd-metabot-body">
      <defs>
        <linearGradient id={left} x1="201" y1="139" x2="314" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F89E42"/><stop offset="1" stopColor="#EF8B38"/>
        </linearGradient>
        <linearGradient id={right} x1="395" y1="147" x2="456" y2="315" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F69B42"/><stop offset="1" stopColor="#EC8533"/>
        </linearGradient>
        <linearGradient id={center} x1="281" y1="128" x2="382" y2="332" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F79D46"/><stop offset="0.55" stopColor="#EE8F3B"/><stop offset="1" stopColor="#F49A43"/>
        </linearGradient>
        <linearGradient id={stem} x1="346" y1="80" x2="379" y2="132" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D9545"/><stop offset="1" stopColor="#4D7137"/>
        </linearGradient>
        <linearGradient id={face} x1="269" y1="181" x2="383" y2="288" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCF8F2"/><stop offset="1" stopColor="#F7F2ED"/>
        </linearGradient>
      </defs>
      <g stroke="#38271F" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round">
        <g className="pd-metabot-stem">
          <path fill={`url(#${stem})`} d="M 327 120 C 339 88 362 61 389 57 C 397 55 405 55 407 60 C 409 64 402 69 397 75 C 381 93 373 112 373 131 C 357 136 340 130 327 120 Z"/>
          <path fill="#83A453" opacity="0.36" stroke="none" d="M 334 116 C 348 83 370 65 399 63 C 379 75 360 94 352 124 Z"/>
        </g>
        <g className="pd-metabot-shell">
          <path fill={`url(#${left})`} d="M 316 121 C 293 111 265 116 242 131 C 211 151 193 181 194 220 C 192 263 214 297 246 307 C 260 312 277 313 291 309 L 303 280 L 299 157 Z"/>
          <path fill={`url(#${right})`} d="M 383 132 C 416 126 450 148 464 182 C 480 220 470 268 449 297 C 429 323 398 341 368 332 L 352 305 L 376 252 L 400 167 Z"/>
          <path fill={`url(#${center})`} d="M 325 123 C 304 117 281 137 263 166 C 248 192 240 217 244 254 C 247 288 265 316 291 322 C 309 327 331 331 347 332 C 369 335 387 316 402 289 C 417 262 423 233 419 207 C 416 172 408 145 390 133 C 370 129 348 133 325 123 Z"/>
        </g>
        <g className="pd-metabot-face">
          <path fill={`url(#${face})`} d="M 283 173 C 263 170 249 181 242 201 C 234 221 234 244 243 259 C 251 271 267 274 290 279 L 372 291 C 391 294 405 283 412 265 C 420 244 422 221 415 206 C 410 196 403 192 389 189 Z"/>
          <path className="pd-metabot-smile" stroke="none" fill="#38271F" d="M 312 237 C 308 234 303 238 305 247 C 307 258 317 266 330 266 C 342 266 351 257 351 248 C 351 242 347 240 343 244 C 337 249 321 246 316 243 C 314 242 314 239 312 237 Z"/>
        </g>
      </g>
    </Layer>
    <Layer className="pd-metabot-eyes">
      <g fill="#38271F">
        <ellipse cx="280.5" cy="223.5" rx="14.6" ry="15.3" transform="rotate(8 280.5 223.5)"/>
        <ellipse cx="376" cy="240.5" rx="14.5" ry="15.1" transform="rotate(8 376 240.5)"/>
      </g>
    </Layer>
    {/* The motion lines would point every which way mid-loop: their wrapper fades them out for it. */}
    <span className="pd-metabot-hush">
      <Layer className="pd-metabot-whoosh">
        <g stroke="#E78235" strokeWidth="8" strokeLinecap="round">
          <path d="M 151 287 L 177 277"/>
          <path d="M 170 323 L 190 302"/>
        </g>
      </Layer>
    </span>
  </div>;
}
