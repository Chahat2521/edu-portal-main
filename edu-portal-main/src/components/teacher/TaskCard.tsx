"use client";
import Badge from "@/components/ui/Badge";
import { Task } from "@/types";

interface TaskCardProps {
  tasks: Task[];
  onToggle?: (id: string) => void;
}

export default function TaskCard({ tasks, onToggle }: TaskCardProps) {
  return (
    <div>
      {tasks.map((task) => (
        <div key={task._id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
          <div
            onClick={() => onToggle?.(task._id)}
            style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${task.done ? "#4fa3e0" : "#ccc"}`, background: task.done ? "#4fa3e0" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, color: "#fff", fontSize: 11, cursor: "pointer" }}
          >
            {task.done ? "✓" : ""}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 6px", fontSize: 14, color: task.done ? "#999" : "#222", textDecoration: task.done ? "line-through" : "none" }}>
              {task.title}
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {task.tags.map((tag) => <Badge key={tag} label={tag} color="#ddf0ff" text="#1a5a8a" />)}
            </div>
          </div>
          <span style={{ fontSize: 12, color: "#aaa", flexShrink: 0 }}>{task.dueDate}</span>
        </div>
      ))}
    </div>
  );
}
