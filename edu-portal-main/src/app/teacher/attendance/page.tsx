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

type Status = "present" | "absent" | "late";

interface Student { studentId: string; studentName: string; status: Status; }
interface Session {
  _id: string; className: string; subject: string;
  date: string; students: Student[];
}

const STATUS_COLORS: Record<Status, { bg: string; text: string }> = {
  present: { bg: "rgba(34,197,94,0.12)",  text: "#22c55e" },
  absent:  { bg: "rgba(239,68,68,0.12)",  text: "#ef4444" },
  late:    { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
};

export default function TeacherAttendancePage() {
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // New session modal
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    className: "", subject: "", date: new Date().toISOString().split("T")[0],
  });
  // Students being added to new session
  const [students, setStudents]   = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({ studentId: "", studentName: "" });

  const fetchSessions = useCallback(async () => {
    try {
      const res  = await fetch("/api/teacher/attendance", { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setSessions(data.sessions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  /* ── Create new session ── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res  = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...form, students }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSessions(prev => [data.session, ...prev]);
      setShowNew(false);
      setForm({ className: "", subject: "", date: new Date().toISOString().split("T")[0] });
      setStudents([]);
    } catch (err: any) { setError(err.message); }
  };

  const addStudentRow = () => {
    if (!newStudent.studentId || !newStudent.studentName) return;
    setStudents(prev => [...prev, { ...newStudent, status: "absent" }]);
    setNewStudent({ studentId: "", studentName: "" });
  };

  const removeStudentRow = (id: string) => setStudents(prev => prev.filter(s => s.studentId !== id));

  /* ── Mark attendance in active session ── */
  const cycleStatus = (studentId: string) => {
    if (!activeSession) return;
    const order: Status[] = ["present", "absent", "late"];
    const updated = activeSession.students.map(s =>
      s.studentId === studentId
        ? { ...s, status: order[(order.indexOf(s.status) + 1) % 3] }
        : s
    );
    setActiveSession({ ...activeSession, students: updated });
  };

  const saveAttendance = async () => {
    if (!activeSession) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/attendance/${activeSession._id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ students: activeSession.students }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setSessions(prev => prev.map(s => s._id === activeSession._id ? data.session : s));
      setActiveSession(null);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const deleteSession = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    await fetch(`/api/teacher/attendance/${id}`, { method: "DELETE", headers: authHeaders() });
    setSessions(prev => prev.filter(s => s._id !== id));
    if (activeSession?._id === id) setActiveSession(null);
  };

  const stats = (s: Session) => ({
    present: s.students.filter(x => x.status === "present").length,
    absent:  s.students.filter(x => x.status === "absent").length,
    late:    s.students.filter(x => x.status === "late").length,
    total:   s.students.length,
  });

  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Attendance</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Create class sessions and mark student attendance</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}
        >
          <Icons.CalendarPlus width={16} height={16} /> New Session
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Icons.Loader width={28} height={28} className="animate-spin" style={{ color: "var(--muted)" }} />
        </div>
      ) : sessions.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 24px" }}>
          <Icons.Attendance width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>No sessions yet</h3>
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 14 }}>Create your first class session to start taking attendance.</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: activeSession ? "1fr 1.4fr" : "1fr", gap: 20 }}>

          {/* Sessions list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map(session => {
              const s = stats(session);
              const pct = s.total ? Math.round((s.present / s.total) * 100) : 0;
              const isActive = activeSession?._id === session._id;
              return (
                <Card
                  key={session._id}
                  style={{ cursor: "pointer", border: isActive ? "2px solid #1e3a5f" : "2px solid transparent", transition: "all 0.15s ease" }}
                  onClick={() => setActiveSession(isActive ? null : { ...session })}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{session.className}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{session.subject} · {new Date(session.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session._id); }}
                      style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Icons.Trash width={14} height={14} />
                    </button>
                  </div>

                  {s.total > 0 && (
                    <div style={{ marginTop: 12 }}>
                      {/* Progress bar */}
                      <div style={{ height: 6, borderRadius: 99, background: "var(--bg-secondary)", overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 99, transition: "width 0.4s ease" }} />
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ {s.present} Present</span>
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>✗ {s.absent} Absent</span>
                        {s.late > 0 && <span style={{ color: "#f59e0b", fontWeight: 600 }}>⏰ {s.late} Late</span>}
                        <span style={{ color: "var(--muted)", marginLeft: "auto" }}>{pct}%</span>
                      </div>
                    </div>
                  )}
                  {s.total === 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No students in this session</div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Active session — attendance marking panel */}
          {activeSession && (
            <Card style={{ position: "sticky", top: 20, alignSelf: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{activeSession.className}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{activeSession.subject} · {activeSession.date}</div>
                </div>
                <button onClick={() => setActiveSession(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}><Icons.X width={18} height={18} /></button>
              </div>

              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Click status to cycle: Present → Absent → Late</div>

              {activeSession.students.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontSize: 14 }}>No students in this session</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                  {activeSession.students.map(st => {
                    const col = STATUS_COLORS[st.status];
                    return (
                      <div key={st.studentId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{st.studentName}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>ID: {st.studentId}</div>
                        </div>
                        <button
                          onClick={() => cycleStatus(st.studentId)}
                          style={{ padding: "5px 14px", borderRadius: 20, border: "none", background: col.bg, color: col.text, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize", minWidth: 72, fontFamily: "inherit" }}
                        >
                          {st.status}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setActiveSession(null)} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
                <button onClick={saveAttendance} disabled={saving} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving && <Icons.Loader width={14} height={14} className="animate-spin" />}
                  {saving ? "Saving…" : "Save Attendance"}
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* New Session Modal */}
      <Modal isOpen={showNew} onClose={() => { setShowNew(false); setError(""); }} title="New Class Session">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "var(--error-bg)", color: "var(--error-text)", padding: "10px 12px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.AlertCircle width={16} height={16} /> {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Class Name *</label>
              <input value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} placeholder="e.g. CS-3A" required
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Subject *</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" required
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Date *</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
          </div>

          {/* Add students */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Add Students</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={newStudent.studentId} onChange={e => setNewStudent({ ...newStudent, studentId: e.target.value })} placeholder="Student ID"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", outline: "none", fontSize: 13, fontFamily: "inherit", flex: 1 }} />
              <input value={newStudent.studentName} onChange={e => setNewStudent({ ...newStudent, studentName: e.target.value })} placeholder="Full Name"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", outline: "none", fontSize: 13, fontFamily: "inherit", flex: 1 }} />
              <button type="button" onClick={addStudentRow}
                style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center" }}>
                <Icons.Plus width={16} height={16} />
              </button>
            </div>
            {students.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                {students.map(st => (
                  <div key={st.studentId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--text)", fontWeight: 600 }}>{st.studentName}</span>
                    <span style={{ color: "var(--muted)" }}>{st.studentId}</span>
                    <button type="button" onClick={() => removeStudentRow(st.studentId)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", padding: 2 }}><Icons.X width={14} height={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={() => { setShowNew(false); setError(""); }} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
            <button type="submit" style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.Attendance width={15} height={15} /> Create Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
