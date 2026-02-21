import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage, resetAdminPassword } from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [accessToken, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await resetAdminPassword({
        token,
        newPassword,
        confirmPassword,
      });
      toast.success(response.message);
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to reset password"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="size-full flex items-center justify-center bg-muted">
        <div className="w-full max-w-md px-6">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border text-center">
            <h1 className="text-foreground mb-2">Invalid Reset Link</h1>
            <p className="text-muted-foreground text-sm mb-6">
              This password reset link is missing a token. Please request a new link.
            </p>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Go to Forgot Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex items-center justify-center bg-muted">
      <div className="w-full max-w-md px-6">
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-foreground mb-2">Reset Password</h1>
            <p className="text-muted-foreground text-sm">
              Enter and confirm your new admin password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-foreground">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-foreground">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype new password"
                required
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <LoadingIndicator label="Updating..." className="justify-center" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
