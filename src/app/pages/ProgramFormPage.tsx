import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  X,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  BookOpen,
  Clock,
  GraduationCap,
} from "lucide-react";

interface ProgramFormPageProps {
  mode: "create" | "edit";
}

interface Highlight {
  id: string;
  text: string;
}

export default function ProgramFormPage({ mode }: ProgramFormPageProps) {
  const navigate = useNavigate();
  const params = useParams();
  const resolvedProgramId = params.programId
    ? Number(params.programId)
    : undefined;
  const [title, setTitle] = useState(
    mode === "edit" ? "Bachelor of Science in Computer Science" : "",
  );
  const [description, setDescription] = useState(
    mode === "edit"
      ? "A comprehensive program designed to provide students with a strong foundation in computer science principles, programming, algorithms, and software development. This degree prepares graduates for successful careers in technology and innovation."
      : "",
  );
  const [category, setCategory] = useState(
    mode === "edit" ? "Undergraduate" : "Undergraduate",
  );
  const [duration, setDuration] = useState(mode === "edit" ? "4 Years" : "");
  const [applicationLink, setApplicationLink] = useState(
    mode === "edit" ? "https://example.com/apply/computer-science" : "",
  );
  const [isActive, setIsActive] = useState(mode === "edit" ? true : false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    mode === "edit"
      ? "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"
      : null,
  );

  const [highlights, setHighlights] = useState<Highlight[]>(
    mode === "edit"
      ? [
          {
            id: "1",
            text: "Industry-aligned curriculum with hands-on projects",
          },
          {
            id: "2",
            text: "State-of-the-art computer labs and infrastructure",
          },
          {
            id: "3",
            text: "Internship opportunities with leading tech companies",
          },
          { id: "4", text: "Expert faculty with industry experience" },
          { id: "5", text: "Strong placement record with top recruiters" },
        ]
      : [{ id: "1", text: "" }],
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

  const handleAddHighlight = () => {
    const newId = (
      Math.max(0, ...highlights.map((h) => parseInt(h.id))) + 1
    ).toString();
    setHighlights([...highlights, { id: newId, text: "" }]);
  };

  const handleRemoveHighlight = (id: string) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((h) => h.id !== id));
    }
  };

  const handleHighlightChange = (id: string, text: string) => {
    setHighlights(highlights.map((h) => (h.id === id ? { ...h, text } : h)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving program:", {
      title,
      description,
      category,
      duration,
      applicationLink,
      highlights: highlights.filter((h) => h.text.trim() !== ""),
      isActive,
      uploadedImage,
      programId: resolvedProgramId,
    });
    // Mock save logic
    alert(`Program ${mode === "create" ? "created" : "updated"} successfully!`);
    navigate("/dashboard/programs");
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/programs")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Programs List
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Create New Program" : "Edit Program"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Add a new academic program to your institution"
            : "Update the program information"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Basic Information</h3>

              {/* Title Field */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-foreground mb-2">
                  Program Title <span className="text-destructive">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              {/* Category and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-foreground mb-2"
                  >
                    Category <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                    >
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Doctorate">Doctorate</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="block text-foreground mb-2"
                  >
                    Duration <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="duration"
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 4 Years, 6 Months"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Description Field */}
              <div>
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
                  placeholder="Provide a detailed overview of the program..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Describe the program objectives, curriculum, and career
                  prospects
                </p>
              </div>
            </div>

            {/* Program Highlights */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground">Program Highlights</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add key features, benefits, or learning outcomes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Highlight
                </button>
              </div>

              <div className="space-y-3">
                {highlights.map((highlight, index) => (
                  <div key={highlight.id} className="flex items-start gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-2 text-muted-foreground mt-3">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-sm">{index + 1}.</span>
                      </div>
                      <input
                        type="text"
                        value={highlight.text}
                        onChange={(e) =>
                          handleHighlightChange(highlight.id, e.target.value)
                        }
                        placeholder="Enter program highlight or feature..."
                        className="flex-1 px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      {highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(highlight.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors flex-shrink-0"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Link */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Application Information</h3>
              <div>
                <label
                  htmlFor="applicationLink"
                  className="block text-foreground mb-2"
                >
                  External Application Link{" "}
                  <span className="text-muted-foreground text-sm">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="applicationLink"
                    type="url"
                    value={applicationLink}
                    onChange={(e) => setApplicationLink(e.target.value)}
                    placeholder="https://example.com/apply/program-name"
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Link to external application portal or admission form
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Status Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Program Status</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm mb-1">Visibility</p>
                  <p className="text-muted-foreground text-xs">
                    {isActive
                      ? "Active & accepting students"
                      : "Inactive & hidden"}
                  </p>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? "bg-primary" : "bg-switch-background"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {isActive ? (
                    <span className="text-green-600">● Active</span>
                  ) : (
                    <span className="text-yellow-600">● Inactive</span>
                  )}
                </p>
              </div>
            </div>

            {/* Program Image */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Program Image</h3>

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
                Recommended: 1200x800px (JPG, PNG)
              </p>
            </div>

            {/* Quick Preview */}
            {title && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-foreground mb-4">Quick Preview</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Program</p>
                      <p className="text-sm text-foreground">{title}</p>
                    </div>
                  </div>
                  {category && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Category
                        </p>
                        <p className="text-sm text-foreground">{category}</p>
                      </div>
                    </div>
                  )}
                  {duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm text-foreground">{duration}</p>
                      </div>
                    </div>
                  )}
                  {highlights.filter((h) => h.text.trim() !== "").length >
                    0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Highlights
                      </p>
                      <p className="text-sm text-foreground">
                        {highlights.filter((h) => h.text.trim() !== "").length}{" "}
                        item(s)
                      </p>
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
                {mode === "create" ? "Create Program" : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/programs")}
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
