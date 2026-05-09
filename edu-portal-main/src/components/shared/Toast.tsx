"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_CONFIG: Record<ToastType, { icon: string; accent: string; bg: string; border: string; color: string }> = {
  success: { icon: "✅", accent: "#22c55e", bg: "var(--success-bg)",  border: "var(--success-border)",  color: "var(--success-text)"  },
  error:   { icon: "🚫", accent: "#ef4444", bg: "var(--error-bg)",    border: "var(--error-border)",    color: "var(--error-text)"    },
  warning: { icon: "⚠️",  accent: "#f59e0b", bg: "var(--warning-bg)", border: "var(--warning-border)", color: "var(--warning-text)"  },
  info:    { icon: "💡", accent: "#4fa3e0", bg: "var(--info-bg)",     border: "var(--info-border)",     color: "var(--info-text)"     },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 360,
          width: "100%",
        }}
      >
        {toasts.map((toast) => {
          const cfg = TOAST_CONFIG[toast.type];
          return (
            <div
              key={toast.id}
              className="animate-slide-down"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderLeft: `4px solid ${cfg.accent}`,
                color: cfg.color,
                padding: "12px 16px",
                borderRadius: 10,
                boxShadow: "var(--shadow-md)",
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
              }}
              onClick={() => dismiss(toast.id)}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>
              <span style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: cfg.color, fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
