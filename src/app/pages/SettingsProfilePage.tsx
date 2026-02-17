import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, User, Mail, Phone, KeyRound } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { useAdminLogout } from "../hooks/useAdminLogout";
import {
  changeAdminPassword,
  getAdminProfile,
  getErrorMessage,
  updateAdminProfile,
} from "../lib/adminApiClient";
import { confirmToast } from "../lib/confirmToast";
import { LoadingIndicator } from "../components/ui/loading-indicator";

interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  lastLogin: string;
}

export function SettingsProfilePage() {
  const navigate = useNavigate();
  const { accessToken, logout } = useAuthStore();
  const logoutAndRedirect = useAdminLogout();
  const [profile, setProfile] = useState<AdminProfile>({
    name: "Admin User",
    email: "admin@cied.edu",
    phone: "+1 (555) 010-2000",
    role: "System Administrator",
    lastLogin: "Feb 10, 2026 - 9:42 AM",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const data = await getAdminProfile();

        const rawRole = String(data.role || "admin");
        const roleLabel =
          rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

        setProfile((prev) => ({
          ...prev,
          email: data.email,
          role: roleLabel,
          lastLogin: data.updatedAt
            ? new Date(data.updatedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : prev.lastLogin,
        }));
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load profile"));
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

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

  const handleLogout = async () => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to log out?",
      confirmText: "Log Out",
      confirmClassName:
        "bg-destructive text-destructive-foreground hover:opacity-90",
    });
    if (!confirmed) return;

    try {
      setLoggingOut(true);
      await logoutAndRedirect();
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const data = await updateAdminProfile({
        email: profile.email,
      });

      if (data?.admin?.email) {
        setProfile((prev) => ({ ...prev, email: data.admin.email }));
      }

      toast.success(data?.message || "Profile updated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwords.next !== passwords.confirm) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setUpdatingPassword(true);
      const data = await changeAdminPassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
        confirmPassword: passwords.confirm,
      });

      setPasswords({
        current: "",
        next: "",
        confirm: "",
      });

      toast.success(data?.message || "Password updated. Please login again.");
      logout();
      navigate("/login");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to change password"));
    } finally {
      setUpdatingPassword(false);
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

      {loadingProfile && (
        <p className="text-sm text-muted-foreground mb-4">Loading profile...</p>
      )}

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
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {savingProfile ? (
                <LoadingIndicator label="Saving..." />
              ) : (
                "Save Changes"
              )}
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

            <button
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
              className="mt-6 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {updatingPassword ? (
                <LoadingIndicator label="Updating..." className="justify-center" />
              ) : (
                "Update Password"
              )}
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
              disabled={loggingOut}
              className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loggingOut ? (
                <LoadingIndicator label="Logging out..." className="justify-center" />
              ) : (
                "Log Out"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
