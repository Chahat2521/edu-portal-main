"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ProfileDropdown from "@/components/shared/ProfileDropdown";
import NotificationDropdown from "@/components/shared/NotificationDropdown";
import { Icons } from "@/components/ui/Icons";
import ThemeToggle from "@/components/theme/ThemeToggle";

const NAV_LINKS = [
  { href: "/teacher",             icon: Icons.Dashboard,   label: "Dashboard"   },
  { href: "/teacher/courses",     icon: Icons.Courses,     label: "Courses"     },
  { href: "/teacher/assignments", icon: Icons.Assignments, label: "Assignments" },
  { href: "/teacher/attendance",  icon: Icons.Attendance,  label: "Attendance"  },
  { href: "/teacher/exam-grades", icon: Icons.Trophy,      label: "Exam Grades" },
  { href: "/teacher/resources",   icon: Icons.Resources,   label: "Resources"   },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("edu_user");
    if (!stored) { router.push("/login"); return; }
    const userData = JSON.parse(stored);
    if (userData.role !== "teacher") { router.push("/login"); return; }
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("edu_user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside style={{
        width: isOpen ? 240 : 80,
        background: "var(--sidebar-bg)",
        display: "flex",
        flexDirection: "column",
        padding: isOpen ? "24px 16px" : "24px 12px",
        position: "fixed",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 200,
        boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
        transition: "width 0.3s ease, padding 0.3s ease",
      }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "flex-start" : "center", marginBottom: 0, minHeight: 40 }}>
          {isOpen && (
            <Link href="/teacher" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><Icons.GraduationCap width={20} height={20} /></div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: 0.5, whiteSpace: "nowrap" }}>Academia</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap" }}>Faculty Portal</div>
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

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV_LINKS.map(({ href, icon: Icon, label }) => {
            const active = href === "/teacher" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={!isOpen ? label : undefined}
                className="sidebar-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isOpen ? "flex-start" : "center",
                  gap: isOpen ? 12 : 0,
                  padding: isOpen ? "12px 14px" : "12px 0",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#fff" : "rgba(255,255,255,0.65)",
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  borderLeft: active && isOpen ? "3px solid rgba(255,255,255,0.9)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon width={20} height={20} />
                {isOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleLogout}
            title={!isOpen ? "Logout" : undefined}
            style={{ width: "100%", padding: isOpen ? "10px 14px" : "10px 0", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: isOpen ? "flex-start" : "center", gap: 8 }}
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

      {/* ── Top navbar & Main Content ─────────────────────── */}
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
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery) router.push(`/teacher/search?q=${encodeURIComponent(searchQuery)}`); }} style={{ width: "100%", margin: 0, padding: 0 }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, assignments, or students..."
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, color: "var(--text)", width: "100%", fontFamily: "inherit" }}
              />
            </form>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: 20 }}>
            <ThemeToggle />
            <NotificationDropdown />
            <ProfileDropdown user={user} roleLabel="Faculty" />
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "32px", background: "var(--bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
