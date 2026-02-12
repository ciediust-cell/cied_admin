import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Star,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface GalleryImage {
  id: number;
  url: string;
  isCover: boolean;
}

export default function GalleryDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const albumId = params.albumId ? Number(params.albumId) : 0;
  // Mock album data based on ID
  const albumTitle =
    albumId === 1 ? "Annual Day Celebration 2026" : "Gallery Album";
  const albumCategory = albumId === 1 ? "Events" : "General";

  const [images, setImages] = useState<GalleryImage[]>([
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      isCover: true,
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
      isCover: false,
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
      isCover: false,
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      isCover: false,
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
      isCover: false,
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
      isCover: false,
    },
    {
      id: 7,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      isCover: false,
    },
    {
      id: 8,
      url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
      isCover: false,
    },
    {
      id: 9,
      url: "https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800",
      isCover: false,
    },
    {
      id: 10,
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
      isCover: false,
    },
    {
      id: 11,
      url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
      isCover: false,
    },
    {
      id: 12,
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
      isCover: false,
    },
  ]);

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSetCover = (id: number) => {
    setImages(
      images.map((img) => ({
        ...img,
        isCover: img.id === id,
      })),
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      const imageToDelete = images.find((img) => img.id === id);
      const wasCover = imageToDelete?.isCover;

      const updatedImages = images.filter((img) => img.id !== id);

      // If deleted image was cover, set first image as new cover
      if (wasCover && updatedImages.length > 0) {
        updatedImages[0].isCover = true;
      }

      setImages(updatedImages);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newImages: GalleryImage[] = Array.from(files).map(
        (file, index) => ({
          id: Math.max(...images.map((img) => img.id), 0) + index + 1,
          url: URL.createObjectURL(file),
          isCover: false,
        }),
      );

      setImages([...images, ...newImages]);
      setIsUploading(false);
    }, 1000);
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
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
            <h1 className="text-foreground mb-2">{albumTitle}</h1>
            <div className="flex items-center gap-3">
              <span className="inline-flex px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                {albumCategory}
              </span>
              <p className="text-muted-foreground text-sm">
                {images.length} {images.length === 1 ? "image" : "images"}
              </p>
            </div>
          </div>

          {/* Upload Button */}
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

      {/* Images Grid */}
      {images.length === 0 ? (
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
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              {/* Image */}
              <img
                src={image.url}
                alt={`Gallery image ${image.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Cover Badge */}
              {image.isCover && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Cover</span>
                  </div>
                </div>
              )}

              {/* Hover Overlay with Actions */}
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
                  <Star
                    className={`w-4 h-4 ${image.isCover ? "fill-current" : ""}`}
                  />
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

      {/* Image Preview Modal */}
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
              src={selectedImage.url}
              alt="Full size preview"
              className="w-full h-full object-contain rounded-lg"
            />

            {/* Actions Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg">
              <button
                onClick={() => {
                  handleSetCover(selectedImage.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  selectedImage.isCover
                    ? "bg-yellow-100 text-yellow-700"
                    : "hover:bg-gray-100 text-foreground"
                }`}
              >
                <Star
                  className={`w-4 h-4 ${selectedImage.isCover ? "fill-current" : ""}`}
                />
                <span className="text-sm">
                  {selectedImage.isCover ? "Cover Image" : "Set as Cover"}
                </span>
              </button>
              <div className="w-px h-6 bg-border"></div>
              <button
                onClick={() => {
                  handleDelete(selectedImage.id);
                  handleCloseModal();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {images.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h3 className="text-foreground mb-3">Quick Tips</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Click on any image to view it in full size</p>
            <p>
              • Hover over images to access actions (set as cover or delete)
            </p>
            <p>
              • The cover image will be displayed on the gallery overview page
            </p>
            <p>• You can upload multiple images at once</p>
          </div>
        </div>
      )}
    </div>
  );
}
