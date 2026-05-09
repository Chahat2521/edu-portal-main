interface BadgeProps {
  label: string;
  color?: string;
  text?: string;
}

export default function Badge({ label, color = "#e8f5d0", text = "#5a8a1a" }: BadgeProps) {
  return (
    <span
      style={{
        background: color,
        color: text,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        fontFamily: "var(--font-dm-sans)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
