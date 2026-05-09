import Card from "@/components/ui/Card";

export default function StudentRequestCard() {
  return (
    <Card>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>Student Request</h3>
      <div style={{ padding: "12px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f43f5e" }} />
          <p style={{ margin: 0, fontSize: 13, color: "#555" }}>Request leave for 5th May semester exams</p>
        </div>
      </div>
      <button style={{ background: "#f0f9e0", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#4a7a10", cursor: "pointer", fontFamily: "inherit" }}>
        + Add new request
      </button>
    </Card>
  );
}
