interface MaterialCardProps {
  icon: string;
  name: string;
  bgColor: string;
}

export default function MaterialCard({ icon, name, bgColor }: MaterialCardProps) {
  return (
    <div style={{ background: bgColor, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#444" }}>{name}</span>
    </div>
  );
}
