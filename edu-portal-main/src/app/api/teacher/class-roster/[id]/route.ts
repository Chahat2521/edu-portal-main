import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ClassRoster from "@/models/ClassRoster";
import { requireRole } from "@/lib/auth";

// PATCH — replace or add students to a roster
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const { id } = await params;
    const body   = await req.json();
    await connectDB();

    const roster = await ClassRoster.findOne({ _id: id, teacherId: user.sub });
    if (!roster) return NextResponse.json({ error: "Roster not found" }, { status: 404 });

    if (body.students) {
      if (body.replace) {
        // Full replace
        roster.students = body.students;
      } else {
        // Merge: add new students that don't already exist
        const existingIds = new Set(roster.students.map((s: any) => s.studentId));
        for (const s of body.students) {
          if (!existingIds.has(s.studentId)) {
            roster.students.push(s);
            existingIds.add(s.studentId);
          }
        }
      }
    }

    // Remove a single student
    if (body.removeStudentId) {
      roster.students = roster.students.filter((s: any) => s.studentId !== body.removeStudentId);
    }

    await roster.save();
    return NextResponse.json({ roster });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — delete the whole roster
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const { id } = await params;
    await connectDB();
    await ClassRoster.findOneAndDelete({ _id: id, teacherId: user.sub });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
