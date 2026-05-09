"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/Toast";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Icons } from "@/components/ui/Icons";

export default function StudentGradesPage() {
  const { showToast } = useToast();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  async function fetchGrades() {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const res = await fetch("/api/student/grades", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setGrades(data.grades);
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to load grades", "error");
    } finally {
      setLoading(false);
    }
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      "A+": "#7dc443",
      "A": "#7dc443",
      "B+": "#4fa3e0",
      "B": "#4fa3e0",
      "C+": "#f59e0b",
      "C": "#f59e0b",
      "D": "#f87171",
      "F": "#ef4444",
    };
    return colors[grade] || "#999";
  };

  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}><Icons.Chart width={24} height={24} /> My Grades</h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 32px" }}>View your academic performance</p>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : grades.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 60,
            textAlign: "center",
            border: "1px solid #f0f0f0",
          }}
        >
          <p style={{ fontSize: 14, color: "#666" }}>No grades available yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {grades.map((grade) => (
            <div
              key={grade._id}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #f0f0f0",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{grade.subject}</h3>
              <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px" }}>
                {grade.type} • Sem {grade.semester}
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: getGradeColor(grade.grade),
                  }}
                >
                  {grade.grade}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#666", margin: "0 0 4px" }}>Score</p>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{grade.score}/100</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
