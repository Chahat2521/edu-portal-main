import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "student");
    if (error) return error;

    await connectDB();

    // Return assignments either assigned specifically to this student
    // or broadcast assignments ("all")
    const assignments = await Assignment.find({
      $or: [
        { studentId: user.sub },
        { studentId: "all" },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json({ assignments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "student");
    if (error) return error;

    const body = await req.json();
    await connectDB();
    const assignment = await Assignment.create({ ...body, studentId: user.sub });
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
