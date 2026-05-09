"use client";
import { useState, useEffect, Suspense, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";

function getStrength(pw: string) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score: 1, label: "Weak",      color: "#ef4444" };
  if (score <= 3) return { score: 2, label: "Fair",      color: "#f59e0b" };
  if (score <= 4) return { score: 3, label: "Good",      color: "#3b82f6" };
  if (score <= 5) return { score: 4, label: "Strong",    color: "#22c55e" };
  return            { score: 5, label: "Very Strong", color: "#7dc443" };
}

function validatePassword(v: string) {
  if (!v) return "Password is required";
  if (v.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(v)) return "Must include an uppercase letter";
  if (!/[a-z]/.test(v)) return "Must include a lowercase letter";
  if (!/[0-9]/.test(v)) return "Must include a number";
  return "";
}

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams?.get("token") ?? "";

  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState("");
  const [touched, setTouched]         = useState({ pw: false, confirm: false });

  const passErr    = validatePassword(password);
  const confirmErr = confirm && confirm !== password ? "Passwords do not match" : "";
  const strength   = getStrength(password);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const handleSubmit = async () => {
    setTouched({ pw: true, confirm: true });
    setError("");
    if (passErr || confirmErr || !token) return;

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", fontFamily: "'DM Sans', sans-serif", padding: 16 }}>
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="animate-fade-in" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, padding: "48px 44px", maxWidth: 440, width: "100%", boxShadow: "var(--shadow-lg)", textAlign: "center" }}>
        {success ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 12px" }}>Password Reset!</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Your password has been reset successfully. Redirecting you to login...
            </p>
            <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#7dc443", borderRadius: 99, width: "100%", transition: "width 3s linear" }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #c8f08f, #7dc443)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px", boxShadow: "0 4px 16px rgba(125,196,67,0.3)" }}>🔐</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>Reset Password</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>Create a strong new password for your account.</p>

            {error && (
              <div className="animate-slide-down" style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--error-text)", textAlign: "left" }}>
                🚫 {error}
              </div>
            )}

            {/* New password */}
            <div style={{ textAlign: "left", marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                New Password
                {touched.pw && !passErr && <span style={{ color: "var(--input-success)", marginLeft: 6 }}>✓</span>}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, pw: true }))}
                  placeholder="Create a strong password"
                  style={{
                    width: "100%", padding: "12px 70px 12px 14px", borderRadius: 10, fontSize: 14,
                    border: `1.5px solid ${touched.pw && passErr ? "var(--input-error)" : touched.pw && !passErr ? "var(--input-success)" : "var(--input-border)"}`,
                    outline: "none", fontFamily: "inherit", color: "var(--text)", background: "var(--input-bg)", boxSizing: "border-box" as const,
                    boxShadow: touched.pw && passErr ? "0 0 0 3px rgba(239,68,68,0.12)" : touched.pw && !passErr ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />
                <button type="button" onClick={() => setShowPw((p) => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 12, fontFamily: "inherit", fontWeight: 600, padding: "4px 6px", borderRadius: 6 }}>
                  {showPw ? "🙈 Hide" : "👁 Show"}
                </button>
              </div>
              {touched.pw && passErr && (
                <p className="animate-slide-down" style={{ fontSize: 12, color: "var(--error-text)", marginTop: 5 }}>⚠ {passErr}</p>
              )}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} style={{ flex: 1, height: 4, borderRadius: 99, background: n <= strength.score ? strength.color : "var(--border)", transition: "background 0.3s" }} />
                    ))}
                  </div>
                  {strength.label && <span style={{ fontSize: 11, color: strength.color, fontWeight: 700 }}>{strength.label}</span>}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Confirm Password
                {touched.confirm && !confirmErr && confirm && <span style={{ color: "var(--input-success)", marginLeft: 6 }}>✓</span>}
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
                placeholder="Repeat your password"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
                  border: `1.5px solid ${touched.confirm && confirmErr ? "var(--input-error)" : touched.confirm && !confirmErr && confirm ? "var(--input-success)" : "var(--input-border)"}`,
                  outline: "none", fontFamily: "inherit", color: "var(--text)", background: "var(--input-bg)", boxSizing: "border-box" as const,
                  transition: "border-color 0.2s",
                }}
              />
              {touched.confirm && confirmErr && (
                <p className="animate-slide-down" style={{ fontSize: 12, color: "var(--error-text)", marginTop: 5 }}>⚠ {confirmErr}</p>
              )}
            </div>

            <button
              id="reset-submit"
              onClick={handleSubmit}
              disabled={loading || !token}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                cursor: loading || !token ? "not-allowed" : "pointer",
                background: loading || !token ? "var(--border)" : "linear-gradient(135deg, #7dc443, #a8e063)",
                color: loading || !token ? "var(--muted)" : "#fff",
                fontWeight: 800, fontSize: 15, fontFamily: "inherit",
                boxShadow: "0 4px 14px rgba(125,196,67,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginBottom: 20, transition: "all 0.2s ease",
              }}
            >
              {loading ? <><span className="animate-spin" style={{ display: "inline-block" }}>⟳</span> Resetting...</> : "Reset Password →"}
            </button>

            <Link href="/login" style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
              ← <span style={{ color: "#7dc443", fontWeight: 700 }}>Back to Login</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}><p style={{ color: "var(--muted)" }}>Loading...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
