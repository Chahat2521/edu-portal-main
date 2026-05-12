import mongoose, { Schema, Document } from "mongoose";

export interface IFacultyRequest extends Document {
  name: string;
  email: string;
  employeeId: string;
  department: string;
  password: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewNote?: string;
  createdAt?: Date;
}

const FacultyRequestSchema = new Schema<IFacultyRequest>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    employeeId: { type: String, required: true },
    department: { type: String, required: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: String },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

delete (mongoose.models as any).FacultyRequest;
export default mongoose.model<IFacultyRequest>("FacultyRequest", FacultyRequestSchema);
