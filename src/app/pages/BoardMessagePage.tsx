import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  getAdminBoardMessage,
  getErrorMessage,
  saveAdminBoardMessage,
  type BoardMessageUpsertPayload,
} from "../lib/adminApiClient";
import { LoadingIndicator } from "../components/ui/loading-indicator";

export function BoardMessagePage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Message from the Board of Directors");
  const [message, setMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorDesignation, setAuthorDesignation] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const fetchBoardMessage = async () => {
      try {
        setLoading(true);
        const data = await getAdminBoardMessage();
        if (!data) return;

        setTitle(data.title || "Message from the Board of Directors");
        setMessage(data.message || "");
        setAuthorName(data.authorName || "");
        setAuthorDesignation(data.authorDesignation || "");
        setIsActive(Boolean(data.isActive));
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load board message"));
      } finally {
        setLoading(false);
      }
    };

    void fetchBoardMessage();
  }, [accessToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }

    try {
      setLoading(true);
      const payload: BoardMessageUpsertPayload = {
        title: title.trim(),
        message: message.trim(),
        isActive,
      };

      if (authorName.trim()) payload.authorName = authorName.trim();
      if (authorDesignation.trim()) {
        payload.authorDesignation = authorDesignation.trim();
      }

      await saveAdminBoardMessage(payload);
      toast.success("Board message saved successfully");
      navigate("/dashboard");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save board message"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-foreground mb-2">Board of Directors Message</h1>
        <p className="text-muted-foreground">
          Edit the message shown on the public Board of Directors section
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Processing...</p>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground">Message Content</h3>
              <p className="text-sm text-muted-foreground">
                Keep the title short and the message direct
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-foreground mb-2">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-foreground mb-2">
                Message <span className="text-destructive">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                placeholder="Write the board message here..."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <h3 className="text-foreground mb-4">Author Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="authorName" className="block text-foreground mb-2">
                  Author Name
                </label>
                <input
                  id="authorName"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Board chair / director name"
                />
              </div>
              <div>
                <label
                  htmlFor="authorDesignation"
                  className="block text-foreground mb-2"
                >
                  Author Designation
                </label>
                <input
                  id="authorDesignation"
                  type="text"
                  value={authorDesignation}
                  onChange={(e) => setAuthorDesignation(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Chairperson, Board of Directors"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <div>
              <p className="text-foreground text-sm">Display on website</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hide or show the board message publicly
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <LoadingIndicator label="Saving..." />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Message
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
