const Badge = ({ label, color = '#e8f5d0', text = '#5a8a1a' }) => (
  <span
    style={{
      background: color,
      color: text,
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      display: 'inline-block',
    }}
  >
    {label}
  </span>
);

export default Badge;
