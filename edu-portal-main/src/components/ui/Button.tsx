import { ReactNode, CSSProperties } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  color?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  style?: CSSProperties;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  color = "#1e3a5f",
  fullWidth = false,
  disabled = false,
  type = "button",
  style = {},
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    fontFamily: "var(--font-dm-sans)",
    fontWeight: 700,
    fontSize: 14,
    borderRadius: 12,
    padding: "11px 20px",
    cursor: disabled ? "not-allowed" : "pointer",
    width: fullWidth ? "100%" : "auto",
    opacity: disabled ? 0.6 : 1,
    border: "none",
    transition: "opacity 0.2s",
  };

  const variants: Record<string, CSSProperties> = {
    primary: {
      background: color,
      color: "#fff",
      boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
    },
    outline: {
      background: "transparent",
      color: color,
      border: `2px solid ${color}`,
    },
    ghost: {
      background: "transparent",
      color: color,
      padding: "8px 0",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
