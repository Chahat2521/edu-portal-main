"use client";

import { useEffect, useState } from "react";
import {
  getInitialThemePreference,
  resolveTheme,
  setThemePreference,
  type ThemePreference,
} from "@/lib/theme";
import { Icons } from "@/components/ui/Icons";

interface ThemeOption {
  value: ThemePreference;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

const OPTIONS: ThemeOption[] = [
  { value: "light",  Icon: Icons.Sun,     label: "Light"  },
  { value: "dark",   Icon: Icons.Moon,    label: "Dark"   },
];

export default function ThemeToggle({ compact }: { compact?: boolean } = {}) {
  const [pref, setPref] = useState<ThemePreference>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialThemePreference();
    setPref(initial === "system" ? resolveTheme("system") : initial);
    setMounted(true);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (getInitialThemePreference() === "system") {
        const next = mql.matches ? "dark" : "light";
        setPref(next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const applyTheme = (next: ThemePreference) => {
    // We only explicitly set light or dark from this toggle now
    setPref(next);
    setThemePreference(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) return null;

  const currentIndex = OPTIONS.findIndex((o) => o.value === pref);
  // Defaulting to index 0 if something is weird
  const idx = currentIndex >= 0 ? currentIndex : 0;
  const pillW = 32;

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
        padding: 4,
        gap: 0,
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          height: "calc(100% - 8px)",
          width: pillW,
          borderRadius: 999,
          background: "var(--card)",
          boxShadow: "var(--shadow-sm)",
          transform: `translateX(${idx * pillW}px)`,
          transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          top: 4,
          left: 4,
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
            padding: "6px",
            width: pillW,
            border: "none",
            background: "transparent",
            borderRadius: 999,
            cursor: "pointer",
            color: pref === opt.value ? "var(--text)" : "var(--muted)",
            transition: "color 0.2s ease",
            fontFamily: "inherit",
          }}
        >
          <opt.Icon width={16} height={16} />
        </button>
      ))}
    </div>
  );
}
