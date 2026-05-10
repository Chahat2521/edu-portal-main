import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getUserFromRequest } from "@/lib/auth";

const ALLOWED_TYPES: Record<string, string> = {
  // Documents
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/msword": ".doc",
  // Images (for profile photos)
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_DOC_BYTES   = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_BYTES =  5 * 1024 * 1024; //  5 MB

export async function POST(req: NextRequest) {
  try {
    // Auth check — any logged-in user (teacher or student) can upload
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Only PDF, DOCX, or image files are allowed" },
        { status: 400 }
      );
    }

    // Validate size (images: 5 MB, docs: 10 MB)
    const maxBytes = IMAGE_TYPES.has(file.type) ? MAX_IMAGE_BYTES : MAX_DOC_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File size must be under ${maxBytes / (1024 * 1024)} MB` },
        { status: 400 }
      );
    }

    // Build unique filename
    const ext = ALLOWED_TYPES[file.type];
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}_${safeName}${safeName.endsWith(ext) ? "" : ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({ url, filename, size: file.size, type: file.type });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
