"use client";

import { useState, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import Modal from "@/components/shared/Modal";

function getAuthHeader() {
  try {
    const u = JSON.parse(localStorage.getItem("edu_user") || "{}");
    return u.token ? { Authorization: `Bearer ${u.token}` } : {};
  } catch { return {}; }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:   { label: "Pending",   bg: "var(--warning-bg)",  color: "var(--warning-text)"  },
    submitted: { label: "Submitted", bg: "var(--info-bg)",     color: "var(--info-text)"     },
    graded:    { label: "Graded",    bg: "var(--success-bg)",  color: "var(--success-text)"  },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "", description: "", courseId: "", dueDate: "", maxMarks: "100",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/teacher/assignments", {
        headers: getAuthHeader() as HeadersInit,
      });
      const data = await res.json();
      if (res.ok) setAssignments(data.assignments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/teacher/courses", {
        headers: getAuthHeader() as HeadersInit,
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
    if (!allowed.includes(file.type)) {
      setError("Only PDF or DOCX files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setSelectedFile(file);
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      let fileUrl = "";

      // Upload file first if selected
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        const upRes = await fetch("/api/upload", {
          method: "POST",
          headers: getAuthHeader() as HeadersInit,
          body: fd,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "File upload failed");
        fileUrl = upData.url;
      }

      // Create assignment
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthHeader() as Record<string, string>) },
        body: JSON.stringify({ ...newAssignment, fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create assignment");

      setAssignments([data.assignment, ...assignments]);
      setSuccess("Assignment created successfully!");
      setIsModalOpen(false);
      setNewAssignment({ title: "", description: "", courseId: "", dueDate: "", maxMarks: "100" });
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await fetch(`/api/teacher/assignments/${id}`, {
        method: "DELETE",
        headers: getAuthHeader() as HeadersInit,
      });
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const isPast = (d: string) => d && new Date(d) < new Date();

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Assignments</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <Button onClick={() => { setIsModalOpen(true); setError(""); setSuccess(""); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Plus width={16} height={16} /> Create Assignment
        </Button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="animate-slide-down" style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "var(--success-text)", display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Check width={16} height={16} /> {success}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48, color: "var(--muted)" }}>
          <Icons.Loader width={24} height={24} className="animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icons.Assignments width={36} height={36} style={{ color: "var(--muted)", opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>No assignments yet</h3>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8, marginBottom: 20 }}>
            Create your first assignment with an optional PDF or DOCX attachment.
          </p>
          <Button onClick={() => setIsModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icons.Plus width={16} height={16} /> Create Assignment
          </Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {assignments.map((assignment) => (
            <Card key={assignment._id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", flex: 1 }}>{assignment.title}</h3>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <StatusBadge status={assignment.status} />
                  <button
                    onClick={() => handleDelete(assignment._id)}
                    title="Delete"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 6, display: "flex" }}
                  >
                    <Icons.Trash width={15} height={15} />
                  </button>
                </div>
              </div>

              {assignment.description && (
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                  {assignment.description.length > 100 ? `${assignment.description.slice(0, 100)}…` : assignment.description}
                </p>
              )}

              {/* Attached file */}
              {assignment.fileUrl && (
                <a
                  href={assignment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                    color: "var(--info-text)", background: "var(--info-bg)", border: "1px solid var(--info-border)",
                    borderRadius: 8, padding: "6px 10px", textDecoration: "none", width: "fit-content",
                  }}
                >
                  <Icons.Paperclip width={13} height={13} />
                  {assignment.fileUrl.split("/").pop()}
                </a>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: isPast(assignment.dueDate) ? "var(--error-text)" : "var(--muted-light)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Icons.Calendar width={13} height={13} /> Due: {formatDate(assignment.dueDate)}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-light)", fontWeight: 600 }}>
                  {assignment.maxMarks} pts
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedFile(null); setError(""); }} title="Create New Assignment">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "var(--error-bg)", color: "var(--error-text)", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.AlertCircle width={16} height={16} /> {error}
            </div>
          )}

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Assignment Title *</label>
            <input
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              placeholder="e.g. Lab Report 1"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
              required
            />
          </div>

          {/* Course */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Course</label>
            <select
              value={newAssignment.courseId}
              onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
            >
              <option value="">— Select a Course (optional) —</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title} ({course.code})</option>
              ))}
            </select>
          </div>

          {/* Due Date + Max Marks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Due Date</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Max Marks</label>
              <input
                type="number"
                min="1"
                value={newAssignment.maxMarks}
                onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: e.target.value })}
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Description & Instructions</label>
            <textarea
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              placeholder="Detailed instructions for students..."
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* File Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              Attachment <span style={{ color: "var(--muted)", fontWeight: 400 }}>(PDF or DOCX, max 10 MB)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${selectedFile ? "var(--input-focus)" : "var(--border)"}`,
                borderRadius: 10,
                padding: "20px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: selectedFile ? "var(--info-bg)" : "var(--bg-secondary)",
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              {selectedFile ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Icons.FileText width={20} height={20} style={{ color: "var(--info-text)" }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    style={{ background: "var(--error-bg)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--error-text)", marginLeft: 8 }}
                  >
                    <Icons.X width={12} height={12} />
                  </button>
                </div>
              ) : (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  <Icons.Upload width={24} height={24} style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }} />
                  <span style={{ fontWeight: 600 }}>Click to attach a file</span> or drag & drop
                  <div style={{ fontSize: 11, marginTop: 4 }}>PDF, DOC, DOCX up to 10 MB</div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setSelectedFile(null); setError(""); }}
              style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: "9px 20px", borderRadius: 8, border: "none",
                background: uploading ? "var(--border)" : "#1e3a5f",
                color: uploading ? "var(--muted)" : "#fff",
                cursor: uploading ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {uploading ? <><Icons.Loader width={14} height={14} className="animate-spin" /> Uploading...</> : <><Icons.Plus width={14} height={14} /> Create Assignment</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
