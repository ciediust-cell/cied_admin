import toast from "react-hot-toast";

interface ConfirmToastOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
}

export const confirmToast = ({
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmClassName = "bg-destructive text-destructive-foreground hover:opacity-90",
}: ConfirmToastOptions): Promise<boolean> =>
  new Promise((resolve) => {
    let settled = false;

    const settle = (value: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(value);
    };

    const toastId = toast.custom(
      (t) => (
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-lg">
          <p className="text-sm text-foreground">{message}</p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                settle(false);
              }}
              className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                settle(true);
              }}
              className={`rounded-md px-3 py-1.5 text-sm transition-opacity ${confirmClassName}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" },
    );

    const timeoutId = window.setTimeout(() => {
      toast.dismiss(toastId);
      settle(false);
    }, 30000);
  });
