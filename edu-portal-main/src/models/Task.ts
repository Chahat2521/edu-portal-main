import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  tags: string[];
  done: boolean;
  dueDate: string;
  teacherId: string;
  createdAt?: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    tags: [{ type: String }],
    done: { type: Boolean, default: false },
    dueDate: { type: String },
    teacherId: { type: String, required: true },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Task;
export default mongoose.model<ITask>("Task", TaskSchema);
