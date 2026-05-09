import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    if (!decoded || !decoded.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const notifications = await Notification.find({ userId: decoded.sub }).sort({ createdAt: -1 }).limit(20);

    return NextResponse.json({ notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    if (!decoded || !decoded.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    // Mark all as read
    await Notification.updateMany({ userId: decoded.sub, read: false }, { $set: { read: true } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
