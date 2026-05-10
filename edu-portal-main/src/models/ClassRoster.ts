import mongoose, { Schema, Document } from "mongoose";

export interface IRosterStudent {
  studentId:   string;
  studentName: string;
  rollNo:      string;
}

export interface IClassRoster extends Document {
  teacherId:   string;
  className:   string;
  subject:     string;
  students:    IRosterStudent[];
  createdAt?:  Date;
}

const RosterStudentSchema = new Schema<IRosterStudent>({
  studentId:   { type: String, required: true },
  studentName: { type: String, required: true },
  rollNo:      { type: String, default: "" },
}, { _id: false });

const ClassRosterSchema = new Schema<IClassRoster>(
  {
    teacherId: { type: String, required: true },
    className: { type: String, required: true },
    subject:   { type: String, required: true },
    students:  { type: [RosterStudentSchema], default: [] },
  },
  { timestamps: true }
);

delete (mongoose.models as any).ClassRoster;
export default mongoose.model<IClassRoster>("ClassRoster", ClassRosterSchema);
