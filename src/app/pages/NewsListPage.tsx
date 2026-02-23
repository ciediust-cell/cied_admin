import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import {
  deleteAdminNews,
  getAdminNewsPaginated,
  getErrorMessage,
  type NewsItemResponse,
  type PaginationMeta,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";

const PAGE_SIZE = 20;
const formatNewsDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Invalid date";
  return parsed.toLocaleString();
};

export function NewsListPage() {
  const [newsItems, setNewsItems] = useState<NewsItemResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Published" | "Draft"
  >("All");

  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await getAdminNewsPaginated({
          page,
          limit: PAGE_SIZE,
        });
        setNewsItems(data.data);
        setPagination(data.pagination);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to fetch news"));
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) fetchNews();
  }, [accessToken, page]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to delete this news item?",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteAdminNews(id);
      if (newsItems.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        const refreshed = await getAdminNewsPaginated({
          page,
          limit: PAGE_SIZE,
        });
        setNewsItems(refreshed.data);
        setPagination(refreshed.pagination);
      }
      toast.success("News item deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/news/${id}/edit`);
  };

  const filteredNews = newsItems.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Published" && item.isPublished) ||
      (statusFilter === "Draft" && !item.isPublished);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage News</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage news articles
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/news/createNews")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md"
        >
          <Plus className="w-4 h-4" />
          Add News
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | "Published" | "Draft")
              }
              className="px-4 py-2 bg-input-background border border-border rounded-md"
            >
              <option value="All">All</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mb-4 text-sm text-muted-foreground">Loading...</div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left">Title</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">News Date</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  No news found
                </td>
              </tr>
            ) : (
              filteredNews.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="px-6 py-4">{item.title}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        item.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatNewsDate(item.newsDate)}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="p-2 text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-destructive disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {deletingId === item.id ? (
                        <LoadingIndicator label="Deleting..." className="text-xs" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)} ({pagination.total}{" "}
          total)
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={loading || page <= 1}
            className="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading || page >= Math.max(1, pagination.totalPages)}
            className="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
