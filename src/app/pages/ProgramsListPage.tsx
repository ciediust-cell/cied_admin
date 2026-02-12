import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

interface ProgramItem {
  id: number;
  title: string;
  category: string;
  status: "Active" | "Inactive" | "Archived";
  duration: string;
  enrolledStudents?: number;
  lastUpdated: string;
}

const mockProgramsData: ProgramItem[] = [
  {
    id: 1,
    title: "Bachelor of Science in Computer Science",
    category: "Undergraduate",
    status: "Active",
    duration: "4 Years",
    enrolledStudents: 450,
    lastUpdated: "2026-02-01",
  },
  {
    id: 2,
    title: "Master of Business Administration",
    category: "Postgraduate",
    status: "Active",
    duration: "2 Years",
    enrolledStudents: 180,
    lastUpdated: "2026-01-28",
  },
  {
    id: 3,
    title: "Bachelor of Arts in English Literature",
    category: "Undergraduate",
    status: "Active",
    duration: "3 Years",
    enrolledStudents: 320,
    lastUpdated: "2026-01-25",
  },
  {
    id: 4,
    title: "Doctor of Philosophy in Physics",
    category: "Doctorate",
    status: "Active",
    duration: "5 Years",
    enrolledStudents: 45,
    lastUpdated: "2026-01-20",
  },
  {
    id: 5,
    title: "Certificate in Digital Marketing",
    category: "Certificate",
    status: "Active",
    duration: "6 Months",
    enrolledStudents: 95,
    lastUpdated: "2026-02-05",
  },
  {
    id: 6,
    title: "Diploma in Graphic Design",
    category: "Diploma",
    status: "Active",
    duration: "1 Year",
    enrolledStudents: 120,
    lastUpdated: "2026-01-15",
  },
  {
    id: 7,
    title: "Bachelor of Engineering in Mechanical Engineering",
    category: "Undergraduate",
    status: "Active",
    duration: "4 Years",
    enrolledStudents: 280,
    lastUpdated: "2026-01-30",
  },
  {
    id: 8,
    title: "Master of Science in Data Science",
    category: "Postgraduate",
    status: "Active",
    duration: "2 Years",
    enrolledStudents: 160,
    lastUpdated: "2026-02-08",
  },
  {
    id: 9,
    title: "Bachelor of Commerce",
    category: "Undergraduate",
    status: "Inactive",
    duration: "3 Years",
    enrolledStudents: 0,
    lastUpdated: "2025-12-10",
  },
  {
    id: 10,
    title: "Advanced Diploma in Culinary Arts",
    category: "Diploma",
    status: "Archived",
    duration: "2 Years",
    enrolledStudents: 0,
    lastUpdated: "2025-08-15",
  },
];

export function ProgramsListPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<ProgramItem[]>(mockProgramsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive" | "Archived"
  >("All");

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this program?")) {
      setPrograms(programs.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/dashboard/programs/${id}/edit`);
  };

  const categories = [
    "All",
    ...Array.from(new Set(programs.map((p) => p.category))),
  ];

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || program.category === categoryFilter;
    const matchesStatus =
      statusFilter === "All" || program.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
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
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Programs</h1>
          <p className="text-muted-foreground">
            Oversee academic programs, courses, and certifications
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/programs/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Program
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search programs by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {(["All", "Active", "Inactive", "Archived"] as const).map(
                (status) => (
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
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Programs Table */}
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
                    Program Title
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Duration
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                    Enrolled
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200">
                        {program.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {program.duration}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-foreground">
                          {program.enrolledStudents || 0}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs ${
                          program.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : program.status === "Inactive"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(program.lastUpdated)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(program.id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(program.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Stats Summary */}
      {filteredPrograms.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                {programs.filter((p) => p.status === "Active").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Students Enrolled
              </p>
              <p className="text-2xl text-blue-600">
                {programs.reduce(
                  (sum, p) => sum + (p.enrolledStudents || 0),
                  0,
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Categories</p>
              <p className="text-2xl text-purple-600">
                {new Set(programs.map((p) => p.category)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
