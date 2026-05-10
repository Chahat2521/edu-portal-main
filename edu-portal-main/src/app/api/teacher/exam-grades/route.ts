import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExamGrade from "@/models/ExamGrade";
import Notification from "@/models/Notification";
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

    // Notify the student their grade has been uploaded
    if (body.studentId) {
      const pct  = Math.round((Number(body.marks) / Number(body.maxMarks || 100)) * 100);
      const type = ["quiz", "mid", "final", "assignment"].includes(body.examType)
        ? { quiz: "Quiz", mid: "Mid-Term", final: "Final Exam", assignment: "Assignment" }[body.examType as string] || body.examType
        : body.examType;

      await Notification.create({
        userId:  body.studentId,
        title:   "Grade Uploaded",
        message: `Your ${type} marks for ${body.subject} have been recorded: ${body.marks}/${body.maxMarks} (${pct}%). ${body.remarks ? `Remarks: ${body.remarks}` : ""}`.trim(),
        type:    pct >= 75 ? "success" : pct >= 50 ? "info" : "warning",
        link:    "/student/exam-grades",
        read:    false,
      });
    }

    return NextResponse.json({ grade }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

