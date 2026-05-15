import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  BookOpen,
  Clock,
  GraduationCap,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  createAdminProgram,
  getAdminProgramById,
  getErrorMessage,
  updateAdminProgram,
  type ProgramApplicationStepResponse,
  type ProgramHighlightResponse,
  type ProgramSuccessStoryResponse,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface ProgramFormPageProps {
  mode: "create" | "edit";
}

interface TextItem {
  id: string;
  text: string;
}

interface ExistingDocumentDraft {
  id: string;
  title: string;
  fileUrl: string;
}

interface NewDocumentDraft {
  file: File;
  title: string;
  previewUrl: string;
}

interface SuccessStoryDraft {
  id: string;
  source: "existing" | "new";
  participantName: string;
  participantRole: string;
  storyTitle: string;
  successStory: string;
  achievementHighlights: string;
  startupOutcome: string;
  testimonial: string;
  imageFile: File | null;
  imagePreview: string | null;
  existingImageUrl: string | null;
  existingImagePublicId: string | null;
  removeImage: boolean;
  isActive: boolean;
}

export default function ProgramFormPage({ mode }: ProgramFormPageProps) {
  const navigate = useNavigate();
  const { programId } = useParams();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [overview, setOverview] = useState("");
  const [duration, setDuration] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [icon, setIcon] = useState("");
  const [applyEnabled, setApplyEnabled] = useState(false);
  const [applyUrl, setApplyUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState<string | null>(null);
  const [removeBannerImage, setRemoveBannerImage] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<
    ExistingDocumentDraft[]
  >([]);
  const [newDocuments, setNewDocuments] = useState<NewDocumentDraft[]>([]);
  const [deletedSuccessStoryIds, setDeletedSuccessStoryIds] = useState<string[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStoryDraft[]>([
    {
      id: "1",
      source: "new",
      participantName: "",
      participantRole: "",
      storyTitle: "",
      successStory: "",
      achievementHighlights: "",
      startupOutcome: "",
      testimonial: "",
      imageFile: null,
      imagePreview: null,
      existingImageUrl: null,
      existingImagePublicId: null,
      removeImage: false,
      isActive: true,
    },
  ]);
  const newDocumentsRef = useRef<NewDocumentDraft[]>([]);
  const successStoriesRef = useRef<SuccessStoryDraft[]>([]);

  const [highlights, setHighlights] = useState<TextItem[]>([
    { id: "1", text: "" },
  ]);
  const [applicationSteps, setApplicationSteps] = useState<TextItem[]>([
    { id: "1", text: "" },
  ]);

  const nextId = (items: TextItem[]) =>
    (
      Math.max(0, ...items.map((item) => Number.parseInt(item.id, 10) || 0)) + 1
    ).toString();

  const mapToTextItems = (
    items: Array<ProgramHighlightResponse | ProgramApplicationStepResponse> | undefined,
    key: "text" | "description",
  ): TextItem[] => {
    if (!Array.isArray(items) || items.length === 0) {
      return [{ id: "1", text: "" }];
    }

    return items.map((item, index) => ({
      id: String(index + 1),
      text: typeof item?.[key] === "string" ? item[key] : "",
    }));
  };

  const createEmptyStory = (
    id: string,
    source: "existing" | "new" = "new",
  ): SuccessStoryDraft => ({
    id,
    source,
    participantName: "",
    participantRole: "",
    storyTitle: "",
    successStory: "",
    achievementHighlights: "",
    startupOutcome: "",
    testimonial: "",
    imageFile: null,
    imagePreview: null,
    existingImageUrl: null,
    existingImagePublicId: null,
    removeImage: false,
    isActive: true,
  });

  const mapExistingStory = (
    story: ProgramSuccessStoryResponse,
    index: number,
  ): SuccessStoryDraft => ({
    id: story.id || String(index + 1),
    source: "existing",
    participantName: story.participantName || "",
    participantRole: story.participantRole || "",
    storyTitle: story.storyTitle || "",
    successStory: story.successStory || "",
    achievementHighlights: story.achievementHighlights || "",
    startupOutcome: story.startupOutcome || "",
    testimonial: story.testimonial || "",
    imageFile: null,
    imagePreview: story.imageUrl || null,
    existingImageUrl: story.imageUrl || null,
    existingImagePublicId: story.imagePublicId || null,
    removeImage: false,
    isActive: Boolean(story.isActive),
  });

  useEffect(() => {
    if (mode !== "edit" || !programId || !accessToken) return;

    const fetchProgram = async () => {
      try {
        setLoading(true);

        const existing = await getAdminProgramById(programId);

        setTitle(existing.title || "");
        setShortDescription(existing.shortDescription || "");
        setOverview(existing.overview || "");
        setDuration(existing.duration || "");
        setEligibility(existing.eligibility || "");
        setIcon(existing.icon || "");
        setApplyEnabled(Boolean(existing.applyEnabled));
        setApplyUrl(existing.applyUrl || "");
        setCurrentBanner(existing.bannerImage || null);
        setBannerPreview(existing.bannerImage || null);
        setRemoveBannerImage(false);
        setExistingDocuments(
          (existing.documents || []).map((document) => ({
            id: document.id,
            title: document.title || "",
            fileUrl: document.fileUrl,
          })),
        );

        setHighlights(mapToTextItems(existing.highlights, "text"));

        const orderedSteps = Array.isArray(existing.applicationSteps)
          ? [...existing.applicationSteps].sort(
              (a, b) => (a?.stepNumber || 0) - (b?.stepNumber || 0),
            )
          : [];
        setApplicationSteps(mapToTextItems(orderedSteps, "description"));

        const orderedStories = Array.isArray(existing.successStories)
          ? [...existing.successStories].sort(
              (a, b) => (a?.order || 0) - (b?.order || 0),
            )
          : [];
        setSuccessStories(
          orderedStories.length > 0
            ? orderedStories.map((story, index) => mapExistingStory(story, index))
            : [createEmptyStory("1")],
        );
        setDeletedSuccessStoryIds([]);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load program"));
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [mode, programId, accessToken]);

  useEffect(() => {
    newDocumentsRef.current = newDocuments;
  }, [newDocuments]);

  useEffect(() => {
    successStoriesRef.current = successStories;
  }, [successStories]);

  useEffect(() => {
    return () => {
      newDocumentsRef.current.forEach((document) =>
        URL.revokeObjectURL(document.previewUrl),
      );
      successStoriesRef.current.forEach((story) => {
        if (story.imageFile && story.imagePreview) {
          URL.revokeObjectURL(story.imagePreview);
        }
      });
    };
  }, []);

  const handleAddHighlight = () => {
    setHighlights([...highlights, { id: nextId(highlights), text: "" }]);
  };

  const handleRemoveHighlight = (id: string) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((item) => item.id !== id));
    }
  };

  const handleHighlightChange = (id: string, text: string) => {
    setHighlights(
      highlights.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  const handleAddApplicationStep = () => {
    setApplicationSteps([
      ...applicationSteps,
      { id: nextId(applicationSteps), text: "" },
    ]);
  };

  const handleRemoveApplicationStep = (id: string) => {
    if (applicationSteps.length > 1) {
      setApplicationSteps(applicationSteps.filter((item) => item.id !== id));
    }
  };

  const handleApplicationStepChange = (id: string, text: string) => {
    setApplicationSteps(
      applicationSteps.map((item) =>
        item.id === id ? { ...item, text } : item,
      ),
    );
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setRemoveBannerImage(false);
  };

  const handleRemoveBanner = () => {
    if (bannerFile) {
      setBannerFile(null);
      setBannerPreview(currentBanner);
      return;
    }

    if (currentBanner) {
      setBannerPreview(null);
      setCurrentBanner(null);
      setRemoveBannerImage(true);
      return;
    }

    setBannerPreview(null);
  };

  const handleAddDocumentFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewDocuments((prev) => [
      ...prev,
      ...files.map((file) => {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        return {
          file,
          title: baseName || "Document",
          previewUrl: URL.createObjectURL(file),
        };
      }),
    ]);

    e.target.value = "";
  };

  const updateExistingDocumentTitle = (id: string, title: string) => {
    setExistingDocuments((prev) =>
      prev.map((document) =>
        document.id === id ? { ...document, title } : document,
      ),
    );
  };

  const removeExistingDocument = (id: string) => {
    setExistingDocuments((prev) => prev.filter((document) => document.id !== id));
  };

  const updateNewDocumentTitle = (index: number, title: string) => {
    setNewDocuments((prev) =>
      prev.map((document, documentIndex) =>
        documentIndex === index ? { ...document, title } : document,
      ),
    );
  };

  const removeNewDocument = (index: number) => {
    setNewDocuments((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, documentIndex) => documentIndex !== index);
    });
  };

  const handleAddSuccessStory = () => {
    const storyId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setSuccessStories((prev) => [...prev, createEmptyStory(storyId, "new")]);
  };

  const handleRemoveSuccessStory = (id: string) => {
    setSuccessStories((prev) => {
      const target = prev.find((story) => story.id === id);
      if (target?.imageFile && target.imagePreview) {
        URL.revokeObjectURL(target.imagePreview);
      }

      return prev.filter((story) => story.id !== id);
    });

    setDeletedSuccessStoryIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };

  const handleSuccessStoryChange = (
    id: string,
    field: keyof Omit<
      SuccessStoryDraft,
      "id" | "imageFile" | "imagePreview" | "existingImageUrl" | "existingImagePublicId"
    >,
    value: string | boolean,
  ) => {
    setSuccessStories((prev) =>
      prev.map((story) =>
        story.id === id
          ? {
              ...story,
              [field]: value,
            }
          : story,
      ),
    );
  };

  const handleSuccessStoryImageUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessStories((prev) =>
      prev.map((story) => {
        if (story.id !== id) return story;

        if (story.imageFile && story.imagePreview) {
          URL.revokeObjectURL(story.imagePreview);
        }

        return {
          ...story,
          imageFile: file,
          imagePreview: URL.createObjectURL(file),
          existingImageUrl: story.existingImageUrl,
          existingImagePublicId: story.existingImagePublicId,
          removeImage: false,
        };
      }),
    );

    e.target.value = "";
  };

  const handleRemoveSuccessStoryImage = (id: string) => {
    setSuccessStories((prev) =>
      prev.map((story) => {
        if (story.id !== id) return story;

        if (story.imageFile && story.imagePreview) {
          URL.revokeObjectURL(story.imagePreview);
        }

        return {
          ...story,
          imageFile: null,
          imagePreview: null,
          existingImageUrl: null,
          existingImagePublicId: null,
          removeImage: true,
        };
      }),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const highlightsClean = highlights
      .map((item) => item.text.trim())
      .filter((item) => item.length > 0);
    const stepsClean = applicationSteps
      .map((item) => item.text.trim())
      .filter((item) => item.length > 0);
    const storyDrafts = successStories.filter(
      (story) =>
        story.participantName.trim() ||
        story.participantRole.trim() ||
        story.storyTitle.trim() ||
        story.successStory.trim() ||
        story.achievementHighlights.trim() ||
        story.startupOutcome.trim() ||
        story.testimonial.trim() ||
        story.imageFile !== null ||
        story.existingImageUrl !== null,
    );
    const existingStoryDrafts = storyDrafts.filter(
      (story) => story.source === "existing",
    );
    const newStoryDrafts = storyDrafts.filter((story) => story.source === "new");
    const shouldClearSuccessStories = successStories.length > 0 && storyDrafts.length === 0;

    if (
      !title.trim() ||
      !shortDescription.trim() ||
      !overview.trim() ||
      !duration.trim() ||
      !eligibility.trim()
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (
      storyDrafts.some(
        (story) =>
          story.participantName.trim().length === 0 ||
          story.participantRole.trim().length === 0 ||
          story.storyTitle.trim().length === 0 ||
          story.successStory.trim().length === 0 ||
          story.achievementHighlights.trim().length === 0 ||
          story.startupOutcome.trim().length === 0,
      )
    ) {
      toast.error("Please complete all required fields for each success story.");
      return;
    }

    if (applyEnabled && !applyUrl.trim()) {
      toast.error("Please add application URL when applications are enabled.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("shortDescription", shortDescription.trim());
      formData.append("overview", overview.trim());
      formData.append("duration", duration.trim());
      formData.append("eligibility", eligibility.trim());
      formData.append("applyEnabled", String(applyEnabled));

      if (icon.trim()) {
        formData.append("icon", icon.trim());
      }

      if (applyEnabled && applyUrl.trim()) {
        formData.append("applyUrl", applyUrl.trim());
      }

      highlightsClean.forEach((highlight) =>
        formData.append("highlights[]", highlight),
      );
      stepsClean.forEach((step) => formData.append("applicationSteps[]", step));

      if (bannerFile) {
        formData.append("bannerImage", bannerFile);
      }

      if (removeBannerImage) {
        formData.append("removeBannerImage", "true");
      }

      if (shouldClearSuccessStories) {
        formData.append("clearSuccessStories", "true");
      }

      deletedSuccessStoryIds.forEach((storyId) => {
        formData.append("deletedSuccessStoryIds[]", storyId);
      });

      existingDocuments.forEach((document) => {
        formData.append("retainedDocumentIds[]", document.id);
        formData.append("existingDocumentTitles[]", document.title.trim());
      });

      newDocuments.forEach((document) => {
        formData.append("documentFiles", document.file);
        formData.append("documentTitles[]", document.title.trim());
      });

      const storyFiles: File[] = [];

      existingStoryDrafts.forEach((story, index) => {
        const storyImageIndex = story.imageFile ? storyFiles.length : null;
        if (story.imageFile) {
          storyFiles.push(story.imageFile);
        }

        formData.append("retainedSuccessStoryIds[]", story.id);
        formData.append(
          "existingSuccessStories[]",
          JSON.stringify({
            id: story.id,
            participantName: story.participantName.trim(),
            participantRole: story.participantRole.trim(),
            storyTitle: story.storyTitle.trim(),
            successStory: story.successStory.trim(),
            achievementHighlights: story.achievementHighlights.trim(),
            startupOutcome: story.startupOutcome.trim(),
            testimonial: story.testimonial.trim(),
            imageUrl: story.removeImage ? null : story.existingImageUrl,
            imagePublicId: story.removeImage ? null : story.existingImagePublicId,
            storyImageIndex,
            removeImage: story.removeImage,
            order: index,
            isActive: story.isActive,
          }),
        );
      });

      newStoryDrafts.forEach((story, index) => {
        const storyImageIndex =
          story.imageFile !== null ? storyFiles.length : null;
        if (story.imageFile) {
          storyFiles.push(story.imageFile);
        }

        formData.append(
          "successStories[]",
          JSON.stringify({
            participantName: story.participantName.trim(),
            participantRole: story.participantRole.trim(),
            storyTitle: story.storyTitle.trim(),
            successStory: story.successStory.trim(),
            achievementHighlights: story.achievementHighlights.trim(),
            startupOutcome: story.startupOutcome.trim(),
            testimonial: story.testimonial.trim(),
            imageUrl: null,
            imagePublicId: null,
            storyImageIndex,
            removeImage: false,
            order: index,
            isActive: story.isActive,
          }),
        );
      });

      storyFiles.forEach((file) => {
        formData.append("storyImages", file);
      });

      if (mode === "create") {
        await createAdminProgram(formData);
      } else if (programId) {
        await updateAdminProgram(programId, formData);
      }

      toast.success(
        mode === "create"
          ? "Program created successfully"
          : "Program updated successfully",
      );
      navigate("/dashboard/programs");
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

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Basic Information</h3>

              <div className="mb-4">
                <label htmlFor="title" className="block text-foreground mb-2">
                  Program Title <span className="text-destructive">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Incubation Program for Startups"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="shortDescription"
                  className="block text-foreground mb-2"
                >
                  Short Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A concise summary for listing cards"
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <div>
                  <label
                    htmlFor="eligibility"
                    className="block text-foreground mb-2"
                  >
                    Eligibility <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="eligibility"
                      type="text"
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                      placeholder="e.g., 10+2 with Science"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="overview"
                  className="block text-foreground mb-2"
                >
                  Overview <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="overview"
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Provide a detailed overview of the program..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground">Program Highlights</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add key benefits or outcomes
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
                {highlights.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-2 text-muted-foreground mt-3">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-sm">{index + 1}.</span>
                      </div>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleHighlightChange(item.id, e.target.value)
                        }
                        placeholder="Enter program highlight..."
                        className="flex-1 px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      {highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(item.id)}
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

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground">Application Steps</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add steps users should follow to apply
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddApplicationStep}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>

              <div className="space-y-3">
                {applicationSteps.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-2 text-muted-foreground mt-3">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-sm">{index + 1}.</span>
                      </div>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleApplicationStepChange(item.id, e.target.value)
                        }
                        placeholder="Enter application step..."
                        className="flex-1 px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      {applicationSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveApplicationStep(item.id)}
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

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground">Participant Success Stories</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add participant outcomes, testimonials, and optional images
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSuccessStory}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Story
                </button>
              </div>

              <div className="space-y-4">
                {successStories.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No success stories added yet.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddSuccessStory}
                      className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Story
                    </button>
                  </div>
                ) : (
                  successStories.map((story, index) => (
                  <div
                    key={story.id}
                    className="border border-border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-foreground truncate">
                          Story {index + 1}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={story.isActive}
                            onChange={(e) =>
                              handleSuccessStoryChange(
                                story.id,
                                "isActive",
                                e.target.checked,
                              )
                            }
                          />
                          Active
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveSuccessStory(story.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Remove story"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-foreground mb-2 text-sm">
                          Participant Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={story.participantName}
                          onChange={(e) =>
                            handleSuccessStoryChange(
                              story.id,
                              "participantName",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="Participant name"
                        />
                      </div>
                      <div>
                        <label className="block text-foreground mb-2 text-sm">
                          Participant Role / Profile <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={story.participantRole}
                          onChange={(e) =>
                            handleSuccessStoryChange(
                              story.id,
                              "participantRole",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="Student, founder, team lead..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-foreground mb-2 text-sm">
                          Story Title <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={story.storyTitle}
                          onChange={(e) =>
                            handleSuccessStoryChange(
                              story.id,
                              "storyTitle",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="A short headline for the story"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-foreground mb-2 text-sm">
                          Success Story <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          value={story.successStory}
                          onChange={(e) =>
                            handleSuccessStoryChange(
                              story.id,
                              "successStory",
                              e.target.value,
                            )
                          }
                          rows={4}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                          placeholder="Describe the participant journey and result"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-foreground mb-2 text-sm">
                          Achievement Highlights <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          value={story.achievementHighlights}
                          onChange={(e) =>
                            handleSuccessStoryChange(
                              story.id,
                              "achievementHighlights",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                          placeholder="Awards, milestones, recognition, or key achievements"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-foreground mb-2 text-sm">
                          Startup Outcome <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          value={story.startupOutcome}
                          onChange={(e) =>
                            handleSuccessStoryChange(
                              story.id,
                              "startupOutcome",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                          placeholder="Describe the startup outcome, traction, or next step"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-foreground mb-2 text-sm">
                          Testimonial
                        </label>
                        <textarea
                          value={story.testimonial}
                          onChange={(e) =>
                            handleSuccessStoryChange(
                              story.id,
                              "testimonial",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                          placeholder="Optional quote or testimonial"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      {story.imagePreview ? (
                        <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                          <img
                            src={story.imagePreview}
                            alt="Success story preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSuccessStoryImage(story.id)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-md"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-20 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                          No image
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          {story.imagePreview ? "Replace Image" : "Upload Image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSuccessStoryImageUpload(story.id, e)}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Optional image for the story card
                        </p>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Application Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm mb-1">
                    Accept Applications
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {applyEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setApplyEnabled(!applyEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    applyEnabled ? "bg-primary" : "bg-switch-background"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      applyEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {applyEnabled && (
                <div className="mt-4 pt-4 border-t border-border">
                  <label
                    htmlFor="applyUrl"
                    className="block text-foreground mb-2 text-sm"
                  >
                    Application URL
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="applyUrl"
                      type="url"
                      value={applyUrl}
                      onChange={(e) => setApplyUrl(e.target.value)}
                      placeholder="https://example.com/apply/program-name"
                      className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Program Icon</h3>
              <label
                htmlFor="icon"
                className="block text-foreground mb-2 text-sm"
              >
                Icon Name or URL
              </label>
              <input
                id="icon"
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g., graduation-cap or https://..."
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Stored as `icon` in backend.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground">Banner Image</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional image shown on the public program detail view
                  </p>
                </div>
              </div>

              {bannerPreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={bannerPreview}
                      alt="Program banner preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
                      title="Remove selected banner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="w-full text-sm text-destructive hover:underline"
                  >
                    Remove Selected Banner
                  </button>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-foreground">Upload Banner</p>
                      <p className="text-xs text-muted-foreground">
                        Click to browse
                      </p>
                    </div>
                  </div>
                </label>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                Recommended: wide landscape image for the public detail page
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground">Related Documents</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add reference PDFs or supporting files for the scheme
                  </p>
                </div>
                <label className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Add Files
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
                    multiple
                    onChange={handleAddDocumentFiles}
                    className="hidden"
                  />
                </label>
              </div>

              {existingDocuments.length === 0 && newDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No related documents added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {existingDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground break-words">
                              {document.title || "Document"}
                            </p>
                            <a
                              href={document.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline break-all"
                            >
                              {document.fileUrl}
                            </a>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingDocument(document.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors flex-shrink-0"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={document.title}
                        onChange={(e) =>
                          updateExistingDocumentTitle(document.id, e.target.value)
                        }
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Document title"
                      />
                    </div>
                  ))}

                  {newDocuments.map((document, index) => (
                    <div
                      key={`${document.file.name}-${index}`}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground break-words">
                              {document.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">New file</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewDocument(index)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors flex-shrink-0"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={document.title}
                        onChange={(e) =>
                          updateNewDocumentTitle(index, e.target.value)
                        }
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Document title"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {title && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-foreground mb-4">Quick Preview</h3>
                <div className="space-y-3">
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Program</p>
                      <p className="text-sm text-foreground">{title}</p>
                    </div>
                  </div>
                  {eligibility && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Eligibility
                        </p>
                        <p className="text-sm text-foreground">{eligibility}</p>
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
                  {highlights.filter((item) => item.text.trim() !== "").length >
                    0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Highlights
                      </p>
                      <p className="text-sm text-foreground">
                        {
                          highlights.filter((item) => item.text.trim() !== "")
                            .length
                        }{" "}
                        item(s)
                      </p>
                    </div>
                  )}
                  {applicationSteps.filter((item) => item.text.trim() !== "")
                    .length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Application Steps
                      </p>
                      <p className="text-sm text-foreground">
                        {
                          applicationSteps.filter(
                            (item) => item.text.trim() !== "",
                          ).length
                        }{" "}
                        step(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                    {mode === "create" ? "Create Program" : "Save Changes"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/programs")}
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
