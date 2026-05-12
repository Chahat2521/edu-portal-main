"use client";

import { useState, useEffect, useCallback } from "react";
import { Icons } from "@/components/ui/Icons";
import Card from "@/components/ui/Card";

const getToken = () => {
  try { return JSON.parse(localStorage.getItem("edu_user") || "{}").token || ""; }
  catch { return ""; }
};

type Status = "present" | "absent" | "late";

interface AttendanceRecord {
  _id: string; className: string; subject: string;
  date: string; status: Status;
}

const STATUS_STYLES: Record<Status, { bg: string; text: string; icon: React.ReactNode }> = {
  present: { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", icon: "✓" },
  absent:  { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", icon: "✗" },
  late:    { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", icon: "⏰" },
};

export default function StudentAttendancePage() {
  const [records, setRecords]   = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Status | "all">("all");

  const fetchRecords = useCallback(async () => {
    try {
      const res  = await fetch("/api/student/attendance", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setRecords(data.records || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const total   = records.length;
  const present = records.filter(r => r.status === "present").length;
  const absent  = records.filter(r => r.status === "absent").length;
  const late    = records.filter(r => r.status === "late").length;
  const pct     = total ? Math.round((present / total) * 100) : 0;

  // Group by subject
  const bySubject = records.reduce<Record<string, AttendanceRecord[]>>((acc, r) => {
    acc[r.subject] = acc[r.subject] || [];
    acc[r.subject].push(r);
    return acc;
  }, {});

  const filtered = filter === "all" ? records : records.filter(r => r.status === filter);

  return (
    <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>My Attendance</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>View your attendance across all classes</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Icons.Loader width={28} height={28} className="animate-spin" style={{ color: "var(--muted)" }} />
        </div>
      ) : total === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 24px" }}>
          <Icons.Attendance width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>No attendance records</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Your attendance will appear here once your teacher marks it.</p>
        </Card>
      ) : (
        <>
          {/* Overview row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { label: "Overall", value: `${pct}%`, sub: `${present}/${total} classes`, color: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444", big: true },
              { label: "Present", value: present, color: "#22c55e" },
              { label: "Absent",  value: absent,  color: "#ef4444" },
              { label: "Late",    value: late,    color: "#f59e0b" },
            ].map((s, i) => (
              <Card key={i} style={{ textAlign: "center", padding: "20px 12px" }}>
                <div style={{ fontSize: i === 0 ? 32 : 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
                {s.sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.sub}</div>}
              </Card>
            ))}
          </div>

          {/* Overall progress bar */}
          <Card style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>Overall Attendance</span>
              <span style={{ fontWeight: 700, color: pct >= 75 ? "#22c55e" : "#ef4444" }}>{pct}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 99, background: "var(--bg-secondary)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, transition: "width 0.5s ease",
                background: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444" }} />
            </div>
            {pct < 75 && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 6 }}>
                ⚠️ Attendance below 75% — {Math.ceil((0.75 * total - present) / 0.25)} more classes needed to reach 75%
              </div>
            )}
          </Card>

          {/* Per-subject breakdown */}
          {Object.keys(bySubject).length > 1 && (
            <Card>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Subject-wise Attendance</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(bySubject).map(([subject, recs]) => {
                  const sp = recs.filter(r => r.status === "present").length;
                  const spct = Math.round((sp / recs.length) * 100);
                  return (
                    <div key={subject}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>{subject}</span>
                        <span style={{ color: spct >= 75 ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{spct}% ({sp}/{recs.length})</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 99, background: "var(--bg-secondary)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${spct}%`, borderRadius: 99, background: spct >= 75 ? "#22c55e" : "#ef4444", transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Filter + Records table */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "present", "absent", "late"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "7px 14px", borderRadius: 20, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: filter === f ? "#1e3a5f" : "var(--bg-secondary)",
                  color: filter === f ? "#fff" : "var(--muted)", textTransform: "capitalize" }}>
                {f === "all" ? `All (${total})` : `${f} (${records.filter(r => r.status === f).length})`}
              </button>
            ))}
          </div>

          <Card style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--muted)" }}>
                  {["Date", "Class", "Subject", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontWeight: 600, textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const s = STATUS_STYLES[r.status];
                  return (
                    <tr key={r._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 16px", color: "var(--muted)" }}>
                        {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--text)" }}>{r.className}</td>
                      <td style={{ padding: "14px 16px", color: "var(--text)" }}>{r.subject}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.text, fontWeight: 700, fontSize: 12, textTransform: "capitalize" }}>
                          {s.icon} {r.status}
                        </span>
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
