import { createElement, type CSSProperties, type ReactElement, type ReactNode } from "react";

/*
 * The map's art is generated SVG markup (geo.ts, art.ts). It must not go in through innerHTML: inside Metabase the
 * data-app host passes every innerHTML write through an HTML sanitizer, which strips <use> (the terrain's land,
 * cliffs, beaches, trees and hills are all <use> copies of shared shapes) and would leave the islands blank.
 * React builds elements with the DOM API, which the host leaves alone, so the markup becomes React elements here.
 *
 * The parser reads only the well-formed markup our generator writes: elements with double-quoted attributes, no
 * text, comments or CDATA. Each string is parsed once and its element reused (elements are immutable, so the same
 * one can stand in many places: every shop shares one).
 */

const cache = new Map<string, ReactElement>();
const TAG = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g;
const ATTR = /([\w:-]+)="([^"]*)"/g;
const ENTITY: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&lt;": "<", "&gt;": ">", "&#39;": "'" };

const camel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
const unescape = (value: string) => value.replace(/&(amp|quot|lt|gt|#39);/g, m => ENTITY[m]);

/** "display: block; overflow: visible" → { display: "block", overflow: "visible" } (custom properties kept as written). */
function styleObject(text: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const part of text.split(";")) {
    const at = part.indexOf(":");
    if (at < 0) continue;
    const key = part.slice(0, at).trim(), value = part.slice(at + 1).trim();
    if (key) style[key.startsWith("--") ? key : camel(key)] = value;
  }
  return style as CSSProperties;
}

function props(text: string, key: number): Record<string, unknown> {
  const out: Record<string, unknown> = { key };
  for (const [, raw, value] of text.matchAll(ATTR)) {
    if (raw === "xmlns" || raw.startsWith("xmlns:")) continue; // React sets the SVG namespace itself
    const v = unescape(value);
    if (raw === "class") out.className = v;
    else if (raw === "style") out.style = styleObject(v);
    else if (raw === "xlink:href") out.href = v;
    else if (raw.startsWith("aria-") || raw.startsWith("data-")) out[raw] = v;
    else out[camel(raw)] = v;
  }
  return out;
}

function parse(markup: string): ReactElement {
  type Frame = { tag: string; props: Record<string, unknown>; children: ReactNode[] };
  const root: Frame = { tag: "", props: {}, children: [] };
  const stack: Frame[] = [root];
  for (const [, closing, tag, attrs, selfClosing] of markup.matchAll(TAG)) {
    const parent = stack[stack.length - 1];
    if (closing) {
      const frame = stack.pop()!;
      if (frame.tag !== tag) throw new Error(`markup: </${tag}> closes <${frame.tag}>`);
      stack[stack.length - 1].children.push(createElement(frame.tag, frame.props, ...frame.children));
    } else if (selfClosing) {
      parent.children.push(createElement(tag, props(attrs, parent.children.length)));
    } else {
      stack.push({ tag, props: props(attrs, parent.children.length), children: [] });
    }
  }
  if (stack.length !== 1 || root.children.length !== 1) throw new Error("markup: expected one root element");
  return root.children[0] as ReactElement;
}

/** The markup as a React element, parsed once per string. */
export function svgElement(markup: string): ReactElement {
  let element = cache.get(markup);
  if (!element) { element = parse(markup); cache.set(markup, element); }
  return element;
}
