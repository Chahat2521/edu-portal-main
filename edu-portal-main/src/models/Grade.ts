import mongoose, { Schema, Document } from "mongoose";

export interface IGrade extends Document {
  studentId: string;
  studentName: string;
  subject: string;
  subjectCode: string;
  grade: string;
  score: number;
  semester: number;
  type: "internal" | "external";
  remarks: string;
  teacherId: string;
  createdAt?: Date;
}

const GradeSchema = new Schema<IGrade>(
  {
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    subject: { type: String, required: true },
    subjectCode: { type: String, required: true },
    grade: { type: String, required: true },
    score: { type: Number, required: true },
    semester: { type: Number },
    type: { type: String, enum: ["internal", "external"], default: "external" },
    remarks: { type: String },
    teacherId: { type: String, required: true },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Grade;
export default mongoose.model<IGrade>("Grade", GradeSchema);
