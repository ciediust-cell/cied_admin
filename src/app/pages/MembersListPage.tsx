import { useState } from "react";
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

interface Member {
  id: number;
  name: string;
  role: string;
  photo: string;
  order: number;
  isActive: boolean;
}

const mockMembersData: Member[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Principal",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    order: 1,
    isActive: true,
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    role: "Vice Principal",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    order: 2,
    isActive: true,
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    role: "Head of Science Department",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    order: 3,
    isActive: true,
  },
  {
    id: 4,
    name: "Mr. David Martinez",
    role: "Head of Mathematics Department",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    order: 4,
    isActive: true,
  },
  {
    id: 5,
    name: "Ms. Jennifer Brown",
    role: "Head of English Department",
    photo:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    order: 5,
    isActive: true,
  },
  {
    id: 6,
    name: "Prof. Robert Taylor",
    role: "Sports Director",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    order: 6,
    isActive: false,
  },
  {
    id: 7,
    name: "Dr. Lisa Anderson",
    role: "Admissions Head",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    order: 7,
    isActive: true,
  },
  {
    id: 8,
    name: "Mr. James Wilson",
    role: "IT Coordinator",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
    order: 8,
    isActive: false,
  },
];

export function MembersListPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(mockMembersData);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this member?")) {
      setMembers(members.filter((member) => member.id !== id));
    }
  };

  const handleToggleActive = (id: number) => {
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, isActive: !member.isActive } : member,
      ),
    );
  };

  const handleMoveUp = (id: number) => {
    const index = members.findIndex((m) => m.id === id);
    if (index > 0) {
      const newMembers = [...members];
      [newMembers[index - 1], newMembers[index]] = [
        newMembers[index],
        newMembers[index - 1],
      ];
      // Update order numbers
      newMembers.forEach((member, idx) => {
        member.order = idx + 1;
      });
      setMembers(newMembers);
    }
  };

  const handleMoveDown = (id: number) => {
    const index = members.findIndex((m) => m.id === id);
    if (index < members.length - 1) {
      const newMembers = [...members];
      [newMembers[index], newMembers[index + 1]] = [
        newMembers[index + 1],
        newMembers[index],
      ];
      // Update order numbers
      newMembers.forEach((member, idx) => {
        member.order = idx + 1;
      });
      setMembers(newMembers);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Members</h1>
          <p className="text-muted-foreground">
            Manage faculty and staff members displayed on your website
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/members/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-foreground">Order</th>
                <th className="text-left px-6 py-4 text-foreground">Photo</th>
                <th className="text-left px-6 py-4 text-foreground">Name</th>
                <th className="text-left px-6 py-4 text-foreground">Role</th>
                <th className="text-left px-6 py-4 text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    {/* Order Column with Reorder Buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground min-w-[2rem]">
                          {member.order}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveUp(member.id)}
                            disabled={index === 0}
                            className={`p-0.5 rounded ${
                              index === 0
                                ? "text-muted-foreground/30 cursor-not-allowed"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            } transition-colors`}
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(member.id)}
                            disabled={index === filteredMembers.length - 1}
                            className={`p-0.5 rounded ${
                              index === filteredMembers.length - 1
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

                    {/* Photo Column */}
                    <td className="px-6 py-4">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                      />
                    </td>

                    {/* Name Column */}
                    <td className="px-6 py-4">
                      <p className="text-foreground">{member.name}</p>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4">
                      <p className="text-muted-foreground">{member.role}</p>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(member.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                          member.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        title={
                          member.isActive ? "Click to hide" : "Click to show"
                        }
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

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/members/${member.id}/edit`)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Stats */}
        {filteredMembers.length > 0 && (
          <div className="px-6 py-4 bg-muted border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {members.length} members
              {" • "}
              {members.filter((m) => m.isActive).length} active
              {" • "}
              {members.filter((m) => !m.isActive).length} inactive
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
