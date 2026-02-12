import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Save, ArrowLeft, User } from "lucide-react";

interface MemberFormPageProps {
  mode: "create" | "edit";
}

export default function MemberFormPage({ mode }: MemberFormPageProps) {
  const navigate = useNavigate();
  const params = useParams();
  const resolvedMemberId = params.memberId ? Number(params.memberId) : undefined;
  const [name, setName] = useState(mode === "edit" ? "Dr. Sarah Johnson" : "");
  const [role, setRole] = useState(mode === "edit" ? "Principal" : "");
  const [email, setEmail] = useState(
    mode === "edit" ? "sarah.johnson@institution.edu" : "",
  );
  const [phone, setPhone] = useState(
    mode === "edit" ? "+1 (555) 123-4567" : "",
  );
  const [department, setDepartment] = useState(
    mode === "edit" ? "Administration" : "",
  );
  const [qualifications, setQualifications] = useState(
    mode === "edit"
      ? "Ph.D. in Educational Leadership, M.Ed. in Administration"
      : "",
  );
  const [bio, setBio] = useState(
    mode === "edit"
      ? "Dr. Sarah Johnson has over 20 years of experience in educational leadership and has been serving as Principal since 2020."
      : "",
  );
  const [isActive, setIsActive] = useState(mode === "edit" ? true : true);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(
    mode === "edit"
      ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
      : null,
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setUploadedPhoto(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving member:", {
      name,
      role,
      email,
      phone,
      department,
      qualifications,
      bio,
      isActive,
      uploadedPhoto,
      memberId: resolvedMemberId,
    });
    // Mock save logic
    alert(`Member ${mode === "create" ? "created" : "updated"} successfully!`);
    navigate("/dashboard/members");
  };

  return (
    <div className="p-8">
      {/* Page Header */}
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
            ? "Add a new faculty or staff member to your website"
            : "Update the member details"}
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

              <div className="space-y-4">
                {/* Name */}
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

                {/* Role/Position */}
                <div>
                  <label htmlFor="role" className="block text-foreground mb-2">
                    Role/Position <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Principal, Head of Department"
                    required
                  />
                </div>

                {/* Department */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-foreground mb-2"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select Department</option>
                    <option value="Administration">Administration</option>
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Arts">Arts</option>
                    <option value="Sports">Sports</option>
                    <option value="IT">Information Technology</option>
                    <option value="Library">Library</option>
                    <option value="Admissions">Admissions</option>
                  </select>
                </div>

                {/* Email */}
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

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Additional Information</h3>

              <div className="space-y-4">
                {/* Qualifications */}
                <div>
                  <label
                    htmlFor="qualifications"
                    className="block text-foreground mb-2"
                  >
                    Qualifications
                  </label>
                  <input
                    id="qualifications"
                    type="text"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Ph.D., M.Ed., B.Sc."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    List educational qualifications separated by commas
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-foreground mb-2">
                    Biography
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Enter a brief biography or professional summary..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bio.length} characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo Upload */}
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

            {/* Visibility Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Visibility</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm">Display on website</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show this member on the public website
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

            {/* Action Buttons */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
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
