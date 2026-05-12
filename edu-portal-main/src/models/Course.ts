import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  semester: number;
  teacherId: string;
  teacherName: string;
  enrolledCount: number;
  department?: string;
  createdAt?: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String, default: "📚" },
    color: { type: String, default: "#e8f5e9" },
    semester: { type: Number, required: true },
    teacherId: { type: String, required: true },
    teacherName: { type: String, required: true },
    department: { type: String, default: "" },
    enrolledCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Course;
export default mongoose.model<ICourse>("Course", CourseSchema);
