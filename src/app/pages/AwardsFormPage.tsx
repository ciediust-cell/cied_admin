import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Award } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  createAdminAward,
  getAdminAwardById,
  getErrorMessage,
  updateAdminAward,
  type AwardUpsertPayload,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface AwardFormPageProps {
  mode: "create" | "edit";
}

export default function AwardFormPage({ mode }: AwardFormPageProps) {
  const navigate = useNavigate();
  const { awardId } = useParams();
  const { accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [awardedBy, setAwardedBy] = useState("");
  const [order, setOrder] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (mode !== "edit" || !awardId || !accessToken) return;

    const fetchAward = async () => {
      try {
        setLoading(true);

        const data = await getAdminAwardById(awardId);
        setTitle(data.title || "");
        setYear(data.year?.toString() || new Date().getFullYear().toString());
        setDescription(data.description || "");
        setAwardedBy(data.awardedBy || "");
        setOrder(data.order?.toString() || "");
        setIsActive(Boolean(data.isActive));
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load award"));
      } finally {
        setLoading(false);
      }
    };

    fetchAward();
  }, [mode, awardId, accessToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const parsedYear = Number(year);
    if (Number.isNaN(parsedYear)) {
      toast.error("Year must be a valid number.");
      return;
    }

    const payload: AwardUpsertPayload = {
      title: title.trim(),
      awardedBy: awardedBy.trim(),
      year: parsedYear,
      description: description.trim(),
      isActive,
    };

    if (!payload.title || !payload.awardedBy || !payload.description) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (order.trim()) {
      const parsedOrder = Number(order);
      if (Number.isNaN(parsedOrder)) {
        toast.error("Order must be a valid number.");
        return;
      }
      payload.order = parsedOrder;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        await createAdminAward(payload);
      } else if (awardId) {
        await updateAdminAward(awardId, payload);
      }

      toast.success(
        mode === "create"
          ? "Award created successfully"
          : "Award updated successfully",
      );
      navigate("/dashboard/awards");
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, mode === "create" ? "Create failed" : "Update failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i).reverse();

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/awards")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Awards List
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Add New Award" : "Edit Award"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Add a new award or recognition"
            : "Update award details"}
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Award Information</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-foreground mb-2">
                    Award Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Best Educational Institution of the Year"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="year" className="block text-foreground mb-2">
                      Year <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
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

                <div>
                  <label htmlFor="awardedBy" className="block text-foreground mb-2">
                    Awarded By <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="awardedBy"
                    type="text"
                    value={awardedBy}
                    onChange={(e) => setAwardedBy(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., National Education Board"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-foreground mb-2">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Provide details about the award..."
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Visibility</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm">Show on website</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Display this award publicly
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
              <h3 className="text-foreground mb-4">Preview</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">{title || "Award Title"}</p>
                    <p className="text-muted-foreground text-sm">{year}</p>
                  </div>
                </div>
                {description && (
                  <p className="text-muted-foreground text-xs mb-2">{description}</p>
                )}
                {awardedBy && (
                  <p className="text-muted-foreground text-xs italic">
                    Awarded by: {awardedBy}
                  </p>
                )}
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
                      {mode === "create" ? "Create Award" : "Save Changes"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/awards")}
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
