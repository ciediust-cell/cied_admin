import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  deleteAdminCollaborator,
  getAdminCollaboratorsPaginated,
  getErrorMessage,
  updateAdminCollaborator,
  type CollaboratorResponse,
  type PaginationMeta,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";
import { getDownloadUrl } from "../lib/downloadUrl";

const PAGE_SIZE = 20;

export function CollaboratorsListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [items, setItems] = useState<CollaboratorResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });

  const fetchCollaborators = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const data = await getAdminCollaboratorsPaginated({
        page,
        limit: PAGE_SIZE,
      });
      setItems(data.data);
      setPagination(data.pagination);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load collaborators"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, page]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const handleToggleActive = async (item: CollaboratorResponse) => {
    try {
      setTogglingId(item.id);
      const formData = new FormData();
      formData.append("isActive", String(!item.isActive));
      const updated = await updateAdminCollaborator(item.id, formData);
      setItems((prev) =>
        prev.map((entry) => (entry.id === item.id ? updated : entry)),
      );
      toast.success("Collaborator status updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Status update failed"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to delete this collaborator?",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteAdminCollaborator(id);

      if (items.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        await fetchCollaborators();
      }

      toast.success("Collaborator deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Collaborators</h1>
          <p className="text-muted-foreground">
            Manage official CIED collaborator records, logos, links, and MoUs
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/collaborators/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Collaborator
        </button>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Processing...</p>}

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search collaborators..."
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
                <th className="text-left px-6 py-4 text-foreground">Logo</th>
                <th className="text-left px-6 py-4 text-foreground">Organization</th>
                <th className="text-left px-6 py-4 text-foreground">Order</th>
                <th className="text-left px-6 py-4 text-foreground">Links</th>
                <th className="text-left px-6 py-4 text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No collaborators found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {item.logoUrl ? (
                        <img
                          src={item.logoUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-contain border border-border bg-white"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg border border-dashed border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          Logo
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.websiteUrl && (
                          <a
                            href={item.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Open website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {item.mouUrl && (
                          <a
                            href={getDownloadUrl(item.mouUrl)}
                            download
                            className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Download MoU"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </div>
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
                          onClick={() =>
                            navigate(`/dashboard/collaborators/${item.id}/edit`)
                          }
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
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)} (
          {pagination.total} total)
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={loading || page <= 1}
            className="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading || page >= Math.max(1, pagination.totalPages)}
            className="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
