import mongoose, { Schema, Document } from "mongoose";

export interface IExamGrade extends Document {
  studentId:   string;
  studentName: string;
  subject:     string;
  subjectCode: string;
  examType:    "quiz" | "mid" | "final" | "assignment";
  marks:       number;
  maxMarks:    number;
  semester:    number;
  teacherId:   string;
  remarks:     string;
  createdAt?:  Date;
}

const ExamGradeSchema = new Schema<IExamGrade>(
  {
    studentId:   { type: String, required: true },
    studentName: { type: String, required: true },
    subject:     { type: String, required: true },
    subjectCode: { type: String, default: "" },
    examType:    { type: String, enum: ["quiz", "mid", "final", "assignment"], required: true },
    marks:       { type: Number, required: true },
    maxMarks:    { type: Number, required: true, default: 100 },
    semester:    { type: Number, default: 1 },
    teacherId:   { type: String, required: true },
    remarks:     { type: String, default: "" },
  },
  { timestamps: true }
);

delete (mongoose.models as any).ExamGrade;
export default mongoose.model<IExamGrade>("ExamGrade", ExamGradeSchema);
