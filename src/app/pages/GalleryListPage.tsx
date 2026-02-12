import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit,
  Folder,
  Calendar,
} from "lucide-react";

interface GalleryAlbum {
  id: number;
  title: string;
  category: string;
  coverUrl: string;
  imageCount: number;
  updatedAt: string;
}

const mockAlbums: GalleryAlbum[] = [
  {
    id: 1,
    title: "Annual Day Celebration 2026",
    category: "Events",
    coverUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    imageCount: 24,
    updatedAt: "2026-02-06",
  },
  {
    id: 2,
    title: "Sports Day Highlights",
    category: "Sports",
    coverUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    imageCount: 18,
    updatedAt: "2026-01-30",
  },
  {
    id: 3,
    title: "Science Exhibition",
    category: "Academics",
    coverUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    imageCount: 12,
    updatedAt: "2026-01-22",
  },
];

export default function GalleryListPage() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<GalleryAlbum[]>(mockAlbums);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this album?")) {
      setAlbums(albums.filter((album) => album.id !== id));
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
      {/* Page Header */}
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
          {albums.map((album) => (
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
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-foreground mb-1">{album.title}</h3>
                      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Folder className="w-3.5 h-3.5" />
                        <span>{album.category}</span>
                      </div>
                    </div>
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {album.imageCount} photos
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated {formatDate(album.updatedAt)}</span>
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
                  onClick={() => navigate(`/dashboard/gallery/${album.id}`)}
                  className="p-2 text-muted-foreground hover:bg-accent rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(album.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
