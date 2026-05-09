import { useState } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';

const StudentPortal = ({ onLogout, onSwitch }) => {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Complete Math Assignment Ch5',
      done: false,
      tags: ['Maths', 'Homework', 'Due Soon'],
      date: 'May 05',
      student: 'Aman',
    },
    {
      id: 2,
      title: 'Submit Science lab report',
      done: true,
      tags: ['Science', 'Lab Report', 'In Progress'],
      date: 'May 08',
      student: 'Nina',
    },
    {
      id: 3,
      title: 'Read History chapter 8',
      done: true,
      tags: ['History', 'Reading', 'Study'],
      date: 'May 10',
      student: 'Rhea',
    },
  ]);

  const resources = [
    { label: 'Physics', color: '#f9c2e7' },
    { label: 'Maths', color: '#a5d8ff' },
    { label: 'Chemistry', color: '#b7eb8f' },
    { label: 'History', color: '#ffe58f' },
    { label: 'Biology', color: '#d3adf7' },
    { label: 'English', color: '#ffbb96' },
  ];

  const documents = [
    { emoji: '📄', label: 'Syllabus 2025.pdf' },
    { emoji: '📅', label: 'Timetable.pdf' },
    { emoji: '🔬', label: 'Lab Manual.pdf' },
    { emoji: '📋', label: 'Project Brief.pdf' },
  ];

  const courses = [
    { emoji: '📐', label: 'Mathematics', color: '#ffb74d' },
    { emoji: '⚛️', label: 'Physics', color: '#81c784' },
    { emoji: '💻', label: 'Computer Science', color: '#64b5f6' },
    { emoji: '📖', label: 'English Lit', color: '#f48fb1' },
  ];

  const tagStyles = {
    Maths: { bg: '#dbeafe', text: '#1e40af' },
    Homework: { bg: '#d1fae5', text: '#166534' },
    'Due Soon': { bg: '#fef3c7', text: '#92400e' },
    Science: { bg: '#ede9fe', text: '#472183' },
    'Lab Report': { bg: '#fce7f3', text: '#9d174d' },
    'In Progress': { bg: '#dcfce7', text: '#166534' },
    History: { bg: '#fff7cd', text: '#78350f' },
    Reading: { bg: '#ede9fe', text: '#5b21b6' },
    Study: { bg: '#ecfdf5', text: '#166534' },
  };

  const toggleDone = (id) => {
    setAssignments((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar role="student" onLogout={onLogout} onSwitch={onSwitch} />

      <div
        style={{
          background: 'linear-gradient(135deg, #c8f08f 0%, #a8e063 100%)',
          padding: '60px 40px',
          position: 'relative',
          color: '#1b4e12',
        }}
      >
        <h1 style={{ fontSize: 38, fontWeight: 700, marginBottom: 24 }}>Welcome to Student Portal! 🎓</h1>
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
            placeholder="Search assignments, courses..."
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
        <div
          style={{
            position: 'absolute',
            top: 30,
            right: 30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
          }}
        />
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>
          <Card>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>My Assignments</h3>
            {assignments.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => toggleDone(item.id)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: `2px solid ${item.done ? '#7dc443' : '#d1d5db'}`,
                    background: item.done ? '#7dc443' : '#fff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {item.done ? '✓' : ''}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: item.done ? '#6b7280' : '#111', textDecoration: item.done ? 'line-through' : 'none' }}>
                    {item.title}
                  </p>
                  <div style={{ margin: '10px 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item.tags.map((tag) => (
                      <Badge key={tag} label={tag} color={tagStyles[tag].bg} text={tagStyles[tag].text} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                    <span>{item.date}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={item.student} size={28} color="#7dc443" />
                      <span>{item.student}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <a href="#" style={{ color: '#15803d', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
              + Add new Assignment
            </a>
          </Card>

          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Study Resources</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {resources.map((resource) => (
                <div
                  key={resource.label}
                  style={{
                    background: resource.color,
                    borderRadius: 14,
                    padding: 18,
                    color: '#1f2937',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 96,
                  }}
                >
                  {resource.label}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 24 }}>
          <Card>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Latest Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              {documents.map((doc) => (
                <div
                  key={doc.label}
                  style={{
                    background: '#f3f4f6',
                    borderRadius: 14,
                    padding: 18,
                    minHeight: 110,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{doc.emoji}</div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{doc.label}</p>
                </div>
              ))}
            </div>
            <a href="#" style={{ color: '#15803d', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              View all
            </a>
          </Card>

          <Card>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>My Courses</h3>
            {courses.map((course) => (
              <div key={course.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: course.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {course.emoji}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{course.label}</span>
              </div>
            ))}
            <a href="#" style={{ color: '#15803d', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              View all
            </a>
          </Card>

          <div style={{ display: 'grid', gap: 24 }}>
            <Card style={{ background: '#d9f4b4' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#276749' }}>UPCOMING</p>
              <h3 style={{ margin: '10px 0', fontSize: 28, color: '#1f4d2b' }}>MAY 02</h3>
              <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1f4d2b' }}>Physics Lab Session</p>
              <p style={{ margin: 0, fontSize: 13, color: '#234e17' }}>09:00–10:30</p>
              <a href="#" style={{ display: 'inline-block', marginTop: 12, color: '#1f4d2b', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>
                View all
              </a>
            </Card>

            <Card>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Student Request</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '2px solid #d1d5db',
                  }}
                />
                <span style={{ fontSize: 14, color: '#374151' }}>Request pending review</span>
              </div>
              <a href="#" style={{ color: '#15803d', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                + Add new request
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
