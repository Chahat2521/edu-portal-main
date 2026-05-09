"use client";
import { useState, useEffect, useCallback } from "react";
import { Icons } from "@/components/ui/Icons";

interface Group {
  _id: string;
  name: string;
  description: string;
  subject: string;
  subjectCode: string;
  creatorId: string;
  creatorName: string;
  members: string[];
  memberNames: string[];
  isOpen: boolean;
  maxMembers: number;
  tags: string[];
  meetingSchedule: string;
  createdAt: string;
}

function GroupCard({
  group,
  userId,
  onJoin,
  onLeave,
}: {
  group: Group;
  userId: string;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
}) {
  const isMember   = group.members.includes(userId);
  const isCreator  = group.creatorId === userId;
  const isFull     = group.members.length >= group.maxMembers;
  const fillPct    = Math.round((group.members.length / group.maxMembers) * 100);

  return (
    <div
      className="animate-fade-in"
      style={{
        background: "var(--card)",
        border: isMember ? "2px solid #7dc443" : "1px solid var(--border)",
        borderRadius: 16,
        padding: 22,
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
      }}
    >
      {isMember && (
        <span style={{ position: "absolute", top: 14, right: 14, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
          ✓ Joined
        </span>
      )}

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, paddingRight: isMember ? 70 : 0 }}>
          <Icons.Users width={24} height={24} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>{group.name}</h3>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: "#eff6ff", color: "#1e40af", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99 }}>{group.subjectCode}</span>
          <span style={{ background: group.isOpen && !isFull ? "#f0fdf4" : "#fef2f2", color: group.isOpen && !isFull ? "#166534" : "#dc2626", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99 }}>
            {isFull ? "Full" : group.isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>{group.description}</p>
      )}

      {/* Tags */}
      {group.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {group.tags.map((t) => (
            <span key={t} style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, border: "1px solid var(--border)" }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Meeting schedule */}
      {group.meetingSchedule && (
        <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center" }}>
          <Icons.Calendar width={14} height={14} /> {group.meetingSchedule}
        </div>
      )}

      {/* Members bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{group.members.length} / {group.maxMembers} members</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: fillPct >= 80 ? "#ef4444" : "var(--muted)" }}>{fillPct}% full</span>
        </div>
        <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${fillPct}%`, background: fillPct >= 80 ? "#ef4444" : "#1e3a5f", borderRadius: 99, transition: "width 0.5s ease" }} />
        </div>
        {/* Member avatars */}
        <div style={{ display: "flex", marginTop: 8, gap: 0 }}>
          {group.memberNames.slice(0, 5).map((name, i) => (
            <div key={i} title={name} style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${(i * 60) + 200}, 60%, 50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 800, border: "2px solid var(--card)", marginLeft: i === 0 ? 0 : -8 }}>
              {name[0].toUpperCase()}
            </div>
          ))}
          {group.members.length > 5 && (
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--muted)", fontWeight: 700, border: "2px solid var(--card)", marginLeft: -8 }}>
              +{group.members.length - 5}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)" }}>Created by {group.creatorName}</div>

      {/* Action button */}
      {!isCreator && (
        isMember ? (
          <button
            onClick={() => onLeave(group._id)}
            style={{ padding: "9px 0", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Leave Group
          </button>
        ) : (
          <button
            onClick={() => onJoin(group._id)}
            disabled={isFull || !group.isOpen}
            style={{
              padding: "9px 0", borderRadius: 10, border: "none",
              background: isFull || !group.isOpen ? "var(--border)" : "#1e3a5f",
              color: isFull || !group.isOpen ? "var(--muted)" : "#fff",
              fontSize: 13, fontWeight: 700, cursor: isFull || !group.isOpen ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {isFull ? "Group Full" : !group.isOpen ? "Closed" : "Join Group →"}
          </button>
        )
      )}
      {isCreator && (
        <span style={{ fontSize: 12, color: "#7dc443", fontWeight: 700, textAlign: "center" }}>You created this group</span>
      )}
    </div>
  );
}

/* ── Create Group Modal ──────────────────────────────────────── */
function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", description: "", subject: "", subjectCode: "", isOpen: true, maxMembers: 10, tags: "", meetingSchedule: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim())        { setError("Group name is required"); return; }
    if (!form.subject.trim())     { setError("Subject is required"); return; }
    if (!form.subjectCode.trim()) { setError("Subject code is required"); return; }

    const stored = localStorage.getItem("edu_user");
    if (!stored) return;
    const user = JSON.parse(stored);

    setLoading(true);
    try {
      const res = await fetch("/api/student/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create group"); return; }
      onCreated();
      onClose();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
    border: "1.5px solid var(--input-border)", outline: "none",
    fontFamily: "inherit", color: "var(--text)", background: "var(--input-bg)",
    boxSizing: "border-box" as const,
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" as const };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div className="animate-fade-in" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, width: 540, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0 }}>Create Study Group</h2>
          <button onClick={onClose} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: "pointer", color: "var(--muted)" }}>✕</button>
        </div>
        <div style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
          {error && <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--error-text)", display: "flex", alignItems: "center", gap: 6 }}><Icons.AlertCircle width={16} height={16} /> {error}</div>}

          <div><label style={labelStyle}>Group Name *</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. CS301 Binary Trees Study" style={inputStyle} /></div>
          <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="What will your group focus on?" rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Subject *</label><input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Data Structures" style={inputStyle} /></div>
            <div><label style={labelStyle}>Subject Code *</label><input value={form.subjectCode} onChange={(e) => setForm((p) => ({ ...p, subjectCode: e.target.value }))} placeholder="CS301" style={inputStyle} /></div>
          </div>

          <div><label style={labelStyle}>Tags (comma separated)</label><input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Trees, Java, DSA" style={inputStyle} /></div>
          <div><label style={labelStyle}>Meeting Schedule</label><input value={form.meetingSchedule} onChange={(e) => setForm((p) => ({ ...p, meetingSchedule: e.target.value }))} placeholder="Every Saturday 10AM (Library Room 3)" style={inputStyle} /></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Max Members</label>
              <input type="number" value={form.maxMembers} min={2} max={50} onChange={(e) => setForm((p) => ({ ...p, maxMembers: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Visibility</label>
              <select value={form.isOpen ? "open" : "closed"} onChange={(e) => setForm((p) => ({ ...p, isOpen: e.target.value === "open" }))} style={inputStyle}>
                <option value="open">Open (anyone can join)</option>
                <option value="closed">Closed (invite only)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ padding: "12px 0", borderRadius: 12, border: "none", background: "#1e3a5f", color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? "Creating..." : <><Icons.Sparkles width={16} height={16} /> Create Group</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function StudentGroupsPage() {
  const [groups, setGroups]       = useState<Group[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter]       = useState<"all" | "mine" | "open">("all");
  const [search, setSearch]       = useState("");
  const [userId, setUserId]       = useState("");
  const [toast, setToast]         = useState("");

  const showMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchGroups = useCallback(async () => {
    const stored = localStorage.getItem("edu_user");
    if (!stored) return;
    const user = JSON.parse(stored);
    setUserId(user.id);
    setLoading(true);
    try {
      const params = filter === "open" ? "?open=true" : "";
      const res    = await fetch(`/api/student/groups${params}`, { headers: { Authorization: `Bearer ${user.token}` } });
      const data   = await res.json();
      setGroups(data.groups || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleJoin = async (id: string) => {
    const stored = localStorage.getItem("edu_user");
    if (!stored) return;
    const user = JSON.parse(stored);
    const res  = await fetch(`/api/student/groups/${id}/join`, { method: "POST", headers: { Authorization: `Bearer ${user.token}` } });
    const data = await res.json();
    if (res.ok) { showMsg("Joined group!"); fetchGroups(); }
    else showMsg(data.error || "Failed to join");
  };

  const handleLeave = async (id: string) => {
    const stored = localStorage.getItem("edu_user");
    if (!stored) return;
    const user = JSON.parse(stored);
    const res  = await fetch(`/api/student/groups/${id}/join`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}` } });
    const data = await res.json();
    if (res.ok) { showMsg("Left group"); fetchGroups(); }
    else showMsg(data.error || "Failed to leave");
  };

  const filtered = groups.filter((g) => {
    const matchFilter = filter === "all" ? true : filter === "mine" ? g.members.includes(userId) : g.isOpen && g.members.length < g.maxMembers;
    const matchSearch = search ? g.name.toLowerCase().includes(search.toLowerCase()) || g.subjectCode.toLowerCase().includes(search.toLowerCase()) : true;
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 20px", boxShadow: "var(--shadow-lg)", fontSize: 14, fontWeight: 600, color: "var(--text)", animation: "slideDown 0.3s ease" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10 }}>Study Groups <Icons.Users width={28} height={28} /></h1>
          <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>Connect with peers, collaborate, and ace your courses together.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ background: "#1e3a5f", color: "#fff", padding: "11px 22px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(30,58,95,0.3)" }}
        >
          + Create Group
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <input
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", flex: 1, maxWidth: 320 }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "mine", "open"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "9px 18px", borderRadius: 10, border: "1px solid var(--border)",
                background: filter === f ? "#1e3a5f" : "var(--card)",
                color: filter === f ? "#fff" : "var(--text)",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                textTransform: "capitalize",
              }}
            >
              {f === "all" ? "All Groups" : f === "mine" ? "My Groups" : "Open to Join"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Groups", value: groups.length, icon: <Icons.Users width={24} height={24} /> },
          { label: "You're In",    value: groups.filter((g) => g.members.includes(userId)).length, icon: <Icons.Check width={24} height={24} /> },
          { label: "Open to Join", value: groups.filter((g) => g.isOpen && g.members.length < g.maxMembers && !g.members.includes(userId)).length, icon: <Icons.Plus width={24} height={24} /> },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ color: "var(--text)" }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", fontSize: 15 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⟳</div>
          Loading groups...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Icons.Users width={56} height={56} color="var(--muted)" /></div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>No groups found</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
            {filter === "mine" ? "You haven't joined any groups yet." : "No groups match your search."}
          </p>
          <button onClick={() => setShowCreate(true)} style={{ background: "#1e3a5f", color: "#fff", padding: "11px 28px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            + Create the first group
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filtered.map((g) => (
            <GroupCard key={g._id} group={g} userId={userId} onJoin={handleJoin} onLeave={handleLeave} />
          ))}
        </div>
      )}

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={fetchGroups} />}
    </div>
  );
}
