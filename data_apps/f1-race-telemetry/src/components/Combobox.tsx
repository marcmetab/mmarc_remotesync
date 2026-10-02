import { useEffect, useMemo, useRef, useState } from "react";

import { SANS, T } from "../lib/tokens";

export type ComboOption = {
  value: string;
  label: string;
  hint?: string;
};

/**
 * Searchable single-select. Opens its list on click/focus before any typing,
 * shows labels, and reports the raw value.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Search…",
  width = 260,
  disabled,
  ariaLabel,
}: {
  options: readonly ComboOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  // Closing on an outside click needs a document listener; pointer events are
  // not part of the sandbox's blocked listener set (typing/clipboard are).
  useEffect(() => {
    if (!open) {
      return;
    }
    const onDocumentDown = (event: MouseEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onDocumentDown);
    return () => document.removeEventListener("mousedown", onDocumentDown);
  }, [open]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term === "") {
      return options;
    }
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(term) ||
        (option.hint ?? "").toLowerCase().includes(term),
    );
  }, [options, search]);

  return (
    <div ref={rootRef} style={{ position: "relative", width, fontFamily: SANS }}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) {
            return;
          }
          setOpen((wasOpen) => !wasOpen);
          setSearch("");
          window.setTimeout(() => inputRef.current?.focus(), 0);
        }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          background: T.cardBg,
          border: `1px solid ${open ? T.accent : T.border}`,
          borderRadius: T.radiusSm,
          color: selected ? T.text : T.textFaint,
          fontSize: 13,
          fontWeight: 500,
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          opacity: disabled ? 0.55 : 1,
          fontFamily: SANS,
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selected?.label ?? placeholder}
        </span>
        <span aria-hidden style={{ color: T.textFaint, fontSize: 10 }}>
          ▼
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 40,
            background: T.cardBgRaised,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusSm,
            boxShadow: "0 18px 40px rgba(0,0,0,0.38)",
            overflow: "hidden",
          }}
        >
          <input
            ref={inputRef}
            value={search}
            placeholder={placeholder}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              background: T.cardBg,
              border: "none",
              borderBottom: `1px solid ${T.border}`,
              color: T.text,
              fontSize: 13,
              outline: "none",
              fontFamily: SANS,
            }}
          />
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px 14px", color: T.textFaint, fontSize: 13 }}>
                No matches
              </div>
            )}
            {filtered.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  style={{
                    width: "100%",
                    display: "block",
                    padding: "10px 14px",
                    background: isSelected ? T.accentSoft : "transparent",
                    border: "none",
                    borderLeft: `2px solid ${isSelected ? T.accent : "transparent"}`,
                    color: T.text,
                    fontSize: 13,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: SANS,
                  }}
                >
                  <span style={{ display: "block" }}>{option.label}</span>
                  {option.hint && (
                    <span
                      style={{ display: "block", fontSize: 11, color: T.textFaint, marginTop: 2 }}
                    >
                      {option.hint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
