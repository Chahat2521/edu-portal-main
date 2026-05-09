import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  studentId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  status: "active" | "completed" | "dropped";
  createdAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Enrollment;
export default mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
