import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const sessions = await Attendance.find({ teacherId: user.sub }).sort({ date: -1 });
    return NextResponse.json({ sessions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const body = await req.json();
    await connectDB();

    if (!body.className || !body.subject || !body.date) {
      return NextResponse.json({ error: "className, subject and date are required" }, { status: 400 });
    }

    const session = await Attendance.create({
      className: body.className,
      subject:   body.subject,
      date:      body.date,
      teacherId: user.sub,
      students:  (body.students || []).map((s: any) => ({
        studentId:   s.studentId || s.id || "",
        studentName: s.studentName || s.name || "",
        status:      s.status || "absent",
      })),
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
