import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  Folder,
  Calendar,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  deleteAdminGalleryAlbum,
  getAdminGalleryAlbums,
  getErrorMessage,
  toggleAdminGalleryAlbumStatus,
  type GalleryAlbumResponse,
  type GalleryCategory,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";

type GalleryAlbum = GalleryAlbumResponse;

const formatCategory = (category: GalleryCategory) =>
  category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function GalleryListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const data = await getAdminGalleryAlbums();
      setAlbums(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load galleries"));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to delete this album?",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteAdminGalleryAlbum(id);

      setAlbums((prev) => prev.filter((album) => album.id !== id));
      toast.success("Gallery deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setTogglingId(id);

      const data = await toggleAdminGalleryAlbumStatus(id);
      const updatedGallery = data.gallery;

      setAlbums((prev) =>
        prev.map((album) =>
          album.id === id ? { ...album, isActive: updatedGallery.isActive } : album,
        ),
      );

      toast.success("Gallery status updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Status update failed"));
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Gallery Albums</h1>
          <p className="text-muted-foreground">
            Manage photo albums and featured images
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/gallery/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create Album
        </button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Loading...</p>
      )}

      {albums.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground mb-2">No albums yet</p>
          <p className="text-muted-foreground text-sm">
            Create your first gallery album
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {albums.map((album) => {
            const coverUrl =
              album.coverImage?.imageUrl ||
              album.images[0]?.imageUrl ||
              "https://via.placeholder.com/800x450?text=No+Image";

            return (
              <div
                key={album.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => navigate(`/dashboard/gallery/${album.id}`)}
                  className="block w-full text-left"
                >
                  <div className="h-48 bg-muted overflow-hidden">
                    <img
                      src={coverUrl}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-foreground mb-1">{album.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {album.subtitle}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Folder className="w-3.5 h-3.5" />
                          <span>{formatCategory(album.category)}</span>
                        </div>
                      </div>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {album.images.length} photos
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Updated {formatDate(album.updatedAt)}</span>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          album.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {album.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="border-t border-border px-5 py-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/gallery/${album.id}`)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                    title="Open"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(album.id)}
                    disabled={togglingId === album.id}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                    title={album.isActive ? "Deactivate" : "Activate"}
                  >
                    {togglingId === album.id ? (
                      <LoadingIndicator label="Updating..." className="text-xs" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(album.id)}
                    disabled={deletingId === album.id}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {deletingId === album.id ? (
                      <LoadingIndicator label="Deleting..." className="text-xs" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
