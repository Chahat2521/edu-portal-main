import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TimetableSession from "@/models/TimetableSession";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const sessions = await TimetableSession.find({ teacherId: user.sub }).sort({ day: 1, startTime: 1 });
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

    const session = await TimetableSession.create({
      day: body.day,
      startTime: body.startTime,
      endTime: body.endTime,
      title: body.title,
      type: body.type,
      location: body.location,
      instructor: body.instructor || user.name || "Faculty",
      semester: Number(body.semester) || 1,
      color: body.color || "#1e3a5f",
      teacherId: user.sub,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
