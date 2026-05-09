"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/Toast";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import SearchBar from "@/components/shared/SearchBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import FilterDropdown from "@/components/shared/FilterDropdown";
import { Icons } from "@/components/ui/Icons";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      showToast("User deleted successfully", "success");
      fetchUsers();
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to delete user", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "#7dc443",
      student: "#4fa3e0",
      teacher: "#f59e0b",
    };
    return colors[role] || "#999";
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}><Icons.Users width={24} height={24} /> All Users</h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px" }}>Manage system users</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <FilterDropdown
          label="Role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "All Roles" },
            { value: "student", label: "Students" },
            { value: "teacher", label: "Teachers" },
            { value: "admin", label: "Admin" },
          ]}
        />
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
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
          <p style={{ fontSize: 14, color: "#666" }}>No users found</p>
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
                <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>Role</th>
                <th style={{ padding: "16px", textAlign: "left", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "16px" }}>{user.name}</td>
                  <td style={{ padding: "16px" }}>{user.email}</td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        background: getRoleColor(user.role) + "20",
                        color: getRoleColor(user.role),
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: 12, color: "#999" }}>
                    {user.enrollmentNumber || user.employeeId || "-"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button
                      onClick={() => setDeleteConfirm(user._id)}
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
                      <Icons.Trash width={14} height={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
          title="Delete User"
          message="Are you sure? This action cannot be undone."
          loading={deleting}
        />
      )}
    </div>
  );
}
