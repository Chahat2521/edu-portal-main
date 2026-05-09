"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/shared/Toast";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import SearchBar from "@/components/shared/SearchBar";
import FilterDropdown from "@/components/shared/FilterDropdown";
import { Icons } from "@/components/ui/Icons";

export default function StudentResourcesPage() {
  const { showToast } = useToast();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchResources();
  }, [typeFilter]);

  async function fetchResources() {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      const url = typeFilter === "all" ? "/api/student/library" : `/api/student/library?type=${typeFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setResources(data.resources);
    } catch (err: any) {
      console.error("Error:", err);
      showToast("Failed to load resources", "error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getResourceIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      pdf: <Icons.FileText width={32} height={32} />,
      video: <Icons.Video width={32} height={32} />,
      link: <Icons.LinkIcon width={32} height={32} />,
      document: <Icons.FileText width={32} height={32} />,
      notes: <Icons.FileText width={32} height={32} />,
    };
    return icons[type] || <Icons.File width={32} height={32} />;
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("edu_user") || "{}");
      await fetch("/api/student/library", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ resourceId }),
      });
      showToast("Download counted", "success");
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}><Icons.BookOpen width={24} height={24} /> Learning Library</h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px" }}>Access course materials and resources</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search resources..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <FilterDropdown
          label="Type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            { value: "pdf", label: "PDF" },
            { value: "video", label: "Video" },
            { value: "notes", label: "Notes" },
            { value: "document", label: "Document" },
          ]}
        />
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 60,
            textAlign: "center",
            border: "1px solid #f0f0f0",
          }}
        >
          <p style={{ fontSize: 14, color: "#666" }}>No resources found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((resource) => (
            <div
              key={resource._id}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #f0f0f0",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>
                {getResourceIcon(resource.type)}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
                {resource.name}
              </h3>
              <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px" }}>
                By {resource.uploadedBy}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {resource.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      background: "#f0f0f0",
                      color: "#666",
                      padding: "4px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#999" }}>
                  <Icons.Download width={14} height={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} /> {resource.downloads} downloads
                </span>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleDownload(resource._id)}
                  style={{
                    padding: "6px 12px",
                    background: "#7dc443",
                    color: "white",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
