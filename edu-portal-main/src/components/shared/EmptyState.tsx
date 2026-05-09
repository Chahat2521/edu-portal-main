"use client";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="animate-fade-in"
      style={{
        textAlign: "center",
        padding: "60px 40px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          margin: "0 auto 20px",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px", lineHeight: 1.6, maxWidth: 320, marginInline: "auto" }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: "none",
            background: "#7dc443",
            color: "white",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
            boxShadow: "0 4px 12px rgba(125,196,67,0.3)",
            transition: "all 0.15s ease",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
