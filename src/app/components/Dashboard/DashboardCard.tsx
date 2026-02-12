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

export function DashboardCards() {
  const stats = [
    {
      title: "Total News",
      value: 156,
      icon: <Newspaper className="w-6 h-6 text-white" />,
      trend: { value: 12, isPositive: true },
      color: "#3b82f6",
    },
    {
      title: "Total Events",
      value: 48,
      icon: <Calendar className="w-6 h-6 text-white" />,
      trend: { value: 8, isPositive: true },
      color: "#8b5cf6",
    },
    {
      title: "Programs",
      value: 24,
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      trend: { value: 3, isPositive: false },
      color: "#f59e0b",
    },
    {
      title: "Gallery Albums",
      value: 89,
      icon: <Image className="w-6 h-6 text-white" />,
      trend: { value: 15, isPositive: true },
      color: "#10b981",
    },
    {
      title: "Enquiries",
      value: 342,
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      trend: { value: 23, isPositive: true },
      color: "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          color={stat.color}
        />
      ))}
    </div>
  );
}
