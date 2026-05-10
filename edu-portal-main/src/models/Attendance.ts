import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceStudent {
  studentId: string;
  studentName: string;
  status: "present" | "absent" | "late";
}

export interface IAttendance extends Document {
  className: string;
  subject: string;
  teacherId: string;
  date: string;        // ISO date string
  students: IAttendanceStudent[];
  createdAt?: Date;
}

const AttendanceStudentSchema = new Schema<IAttendanceStudent>({
  studentId:   { type: String, required: true },
  studentName: { type: String, required: true },
  status:      { type: String, enum: ["present", "absent", "late"], default: "absent" },
}, { _id: false });

const AttendanceSchema = new Schema<IAttendance>(
  {
    className: { type: String, required: true },
    subject:   { type: String, required: true },
    teacherId: { type: String, required: true },
    date:      { type: String, required: true },
    students:  { type: [AttendanceStudentSchema], default: [] },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Attendance;
export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
