import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, User, Mail, Phone, KeyRound } from "lucide-react";

interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  lastLogin: string;
}

export function SettingsProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile>({
    name: "Admin User",
    email: "admin@cied.edu",
    phone: "+1 (555) 010-2000",
    role: "System Administrator",
    lastLogin: "Feb 10, 2026 â€¢ 9:42 AM",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const handleProfileChange = (
    field: keyof AdminProfile,
    value: string,
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (
    field: "current" | "next" | "confirm",
    value: string,
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      navigate("/");
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your account details and security preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Details */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-foreground">Admin Details</h2>
                <p className="text-muted-foreground text-sm">{profile.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase">
                Last login
              </p>
              <p className="text-foreground text-sm">{profile.lastLogin}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Full name</label>
              <div className="relative mt-2">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <div className="relative mt-2">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <div className="relative mt-2">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </div>

        {/* Security & Logout */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-foreground">Change Password</h2>
                <p className="text-muted-foreground text-sm">
                  Keep your account secure
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Current password
                </label>
                <div className="relative mt-2">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      handlePasswordChange("current", e.target.value)
                    }
                    className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  New password
                </label>
                <div className="relative mt-2">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={passwords.next}
                    onChange={(e) =>
                      handlePasswordChange("next", e.target.value)
                    }
                    className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Confirm new password
                </label>
                <div className="relative mt-2">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      handlePasswordChange("confirm", e.target.value)
                    }
                    className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <button className="mt-6 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Update Password
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-foreground">Logout</h2>
                <p className="text-muted-foreground text-sm">
                  End your current session
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
