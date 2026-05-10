import mongoose, { Schema, Document } from "mongoose";

export interface ITimetableSession extends Document {
  day: string;
  startTime: string;
  endTime: string;
  title: string;
  type: string;
  location: string;
  instructor: string;
  semester: number;
  teacherId: string;
  color: string;
  createdAt?: Date;
}

const TimetableSessionSchema = new Schema<ITimetableSession>(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true }, // Lecture, Lab, Tutorial, Seminar, etc.
    location: { type: String, required: true },
    instructor: { type: String, required: true },
    semester: { type: Number, required: true },
    teacherId: { type: String, required: true },
    color: { type: String, default: "#1e3a5f" },
  },
  { timestamps: true }
);

delete (mongoose.models as any).TimetableSession;
export default mongoose.model<ITimetableSession>("TimetableSession", TimetableSessionSchema);
