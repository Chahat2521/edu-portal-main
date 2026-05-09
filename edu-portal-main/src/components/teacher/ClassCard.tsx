interface ClassCardProps {
  icon: React.ReactNode;
  name: string;
  color: string;
}

export default function ClassCard({ icon, name, color }: ClassCardProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 8, background: "#fafafa", cursor: "pointer", border: "1px solid #f0f0f0" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
        {icon}
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{name}</span>
    </div>
  );
}
