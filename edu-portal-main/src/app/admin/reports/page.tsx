"use client";
import { Icons } from "@/components/ui/Icons";
export default function AdminReportsPage() {
  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}><Icons.Chart width={24} height={24} /> Reports</h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 32px" }}>Coming soon...</p>
      <div style={{ background: "white", borderRadius: 16, padding: 40, border: "1px solid #f0f0f0", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#666" }}>Analytics and reports dashboard</p>
      </div>
    </div>
  );
}
