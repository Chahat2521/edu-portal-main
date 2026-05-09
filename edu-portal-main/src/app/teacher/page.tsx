"use client";
import HeroBanner from "@/components/layout/HeroBanner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TaskCard from "@/components/teacher/TaskCard";
import ClassOverviewStats from "@/components/teacher/ClassOverviewStats";
import ClassCard from "@/components/teacher/ClassCard";
import MaterialCard from "@/components/teacher/MaterialCard";
import UpcomingSession from "@/components/teacher/UpcomingSession";
import ApprovalRequests from "@/components/teacher/ApprovalRequests";
import { Task } from "@/types";

export default function TeacherDashboard() {
  const tasks: Task[] = [
    { _id: "1", title: "Prepare lecture slides for Unit 4 – Graph Algorithms", tags: ["CS301","Lecture","Pending"], done: false, dueDate: "02/05/2025", teacherId: "" },
    { _id: "2", title: "Evaluate DBMS lab reports submitted by Sem 4 students", tags: ["Grading","CS302","In Progress"], done: true, dueDate: "30/04/2025", teacherId: "" },
    { _id: "3", title: "Submit research paper draft to IEEE conference portal", tags: ["Research","IEEE","Deadline"], done: false, dueDate: "10/05/2025", teacherId: "" },
  ];

  const classes = [
    { icon: "📐", name: "Sem 4 – Data Structures", color: "#fff3e0" },
    { icon: "🗄️", name: "Sem 4 – DBMS", color: "#e8f5e9" },
    { icon: "🌐", name: "Sem 6 – Networks", color: "#e3f2fd" },
    { icon: "📊", name: "Sem 6 – Statistics", color: "#fce4ec" },
  ];

  const materials = [
    { icon: "📄", name: "Lecture Notes Unit 4", bg: "#ffeaea" },
    { icon: "📊", name: "Student Grade Sheet", bg: "#eaffea" },
    { icon: "📝", name: "Mid Semester Paper", bg: "#eaf0ff" },
    { icon: "📋", name: "Course Outline 2025", bg: "#fff5ea" },
  ];

  const approvalRequests = [
    { title: "Leave request – Rahul Sharma",    date: "30 Apr" },
    { title: "Assignment extension – Priya V",  date: "29 Apr" },
  ];

  return (
    <div>
      <HeroBanner
        title="Welcome to Faculty Portal! 👨‍🏫"
        gradient="linear-gradient(135deg, #a8d8f0, #7ec8e3)"
        textColor="#0a2940"
        searchPlaceholder="Search students, lectures, research papers..."
      />

      <div style={{ padding: "32px", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Top Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
          {/* Left - Faculty Tasks */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Faculty Tasks</h2>
              <span style={{ fontSize: 20 }}>✓</span>
            </div>
            <TaskCard tasks={tasks} />
            <Button variant="ghost" color="#4fa3e0" style={{ marginTop: 12 }}>
              + Add new Task
            </Button>
          </Card>

          {/* Right - Class Overview */}
          <Card>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>Class Overview</h2>
            <ClassOverviewStats />
          </Card>
        </div>

        {/* Bottom Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: 20 }}>
          {/* Course Materials */}
          <Card>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>Course Materials</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {materials.map((mat) => (
                <MaterialCard key={mat.name} icon={mat.icon} name={mat.name} bgColor={mat.bg} />
              ))}
            </div>
            <Button variant="ghost" color="#4fa3e0">
              View all
            </Button>
          </Card>

          {/* My Classes */}
          <Card>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>My Subjects</h2>
            {classes.map((cls) => (
              <ClassCard key={cls.name} icon={cls.icon} name={cls.name} color={cls.color} />
            ))}
            <Button variant="ghost" color="#4fa3e0" style={{ marginTop: 8 }}>
              View all
            </Button>
          </Card>

          {/* Right Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>Upcoming Sessions</h3>
              <UpcomingSession month="MAY" day="02" title="Department Faculty Meeting" time="02:00–03:00" />
              <Button variant="ghost" color="#4fa3e0" style={{ marginTop: 12 }}>
                View all
              </Button>
            </Card>
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>Approval Requests</h3>
              <ApprovalRequests requests={approvalRequests} />
              <Button variant="ghost" color="#4fa3e0" style={{ marginTop: 12 }}>
                View all
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
