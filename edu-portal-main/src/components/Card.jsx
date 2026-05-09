const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      border: '1px solid #f0f0f0',
      fontFamily: "'DM Sans', sans-serif",
      ...style,
    }}
  >
    {children}
  </div>
);
export default Card;
