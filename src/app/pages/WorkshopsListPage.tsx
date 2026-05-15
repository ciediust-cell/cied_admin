import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CalendarDays,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  deleteAdminWorkshop,
  getAdminWorkshopsPaginated,
  getErrorMessage,
  toggleAdminWorkshopStatus,
  type PaginationMeta,
  type WorkshopItemResponse,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";

const PAGE_SIZE = 20;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function WorkshopsListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [workshops, setWorkshops] = useState<WorkshopItemResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Published" | "Draft">(
    "All",
  );
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });

  useEffect(() => {
    if (!accessToken) return;

    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const data = await getAdminWorkshopsPaginated({
          page,
          limit: PAGE_SIZE,
        });
        setWorkshops(data.data);
        setPagination(data.pagination);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load workshops"));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, [accessToken, page]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to delete this workshop?",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteAdminWorkshop(id);
      if (workshops.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        const refreshed = await getAdminWorkshopsPaginated({
          page,
          limit: PAGE_SIZE,
        });
        setWorkshops(refreshed.data);
        setPagination(refreshed.pagination);
      }
      toast.success("Workshop deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setTogglingId(id);
      const data = await toggleAdminWorkshopStatus(id);
      setWorkshops((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isPublished: data.workshop.isPublished } : item,
        ),
      );
      toast.success("Workshop status updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Status update failed"));
    } finally {
      setTogglingId(null);
    }
  };

  const filteredWorkshops = workshops.filter((workshop) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      workshop.title.toLowerCase().includes(search) ||
      workshop.venue.toLowerCase().includes(search) ||
      workshop.speakerName.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Published" && workshop.isPublished) ||
      (statusFilter === "Draft" && !workshop.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Workshops</h1>
          <p className="text-muted-foreground">
            Create and manage workshops, speakers, and workshop media
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/workshops/createWorkshop")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Workshop
        </button>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading...</p>}

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search workshops, venues, or speakers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["All", "Published", "Draft"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-input-background text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredWorkshops.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground mb-2">No workshops found</p>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters or create a new workshop
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Workshop
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Venue
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Speaker
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Media
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Date
                  </th>
                  <th className="text-right px-6 py-4 text-sm text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkshops.map((workshop) => (
                  <tr
                    key={workshop.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
                          {workshop.images[0]?.imageUrl ? (
                            <img
                              src={workshop.images[0].imageUrl}
                              alt={workshop.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground text-sm truncate">
                            {workshop.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-80">
                            {workshop.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{workshop.venue}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{workshop.speakerName}</p>
                      {workshop.speakerDesignation && (
                        <p className="text-xs text-muted-foreground/80">
                          {workshop.speakerDesignation}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {workshop.images.length}{" "}
                        {workshop.images.length === 1 ? "image" : "images"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs ${
                          workshop.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {workshop.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(workshop.workshopDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/dashboard/workshops/${workshop.id}/edit`)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(workshop.id)}
                          disabled={togglingId === workshop.id}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title={workshop.isPublished ? "Unpublish" : "Publish"}
                        >
                          {togglingId === workshop.id ? (
                            <LoadingIndicator label="Updating..." className="text-xs" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(workshop.id)}
                          disabled={deletingId === workshop.id}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deletingId === workshop.id ? (
                            <LoadingIndicator label="Deleting..." className="text-xs" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)} (
          {pagination.total} total)
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
