import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TimetableSession from "@/models/TimetableSession";
import User from "@/models/User";

function getUserId(token: string): string | null {
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    return decoded?.id || decoded?.sub || null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = getUserId(token);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    // Find the student to get their semester
    const student = await User.findById(userId);
    const semester = student?.semester || 1;

    // Fetch sessions for that specific semester
    const sessions = await TimetableSession.find({ semester }).sort({ day: 1, startTime: 1 });
    
    return NextResponse.json({ sessions, semester });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
