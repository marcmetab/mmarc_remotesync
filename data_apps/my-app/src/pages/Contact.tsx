import { type CSSProperties, type FormEvent, useState } from "react";

import { colors, primaryButton } from "../styles";

const field: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: 6,
  padding: "10px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  font: "inherit",
};

const label: CSSProperties = {
  display: "block",
  marginBottom: 16,
  fontSize: 14,
  fontWeight: 600,
};

export default function Contact() {
  const [sent, setSent] = useState(false);

  // No backend yet: the form only flips to a confirmation message.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ margin: "0 0 16px" }}>Contact</h1>

      {sent ? (
        <p style={{ color: colors.textMuted }}>
          Thanks, your message has been noted.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label style={label}>
            Name
            <input name="name" required style={field} />
          </label>

          <label style={label}>
            Email
            <input name="email" type="email" required style={field} />
          </label>

          <label style={label}>
            Message
            <textarea name="message" rows={5} required style={field} />
          </label>

          <button type="submit" style={primaryButton}>
            Send
          </button>
        </form>
      )}
    </div>
  );
}
