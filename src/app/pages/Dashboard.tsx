import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardCards, type DashboardStats } from "../components/Dashboard/DashboardCard.tsx";
import {
  Activity,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  type ActivityType,
  getDashboardSummary,
  getErrorMessage,
  type DashboardRecentActivityResponse,
} from "../lib/adminApiClient";

export default function Dashboard() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [stats, setStats] = useState<DashboardStats>({
    totalNews: 0,
    totalEvents: 0,
    totalPrograms: 0,
    totalGalleryAlbums: 0,
    totalEnquiries: 0,
  });
  const [recentActivity, setRecentActivity] = useState<
    DashboardRecentActivityResponse[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const fetchDashboardSummary = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load dashboard data"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [accessToken]);

  const relativeTime = useMemo(() => {
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    return (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));

      if (Math.abs(diffMinutes) < 60) {
        return formatter.format(diffMinutes, "minute");
      }

      const diffHours = Math.round(diffMinutes / 60);
      if (Math.abs(diffHours) < 24) {
        return formatter.format(diffHours, "hour");
      }

      const diffDays = Math.round(diffHours / 24);
      return formatter.format(diffDays, "day");
    };
  }, []);

  const activityBadgeClass = (type: ActivityType) => {
    if (type === "enquiry") return "bg-red-100 text-red-700";
    if (type === "event") return "bg-purple-100 text-purple-700";
    if (type === "news") return "bg-blue-100 text-blue-700";
    if (type === "gallery") return "bg-green-100 text-green-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Welcome back, Admin!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your institutional website today.
        </p>
      </div>

      {/* Stats Cards */}
      {loading && (
        <p className="text-sm text-muted-foreground mb-4">Loading dashboard data...</p>
      )}
      <DashboardCards stats={stats} />

      {/* Recent Activity Section */}
      <div className="mt-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity found.</p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-foreground text-sm">{activity.action}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {relativeTime(activity.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${activityBadgeClass(
                      activity.type,
                    )}`}
                  >
                    {activity.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Add News",
            icon: <Newspaper className="w-6 h-6" />,
            path: "/dashboard/news/createNews",
          },
          {
            label: "Create Event",
            icon: <Calendar className="w-6 h-6" />,
            path: "/dashboard/events/createEvent",
          },
          {
            label: "Upload Photos",
            icon: <ImageIcon className="w-6 h-6" />,
            path: "/dashboard/gallery/new",
          },
          {
            label: "View Enquiries",
            icon: <MessageSquare className="w-6 h-6" />,
            path: "/dashboard/enquiries",
          },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="bg-card border border-border rounded-lg p-4 hover:bg-accent transition-colors text-left"
          >
            <div className="text-primary mb-2">{action.icon}</div>
            <p className="text-foreground text-sm">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
