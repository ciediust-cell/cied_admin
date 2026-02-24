import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import {
  createAdminNews,
  getAdminNews,
  getErrorMessage,
  updateAdminNews,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface NewsFormPageProps {
  mode: "create" | "edit";
}

export default function NewsFormPage({ mode }: NewsFormPageProps) {
  const navigate = useNavigate();
  const { newsId } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [newsDate, setNewsDate] = useState("");
  const [newsTime, setNewsTime] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  useEffect(() => {
    if (mode !== "edit" || !newsId || !accessToken) return;

    const fetchNews = async () => {
      try {
        const data = await getAdminNews();
        const existing = data.find((n) => n.id === newsId);

        if (existing) {
          setTitle(existing.title);
          if (existing.newsDate) {
            const dateObj = new Date(existing.newsDate);
            setNewsDate(dateObj.toISOString().split("T")[0]);
            setNewsTime(dateObj.toISOString().split("T")[1]?.slice(0, 5) || "");
          }
          setExcerpt(existing.excerpt || "");
          setContent(existing.content || "");
          setIsPublished(existing.isPublished);
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load news"));
      }
    };

    fetchNews();
  }, [mode, newsId, accessToken]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
  };

  const handleRemoveImage = (index: number) => {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
    setMainImageIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      if (!newsDate || !newsTime) {
        toast.error("Please select both news date and time.");
        return;
      }
      formData.append("newsDate", new Date(`${newsDate}T${newsTime}`).toISOString());
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("isPublished", String(isPublished));

      if (mode === "create" && files.length === 0) {
        toast.error("Please upload at least one image.");
        return;
      }

      files.forEach((file) => formData.append("images", file));
      if (files.length > 0) {
        formData.append("mainImageIndex", String(mainImageIndex));
      }

      if (mode === "create") {
        await createAdminNews(formData);
      } else if (newsId) {
        await updateAdminNews(newsId, formData);
      }

      toast.success(
        mode === "create"
          ? "News created successfully"
          : "News updated successfully",
      );

      navigate("/dashboard/news");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save news"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-6">{mode === "create" ? "Create News" : "Edit News"}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full p-3 border rounded"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm text-gray-600">News Date</span>
            <input
              type="date"
              value={newsDate}
              onChange={(e) => setNewsDate(e.target.value)}
              required
              className="w-full p-3 border rounded"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-600">News Time</span>
            <input
              type="time"
              value={newsTime}
              onChange={(e) => setNewsTime(e.target.value)}
              required
              className="w-full p-3 border rounded"
            />
          </label>
        </div>

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

        <div className="space-y-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
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

          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {previews.map((preview, index) => (
                <div key={`${preview.name}-${index}`} className="border rounded p-2 space-y-2">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-24 object-cover rounded"
                  />
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="mainImage"
                      checked={mainImageIndex === index}
                      onChange={() => setMainImageIndex(index)}
                    />
                    Main image
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? (
            <LoadingIndicator label="Saving..." className="justify-center" />
          ) : mode === "create" ? (
            "Create"
          ) : (
            "Update"
          )}
        </button>
      </form>
    </div>
  );
}
