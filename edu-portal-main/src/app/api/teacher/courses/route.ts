import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const courses = await Course.find({ teacherId: user.sub }).sort({ createdAt: -1 });
    return NextResponse.json({ courses });
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

    const course = await Course.create({
      // frontend sends "title", model requires "name"
      name:         body.name || body.title || "Untitled Course",
      code:         body.code || `C-${Date.now()}`,
      description:  body.description || "",
      semester:     Number(body.semester) || 1,
      teacherId:    user.sub,
      teacherName:  user.name || "Faculty",
      department:   body.department || "",
      icon:         body.icon  || "📚",
      color:        body.color || "#e8f5e9",
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

