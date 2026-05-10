"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Icons } from "@/components/ui/Icons";
import Modal from "@/components/shared/Modal";
import Card from "@/components/ui/Card";
import { useGlobalSearch } from "@/contexts/SearchContext";

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
interface Session { _id: string; className: string; subject: string; date: string; students: Student[]; }

const STATUS_COLORS: Record<Status, { bg: string; text: string }> = {
  present: { bg: "rgba(34,197,94,0.12)",  text: "#22c55e" },
  absent:  { bg: "rgba(239,68,68,0.12)",  text: "#ef4444" },
  late:    { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
};

// ── CSV/Excel parser (no extra lib needed) ──────────────────────────────────
function parseCSV(text: string): Array<{ studentId: string; studentName: string }> {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const idIdx   = headers.findIndex(h => h.includes("id") || h.includes("roll") || h.includes("no"));
  const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("student"));
  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    return {
      studentId:   (idIdx >= 0 ? cols[idIdx] : cols[0] || `STU${i + 1}`).trim(),
      studentName: (nameIdx >= 0 ? cols[nameIdx] : cols[1] || "").trim(),
    };
  }).filter(s => s.studentName);
}

export default function TeacherAttendancePage() {
  const [sessions, setSessions]       = useState<Session[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [saving, setSaving]           = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [error, setError]             = useState("");
  const [importPreview, setImportPreview] = useState<{ studentId: string; studentName: string }[]>([]);
  const [importError, setImportError] = useState("");
  const csvRef = useRef<HTMLInputElement>(null);
  const { searchQuery } = useGlobalSearch();

  const [form, setForm] = useState({
    className: "", subject: "", date: new Date().toISOString().split("T")[0],
  });
  const [students, setStudents]     = useState<{ studentId: string; studentName: string; status: Status }[]>([]);
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

  // ── CSV import handler ──────────────────────────────────────────────────
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "txt"].includes(ext || "")) {
      setImportError("Please upload a CSV file. In Excel: File → Save As → CSV (Comma delimited).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (!parsed.length) {
        setImportError("No students found. Check your CSV has columns: Roll No, Student Name");
        return;
      }
      setImportPreview(parsed);
    };
    reader.readAsText(file);
    if (csvRef.current) csvRef.current.value = "";
  };

  const applyImport = () => {
    const merged = [...students];
    const existingIds = new Set(merged.map(s => s.studentId));
    for (const s of importPreview) {
      if (!existingIds.has(s.studentId)) {
        merged.push({ ...s, status: "absent" });
        existingIds.add(s.studentId);
      }
    }
    setStudents(merged);
    setImportPreview([]);
  };

  // ── Create session ──────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const res  = await fetch("/api/teacher/attendance", {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ ...form, students }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSessions(prev => [data.session, ...prev]);
      setShowNew(false);
      setForm({ className: "", subject: "", date: new Date().toISOString().split("T")[0] });
      setStudents([]); setImportPreview([]);
    } catch (err: any) { setError(err.message); }
  };

  const addStudentRow = () => {
    if (!newStudent.studentName) return;
    const id = newStudent.studentId || `STU${students.length + 1}`;
    setStudents(prev => [...prev, { studentId: id, studentName: newStudent.studentName, status: "absent" }]);
    setNewStudent({ studentId: "", studentName: "" });
  };

  // ── Mark attendance ─────────────────────────────────────────────────────
  const cycleStatus = (studentId: string) => {
    if (!activeSession) return;
    const order: Status[] = ["present", "absent", "late"];
    setActiveSession({
      ...activeSession,
      students: activeSession.students.map(s =>
        s.studentId === studentId
          ? { ...s, status: order[(order.indexOf(s.status) + 1) % 3] }
          : s
      ),
    });
  };

  const markAll = (status: Status) => {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, students: activeSession.students.map(s => ({ ...s, status })) });
  };

  const saveAttendance = async () => {
    if (!activeSession) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/attendance/${activeSession._id}`, {
        method: "PATCH", headers: authHeaders(),
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>Attendance</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Create class sessions and mark student attendance</p>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}>
          <Icons.CalendarPlus width={16} height={16} /> New Session
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Icons.Loader width={28} height={28} style={{ color: "var(--muted)" }} />
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
            {sessions.filter(s => (s.className || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.subject || "").toLowerCase().includes(searchQuery.toLowerCase())).map(session => {
              const s = stats(session);
              const pct = s.total ? Math.round((s.present / s.total) * 100) : 0;
              const isActive = activeSession?._id === session._id;
              return (
                <Card key={session._id}
                  style={{ cursor: "pointer", border: `2px solid ${isActive ? "#1e3a5f" : "transparent"}`, transition: "all 0.15s ease" }}
                  onClick={() => setActiveSession(isActive ? null : { ...session })}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{session.className}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                        {session.subject} · {new Date(session.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteSession(session._id); }}
                      style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", display: "flex" }}>
                      <Icons.Trash width={14} height={14} />
                    </button>
                  </div>

                  {s.total > 0 ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 6, borderRadius: 99, background: "var(--bg-secondary)", overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 99 }} />
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ {s.present} Present</span>
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>✗ {s.absent} Absent</span>
                        {s.late > 0 && <span style={{ color: "#f59e0b", fontWeight: 600 }}>⏰ {s.late} Late</span>}
                        <span style={{ color: "var(--muted)", marginLeft: "auto" }}>{pct}% · {s.total} students</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No students</div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Active session — marking panel */}
          {activeSession && (
            <Card style={{ position: "sticky", top: 20, alignSelf: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{activeSession.className}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{activeSession.subject} · {activeSession.date}</div>
                </div>
                <button onClick={() => setActiveSession(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
                  <Icons.X width={18} height={18} />
                </button>
              </div>

              {/* Quick mark all */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center", marginRight: 4 }}>Mark all:</span>
                {(["present", "absent", "late"] as Status[]).map(s => (
                  <button key={s} onClick={() => markAll(s)}
                    style={{ padding: "4px 10px", borderRadius: 20, border: "none", background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text, fontWeight: 700, fontSize: 11, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit" }}>
                    {s}
                  </button>
                ))}
              </div>

              {activeSession.students.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontSize: 14 }}>No students in this session</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 420, overflowY: "auto" }}>
                  {activeSession.students.map((st, i) => {
                    const col = STATUS_COLORS[st.status];
                    return (
                      <div key={st.studentId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", minWidth: 22 }}>{i + 1}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{st.studentName}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{st.studentId}</div>
                          </div>
                        </div>
                        <button onClick={() => cycleStatus(st.studentId)}
                          style={{ padding: "5px 14px", borderRadius: 20, border: "none", background: col.bg, color: col.text, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize", minWidth: 72, fontFamily: "inherit" }}>
                          {st.status}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setActiveSession(null)}
                  style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
                <button onClick={saveAttendance} disabled={saving}
                  style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving && <Icons.Loader width={14} height={14} />}
                  {saving ? "Saving…" : "Save Attendance"}
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── New Session Modal ───────────────────────────────────────────── */}
      <Modal isOpen={showNew} onClose={() => { setShowNew(false); setError(""); setImportPreview([]); }} title="New Class Session">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "10px 12px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
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

          {/* ── Import from CSV/Excel ───────────────────────────── */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <Icons.FileText width={15} height={15} /> Import Students from File
              </span>
              <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#1e3a5f", color: "#fff", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                <Icons.Plus width={13} height={13} /> Upload CSV / Excel
                <input ref={csvRef} type="file" accept=".csv,.txt" onChange={handleFileImport} style={{ display: "none" }} />
              </label>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px" }}>
                📋 CSV format: <code style={{ background: "var(--bg-secondary)", padding: "1px 5px", borderRadius: 4 }}>Roll No, Student Name</code> (first row = headers)
              </p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
                💡 Excel users: Open file → File → Save As → <strong>CSV (Comma delimited)</strong>
              </p>
              {importError && (
                <div style={{ marginTop: 8, color: "#ef4444", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icons.AlertCircle width={13} height={13} /> {importError}
                </div>
              )}
              {importPreview.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Preview — {importPreview.length} students found:</div>
                  <div style={{ maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                    {importPreview.slice(0, 8).map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--muted)", padding: "3px 0" }}>
                        <span style={{ color: "var(--text)", fontWeight: 600 }}>{s.studentName}</span>
                        <span>ID: {s.studentId}</span>
                      </div>
                    ))}
                    {importPreview.length > 8 && <div style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>+{importPreview.length - 8} more…</div>}
                  </div>
                  <button type="button" onClick={applyImport}
                    style={{ marginTop: 8, padding: "6px 14px", borderRadius: 7, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
                    ✓ Add {importPreview.length} students to session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Manual add ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Add Manually</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={newStudent.studentId} onChange={e => setNewStudent({ ...newStudent, studentId: e.target.value })} placeholder="Roll No (optional)"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", outline: "none", fontSize: 13, fontFamily: "inherit", flex: 1 }} />
              <input value={newStudent.studentName} onChange={e => setNewStudent({ ...newStudent, studentName: e.target.value })} placeholder="Full Name *"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", outline: "none", fontSize: 13, fontFamily: "inherit", flex: 1 }} />
              <button type="button" onClick={addStudentRow}
                style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center" }}>
                <Icons.Plus width={16} height={16} />
              </button>
            </div>
            {students.length > 0 && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>
                  {students.length} student{students.length !== 1 ? "s" : ""} in this session
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {students.map((st, i) => (
                    <div key={st.studentId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--muted)", minWidth: 20 }}>{i + 1}.</span>
                        <span style={{ color: "var(--text)", fontWeight: 600 }}>{st.studentName}</span>
                        <span style={{ color: "var(--muted)", fontSize: 11 }}>{st.studentId}</span>
                      </div>
                      <button type="button" onClick={() => setStudents(prev => prev.filter(s => s.studentId !== st.studentId))}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", padding: 2 }}>
                        <Icons.X width={14} height={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={() => { setShowNew(false); setError(""); setImportPreview([]); }}
              style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
            <button type="submit"
              style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.Attendance width={15} height={15} /> Create Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
