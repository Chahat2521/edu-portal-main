"use client";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "white",
        borderRadius: 50,
        border: "1px solid #e5e5e5",
        padding: "10px 16px",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 16 }}>🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: 14,
          fontFamily: "inherit",
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            cursor: "pointer",
            color: "#999",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
