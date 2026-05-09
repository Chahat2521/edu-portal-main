import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Grade from "@/models/Grade";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const grades = await Grade.find({ teacherId: user.sub }).sort({ createdAt: -1 });

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

    const grade = await Grade.create({
      ...body,
      teacherId: user.sub,
    });

    return NextResponse.json({ grade }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
