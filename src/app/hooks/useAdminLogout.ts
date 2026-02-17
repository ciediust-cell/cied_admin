import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { logoutAdmin } from "../lib/adminApiClient";

export function useAdminLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return async () => {
    try {
      await logoutAdmin();
    } catch {
      // Clear local auth state even if server logout request fails.
    }

    logout();
    navigate("/login", { replace: true });
  };
}
