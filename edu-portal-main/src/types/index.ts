export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  enrollmentNumber?: string;
  employeeId?: string;
  createdAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  tags: string[];
  done: boolean;
  dueDate: string;
  studentId: string;
}

export interface Course {
  _id: string;
  name: string;
  icon: string;
  color: string;
  teacherId: string;
}

export interface Task {
  _id: string;
  title: string;
  tags: string[];
  done: boolean;
  dueDate: string;
  teacherId: string;
}

export interface Grade {
  _id: string;
  subject: string;
  grade: string;
  score: number;
  studentId: string;
}

export interface ClassInfo {
  _id: string;
  name: string;
  icon: string;
  color: string;
  teacherId: string;
}

export interface Project {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  type: "pdf" | "video" | "link" | "document" | "notes";
  subject: string;
  subjectCode: string;
  uploaderName: string;
  url: string;
  downloads: number;
  semester: number;
  tags: string[];
  createdAt: string;
}

export interface FacultyRequest {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  department?: string;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  createdAt: string;
}

export interface AdminStats {
  totalStudents: number;
  totalFaculty: number;
  pendingRequests: number;
  totalCourses: number;
}
  enrolledCount: number;
}

export interface CollegeCourse {
  _id: string;
  name: string;
  code: string;
  semester: number;
  icon: string;
  color: string;
  facultyId: string;
  enrolledStudents: number;
}
