"use client";

import { useEffect, useState } from "react";
import {
  cycleThemePreference,
  getInitialThemePreference,
  resolveTheme,
  setThemePreference,
  type ThemePreference,
} from "@/lib/theme";

interface ThemeOption {
  value: ThemePreference;
  icon: string;
  label: string;
}

const OPTIONS: ThemeOption[] = [
  { value: "light",  icon: "☀️",  label: "Light"  },
  { value: "dark",   icon: "🌙",  label: "Dark"   },
  { value: "system", icon: "🖥️", label: "System" },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [pref, setPref] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPref(getInitialThemePreference());
    setMounted(true);

    // Listen to system changes
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const currentPref = getInitialThemePreference();
      if (currentPref === "system") {
        document.documentElement.classList.toggle("dark", mql.matches);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const applyTheme = (next: ThemePreference) => {
    setPref(next);
    setThemePreference(next);
    const resolved = resolveTheme(next);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  };

  if (!mounted) return null;

  const currentIndex = OPTIONS.findIndex((o) => o.value === pref);

  return (
    <div
      role="group"
      aria-label="Theme switcher"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: 3,
        gap: 0,
        position: "relative",
      }}
    >
      {/* Sliding pill indicator */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          height: "calc(100% - 6px)",
          width: compact ? 28 : 60,
          borderRadius: 999,
          background: "var(--card)",
          boxShadow: "var(--shadow-sm)",
          transform: `translateX(${currentIndex * (compact ? 28 : 60)}px)`,
          transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          top: 3,
          left: 3,
        }}
      />
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => applyTheme(opt.value)}
          title={opt.label}
          aria-pressed={pref === opt.value}
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: compact ? 0 : 4,
            padding: compact ? "4px 6px" : "5px 10px",
            width: compact ? 28 : 60,
            border: "none",
            background: "transparent",
            borderRadius: 999,
            fontSize: compact ? 14 : 12,
            fontWeight: 600,
            cursor: "pointer",
            color: pref === opt.value ? "var(--text)" : "var(--muted)",
            transition: "color 0.2s ease",
            fontFamily: "inherit",
          }}
        >
          <span style={{ fontSize: compact ? 14 : 13, lineHeight: 1 }}>{opt.icon}</span>
          {!compact && (
            <span style={{ fontSize: 11, letterSpacing: "0.01em" }}>{opt.label}</span>
          )}
        </button>
      ))}
    </div>
  );
}
