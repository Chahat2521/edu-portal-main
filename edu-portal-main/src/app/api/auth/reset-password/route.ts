import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain uppercase, lowercase, and a number" }, { status: 400 });
    }

    await connectDB();

    const resetRecord = await PasswordReset.findOne({ token, used: false });

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset link. Please request a new one." }, { status: 400 });
    }

    if (new Date() > resetRecord.expiresAt) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      { email: resetRecord.email },
      { password: hashed },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mark token as used
    await PasswordReset.updateOne({ _id: resetRecord._id }, { used: true });

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
