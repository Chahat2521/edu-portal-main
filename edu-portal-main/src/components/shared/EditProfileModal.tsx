"use client";

import Modal from "./Modal";
import { useState, useRef } from "react";
import { Icons } from "@/components/ui/Icons";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // General Profile State
  const [name, setName]         = useState(user?.name || "");
  const [bio, setBio]           = useState(user?.bio || "");
  const [avatar, setAvatar]     = useState(user?.avatar || "");   // URL after upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]                   = useState(false);

  // Status
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem("edu_user") || "{}").token || ""; }
    catch { return ""; }
  };

  /* ── Avatar file picker ──────────────────────── */
  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  /* ── Upload avatar then save profile ─────────── */
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let finalAvatarUrl = avatar;

      // Upload new image if selected
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const upRes  = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: fd,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Image upload failed");
        finalAvatarUrl = upData.url;
        setAvatar(finalAvatarUrl);
      }

      const res  = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, bio, avatar: finalAvatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      const stored = localStorage.getItem("edu_user");
      if (stored) {
        const updated = { ...JSON.parse(stored), name: data.user.name, avatar: data.user.avatar, bio: data.user.bio };
        localStorage.setItem("edu_user", JSON.stringify(updated));
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Password change ─────────────────────────── */
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setSuccess("Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => { setSuccess(""); onClose(); }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        {(["general", "security"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setError(""); setSuccess(""); }}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "none",
              background: activeTab === tab ? "#1e3a5f" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--muted)",
              cursor: "pointer", fontWeight: 700, fontSize: 13,
              display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            {tab === "general" ? <Icons.User width={14} height={14} /> : <Icons.Lock width={14} height={14} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Status messages */}
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
        <form onSubmit={handleSaveGeneral} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Avatar upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Profile Photo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Preview circle */}
              <div
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "var(--bg-secondary)", border: "2px solid var(--border)",
                  overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, position: "relative", cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to change photo"
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Icons.User width={32} height={32} color="var(--muted)" />
                }
                {/* Overlay hint */}
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity 0.2s",
                  borderRadius: "50%",
                }}
                  className="avatar-overlay"
                >
                  <Icons.Upload width={20} height={20} color="#fff" />
                </div>
              </div>

              {/* Upload button + info */}
              <div style={{ flex: 1 }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 16px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-secondary)",
                    color: "var(--text)", cursor: "pointer", fontWeight: 600,
                    fontSize: 13, fontFamily: "inherit", width: "100%",
                    marginBottom: 6,
                  }}
                >
                  <Icons.Upload width={15} height={15} />
                  {avatarFile ? "Change Photo" : "Upload Photo"}
                </button>
                {avatarFile ? (
                  <div style={{ fontSize: 12, color: "var(--success-text)", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icons.Check width={12} height={12} /> {avatarFile.name} ({(avatarFile.size / 1024).toFixed(0)} KB)
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>JPG, PNG, GIF, WebP — max 5 MB</div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarPick}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Full Name</label>
            <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", gap: 10 }}>
              <Icons.User width={16} height={16} color="var(--muted)" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", color: "var(--text)", width: "100%", fontSize: 14, fontFamily: "inherit" }}
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Bio / Status</label>
            <div style={{ display: "flex", alignItems: "flex-start", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", gap: 10 }}>
              <Icons.FileText width={16} height={16} color="var(--muted)" style={{ marginTop: 2 }} />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio..."
                style={{ border: "none", background: "transparent", outline: "none", color: "var(--text)", width: "100%", fontSize: 14, minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
              {loading && <Icons.Loader width={14} height={14} className="animate-spin" />}
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveSecurity} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(["Current Password", "New Password", "Confirm New Password"] as const).map((label, i) => {
            const val  = [currentPassword, newPassword, confirmPassword][i];
            const setVal = [setCurrentPassword, setNewPassword, setConfirmPassword][i];
            return (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", boxSizing: "border-box" as const }}
                    required
                  />
                  {i === 2 && (
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {showPw ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#f43f5e", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
              {loading && <Icons.Loader width={14} height={14} className="animate-spin" />}
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
