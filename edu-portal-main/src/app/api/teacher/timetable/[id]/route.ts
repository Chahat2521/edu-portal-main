import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TimetableSession from "@/models/TimetableSession";
import { requireRole } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const deleted = await TimetableSession.findOneAndDelete({ _id: id, teacherId: user.sub });
    if (!deleted) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
