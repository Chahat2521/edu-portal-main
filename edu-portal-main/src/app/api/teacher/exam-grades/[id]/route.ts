import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExamGrade from "@/models/ExamGrade";
import { requireRole } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const { id } = await params;
    await connectDB();
    await ExamGrade.findOneAndDelete({ _id: id, teacherId: user.sub });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
