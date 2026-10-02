import {
  DataAppLink,
  useDataAppLocation,
} from "@metabase/embedding-sdk-react/data-app";
import type { ReactNode } from "react";

import { pages } from "../pages";
import { colors, container } from "../styles";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useDataAppLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: colors.text,
        background: colors.background,
      }}
    >
      <header style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div
          style={{
            ...container,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <strong style={{ fontSize: 18 }}>My App</strong>

          <nav style={{ display: "flex", gap: 4 }}>
            {pages.map((page) => {
              const active = page.path === pathname;

              return (
                <DataAppLink
                  key={page.path}
                  to={page.path}
                  style={{
                    background: active ? colors.surface : "transparent",
                    color: active ? colors.brand : colors.textMuted,
                    borderRadius: 6,
                    padding: "8px 12px",
                    fontSize: 15,
                    fontWeight: active ? 600 : 400,
                    textDecoration: "none",
                  }}
                >
                  {page.label}
                </DataAppLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main style={{ ...container, flex: 1, paddingTop: 40, paddingBottom: 40 }}>
        {children}
      </main>

      <footer
        style={{
          borderTop: `1px solid ${colors.border}`,
          color: colors.textMuted,
          fontSize: 14,
        }}
      >
        <div style={{ ...container, paddingTop: 16, paddingBottom: 16 }}>
          © {new Date().getFullYear()} My App
        </div>
      </footer>
    </div>
  );
}
