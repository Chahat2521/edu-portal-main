import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import { getTokenFromHeader } from "@/lib/auth";
import { verifyToken } from "@/lib/token";

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

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const userId = payload.sub;
    const hasLiked = project.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      project.likes = project.likes.filter((id: string) => id !== userId);
    } else {
      // Like
      project.likes.push(userId);
    }

    await project.save();

    return NextResponse.json({ liked: !hasLiked, likes: project.likes.length }, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
