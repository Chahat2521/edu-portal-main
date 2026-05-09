import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  enrollmentNumber?: string;
  employeeId?: string;
  department?: string;
  semester?: number;
  avatar?: string;
  bio?: string;
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    enrollmentNumber: { type: String },
    employeeId: { type: String },
    department: { type: String },
    semester: { type: Number },
    avatar: { type: String },
    bio: { type: String },
  },
  { timestamps: true }
);

delete (mongoose.models as any).User;

export default mongoose.model<IUser>("User", UserSchema);
