import { useEffect, useState } from "react";
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
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  deleteAdminEnquiry,
  getAdminEnquiriesPaginated,
  getErrorMessage,
  markEnquiryAsRead,
  type EnquiryResponse,
  type PaginationMeta,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";

const PAGE_SIZE = 20;

export function EnquiriesListPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [enquiries, setEnquiries] = useState<EnquiryResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "New" | "Read">(
    "All",
  );
  const [selectedEnquiry, setSelectedEnquiry] =
    useState<EnquiryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });

  useEffect(() => {
    if (!accessToken) return;

    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const data = await getAdminEnquiriesPaginated({
          page,
          limit: PAGE_SIZE,
        });
        setEnquiries(data.data);
        setPagination(data.pagination);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to fetch enquiries"));
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [accessToken, page]);

  const updateLocalReadState = (id: string) => {
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
    setSelectedEnquiry((prev) =>
      prev && prev.id === id ? { ...prev, isRead: true } : prev,
    );
  };

  const handleMarkAsRead = async (id: string) => {
    if (markingReadIds.includes(id)) return;

    try {
      setMarkingReadIds((prev) => [...prev, id]);
      await markEnquiryAsRead(id);

      updateLocalReadState(id);
      toast.success("Marked as read");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to mark as read"));
    } finally {
      setMarkingReadIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleViewDetails = async (enquiry: EnquiryResponse) => {
    setSelectedEnquiry(enquiry);
    if (!enquiry.isRead) {
      await handleMarkAsRead(enquiry.id);
    }
  };

  const handleCloseDetails = () => {
    setSelectedEnquiry(null);
  };

  const handleDeleteEnquiry = async (enquiry: EnquiryResponse) => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to delete this enquiry?",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      setDeletingId(enquiry.id);
      await deleteAdminEnquiry(enquiry.id);

      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry(null);
      }

      if (enquiries.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        const refreshed = await getAdminEnquiriesPaginated({
          page,
          limit: PAGE_SIZE,
        });
        setEnquiries(refreshed.data);
        setPagination(refreshed.pagination);
      }

      toast.success("Enquiry deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete enquiry"));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const status = enquiry.isRead ? "Read" : "New";
    const matchesStatus = statusFilter === "All" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: pagination.total,
    new: enquiries.filter((e) => !e.isRead).length,
    read: enquiries.filter((e) => e.isRead).length,
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
          <p className="text-muted-foreground text-sm mb-1">New On This Page</p>
          <p className="text-2xl text-foreground">{stats.new}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Read On This Page</p>
          <p className="text-2xl text-foreground">{stats.read}</p>
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
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Loading enquiries...</p>
      )}

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
                      <p className="text-foreground">{enquiry.fullName}</p>
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
                      {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs ${
                          !enquiry.isRead
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {enquiry.isRead ? "Read" : "New"}
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
                          onClick={() => handleDeleteEnquiry(enquiry)}
                          disabled={deletingId === enquiry.id}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Delete enquiry"
                        >
                          {deletingId === enquiry.id ? (
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

        {/* Table Footer with Stats */}
        {filteredEnquiries.length > 0 && (
          <div className="px-6 py-4 bg-muted border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEnquiries.length} of {enquiries.length} enquiries on this page
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)} ({pagination.total}{" "}
          total)
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
                    !selectedEnquiry.isRead
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedEnquiry.isRead ? "Read" : "New"}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedEnquiry.createdAt).toLocaleDateString("en-US", {
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
                        {selectedEnquiry.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-foreground">{selectedEnquiry.fullName}</p>
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
                <button
                  onClick={() => handleDeleteEnquiry(selectedEnquiry)}
                  disabled={deletingId === selectedEnquiry.id}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {deletingId === selectedEnquiry.id ? (
                    <LoadingIndicator label="Deleting..." />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
                {!selectedEnquiry.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(selectedEnquiry.id)}
                    disabled={markingReadIds.includes(selectedEnquiry.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {markingReadIds.includes(selectedEnquiry.id) ? (
                      <LoadingIndicator label="Updating..." />
                    ) : (
                      "Mark as Read"
                    )}
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
