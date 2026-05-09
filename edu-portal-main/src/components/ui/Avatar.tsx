interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export default function Avatar({ name, size = 32, color = "#7dc443" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {initials}
    </div>
  );
}
