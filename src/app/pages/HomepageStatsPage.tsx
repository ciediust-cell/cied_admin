import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  getAdminHomepageStats,
  getErrorMessage,
  saveAdminHomepageStats,
  type HomepageStatResponse,
  type HomepageStatUpsertPayload,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

type StatDraft = {
  localId: string;
  id?: string;
  key: string;
  label: string;
  prefix: string;
  value: string;
  decimals: string;
  suffix: string;
  order: string;
  isActive: boolean;
};

const createLocalId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toDraft = (stat: HomepageStatResponse): StatDraft => ({
  localId: stat.id,
  id: stat.id,
  key: stat.key,
  label: stat.label,
  prefix: stat.prefix || "",
  value: String(stat.value),
  decimals: String(stat.decimals),
  suffix: stat.suffix || "",
  order: String(stat.order),
  isActive: stat.isActive,
});

const createBlankDraft = (order: number): StatDraft => ({
  localId: createLocalId(),
  key: "",
  label: "",
  prefix: "",
  value: "0",
  decimals: "0",
  suffix: "",
  order: String(order),
  isActive: true,
});

const normalizeKey = (value: string, fallback: string) =>
  (value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

export function HomepageStatsPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatDraft[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await getAdminHomepageStats();
        setStats(response.map(toDraft));
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load homepage statistics"));
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, [accessToken]);

  const previewStats = useMemo(
    () =>
      [...stats]
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        .filter((stat) => stat.isActive),
    [stats],
  );

  const updateStat = (
    localId: string,
    field: keyof StatDraft,
    value: string | boolean,
  ) => {
    setStats((current) =>
      current.map((stat) =>
        stat.localId === localId ? { ...stat, [field]: value } : stat,
      ),
    );
  };

  const addStat = () => {
    setStats((current) => [...current, createBlankDraft(current.length)]);
  };

  const removeStat = (localId: string) => {
    setStats((current) => current.filter((stat) => stat.localId !== localId));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (stats.length === 0) {
      toast.error("Add at least one statistic.");
      return;
    }

    const payloadStats: HomepageStatUpsertPayload[] = [];

    for (const [index, stat] of stats.entries()) {
      const label = stat.label.trim();
      const key = normalizeKey(stat.key, label);
      const value = Number(stat.value);
      const decimals = Number.parseInt(stat.decimals, 10);
      const order = Number.parseInt(stat.order, 10);

      if (!label) {
        toast.error(`Statistic ${index + 1} needs a label.`);
        return;
      }

      if (!Number.isFinite(value)) {
        toast.error(`Statistic ${index + 1} needs a valid value.`);
        return;
      }

      if (!Number.isInteger(decimals) || decimals < 0 || decimals > 4) {
        toast.error(`Statistic ${index + 1} decimals must be between 0 and 4.`);
        return;
      }

      payloadStats.push({
        ...(stat.id ? { id: stat.id } : {}),
        key,
        label,
        prefix: stat.prefix.trim() || null,
        value,
        decimals,
        suffix: stat.suffix.trim() || null,
        order: Number.isInteger(order) ? order : index,
        isActive: stat.isActive,
      });
    }

    try {
      setLoading(true);
      const response = await saveAdminHomepageStats({ stats: payloadStats });
      setStats(response.stats.map(toDraft));
      toast.success("Homepage statistics saved successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save homepage statistics"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-foreground mb-2">Homepage Statistics</h1>
        <p className="text-muted-foreground">
          Edit the numbers and labels shown in the homepage hero section
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground">Statistic Items</h3>
                <p className="text-sm text-muted-foreground">
                  Prefix and suffix control text around the animated number
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addStat}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Statistic
            </button>
          </div>

          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div
                key={stat.localId}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-foreground mb-2 text-sm">
                      Label
                    </label>
                    <input
                      value={stat.label}
                      onChange={(event) =>
                        updateStat(stat.localId, "label", event.target.value)
                      }
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Startups Incubated"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-foreground mb-2 text-sm">
                      Prefix
                    </label>
                    <input
                      value={stat.prefix}
                      onChange={(event) =>
                        updateStat(stat.localId, "prefix", event.target.value)
                      }
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Rs."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-foreground mb-2 text-sm">
                      Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={stat.value}
                      onChange={(event) =>
                        updateStat(stat.localId, "value", event.target.value)
                      }
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-foreground mb-2 text-sm">
                      Dec.
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={stat.decimals}
                      onChange={(event) =>
                        updateStat(stat.localId, "decimals", event.target.value)
                      }
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-foreground mb-2 text-sm">
                      Suffix
                    </label>
                    <input
                      value={stat.suffix}
                      onChange={(event) =>
                        updateStat(stat.localId, "suffix", event.target.value)
                      }
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="+"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-foreground mb-2 text-sm">
                      Order
                    </label>
                    <input
                      type="number"
                      value={stat.order}
                      onChange={(event) =>
                        updateStat(stat.localId, "order", event.target.value)
                      }
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-end justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateStat(stat.localId, "isActive", !stat.isActive)
                      }
                      className={`h-10 px-3 rounded-md text-xs ${
                        stat.isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stat.isActive ? "Shown" : "Hidden"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStat(stat.localId)}
                      className="h-10 w-10 inline-flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                      title={`Remove statistic ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-foreground mb-2 text-sm">Key</label>
                  <input
                    value={stat.key}
                    onChange={(event) =>
                      updateStat(stat.localId, "key", event.target.value)
                    }
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    placeholder="Auto-generated from label if left blank"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <h3 className="text-foreground mb-4">Homepage Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewStats.map((stat) => (
                <div
                  key={stat.localId}
                  className="rounded-lg border border-border bg-muted/30 p-4 text-center"
                >
                  <div className="text-xl font-semibold text-primary mb-1">
                    {stat.prefix}
                    {Number(stat.value || 0).toFixed(
                      Number.parseInt(stat.decimals, 10) || 0,
                    )}
                    {stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label || "Untitled statistic"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <LoadingIndicator label="Saving..." />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Statistics
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
