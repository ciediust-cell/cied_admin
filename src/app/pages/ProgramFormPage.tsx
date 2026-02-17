import { useEffect, useState } from "react";
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
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface ProgramFormPageProps {
  mode: "create" | "edit";
}

interface TextItem {
  id: string;
  text: string;
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

        setHighlights(mapToTextItems(existing.highlights, "text"));

        const orderedSteps = Array.isArray(existing.applicationSteps)
          ? [...existing.applicationSteps].sort(
              (a, b) => (a?.stepNumber || 0) - (b?.stepNumber || 0),
            )
          : [];
        setApplicationSteps(mapToTextItems(orderedSteps, "description"));
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load program"));
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [mode, programId, accessToken]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const payload = {
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      overview: overview.trim(),
      duration: duration.trim(),
      eligibility: eligibility.trim(),
      icon: icon.trim() || undefined,
      applyEnabled,
      applyUrl: applyEnabled ? applyUrl.trim() : undefined,
      highlights: highlights
        .map((item) => item.text.trim())
        .filter((item) => item.length > 0),
      applicationSteps: applicationSteps
        .map((item) => item.text.trim())
        .filter((item) => item.length > 0),
    };

    if (
      !payload.title ||
      !payload.shortDescription ||
      !payload.overview ||
      !payload.duration ||
      !payload.eligibility
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (payload.applyEnabled && !payload.applyUrl) {
      toast.error("Please add application URL when applications are enabled.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        await createAdminProgram(payload);
      } else if (programId) {
        await updateAdminProgram(programId, payload);
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
