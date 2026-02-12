import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Award, Calendar } from "lucide-react";

interface AwardItem {
  id: number;
  title: string;
  year: number;
  category: string;
  recipient?: string;
  description: string;
  issuedBy: string;
}

const mockAwardsData: AwardItem[] = [
  {
    id: 1,
    title: "Best Educational Institution of the Year",
    year: 2026,
    category: "Institutional Excellence",
    recipient: "Institution",
    description:
      "Recognized for outstanding academic performance, innovative teaching methodologies, and holistic student development.",
    issuedBy: "National Education Board",
  },
  {
    id: 2,
    title: "Excellence in STEM Education",
    year: 2025,
    category: "Academic Achievement",
    recipient: "Science Department",
    description:
      "Awarded for exceptional contributions to science, technology, engineering, and mathematics education.",
    issuedBy: "STEM Education Council",
  },
  {
    id: 3,
    title: "Green Campus Award",
    year: 2025,
    category: "Environmental",
    recipient: "Institution",
    description:
      "Honored for outstanding environmental initiatives and sustainable campus practices.",
    issuedBy: "Environmental Protection Agency",
  },
  {
    id: 4,
    title: "Outstanding Sports Achievement",
    year: 2024,
    category: "Sports",
    recipient: "Athletics Department",
    description:
      "Recognized for exceptional performance in inter-school sports competitions and athlete development.",
    issuedBy: "State Sports Association",
  },
  {
    id: 5,
    title: "Innovation in Teaching Award",
    year: 2024,
    category: "Teaching Excellence",
    recipient: "Faculty",
    description:
      "Awarded for implementing cutting-edge teaching methods and digital learning platforms.",
    issuedBy: "Teachers Association",
  },
  {
    id: 6,
    title: "Best Library Facilities",
    year: 2023,
    category: "Infrastructure",
    recipient: "Institution",
    description:
      "Recognized for state-of-the-art library resources and promoting a culture of reading.",
    issuedBy: "Library Council",
  },
  {
    id: 7,
    title: "Community Service Excellence",
    year: 2023,
    category: "Social Impact",
    recipient: "Student Council",
    description:
      "Honored for outstanding community outreach programs and social welfare initiatives.",
    issuedBy: "Community Development Board",
  },
  {
    id: 8,
    title: "Digital Innovation Award",
    year: 2022,
    category: "Technology",
    recipient: "IT Department",
    description:
      "Awarded for successful implementation of smart classroom technology and e-learning platforms.",
    issuedBy: "Technology in Education Forum",
  },
];

export function AwardsListPage() {
  const navigate = useNavigate();
  const [awards, setAwards] = useState<AwardItem[]>(mockAwardsData);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this award?")) {
      setAwards(awards.filter((award) => award.id !== id));
    }
  };

  const filteredAwards = awards.filter(
    (award) =>
      award.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.year.toString().includes(searchQuery),
  );

  // Group awards by year
  const awardsByYear = filteredAwards.reduce(
    (acc, award) => {
      if (!acc[award.year]) {
        acc[award.year] = [];
      }
      acc[award.year].push(award);
      return acc;
    },
    {} as Record<number, AwardItem[]>,
  );

  const sortedYears = Object.keys(awardsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Awards</h1>
          <p className="text-muted-foreground">
            Showcase institutional achievements and recognitions
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/awards/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Award
        </button>
      </div>

      {/* Stats */}
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
              <p className="text-2xl text-foreground">
                {sortedYears.length > 0 ? sortedYears.length : 0}
              </p>
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
                {
                  awards.filter((a) => a.year === new Date().getFullYear())
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">This Year</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search awards by title, category, or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Awards Timeline */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filteredAwards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No awards found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedYears.map((year) => (
              <div key={year} className="p-6">
                {/* Year Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground text-xl">
                      {year}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-foreground text-xl">{year}</h2>
                    <p className="text-muted-foreground text-sm">
                      {awardsByYear[year].length}{" "}
                      {awardsByYear[year].length === 1 ? "award" : "awards"}
                    </p>
                  </div>
                </div>

                {/* Awards for this year */}
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
                              <h3 className="text-foreground mb-1">
                                {award.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="inline-flex px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                  {award.category}
                                </span>
                                {award.recipient && (
                                  <span className="text-muted-foreground text-xs">
                                    • {award.recipient}
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm mb-2">
                                {award.description}
                              </p>
                              <p className="text-muted-foreground text-xs italic">
                                Issued by: {award.issuedBy}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
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

        {/* Footer */}
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
