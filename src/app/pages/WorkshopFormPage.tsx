import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  createAdminWorkshop,
  getAdminWorkshopById,
  getErrorMessage,
  updateAdminWorkshop,
  type WorkshopDetailResponse,
  type WorkshopImageResponse,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface WorkshopFormPageProps {
  mode: "create" | "edit";
}

interface ExistingWorkshopImageDraft {
  id: string;
  imageUrl: string;
  caption: string;
}

interface NewWorkshopImageDraft {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
}

const makeId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const mapImage = (image: WorkshopImageResponse): ExistingWorkshopImageDraft => ({
  id: image.id,
  imageUrl: image.imageUrl,
  caption: image.caption || "",
});

export default function WorkshopFormPage({ mode }: WorkshopFormPageProps) {
  const navigate = useNavigate();
  const { workshopId } = useParams();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workshopDate, setWorkshopDate] = useState("");
  const [workshopTime, setWorkshopTime] = useState("");
  const [venue, setVenue] = useState("");
  const [speakerName, setSpeakerName] = useState("");
  const [speakerDesignation, setSpeakerDesignation] = useState("");
  const [speakerBio, setSpeakerBio] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [existingImages, setExistingImages] = useState<ExistingWorkshopImageDraft[]>([]);
  const [newImages, setNewImages] = useState<NewWorkshopImageDraft[]>([]);
  const newImagesRef = useRef<NewWorkshopImageDraft[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  useEffect(() => {
    newImagesRef.current = newImages;
  }, [newImages]);

  useEffect(() => {
    return () => {
      newImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !workshopId || !accessToken) return;

    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        const existing = (await getAdminWorkshopById(workshopId)) as WorkshopDetailResponse;

        setTitle(existing.title || "");
        setDescription(existing.description || "");
        setVenue(existing.venue || "");
        setSpeakerName(existing.speakerName || "");
        setSpeakerDesignation(existing.speakerDesignation || "");
        setSpeakerBio(existing.speakerBio || "");
        setRegistrationUrl(existing.registrationUrl || "");
        setReferenceUrl(existing.referenceUrl || "");
        setIsPublished(Boolean(existing.isPublished));

        if (existing.workshopDate) {
          const date = new Date(existing.workshopDate);
          setWorkshopDate(date.toISOString().split("T")[0]);
          setWorkshopTime(date.toISOString().split("T")[1]?.slice(0, 5) || "");
        }

        setExistingImages((existing.images || []).map(mapImage));
        setDeletedImageIds([]);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load workshop"));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [mode, workshopId, accessToken]);

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: makeId(),
        file,
        previewUrl: URL.createObjectURL(file),
        caption: "",
      })),
    ]);

    e.target.value = "";
  };

  const updateExistingCaption = (id: string, caption: string) => {
    setExistingImages((prev) =>
      prev.map((image) => (image.id === id ? { ...image, caption } : image)),
    );
  };

  const updateNewCaption = (id: string, caption: string) => {
    setNewImages((prev) =>
      prev.map((image) => (image.id === id ? { ...image, caption } : image)),
    );
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== id));
    setDeletedImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeNewImage = (id: string) => {
    setNewImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!title.trim() || !description.trim() || !workshopDate || !workshopTime || !venue.trim() || !speakerName.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append(
        "workshopDate",
        new Date(`${workshopDate}T${workshopTime}`).toISOString(),
      );
      formData.append("venue", venue.trim());
      formData.append("speakerName", speakerName.trim());
      formData.append("isPublished", String(isPublished));

      if (speakerDesignation.trim()) {
        formData.append("speakerDesignation", speakerDesignation.trim());
      }
      if (speakerBio.trim()) {
        formData.append("speakerBio", speakerBio.trim());
      }
      if (registrationUrl.trim()) {
        formData.append("registrationUrl", registrationUrl.trim());
      }
      if (referenceUrl.trim()) {
        formData.append("referenceUrl", referenceUrl.trim());
      }

      existingImages.forEach((image) => {
        formData.append("retainedImageIds[]", image.id);
        formData.append("existingImageCaptions[]", image.caption.trim());
      });

      deletedImageIds.forEach((id) => {
        formData.append("deletedImageIds[]", id);
      });

      newImages.forEach((image, index) => {
        formData.append(
          "images[]",
          JSON.stringify({
            caption: image.caption.trim(),
            imageFileIndex: index,
            order: index,
          }),
        );
        formData.append("images", image.file);
      });

      if (mode === "create") {
        await createAdminWorkshop(formData);
      } else if (workshopId) {
        await updateAdminWorkshop(workshopId, formData);
      }

      toast.success(
        mode === "create"
          ? "Workshop created successfully"
          : "Workshop updated successfully",
      );
      navigate("/dashboard/workshops");
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, mode === "create" ? "Create failed" : "Update failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/workshops")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workshops
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Create New Workshop" : "Edit Workshop"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Add a new workshop with speakers, links, and images"
            : "Update workshop content and media"}
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Processing...</p>}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-foreground mb-2">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Workshop title"
                />
              </div>

              <div>
                <label className="block text-foreground mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Describe the workshop"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground mb-2">Date *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      value={workshopDate}
                      onChange={(e) => setWorkshopDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-foreground mb-2">Time *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="time"
                      value={workshopTime}
                      onChange={(e) => setWorkshopTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <label className="block text-foreground mb-2">Venue *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Main auditorium, online, etc."
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Speaker / Trainer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground mb-2">Name *</label>
                  <input
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Speaker or trainer name"
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2">Designation</label>
                  <input
                    value={speakerDesignation}
                    onChange={(e) => setSpeakerDesignation(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Designation or role"
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2">Bio</label>
                  <textarea
                    value={speakerBio}
                    onChange={(e) => setSpeakerBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Short trainer bio"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground mb-2">Registration Link</label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={registrationUrl}
                      onChange={(e) => setRegistrationUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="https://example.com/register"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-foreground mb-2">Reference Link</label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="https://example.com/reference"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground">Workshop Images</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload multiple images and add captions
                  </p>
                </div>
                <label className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Add Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImages}
                    className="hidden"
                  />
                </label>
              </div>

              {existingImages.length === 0 && newImages.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No workshop images added yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      className="border border-border rounded-lg p-4 flex gap-4"
                    >
                      <img
                        src={image.imageUrl}
                        alt="Workshop"
                        className="w-28 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 space-y-3">
                        <input
                          value={image.caption}
                          onChange={(e) => updateExistingCaption(image.id, e.target.value)}
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Caption"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md h-fit"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {newImages.map((image) => (
                    <div
                      key={image.id}
                      className="border border-border rounded-lg p-4 flex gap-4"
                    >
                      <img
                        src={image.previewUrl}
                        alt="Workshop preview"
                        className="w-28 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 space-y-3">
                        <input
                          value={image.caption}
                          onChange={(e) => updateNewCaption(image.id, e.target.value)}
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Caption"
                        />
                        <p className="text-xs text-muted-foreground">{image.file.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(image.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md h-fit"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Publish Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm mb-1">Status</p>
                  <p className="text-muted-foreground text-xs">
                    {isPublished ? "Visible to public" : "Hidden from public"}
                  </p>
                </div>
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
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Quick Preview</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                {title && (
                  <p className="text-foreground">
                    {title}
                  </p>
                )}
                {workshopDate && workshopTime && (
                  <p>
                    {new Date(`${workshopDate}T${workshopTime}`).toLocaleString()}
                  </p>
                )}
                {venue && <p>{venue}</p>}
                {speakerName && <p>{speakerName}</p>}
                <p>{existingImages.length + newImages.length} image(s)</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingIndicator label="Saving..." />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {mode === "create" ? "Create Workshop" : "Save Changes"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/workshops")}
                disabled={loading}
                className="w-full bg-muted text-foreground px-4 py-3 rounded-md hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
