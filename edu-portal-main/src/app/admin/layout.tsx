"use client";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import ProfileDropdown from "@/components/shared/ProfileDropdown";
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "flex-start" : "center", marginBottom: 36, position: "relative" }}>
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
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            style={{ 
              position: "absolute",
              right: isOpen ? -28 : -24, 
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--card)", 
              border: "1px solid var(--border)", 
              borderRadius: "50%", 
              width: 24,
              height: 24,
              cursor: "pointer", 
              color: "var(--text)", 
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 201,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}>
            {isOpen ? <Icons.ChevronLeft width={14} height={14} /> : <Icons.ChevronRight width={14} height={14} />}
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
