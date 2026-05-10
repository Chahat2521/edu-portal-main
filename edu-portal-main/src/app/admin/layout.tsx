"use client";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import ProfileDropdown from "@/components/shared/ProfileDropdown";
import { Icons } from "@/components/ui/Icons";
import ThemeToggle from "@/components/theme/ThemeToggle";

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
          overflowX: "hidden",
          zIndex: 200,
          borderRight: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "2px 0 16px rgba(0,0,0,0.15)",
          transition: "width 0.3s ease, padding 0.3s ease",
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "flex-start" : "center", marginBottom: 0, minHeight: 40 }}>
          {isOpen && (
            <Link href="/admin" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><Icons.GraduationCap width={20} height={20} /></div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: 0.5, whiteSpace: "nowrap" }}>Academia</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>Admin Console</div>
                </div>
              </div>
            </Link>
          )}
          {!isOpen && (
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Icons.GraduationCap width={20} height={20} /></div>
          )}
        </div>

        {/* Horizontal divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "16px 0" }} />

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {navLinks.map(({ href, icon: Icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={!isOpen ? label : undefined}
                className="sidebar-link"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  padding: isOpen ? "10px 14px" : "10px 0",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  borderLeft: active && isOpen ? "3px solid rgba(255,255,255,0.9)" : "3px solid transparent",
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

      {/* ── Floating sidebar toggle ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        style={{
          position: "fixed",
          left: isOpen ? 226 : 66,
          top: 22,
          zIndex: 300,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text)",
          transition: "left 0.3s ease",
        }}
      >
        {isOpen ? <Icons.ChevronLeft width={14} height={14} /> : <Icons.ChevronRight width={14} height={14} />}
      </button>

      {/* ── Main Content ─────────────────────────────────── */}
      <div style={{ marginLeft: isOpen ? 240 : 80, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.3s ease" }}>
        <header style={{
          height: 60,
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "var(--shadow-sm)",
        }}>
          {/* Search bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-secondary)", borderRadius: 10, padding: "9px 16px", border: "1px solid var(--border)", maxWidth: 420, flex: 1 }}>
            <span style={{ color: "var(--muted)", display: "flex" }}><Icons.Search width={18} height={18} /></span>
            <input
              placeholder="Search users, courses, or reports..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, color: "var(--text)", width: "100%", fontFamily: "inherit" }}
            />
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: 20 }}>
            <ThemeToggle />
            <div style={{ position: "relative", cursor: "pointer", display: "flex", color: "var(--text)" }}>
              <Icons.Bell width={22} height={22} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#f43f5e", borderRadius: "50%", border: "2px solid var(--nav-bg)", display: "block" }} />
            </div>
            <ProfileDropdown user={user} roleLabel="Administrator" />
          </div>
        </header>

        <main
          style={{
            flex: 1,
            background: "var(--bg)",
            minHeight: "100vh",
            padding: "32px",
            transition: "background 0.2s ease",
            overflow: "auto"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
