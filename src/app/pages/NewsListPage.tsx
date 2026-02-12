import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  status: "Published" | "Draft";
  createdDate: string;
  author: string;
}

const mockNewsData: NewsItem[] = [
  {
    id: 1,
    title: "Annual Day Celebration 2026 - Grand Success",
    status: "Published",
    createdDate: "2026-02-05",
    author: "Admin",
  },
  {
    id: 2,
    title: "New Science Lab Inauguration Ceremony",
    status: "Published",
    createdDate: "2026-02-03",
    author: "Admin",
  },
  {
    id: 3,
    title: "Inter-School Sports Competition Results",
    status: "Draft",
    createdDate: "2026-02-01",
    author: "Admin",
  },
  {
    id: 4,
    title: "Student Achievement: National Level Awards",
    status: "Published",
    createdDate: "2026-01-28",
    author: "Admin",
  },
  {
    id: 5,
    title: "Upcoming Parent-Teacher Meeting Schedule",
    status: "Draft",
    createdDate: "2026-01-25",
    author: "Admin",
  },
  {
    id: 6,
    title: "Library Expansion Project Completed",
    status: "Published",
    createdDate: "2026-01-20",
    author: "Admin",
  },
  {
    id: 7,
    title: "Winter Camp Registration Now Open",
    status: "Published",
    createdDate: "2026-01-15",
    author: "Admin",
  },
  {
    id: 8,
    title: "Alumni Meet 2026 Announcement",
    status: "Draft",
    createdDate: "2026-01-10",
    author: "Admin",
  },
];

export function NewsListPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(mockNewsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Published" | "Draft"
  >("All");
  const navigate = useNavigate();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this news item?")) {
      setNewsItems(newsItems.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/dashboard/news/${id}/edit`);
  };

  const filteredNews = newsItems.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage News</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage news articles for your website
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/news/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add News
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | "Published" | "Draft")
              }
              className="px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-foreground">Title</th>
                <th className="text-left px-6 py-4 text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-foreground">Author</th>
                <th className="text-left px-6 py-4 text-foreground">
                  Created Date
                </th>
                <th className="text-left px-6 py-4 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No news items found
                  </td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-foreground">{item.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs ${
                          item.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.author}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(item.createdDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Stats */}
        {filteredNews.length > 0 && (
          <div className="px-6 py-4 bg-muted border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredNews.length} of {newsItems.length} news items
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
