"use client";
import { useState, useCallback, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";

/* ── Validation helpers ───────────────────────────────────── */
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function validateName(v: string) {
  if (!v.trim()) return "Full name is required";
  if (v.trim().length < 2) return "Name must be at least 2 characters";
  if (/[^a-zA-Z\s.'-]/.test(v)) return "Name contains invalid characters";
  return "";
}
function validateEmail(v: string) {
  if (!v.trim()) return "Email is required";
  if (!EMAIL_RE.test(v.trim())) return "Enter a valid email address";
  return "";
}
function validatePassword(v: string) {
  if (!v) return "Password is required";
  if (v.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(v)) return "Must include at least one uppercase letter";
  if (!/[a-z]/.test(v)) return "Must include at least one lowercase letter";
  if (!/[0-9]/.test(v)) return "Must include at least one number";
  return "";
}
function validateEnrollment(v: string) {
  if (!v.trim()) return "Enrollment number is required";
  return "";
}
function validateEmployeeId(v: string) {
  if (!v.trim()) return "Employee ID is required";
  return "";
}

/* ── Password strength calculator ────────────────────────── */
interface StrengthInfo { score: number; label: string; color: string; bg: string }

function getStrength(pw: string): StrengthInfo {
  if (!pw) return { score: 0, label: "", color: "transparent", bg: "var(--border)" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score: 1, label: "Weak",      color: "#ef4444", bg: "#fef2f2" };
  if (score <= 3) return { score: 2, label: "Fair",      color: "#f59e0b", bg: "#fffbeb" };
  if (score <= 4) return { score: 3, label: "Good",      color: "#3b82f6", bg: "#eff6ff" };
  if (score <= 5) return { score: 4, label: "Strong",    color: "#22c55e", bg: "#f0fdf4" };
  return            { score: 5, label: "Very Strong", color: "#7dc443", bg: "#f0fdf4" };
}

/* ── Field wrapper ────────────────────────────────────────── */
function Field({
  label, error, touched, valid, hint, children,
}: {
  label: string; error: string; touched: boolean; valid?: boolean; hint?: string; children: React.ReactNode;
}) {
  const showError = touched && error;
  const showOk    = touched && !error && valid;
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
        {showOk && <span style={{ color: "var(--input-success)", marginLeft: 6 }}>✓</span>}
      </label>
      {children}
      {showError && (
        <p className="animate-slide-down" style={{ fontSize: 12, color: "var(--error-text)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
          <Icons.AlertTriangle width={12} height={12} /> {error}
        </p>
      )}
      {!showError && hint && !touched && (
        <p style={{ fontSize: 11, color: "var(--muted-light)", marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [shake, setShake] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [successStudent, setSuccessStudent] = useState(false);

  const [touched, setTouched] = useState({
    name: false, email: false, password: false,
    enrollmentNumber: false, employeeId: false,
  });

  const nameErr        = validateName(name);
  const emailErr       = validateEmail(email);
  const passErr        = validatePassword(password);
  const enrollmentErr  = validateEnrollment(enrollmentNumber);
  const employeeErr    = validateEmployeeId(employeeId);
  const strength       = getStrength(password);

  const gradientBg  = "linear-gradient(135deg, #0f2744 0%, #1e3a5f 100%)";

  const inputStyle = useCallback((err: string, isTouched: boolean): CSSProperties => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    fontSize: 14,
    border: `1.5px solid ${
      isTouched && err
        ? "var(--input-error)"
        : isTouched && !err
        ? "var(--input-success)"
        : "var(--input-border)"
    }`,
    outline: "none",
    fontFamily: "inherit",
    color: "var(--text)",
    background: "var(--input-bg)",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: isTouched && err
      ? "0 0 0 3px rgba(239,68,68,0.12)"
      : isTouched && !err
      ? "0 0 0 3px rgba(34,197,94,0.12)"
      : "none",
  }), []);

  const touchAll = () =>
    setTouched({ name: true, email: true, password: true, enrollmentNumber: true, employeeId: true });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const isValid = () => {
    if (nameErr || emailErr || passErr) return false;
    if (isStudent && enrollmentErr) return false;
    if (!isStudent && employeeErr) return false;
    return true;
  };

  const handleSubmit = async () => {
    touchAll();
    setApiError("");

    if (!isValid()) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = { name: name.trim(), email: email.trim(), password, role };
      if (isStudent) body.enrollmentNumber = enrollmentNumber.trim();
      else { body.employeeId = employeeId.trim(); body.department = department.trim(); }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Please try again.");
        triggerShake();
        return;
      }

      if (data.pending) { setPendingApproval(true); return; }

      if (data.token && data.user) {
        localStorage.setItem("edu_user", JSON.stringify({
          token: data.token, id: data.user.id, name: data.user.name, role: data.user.role,
        }));
        setSuccessStudent(true);
        setTimeout(() => router.push("/student"), 1400);
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  /* ── Success states ─────────────────────────────────────── */
  if (pendingApproval) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="animate-fade-in" style={{ background: "var(--card)", borderRadius: 24, padding: 48, maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Icons.Hourglass width={64} height={64} style={{ color: "var(--muted)" }} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 12px" }}>Application Submitted!</h2>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
            Your faculty account request has been submitted for admin approval. You will be able to log in once the admin approves your account.
          </p>
          <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-border)", borderRadius: 10, padding: "12px 16px", marginBottom: 28, fontSize: 13, color: "var(--warning-text)", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <Icons.Mail width={16} height={16} /> Please check your email for updates on your application status.
          </div>
          <Link href="/login" style={{ display: "inline-block", background: "#4fa3e0", color: "#fff", padding: "12px 32px", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (successStudent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="animate-fade-in" style={{ background: "var(--card)", borderRadius: 24, padding: 48, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Icons.Sparkles width={64} height={64} style={{ color: "#7dc443" }} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>Account Created!</h2>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Redirecting you to your dashboard...</p>
          <div style={{ marginTop: 24, height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#7dc443", borderRadius: 99, animation: "width 1.4s linear forwards", width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ──────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>
      {/* Global Theme toggle fixed top-right */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* Left panel */}
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
        {[280, 200, 340, 160].map((size, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.35)",
              width: size, height: size,
              top: ["-80px", "38%", "55%", "8%"][i],
              left: ["-80px", "-50px", "55%", "68%"][i],
              pointerEvents: "none",
            }}
          />
        ))}

        <div style={{ position: "relative", textAlign: "center", zIndex: 1, maxWidth: 420 }}>
          <div style={{ border: "3px solid rgba(0,0,0,0.15)", borderRadius: 12, padding: "8px 20px", fontWeight: 900, fontSize: 17, letterSpacing: 3, display: "flex", alignItems: "center", gap: 8, marginBottom: 36, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#fff" }}>
            <Icons.GraduationCap style={{ width: 20, height: 20 }} /> CAMPUS PORTAL
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            Join the<br />Community!
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 320, lineHeight: 1.7, margin: "0 auto 36px" }}>
            Create your account and start your academic journey on Campus Portal today.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: <Icons.Courses width={22} height={22} />, label: "Courses" },
              { icon: <Icons.Assignments width={22} height={22} />, label: "Tasks" },
              { icon: <Icons.Grades width={22} height={22} />, label: "Grades" },
              { icon: <Icons.Dashboard width={22} height={22} />, label: "Projects" },
            ].map((item) => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", borderRadius: 14, padding: "12px 16px", minWidth: 80, textAlign: "center", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: "#fff" }}>
                <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          width: 500,
          background: "var(--card)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "28px 48px 28px",
          overflowY: "auto",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className={shake ? "animate-shake" : ""}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 8 }}>
            Create Account <Icons.Sparkles width={24} height={24} />
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
            Join Campus Portal today
          </p>

          {/* Role toggle */}
          <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: 12, padding: 4, marginBottom: 20, border: "1px solid var(--border)" }}>
            {(["student", "teacher"] as const).map((value) => (
              <button
                key={value}
                onClick={() => { setRole(value); setApiError(""); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
                  background: role === value ? "var(--card)" : "transparent",
                  boxShadow: role === value ? "var(--shadow-sm)" : "none",
                  fontWeight: 700, fontSize: 13,
                  color: role === value ? "var(--text)" : "var(--muted)",
                  fontFamily: "inherit", transition: "all 0.2s ease",
                }}
              >
                {value === "student" ? <div style={{display:"flex", alignItems:"center", gap:6, justifyContent:"center"}}><Icons.GraduationCap width={16} height={16}/> Student</div> : <div style={{display:"flex", alignItems:"center", gap:6, justifyContent:"center"}}><Icons.Dashboard width={16} height={16}/> Faculty</div>}
              </button>
            ))}
          </div>

          {/* Name */}
          <Field label="Full Name" error={nameErr} touched={touched.name} valid hint="Your real name as it appears on official documents">
            <input
              type="text" id="signup-name" value={name} placeholder="Enter your full name"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              style={inputStyle(nameErr, touched.name)}
            />
          </Field>

          {/* Enrollment / Employee ID */}
          {isStudent ? (
            <Field label="Enrollment Number" error={enrollmentErr} touched={touched.enrollmentNumber} valid hint="e.g. 2024CS001">
              <input
                type="text" id="signup-enrollment" value={enrollmentNumber} placeholder="e.g. 2024CS001"
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, enrollmentNumber: true }))}
                style={inputStyle(enrollmentErr, touched.enrollmentNumber)}
              />
            </Field>
          ) : (
            <>
              <Field label="Employee ID" error={employeeErr} touched={touched.employeeId} valid hint="e.g. FAC2024001">
                <input
                  type="text" id="signup-employee" value={employeeId} placeholder="e.g. FAC2024001"
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, employeeId: true }))}
                  style={inputStyle(employeeErr, touched.employeeId)}
                />
              </Field>
              <Field label="Department (Optional)" error="" touched={false}>
                <input
                  type="text" id="signup-department" value={department} placeholder="e.g. Computer Science"
                  onChange={(e) => setDepartment(e.target.value)}
                  style={inputStyle("", false)}
                />
              </Field>
            </>
          )}

          {/* Email */}
          <Field label="Email Address" error={emailErr} touched={touched.email} valid hint="Use your university email address">
            <input
              type="email" id="signup-email" value={email} placeholder="you@university.edu"
              onChange={(e) => { setEmail(e.target.value); setApiError(""); }}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              autoComplete="email"
              style={inputStyle(emailErr, touched.email)}
            />
          </Field>

          {/* Password + strength meter */}
          <Field label="Password" error={passErr} touched={touched.password} valid hint="Min 8 chars, uppercase, lowercase & number">
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="signup-password"
                value={password}
                placeholder="Create a strong password"
                onChange={(e) => { setPassword(e.target.value); setApiError(""); }}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                autoComplete="new-password"
                style={{ ...inputStyle(passErr, touched.password), paddingRight: 80 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--muted)",
                  fontSize: 12, fontFamily: "inherit", fontWeight: 600, padding: "4px 6px", borderRadius: 6,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="animate-slide-down" style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      style={{
                        flex: 1, height: 4, borderRadius: 99,
                        background: n <= strength.score ? strength.color : "var(--border)",
                        transition: "background 0.3s ease",
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: strength.color, fontWeight: 700 }}>
                    {strength.label}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted-light)" }}>
                    {[
                      password.length >= 8 ? "✓ 8+ chars" : "✗ 8+ chars",
                      /[A-Z]/.test(password) ? "✓ uppercase" : "✗ uppercase",
                      /[0-9]/.test(password) ? "✓ number" : "✗ number",
                    ].join("  ")}
                  </span>
                </div>
              </div>
            )}
          </Field>

          {/* API Error */}
          {apiError && (
            <div className="animate-slide-down" style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "var(--error-text)", display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.AlertCircle width={16} height={16} /> {apiError}
            </div>
          )}

          {/* Submit */}
          <button
            id="signup-submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "var(--border)" : "#1e3a5f",
              color: loading ? "var(--muted)" : "#fff",
              fontWeight: 800, fontSize: 15, fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 4px 14px rgba(0,0,0,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease", letterSpacing: "0.02em",
              marginBottom: 16,
            }}
          >
            {loading ? (
              <><Icons.Loader width={16} height={16} className="animate-spin" /> Creating Account...</>
            ) : "Create Account →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#1e3a5f", fontWeight: 700 }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted-light)", marginTop: 16 }}>
          © 2024 Campus Portal · All rights reserved
        </p>
      </div>
    </div>
  );
}
