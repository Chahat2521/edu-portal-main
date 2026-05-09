"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import Modal from "@/components/shared/Modal";

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", code: "", department: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/teacher/courses");
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");
      setCourses([data.course, ...courses]);
      setIsModalOpen(false);
      setNewCourse({ title: "", description: "", code: "", department: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Courses Management</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Manage and create new courses for your students</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Plus width={16} height={16} /> Create Course
        </Button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48, color: "var(--muted)" }}>
          <Icons.Loader width={24} height={24} className="animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 24px" }}>
          <Icons.BookOpen width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.5 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>No courses found</h3>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>You haven't created any courses yet.</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {courses.map(course => (
            <Card key={course._id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{course.title}</h3>
                <span style={{ fontSize: 12, fontWeight: 600, background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: 6, color: "var(--muted)" }}>{course.code}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, flex: 1 }}>{course.description}</p>
              {course.department && (
                <div style={{ fontSize: 12, color: "var(--muted-light)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icons.Users width={14} height={14} /> {course.department}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Course">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "var(--error-bg)", color: "var(--error-text)", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.AlertCircle width={16} height={16} /> {error}
            </div>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Course Title</label>
            <input 
              value={newCourse.title} 
              onChange={e => setNewCourse({...newCourse, title: e.target.value})} 
              placeholder="e.g. Data Structures"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
              required 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Course Code</label>
              <input 
                value={newCourse.code} 
                onChange={e => setNewCourse({...newCourse, code: e.target.value})} 
                placeholder="e.g. CS301"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
                required 
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Department</label>
              <input 
                value={newCourse.department} 
                onChange={e => setNewCourse({...newCourse, department: e.target.value})} 
                placeholder="e.g. Computer Science"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
                required 
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Description</label>
            <textarea 
              value={newCourse.description} 
              onChange={e => setNewCourse({...newCourse, description: e.target.value})} 
              placeholder="Brief course overview..."
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, minHeight: 80, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7dc443", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
              Create Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
