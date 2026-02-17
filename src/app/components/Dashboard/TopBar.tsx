import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { useAdminLogout } from "../../hooks/useAdminLogout";
import { confirmToast } from "../../lib/confirmToast";
import { LoadingIndicator } from "../ui/loading-indicator";

export function TopBar() {
  const logoutAndRedirect = useAdminLogout();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    const confirmed = await confirmToast({
      message: "Are you sure you want to log out?",
      confirmText: "Log Out",
    });
    if (!confirmed) return;

    try {
      setLoggingOut(true);
      await logoutAndRedirect();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between">
      {/* Page Title */}
      <div>
        <h2 className="text-foreground">Dashboard</h2>
      </div>

      {/* Admin Profile and Logout */}
      <div className="flex items-center gap-4">
        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-sm">
            <p className="text-foreground">Admin User</p>
            <p className="text-muted-foreground text-xs">admin@cms.com</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          title="Logout"
        >
          {loggingOut ? (
            <LoadingIndicator label="Logging out..." />
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
