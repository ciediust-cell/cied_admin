import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Image as ImageIcon,
  ListPlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  createAdminFacility,
  getAdminFacilityById,
  getErrorMessage,
  updateAdminFacility,
  type FacilityImageResponse,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface FacilityFormPageProps {
  mode: "create" | "edit";
}

interface ExistingFacilityImageDraft {
  id: string;
  imageUrl: string;
  caption: string;
}

interface NewFacilityImageDraft {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
}

const placeholderResources = [
  "AI/ML workstations",
  "3D printers and fabrication tools",
  "IoT prototyping kits",
];

const makeId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const mapImage = (image: FacilityImageResponse): ExistingFacilityImageDraft => ({
  id: image.id,
  imageUrl: image.imageUrl,
  caption: image.caption || "",
});

export default function FacilityFormPage({ mode }: FacilityFormPageProps) {
  const navigate = useNavigate();
  const { facilityId } = useParams();
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [usageDetails, setUsageDetails] = useState("");
  const [resources, setResources] = useState<string[]>([""]);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState("0");
  const [existingImages, setExistingImages] = useState<ExistingFacilityImageDraft[]>([]);
  const [newImages, setNewImages] = useState<NewFacilityImageDraft[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const newImagesRef = useRef<NewFacilityImageDraft[]>([]);

  useEffect(() => {
    newImagesRef.current = newImages;
  }, [newImages]);

  useEffect(() => {
    return () => {
      newImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !facilityId || !accessToken) return;

    const fetchFacility = async () => {
      try {
        setLoading(true);
        const existing = await getAdminFacilityById(facilityId);
        setName(existing.name || "");
        setDescription(existing.description || "");
        setPurpose(existing.purpose || "");
        setUsageDetails(existing.usageDetails || "");
        setResources(existing.resources.length > 0 ? existing.resources : [""]);
        setIsActive(Boolean(existing.isActive));
        setOrder(String(existing.order ?? 0));
        setExistingImages((existing.images || []).map(mapImage));
        setDeletedImageIds([]);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load facility"));
      } finally {
        setLoading(false);
      }
    };

    void fetchFacility();
  }, [mode, facilityId, accessToken]);

  const handleNewImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
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

    event.target.value = "";
  };

  const updateResource = (index: number, value: string) => {
    setResources((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addResource = () => setResources((prev) => [...prev, ""]);

  const removeResource = (index: number) => {
    setResources((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length > 0 ? next : [""];
    });
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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!name.trim() || !description.trim()) {
      toast.error("Please add a facility name and description.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("isActive", String(isActive));
      formData.append("order", order || "0");

      if (purpose.trim()) formData.append("purpose", purpose.trim());
      if (usageDetails.trim()) formData.append("usageDetails", usageDetails.trim());

      resources
        .map((resource) => resource.trim())
        .filter(Boolean)
        .forEach((resource) => formData.append("resources[]", resource));

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
        await createAdminFacility(formData);
      } else if (facilityId) {
        await updateAdminFacility(facilityId, formData);
      }

      toast.success(
        mode === "create"
          ? "Facility created successfully"
          : "Facility updated successfully",
      );
      navigate("/dashboard/facilities");
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
          onClick={() => navigate("/dashboard/facilities")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Facilities
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Create New Facility" : "Edit Facility"}
        </h1>
        <p className="text-muted-foreground">
          Add lab details, available equipment, usage notes, and images
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Processing...</p>}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-foreground mb-2">Facility / Lab Name *</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="AICTE Idea Lab"
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Describe the facility and what it enables"
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Purpose</label>
                <textarea
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Prototyping, training, product development, research support..."
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Related Program / Usage Details</label>
                <textarea
                  value={usageDetails}
                  onChange={(event) => setUsageDetails(event.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Who can use it, related programs, booking process, training notes..."
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground">Equipment / Resources</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add simple bullet-list items for public display
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addResource}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                >
                  <ListPlus className="w-4 h-4" />
                  Add Resource
                </button>
              </div>
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={resource}
                      onChange={(event) => updateResource(index, event.target.value)}
                      className="flex-1 px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder={placeholderResources[index % placeholderResources.length]}
                    />
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                      title="Remove resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground">Facility Images</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload multiple photos and add captions
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
                    No facility images added yet.
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
                        alt="Facility"
                        className="w-28 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <input
                        value={image.caption}
                        onChange={(event) => updateExistingCaption(image.id, event.target.value)}
                        className="flex-1 px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-fit"
                        placeholder="Caption"
                      />
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
                        alt="Facility preview"
                        className="w-28 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 space-y-3">
                        <input
                          value={image.caption}
                          onChange={(event) => updateNewCaption(image.id, event.target.value)}
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
              <h3 className="text-foreground mb-4">Visibility</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm mb-1">Status</p>
                  <p className="text-muted-foreground text-xs">
                    {isActive ? "Visible to public" : "Hidden from public"}
                  </p>
                </div>
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
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Display Order</h3>
              <input
                type="number"
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Quick Preview</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{name || "Facility name"}</span>
                </div>
                <p>{resources.filter((item) => item.trim()).length} resource item(s)</p>
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
                    {mode === "create" ? "Create Facility" : "Save Changes"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/facilities")}
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
