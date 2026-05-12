"use client";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("edu_user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const navLinks = [
    { href: "/admin", icon: "🏠", label: "Dashboard", exact: true },
    { href: "/admin/users", icon: "👥", label: "All Users", exact: false },
    { href: "/admin/faculty-requests", icon: "👨‍🏫", label: "Faculty Requests", exact: false },
    { href: "/admin/courses", icon: "📚", label: "Courses", exact: false },
    { href: "/admin/reports", icon: "📊", label: "Reports", exact: false },
  ];

  const handleLogout = () => {
    localStorage.removeItem("edu_user");
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          background: "#1a1a2e",
          color: "white",
          padding: "32px 24px",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <h1 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 40px", letterSpacing: -0.5 }}>
          CAMPUS PORTAL
        </h1>

        <nav style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {navLinks.map(({ href, icon, label, exact }) => {
            const active = pathname ? (exact ? pathname === href : pathname.startsWith(href)) : false;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "all 0.2s",
                  backgroundColor: active ? "#7dc443" : "transparent",
                }}
              >
                {icon} {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            background: "#7dc443",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "auto",
          }}
        >
          ⬅ Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 240, flex: 1, background: "#f5f5f5", minHeight: "100vh", padding: 32 }}>
        {children}
      </div>
    </div>
  );
}
