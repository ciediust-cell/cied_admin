import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

interface EventFormPageProps {
  mode: "create" | "edit";
}

export default function EventsFormPage({ mode }: EventFormPageProps) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // ✅ Fetch event for edit mode
  useEffect(() => {
    if (mode !== "edit" || !eventId || !accessToken) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:4000/api/admin/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!res.ok) throw new Error();

        const existing = await res.json();

        setTitle(existing.title);
        setDescription(existing.description || "");
        setLocation(existing.location || "");
        setIsPublished(existing.isPublished);
        setUploadedImage(existing.featuredImage || null);

        if (existing.eventDate) {
          const dateObj = new Date(existing.eventDate);
          setEventDate(dateObj.toISOString().split("T")[0]);
          setEventTime(dateObj.toISOString().split("T")[1]?.slice(0, 5));
        }

        setRegistrationUrl(existing.registrationUrl || "");
      } catch {
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [mode, eventId, accessToken]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setUploadedImage(null);
  };

  // ✅ Save (Create / Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!eventDate || !eventTime) {
      toast.error("Please select both date and time.");
      return;
    }

    if (mode === "create" && !imageFile) {
      toast.error("Event image is required.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append(
        "eventDate",
        new Date(`${eventDate}T${eventTime}`).toISOString(),
      );
      formData.append("isPublished", String(isPublished));

      if (location.trim()) formData.append("location", location.trim());
      if (registrationUrl.trim())
        formData.append("registrationUrl", registrationUrl.trim());
      if (imageFile) formData.append("image", imageFile);

      const url =
        mode === "create"
          ? "http://localhost:4000/api/admin/events"
          : `http://localhost:4000/api/admin/events/${eventId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Request failed");
      }

      toast.success(
        mode === "create"
          ? "Event created successfully"
          : "Event updated successfully",
      );

      navigate("/dashboard/events");
    } catch (error: any) {
      toast.error(
        error?.message || (mode === "create" ? "Create failed" : "Update failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/events")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events List
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Create New Event" : "Edit Event"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Add a new event to your institutional calendar"
            : "Update the event details"}
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Field */}
            <div className="bg-card border border-border rounded-lg p-6">
              <label htmlFor="title" className="block text-foreground mb-2">
                Event Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title..."
                required
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Description Field */}
            <div className="bg-card border border-border rounded-lg p-6">
              <label
                htmlFor="description"
                className="block text-foreground mb-2"
              >
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the event details..."
                required
                rows={6}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Provide a detailed description of what attendees can expect
              </p>
            </div>

            {/* Date and Time */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Event Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label
                    htmlFor="eventDate"
                    className="block text-foreground mb-2"
                  >
                    Date <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label
                    htmlFor="eventTime"
                    className="block text-foreground mb-2"
                  >
                    Time <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="eventTime"
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-card border border-border rounded-lg p-6">
              <label htmlFor="location" className="block text-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Main Auditorium, Sports Ground"
                  className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Additional Details</h3>
              <div className="space-y-4">
                {/* Registration Link */}
                <div>
                  <label
                    htmlFor="registrationUrl"
                    className="block text-foreground mb-2"
                  >
                    Registration Link{" "}
                    <span className="text-muted-foreground text-sm">
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="registrationUrl"
                      type="url"
                      value={registrationUrl}
                      onChange={(e) => setRegistrationUrl(e.target.value)}
                      placeholder="https://example.com/register"
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Add a link where attendees can register for the event
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Publish Settings</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm mb-1">Status</p>
                  <p className="text-muted-foreground text-xs">
                    {isPublished ? "Visible to public" : "Hidden from public"}
                  </p>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublished ? "bg-primary" : "bg-switch-background"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublished ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {isPublished ? (
                    <span className="text-green-600">● Published</span>
                  ) : (
                    <span className="text-yellow-600">● Draft</span>
                  )}
                </p>
              </div>
            </div>

            {/* Event Image */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Event Image</h3>

              {uploadedImage ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="w-full text-sm text-destructive hover:underline"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-foreground">Upload Image</p>
                      <p className="text-xs text-muted-foreground">
                        Click to browse
                      </p>
                    </div>
                  </div>
                </label>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                Recommended: 1200x630px (JPG, PNG)
              </p>
            </div>

            {/* Quick Info Preview */}
            {eventDate && eventTime && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-foreground mb-4">Event Preview</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm text-foreground">
                        {new Date(eventDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm text-foreground">
                        {new Date(`2000-01-01T${eventTime}`).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  {location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Location
                        </p>
                        <p className="text-sm text-foreground">{location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                {mode === "create" ? "Create Event" : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/events")}
                className="w-full bg-muted text-foreground px-4 py-3 rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
