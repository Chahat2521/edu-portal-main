"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ProfileDropdown from "@/components/shared/ProfileDropdown";

import { Icons } from "@/components/ui/Icons";

const NAV_LINKS = [
  { href: "/student",             icon: Icons.Dashboard,   label: "Dashboard"       },
  { href: "/student/courses",     icon: Icons.Courses,     label: "My Courses"      },
  { href: "/student/assignments", icon: Icons.Assignments, label: "Assignments"     },
  { href: "/student/grades",      icon: Icons.Grades,      label: "Grades"          },
  { href: "/student/resources",   icon: Icons.Resources,   label: "Resources"       },
  { href: "/student/groups",      icon: Icons.Groups,      label: "Study Groups"    },
] as const;

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("edu_user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("edu_user");
    router.push("/login");
  };

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
        zIndex: 200,
        boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
        transition: "width 0.3s ease, padding 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "flex-start" : "center", marginBottom: 32, position: "relative" }}>
          {isOpen && (
            <Link href="/student" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Icons.GraduationCap width={20} height={20} /></div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>Academia</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Student Portal</div>
                </div>
              </div>
            </Link>
          )}
          {!isOpen && (
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: 16 }}><Icons.GraduationCap width={20} height={20} /></div>
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

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV_LINKS.map(({ href, icon: Icon, label }) => {
            const active = href === "/student" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={!isOpen ? label : undefined}
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
                  borderLeft: active && isOpen ? "3px solid #7dc443" : "3px solid transparent",
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

      {/* ── Top navbar ────────────────────────────────────── */}
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
              placeholder="Search courses, faculty, or resources..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, color: "var(--text)", width: "100%", fontFamily: "inherit" }}
            />
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: 20 }}>
            <div style={{ position: "relative", cursor: "pointer", display: "flex", color: "var(--text)" }}>
              <Icons.Bell width={22} height={22} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#f43f5e", borderRadius: "50%", border: "2px solid var(--nav-bg)", display: "block" }} />
            </div>
            <ProfileDropdown user={user} roleLabel="Computer Science, Year 3" />
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
