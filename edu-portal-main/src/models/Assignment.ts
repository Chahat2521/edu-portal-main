import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  description: string;
  fileUrl?: string;
  submissionUrl?: string;
  subject: string;
  subjectCode: string;
  tags: string[];
  done: boolean;
  dueDate: string;
  priority: "high" | "medium" | "low";
  studentId: string;
  teacherId: string;
  maxMarks: number;
  obtainedMarks?: number;
  status: "pending" | "submitted" | "graded";
  createdAt?: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String },
  submissionUrl: { type: String },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  tags: [{ type: String }],
  done: { type: Boolean, default: false },
  dueDate: { type: String },
  priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  studentId: { type: String, required: true },
  teacherId: { type: String, required: true },
  maxMarks: { type: Number, default: 100 },
  obtainedMarks: { type: Number },
  status: { type: String, enum: ["pending", "submitted", "graded"], default: "pending" },
}, { timestamps: true });

delete (mongoose.models as any).Assignment;
export default mongoose.model<IAssignment>("Assignment", AssignmentSchema);
