interface HeroBannerProps {
  title: string;
  gradient: string;
  textColor: string;
  searchPlaceholder: string;
}

export default function HeroBanner({ title, gradient, textColor, searchPlaceholder }: HeroBannerProps) {
  return (
    <div style={{ background: gradient, padding: "52px 32px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {[180, 120, 200, 90].map((s, i) => (
        <div key={i} style={{ position: "absolute", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.35)", width: s, height: s, top: ["-40px","30px","-60px","20px"][i] as any, right: i < 2 ? (["-30px","120px"][i] as any) : undefined, left: i >= 2 ? (["50px","200px"][i-2] as any) : undefined }} />
      ))}
      <h1 style={{ fontSize: 40, fontWeight: 900, color: textColor, margin: "0 0 20px", position: "relative", letterSpacing: -1 }}>
        {title}
      </h1>
      <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 40, padding: "12px 20px", maxWidth: 540, margin: "0 auto", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", gap: 10, position: "relative" }}>
        <span style={{ color: "#999", fontSize: 16 }}>🔍</span>
        <input placeholder={searchPlaceholder} style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "none", color: "#333", fontFamily: "inherit" }} />
      </div>
    </div>
  );
}
