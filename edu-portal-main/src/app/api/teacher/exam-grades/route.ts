import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExamGrade from "@/models/ExamGrade";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const grades = await ExamGrade.find({ teacherId: user.sub }).sort({ createdAt: -1 });
    return NextResponse.json({ grades });
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

    const grade = await ExamGrade.create({
      studentId:   body.studentId   || "",
      studentName: body.studentName || "",
      subject:     body.subject     || "",
      subjectCode: body.subjectCode || "",
      examType:    body.examType    || "quiz",
      marks:       Number(body.marks)    || 0,
      maxMarks:    Number(body.maxMarks) || 100,
      semester:    Number(body.semester) || 1,
      remarks:     body.remarks     || "",
      teacherId:   user.sub,
    });

    return NextResponse.json({ grade }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
