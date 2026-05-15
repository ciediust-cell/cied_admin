import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  CalendarDays,
  GraduationCap,
  Briefcase,
  Image,
  MessageSquare,
  Settings,
  Users,
  Award,
  Handshake,
  FileText,
  Building2,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  to: string;
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
    id: "dashboard",
    to: "/dashboard",
  },
  {
    icon: <Newspaper className="w-5 h-5" />,
    label: "News",
    id: "news",
    to: "/dashboard/news",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Events",
    id: "events",
    to: "/dashboard/events",
  },
  {
    icon: <CalendarDays className="w-5 h-5" />,
    label: "Workshops",
    id: "workshops",
    to: "/dashboard/workshops",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    label: "Facilities",
    id: "facilities",
    to: "/dashboard/facilities",
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    label: "Programs",
    id: "programs",
    to: "/dashboard/programs",
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    label: "Portfolio",
    id: "portfolio",
    to: "/dashboard/portfolio",
  },
  {
    icon: <Image className="w-5 h-5" />,
    label: "Gallery",
    id: "gallery",
    to: "/dashboard/gallery",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Members",
    id: "members",
    to: "/dashboard/members",
  },
  {
    icon: <Award className="w-5 h-5" />,
    label: "Awards",
    id: "awards",
    to: "/dashboard/awards",
  },
  {
    icon: <Handshake className="w-5 h-5" />,
    label: "Collaborators",
    id: "collaborators",
    to: "/dashboard/collaborators",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Board Message",
    id: "board-message",
    to: "/dashboard/board-message",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: "Enquiries",
    id: "enquiries",
    to: "/dashboard/enquiries",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: "Settings",
    id: "settings",
    to: "/dashboard/settings",
  },
];

export function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground text-sm">C</span>
          </div>
          <span className="text-foreground">CMS Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
      </div>
    </div>
  );
}
