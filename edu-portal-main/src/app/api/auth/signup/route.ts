import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import FacultyRequest from "@/models/FacultyRequest";
import { signToken } from "@/lib/auth";

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const PASSWORD_MIN = 8;

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const { name, email, password, role, enrollmentNumber, employeeId, department } = body;

    // ── Name validation ────────────────────────────────────────
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    // ── Email validation ───────────────────────────────────────
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address (e.g. you@university.edu)" }, { status: 400 });
    }

    // ── Password validation ────────────────────────────────────
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }
    if (password.length < PASSWORD_MIN) {
      return NextResponse.json({ error: `Password must be at least ${PASSWORD_MIN} characters` }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one uppercase letter" }, { status: 400 });
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one lowercase letter" }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one number" }, { status: 400 });
    }

    // ── Role validation ────────────────────────────────────────
    if (!role || !["student", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
    }

    // ── DB connection ──────────────────────────────────────────
    try {
      await connectDB();
    } catch (dbErr: any) {
      console.error("DB connection error:", dbErr.message);
      return NextResponse.json({
        error: "Database connection failed. Check MONGODB_URI in .env.local",
      }, { status: 500 });
    }

    const emailLower = email.toLowerCase().trim();

    // ── Duplicate checks ───────────────────────────────────────
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return NextResponse.json({ error: "This email is already registered. Please log in." }, { status: 409 });
    }

    const existingRequest = await FacultyRequest.findOne({ email: emailLower });
    if (existingRequest) {
      return NextResponse.json({ error: "A faculty application with this email already exists." }, { status: 409 });
    }

    // ── Hash password ──────────────────────────────────────────
    const hashed = await bcrypt.hash(password, 12);

    // ── Teacher flow: create pending request ───────────────────
    if (role === "teacher") {
      if (!employeeId || !employeeId.trim()) {
        return NextResponse.json({ error: "Employee ID is required for faculty" }, { status: 400 });
      }

      await FacultyRequest.create({
        name: name.trim(),
        email: emailLower,
        employeeId: employeeId.trim(),
        department: department?.trim() || "",
        password: hashed,
        status: "pending",
      });

      return NextResponse.json({
        pending: true,
        message: "Your faculty application has been submitted. Await admin approval.",
      }, { status: 201 });
    }

    // ── Student flow: create account immediately ───────────────
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      password: hashed,
      role: "student",
      enrollmentNumber: enrollmentNumber?.trim() || "",
    });

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
    }, { status: 201 });

  } catch (err: any) {
    console.error("Signup route error:", err);
    if (err.code === 11000) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e: any) => e.message).join(", ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
