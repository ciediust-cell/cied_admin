import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  createAdminGalleryAlbum,
  getErrorMessage,
  type GalleryCategory,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

const CATEGORY_OPTIONS: { label: string; value: GalleryCategory }[] = [
  { label: "Infrastructure", value: "INFRASTRUCTURE" },
  { label: "Events", value: "EVENTS" },
  { label: "Workspace", value: "WORKSPACE" },
  { label: "Facilities", value: "FACILITIES" },
  { label: "Activities", value: "ACTIVITIES" },
  { label: "Other", value: "OTHER" },
];

export default function GalleryFormPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("EVENTS");
  const [images, setImages] = useState<File[]>([]);

  const previews = useMemo(
    () => images.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [images],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!title.trim() || !subtitle.trim()) {
      toast.error("Title and subtitle are required.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("category", category);
      images.forEach((image) => formData.append("images", image));

      const data = await createAdminGalleryAlbum(formData);
      toast.success("Gallery album created successfully");

      navigate(`/dashboard/gallery/${data.gallery.id}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Create failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/gallery")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </button>
        <h1 className="text-foreground mb-2">Create Gallery Album</h1>
        <p className="text-muted-foreground">
          Add album info and optionally upload initial images
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <label htmlFor="title" className="block text-foreground mb-2">
                Album Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Annual Day Celebration 2026"
                required
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <label htmlFor="subtitle" className="block text-foreground mb-2">
                Subtitle <span className="text-destructive">*</span>
              </label>
              <textarea
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Short summary about this album..."
                rows={4}
                required
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <label htmlFor="category" className="block text-foreground mb-2">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Initial Images</h3>

              {previews.length > 0 ? (
                <div className="space-y-3">
                  {previews.map((preview, index) => (
                    <div
                      key={`${preview.name}-${index}`}
                      className="relative rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-foreground">Upload Images</p>
                      <p className="text-xs text-muted-foreground">
                        Click to browse (optional)
                      </p>
                    </div>
                  </div>
                </label>
              )}

              {previews.length > 0 && (
                <label className="mt-3 inline-flex text-sm text-primary cursor-pointer hover:underline">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  Add more images
                </label>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
                disabled={loading}
              >
                {loading ? (
                  <LoadingIndicator label="Saving..." />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Album
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/gallery")}
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
