"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TeacherNavbar from "@/components/layout/TeacherNavbar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState("Teacher");

  useEffect(() => {
    const stored = localStorage.getItem("edu_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(stored);
    setUserName(user.name);
  }, [router]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", transition: "background 0.2s ease" }}>
      <TeacherNavbar userName={userName} />
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
