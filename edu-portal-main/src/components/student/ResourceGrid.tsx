export default function ResourceGrid() {
  const resources = [
    { label: "� Data Structures",   bg: "#ffd6e0", color: "#c0304e" },
    { label: "🗄️ DBMS",             bg: "#d6eaff", color: "#1a6dc0" },
    { label: "🌐 Networks",          bg: "#d6ffd6", color: "#1a7a1a" },
    { label: "📐 Mathematics",       bg: "#fff3d6", color: "#8a6000" },
    { label: "📊 Statistics",        bg: "#ead6ff", color: "#5a1ac0" },
    { label: "🤖 Machine Learning",  bg: "#ffd6f0", color: "#c01880" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {resources.map((r) => (
        <div key={r.label} style={{ background: r.bg, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 600, color: r.color, cursor: "pointer" }}>
          {r.label}
        </div>
      ))}
    </div>
  );
}
