"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import Modal from "@/components/shared/Modal";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", courseId: "", dueDate: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/teacher/assignments");
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
      const res = await fetch("/api/teacher/courses");
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssignment),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create assignment");
      setAssignments([data.assignment, ...assignments]);
      setIsModalOpen(false);
      setNewAssignment({ title: "", description: "", courseId: "", dueDate: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Assignments Management</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Create and manage assignments for your students</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Plus width={16} height={16} /> Create Assignment
        </Button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48, color: "var(--muted)" }}>
          <Icons.Loader width={24} height={24} className="animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 24px" }}>
          <Icons.Assignments width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.5 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>No assignments found</h3>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>You haven't created any assignments yet.</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {assignments.map(assignment => (
            <Card key={assignment._id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{assignment.title}</h3>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, flex: 1 }}>{assignment.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--muted-light)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icons.Calendar width={14} height={14} /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Assignment">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "var(--error-bg)", color: "var(--error-text)", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.AlertCircle width={16} height={16} /> {error}
            </div>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Assignment Title</label>
            <input 
              value={newAssignment.title} 
              onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} 
              placeholder="e.g. Lab Report 1"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
              required 
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Select Course</label>
            <select
              value={newAssignment.courseId}
              onChange={e => setNewAssignment({...newAssignment, courseId: e.target.value})}
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
              required
            >
              <option value="">-- Select a Course --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title} ({course.code})</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Due Date</label>
            <input 
              type="date"
              value={newAssignment.dueDate} 
              onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} 
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
              required 
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Description & Instructions</label>
            <textarea 
              value={newAssignment.description} 
              onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} 
              placeholder="Detailed instructions..."
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, minHeight: 80, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7dc443", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
              Create Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
