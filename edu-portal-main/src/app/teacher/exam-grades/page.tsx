"use client";

import { useState, useEffect, useCallback } from "react";
import { Icons } from "@/components/ui/Icons";
import Modal from "@/components/shared/Modal";
import Card from "@/components/ui/Card";

const getToken = () => {
  try { return JSON.parse(localStorage.getItem("edu_user") || "{}").token || ""; }
  catch { return ""; }
};
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const EXAM_TYPES = ["quiz", "mid", "final", "assignment"] as const;
type ExamType = typeof EXAM_TYPES[number];

const TYPE_LABELS: Record<ExamType, { label: string; color: string; bg: string }> = {
  quiz:       { label: "Quiz",       color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  mid:        { label: "Mid-Term",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  final:      { label: "Final",      color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  assignment: { label: "Assignment", color: "#4fa3e0", bg: "rgba(79,163,224,0.12)" },
};

interface ExamGrade {
  _id: string; studentId: string; studentName: string;
  subject: string; subjectCode: string; examType: ExamType;
  marks: number; maxMarks: number; semester: number;
  remarks: string; createdAt: string;
}

const emptyForm = {
  studentId: "", studentName: "", subject: "", subjectCode: "",
  examType: "quiz" as ExamType, marks: "", maxMarks: "100", semester: "1", remarks: "",
};

export default function TeacherExamGradesPage() {
  const [grades, setGrades]     = useState<ExamGrade[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [filter, setFilter]     = useState<ExamType | "all">("all");
  const [error, setError]       = useState("");

  const fetchGrades = useCallback(async () => {
    try {
      const res  = await fetch("/api/teacher/exam-grades", { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setGrades(data.grades || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const res  = await fetch("/api/teacher/exam-grades", {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ ...form, marks: Number(form.marks), maxMarks: Number(form.maxMarks), semester: Number(form.semester) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setGrades(prev => [data.grade, ...prev]);
      setShowModal(false); setForm(emptyForm);
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this grade?")) return;
    await fetch(`/api/teacher/exam-grades/${id}`, { method: "DELETE", headers: authHeaders() });
    setGrades(prev => prev.filter(g => g._id !== id));
  };

  const filtered = filter === "all" ? grades : grades.filter(g => g.examType === filter);

  // Stats
  const avg = (type: ExamType) => {
    const gs = grades.filter(g => g.examType === type);
    if (!gs.length) return 0;
    return Math.round(gs.reduce((acc, g) => acc + (g.marks / g.maxMarks) * 100, 0) / gs.length);
  };

  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Exam Grades</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Record quiz, mid-term, final and assignment scores</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}
        >
          <Icons.Plus width={16} height={16} /> Add Grade
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {EXAM_TYPES.map(t => {
          const tc = TYPE_LABELS[t];
          const count = grades.filter(g => g.examType === t).length;
          return (
            <Card key={t} style={{ textAlign: "center", padding: "16px 12px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: tc.color }}>{count}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{tc.label} Records</div>
              {count > 0 && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Avg: {avg(t)}%</div>}
            </Card>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["all", ...EXAM_TYPES] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: "7px 14px", borderRadius: 20, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer",
              background: filter === t ? "#1e3a5f" : "var(--bg-secondary)",
              color: filter === t ? "#fff" : "var(--muted)",
              transition: "all 0.15s ease" }}
          >
            {t === "all" ? "All" : TYPE_LABELS[t].label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Icons.Loader width={28} height={28} className="animate-spin" style={{ color: "var(--muted)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 24px" }}>
          <Icons.Trophy width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>No grades yet</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Click "Add Grade" to record exam scores.</p>
        </Card>
      ) : (
        <Card style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--muted)", textAlign: "left" }}>
                {["Student", "Student ID", "Subject", "Type", "Score", "Semester", "Remarks", ""].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => {
                const tc = TYPE_LABELS[g.examType];
                const pct = Math.round((g.marks / g.maxMarks) * 100);
                return (
                  <tr key={g._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--text)" }}>{g.studentName}</td>
                    <td style={{ padding: "14px 16px", color: "var(--muted)" }}>{g.studentId}</td>
                    <td style={{ padding: "14px 16px", color: "var(--text)" }}>
                      {g.subject}{g.subjectCode && <span style={{ color: "var(--muted)", fontSize: 12 }}> ({g.subjectCode})</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, background: tc.bg, color: tc.color, fontWeight: 700, fontSize: 12 }}>{tc.label}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontWeight: 800, color: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444" }}>
                        {g.marks}/{g.maxMarks}
                      </span>
                      <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: 6 }}>({pct}%)</span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--muted)" }}>Sem {g.semester}</td>
                    <td style={{ padding: "14px 16px", color: "var(--muted)", fontSize: 13 }}>{g.remarks || "—"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => handleDelete(g._id)}
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <Icons.Trash width={14} height={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add Grade Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(""); }} title="Add Exam Grade">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ background: "var(--error-bg)", color: "var(--error-text)", padding: "10px 12px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.AlertCircle width={16} height={16} /> {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Student Name *</label>
              <input value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} placeholder="e.g. John Doe" required
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Student ID *</label>
              <input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} placeholder="e.g. 2024CS001" required
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Subject *</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" required
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Subject Code</label>
              <input value={form.subjectCode} onChange={e => setForm({ ...form, subjectCode: e.target.value })} placeholder="e.g. CS301"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Exam Type *</label>
              <select value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value as ExamType })} required
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }}>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t].label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Marks *</label>
              <input type="number" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} placeholder="0" min="0" required
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Max Marks *</label>
              <input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} min="1" required
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Semester</label>
              <input type="number" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} min="1" max="8"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Remarks</label>
              <input value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Optional feedback…"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={() => { setShowModal(false); setError(""); }} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
            <button type="submit" style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.Trophy width={15} height={15} /> Save Grade
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
