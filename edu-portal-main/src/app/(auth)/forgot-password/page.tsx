"use client";
import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");
  const [devLink, setDevLink]   = useState("");
  const [touched, setTouched]   = useState(false);

  const emailErr = !email.trim() ? "Email is required" : !EMAIL_RE.test(email.trim()) ? "Enter a valid email address" : "";
  const showErr  = touched && emailErr;

  const handleSubmit = async () => {
    setTouched(true);
    setError("");
    if (emailErr) return;

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      if (data.devResetUrl) setDevLink(data.devResetUrl);
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        fontFamily: "'DM Sans', sans-serif",
        padding: 16,
      }}
    >
      {/* Theme toggle fixed top-right */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div
        className="animate-fade-in"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "48px 44px",
          maxWidth: 420,
          width: "100%",
          boxShadow: "var(--shadow-lg)",
          textAlign: "center",
        }}
      >
        {sent ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📬</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 12px" }}>
              Check your email!
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              If <strong style={{ color: "var(--text)" }}>{email}</strong> is registered, you will receive password reset instructions shortly.
            </p>
            <div
              style={{
                background: "var(--info-bg)",
                border: "1px solid var(--info-border)",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 13,
                color: "var(--info-text)",
                marginBottom: 28,
                textAlign: "left",
              }}
            >
              💡 The link expires in <strong>1 hour</strong>. Check your spam folder if you don&apos;t see it.
            </div>

            {/* Dev mode: show reset link directly */}
            {devLink && (
              <div
                style={{
                  background: "var(--warning-bg)",
                  border: "1px solid var(--warning-border)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 24,
                  fontSize: 12,
                  color: "var(--warning-text)",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 13 }}>🛠️ Dev Mode — Reset Link:</div>
                <a
                  href={devLink}
                  style={{ color: "var(--info-text)", wordBreak: "break-all", fontWeight: 600 }}
                >
                  {devLink}
                </a>
                <div style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>
                  This link is only shown locally. In production, it would be emailed.
                </div>
              </div>
            )}

            <Link
              href="/login"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #7dc443, #a8e063)",
                color: "#fff",
                padding: "12px 32px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(125,196,67,0.3)",
              }}
            >
              ← Back to Login
            </Link>
          </>
        ) : (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #c8f08f, #7dc443)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                margin: "0 auto 20px",
                boxShadow: "0 4px 16px rgba(125,196,67,0.3)",
              }}
            >
              🔑
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>
              Forgot Password?
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              No worries! Enter your email and we&apos;ll send you reset instructions.
            </p>

            <div style={{ textAlign: "left", marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Email Address
                {touched && !emailErr && <span style={{ color: "var(--input-success)", marginLeft: 6 }}>✓</span>}
              </label>
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onBlur={() => setTouched(true)}
                onKeyDown={handleKeyDown}
                placeholder="you@university.edu"
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontSize: 14,
                  border: `1.5px solid ${showErr ? "var(--input-error)" : touched && !emailErr ? "var(--input-success)" : "var(--input-border)"}`,
                  outline: "none",
                  fontFamily: "inherit",
                  color: "var(--text)",
                  background: "var(--input-bg)",
                  boxSizing: "border-box",
                  boxShadow: showErr ? "0 0 0 3px rgba(239,68,68,0.12)" : touched && !emailErr ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
              {showErr && (
                <p className="animate-slide-down" style={{ fontSize: 12, color: "var(--error-text)", marginTop: 5 }}>
                  ⚠ {emailErr}
                </p>
              )}
              {error && (
                <p className="animate-slide-down" style={{ fontSize: 12, color: "var(--error-text)", marginTop: 5 }}>
                  🚫 {error}
                </p>
              )}
            </div>

            <button
              id="forgot-submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 12,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "var(--border)" : "linear-gradient(135deg, #7dc443, #a8e063)",
                color: loading ? "var(--muted)" : "#fff",
                fontWeight: 800,
                fontSize: 15,
                fontFamily: "inherit",
                boxShadow: loading ? "none" : "0 4px 14px rgba(125,196,67,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 20,
                transition: "all 0.2s ease",
              }}
            >
              {loading ? (
                <><span className="animate-spin" style={{ display: "inline-block" }}>⟳</span> Sending...</>
              ) : "Send Reset Link →"}
            </button>

            <Link href="/login" style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
              ← Remember your password? <span style={{ color: "#7dc443", fontWeight: 700 }}>Sign in</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
