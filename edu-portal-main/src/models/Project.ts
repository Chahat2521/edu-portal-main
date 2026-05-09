import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  tags: string[];
  subject: string;
  likes: string[];
  commentCount: number;
  status: "planning" | "in-progress" | "completed";
  collaborators: string[];
  lookingForCollaborators: boolean;
  createdAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    tags: [{ type: String }],
    subject: { type: String },
    likes: [{ type: String }],
    commentCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["planning", "in-progress", "completed"],
      default: "planning",
    },
    collaborators: [{ type: String }],
    lookingForCollaborators: { type: Boolean, default: false },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Project;
export default mongoose.model<IProject>("Project", ProjectSchema);
