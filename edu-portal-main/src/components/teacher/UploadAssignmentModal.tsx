"use client";

import Modal from "@/components/shared/Modal";
import { useState } from "react";
import { Icons } from "@/components/ui/Icons";

interface UploadAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function UploadAssignmentModal({ isOpen, onClose, onSubmit }: UploadAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, dueDate, file });
    setTitle("");
    setDescription("");
    setDueDate("");
    setFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Assignment">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Title</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", outline: "none", color: "var(--text)", fontSize: 14 }}
            required
            placeholder="E.g. Homework 1"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", outline: "none", color: "var(--text)", fontSize: 14, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
            placeholder="Instructions for the assignment..."
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Due Date</label>
          <input 
            type="date"
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Assignment File (Optional)</label>
          <div style={{ border: "2px dashed var(--border)", borderRadius: 8, padding: 20, textAlign: "center", cursor: "pointer", position: "relative" }}>
            <input 
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
            />
            {file ? (
              <div style={{ color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icons.FileText width={20} height={20} />
                {file.name}
              </div>
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 14 }}>
                <Icons.Upload width={24} height={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>Click or drag file to upload</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
