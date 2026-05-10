import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import Course from "@/models/Course";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const assignments = await Assignment.find({ teacherId: user.sub }).sort({ createdAt: -1 });

    return NextResponse.json({ assignments });
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

    // Resolve subject/subjectCode from courseId if provided
    let subject = body.subject || "General";
    let subjectCode = body.subjectCode || "GEN001";

    if (body.courseId) {
      try {
        const course = await Course.findById(body.courseId);
        if (course) {
          subject = course.name || subject;
          subjectCode = course.code || subjectCode;
        }
      } catch {
        // courseId invalid — use defaults
      }
    }

    const assignment = await Assignment.create({
      title: body.title,
      description: body.description || "",
      dueDate: body.dueDate || "",
      fileUrl: body.fileUrl || "",
      subject,
      subjectCode,
      priority: body.priority || "medium",
      maxMarks: body.maxMarks || 100,
      // Teacher assignments don't belong to a single student initially
      studentId: body.studentId || "all",
      teacherId: user.sub,
      status: "pending",
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
