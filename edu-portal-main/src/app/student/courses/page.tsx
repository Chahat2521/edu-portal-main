"use client";
import { useState, useEffect } from "react";
import { Icons } from "@/components/ui/Icons";
import Card from "@/components/ui/Card";
import { useGlobalSearch } from "@/contexts/SearchContext";

const getToken = () => {
  try { return JSON.parse(localStorage.getItem("edu_user") || "{}").token || ""; }
  catch { return ""; }
};

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useGlobalSearch();

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/student/courses", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = courses.filter(c =>
    (c.name || c.courseName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.code || c.courseCode || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const semColors: Record<number, string> = {
    1: "#4fa3e0", 2: "#8b5cf6", 3: "#22c55e", 4: "#f59e0b",
    5: "#ef4444", 6: "#ec4899", 7: "#14b8a6", 8: "#f97316",
  };

  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>My Courses</h1>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>All available courses from your faculty</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Icons.Loader width={28} height={28} className="animate-spin" style={{ color: "var(--muted)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 24px" }}>
          <Icons.Courses width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
            {searchQuery ? "No courses match your search" : "No courses available yet"}
          </h3>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
            {searchQuery ? "Try a different keyword." : "Courses created by your teachers will appear here."}
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {filtered.map(course => {
            const sem = course.semester || 1;
            const color = semColors[sem] || "#4fa3e0";
            const name = course.name || course.courseName || "Untitled";
            const code = course.code || course.courseCode || "";
            return (
              <Card key={course._id} style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: `3px solid ${color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1.3 }}>{name}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, background: `${color}20`, color, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", marginLeft: 8 }}>{code}</span>
                </div>

                {course.description && (
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                    {course.description}
                  </p>
                )}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  {course.teacherName && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--muted)" }}>
                      <Icons.Users width={13} height={13} /> {course.teacherName}
                    </div>
                  )}
                  {course.department && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--muted)" }}>
                      <Icons.Resources width={13} height={13} /> {course.department}
                    </div>
                  )}
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--muted)" }}>
                    Sem {sem}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
