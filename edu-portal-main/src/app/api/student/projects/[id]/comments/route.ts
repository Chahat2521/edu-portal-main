import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Project from "@/models/Project";
import { getTokenFromHeader } from "@/lib/auth";
import { verifyToken } from "@/lib/token";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const comments = await Comment.find({ projectId: id })
      .lean()
      .sort({ createdAt: -1 });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;

    const { content, authorName } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const comment = await Comment.create({
      projectId: id,
      authorId: payload.sub,
      authorName: authorName || "Anonymous",
      content,
    });

    // Increment comment count on project
    await Project.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
