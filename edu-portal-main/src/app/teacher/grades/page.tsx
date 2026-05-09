"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import Modal from "@/components/shared/Modal";

export default function TeacherGradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGrade, setNewGrade] = useState({ studentName: "", studentId: "", subject: "", subjectCode: "", grade: "", score: "", semester: "1", type: "internal", remarks: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await fetch("/api/teacher/grades");
      const data = await res.json();
      if (res.ok) setGrades(data.grades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/teacher/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newGrade, score: Number(newGrade.score), semester: Number(newGrade.semester) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add grade");
      setGrades([data.grade, ...grades]);
      setIsModalOpen(false);
      setNewGrade({ studentName: "", studentId: "", subject: "", subjectCode: "", grade: "", score: "", semester: "1", type: "internal", remarks: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Grades Management</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Manage and input grades for your students</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Plus width={16} height={16} /> Add Grade
        </Button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48, color: "var(--muted)" }}>
          <Icons.Loader width={24} height={24} className="animate-spin" />
        </div>
      ) : grades.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 24px" }}>
          <Icons.Grades width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.5 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>No grades found</h3>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>You haven't added any grades yet.</p>
        </Card>
      ) : (
        <Card style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Student Name</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Student ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Subject</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Score</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g._id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "16px", color: "var(--text)", fontWeight: 500 }}>{g.studentName}</td>
                  <td style={{ padding: "16px", color: "var(--muted)" }}>{g.studentId}</td>
                  <td style={{ padding: "16px", color: "var(--text)" }}>
                    {g.subject} <span style={{ color: "var(--muted)", fontSize: 12 }}>({g.subjectCode})</span>
                  </td>
                  <td style={{ padding: "16px", color: "var(--text)", fontWeight: 600 }}>{g.score}</td>
                  <td style={{ padding: "16px", color: "var(--text)", fontWeight: 600 }}>{g.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Student Grade">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "var(--error-bg)", color: "var(--error-text)", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.AlertCircle width={16} height={16} /> {error}
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Student Name</label>
              <input 
                value={newGrade.studentName} 
                onChange={e => setNewGrade({...newGrade, studentName: e.target.value})} 
                placeholder="e.g. John Doe"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
                required 
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Student ID</label>
              <input 
                value={newGrade.studentId} 
                onChange={e => setNewGrade({...newGrade, studentId: e.target.value})} 
                placeholder="e.g. 2024CS001"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
                required 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Subject Name</label>
              <input 
                value={newGrade.subject} 
                onChange={e => setNewGrade({...newGrade, subject: e.target.value})} 
                placeholder="e.g. Data Structures"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
                required 
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Subject Code</label>
              <input 
                value={newGrade.subjectCode} 
                onChange={e => setNewGrade({...newGrade, subjectCode: e.target.value})} 
                placeholder="e.g. CS301"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
                required 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Score (0-100)</label>
              <input 
                type="number"
                value={newGrade.score} 
                onChange={e => setNewGrade({...newGrade, score: e.target.value})} 
                placeholder="e.g. 85"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
                required 
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Letter Grade</label>
              <input 
                value={newGrade.grade} 
                onChange={e => setNewGrade({...newGrade, grade: e.target.value})} 
                placeholder="e.g. A"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
                required 
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Remarks</label>
            <input 
              value={newGrade.remarks} 
              onChange={e => setNewGrade({...newGrade, remarks: e.target.value})} 
              placeholder="e.g. Excellent performance"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7dc443", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
              Save Grade
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
