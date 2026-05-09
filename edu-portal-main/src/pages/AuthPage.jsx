import { useState } from 'react';
import Icon from '../components/Icon';

const AuthPage = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(role);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f5f5f5' }}>
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #7dc443 0%, #4fa3e0 100%)',
          color: '#fff',
          padding: 48,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            top: -120,
            right: -120,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            bottom: -80,
            left: -80,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '12px 18px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 40,
            }}
          >
            EDU PORTAL
          </div>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, marginBottom: 24 }}>Your Learning Hub Awaits 🎓</h1>
          <p style={{ fontSize: 16, maxWidth: 460, opacity: 0.95, marginBottom: 40 }}>
            Access courses, tasks, grades, and schedules in one modern classroom experience.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {([
              { emoji: '📚', label: 'Courses' },
              { emoji: '✅', label: 'Tasks' },
              { emoji: '📊', label: 'Grades' },
              { emoji: '🗓️', label: 'Schedule' },
            ]).map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  borderRadius: 18,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 120,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{isSignup ? 'Create account' : 'Welcome back!'}</h2>
          <p style={{ color: '#666', marginBottom: 32, fontSize: 15 }}>
            {isSignup
              ? 'Sign up to start your personalized learning journey.'
              : 'Sign in to access your portal.'}
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            {([
              { value: 'student', label: '🎒 Student' },
              { value: 'teacher', label: '🏫 Teacher' },
            ]).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  color: role === option.value ? '#fff' : '#555',
                  background: role === option.value ? (option.value === 'student' ? '#7dc443' : '#4fa3e0') : '#f3f4f6',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  marginBottom: 16,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                marginBottom: 16,
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 16px',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 14,
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <Icon name={showPassword ? 'eyeoff' : 'eye'} size={18} color="#6b7280" />
              </button>
            </div>

            {!isSignup && (
              <div style={{ textAlign: 'right', marginBottom: 24 }}>
                <a href="#" style={{ color: role === 'student' ? '#7dc443' : '#4fa3e0', textDecoration: 'none', fontSize: 13 }}>
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                background: role === 'student' ? 'linear-gradient(135deg, #7dc443, #4a9b2f)' : 'linear-gradient(135deg, #4fa3e0, #2574c8)',
              }}
            >
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: 14 }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignup((prev) => !prev)}
              style={{ border: 'none', background: 'none', color: role === 'student' ? '#7dc443' : '#4fa3e0', fontWeight: 700, cursor: 'pointer' }}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
