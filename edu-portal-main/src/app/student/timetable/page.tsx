"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/components/ui/Icons";
import Card from "@/components/ui/Card";
import { useGlobalSearch } from "@/contexts/SearchContext";

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [sessions, setSessions] = useState<any[]>([]);
  const [semester, setSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useGlobalSearch();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const token = JSON.parse(localStorage.getItem("edu_user") || "{}").token;
        const res = await fetch("/api/student/timetable", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setSessions(data.sessions || []);
          setSemester(data.semester);
        }
      } catch (err) {
        console.error("Failed to fetch timetable", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTimetable();
  }, []);

  const currentSchedule = sessions
    .filter(s => s.day === selectedDay)
    .filter(s => (s.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.location || "").toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Icons.Calendar width={26} height={26} /> My Timetable
          </h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0", fontSize: 15 }}>
            Your weekly class and lab schedule.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, background: "var(--bg-secondary)", padding: 6, borderRadius: 12, border: "1px solid var(--border)" }}>
          <button style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>Day</button>
          <button style={{ background: "transparent", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>Week</button>
        </div>
      </div>

      {/* Day Selector */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
        {days.map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                flex: "1 0 auto",
                padding: "12px 24px",
                borderRadius: 12,
                border: isActive ? "none" : "1px solid var(--border)",
                background: isActive ? "#1e3a5f" : "var(--card)",
                color: isActive ? "#ffffff" : "var(--text)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isActive ? "0 4px 12px rgba(30,58,95,0.25)" : "var(--shadow-sm)",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Schedule List */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--bg-secondary)", padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>{selectedDay}&apos;s Classes</h2>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", background: "var(--card)", padding: "4px 10px", borderRadius: 20, border: "1px solid var(--border)" }}>
            {currentSchedule.length} session{currentSchedule.length !== 1 ? "s" : ""}
          </span>
        </div>

        {currentSchedule.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <Icons.Calendar width={48} height={48} style={{ margin: "0 auto 16px", color: "var(--muted)", opacity: 0.3 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>No classes scheduled</h3>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>You have a free day on {selectedDay}!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {currentSchedule.map((session, index) => {
              const bgColor = `${session.color}15`;
              return (
              <div 
                key={session._id} 
                style={{ 
                  display: "flex", 
                  padding: "24px", 
                  borderBottom: index < currentSchedule.length - 1 ? "1px solid var(--border)" : "none",
                  gap: 24,
                  alignItems: "flex-start",
                  transition: "background 0.15s ease",
                  cursor: "default"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* Time block */}
                <div style={{ width: 140, flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                    {session.startTime}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                    to {session.endTime}
                  </div>
                </div>

                {/* Timeline line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: session.color, border: "4px solid var(--card)", boxShadow: `0 0 0 2px ${session.color}40`, zIndex: 2 }} />
                  {index < currentSchedule.length - 1 && (
                    <div style={{ width: 2, height: "calc(100% + 48px)", background: "var(--border)", position: "absolute", top: 16, zIndex: 1 }} />
                  )}
                </div>

                {/* Details card */}
                <div style={{ flex: 1, background: bgColor, borderLeft: `4px solid ${session.color}`, borderRadius: "0 12px 12px 0", padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0 }}>{session.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, color: session.color, background: "var(--card)", padding: "3px 10px", borderRadius: 99, border: `1px solid ${session.color}30` }}>
                      {session.type}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
                      <Icons.MapPin width={16} height={16} style={{ color: "var(--muted)" }} />
                      {session.location}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
                      <Icons.Users width={16} height={16} style={{ color: "var(--muted)" }} />
                      {session.instructor}
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </Card>
    </div>
  );
}
