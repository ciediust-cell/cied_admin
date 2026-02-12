import { DashboardCards } from "../components/Dashboard/DashboardCard.tsx";
import { Activity } from "lucide-react";

export default function Dashboard() {
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
      <DashboardCards />

      {/* Recent Activity Section */}
      <div className="mt-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                action: "New enquiry received",
                time: "5 minutes ago",
                type: "enquiry",
              },
              {
                action: 'Event "Annual Day 2026" published',
                time: "2 hours ago",
                type: "event",
              },
              {
                action: "News article updated",
                time: "4 hours ago",
                type: "news",
              },
              {
                action: 'Gallery album "Sports Day" created',
                time: "1 day ago",
                type: "gallery",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-foreground text-sm">{activity.action}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {activity.time}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    activity.type === "enquiry"
                      ? "bg-red-100 text-red-700"
                      : activity.type === "event"
                        ? "bg-purple-100 text-purple-700"
                        : activity.type === "news"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                  }`}
                >
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Add News", icon: "ðŸ“°" },
          { label: "Create Event", icon: "ðŸ“…" },
          { label: "Upload Photos", icon: "ðŸ“¸" },
          { label: "View Enquiries", icon: "ðŸ’¬" },
        ].map((action) => (
          <button
            key={action.label}
            className="bg-card border border-border rounded-lg p-4 hover:bg-accent transition-colors text-left"
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <p className="text-foreground text-sm">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
