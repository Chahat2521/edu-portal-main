import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { requireRole } from "@/lib/auth";

/**
 * POST /api/student/assignments/[id]/submit
 * Body: { submissionUrl: string }
 * Marks an assignment as submitted with the uploaded file URL.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = requireRole(req, "student");
    if (error) return error;

    const body = await req.json();
    const { submissionUrl } = body;

    if (!submissionUrl) {
      return NextResponse.json({ error: "submissionUrl is required" }, { status: 400 });
    }

    await connectDB();

    const assignment = await Assignment.findById(params.id);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Allow if assignment was broadcast to "all" students or belongs to this student
    if (assignment.studentId !== "all" && assignment.studentId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (assignment.status === "graded") {
      return NextResponse.json({ error: "Already graded — cannot resubmit" }, { status: 400 });
    }

    const updated = await Assignment.findByIdAndUpdate(
      params.id,
      { submissionUrl, status: "submitted", studentId: user.sub },
      { new: true }
    );

    return NextResponse.json({ assignment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
