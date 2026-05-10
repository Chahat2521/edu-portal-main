"use client";

import { useState, useEffect, useCallback } from "react";
import { Icons } from "@/components/ui/Icons";
import Card from "@/components/ui/Card";
import Modal from "@/components/shared/Modal";
import { useGlobalSearch } from "@/contexts/SearchContext";

const getToken = () => {
  try { return JSON.parse(localStorage.getItem("edu_user") || "{}").token || ""; }
  catch { return ""; }
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS = ["#1e3a5f", "#4fa3e0", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899"];

export default function TeacherTimetablePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { searchQuery } = useGlobalSearch();

  const [form, setForm] = useState({
    day: "Monday",
    startTime: "09:00 AM",
    endTime: "10:30 AM",
    title: "",
    type: "Lecture",
    location: "",
    semester: 1,
    color: "#1e3a5f"
  });

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/timetable", { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setSessions(data.sessions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/teacher/timetable", {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create session");
      
      setSessions([...sessions, data.session]);
      setShowModal(false);
      setForm({ ...form, title: "", location: "" }); // Reset some fields
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      const res = await fetch(`/api/teacher/timetable/${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) setSessions(sessions.filter(s => s._id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>Timetable Management</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Create and manage class schedules for students.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}>
          <Icons.Plus width={16} height={16} /> Add Session
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Icons.Loader width={28} height={28} className="animate-spin" style={{ color: "var(--muted)" }} />
        </div>
      ) : sessions.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 24px" }}>
          <Icons.Calendar width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>No sessions scheduled</h3>
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 14 }}>Click 'Add Session' to start building the timetable.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {DAYS.map(day => {
            const daySessions = sessions
              .filter(s => s.day === day)
              .filter(s => (s.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.location || "").toLowerCase().includes(searchQuery.toLowerCase()))
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            if (daySessions.length === 0) return null;
            return (
              <div key={day}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>{day}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {daySessions.map(session => (
                    <Card key={session._id} style={{ borderLeft: `4px solid ${session.color}`, position: "relative" }}>
                      <button onClick={() => handleDelete(session._id)}
                        style={{ position: "absolute", top: 12, right: 12, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex" }}>
                        <Icons.Trash width={14} height={14} />
                      </button>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px", paddingRight: 24 }}>{session.title}</h3>
                      <div style={{ fontSize: 12, fontWeight: 600, color: session.color, background: `${session.color}15`, display: "inline-block", padding: "2px 8px", borderRadius: 6, marginBottom: 12 }}>
                        {session.type} · Sem {session.semester}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--muted)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icons.Calendar width={14} height={14} /> {session.startTime} - {session.endTime}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icons.MapPin width={14} height={14} /> {session.location}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError(""); }} title="Add Timetable Session">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div style={{ color: "#ef4444", fontSize: 13, background: "rgba(239,68,68,0.1)", padding: 10, borderRadius: 8 }}>{error}</div>}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Day</label>
              <select value={form.day} onChange={e => setForm({...form, day: e.target.value})} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }}>
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Title (e.g., CS 301 Data Structures)</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Start Time</label>
              <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>End Time</label>
              <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Target Semester</label>
              <select value={form.semester} onChange={e => setForm({...form, semester: Number(e.target.value)})} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} required style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Accent Color</label>
            <div style={{ display: "flex", gap: 8 }}>
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm({...form, color: c})}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: form.color === c ? "3px solid var(--text)" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s" }}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ marginTop: 8, padding: "12px", borderRadius: 10, border: "none", background: "#1e3a5f", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", gap: 8 }}>
            {saving ? <Icons.Loader className="animate-spin" width={20} height={20} /> : "Save Session"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
