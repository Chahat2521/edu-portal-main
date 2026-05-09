import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { requireRole } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const body = await req.json();
    await connectDB();

    const assignment = await Assignment.findById(params.id);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.teacherId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await Assignment.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ assignment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const assignment = await Assignment.findById(params.id);

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.teacherId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Assignment.deleteOne({ _id: params.id });
    return NextResponse.json({ message: "Assignment deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
