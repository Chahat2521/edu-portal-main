"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Icons } from "@/components/ui/Icons";

interface TeacherNavbarProps {
  userName: string;
}

const NAV_LINKS = [
  ["Courses",     "/teacher/courses"],
  ["Assignments", "/teacher/assignments"],
  ["Reports",     "/teacher/reports"],
  ["Research",    "/teacher/resources"],
] as const;

export default function TeacherNavbar({ userName }: TeacherNavbarProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("edu_user");
    router.push("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 60,
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow-sm)",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {/* Logo */}
      <Link
        href="/teacher"
        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
      >
        <div
          style={{
            border: "2px solid var(--text)",
            borderRadius: 7,
            padding: "3px 10px",
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: 1.5,
            color: "var(--text)",
          display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icons.GraduationCap width={18} height={18} /> CAMPUS
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 4 }}>
        {NAV_LINKS.map(([label, href]) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={label}
              href={href}
              style={{
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--blue)" : "var(--text-secondary)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 8,
                background: active ? "rgba(79,163,224,0.1)" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle compact />

        <button
          onClick={() => router.push("/student")}
          style={{
            fontSize: 12,
            background: "rgba(79,163,224,0.1)",
            border: "1px solid rgba(79,163,224,0.3)",
            borderRadius: 8,
            padding: "5px 12px",
            color: "var(--blue-dark, #2a7abf)",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Switch to Student
        </button>

        <div style={{ position: "relative", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", color: "var(--text)" }}>
          <Icons.Bell width={20} height={20} />
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              background: "#f43f5e",
              borderRadius: "50%",
              border: "2px solid var(--nav-bg)",
              display: "block",
            }}
          />
        </div>

        <Avatar name={userName} size={34} color="#7dc443" />

        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            background: "none",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--muted)",
            fontSize: 13,
            fontFamily: "inherit",
            padding: "5px 10px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          ⬅ Logout
        </button>
      </div>
    </nav>
  );
}
