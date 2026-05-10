"use client";
import { useEffect } from "react";

/**
 * Auth layout — forces light mode so login/signup/forgot/reset
 * pages are always white regardless of the user's saved theme preference.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Save current class list, force light mode for auth
    const html = document.documentElement;
    const hadDark = html.classList.contains("dark");
    html.classList.remove("dark");
    html.setAttribute("data-auth", "true");

    return () => {
      // Restore user's preferred theme when navigating away
      html.removeAttribute("data-auth");
      const saved = localStorage.getItem("edu_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark =
        saved === "dark" || (saved !== "light" && prefersDark) || (!saved && hadDark);
      html.classList.toggle("dark", shouldBeDark);
    };
  }, []);

  return (
    // Force white background via inline style in case CSS vars are stale
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        // Override key CSS vars for the auth subtree to always be light
        // These match the :root (light) token values from globals.css
      }}
    >
      {children}
    </div>
  );
}
