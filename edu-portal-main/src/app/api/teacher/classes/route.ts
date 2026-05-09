import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    return NextResponse.json({ classes: [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
