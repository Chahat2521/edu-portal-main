import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getTokenFromHeader } from "@/lib/auth";
import { verifyToken } from "@/lib/token";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const query: any = {};
    if (type) query.type = type;

    const resources = await Resource.find(query)
      .lean()
      .sort({ createdAt: -1 });

    return NextResponse.json({ resources }, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { resourceId } = await req.json();
    if (!resourceId) {
      return NextResponse.json({ error: "Resource ID required" }, { status: 400 });
    }

    // Increment download count
    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } });

    return NextResponse.json({ message: "Download counted" }, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
