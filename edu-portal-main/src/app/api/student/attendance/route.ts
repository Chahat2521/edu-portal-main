import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "student");
    if (error) return error;

    await connectDB();
    // Find all sessions where this student appears
    const sessions = await Attendance.find({
      "students.studentId": user.sub,
    }).sort({ date: -1 });

    // For each session, return only the relevant student's status
    const records = sessions.map((s: any) => {
      const student = s.students.find((st: any) => st.studentId === user.sub);
      return {
        _id:       s._id,
        className: s.className,
        subject:   s.subject,
        date:      s.date,
        status:    student?.status || "absent",
      };
    });

    return NextResponse.json({ records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
