import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Award, Calendar, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

interface AwardItem {
  id: string;
  title: string;
  year: number;
  description: string;
  awardedBy: string;
  order: number;
  isActive: boolean;
}

export function AwardsListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [awards, setAwards] = useState<AwardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAwards = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/admin/awards", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setAwards(data);
    } catch {
      toast.error("Failed to load awards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, [accessToken]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this award?")) return;

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:4000/api/admin/awards/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error();

      setAwards((prev) => prev.filter((award) => award.id !== id));
      toast.success("Award deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (award: AwardItem) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/awards/${award.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isActive: !award.isActive }),
      });

      if (!res.ok) throw new Error();

      setAwards((prev) =>
        prev.map((item) =>
          item.id === award.id ? { ...item, isActive: !item.isActive } : item,
        ),
      );

      toast.success("Award status updated");
    } catch {
      toast.error("Status update failed");
    }
  };

  const filteredAwards = useMemo(
    () =>
      awards.filter((award) => {
        const query = searchQuery.toLowerCase();
        return (
          award.title.toLowerCase().includes(query) ||
          award.awardedBy.toLowerCase().includes(query) ||
          award.year.toString().includes(searchQuery)
        );
      }),
    [awards, searchQuery],
  );

  const awardsByYear = useMemo(
    () =>
      filteredAwards.reduce(
        (acc, award) => {
          if (!acc[award.year]) acc[award.year] = [];
          acc[award.year].push(award);
          acc[award.year].sort((a, b) => a.order - b.order);
          return acc;
        },
        {} as Record<number, AwardItem[]>,
      ),
    [filteredAwards],
  );

  const sortedYears = useMemo(
    () => Object.keys(awardsByYear).map(Number).sort((a, b) => b - a),
    [awardsByYear],
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Awards</h1>
          <p className="text-muted-foreground">
            Showcase institutional achievements and recognitions
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/awards/addAward")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Award
        </button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Processing...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl text-foreground">{awards.length}</p>
              <p className="text-sm text-muted-foreground">Total Awards</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl text-foreground">{sortedYears.length}</p>
              <p className="text-sm text-muted-foreground">Years Covered</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl text-foreground">
                {awards.filter((award) => award.year === new Date().getFullYear()).length}
              </p>
              <p className="text-sm text-muted-foreground">This Year</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search awards by title, awarded by, or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filteredAwards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No awards found</div>
        ) : (
          <div className="divide-y divide-border">
            {sortedYears.map((year) => (
              <div key={year} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground text-xl">{year}</span>
                  </div>
                  <div>
                    <h2 className="text-foreground text-xl">{year}</h2>
                    <p className="text-muted-foreground text-sm">
                      {awardsByYear[year].length}{" "}
                      {awardsByYear[year].length === 1 ? "award" : "awards"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 ml-20">
                  {awardsByYear[year].map((award) => (
                    <div
                      key={award.id}
                      className="bg-muted/30 border border-border rounded-lg p-5 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Award className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-foreground mb-1">{award.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="inline-flex px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                  Order {award.order}
                                </span>
                                <button
                                  onClick={() => handleToggleActive(award)}
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                                    award.isActive
                                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {award.isActive ? (
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
                              </div>
                              <p className="text-muted-foreground text-sm mb-2">
                                {award.description}
                              </p>
                              <p className="text-muted-foreground text-xs italic">
                                Awarded by: {award.awardedBy}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => navigate(`/dashboard/awards/${award.id}/edit`)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(award.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAwards.length > 0 && (
          <div className="px-6 py-4 bg-muted border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAwards.length} of {awards.length} awards
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
