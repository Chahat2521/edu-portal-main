"use client";

import { useState, useEffect, useCallback } from "react";
import { Icons } from "@/components/ui/Icons";
import Card from "@/components/ui/Card";
import { useGlobalSearch } from "@/contexts/SearchContext";

const getToken = () => {
  try { return JSON.parse(localStorage.getItem("edu_user") || "{}").token || ""; }
  catch { return ""; }
};

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  quiz:       { label: "Quiz",       color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  mid:        { label: "Mid-Term",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  final:      { label: "Final",      color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  assignment: { label: "Assignment", color: "#4fa3e0", bg: "rgba(79,163,224,0.12)" },
};

interface ExamGrade {
  _id: string; subject: string; subjectCode: string; examType: string;
  marks: number; maxMarks: number; semester: number; remarks: string; createdAt: string;
}

export default function StudentExamGradesPage() {
  const [grades, setGrades]   = useState<ExamGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const { searchQuery } = useGlobalSearch();

  const fetchGrades = useCallback(async () => {
    try {
      const res  = await fetch("/api/student/exam-grades", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setGrades(data.grades || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const filteredByType = filter === "all" ? grades : grades.filter(g => g.examType === filter);
  const filtered = filteredByType.filter(g => 
    (g.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.subjectCode || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Overall GPA-like metric
  const overall = grades.length
    ? Math.round(grades.reduce((acc, g) => acc + (g.marks / g.maxMarks) * 100, 0) / grades.length)
    : 0;

  return (
    <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Exam Grades</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>View your quiz, mid-term, final and assignment scores</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Icons.Loader width={28} height={28} className="animate-spin" style={{ color: "var(--muted)" }} />
        </div>
      ) : grades.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 24px" }}>
          <Icons.Trophy width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>No exam grades yet</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Your exam results will appear here once your teacher records them.</p>
        </Card>
      ) : (
        <>
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            <Card style={{ textAlign: "center", padding: "18px 12px", gridColumn: "1" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: overall >= 75 ? "#22c55e" : overall >= 50 ? "#f59e0b" : "#ef4444" }}>{overall}%</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Overall Average</div>
            </Card>
            {Object.entries(TYPE_LABELS).map(([type, tc]) => {
              const gs  = grades.filter(g => g.examType === type);
              const avg = gs.length ? Math.round(gs.reduce((a, g) => a + (g.marks / g.maxMarks) * 100, 0) / gs.length) : null;
              return (
                <Card key={type} style={{ textAlign: "center", padding: "18px 12px" }}>
                  {avg !== null
                    ? <div style={{ fontSize: 24, fontWeight: 800, color: tc.color }}>{avg}%</div>
                    : <div style={{ fontSize: 20, color: "var(--muted)", opacity: 0.5 }}>—</div>}
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{tc.label}</div>
                  {avg !== null && <div style={{ fontSize: 11, color: "var(--muted)" }}>{gs.length} record{gs.length !== 1 ? "s" : ""}</div>}
                </Card>
              );
            })}
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", ...Object.keys(TYPE_LABELS)] as const).map(t => (
              <button key={t} onClick={() => setFilter(t)}
                style={{ padding: "7px 14px", borderRadius: 20, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: filter === t ? "#1e3a5f" : "var(--bg-secondary)",
                  color: filter === t ? "#fff" : "var(--muted)", textTransform: "capitalize" }}>
                {t === "all" ? "All" : TYPE_LABELS[t].label}
              </button>
            ))}
          </div>

          {/* Grades table */}
          <Card style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--muted)", textAlign: "left" }}>
                  {["Subject", "Type", "Score", "Semester", "Remarks", "Date"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => {
                  const tc  = TYPE_LABELS[g.examType] || { label: g.examType, color: "#64748b", bg: "var(--bg-secondary)" };
                  const pct = Math.round((g.marks / g.maxMarks) * 100);
                  return (
                    <tr key={g._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--text)" }}>
                        {g.subject}{g.subjectCode && <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}> ({g.subjectCode})</span>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, background: tc.bg, color: tc.color, fontWeight: 700, fontSize: 12 }}>{tc.label}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontWeight: 800, color: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444" }}>{g.marks}/{g.maxMarks}</span>
                        <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: 6 }}>({pct}%)</span>
                        <div style={{ height: 4, borderRadius: 99, background: "var(--bg-secondary)", marginTop: 4, overflow: "hidden", width: 80 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 99 }} />
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--muted)" }}>Sem {g.semester}</td>
                      <td style={{ padding: "14px 16px", color: "var(--muted)", fontSize: 13 }}>{g.remarks || "—"}</td>
                      <td style={{ padding: "14px 16px", color: "var(--muted)", fontSize: 13 }}>
                        {new Date(g.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
