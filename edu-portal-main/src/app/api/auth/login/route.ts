import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import FacultyRequest from "@/models/FacultyRequest";
import { signToken } from "@/lib/auth";

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { email, password } = body;

    // ── Validate inputs ────────────────────────────────────────
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // ── Admin short-circuit ────────────────────────────────────
    if (
      emailLower === process.env.ADMIN_EMAIL?.toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = signToken({ id: "admin", role: "admin", name: "Admin User" });
      return NextResponse.json({
        token,
        user: { id: "admin", name: "Admin User", role: "admin" },
      });
    }

    // ── DB connection ──────────────────────────────────────────
    try {
      await connectDB();
    } catch (dbErr: any) {
      console.error("DB connection error:", dbErr.message);
      return NextResponse.json({ error: "Database connection failed. Please try again." }, { status: 500 });
    }

    // ── Lookup user ────────────────────────────────────────────
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      // Check if teacher application is pending/rejected
      const request = await FacultyRequest.findOne({ email: emailLower });
      if (request) {
        if (request.status === "pending") {
          return NextResponse.json({ error: "Your account is pending admin approval. Please wait." }, { status: 403 });
        }
        if (request.status === "rejected") {
          return NextResponse.json({ error: "Your faculty application was rejected. Please contact the admin." }, { status: 403 });
        }
      }
      // Generic message to prevent email enumeration
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ── Password check ─────────────────────────────────────────
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
