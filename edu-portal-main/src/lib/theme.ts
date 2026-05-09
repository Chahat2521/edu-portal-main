export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "edu_theme";

export function getInitialThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  // system
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function setThemePreference(next: ThemePreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, next);
}

export function cycleThemePreference(current: ThemePreference): ThemePreference {
  // system -> light -> dark -> system
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}
