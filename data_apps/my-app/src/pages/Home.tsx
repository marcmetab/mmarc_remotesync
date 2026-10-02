import { useDataAppLocation } from "@metabase/embedding-sdk-react/data-app";

import { card, colors, primaryButton } from "../styles";

const features = [
  {
    title: "Fast to start",
    body: "React, TypeScript and Vite are wired up. Edit a page and see it live.",
  },
  {
    title: "Simple structure",
    body: "Pages live in src/pages, shared pieces in src/components.",
  },
  {
    title: "Ready for data",
    body: "No data source yet. Add Metabase queries and actions when you need them.",
  },
];

export default function Home() {
  const { navigate } = useDataAppLocation();

  return (
    <>
      <section style={{ textAlign: "center", padding: "32px 0 48px" }}>
        <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.15 }}>
          Welcome to My App
        </h1>

        <p
          style={{
            color: colors.textMuted,
            fontSize: 18,
            maxWidth: 560,
            margin: "16px auto 28px",
          }}
        >
          A starting point for your site. Replace this copy with your own.
        </p>

        <button
          type="button"
          style={primaryButton}
          onClick={() => navigate("/about")}
        >
          Learn more
        </button>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {features.map((feature) => (
          <div key={feature.title} style={card}>
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{feature.title}</h2>

            <p style={{ margin: 0, color: colors.textMuted }}>{feature.body}</p>
          </div>
        ))}
      </section>
    </>
  );
}
