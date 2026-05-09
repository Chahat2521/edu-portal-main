"use client";
import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  confirmColor = "#ef4444",
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          width: "420px",
          maxWidth: "100%",
          padding: "32px",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.1)",
              border: "2px solid rgba(239,68,68,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 16px",
            }}
          >
            ⚠️
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
            {title}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{message}</p>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-secondary)",
              color: "var(--text)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              background: confirmColor,
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              opacity: loading ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            {loading && (
              <span className="animate-spin" style={{ display: "inline-block", fontSize: 14 }}>⟳</span>
            )}
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
