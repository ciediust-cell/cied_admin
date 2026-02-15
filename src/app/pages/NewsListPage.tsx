import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

interface NewsItem {
  id: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
}

export function NewsListPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Published" | "Draft"
  >("All");

  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  // 🔥 Fetch News
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:4000/api/admin/news", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        setNewsItems(data);
      } catch (err) {
        toast.error("Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) fetchNews();
  }, [accessToken]);

  // 🔥 Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:4000/api/admin/news/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!response.ok) throw new Error();
      setNewsItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("News item deleted");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
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

      {/* Filters */}
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

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 text-sm text-muted-foreground">Loading...</div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left">Title</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Created</th>
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
                    {new Date(item.createdAt).toLocaleDateString()}
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
                      className="p-2 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
