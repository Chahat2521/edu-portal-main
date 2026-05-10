import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { requireRole } from "@/lib/auth";

// PATCH /api/teacher/attendance/[id] — update student attendance statuses
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const { id } = await params;
    const body   = await req.json();
    await connectDB();

    const session = await Attendance.findOne({ _id: id, teacherId: user.sub });
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // body.students: array of { studentId, studentName, status }
    if (body.students) {
      session.students = body.students;
    }
    // OR update a single student's status
    if (body.studentId && body.status) {
      const idx = session.students.findIndex((s: any) => s.studentId === body.studentId);
      if (idx >= 0) session.students[idx].status = body.status;
    }

    await session.save();
    return NextResponse.json({ session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/teacher/attendance/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const { id } = await params;
    await connectDB();
    await Attendance.findOneAndDelete({ _id: id, teacherId: user.sub });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
