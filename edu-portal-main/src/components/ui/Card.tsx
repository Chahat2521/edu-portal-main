import { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export default function Card({ children, style = {}, className = "" }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
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
