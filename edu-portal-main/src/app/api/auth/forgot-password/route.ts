import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { email } = body;

    if (!email || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    await connectDB();

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If this email is registered, you will receive reset instructions.",
      });
    }

    // Invalidate any previous tokens for this email
    await PasswordReset.deleteMany({ email: emailLower });

    // Generate a secure token (64 hex chars)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordReset.create({ email: emailLower, token, expiresAt, used: false });

    // In production, send via email. For now, log the reset link.
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    console.log(`[Password Reset] URL for ${emailLower}: ${resetUrl}`);

    // TODO: Integrate email provider (SendGrid, Resend, Nodemailer) to send resetUrl

    return NextResponse.json({
      message: "If this email is registered, you will receive reset instructions.",
      // Only expose in development for testing
      ...(process.env.NODE_ENV === "development" && { devResetUrl: resetUrl }),
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
