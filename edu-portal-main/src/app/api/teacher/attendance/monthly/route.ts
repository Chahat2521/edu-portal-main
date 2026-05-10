import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { requireRole } from "@/lib/auth";

/**
 * GET /api/teacher/attendance/monthly?className=CS-3A&month=5&year=2026
 *
 * Returns:
 * {
 *   sessions: [...],           // all sessions for that class/month
 *   studentStats: [           // per-student summary
 *     { studentId, studentName, rollNo, present, absent, late, total, pct }
 *   ]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className") || "";
    const month     = parseInt(searchParams.get("month") || "0");
    const year      = parseInt(searchParams.get("year")  || "0");

    await connectDB();

    // Build date range filter
    let dateFilter: any = { teacherId: user.sub };
    if (className) dateFilter.className = className;

    if (month && year) {
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const end   = `${year}-${String(month).padStart(2, "0")}-31`;
      dateFilter.date = { $gte: start, $lte: end };
    }

    const sessions = await Attendance.find(dateFilter).sort({ date: 1 });

    // Aggregate per-student stats
    const studentMap = new Map<string, {
      studentId: string; studentName: string;
      present: number; absent: number; late: number; total: number;
    }>();

    for (const session of sessions) {
      for (const st of session.students) {
        const key = st.studentId;
        if (!studentMap.has(key)) {
          studentMap.set(key, { studentId: st.studentId, studentName: st.studentName, present: 0, absent: 0, late: 0, total: 0 });
        }
        const entry = studentMap.get(key)!;
        entry.total++;
        if (st.status === "present") entry.present++;
        else if (st.status === "absent") entry.absent++;
        else if (st.status === "late") entry.late++;
      }
    }

    const studentStats = Array.from(studentMap.values()).map(s => ({
      ...s,
      pct: s.total ? Math.round((s.present / s.total) * 100) : 0,
    })).sort((a, b) => a.studentName.localeCompare(b.studentName));

    return NextResponse.json({ sessions, studentStats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
