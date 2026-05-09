"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/Toast";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface Stats {
  totalStudents: number;
  totalFaculty: number;
  pendingRequests: number;
  totalCourses: number;
}

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 24,
        borderLeft: `4px solid ${color}`,
        border: `1px solid #f0f0f0`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 12, color: "#999", margin: "0 0 4px" }}>{label}</p>
          <h3 style={{ fontSize: 32, fontWeight: 900, margin: 0, color: "#1a1a1a" }}>
            {value}
          </h3>
        </div>
        <div style={{ fontSize: 32 }}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch stats");

      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to load stats", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>Admin Dashboard 🛠️</h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 32px" }}>Campus Portal Management</p>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : stats ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <StatsCard
            icon="🎓"
            label="Total Students"
            value={stats.totalStudents}
            color="#4fa3e0"
          />
          <StatsCard
            icon="👨‍🏫"
            label="Total Faculty"
            value={stats.totalFaculty}
            color="#7dc443"
          />
          <StatsCard
            icon="⏳"
            label="Pending Requests"
            value={stats.pendingRequests}
            color="#f59e0b"
          />
          <StatsCard icon="📚" label="Total Courses" value={stats.totalCourses} color="#8b5cf6" />
        </div>
      ) : null}

      <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f0f0f0" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 24px" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <a
            href="/admin/users"
            style={{
              padding: 20,
              borderRadius: 12,
              background: "#f0f9ff",
              textDecoration: "none",
              color: "#4fa3e0",
              fontWeight: 600,
              textAlign: "center",
              border: "1px solid #bfdbfe",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            👥 Manage Users
          </a>
          <a
            href="/admin/faculty-requests"
            style={{
              padding: 20,
              borderRadius: 12,
              background: "#fef3c7",
              textDecoration: "none",
              color: "#92400e",
              fontWeight: 600,
              textAlign: "center",
              border: "1px solid #fcd34d",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            👨‍🏫 Faculty Requests
          </a>
          <a
            href="/admin/courses"
            style={{
              padding: 20,
              borderRadius: 12,
              background: "#ede9fe",
              textDecoration: "none",
              color: "#5b21b6",
              fontWeight: 600,
              textAlign: "center",
              border: "1px solid #ddd6fe",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            📚 Manage Courses
          </a>
        </div>
      </div>
    </div>
  );
}
