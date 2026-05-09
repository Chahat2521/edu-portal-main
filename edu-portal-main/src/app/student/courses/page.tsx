"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/Toast";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

export default function StudentCoursesPage() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const res = await fetch("/api/student/courses", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setCourses(data.courses);
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>📚 My Courses</h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 32px" }}>Active course enrollments</p>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : courses.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 60,
            textAlign: "center",
            border: "1px solid #f0f0f0",
          }}
        >
          <p style={{ fontSize: 14, color: "#666" }}>No courses enrolled yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {courses.map((course) => (
            <div
              key={course._id}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #f0f0f0",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{course.courseName}</h3>
              <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px" }}>{course.courseCode}</p>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "#d1fae5",
                  color: "#065f46",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {course.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
