"use client";

import Modal from "@/components/shared/Modal";
import { useState } from "react";
import { Icons } from "@/components/ui/Icons";

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (marks: number, feedback: string) => void;
  studentName: string;
  assignmentTitle: string;
  submissionUrl?: string;
  maxMarks: number;
}

export default function GradeSubmissionModal({ isOpen, onClose, onSubmit, studentName, assignmentTitle, submissionUrl, maxMarks }: GradeSubmissionModalProps) {
  const [marks, setMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(marks, feedback);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Grade Submission">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        <div style={{ background: "var(--bg-secondary)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text)" }}>
            <strong>Student:</strong> {studentName}
          </p>
          <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "var(--text)" }}>
            <strong>Assignment:</strong> {assignmentTitle}
          </p>
          
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Submission File:</span>
            {submissionUrl ? (
              <a href={submissionUrl} download style={{ display: "flex", alignItems: "center", gap: 6, color: "#4fa3e0", textDecoration: "none", fontWeight: 600, fontSize: 13, padding: "4px 8px", background: "rgba(79,163,224,0.1)", borderRadius: 6 }}>
                <Icons.Download width={14} height={14} /> Download File
              </a>
            ) : (
              <span style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>No file attached</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Marks Obtained (out of {maxMarks})</label>
          <input 
            type="number"
            min="0"
            max={maxMarks}
            value={marks} 
            onChange={(e) => setMarks(Number(e.target.value))} 
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", outline: "none", color: "var(--text)", fontSize: 14 }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Feedback (Optional)</label>
          <textarea 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)} 
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", outline: "none", color: "var(--text)", fontSize: 14, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
            placeholder="Great work on..."
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7dc443", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            Submit Grade
          </button>
        </div>
      </form>
    </Modal>
  );
}
