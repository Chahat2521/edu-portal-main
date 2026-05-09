"use client";
import { useState, useEffect } from "react";

interface AuthUser {
  id: string;
  name: string;
  role: "student" | "teacher";
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("edu_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("edu_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: AuthUser) => {
    localStorage.setItem("edu_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("edu_user");
    setUser(null);
  };

  return { user, loading, login, logout };
}
