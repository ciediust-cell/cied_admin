import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

interface EventItem {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  isPublished: boolean;
}

export function EventsListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:4000/api/admin/events", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setEvents(data);
      } catch {
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) fetchEvents();
  }, [accessToken]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:4000/api/admin/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error();

      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
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

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Loading...</p>
      )}

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

              <p className="text-sm text-muted-foreground mb-3">
                {event.location}
              </p>

              <span className="text-xs px-3 py-1 bg-muted rounded-full">
                {status}
              </span>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/dashboard/events/${event.id}/edit`)}
                >
                  <Edit className="w-4 h-4 text-primary" />
                </button>

                <button onClick={() => handleDelete(event.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
