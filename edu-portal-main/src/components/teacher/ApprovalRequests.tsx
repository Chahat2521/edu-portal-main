interface ApprovalRequestsProps {
  requests: { title: string; date: string }[];
}

export default function ApprovalRequests({ requests }: ApprovalRequestsProps) {
  return (
    <div>
      {requests.map((r) => (
        <div key={r.title} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 8 }}>
          <span>{r.title}</span>
          <span style={{ color: "#aaa", flexShrink: 0 }}>{r.date}</span>
        </div>
      ))}
    </div>
  );
}
