import {
  Newspaper,
  Calendar,
  GraduationCap,
  Image,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

export interface DashboardStats {
  totalNews: number;
  totalEvents: number;
  totalPrograms: number;
  totalGalleryAlbums: number;
  totalEnquiries: number;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <h3 className="text-3xl text-foreground mb-2">{value}</h3>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}% from last month</span>
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface DashboardCardsProps {
  stats: DashboardStats;
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  const statCards = [
    {
      title: "Total News",
      value: stats.totalNews,
      icon: <Newspaper className="w-6 h-6 text-white" />,
      color: "#3b82f6",
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: <Calendar className="w-6 h-6 text-white" />,
      color: "#8b5cf6",
    },
    {
      title: "Programs",
      value: stats.totalPrograms,
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      color: "#f59e0b",
    },
    {
      title: "Gallery Albums",
      value: stats.totalGalleryAlbums,
      icon: <Image className="w-6 h-6 text-white" />,
      color: "#10b981",
    },
    {
      title: "Enquiries",
      value: stats.totalEnquiries,
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      color: "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}
