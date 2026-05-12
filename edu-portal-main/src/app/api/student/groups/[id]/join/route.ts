import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import StudentGroup from "@/models/StudentGroup";

/* ── POST /api/student/groups/[id]/join  – join a group ─────── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const group = await StudentGroup.findById(id);
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    if (group.members.includes(user.id)) {
      return NextResponse.json({ error: "You are already a member of this group" }, { status: 409 });
    }
    if (!group.isOpen) {
      return NextResponse.json({ error: "This group is closed for new members" }, { status: 403 });
    }
    if (group.members.length >= group.maxMembers) {
      return NextResponse.json({ error: "Group is full" }, { status: 400 });
    }

    group.members.push(user.id);
    group.memberNames.push(user.name);
    await group.save();

    return NextResponse.json({ message: "Joined successfully", group });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── DELETE /api/student/groups/[id]/join  – leave a group ──── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const group = await StudentGroup.findById(id);
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    if (group.creatorId === user.id) {
      return NextResponse.json({ error: "Creator cannot leave. Delete the group instead." }, { status: 400 });
    }

    group.members     = group.members.filter((m: string) => m !== user.id);
    group.memberNames = group.memberNames.filter((_: string, i: number) => group.members[i] !== user.id);
    await group.save();

    return NextResponse.json({ message: "Left group successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
