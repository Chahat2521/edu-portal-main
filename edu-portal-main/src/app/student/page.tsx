"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";

/* ── Tiny stat card ─────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: "var(--shadow-sm)", flex: 1 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: color, fontWeight: 700, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── Enrolled course card (with progress bar) ─────────────── */
function EnrolledCourseCard({ course }: { course: { name: string; code: string; progress: number; nextUp: string; nextDate: string; status: string; color: string } }) {
  return (
    <Link href="/student/courses" style={{ textDecoration: "none" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-sm)", height: "100%", transition: "transform 0.15s ease", cursor: "pointer" }}
           onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
           onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: course.color }}>{course.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{course.code}</div>
          </div>
          <span style={{ background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>{course.status}</span>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Progress</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text)" }}>{course.progress}%</span>
          </div>
          <div style={{ height: 7, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${course.progress}%`, background: "#1e3a5f", borderRadius: 99, transition: "width 0.8s ease" }} />
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
          <Icons.Calendar width={14} height={14} />
          <span>Up next: <strong style={{ color: "var(--text)" }}>{course.nextUp}</strong> ({course.nextDate})</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Schedule item ──────────────────────────────────────────── */
function ScheduleItem({ time, title, location, accent }: { time: string; title: string; location: string; accent: string }) {
  return (
    <Link href="/student/timetable" style={{ textDecoration: "none", display: "block" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid var(--border)", transition: "background 0.15s ease", cursor: "pointer", borderRadius: 8 }}
           onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
           onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", minWidth: 54, textAlign: "right", paddingTop: 2, paddingLeft: 8 }}>{time}</div>
        <div style={{ width: 3, height: 40, background: accent, borderRadius: 99, flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}><Icons.MapPin width={14} height={14} /> {location}</div>
        </div>
      </div>
    </Link>
  );
}

export default function StudentDashboard() {
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const stored = localStorage.getItem("edu_user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserName(user.name?.split(" ")[0] || "Student");
    }
  }, []);

  const stats = [
    { icon: <Icons.GraduationCap width={24} height={24} />, label: "Current GPA",      value: "3.92", sub: "▲ +0.05",   color: "#1e3a5f" },
    { icon: <Icons.Award width={24} height={24} />, label: "Credits Earned",    value: "84",   sub: "of 120",    color: "#7dc443" },
    { icon: <Icons.FileText width={24} height={24} />, label: "Upcoming Tasks",    value: "5",    sub: "3 this week", color: "#f59e0b" },
  ];

  const enrolledCourses = [
    { name: "Data Structures & Algorithms", code: "CS 301", progress: 65, nextUp: "Project 2 Due",        nextDate: "Oct 15", status: "Active", color: "#1e3a5f" },
    { name: "Database Management",          code: "CS 330", progress: 80, nextUp: "Reading Quiz",          nextDate: "Oct 12", status: "Active", color: "#1e3a5f" },
    { name: "Linear Algebra",               code: "MATH 210", progress: 45, nextUp: "Midterm Exam",       nextDate: "Oct 18", status: "Active", color: "#1e3a5f" },
    { name: "Ethics in Technology",         code: "PHIL 205", progress: 90, nextUp: "Discussion Post",    nextDate: "Oct 10", status: "Active", color: "#1e3a5f" },
  ];

  const schedule = [
    { time: "09:00 AM", title: "CS 301 Lecture",    location: "Science Bldg 104", accent: "#1e3a5f" },
    { time: "11:30 AM", title: "MATH 210 Seminar",  location: "Math Hall 201",    accent: "#7dc443" },
    { time: "02:00 PM", title: "CS 330 Lab",        location: "Computing Center 4A", accent: "#4fa3e0" },
  ];

  const quickLinks = [
    { href: "/student/courses",     icon: <Icons.BookOpen width={18} height={18} />, label: "My Courses"   },
    { href: "/student/assignments", icon: <Icons.FileText width={18} height={18} />, label: "Assignments"  },
    { href: "/student/grades",      icon: <Icons.Chart width={18} height={18} />, label: "Grades"       },
    { href: "/student/resources",   icon: <Icons.File width={18} height={18} />, label: "Resources"    },
    { href: "/student/groups",      icon: <Icons.Users width={18} height={18} />, label: "Study Groups" },
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1300, margin: "0 auto" }}>

      {/* ── Header row ───────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>
            Welcome back, {userName}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>
            Here&apos;s what&apos;s happening in your academic term.
          </p>
        </div>
        <Link
          href="/student/courses"
          style={{
            background: "#1e3a5f",
            color: "#fff",
            padding: "11px 22px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(30,58,95,0.3)",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icons.BookOpen width={18} height={18} /> Register for Classes
        </Link>
      </div>

      {/* ── Quick nav pills ───────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 99, padding: "7px 16px", fontSize: 13, fontWeight: 600,
              color: "var(--text-secondary)", textDecoration: "none",
              boxShadow: "var(--shadow-sm)", transition: "all 0.15s ease",
            }}
          >
            <span>{q.icon}</span> {q.label}
          </Link>
        ))}
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Main content grid ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>

        {/* Left: enrolled courses */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", margin: 0 }}>
              Current Enrolled Courses
            </h2>
            <Link href="/student/courses" style={{ fontSize: 13, color: "#1e3a5f", fontWeight: 700, textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {enrolledCourses.map((c) => <EnrolledCourseCard key={c.code} course={c} />)}
          </div>

          {/* Bottom row: recent activity */}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", margin: "0 0 16px" }}>
              Recent Activity
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: <Icons.Check width={20} height={20} />, text: "ER Diagram Lab Report submitted",        time: "2 hrs ago",  color: "#22c55e" },
                { icon: <Icons.Chart width={20} height={20} />, text: "Grade posted for MATH 210 Quiz 3",       time: "5 hrs ago",  color: "#4fa3e0" },
                { icon: <Icons.Bell width={20} height={20} />, text: "New resource uploaded: SQL Practice Set", time: "Yesterday", color: "#f59e0b" },
                { icon: <Icons.Users width={20} height={20} />, text: "You joined Study Group: CS301 Trees",    time: "2 days ago", color: "#8b5cf6" },
              ].map((item) => (
                <div key={item.text} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-sm)" }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{item.text}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: today's schedule + quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Today's Schedule */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 22, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>Today&apos;s Schedule</h3>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
            {schedule.map((s) => <ScheduleItem key={s.title} {...s} />)}
            <Link href="/student/timetable" style={{ display: "block", textAlign: "center", marginTop: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 0", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textDecoration: "none" }}>
              View Full Calendar →
            </Link>
          </div>

          {/* Study Groups */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 22, boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: "0 0 14px" }}>Study Groups</h3>
            {[
              { name: "CS301 Trees & Graphs", members: 8,  tag: "Active" },
              { name: "SQL Practice Group",   members: 12, tag: "Open"   },
            ].map((g) => (
              <div key={g.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{g.members} members</div>
                </div>
                <span style={{ background: g.tag === "Active" ? "#dcfce7" : "#eff6ff", color: g.tag === "Active" ? "#166534" : "#1e40af", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>{g.tag}</span>
              </div>
            ))}
            <Link href="/student/groups" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, background: "#1e3a5f", color: "#fff", borderRadius: 10, padding: "9px 0", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              <Icons.Users width={16} height={16} /> View All Groups
            </Link>
          </div>

          {/* Announcements */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 22, boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}><Icons.Bell width={18} height={18} /> Announcements</h3>
            {[
              { text: "Mid-term exam schedule published", time: "Today",      urgent: true  },
              { text: "Library extended hours this week", time: "Yesterday",  urgent: false },
              { text: "New resources added for CS302",    time: "2 days ago", urgent: false },
            ].map((a) => (
              <div key={a.text} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                {a.urgent && <span style={{ fontSize: 11, background: "#fef2f2", color: "#dc2626", fontWeight: 700, padding: "2px 7px", borderRadius: 99, whiteSpace: "nowrap", alignSelf: "flex-start" }}>NEW</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
