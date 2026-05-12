import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import { requireRole } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const body = await req.json();
    await connectDB();
    const { id } = await params;

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.teacherId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await Course.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ course: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.teacherId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Course.deleteOne({ _id: id });
    return NextResponse.json({ message: "Course deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
