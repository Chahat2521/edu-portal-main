interface UpcomingClassProps {
  month: string;
  day: string | number;
  title: string;
  time: string;
}

export default function UpcomingClass({ month, day, title, time }: UpcomingClassProps) {
  return (
    <div style={{ background: "#c8f08f", borderRadius: 12, padding: 16, display: "flex", gap: 14 }}>
      <div style={{ textAlign: "center", minWidth: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#4a7a10" }}>{month}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#1a2e05", lineHeight: 1 }}>{day}</div>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2e05" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#4a7a10", marginTop: 2 }}>{time}</div>
      </div>
    </div>
  );
}
