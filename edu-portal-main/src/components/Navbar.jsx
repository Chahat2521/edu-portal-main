import Avatar from './Avatar';
import Icon from './Icon';
const Navbar = ({ role, onLogout, onSwitch }) => {
  const navItems = role === 'teacher' ? ['Courses', 'Assignments', 'Reports', 'Resources'] : ['Courses', 'Assignments', 'Grades', 'Resources'];
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        background: '#fff',
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ border: '2px solid #111', borderRadius: 6, padding: '4px 10px', fontWeight: 900, fontSize: 13, letterSpacing: 1 }}>
        EDU PORTAL
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        {navItems.map((item) => (
          <span key={item} style={{ fontSize: 14, fontWeight: 500, color: '#333', cursor: 'pointer' }}>
            {item}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onSwitch}
          style={{
            fontSize: 12,
            background: '#f0f9e0',
            border: '1px solid #c5e89a',
            borderRadius: 8,
            padding: '5px 12px',
            cursor: 'pointer',
            color: '#4a7a10',
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          Switch to {role === 'teacher' ? 'Student' : 'Teacher'}
        </button>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Icon name="bell" size={20} color="#666" />
          <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#f43f5e', borderRadius: '50%', border: '2px solid #fff' }} />
        </div>
        <Avatar name={role === 'teacher' ? 'Priya Sharma' : 'Arjun Singh'} size={36} color={role === 'teacher' ? '#7dc443' : '#4fa3e0'} />
        <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Icon name="logout" size={18} color="#999" />
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
