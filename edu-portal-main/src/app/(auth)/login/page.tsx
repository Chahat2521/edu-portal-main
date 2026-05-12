"use client";
import { useState, useCallback, type CSSProperties, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";

/* ── Validation helpers ────────────────────────────────────── */
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function validateEmail(v: string): string {
  if (!v.trim()) return "Email is required";
  if (!EMAIL_RE.test(v.trim())) return "Enter a valid email address";
  return "";
}
function validatePassword(v: string): string {
  if (!v) return "Password is required";
  if (v.length < 6) return "Password must be at least 6 characters";
  return "";
}

/* ── Field component ───────────────────────────────────────── */
interface FieldProps {
  label: string;
  error: string;
  touched: boolean;
  valid?: boolean;
  children: React.ReactNode;
}
function Field({ label, error, touched, valid, children }: FieldProps) {
  const showError = touched && error;
  const showOk = touched && !error && valid;
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
      {showError && (
        <p className="animate-slide-down" style={{ fontSize: 12, color: "var(--error-text)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
          <Icons.AlertTriangle width={12} height={12} /> {error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [shake, setShake] = useState(false);

  const [touched, setTouched] = useState({ email: false, password: false });

  const emailErr = validateEmail(email);
  const passErr  = validatePassword(password);

  const gradientBg  = "linear-gradient(135deg, #0f2744 0%, #1e3a5f 100%)";

  const inputStyle = useCallback((err: string, isTouched: boolean): CSSProperties => ({
    width: "100%",
    padding: "12px 14px",
    paddingRight: 48,
    borderRadius: 10,
    fontSize: 14,
    border: `1.5px solid ${isTouched && err ? "var(--input-error)" : "var(--input-border)"}`,
    outline: "none",
    fontFamily: "inherit",
    color: "var(--text)",
    background: "var(--input-bg)",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: isTouched && err ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
  }), []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    setApiError("");

    if (emailErr || passErr) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Invalid email or password");
        triggerShake();
        return;
      }

      if (data.token && data.user) {
        localStorage.setItem(
          "edu_user",
          JSON.stringify({
            token: data.token,
            id: data.user.id,
            name: data.user.name,
            role: data.user.role,
          })
        );

        const dest =
          data.user.role === "admin"
            ? "/admin"
            : data.user.role === "teacher"
            ? "/teacher"
            : "/student";
        router.push(dest);
      }
    } catch {
      setApiError("Network error. Please check your connection.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: "#ffffff" }}>
      {/* ── Left Panel ─────────────────────────── */}
      <div
        style={{
          flex: 1,
          background: gradientBg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        {[280, 200, 340, 160].map((size, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.35)",
              width: size,
              height: size,
              top: ["-80px", "38%", "55%", "8%"][i],
              left: ["-80px", "-50px", "55%", "68%"][i],
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Content */}
        <div style={{ position: "relative", textAlign: "center", zIndex: 1, maxWidth: 420 }}>
          <div
            style={{
              border: "3px solid rgba(0,0,0,0.15)",
              borderRadius: 12,
              padding: "8px 20px",
              fontWeight: 900,
              fontSize: 17,
              letterSpacing: 3,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 36,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              color: "#fff",
            }}
          >
            <Icons.GraduationCap style={{ width: 20, height: 20 }} /> CAMPUS PORTAL
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 16px",
              lineHeight: 1.1,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            Your Learning<br />Hub Awaits
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 320, lineHeight: 1.7, margin: "0 auto 36px" }}>
            Manage assignments, track grades, collaborate on projects, and unlock your full potential.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: <Icons.Courses width={22} height={22} />, label: "Courses" },
              { icon: <Icons.Assignments width={22} height={22} />, label: "Tasks" },
              { icon: <Icons.Grades width={22} height={22} />, label: "Grades" },
              { icon: <Icons.Dashboard width={22} height={22} />, label: "Projects" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  minWidth: 90,
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  color: "#fff"
                }}
              >
                <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────── */}
      <div
        style={{
          width: 480,
          background: "var(--card)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "32px 48px 32px",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Form */}
        <div
          style={{ width: "100%" }}
          className={shake ? "animate-shake" : ""}
        >
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", margin: "0 0 6px" }}>
            Welcome back!
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>
            Sign in to your campus portal
          </p>

          {/* Role toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-secondary)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 24,
              border: "1px solid var(--border)",
            }}
          >
            {(["student", "teacher"] as const).map((value) => (
              <button
                key={value}
                onClick={() => { setRole(value); setApiError(""); }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  background: role === value ? "var(--card)" : "transparent",
                  boxShadow: role === value ? "var(--shadow-sm)" : "none",
                  fontWeight: 700,
                  fontSize: 13,
                  color: role === value ? "var(--text)" : "var(--muted)",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                }}
              >
                {value === "student" ? <div style={{display:"flex", alignItems:"center", gap:6, justifyContent:"center"}}><Icons.GraduationCap width={16} height={16}/> Student</div> : <div style={{display:"flex", alignItems:"center", gap:6, justifyContent:"center"}}><Icons.Dashboard width={16} height={16}/> Faculty</div>}
              </button>
            ))}
          </div>

          {/* Admin hint */}
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Icons.Lightbulb width={16} height={16} style={{ flexShrink: 0, marginTop: 2 }} /> 
            <span>Admin? Use <strong>admin@campusportal.com</strong> with your admin password</span>
          </div>

          {/* Email */}
          <Field label="Email Address" error={emailErr} touched={touched.email} valid>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setApiError(""); }}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                onKeyDown={handleKeyDown}
                placeholder="you@university.edu"
                autoComplete="email"
                style={inputStyle(emailErr, touched.email)}
              />
            </div>
          </Field>

          {/* Password */}
          <Field label="Password" error={passErr} touched={touched.password} valid>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setApiError(""); }}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ ...inputStyle(passErr, touched.password), paddingRight: 80 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  fontSize: 12,
                  fontFamily: "inherit",
                  fontWeight: 600,
                  padding: "4px 6px",
                  borderRadius: 6,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          <div style={{ textAlign: "right", marginTop: -8, marginBottom: 20 }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="animate-slide-down" style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--error-text)", display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.AlertCircle width={16} height={16} /> {apiError}
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading
                ? "var(--border)"
                : "#1e3a5f",
              color: loading ? "var(--muted)" : "#fff",
              fontWeight: 800,
              fontSize: 15,
              fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 4px 14px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s ease",
              letterSpacing: "0.02em",
            }}
          >
            {loading ? (
              <>
                <Icons.Loader width={16} height={16} className="animate-spin" />
                Signing In...
              </>
            ) : (
              `Sign In →`
            )}
          </button>

          <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#1e3a5f", fontWeight: 700 }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted-light)", marginTop: 16 }}>
          © 2024 Campus Portal · All rights reserved
        </p>
      </div>
    </div>
  );
}
