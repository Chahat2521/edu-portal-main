"use client";

import { useState, useEffect, useRef } from "react";
import { Icons } from "@/components/ui/Icons";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const stored = localStorage.getItem("edu_user");
      const token = stored ? JSON.parse(stored).token : "";
      if (!token) return;

      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: any) => !n.read).length || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        const stored = localStorage.getItem("edu_user");
        const token = stored ? JSON.parse(stored).token : "";
        if (token) {
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
          });
          setUnreadCount(0);
          setNotifications(notifications.map(n => ({ ...n, read: true })));
        }
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "success": return <Icons.Check width={16} height={16} style={{ color: "var(--success-text)" }} />;
      case "warning": return <Icons.AlertTriangle width={16} height={16} style={{ color: "var(--warning-text)" }} />;
      case "error": return <Icons.AlertCircle width={16} height={16} style={{ color: "var(--error-text)" }} />;
      default: return <Icons.Info width={16} height={16} style={{ color: "var(--info-text)" }} />;
    }
  };

  const getBgForType = (type: string) => {
    switch (type) {
      case "success": return "var(--success-bg)";
      case "warning": return "var(--warning-bg)";
      case "error": return "var(--error-bg)";
      default: return "var(--info-bg)";
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <div onClick={handleOpen} style={{ cursor: "pointer", display: "flex", color: "var(--text)", padding: 6, borderRadius: "50%", background: isOpen ? "var(--bg-secondary)" : "transparent", transition: "background 0.2s" }}>
        <Icons.Bell width={22} height={22} />
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "#f43f5e", borderRadius: "50%", border: "2px solid var(--nav-bg)", display: "block" }} />
        )}
      </div>

      {isOpen && (
        <div className="animate-slide-down" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-lg)", overflow: "hidden", zIndex: 1000 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "var(--text)" }}>Notifications</h3>
            {unreadCount > 0 && (
              <span style={{ fontSize: 11, background: "var(--bg-secondary)", color: "var(--muted)", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>{unreadCount} New</span>
            )}
          </div>
          
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted)" }}>
                <Icons.Bell width={32} height={32} style={{ opacity: 0.3, margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, background: notif.read ? "transparent" : "var(--bg-secondary)", transition: "background 0.2s" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: getBgForType(notif.type), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {getIconForType(notif.type)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "var(--text)" }}>{notif.title}</h4>
                    <p style={{ fontSize: 12, margin: 0, color: "var(--muted)", lineHeight: 1.4 }}>{notif.message}</p>
                    <span style={{ fontSize: 11, color: "var(--muted-light)", display: "block", marginTop: 6 }}>
                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
