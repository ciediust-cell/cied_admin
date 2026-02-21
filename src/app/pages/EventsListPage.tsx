import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  deleteAdminEvent,
  getAdminEventsPaginated,
  getErrorMessage,
  type EventItemResponse,
  type PaginationMeta,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";

const PAGE_SIZE = 20;

export function EventsListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [events, setEvents] = useState<EventItemResponse[]>([]);
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getAdminEventsPaginated({
          page,
          limit: PAGE_SIZE,
        });
        setEvents(data.data);
        setPagination(data.pagination);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load events"));
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) fetchEvents();
  }, [accessToken, page]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to delete this event?",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteAdminEvent(id);
      if (events.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        const refreshed = await getAdminEventsPaginated({
          page,
          limit: PAGE_SIZE,
        });
        setEvents(refreshed.data);
        setPagination(refreshed.pagination);
      }
      toast.success("Event deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatus = (eventDate: string) => {
    const now = new Date();
    const date = new Date(eventDate);

    if (date > now) return "Upcoming";
    if (date.toDateString() === now.toDateString()) return "Ongoing";
    return "Past";
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Manage Events</h1>
          <p className="text-muted-foreground">Create and manage events</p>
        </div>

        <button
          onClick={() => navigate("/dashboard/events/createEvent")}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Event
        </button>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading...</p>}

      <input
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 w-full px-4 py-2 border rounded"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const status = getStatus(event.eventDate);

          return (
            <div key={event.id} className="bg-card border rounded-lg p-6">
              <h3 className="mb-2">{event.title}</h3>

              <p className="text-sm text-muted-foreground mb-2">
                {new Date(event.eventDate).toLocaleDateString()}
              </p>

              <p className="text-sm text-muted-foreground mb-3">{event.location}</p>

              <span className="text-xs px-3 py-1 bg-muted rounded-full">{status}</span>

              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate(`/dashboard/events/${event.id}/edit`)}>
                  <Edit className="w-4 h-4 text-primary" />
                </button>

                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  className="text-destructive disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingId === event.id ? (
                    <LoadingIndicator label="Deleting..." className="text-xs" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-destructive" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
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
