import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Save, ArrowLeft, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

interface MemberFormPageProps {
  mode: "create" | "edit";
}

type MemberRole = "GOVERNANCE" | "MANAGEMENT" | "MENTOR" | "ADVISOR";

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
  const [department, setDepartment] = useState("");
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

        const res = await fetch(`http://localhost:4000/api/admin/members/${memberId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        setName(data.name || "");
        setDesignation(data.designation || "");
        setRole(data.role || "MANAGEMENT");
        setDepartment(data.department || "");
        setEmail(data.email || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setOrder(data.order?.toString() || "");
        setIsActive(Boolean(data.isActive));
        setCurrentImageUrl(data.imageUrl || "");
        setCurrentImagePublicId(data.imagePublicId || "");
        setUploadedPhoto(data.imageUrl || null);
      } catch {
        toast.error("Failed to load member");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [mode, memberId, accessToken]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:4000/api/admin/upload/image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Image upload failed");
    }

    const data = await res.json();
    return {
      imageUrl: data.imageUrl as string,
      imagePublicId: data.publicId as string,
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

      const payload: Record<string, any> = {
        name: name.trim(),
        designation: designation.trim(),
        role,
        isActive,
      };

      if (department.trim()) payload.department = department.trim();
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

      const url =
        mode === "create"
          ? "http://localhost:4000/api/admin/members"
          : `http://localhost:4000/api/admin/members/${memberId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Request failed");
      }

      toast.success(
        mode === "create"
          ? "Member created successfully"
          : "Member updated successfully",
      );
      navigate("/dashboard/members");
    } catch (error: any) {
      toast.error(error?.message || (mode === "create" ? "Create failed" : "Update failed"));
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
                    htmlFor="department"
                    className="block text-foreground mb-2"
                  >
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Administration"
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
                Recommended: Square image, at least 400x400px
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
                  <Save className="w-4 h-4" />
                  {mode === "create" ? "Create Member" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/members")}
                  className="flex items-center justify-center gap-2 bg-muted text-foreground px-4 py-2.5 rounded-md hover:bg-accent transition-colors"
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
