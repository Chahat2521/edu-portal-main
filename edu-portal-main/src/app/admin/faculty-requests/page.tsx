"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/Toast";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import SearchBar from "@/components/shared/SearchBar";
import { FacultyRequest } from "@/types";

export default function FacultyRequestsPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<FacultyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<FacultyRequest | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const res = await fetch("/api/admin/faculty-requests", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setRequests(data.requests);
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      setProcessing(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const res = await fetch("/api/admin/faculty-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ id, action: "approve" }),
      });

      if (!res.ok) throw new Error("Failed to approve");

      showToast("Faculty approved successfully!", "success");
      fetchRequests();
      setConfirmAction(null);
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to approve", "error");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(id: string) {
    try {
      setProcessing(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const res = await fetch("/api/admin/faculty-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ id, action: "reject", note: rejectNote }),
      });

      if (!res.ok) throw new Error("Failed to reject");

      showToast("Faculty rejected", "success");
      fetchRequests();
      setConfirmAction(null);
      setRejectNote("");
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to reject", "error");
    } finally {
      setProcessing(false);
    }
  }

  const filtered = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status: string) => {
    const styles: Record<string, any> = {
      pending: { background: "#fef3c7", color: "#92400e" },
      approved: { background: "#d1fae5", color: "#065f46" },
      rejected: { background: "#fee2e2", color: "#991b1b" },
    };
    return styles[status] || {};
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>Faculty Requests 👨‍🏫</h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px" }}>
        Approve or reject pending faculty signups
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            background: "white",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 40,
            textAlign: "center",
            border: "1px solid #f0f0f0",
          }}
        >
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>No faculty requests found</p>
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#f9f9f9" }}>
                <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>Employee ID</th>
                <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>Applied</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "16px" }}>{req.name}</td>
                  <td style={{ padding: "16px" }}>{req.email}</td>
                  <td style={{ padding: "16px" }}>{req.employeeId}</td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        ...getStatusBadgeStyle(req.status),
                      }}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: 12, color: "#666" }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    {req.status === "pending" && (
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <button
                          onClick={() => handleApprove(req._id)}
                          disabled={processing}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "none",
                            background: "#7dc443",
                            color: "white",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setConfirmAction({ type: "reject", id: req._id });
                          }}
                          disabled={processing}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "none",
                            background: "#ef4444",
                            color: "white",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {selectedRequest && confirmAction?.type === "reject" && (
        <Modal
          isOpen={true}
          onClose={() => {
            setConfirmAction(null);
            setSelectedRequest(null);
            setRejectNote("");
          }}
          title="Reject Faculty Request"
          size="md"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
              Are you sure you want to reject{" "}
              <strong>{selectedRequest.name}&apos;s</strong> faculty request?
            </p>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>
                Rejection Note (optional)
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Provide a reason for rejection..."
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e5e5",
                  fontSize: 14,
                  fontFamily: "inherit",
                  marginTop: 8,
                  resize: "vertical",
                  minHeight: 80,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setConfirmAction(null);
                  setSelectedRequest(null);
                  setRejectNote("");
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(confirmAction.id)}
                disabled={processing}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: processing ? 0.6 : 1,
                }}
              >
                {processing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
