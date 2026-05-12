import { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, style = {}, className = "", onClick }: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "var(--card)",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
        border: "1px solid #f0f0f0",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
