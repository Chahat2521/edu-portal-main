import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import StudentGroup from "@/models/StudentGroup";

/* ── GET /api/student/groups  – list all groups ─────────────── */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const open    = searchParams.get("open");

    const filter: Record<string, any> = {};
    if (subject) filter.subjectCode = subject;
    if (open === "true") filter.isOpen = true;

    const groups = await StudentGroup.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ groups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── POST /api/student/groups  – create a group ─────────────── */
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

    const { name, description, subject, subjectCode, isOpen, maxMembers, tags, meetingSchedule } = body;

    if (!name?.trim())        return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    if (!subject?.trim())     return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    if (!subjectCode?.trim()) return NextResponse.json({ error: "Subject code is required" }, { status: 400 });

    await connectDB();

    const group = await StudentGroup.create({
      name:            name.trim(),
      description:     description?.trim() || "",
      subject:         subject.trim(),
      subjectCode:     subjectCode.trim(),
      creatorId:       user.id,
      creatorName:     user.name,
      members:         [user.id],
      memberNames:     [user.name],
      isOpen:          isOpen !== false,
      maxMembers:      Math.min(Math.max(Number(maxMembers) || 10, 2), 50),
      tags:            Array.isArray(tags) ? tags.slice(0, 5) : [],
      meetingSchedule: meetingSchedule?.trim() || "",
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
