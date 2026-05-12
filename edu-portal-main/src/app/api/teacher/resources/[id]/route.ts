import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { requireRole } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    const body = await req.json();
    await connectDB();
    const { id } = await params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (resource.uploadedBy !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await Resource.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ resource: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = requireRole(req, "teacher");
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (resource.uploadedBy !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Resource.deleteOne({ _id: id });
    return NextResponse.json({ message: "Resource deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
