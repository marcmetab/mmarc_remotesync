import { colors } from "../styles";

export default function About() {
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ margin: "0 0 16px" }}>About</h1>

      <p style={{ color: colors.textMuted, lineHeight: 1.6 }}>
        Use this page to say what the app is for and who it is for.
      </p>

      <p style={{ color: colors.textMuted, lineHeight: 1.6 }}>
        Edit src/pages/About.tsx to change this text.
      </p>
    </div>
  );
}
