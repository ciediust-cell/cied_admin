import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

type MemberRole = "GOVERNANCE" | "MANAGEMENT" | "MENTOR" | "ADVISOR";

interface Member {
  id: string;
  name: string;
  designation: string;
  role: MemberRole;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

const roleLabel = (role: MemberRole) =>
  role.charAt(0) + role.slice(1).toLowerCase();

const sortByOrder = (members: Member[]) =>
  [...members].sort((a, b) => a.order - b.order);

export function MembersListPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/admin/members", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setMembers(sortByOrder(data));
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [accessToken]);

  const sortedMembers = useMemo(() => sortByOrder(members), [members]);

  const orderIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    sortedMembers.forEach((member, index) => map.set(member.id, index));
    return map;
  }, [sortedMembers]);

  const filteredMembers = sortedMembers.filter((member) => {
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.designation.toLowerCase().includes(q) ||
      roleLabel(member.role).toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:4000/api/admin/members/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error();

      setMembers((prev) => prev.filter((member) => member.id !== id));
      toast.success("Member deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (member: Member) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isActive: !member.isActive }),
      });

      if (!res.ok) throw new Error();

      setMembers((prev) =>
        prev.map((item) =>
          item.id === member.id ? { ...item, isActive: !item.isActive } : item,
        ),
      );
      toast.success("Member status updated");
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleMove = async (id: string, direction: -1 | 1) => {
    const currentIndex = orderIndexMap.get(id);
    if (currentIndex === undefined) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= sortedMembers.length) return;

    const currentMember = sortedMembers[currentIndex];
    const targetMember = sortedMembers[targetIndex];

    try {
      setLoading(true);

      const [resA, resB] = await Promise.all([
        fetch(`http://localhost:4000/api/admin/members/${currentMember.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ order: targetMember.order }),
        }),
        fetch(`http://localhost:4000/api/admin/members/${targetMember.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ order: currentMember.order }),
        }),
      ]);

      if (!resA.ok || !resB.ok) throw new Error();

      setMembers((prev) =>
        sortByOrder(
          prev.map((item) => {
            if (item.id === currentMember.id) {
              return { ...item, order: targetMember.order };
            }
            if (item.id === targetMember.id) {
              return { ...item, order: currentMember.order };
            }
            return item;
          }),
        ),
      );
      toast.success("Order updated");
    } catch {
      toast.error("Failed to reorder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Members</h1>
          <p className="text-muted-foreground">
            Manage members displayed on your website
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/members/addMember")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Member
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
            placeholder="Search members by name, designation or role..."
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
                <th className="text-left px-6 py-4 text-foreground">Order</th>
                <th className="text-left px-6 py-4 text-foreground">Photo</th>
                <th className="text-left px-6 py-4 text-foreground">Name</th>
                <th className="text-left px-6 py-4 text-foreground">
                  Designation
                </th>
                <th className="text-left px-6 py-4 text-foreground">Role</th>
                <th className="text-left px-6 py-4 text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const absoluteIndex = orderIndexMap.get(member.id) ?? -1;
                  const isFirst = absoluteIndex <= 0;
                  const isLast = absoluteIndex === sortedMembers.length - 1;

                  return (
                    <tr
                      key={member.id}
                      className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground min-w-[2rem]">
                            {member.order}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMove(member.id, -1)}
                              disabled={isFirst}
                              className={`p-0.5 rounded ${
                                isFirst
                                  ? "text-muted-foreground/30 cursor-not-allowed"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                              } transition-colors`}
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMove(member.id, 1)}
                              disabled={isLast}
                              className={`p-0.5 rounded ${
                                isLast
                                  ? "text-muted-foreground/30 cursor-not-allowed"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                              } transition-colors`}
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-border"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-foreground">{member.name}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-muted-foreground">
                          {member.designation}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {roleLabel(member.role)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                            member.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          title={member.isActive ? "Click to hide" : "Click to show"}
                        >
                          {member.isActive ? (
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
                              navigate(`/dashboard/members/${member.id}/edit`)
                            }
                            className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredMembers.length > 0 && (
          <div className="px-6 py-4 bg-muted border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {members.length} members
              {" • "}
              {members.filter((member) => member.isActive).length} active
              {" • "}
              {members.filter((member) => !member.isActive).length} inactive
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
