import { useState } from 'react';
import AuthPage from './pages/AuthPage';
import StudentPortal from './pages/StudentPortal';
import TeacherPortal from './pages/TeacherPortal';

export default function App() {
  const [page, setPage] = useState('auth');
  const [currentRole, setCurrentRole] = useState('student');
  const [userName, setUserName] = useState('User');

  const handleLogin = (role, name) => {
    setCurrentRole(role);
    setUserName(name);
    setPage(role === 'student' ? 'student' : 'teacher');
  };

  const handleSwitch = () => {
    setPage(currentRole === 'student' ? 'teacher' : 'student');
    setCurrentRole(currentRole === 'student' ? 'teacher' : 'student');
  };

  const handleLogout = () => {
    setPage('auth');
    setCurrentRole('student');
    setUserName('User');
  };

  return (
    <>
      {page === 'auth' && <AuthPage onLogin={handleLogin} />}
      {page === 'student' && (
        <StudentPortal userName={userName} onSwitch={handleSwitch} onLogout={handleLogout} />
      )}
      {page === 'teacher' && (
        <TeacherPortal userName={userName} onSwitch={handleSwitch} onLogout={handleLogout} />
      )}
    </>
  );
}
