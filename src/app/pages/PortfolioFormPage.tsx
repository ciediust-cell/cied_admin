import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  createAdminPortfolioItem,
  getAdminPortfolio,
  getErrorMessage,
  updateAdminPortfolioItem,
  type StartupSector,
  type StartupStage,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface PortfolioFormPageProps {
  mode: "create" | "edit";
}

const STAGE_OPTIONS: { label: string; value: StartupStage }[] = [
  { label: "Ideation", value: "IDEATION" },
  { label: "Early-stage", value: "EARLY_STAGE" },
  { label: "Growth", value: "GROWTH" },
];

const SECTOR_OPTIONS: { label: string; value: StartupSector }[] = [
  { label: "AI", value: "AI" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Agriculture", value: "AGRICULTURE" },
  { label: "HealthTech", value: "HEALTHTECH" },
  { label: "EdTech", value: "EDTECH" },
  { label: "E-commerce", value: "ECOMMERCE" },
  { label: "Social Impact", value: "SOCIAL_IMPACT" },
];

interface ExistingAwardImageDraft {
  id: string;
  imageUrl: string;
  caption: string;
}

interface NewAwardImageDraft {
  file: File;
  previewUrl: string;
  caption: string;
}

export default function PortfolioFormPage({ mode }: PortfolioFormPageProps) {
  const navigate = useNavigate();
  const { portfolioId } = useParams();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [stage, setStage] = useState<StartupStage>("IDEATION");
  const [sectors, setSectors] = useState<StartupSector[]>([]);
  const [founders, setFounders] = useState<string[]>([""]);
  const [achievements, setAchievements] = useState<string[]>([""]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [existingAwardImages, setExistingAwardImages] = useState<
    ExistingAwardImageDraft[]
  >([]);
  const [newAwardImages, setNewAwardImages] = useState<NewAwardImageDraft[]>([]);
  const newAwardImagesRef = useRef<NewAwardImageDraft[]>([]);

  useEffect(() => {
    newAwardImagesRef.current = newAwardImages;
  }, [newAwardImages]);

  useEffect(() => {
    return () => {
      newAwardImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !portfolioId || !accessToken) return;

    const fetchPortfolio = async () => {
      try {
        setLoading(true);

        const data = await getAdminPortfolio();
        const item = data.find((entry) => entry.id === portfolioId);

        if (!item) {
          toast.error("Startup not found");
          navigate("/dashboard/portfolio");
          return;
        }

        setName(item.name || "");
        setTagline(item.tagline || "");
        setDescription(item.description || "");
        setWebsiteUrl(item.websiteUrl || "");
        setStage(item.stage || "IDEATION");
        setSectors(item.sectors || []);
        setFounders(
          item.founders?.length ? item.founders.map((f) => f.name) : [""],
        );
        setAchievements(
          item.achievements?.length
            ? item.achievements.map((a) => a.text)
            : [""],
        );
        setCurrentLogo(item.logo || "");
        setLogoPreview(item.logo || null);
        setExistingAwardImages(
          (item.awardImages || []).map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            caption: image.caption || "",
          })),
        );
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load startup"));
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [mode, portfolioId, accessToken, navigate]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAwardImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewAwardImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        caption: "",
      })),
    ]);

    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    if (logoFile) {
      setLogoFile(null);
      setLogoPreview(currentLogo || null);
      return;
    }

    if (mode === "create") {
      setLogoPreview(null);
    }
  };

  const updateExistingAwardCaption = (id: string, caption: string) => {
    setExistingAwardImages((prev) =>
      prev.map((image) => (image.id === id ? { ...image, caption } : image)),
    );
  };

  const removeExistingAwardImage = (id: string) => {
    setExistingAwardImages((prev) => prev.filter((image) => image.id !== id));
  };

  const updateNewAwardCaption = (index: number, caption: string) => {
    setNewAwardImages((prev) =>
      prev.map((image, imageIndex) =>
        imageIndex === index ? { ...image, caption } : image,
      ),
    );
  };

  const removeNewAwardImage = (index: number) => {
    setNewAwardImages((prev) => {
      const image = prev[index];
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return prev.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const handleSectorToggle = (value: StartupSector) => {
    setSectors((prev) =>
      prev.includes(value)
        ? prev.filter((sector) => sector !== value)
        : [...prev, value],
    );
  };

  const setStringListValue = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string,
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addStringListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((prev) => [...prev, ""]);
  };

  const removeStringListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
  ) => {
    setter((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const foundersClean = useMemo(
    () => founders.map((item) => item.trim()).filter(Boolean),
    [founders],
  );
  const achievementsClean = useMemo(
    () => achievements.map((item) => item.trim()).filter(Boolean),
    [achievements],
  );

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

    if (!name.trim() || !tagline.trim() || !description.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!sectors.length) {
      toast.error("Select at least one sector.");
      return;
    }

    if (!foundersClean.length) {
      toast.error("Add at least one founder.");
      return;
    }

    if (!achievementsClean.length) {
      toast.error("Add at least one achievement.");
      return;
    }

    if (!isValidWebsite(websiteUrl)) {
      toast.error("Website URL must start with http:// or https://");
      return;
    }

    if (mode === "create" && !logoFile) {
      toast.error("Logo is required.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("tagline", tagline.trim());
      formData.append("description", description.trim());
      formData.append("stage", stage);

      if (websiteUrl.trim()) {
        formData.append("websiteUrl", websiteUrl.trim());
      }

      // Bracket notation keeps array shape in multipart parsing.
      sectors.forEach((sector) => formData.append("sectors[]", sector));
      foundersClean.forEach((founder) => formData.append("founders[]", founder));
      achievementsClean.forEach((achievement) =>
        formData.append("achievements[]", achievement),
      );
      existingAwardImages.forEach((image) => {
        formData.append("existingAwardImageIds[]", image.id);
        formData.append("existingAwardImageCaptions[]", image.caption.trim());
      });
      newAwardImages.forEach((image) => {
        formData.append("awardImages", image.file);
        formData.append("awardImageCaptions[]", image.caption.trim());
      });

      if (logoFile) {
        // Backend upload middleware expects this field name.
        formData.append("image", logoFile);
      }

      if (mode === "create") {
        await createAdminPortfolioItem(formData);
      } else if (portfolioId) {
        await updateAdminPortfolioItem(portfolioId, formData);
      }

      toast.success(
        mode === "create"
          ? "Startup added successfully"
          : "Startup updated successfully",
      );
      navigate("/dashboard/portfolio");
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
          onClick={() => navigate("/dashboard/portfolio")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio List
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Add Startup" : "Edit Startup"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Create a new portfolio startup entry"
            : "Update startup details"}
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Startup Information</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-foreground mb-2">
                    Startup Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., AgriPulse"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tagline" className="block text-foreground mb-2">
                    Tagline <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="One-line startup summary"
                    required
                  />
                </div>

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
                    rows={5}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Describe the startup, problem, solution, and value."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stage" className="block text-foreground mb-2">
                      Stage <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="stage"
                      value={stage}
                      onChange={(e) => setStage(e.target.value as StartupStage)}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      {STAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="websiteUrl"
                      className="block text-foreground mb-2"
                    >
                      Website URL
                    </label>
                    <input
                      id="websiteUrl"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <p className="block text-foreground mb-2">
                    Sectors <span className="text-destructive">*</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SECTOR_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-accent/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={sectors.includes(option.value)}
                          onChange={() => handleSectorToggle(option.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground">Founders</h3>
                <button
                  type="button"
                  onClick={() => addStringListItem(setFounders)}
                  className="text-sm text-primary hover:underline"
                >
                  + Add Founder
                </button>
              </div>

              <div className="space-y-3">
                {founders.map((value, index) => (
                  <div key={`founder-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setStringListValue(setFounders, index, e.target.value)
                      }
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder={`Founder ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeStringListItem(setFounders, index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      disabled={founders.length === 1}
                      title="Remove founder"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground">Achievements</h3>
                <button
                  type="button"
                  onClick={() => addStringListItem(setAchievements)}
                  className="text-sm text-primary hover:underline"
                >
                  + Add Achievement
                </button>
              </div>

              <div className="space-y-3">
                {achievements.map((value, index) => (
                  <div key={`achievement-${index}`} className="flex items-start gap-2">
                    <textarea
                      value={value}
                      onChange={(e) =>
                        setStringListValue(setAchievements, index, e.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      placeholder={`Achievement ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeStringListItem(setAchievements, index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      disabled={achievements.length === 1}
                      title="Remove achievement"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-foreground">Achievement Gallery</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload award photos, certificates, and recognition images.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Add Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAwardImagesUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {existingAwardImages.length === 0 && newAwardImages.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
                  No achievement images selected.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {existingAwardImages.map((image) => (
                    <div
                      key={image.id}
                      className="border border-border rounded-lg overflow-hidden bg-background"
                    >
                      <div className="relative">
                        <img
                          src={image.imageUrl}
                          alt={image.caption || "Achievement image"}
                          className="w-full aspect-video object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingAwardImage(image.id)}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={image.caption}
                        onChange={(e) =>
                          updateExistingAwardCaption(image.id, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-input-background border-t border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Optional caption"
                      />
                    </div>
                  ))}

                  {newAwardImages.map((image, index) => (
                    <div
                      key={image.previewUrl}
                      className="border border-border rounded-lg overflow-hidden bg-background"
                    >
                      <div className="relative">
                        <img
                          src={image.previewUrl}
                          alt={image.caption || "New achievement image"}
                          className="w-full aspect-video object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewAwardImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={image.caption}
                        onChange={(e) => updateNewAwardCaption(index, e.target.value)}
                        className="w-full px-3 py-2 bg-input-background border-t border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Optional caption"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Startup Logo</h3>

              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Startup logo"
                    className="w-full aspect-square object-cover rounded-lg border border-border"
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
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload startup logo
                  </p>
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Logo
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              )}

              <label className="mt-3 inline-flex text-sm text-primary cursor-pointer hover:underline">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logoPreview ? "Replace logo" : "Upload logo"}
              </label>
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
                      {mode === "create" ? "Create Startup" : "Save Changes"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/portfolio")}
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
