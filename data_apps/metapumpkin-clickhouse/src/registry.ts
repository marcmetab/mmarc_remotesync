import type { ComponentType } from "react";
import type { PageName } from "./routes";
import type { PageProps, Scope } from "./types";

/**
 * Finds pages and their fixtures by file name, so a page appears in the app as soon as its files exist:
 *   src/pages/<Name>Page.tsx   exports `<Name>Page` (props: PageProps<its view model>)
 *   src/fixtures/<name>.ts     exports `fixture` (the view model for all regions) and, optionally,
 *                              `fixtureFor(scope)` when the mock data follows the region control
 * The app itself no longer uses this: App.tsx renders each page from its live hook (src/data/). It stays
 * as the fixture lookup by name for tools and tests; nothing imports it into the bundle.
 */
type Module = Record<string, unknown>;
const pages = import.meta.glob<Module>("./pages/*Page.tsx", { eager: true });
const fixtures = import.meta.glob<Module>("./fixtures/*.ts", { eager: true });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPage = ComponentType<PageProps<any>>;

export function pageComponent(name: PageName): AnyPage | null {
  const mod = pages[`./pages/${name}Page.tsx`];
  return ((mod?.[`${name}Page`] ?? mod?.default) as AnyPage | undefined) ?? null;
}
export function pageFixture(name: PageName, scope: Scope): unknown {
  const mod = fixtures[`./fixtures/${name.toLowerCase()}.ts`];
  if (!mod) return undefined;
  return typeof mod.fixtureFor === "function" ? (mod.fixtureFor as (scope: Scope) => unknown)(scope) : mod.fixture ?? mod.default;
}
