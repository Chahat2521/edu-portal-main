"use client";

import { useEffect } from "react";
import { getInitialThemePreference, resolveTheme } from "@/lib/theme";

export default function ThemeInitializer() {
  useEffect(() => {
    const applyTheme = (pref: string) => {
      const resolved = resolveTheme(pref as any);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    const pref = getInitialThemePreference();
    applyTheme(pref);

    // Listen to system colour-scheme changes and re-apply when pref = 'system'
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const currentPref = getInitialThemePreference();
      if (currentPref === "system") {
        applyTheme("system");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return null;
}
