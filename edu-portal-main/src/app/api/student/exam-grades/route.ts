import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExamGrade from "@/models/ExamGrade";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "student");
    if (error) return error;

    await connectDB();
    const grades = await ExamGrade.find({ studentId: user.sub }).sort({ createdAt: -1 });
    return NextResponse.json({ grades });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
