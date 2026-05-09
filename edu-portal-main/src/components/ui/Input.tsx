"use client";
import { ReactNode } from "react";

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  rightElement?: ReactNode;
  error?: string;
}

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  rightElement,
  error,
}: InputProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: rightElement ? "12px 44px 12px 14px" : "12px 14px",
            borderRadius: 10,
            fontSize: 14,
            border: error ? "1.5px solid #f43f5e" : "1.5px solid #e8e8e8",
            outline: "none",
            fontFamily: "var(--font-dm-sans)",
            color: "#333",
            boxSizing: "border-box",
          }}
        />
        {rightElement && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: "#f43f5e", marginTop: 4 }}>{error}</p>}
    </div>
  );
}
