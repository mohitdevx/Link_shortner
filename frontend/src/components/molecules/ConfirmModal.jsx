import { useEffect } from "react";

const iconMap = {
  destructive: {
    icon: "ri-delete-bin-line",
    style: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  warning: {
    icon: "ri-alert-line",
    style: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: "ri-information-line",
    style: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
};

export const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const currentIcon = iconMap[variant] || iconMap.destructive;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-all animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-xl border border-border/40 bg-card text-card-foreground p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Dismiss X */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 text-muted-foreground/60 hover:text-foreground rounded transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <i className="ri-close-line text-base leading-none" />
        </button>

        {/* Content Header */}
        <div className="flex items-start gap-3.5 pr-6">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base ${currentIcon.style}`}
          >
            <i className={`${currentIcon.icon} leading-none`} />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-semibold text-foreground tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed break-words">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-8.5 px-3.5 rounded-md border border-border/40 bg-transparent hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 select-none"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-8.5 px-3.5 rounded-md text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-primary hover:bg-primary-hover text-primary-foreground"
            }`}
          >
            {isLoading && <i className="ri-loader-4-line animate-spin text-xs" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
