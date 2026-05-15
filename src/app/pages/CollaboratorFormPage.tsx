import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Handshake, Save, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  createAdminCollaborator,
  getAdminCollaboratorById,
  getErrorMessage,
  updateAdminCollaborator,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";
import { getDownloadUrl } from "../lib/downloadUrl";

interface CollaboratorFormPageProps {
  mode: "create" | "edit";
}

export default function CollaboratorFormPage({ mode }: CollaboratorFormPageProps) {
  const navigate = useNavigate();
  const { collaboratorId } = useParams();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [order, setOrder] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [mouFile, setMouFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");
  const [currentMouUrl, setCurrentMouUrl] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !collaboratorId || !accessToken) return;

    const fetchCollaborator = async () => {
      try {
        setLoading(true);
        const data = await getAdminCollaboratorById(collaboratorId);
        setName(data.name || "");
        setWebsiteUrl(data.websiteUrl || "");
        setOrder(data.order?.toString() || "");
        setIsActive(Boolean(data.isActive));
        setCurrentLogoUrl(data.logoUrl || "");
        setCurrentMouUrl(data.mouUrl || "");
        setLogoPreview(data.logoUrl || null);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load collaborator"));
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborator();
  }, [accessToken, collaboratorId, mode]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMouUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMouFile(file);
  };

  const handleRemoveLogo = () => {
    if (logoFile) {
      setLogoFile(null);
      setLogoPreview(currentLogoUrl || null);
      return;
    }

    if (mode === "create") {
      setLogoPreview(null);
    }
  };

  const isValidWebsite = (url: string) => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!name.trim()) {
      toast.error("Organization name is required.");
      return;
    }

    if (!isValidWebsite(websiteUrl)) {
      toast.error("Website URL must start with http:// or https://");
      return;
    }

    if (order.trim() && Number.isNaN(Number(order))) {
      toast.error("Order must be a number.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("isActive", String(isActive));
      if (websiteUrl.trim()) formData.append("websiteUrl", websiteUrl.trim());
      if (order.trim()) formData.append("order", order.trim());
      if (logoFile) formData.append("logo", logoFile);
      if (mouFile) formData.append("mou", mouFile);

      if (mode === "create") {
        await createAdminCollaborator(formData);
      } else if (collaboratorId) {
        await updateAdminCollaborator(collaboratorId, formData);
      }

      toast.success(
        mode === "create"
          ? "Collaborator created successfully"
          : "Collaborator updated successfully",
      );
      navigate("/dashboard/collaborators");
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
          onClick={() => navigate("/dashboard/collaborators")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collaborators
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Add Collaborator" : "Edit Collaborator"}
        </h1>
        <p className="text-muted-foreground">
          Manage official collaboration details shown on the public website
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Processing...</p>}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Organization Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-foreground mb-2">
                    Organization Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., IIT Jammu"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="websiteUrl" className="block text-foreground mb-2">
                    Website URL
                  </label>
                  <input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="https://example.org"
                  />
                </div>

                <div>
                  <label htmlFor="order" className="block text-foreground mb-2">
                    Display Order
                  </label>
                  <input
                    id="order"
                    type="number"
                    min={0}
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., 1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Logo</h3>
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Collaborator logo"
                    className="w-full aspect-video object-contain rounded-lg border border-border bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                    title="Remove logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload organization logo
                  </p>
                </div>
              )}

              <label className="mt-3 inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                <Upload className="w-4 h-4" />
                {logoPreview ? "Replace logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">MoU Attachment</h3>
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {mouFile?.name ||
                        (currentMouUrl ? "Existing MoU uploaded" : "No MoU uploaded")}
                    </p>
                    {currentMouUrl && !mouFile && (
                      <a
                        href={getDownloadUrl(currentMouUrl)}
                        download
                        className="text-xs text-primary hover:underline"
                      >
                        Download existing MoU
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                <Upload className="w-4 h-4" />
                {currentMouUrl || mouFile ? "Replace MoU" : "Upload MoU"}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleMouUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm">Display on website</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show this collaborator publicly
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? "bg-primary" : "bg-muted"
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
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingIndicator label="Saving..." />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mode === "create" ? "Create Collaborator" : "Save Changes"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/collaborators")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-muted text-foreground px-4 py-2.5 rounded-md hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
