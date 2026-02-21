import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Save, ArrowLeft, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  createAdminMember,
  getAdminMemberById,
  getErrorMessage,
  updateAdminMember,
  uploadAdminImage,
  type MemberRole,
  type MemberUpsertPayload,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface MemberFormPageProps {
  mode: "create" | "edit";
}

const MAX_MEMBER_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

const ROLE_OPTIONS: { label: string; value: MemberRole }[] = [
  { label: "Governance", value: "GOVERNANCE" },
  { label: "Management", value: "MANAGEMENT" },
  { label: "Mentor", value: "MENTOR" },
  { label: "Advisor", value: "ADVISOR" },
];

export default function MemberFormPage({ mode }: MemberFormPageProps) {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState<MemberRole>("MANAGEMENT");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [order, setOrder] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [currentImagePublicId, setCurrentImagePublicId] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !memberId || !accessToken) return;

    const fetchMember = async () => {
      try {
        setLoading(true);

        const data = await getAdminMemberById(memberId);

        setName(data.name || "");
        setDesignation(data.designation || "");
        setRole(data.role || "MANAGEMENT");
        setDescription(data.description || "");
        setEmail(data.email || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setOrder(data.order?.toString() || "");
        setIsActive(Boolean(data.isActive));
        setCurrentImageUrl(data.imageUrl || "");
        setCurrentImagePublicId(data.imagePublicId || "");
        setUploadedPhoto(data.imageUrl || null);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load member"));
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [mode, memberId, accessToken]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_MEMBER_IMAGE_SIZE_BYTES) {
      toast.error("Image is too large. Please upload an image up to 4MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (imageFile) {
      setImageFile(null);
      setUploadedPhoto(currentImageUrl || null);
      return;
    }

    if (mode === "create") {
      setUploadedPhoto(null);
      return;
    }

    toast.error("Upload a new photo to replace the existing one.");
  };

  const uploadImage = async (file: File) => {
    const data = await uploadAdminImage(file);
    return {
      imageUrl: data.imageUrl,
      imagePublicId: data.publicId,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!name.trim() || !designation.trim() || !role) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      let finalImageUrl = currentImageUrl;
      let finalImagePublicId = currentImagePublicId;

      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        finalImageUrl = uploaded.imageUrl;
        finalImagePublicId = uploaded.imagePublicId;
      }

      if (mode === "create" && (!finalImageUrl || !finalImagePublicId)) {
        toast.error("Profile photo is required.");
        return;
      }

      const payload: MemberUpsertPayload = {
        name: name.trim(),
        designation: designation.trim(),
        role,
        isActive,
      };

      if (description.trim()) payload.description = description.trim();
      if (email.trim()) payload.email = email.trim();
      if (linkedinUrl.trim()) payload.linkedinUrl = linkedinUrl.trim();

      if (order.trim()) {
        const parsedOrder = Number(order);
        if (Number.isNaN(parsedOrder)) {
          toast.error("Order must be a number.");
          return;
        }
        payload.order = parsedOrder;
      }

      if (finalImageUrl && finalImagePublicId) {
        payload.imageUrl = finalImageUrl;
        payload.imagePublicId = finalImagePublicId;
      }

      if (mode === "create") {
        await createAdminMember(payload);
      } else if (memberId) {
        await updateAdminMember(memberId, payload);
      }

      toast.success(
        mode === "create"
          ? "Member created successfully"
          : "Member updated successfully",
      );
      navigate("/dashboard/members");
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
          onClick={() => navigate("/dashboard/members")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members List
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Add New Member" : "Edit Member"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Add a new member to your website"
            : "Update member details"}
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-foreground mb-2">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="designation"
                    className="block text-foreground mb-2"
                  >
                    Designation <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Principal, Program Manager"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-foreground mb-2">
                    Member Role <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as MemberRole)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-foreground mb-2"
                  >
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Startup mentor and incubation specialist"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Contact & Links</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="email@institution.edu"
                  />
                </div>

                <div>
                  <label
                    htmlFor="linkedinUrl"
                    className="block text-foreground mb-2"
                  >
                    LinkedIn URL
                  </label>
                  <input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Profile Photo</h3>

              {uploadedPhoto ? (
                <div className="relative">
                  <img
                    src={uploadedPhoto}
                    alt="Member photo"
                    className="w-full aspect-square object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="flex justify-center mb-3">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a professional photo
                  </p>
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Photo
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                Recommended: Square image, at least 400x400px, max 4MB
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Display Settings</h3>

              <div className="space-y-4">
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

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground text-sm">Display on website</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show this member publicly
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
                      {mode === "create" ? "Create Member" : "Save Changes"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/members")}
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
