"use client";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Icons } from "@/components/ui/Icons";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen]   = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("edu_user");
    if (!userStr) { router.push("/login"); return; }
    const userData = JSON.parse(userStr);
    if (userData.role !== "admin") { router.push("/login"); return; }
    setUser(userData);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-spin" style={{ fontSize: 32, display: "inline-block", marginBottom: 16 }}>⟳</div>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const navLinks = [
    { href: "/admin",                   icon: Icons.Dashboard, label: "Dashboard",        exact: true  },
    { href: "/admin/users",             icon: Icons.Users,     label: "All Users",        exact: false },
    { href: "/admin/faculty-requests",  icon: Icons.FileText,  label: "Faculty Requests", exact: false },
    { href: "/admin/courses",           icon: Icons.Courses,   label: "Courses",          exact: false },
    { href: "/admin/reports",           icon: Icons.Chart,     label: "Reports",          exact: false },
  ];

  const handleLogout = () => {
    localStorage.removeItem("edu_user");
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        style={{
          width: isOpen ? 240 : 80,
          background: "var(--sidebar-bg)",
          display: "flex",
          flexDirection: "column",
          padding: isOpen ? "28px 16px" : "28px 12px",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          zIndex: 200,
          borderRight: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "2px 0 16px rgba(0,0,0,0.15)",
          transition: "width 0.3s ease, padding 0.3s ease",
        }}
      >
        {/* Header w/ Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "space-between" : "center", marginBottom: 36 }}>
          {isOpen && (
            <div style={{ flex: 1 }}>
              <div style={{ border: "2px solid rgba(125,196,67,0.6)", borderRadius: 10, padding: "8px 14px", fontWeight: 900, fontSize: 13, letterSpacing: 1.5, color: "#7dc443", textAlign: "center", background: "rgba(125,196,67,0.08)" }}>
                CAMPUS PORTAL
              </div>
              <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                Admin Console
              </div>
            </div>
          )}
          {!isOpen && (
            <div style={{ background: "rgba(125,196,67,0.15)", color: "#7dc443", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Icons.GraduationCap width={20} height={20} /></div>
          )}
          <button onClick={() => setIsOpen(!isOpen)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding: 4, display: "flex" }}>
            {isOpen ? <Icons.ChevronLeft width={20} height={20} /> : <Icons.ChevronRight width={20} height={20} />}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {navLinks.map(({ href, icon: Icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={!isOpen ? label : undefined}
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  padding: isOpen ? "10px 14px" : "10px 0",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  background: active ? "rgba(125,196,67,0.2)" : "transparent",
                  borderLeft: active && isOpen ? "3px solid #7dc443" : "3px solid transparent",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isOpen ? "flex-start" : "center",
                  gap: isOpen ? 12 : 0,
                }}
              >
                <Icon width={20} height={20} />
                {isOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Theme toggle */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ThemeToggle />
          </div>

          {/* User info */}
          {isOpen && (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 10,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Signed in as</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{user?.name || "Admin"}</div>
              <div style={{ fontSize: 11, color: "#7dc443", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>Administrator</div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={!isOpen ? "Logout" : undefined}
            style={{
              width: "100%",
              padding: isOpen ? "10px 14px" : "10px 0",
              borderRadius: 10,
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.1)",
              color: "#fca5a5",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: isOpen ? "flex-start" : "center",
              gap: 8,
            }}
          >
            <Icons.Logout width={18} height={18} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <main
        style={{
          marginLeft: isOpen ? 240 : 80,
          flex: 1,
          background: "var(--bg)",
          minHeight: "100vh",
          padding: "32px",
          transition: "margin-left 0.3s ease, background 0.2s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
}
