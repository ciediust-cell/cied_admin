import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  forgotAdminPassword,
  getErrorMessage,
  type ForgotPasswordResponse,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [responseData, setResponseData] = useState<ForgotPasswordResponse | null>(null);

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
      const data = await forgotAdminPassword({ email });
      setResponseData(data);
      toast.success(data.message);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to process forgot password request"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-muted">
      <div className="w-full max-w-md px-6">
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-foreground mb-2">Forgot Password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your admin email to receive reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
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
                <LoadingIndicator label="Sending..." className="justify-center" />
              ) : (
                "Send Reset Link"
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

          {responseData?.resetUrl && (
            <div className="mt-6 p-3 bg-muted rounded-md border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Development reset link:
              </p>
              <a
                href={responseData.resetUrl}
                className="text-xs break-all text-primary hover:underline"
              >
                {responseData.resetUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
