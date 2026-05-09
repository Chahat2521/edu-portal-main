import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import FacultyRequest from "@/models/FacultyRequest";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "admin");
    if (error) return error;

    await connectDB();

    const requests = await FacultyRequest.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error("Faculty requests error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, "admin");
    if (error) return error;

    const body = await req.json();
    const { id, action, note } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "ID and action required" }, { status: 400 });
    }

    await connectDB();

    const request = await FacultyRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Hash password before creating user
      const hashedPassword = await bcrypt.hash(request.password, 10);
      
      // Create User account for faculty
      const newUser = await User.create({
        name: request.name,
        email: request.email,
        password: hashedPassword,
        role: "teacher",
        employeeId: request.employeeId,
        department: request.department,
      });

      // Update request status
      request.status = "approved";
      request.reviewedBy = user.id;
      await request.save();

      return NextResponse.json({
        message: "Faculty approved",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } else if (action === "reject") {
      request.status = "rejected";
      request.reviewedBy = user.id;
      request.reviewNote = note;
      await request.save();

      return NextResponse.json({ message: "Faculty rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Approve/reject error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
