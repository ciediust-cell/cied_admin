import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "Read" | "Responded";
}

const mockEnquiriesData: Enquiry[] = [
  {
    id: 1,
    name: "John Anderson",
    email: "john.anderson@email.com",
    phone: "+1 (555) 234-5678",
    subject: "Admission Process for Grade 9",
    message:
      "Hello, I would like to know more about the admission process for Grade 9. What are the requirements and when does the application period start? Also, could you provide information about the entrance exam?",
    date: "2026-02-10",
    status: "New",
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    email: "maria.r@email.com",
    phone: "+1 (555) 345-6789",
    subject: "Information about Science Program",
    message:
      "I am interested in learning more about your Science program. What subjects are covered and what are the laboratory facilities like? My daughter is particularly interested in Biology and Chemistry.",
    date: "2026-02-09",
    status: "New",
  },
  {
    id: 3,
    name: "David Chen",
    email: "david.chen@email.com",
    subject: "Sports Facilities Inquiry",
    message:
      "Could you provide details about the sports facilities available? Does the school have a swimming pool and basketball courts? Also, are there any competitive sports teams?",
    date: "2026-02-09",
    status: "Read",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.w@email.com",
    phone: "+1 (555) 456-7890",
    subject: "Scholarship Opportunities",
    message:
      "I am writing to inquire about scholarship opportunities for academically talented students. What are the eligibility criteria and application process for merit-based scholarships?",
    date: "2026-02-08",
    status: "Responded",
  },
  {
    id: 5,
    name: "Michael Thompson",
    email: "michael.t@email.com",
    subject: "Transfer Student Inquiry",
    message:
      "My family is relocating to the area and I would like to transfer my son to your institution for Grade 10. What is the process for mid-year transfers?",
    date: "2026-02-08",
    status: "Read",
  },
  {
    id: 6,
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 (555) 567-8901",
    subject: "After-School Programs",
    message:
      "Do you offer after-school programs? I am particularly interested in music and arts programs for elementary students.",
    date: "2026-02-07",
    status: "Responded",
  },
  {
    id: 7,
    name: "Robert Martinez",
    email: "r.martinez@email.com",
    subject: "Transportation Services",
    message:
      "Does the school provide transportation services? If so, what areas are covered and what are the costs involved?",
    date: "2026-02-07",
    status: "Responded",
  },
  {
    id: 8,
    name: "Lisa Johnson",
    email: "lisa.j@email.com",
    phone: "+1 (555) 678-9012",
    subject: "Parent-Teacher Meeting Schedule",
    message:
      "When is the next parent-teacher meeting scheduled? I would like to discuss my child's academic progress.",
    date: "2026-02-06",
    status: "Responded",
  },
];

export function EnquiriesListPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(mockEnquiriesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "New" | "Read" | "Responded"
  >("All");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      setEnquiries(enquiries.filter((enquiry) => enquiry.id !== id));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null);
      }
    }
  };

  const handleViewDetails = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    // Mark as read when viewed
    if (enquiry.status === "New") {
      setEnquiries(
        enquiries.map((e) =>
          e.id === enquiry.id ? { ...e, status: "Read" as const } : e,
        ),
      );
    }
  };

  const handleCloseDetails = () => {
    setSelectedEnquiry(null);
  };

  const handleMarkAsResponded = (id: number) => {
    setEnquiries(
      enquiries.map((e) =>
        e.id === id ? { ...e, status: "Responded" as const } : e,
      ),
    );
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: "Responded" });
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || enquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === "New").length,
    read: enquiries.filter((e) => e.status === "Read").length,
    responded: enquiries.filter((e) => e.status === "Responded").length,
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Manage Enquiries</h1>
        <p className="text-muted-foreground">
          Review and respond to enquiries from prospective students and parents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Total Enquiries</p>
          <p className="text-2xl text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">New</p>
          <p className="text-2xl text-foreground">{stats.new}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Read</p>
          <p className="text-2xl text-foreground">{stats.read}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Responded</p>
          <p className="text-2xl text-foreground">{stats.responded}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Read">Read</option>
              <option value="Responded">Responded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-foreground">Name</th>
                <th className="text-left px-6 py-4 text-foreground">Email</th>
                <th className="text-left px-6 py-4 text-foreground">Subject</th>
                <th className="text-left px-6 py-4 text-foreground">Date</th>
                <th className="text-left px-6 py-4 text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No enquiries found
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-foreground">{enquiry.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-muted-foreground text-sm">
                        {enquiry.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{enquiry.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(enquiry.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs ${
                          enquiry.status === "New"
                            ? "bg-blue-100 text-blue-700"
                            : enquiry.status === "Read"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(enquiry)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(enquiry.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Stats */}
        {filteredEnquiries.length > 0 && (
          <div className="px-6 py-4 bg-muted border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEnquiries.length} of {enquiries.length} enquiries
            </p>
          </div>
        )}
      </div>

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-foreground">Enquiry Details</h2>
              <button
                onClick={handleCloseDetails}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs ${
                    selectedEnquiry.status === "New"
                      ? "bg-blue-100 text-blue-700"
                      : selectedEnquiry.status === "Read"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedEnquiry.status}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedEnquiry.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-foreground">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm">
                        {selectedEnquiry.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-foreground">{selectedEnquiry.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="hover:text-primary transition-colors"
                    >
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  {selectedEnquiry.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a
                        href={`tel:${selectedEnquiry.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {selectedEnquiry.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <h3 className="text-foreground">Subject</h3>
                <p className="text-foreground">{selectedEnquiry.subject}</p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h3 className="text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">
                    {selectedEnquiry.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between gap-4">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-accent transition-colors"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                {selectedEnquiry.status !== "Responded" && (
                  <button
                    onClick={() => handleMarkAsResponded(selectedEnquiry.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                  >
                    Mark as Responded
                  </button>
                )}
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Re: ${selectedEnquiry.subject}`}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
