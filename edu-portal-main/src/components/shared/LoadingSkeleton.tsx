"use client";

interface LoadingSkeletonProps {
  rows?: number;
  type?: "table" | "card" | "list";
}

export default function LoadingSkeleton({ rows = 3, type = "table" }: LoadingSkeletonProps) {
  const items = Array.from({ length: rows }, (_, i) => i);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((i) => (
        <div
          key={i}
          style={{
            height: type === "card" ? 200 : 50,
            background: "#e5e5e5",
            borderRadius: 8,
            animation: "pulse 2s infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
