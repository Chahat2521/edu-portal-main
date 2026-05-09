import mongoose, { Schema, Document } from "mongoose";

export interface IResource extends Document {
  title: string;
  description: string;
  type: "pdf" | "video" | "link" | "document" | "notes";
  subject: string;
  subjectCode: string;
  uploadedBy: string;
  uploaderName: string;
  url: string;
  downloads: number;
  semester: number;
  tags: string[];
  createdAt?: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ["pdf", "video", "link", "document", "notes"], required: true },
    subject: { type: String, required: true },
    subjectCode: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    uploaderName: { type: String, required: true },
    url: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    semester: { type: Number },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

delete (mongoose.models as any).Resource;
export default mongoose.model<IResource>("Resource", ResourceSchema);
