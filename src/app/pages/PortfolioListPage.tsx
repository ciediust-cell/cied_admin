import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  deleteAdminPortfolioItem,
  getAdminPortfolio,
  getErrorMessage,
  toggleAdminPortfolioItemStatus,
  type PortfolioItemResponse,
  type StartupSector,
  type StartupStage,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";

type PortfolioItem = PortfolioItemResponse;

const STAGE_LABELS: Record<StartupStage, string> = {
  IDEATION: "Ideation",
  EARLY_STAGE: "Early-stage",
  GROWTH: "Growth",
};

const SECTOR_LABELS: Record<StartupSector, string> = {
  AI: "AI",
  TECHNOLOGY: "Technology",
  AGRICULTURE: "Agriculture",
  HEALTHTECH: "HealthTech",
  EDTECH: "EdTech",
  ECOMMERCE: "E-commerce",
  SOCIAL_IMPACT: "Social Impact",
};

export function PortfolioListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const data = await getAdminPortfolio();
      setItems(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load portfolio"));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.tagline.toLowerCase().includes(query) ||
          STAGE_LABELS[item.stage].toLowerCase().includes(query) ||
          item.sectors.some((sector) =>
            SECTOR_LABELS[sector].toLowerCase().includes(query),
          )
        );
      }),
    [items, searchQuery],
  );

  const handleDelete = async (id: string) => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to delete this startup?",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteAdminPortfolioItem(id);

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Startup deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (item: PortfolioItem) => {
    try {
      setTogglingId(item.id);
      await toggleAdminPortfolioItemStatus(item.id);

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, isActive: !entry.isActive }
            : entry,
        ),
      );

      toast.success("Startup status updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Status update failed"));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Portfolio</h1>
          <p className="text-muted-foreground">
            Manage startups shown in the public portfolio
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/portfolio/createPortfolio")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Startup
        </button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by startup name, tagline, stage, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-foreground">Startup</th>
                <th className="text-left px-6 py-4 text-foreground">Stage</th>
                <th className="text-left px-6 py-4 text-foreground">Sectors</th>
                <th className="text-left px-6 py-4 text-foreground">Founders</th>
                <th className="text-left px-6 py-4 text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No startups found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border"
                        />
                        <div>
                          <p className="text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.tagline}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {STAGE_LABELS[item.stage]}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.sectors.slice(0, 2).map((sector) => (
                          <span
                            key={`${item.id}-${sector}`}
                            className="inline-flex px-2 py-1 rounded text-xs bg-primary/10 text-primary"
                          >
                            {SECTOR_LABELS[sector]}
                          </span>
                        ))}
                        {item.sectors.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{item.sectors.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.founders.length}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={togglingId === item.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                          item.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                        title={item.isActive ? "Click to hide" : "Click to show"}
                      >
                        {togglingId === item.id ? (
                          <LoadingIndicator label="Updating..." className="text-xs" />
                        ) : item.isActive ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/portfolio/${item.id}/edit`)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deletingId === item.id ? (
                            <LoadingIndicator label="Deleting..." className="text-xs" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredItems.length > 0 && (
          <div className="px-6 py-4 bg-muted border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {items.length} startups
              {" | "}
              {items.filter((item) => item.isActive).length} active
              {" | "}
              {items.filter((item) => !item.isActive).length} inactive
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
