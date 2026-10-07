import type { AnchorHTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
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
};

const NavContext = createContext<NavValue | null>(null);
const useNavValue = () => {
  const value = useContext(NavContext);
  if (!value) throw new Error("Link and useNav need a <DataAppNav> or <StaticNav> above them.");
  return value;
};

/** An in-app link: a real <a href> (so middle-click and cmd-click work). Build `to` with `routes.*`. */
export function Link(props: LinkProps) {
  return <>{useNavValue().renderLink(props)}</>;
}
/** The current path, its parsed route, and `navigate(to)` for the rare programmatic jump. */
export function useNav(): { pathname: string; route: Route; navigate: (to: string) => void } {
  const { pathname, navigate } = useNavValue();
  const route = useMemo(() => matchRoute(pathname), [pathname]);
  return { pathname, route, navigate };
}

function DataAppBridge({ children }: { children: ReactNode }) {
  const { pathname, navigate } = useDataAppLocation();
  const value = useMemo<NavValue>(() => ({ pathname, navigate, renderLink: props => <DataAppLink {...props}/> }), [pathname, navigate]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
/** Wrap the app once: mounts the host router and backs Link / useNav with it. */
export function DataAppNav({ children }: { children: ReactNode }) {
  return <DataAppRouter><DataAppBridge>{children}</DataAppBridge></DataAppRouter>;
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
