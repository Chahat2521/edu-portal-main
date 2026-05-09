import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded: any = verifyToken(token || "");
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const assignments = await Assignment.find({ studentId: decoded.id });
    return NextResponse.json({ assignments });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded: any = verifyToken(token || "");
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await connectDB();
    const assignment = await Assignment.create({ ...body, studentId: decoded.id });
    return NextResponse.json({ assignment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET2(req: Request) {
  try {
    await connectDB();
    const studentId = new URL(req.url).searchParams.get("studentId");

    if (!studentId) {
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    }

    const assignments = await Assignment.find({ studentId }).lean();
    return new Response(JSON.stringify({ items: assignments || [] }), {
      status: 200,
    });
  } catch (err: any) {
    console.error("Assignments query error:", err.message);
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  }
}
