"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface StudentNavbarProps {
  userName: string;
}

const NAV_LINKS = [
  ["Courses",     "/student/courses"],
  ["Assignments", "/student/assignments"],
  ["Grades",      "/student/grades"],
  ["Library",     "/student/resources"],
] as const;

export default function StudentNavbar({ userName }: StudentNavbarProps) {
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
        href="/student"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
        }}
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
          }}
        >
          🎓 CAMPUS
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 4 }}>
        {NAV_LINKS.map(([label, href]) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={label}
              href={href}
              style={{
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--green)" : "var(--text-secondary)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 8,
                background: active ? "rgba(125,196,67,0.1)" : "transparent",
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
          onClick={() => router.push("/teacher")}
          style={{
            fontSize: 12,
            background: "rgba(125,196,67,0.1)",
            border: "1px solid rgba(125,196,67,0.3)",
            borderRadius: 8,
            padding: "5px 12px",
            color: "var(--green-dark, #5a9e2a)",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Switch to Faculty
        </button>

        <div style={{ position: "relative", cursor: "pointer", lineHeight: 1 }}>
          <span style={{ fontSize: 20 }}>🔔</span>
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

        <Avatar name={userName} size={34} color="#4fa3e0" />

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
