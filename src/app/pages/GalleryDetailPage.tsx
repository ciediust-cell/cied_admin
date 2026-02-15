import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Star,
  X,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

type GalleryCategory =
  | "INFRASTRUCTURE"
  | "EVENTS"
  | "WORKSPACE"
  | "FACILITIES"
  | "ACTIVITIES"
  | "OTHER";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
}

interface Gallery {
  id: string;
  title: string;
  subtitle: string;
  category: GalleryCategory;
  coverImageId: string | null;
  images: GalleryImage[];
}

const formatCategory = (category: GalleryCategory) =>
  category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function GalleryDetailPage() {
  const navigate = useNavigate();
  const { albumId } = useParams();
  const { accessToken } = useAuthStore();

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const fetchGallery = useCallback(async () => {
    if (!albumId || !accessToken) return;

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:4000/api/admin/gallery/${albumId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setGallery(data);
    } catch {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [albumId, accessToken]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const coverImageId = gallery?.coverImageId ?? null;

  const imagesWithCoverInfo = useMemo(() => {
    if (!gallery) return [];
    return gallery.images.map((image) => ({
      ...image,
      isCover: image.id === coverImageId,
    }));
  }, [gallery, coverImageId]);

  const handleSetCover = async (imageId: string) => {
    if (!gallery) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/gallery/${gallery.id}/cover/${imageId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setGallery((prev) =>
        prev ? { ...prev, coverImageId: data.gallery.coverImageId } : prev,
      );
      toast.success("Cover image updated");
    } catch {
      toast.error("Failed to set cover image");
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/gallery/image/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) throw new Error();

      setSelectedImage((prev) => (prev?.id === imageId ? null : prev));
      await fetchGallery();
      toast.success("Image deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !gallery) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      const res = await fetch(
        `http://localhost:4000/api/admin/gallery/${gallery.id}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Upload failed");
      }

      await fetchGallery();
      toast.success("Images uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (!gallery && loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Loading gallery...</p>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate("/dashboard/gallery")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </button>
        <p className="text-sm text-muted-foreground">Gallery not found.</p>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-2">{gallery.title}</h1>
            <p className="text-sm text-muted-foreground mb-2">{gallery.subtitle}</p>
            <div className="flex items-center gap-3">
              <span className="inline-flex px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                {formatCategory(gallery.category)}
              </span>
              <p className="text-muted-foreground text-sm">
                {gallery.images.length} {gallery.images.length === 1 ? "image" : "images"}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Images"}
          </label>
        </div>
      </div>

      {imagesWithCoverInfo.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground mb-2">No images in this album</p>
          <p className="text-muted-foreground text-sm mb-6">
            Upload images to get started
          </p>
          <label className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Upload className="w-4 h-4" />
            Upload Images
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagesWithCoverInfo.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.imageUrl}
                alt={`Gallery image ${image.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {image.isCover && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Cover</span>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetCover(image.id);
                  }}
                  className={`p-2.5 rounded-lg transition-colors ${
                    image.isCover
                      ? "bg-yellow-500 text-white"
                      : "bg-white/90 text-foreground hover:bg-white"
                  }`}
                  title={image.isCover ? "Current cover" : "Set as cover"}
                >
                  <Star className={`w-4 h-4 ${image.isCover ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image.id);
                  }}
                  className="p-2.5 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt="Full size preview"
              className="w-full h-full object-contain rounded-lg"
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg">
              <button
                onClick={() => handleSetCover(selectedImage.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  selectedImage.id === coverImageId
                    ? "bg-yellow-100 text-yellow-700"
                    : "hover:bg-gray-100 text-foreground"
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    selectedImage.id === coverImageId ? "fill-current" : ""
                  }`}
                />
                <span className="text-sm">
                  {selectedImage.id === coverImageId ? "Cover Image" : "Set as Cover"}
                </span>
              </button>
              <div className="w-px h-6 bg-border"></div>
              <button
                onClick={() => handleDelete(selectedImage.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {imagesWithCoverInfo.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h3 className="text-foreground mb-3">Quick Tips</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Click any image for full-size preview</p>
            <p>• Hover an image to set cover or delete</p>
            <p>• Cover image is shown on gallery listing page</p>
            <p>• Upload multiple images in one action</p>
          </div>
        </div>
      )}
    </div>
  );
}
