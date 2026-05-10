"use client";

import { useState, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icons";
import Modal from "@/components/shared/Modal";

function getAuthHeader() {
  try {
    const u = JSON.parse(localStorage.getItem("edu_user") || "{}");
    return u.token ? { Authorization: `Bearer ${u.token}` } : {};
  } catch { return {}; }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    pending:   { label: "Pending",   bg: "var(--warning-bg)",  color: "var(--warning-text)",  icon: <Icons.Clock width={11} height={11} /> },
    submitted: { label: "Submitted", bg: "var(--info-bg)",     color: "var(--info-text)",     icon: <Icons.Check width={11} height={11} /> },
    graded:    { label: "Graded",    bg: "var(--success-bg)",  color: "var(--success-text)",  icon: <Icons.Award width={11} height={11} /> },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
      {s.icon} {s.label}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
  return (
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[priority] ?? colors.medium, display: "inline-block" }} />
  );
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");
  const [submitModal, setSubmitModal] = useState<{ open: boolean; assignment: any | null }>({ open: false, assignment: null });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/assignments", {
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

  const openSubmitModal = (assignment: any) => {
    setSubmitModal({ open: true, assignment });
    setSelectedFile(null);
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowed.includes(file.type)) {
      setSubmitError("Only PDF or DOCX files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSubmitError("File must be under 10 MB.");
      return;
    }
    setSelectedFile(file);
    setSubmitError("");
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile) { setSubmitError("Please select a file to submit."); return; }
    setUploading(true);
    setSubmitError("");

    try {
      // 1. Upload file
      const fd = new FormData();
      fd.append("file", selectedFile);
      const upRes = await fetch("/api/upload", {
        method: "POST",
        headers: getAuthHeader() as HeadersInit,
        body: fd,
      });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || "File upload failed");

      // 2. Submit assignment
      const subRes = await fetch(`/api/student/assignments/${submitModal.assignment._id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthHeader() as Record<string, string>),
        },
        body: JSON.stringify({ submissionUrl: upData.url }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData.error || "Submission failed");

      // Update local state
      setAssignments((prev) =>
        prev.map((a) => a._id === submitModal.assignment._id ? { ...a, status: "submitted", submissionUrl: upData.url } : a)
      );
      setSubmitSuccess("Assignment submitted successfully!");
      setTimeout(() => {
        setSubmitModal({ open: false, assignment: null });
        setSubmitSuccess("");
      }, 1800);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const isOverdue = (d: string, status: string) => d && status === "pending" && new Date(d) < new Date();
  const daysLeft = (d: string) => {
    if (!d) return null;
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filtered = filter === "all" ? assignments : assignments.filter((a) => a.status === filter);

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => a.status === "pending").length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
    graded: assignments.filter((a) => a.status === "graded").length,
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Assignments</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>
          View and submit your assignments
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {[
          { label: "Total",     value: stats.total,     bg: "var(--card)",        color: "var(--text)",          icon: <Icons.Assignments width={18} height={18} /> },
          { label: "Pending",   value: stats.pending,   bg: "var(--warning-bg)",  color: "var(--warning-text)",  icon: <Icons.Clock width={18} height={18} />       },
          { label: "Submitted", value: stats.submitted, bg: "var(--info-bg)",     color: "var(--info-text)",     icon: <Icons.Check width={18} height={18} />       },
          { label: "Graded",    value: stats.graded,    bg: "var(--success-bg)",  color: "var(--success-text)",  icon: <Icons.Award width={18} height={18} />       },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["all", "pending", "submitted", "graded"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 16px", borderRadius: 99, border: "1px solid var(--border)",
              background: filter === f ? "#1e3a5f" : "var(--card)",
              color: filter === f ? "#fff" : "var(--muted)",
              fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && <span style={{ marginLeft: 6, opacity: 0.7 }}>({stats[f]})</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48, color: "var(--muted)" }}>
          <Icons.Loader width={24} height={24} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icons.Assignments width={36} height={36} style={{ color: "var(--muted)", opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>No assignments found</h3>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>
            {filter === "all" ? "Your teacher hasn't posted any assignments yet." : `No ${filter} assignments.`}
          </p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((assignment) => {
            const overdue = isOverdue(assignment.dueDate, assignment.status);
            const dl = daysLeft(assignment.dueDate);

            return (
              <Card key={assignment._id} style={{ display: "flex", flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}>
                {/* Top accent */}
                <div style={{ height: 3, background: overdue ? "#ef4444" : assignment.status === "graded" ? "#22c55e" : assignment.status === "submitted" ? "#4fa3e0" : "#f59e0b" }} />

                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Row 1 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <PriorityDot priority={assignment.priority} />
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {assignment.title}
                        </h3>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Icons.Courses width={12} height={12} /> {assignment.subject || "General"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Icons.Award width={12} height={12} /> {assignment.maxMarks} pts
                        </span>
                        {assignment.obtainedMarks !== undefined && assignment.status === "graded" && (
                          <span style={{ fontWeight: 700, color: "var(--success-text)" }}>
                            Score: {assignment.obtainedMarks}/{assignment.maxMarks}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={assignment.status} />
                  </div>

                  {/* Description */}
                  {assignment.description && (
                    <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
                      {assignment.description.length > 160 ? `${assignment.description.slice(0, 160)}…` : assignment.description}
                    </p>
                  )}

                  {/* Teacher file */}
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
                      <Icons.Download width={13} height={13} />
                      Download Assignment File
                    </a>
                  )}

                  {/* Submitted file */}
                  {assignment.submissionUrl && (
                    <div style={{ fontSize: 12, color: "var(--success-text)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Icons.Paperclip width={13} height={13} />
                      Submitted: <a href={assignment.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--success-text)", fontWeight: 700, textDecoration: "underline" }}>{assignment.submissionUrl.split("/").pop()}</a>
                    </div>
                  )}

                  {/* Footer row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 12, color: overdue ? "var(--error-text)" : "var(--muted-light)", display: "flex", alignItems: "center", gap: 5, fontWeight: overdue ? 700 : 400 }}>
                      <Icons.Calendar width={13} height={13} />
                      {assignment.dueDate ? (
                        overdue
                          ? `Overdue · was due ${formatDate(assignment.dueDate)}`
                          : dl !== null && dl <= 3 && assignment.status === "pending"
                          ? <span style={{ color: "#f59e0b", fontWeight: 700 }}>Due in {dl} day{dl !== 1 ? "s" : ""}</span>
                          : `Due ${formatDate(assignment.dueDate)}`
                      ) : "No due date"}
                    </div>

                    {assignment.status === "pending" && (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        style={{
                          padding: "7px 16px", borderRadius: 8, border: "none",
                          background: "#1e3a5f", color: "#fff",
                          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                          display: "flex", alignItems: "center", gap: 6,
                          boxShadow: "0 2px 8px rgba(30,58,95,0.2)",
                        }}
                      >
                        <Icons.Upload width={13} height={13} /> Submit
                      </button>
                    )}
                    {assignment.status === "submitted" && (
                      <span style={{ fontSize: 12, color: "var(--info-text)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <Icons.Check width={13} height={13} /> Awaiting grading
                      </span>
                    )}
                    {assignment.status === "graded" && (
                      <span style={{ fontSize: 12, color: "var(--success-text)", fontWeight: 700 }}>
                        ✓ Graded
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      <Modal isOpen={submitModal.open} onClose={() => setSubmitModal({ open: false, assignment: null })} title="Submit Assignment">
        {submitModal.assignment && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "var(--text)" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{submitModal.assignment.title}</div>
              {submitModal.assignment.dueDate && (
                <div style={{ color: "var(--muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                  <Icons.Calendar width={12} height={12} /> Due {formatDate(submitModal.assignment.dueDate)}
                </div>
              )}
            </div>

            {submitError && (
              <div style={{ background: "var(--error-bg)", color: "var(--error-text)", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                <Icons.AlertCircle width={16} height={16} /> {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="animate-fade-in" style={{ background: "var(--success-bg)", color: "var(--success-text)", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                <Icons.Check width={16} height={16} /> {submitSuccess}
              </div>
            )}

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 8 }}>
                Upload your work <span style={{ color: "var(--muted)", fontWeight: 400 }}>(PDF or DOCX, max 10 MB)</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${selectedFile ? "var(--input-focus)" : "var(--border)"}`,
                  borderRadius: 10,
                  padding: "24px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: selectedFile ? "var(--info-bg)" : "var(--bg-secondary)",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                {selectedFile ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <Icons.FileText width={22} height={22} style={{ color: "var(--info-text)" }} />
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
                    <Icons.Upload width={26} height={26} style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }} />
                    <span style={{ fontWeight: 600 }}>Click to select a file</span>
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setSubmitModal({ open: false, assignment: null })}
                style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAssignment}
                disabled={uploading || !selectedFile}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "none",
                  background: uploading || !selectedFile ? "var(--border)" : "#1e3a5f",
                  color: uploading || !selectedFile ? "var(--muted)" : "#fff",
                  cursor: uploading || !selectedFile ? "not-allowed" : "pointer",
                  fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
                  boxShadow: uploading || !selectedFile ? "none" : "0 2px 8px rgba(30,58,95,0.25)",
                }}
              >
                {uploading
                  ? <><Icons.Loader width={14} height={14} className="animate-spin" /> Submitting...</>
                  : <><Icons.Upload width={14} height={14} /> Submit Assignment</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
