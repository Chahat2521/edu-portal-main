import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Grade from "@/models/Grade";
import Assignment from "@/models/Assignment";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();

    // Get all grades for students of this teacher
    const grades = await Grade.find({ teacherId: user.sub });

    // Get all assignments for this teacher
    const assignments = await Assignment.find({ teacherId: user.sub });

    // Calculate stats
    const avgScore = grades.length > 0
      ? (grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length).toFixed(2)
      : 0;

    const bestStudent = grades.length > 0
      ? [...grades].sort((a: any, b: any) => b.score - a.score)[0]
      : null;

    const needsAttention = grades.filter((g: any) => g.score < 50).length;

    return NextResponse.json({
      totalStudents: new Set(grades.map((g: any) => g.studentId)).size,
      averageScore: parseFloat(avgScore as string),
      totalAssignments: assignments.length,
      bestStudent,
      needsAttention,
      grades,
      assignments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
