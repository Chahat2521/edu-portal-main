import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ClassRoster from "@/models/ClassRoster";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;
    await connectDB();
    const rosters = await ClassRoster.find({ teacherId: user.sub }).sort({ createdAt: -1 });
    return NextResponse.json({ rosters });
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

    if (!body.className || !body.subject) {
      return NextResponse.json({ error: "className and subject are required" }, { status: 400 });
    }

    const roster = await ClassRoster.create({
      teacherId: user.sub,
      className: body.className,
      subject:   body.subject,
      students:  (body.students || []).map((s: any, i: number) => ({
        studentId:   s.studentId || `${body.className}-${i + 1}`,
        studentName: s.studentName,
        rollNo:      s.rollNo || `${i + 1}`,
      })),
    });

    return NextResponse.json({ roster }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
