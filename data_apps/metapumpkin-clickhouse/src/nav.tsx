import type { AnchorHTMLAttributes, FocusEvent, PointerEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { DataAppLink, DataAppRouter, useDataAppLocation } from "@metabase/embedding-sdk-react/data-app";
import { matchRoute, type Route } from "./routes";

/**
 * Navigation for pages and components, independent of where the app runs.
 * Inside Metabase the tree sits under <DataAppNav> (the host router); the static preview uses
 * <StaticNav> (plain anchors). Pages only ever import `Link` and `useNav` from here.
 */

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string; children?: ReactNode };
type NavValue = {
  pathname: string;
  navigate: (to: string) => void;
  renderLink: (props: LinkProps) => ReactNode;
  /** A link may be followed soon (the live app warms its page: src/data/warm.tsx). */
  prefetch?: Prefetch;
};
export type Prefetch = (to: string) => void;

/** A mouse resting on a link this long counts as intent; passing over it on the way elsewhere does not (ms). */
const INTENT_MS = 250;

const NavContext = createContext<NavValue | null>(null);
const useNavValue = () => {
  const value = useContext(NavContext);
  if (!value) throw new Error("Link and useNav need a <DataAppNav> or <StaticNav> above them.");
  return value;
};

/**
 * An in-app link: a real <a href> (so middle-click and cmd-click work). Build `to` with `routes.*`. A mouse resting on
 * it, or keyboard focus, tells the app it may be followed, so the page it opens can start loading first.
 */
export function Link(props: LinkProps) {
  const nav = useNavValue();
  const intent = useIntent(props, nav.prefetch);
  return <>{nav.renderLink({ ...props, ...intent })}</>;
}

/**
 * The handlers that report a link's intent; they keep the link's own. None without `prefetch` (the static preview).
 * Not a press: the page's own load starts right after it, and the host does not share a query sent twice. Not touch
 * either: a finger lands on a link on its way to scrolling the list it is in.
 */
function useIntent({ to, onPointerEnter, onPointerLeave, onPointerDown, onFocus }: LinkProps, prefetch?: Prefetch) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!prefetch) return {};
  return {
    onPointerEnter: (e: PointerEvent<HTMLAnchorElement>) => {
      onPointerEnter?.(e);
      clearTimeout(timer.current);
      if (e.pointerType === "mouse") timer.current = setTimeout(() => prefetch(to), INTENT_MS);
    },
    onPointerLeave: (e: PointerEvent<HTMLAnchorElement>) => { onPointerLeave?.(e); clearTimeout(timer.current); },
    onPointerDown: (e: PointerEvent<HTMLAnchorElement>) => { onPointerDown?.(e); clearTimeout(timer.current); },
    onFocus: (e: FocusEvent<HTMLAnchorElement>) => {
      onFocus?.(e);
      // Keyboard focus only: a click focuses the link too, and its page loads anyway.
      try { if (e.currentTarget.matches(":focus-visible")) prefetch(to); } catch { /* no :focus-visible here */ }
    },
  };
}
/** The current path, its parsed route, and `navigate(to)` for the rare programmatic jump. */
export function useNav(): { pathname: string; route: Route; navigate: (to: string) => void } {
  const { pathname, navigate } = useNavValue();
  const route = useMemo(() => matchRoute(pathname), [pathname]);
  return { pathname, route, navigate };
}

function DataAppBridge({ prefetch, children }: { prefetch?: Prefetch; children: ReactNode }) {
  const { pathname, navigate } = useDataAppLocation();
  const value = useMemo<NavValue>(() => ({ pathname, navigate, renderLink: props => <DataAppLink {...props}/>, prefetch }), [pathname, navigate, prefetch]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
/** Wrap the app once: mounts the host router and backs Link / useNav with it. `prefetch` hears every link's intent. */
export function DataAppNav({ prefetch, children }: { prefetch?: Prefetch; children: ReactNode }) {
  return <DataAppRouter><DataAppBridge prefetch={prefetch}>{children}</DataAppBridge></DataAppRouter>;
}

/** Static preview: links are plain anchors and nothing navigates. */
export function StaticNav({ pathname = "/", children }: { pathname?: string; children: ReactNode }) {
  const value = useMemo<NavValue>(() => ({
    pathname,
    navigate: () => {},
    renderLink: ({ to, children: content, ...rest }) => <a href={to} {...rest}>{content}</a>,
  }), [pathname]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
