import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  GraduationCap,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  deleteAdminProgram,
  getAdminPrograms,
  getErrorMessage,
  toggleAdminProgramStatus,
  type ProgramItemResponse,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";

export function ProgramsListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [programs, setPrograms] = useState<ProgramItemResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">(
    "All",
  );
  const [applyFilter, setApplyFilter] = useState<"All" | "Enabled" | "Disabled">(
    "All",
  );
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchPrograms = async () => {
      try {
        setLoading(true);

        const data = await getAdminPrograms();
        setPrograms(data);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load programs"));
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [accessToken]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to delete this program?",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteAdminProgram(id);

      setPrograms((prev) => prev.filter((item) => item.id !== id));
      toast.success("Program deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setTogglingId(id);

      const data = await toggleAdminProgramStatus(id);
      const updatedProgram = data.program;

      setPrograms((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: updatedProgram.isActive } : item,
        ),
      );
      toast.success("Program status updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Status update failed"));
    } finally {
      setTogglingId(null);
    }
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && program.isActive) ||
      (statusFilter === "Inactive" && !program.isActive);

    const matchesApply =
      applyFilter === "All" ||
      (applyFilter === "Enabled" && program.applyEnabled) ||
      (applyFilter === "Disabled" && !program.applyEnabled);

    return matchesSearch && matchesStatus && matchesApply;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Programs</h1>
          <p className="text-muted-foreground">
            Oversee academic programs and admissions settings
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/programs/createProgram")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Program
        </button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Loading...</p>
      )}

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search programs by title or short description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["All", "Active", "Inactive"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-input-background text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <select
              value={applyFilter}
              onChange={(e) =>
                setApplyFilter(e.target.value as "All" | "Enabled" | "Disabled")
              }
              className="px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            >
              <option value="All">Applications: All</option>
              <option value="Enabled">Applications: Enabled</option>
              <option value="Disabled">Applications: Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground mb-2">No programs found</p>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters or create a new program
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Program
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Eligibility
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Duration
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Applications
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Last Updated
                  </th>
                  <th className="text-right px-6 py-4 text-sm text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr
                    key={program.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground text-sm truncate">
                            {program.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-80">
                            {program.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {program.eligibility}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {program.duration}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs ${
                          program.applyEnabled
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {program.applyEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs ${
                          program.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {program.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(program.updatedAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/dashboard/programs/${program.id}/edit`)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(program.id)}
                          disabled={togglingId === program.id}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title={program.isActive ? "Deactivate" : "Activate"}
                        >
                          {togglingId === program.id ? (
                            <LoadingIndicator label="Updating..." className="text-xs" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(program.id)}
                          disabled={deletingId === program.id}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deletingId === program.id ? (
                            <LoadingIndicator label="Deleting..." className="text-xs" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {programs.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Programs
              </p>
              <p className="text-2xl text-foreground">{programs.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Active Programs
              </p>
              <p className="text-2xl text-green-600">
                {programs.filter((item) => item.isActive).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Applications Enabled
              </p>
              <p className="text-2xl text-blue-600">
                {programs.filter((item) => item.applyEnabled).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
