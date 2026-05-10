"use client";
import { useState, useEffect, Suspense, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";

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
  return            { score: 5, label: "Very Strong", color: "#4fa3e0" };
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
  const [shake, setShake]             = useState(false);
  const [touched, setTouched]         = useState({ pw: false, confirm: false });

  const passErr    = validatePassword(password);
  const confirmErr = confirm && confirm !== password ? "Passwords do not match" : "";
  const strength   = getStrength(password);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSubmit = async () => {
    setTouched({ pw: true, confirm: true });
    setError("");
    if (passErr || confirmErr || !token) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); triggerShake(); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", fontFamily: "'DM Sans', sans-serif", padding: 16 }}>
      <div className={`animate-fade-in${shake ? " animate-shake" : ""}`} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, padding: "48px 44px", maxWidth: 440, width: "100%", boxShadow: "var(--shadow-lg)", textAlign: "center" }}>
        {success ? (
          <>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #a8d8f0, #4fa3e0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Icons.Check width={40} height={40} />
              </div>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 12px" }}>Password Reset!</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Your password has been reset successfully. Redirecting you to login...
            </p>
            <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#4fa3e0", borderRadius: 99, width: "100%", transition: "width 3s linear" }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #a8d8f0, #4fa3e0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 16px rgba(79,163,224,0.3)", color: "#fff" }}>
              <Icons.Lock width={32} height={32} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>Reset Password</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>Create a strong new password for your account.</p>

            {error && (
              <div className="animate-slide-down" style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--error-text)", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                <Icons.AlertCircle width={16} height={16} /> {error}
              </div>
            )}

            {/* New password */}
            <div style={{ textAlign: "left", marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                New Password
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
                    border: `1.5px solid ${touched.pw && passErr ? "var(--input-error)" : "var(--input-border)"}`,
                    outline: "none", fontFamily: "inherit", color: "var(--text)", background: "var(--input-bg)", boxSizing: "border-box" as const,
                    boxShadow: touched.pw && passErr ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />
                <button type="button" onClick={() => setShowPw((p) => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 12, fontFamily: "inherit", fontWeight: 600, padding: "4px 6px", borderRadius: 6 }}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {touched.pw && passErr && (
                <p className="animate-slide-down" style={{ fontSize: 12, color: "var(--error-text)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><Icons.AlertTriangle width={12} height={12} /> {passErr}</p>
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
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
                placeholder="Repeat your password"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
                  border: `1.5px solid ${touched.confirm && confirmErr ? "var(--input-error)" : "var(--input-border)"}`,
                  outline: "none", fontFamily: "inherit", color: "var(--text)", background: "var(--input-bg)", boxSizing: "border-box" as const,
                  transition: "border-color 0.2s",
                }}
              />
              {touched.confirm && confirmErr && (
                <p className="animate-slide-down" style={{ fontSize: 12, color: "var(--error-text)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><Icons.AlertTriangle width={12} height={12} /> {confirmErr}</p>
              )}
            </div>

            <button
              id="reset-submit"
              onClick={handleSubmit}
              disabled={loading || !token}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                cursor: loading || !token ? "not-allowed" : "pointer",
                background: loading || !token ? "var(--border)" : "#1e3a5f",
                color: loading || !token ? "var(--muted)" : "#fff",
                fontWeight: 800, fontSize: 15, fontFamily: "inherit",
                boxShadow: "0 4px 14px rgba(30,58,95,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginBottom: 20, transition: "all 0.2s ease",
              }}
            >
              {loading ? <><Icons.Loader width={16} height={16} className="animate-spin" /> Resetting...</> : "Reset Password →"}
            </button>

            <Link href="/login" style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
              ← <span style={{ color: "#1e3a5f", fontWeight: 700 }}>Back to Login</span>
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
