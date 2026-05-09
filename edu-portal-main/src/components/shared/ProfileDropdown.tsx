"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { useRouter } from "next/navigation";
import EditProfileModal from "./EditProfileModal";

export default function ProfileDropdown({ user, roleLabel }: { user: any, roleLabel: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("edu_user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative" }}>
      <div 
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
      >
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{user.name}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{roleLabel}</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #4fa3e0, #7dc443)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 800, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          {user.name ? user.name[0].toUpperCase() : "U"}
        </div>
      </div>

      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 10,
          width: 200,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "var(--shadow-md)",
          zIndex: 300,
          overflow: "hidden"
        }}>
          <button 
            onClick={() => { setOpen(false); setShowEdit(true); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
          >
            <Icons.User width={16} height={16} /> Edit Profile
          </button>
          <button 
            onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
          >
            <Icons.Logout width={16} height={16} /> Logout
          </button>
        </div>
      )}

      <EditProfileModal 
        isOpen={showEdit} 
        onClose={() => setShowEdit(false)} 
        user={user} 
      />
    </div>
  );
}
