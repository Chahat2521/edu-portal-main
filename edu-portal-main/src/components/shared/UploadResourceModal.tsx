"use client";

import Modal from "./Modal";
import { useState } from "react";
import { Icons } from "@/components/ui/Icons";

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function UploadResourceModal({ isOpen, onClose, onSubmit }: UploadResourceModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("pdf");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit({ title, type, file });
      setTitle("");
      setType("pdf");
      setFile(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Resource">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Resource Title</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", outline: "none", color: "var(--text)", fontSize: 14 }}
            required
            placeholder="E.g. Chapter 1 Notes"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Resource Type</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", outline: "none", color: "var(--text)", fontSize: 14 }}
          >
            <option value="pdf">PDF Document</option>
            <option value="video">Video</option>
            <option value="document">Word Document</option>
            <option value="link">External Link</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>File</label>
          <div style={{ border: "2px dashed var(--border)", borderRadius: 8, padding: 24, textAlign: "center", cursor: "pointer", position: "relative", background: "var(--bg-secondary)" }}>
            <input 
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
            />
            {file ? (
              <div style={{ color: "#f59e0b", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icons.File width={20} height={20} />
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
          <button type="submit" disabled={!file} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: file ? "#f59e0b" : "var(--border)", color: "#fff", cursor: file ? "pointer" : "not-allowed", fontWeight: 600 }}>
            Upload
          </button>
        </div>
      </form>
    </Modal>
  );
}
