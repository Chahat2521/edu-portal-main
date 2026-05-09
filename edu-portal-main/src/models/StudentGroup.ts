import mongoose, { Schema, Document } from "mongoose";

export interface IStudentGroup extends Document {
  name: string;
  description: string;
  subject: string;
  subjectCode: string;
  creatorId: string;
  creatorName: string;
  members: string[];          // array of user IDs
  memberNames: string[];      // denormalized for display
  isOpen: boolean;            // open for anyone to join
  maxMembers: number;
  tags: string[];
  meetingSchedule?: string;   // e.g. "Every Saturday 10AM"
  createdAt?: Date;
  updatedAt?: Date;
}

const StudentGroupSchema = new Schema<IStudentGroup>(
  {
    name:            { type: String, required: true, trim: true },
    description:     { type: String, default: "" },
    subject:         { type: String, required: true },
    subjectCode:     { type: String, required: true },
    creatorId:       { type: String, required: true },
    creatorName:     { type: String, required: true },
    members:         { type: [String], default: [] },
    memberNames:     { type: [String], default: [] },
    isOpen:          { type: Boolean, default: true },
    maxMembers:      { type: Number, default: 10 },
    tags:            { type: [String], default: [] },
    meetingSchedule: { type: String, default: "" },
  },
  { timestamps: true }
);

delete (mongoose.models as any).StudentGroup;

export default mongoose.model<IStudentGroup>("StudentGroup", StudentGroupSchema);
