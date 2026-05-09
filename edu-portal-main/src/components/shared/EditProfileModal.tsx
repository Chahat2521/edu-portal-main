"use client";

import Modal from "./Modal";
import { useState } from "react";
import { Icons } from "@/components/ui/Icons";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  
  // General Profile State
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const stored = localStorage.getItem("edu_user");
      const token = stored ? JSON.parse(stored).token : "";

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, bio, avatar })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      if (user && stored) {
        const updated = { ...JSON.parse(stored), name: data.user.name, avatar: data.user.avatar, bio: data.user.bio };
        localStorage.setItem("edu_user", JSON.stringify(updated));
      }
      
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        window.location.reload(); 
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const stored = localStorage.getItem("edu_user");
      const token = stored ? JSON.parse(stored).token : "";

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div style={{ display: "flex", gap: 12, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        <button 
          onClick={() => { setActiveTab("general"); setError(""); setSuccess(""); }}
          style={{ padding: "6px 12px", background: activeTab === "general" ? "var(--bg-secondary)" : "transparent", color: activeTab === "general" ? "var(--text)" : "var(--muted)", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icons.User width={14} height={14} /> General
        </button>
        <button 
          onClick={() => { setActiveTab("security"); setError(""); setSuccess(""); }}
          style={{ padding: "6px 12px", background: activeTab === "security" ? "var(--bg-secondary)" : "transparent", color: activeTab === "security" ? "var(--text)" : "var(--muted)", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icons.Lock width={14} height={14} /> Security
        </button>
      </div>

      {error && (
        <div style={{ background: "var(--error-bg)", color: "var(--error-text)", padding: "10px 12px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Icons.AlertCircle width={16} height={16} /> {error}
        </div>
      )}
      {success && (
        <div style={{ background: "var(--success-bg)", color: "var(--success-text)", padding: "10px 12px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Icons.Check width={16} height={16} /> {success}
        </div>
      )}

      {activeTab === "general" ? (
        <form onSubmit={handleSaveGeneral} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {avatar ? <img src={avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icons.User width={24} height={24} color="var(--muted)" />}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Avatar URL</label>
              <input 
                value={avatar} 
                onChange={(e) => setAvatar(e.target.value)} 
                placeholder="https://..."
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", outline: "none", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Full Name</label>
            <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", gap: 10 }}>
              <Icons.User width={16} height={16} color="var(--muted)" />
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ border: "none", background: "transparent", outline: "none", color: "var(--text)", width: "100%", fontSize: 14 }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Bio / Status</label>
            <div style={{ display: "flex", alignItems: "flex-start", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", gap: 10 }}>
              <Icons.FileText width={16} height={16} color="var(--muted)" style={{ marginTop: 2 }} />
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Write a short bio..."
                style={{ border: "none", background: "transparent", outline: "none", color: "var(--text)", width: "100%", fontSize: 14, minHeight: 60, resize: "vertical" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7dc443", color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {loading && <Icons.Loader width={14} height={14} className="animate-spin" />} Save Profile
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveSecurity} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Current Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showPw ? "text" : "password"}
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, width: "100%" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>New Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showPw ? "text" : "password"}
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, width: "100%" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Confirm New Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showPw ? "text" : "password"}
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, width: "100%" }}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#f43f5e", color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {loading && <Icons.Loader width={14} height={14} className="animate-spin" />} Update Password
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
