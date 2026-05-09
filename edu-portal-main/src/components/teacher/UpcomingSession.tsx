interface UpcomingSessionProps {
  month: string;
  day: string | number;
  title: string;
  time: string;
}

export default function UpcomingSession({ month, day, title, time }: UpcomingSessionProps) {
  return (
    <div style={{ background: "#a8d8f0", borderRadius: 12, padding: 16, display: "flex", gap: 14 }}>
      <div style={{ textAlign: "center", minWidth: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#0a4a6a" }}>{month}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#0a2940", lineHeight: 1 }}>{day}</div>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0a2940" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#0a4a6a", marginTop: 2 }}>{time}</div>
      </div>
    </div>
  );
}
