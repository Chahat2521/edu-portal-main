"use client";

import Modal from "@/components/shared/Modal";
import { useState } from "react";
import { Icons } from "@/components/ui/Icons";

interface SubmitAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  assignmentTitle: string;
}

export default function SubmitAssignmentModal({ isOpen, onClose, onSubmit, assignmentTitle }: SubmitAssignmentModalProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
      setFile(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Assignment">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Uploading submission for: <strong style={{ color: "var(--text)" }}>{assignmentTitle}</strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Your Work (PDF, ZIP, DOCX)</label>
          <div style={{ border: "2px dashed var(--border)", borderRadius: 8, padding: 30, textAlign: "center", cursor: "pointer", position: "relative", background: "var(--bg-secondary)" }}>
            <input 
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
            />
            {file ? (
              <div style={{ color: "#4fa3e0", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icons.File width={24} height={24} />
                {file.name}
              </div>
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 14 }}>
                <Icons.Upload width={32} height={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Select a file</div>
                <div>Click or drag file here to upload</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
            Cancel
          </button>
          <button type="submit" disabled={!file} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: file ? "#4fa3e0" : "var(--border)", color: "#fff", cursor: file ? "pointer" : "not-allowed", fontWeight: 600 }}>
            Submit Work
          </button>
        </div>
      </form>
    </Modal>
  );
}
