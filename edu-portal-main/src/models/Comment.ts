import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    projectId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Comment;
export default mongoose.model<IComment>("Comment", CommentSchema);
