import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const courses = await Course.find();
    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
