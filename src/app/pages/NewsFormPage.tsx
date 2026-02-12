import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";

interface NewsFormPageProps {
  mode: "create" | "edit";
  newsId?: number;
}

export default function NewsFormPage({ mode, newsId }: NewsFormPageProps) {
  const navigate = useNavigate();
  const params = useParams();
  const resolvedNewsId =
    newsId ?? (params.newsId ? Number(params.newsId) : undefined);
  const [title, setTitle] = useState(
    mode === "edit" ? "Annual Day Celebration 2026 - Grand Success" : "",
  );
  const [excerpt, setExcerpt] = useState(
    mode === "edit"
      ? "Our annual day celebration was a spectacular event showcasing student talents and achievements."
      : "",
  );
  const [content, setContent] = useState(
    mode === "edit"
      ? "The annual day celebration held on February 5th, 2026 was a grand success with over 500 attendees..."
      : "",
  );
  const [isPublished, setIsPublished] = useState(mode === "edit");
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    mode === "edit"
      ? "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
      : null,
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const handleCancel = () => {
    navigate("/dashboard/news");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving news:", {
      title,
      excerpt,
      content,
      isPublished,
      uploadedImage,
      newsId: resolvedNewsId,
    });
    // Mock save logic
    alert(`News ${mode === "create" ? "created" : "updated"} successfully!`);
    handleCancel();
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News List
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Create New News" : "Edit News"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Add a new news article to your website"
            : "Update the news article details"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Field */}
            <div className="bg-card border border-border rounded-lg p-6">
              <label htmlFor="title" className="block text-foreground mb-2">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter news title..."
                required
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Excerpt Field */}
            <div className="bg-card border border-border rounded-lg p-6">
              <label htmlFor="excerpt" className="block text-foreground mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of the news..."
                rows={3}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                A short summary that will appear in news listings
              </p>
            </div>

            {/* Content Editor */}
            <div className="bg-card border border-border rounded-lg p-6">
              <label htmlFor="content" className="block text-foreground mb-2">
                Content <span className="text-destructive">*</span>
              </label>

              {/* Rich Text Editor Toolbar Placeholder */}
              <div className="border border-border rounded-t-md bg-muted p-2 flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded"
                  title="Heading"
                >
                  H
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded"
                  title="Link"
                >
                  Ã°Å¸â€â€” 
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded"
                  title="List"
                >
                  Ã¢â€°Â¡
                </button>
              </div>

              {/* Content Textarea */}
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your news content here..."
                required
                rows={12}
                className="w-full px-4 py-3 bg-input-background border border-border border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Rich text editor placeholder - In production, integrate a
                full-featured editor like TinyMCE or Quill
              </p>
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
                    <span className="text-green-600">Ã¢â€”Â Published</span>
                  ) : (
                    <span className="text-yellow-600">Ã¢â€”Â Draft</span>
                  )}
                </p>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Featured Image</h3>

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

            {/* Action Buttons */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                {mode === "create" ? "Create News" : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
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
