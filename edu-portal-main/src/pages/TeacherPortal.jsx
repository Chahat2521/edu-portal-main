import { useState } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Icon from '../components/Icon';

const TeacherPortal = ({ onLogout, onSwitch }) => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Prepare lesson plan Chapter 6 Integration',
      done: false,
      tags: ['Maths', 'Lesson Plan', 'Urgent'],
    },
    {
      id: 2,
      title: 'Grade Science lab reports Class 10B',
      done: true,
      tags: ['Grading', 'Science', 'In Progress'],
    },
    {
      id: 3,
      title: 'Schedule parent-teacher meeting',
      done: false,
      tags: ['Admin', 'Meetings', 'Planning'],
    },
  ]);

  const stats = [
    { label: 'Total Students', value: '128', bg: '#dbeafe' },
    { label: 'Assignments Due', value: '12', bg: '#fff4e5' },
    { label: 'Avg Grade', value: 'B+', bg: '#dcfce7' },
    { label: 'Pending Reviews', value: '8', bg: '#ffe4e6' },
  ];

  const documents = [
    { emoji: '📄', label: 'Lesson Plan Q2' },
    { emoji: '📊', label: 'Grade Sheet.xlsx' },
    { emoji: '📝', label: 'Exam Paper' },
    { emoji: '📋', label: 'Curriculum' },
  ];

  const classes = [
    { emoji: '📐', label: 'Class 10A Mathematics' },
    { emoji: '⚛️', label: 'Class 10B Physics' },
    { emoji: '∫', label: 'Class 11A Calculus' },
    { emoji: '📊', label: 'Class 12B Statistics' },
  ];

  const approvals = [
    { title: 'Leave request – Arjun', date: '30 Apr' },
    { title: 'Assignment ext – Priya', date: '29 Apr' },
  ];

  const tagStyles = {
    Maths: { bg: '#dbeafe', text: '#1e3a8a' },
    'Lesson Plan': { bg: '#d1fae5', text: '#166534' },
    Urgent: { bg: '#fee2e2', text: '#991b1b' },
    Grading: { bg: '#ede9fe', text: '#5b21b6' },
    Science: { bg: '#fce7f3', text: '#9d174d' },
    'In Progress': { bg: '#dbf4ff', text: '#0369a1' },
    Admin: { bg: '#fffbeb', text: '#92400e' },
    Meetings: { bg: '#ede9fe', text: '#581c87' },
    Planning: { bg: '#ecfdf5', text: '#166534' },
  };

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar role="teacher" onLogout={onLogout} onSwitch={onSwitch} />

      <div
        style={{
          background: 'linear-gradient(135deg, #a8d8f0 0%, #7ec8e3 100%)',
          padding: '60px 40px',
          position: 'relative',
          color: '#0f4265',
        }}
      >
        <h1 style={{ fontSize: 38, fontWeight: 700, marginBottom: 24 }}>Welcome to Teacher Portal! 🏫</h1>
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: 999,
            padding: '12px 18px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <Icon name="search" size={18} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search classes, assignments..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              marginLeft: 12,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>
          <Card>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Teacher Tasks</h3>
            {tasks.map((task) => (
              <div key={task.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: `2px solid ${task.done ? '#4fa3e0' : '#d1d5db'}`,
                    background: task.done ? '#4fa3e0' : '#fff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {task.done ? '✓' : ''}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: task.done ? '#6b7280' : '#111', textDecoration: task.done ? 'line-through' : 'none' }}>
                    {task.title}
                  </p>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {task.tags.map((tag) => (
                      <Badge key={tag} label={tag} color={tagStyles[tag].bg} text={tagStyles[tag].text} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
              + Add new Task
            </a>
          </Card>

          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Class Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {stats.map((stat) => (
                <div key={stat.label} style={{ background: stat.bg, borderRadius: 14, padding: 18 }}>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111' }}>{stat.value}</p>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#4b5563', fontWeight: 600 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 24 }}>
          <Card>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Course Materials</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              {documents.map((doc) => (
                <div
                  key={doc.label}
                  style={{
                    background: '#f3f4f6',
                    borderRadius: 14,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: 110,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{doc.emoji}</div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{doc.label}</p>
                </div>
              ))}
            </div>
            <a href="#" style={{ color: '#2563eb', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              View all
            </a>
          </Card>

          <Card>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>My Classes</h3>
            {classes.map((course) => (
              <div key={course.label} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {course.emoji}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{course.label}</span>
              </div>
            ))}
            <a href="#" style={{ color: '#2563eb', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              View all
            </a>
          </Card>

          <div style={{ display: 'grid', gap: 24 }}>
            <Card style={{ background: '#d0e7fb' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>UPCOMING</p>
              <h3 style={{ margin: '10px 0', fontSize: 28, color: '#1e3a8a' }}>MAY 02</h3>
              <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1e3a8a' }}>Staff Meeting</p>
              <p style={{ margin: 0, fontSize: 13, color: '#1e40af' }}>11:00–12:00</p>
              <a href="#" style={{ display: 'inline-block', marginTop: 12, color: '#1e3a8a', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>
                View all
              </a>
            </Card>

            <Card>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Approval Requests</h4>
              {approvals.map((request) => (
                <div key={request.title} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{request.title}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280' }}>{request.date}</p>
                </div>
              ))}
              <a href="#" style={{ color: '#2563eb', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                View all
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
