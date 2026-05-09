export default function ClassOverviewStats() {
  const stats = [
    { value: "243", label: "Enrolled Students", bg: "#ddf0ff", color: "#1a5a8a" },
    { value: "18",  label: "Submissions Due", bg: "#fff3e0", color: "#8a5000" },
    { value: "7.8",  label: "Avg. CGPA",      bg: "#e8ffe8", color: "#1a7a1a" },
    { value: "14",   label: "Pending Reviews", bg: "#ffe8f0", color: "#8a1a40" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {stats.map((s) => (
        <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 12px" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
