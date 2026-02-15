import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

interface NewsFormPageProps {
  mode: "create" | "edit";
}

export default function NewsFormPage({ mode }: NewsFormPageProps) {
  const navigate = useNavigate();
  const { newsId } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // 🔥 Load existing data in edit mode
  useEffect(() => {
    if (mode === "edit" && newsId) {
      const fetchNews = async () => {
        const res = await fetch(`http://localhost:4000/api/admin/news`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        const existing = data.find((n: any) => n.id === newsId);

        if (existing) {
          setTitle(existing.title);
          setExcerpt(existing.excerpt);
          setContent(existing.content);
          setIsPublished(existing.isPublished);
        }
      };

      fetchNews();
    }
  }, [mode, newsId, accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("isPublished", String(isPublished));

      if (file) formData.append("image", file);

      const url =
        mode === "create"
          ? "http://localhost:4000/api/admin/news"
          : `http://localhost:4000/api/admin/news/${newsId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      toast.success(
        mode === "create"
          ? "News created successfully"
          : "News updated successfully",
      );

      navigate("/dashboard/news");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-6">
        {mode === "create" ? "Create News" : "Edit News"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full p-3 border rounded"
        />

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Excerpt"
          className="w-full p-3 border rounded"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
          rows={8}
          className="w-full p-3 border rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Publish
        </label>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="
    block w-full text-sm text-gray-700
    file:mr-4 file:py-2 file:px-4
    file:rounded-md file:border
    file:border-blue-500
    file:bg-white
    file:text-blue-600
    file:font-medium
    file:hover:bg-blue-50
    file:cursor-pointer
    cursor-pointer
  "
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </button>
      </form>
    </div>
  );
}
