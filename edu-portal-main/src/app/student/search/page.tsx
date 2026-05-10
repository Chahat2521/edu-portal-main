"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icons";
import Link from "next/link";

export default function StudentSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<{courses: any[], assignments: any[], grades: any[]}>({ courses: [], assignments: [], grades: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      const searchData = async () => {
        setLoading(true);
        try {
          const userToken = JSON.parse(localStorage.getItem("edu_user") || "{}").token;
          const headers = { "Authorization": `Bearer ${userToken}` };
          const [coursesRes, assignmentsRes, gradesRes] = await Promise.all([
            fetch("/api/student/courses", { headers }),
            fetch("/api/student/assignments", { headers }),
            fetch("/api/student/exam-grades", { headers })
          ]);
          const coursesData = await coursesRes.json();
          const assignmentsData = await assignmentsRes.json();
          const gradesData = await gradesRes.json();

          const lowerQ = query.toLowerCase();
          
          setResults({
            courses: (coursesData.courses || []).filter((c: any) => (c.name || c.courseName || "").toLowerCase().includes(lowerQ) || (c.code || c.courseCode || "").toLowerCase().includes(lowerQ)),
            assignments: (assignmentsData.assignments || []).filter((a: any) => (a.title || "").toLowerCase().includes(lowerQ)),
            grades: (gradesData.grades || []).filter((g: any) => (g.subject || "").toLowerCase().includes(lowerQ) || (g.examType || "").toLowerCase().includes(lowerQ))
          });
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      searchData();
    } else {
      setResults({ courses: [], assignments: [], grades: [] });
      setLoading(false);
    }
  }, [query]);

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Search Results</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>Showing results for "{query}"</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48, color: "var(--muted)" }}>
          <Icons.Loader width={24} height={24} className="animate-spin" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {results.courses.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Icons.Courses width={20} height={20} /> Courses</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {results.courses.map(course => (
                  <Link key={course._id} href="/student/courses" style={{ textDecoration: "none" }}>
                    <Card>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{course.name || course.courseName || course.title}</h3>
                        <span style={{ fontSize: 12, fontWeight: 600, background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: 6, color: "var(--muted)" }}>{course.code || course.courseCode}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.assignments.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Icons.Assignments width={20} height={20} /> Assignments</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {results.assignments.map(assignment => (
                  <Link key={assignment._id} href="/student/assignments" style={{ textDecoration: "none" }}>
                    <Card>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{assignment.title}</h3>
                      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{assignment.description}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.grades.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Icons.Grades width={20} height={20} /> Grades</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {results.grades.map(grade => (
                  <Link key={grade._id} href="/student/exam-grades" style={{ textDecoration: "none" }}>
                    <Card>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{grade.subject}</h3>
                        <span style={{ fontSize: 12, fontWeight: 600, background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: 6, color: "var(--muted)" }}>{grade.examType}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Score: {grade.marks} / {grade.maxMarks}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.courses.length === 0 && results.assignments.length === 0 && results.grades.length === 0 && (
            <Card style={{ textAlign: "center", padding: "48px 24px" }}>
              <Icons.Search width={48} height={48} style={{ color: "var(--muted)", margin: "0 auto 16px", opacity: 0.5 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>No results found</h3>
              <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>Try adjusting your search query.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
