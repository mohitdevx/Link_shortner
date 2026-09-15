import { useEffect } from "react";
import { Button } from "../atoms/Button.jsx";

const iconMap = {
  destructive: {
    icon: "ri-delete-bin-line",
    color: "text-error bg-error-subtle border-error/30",
  },
  warning: {
    icon: "ri-alert-line",
    color: "text-warning bg-warning-subtle border-warning/30",
  },
  info: {
    icon: "ri-question-line",
    color: "text-info bg-info-subtle border-info/30",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none"
    >
      <div className="w-full max-w-md bg-popover text-popover-foreground border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded flex items-center justify-center border shrink-0 ${currentIcon.color}`}
          >
            <i className={`${currentIcon.icon} text-xl leading-none`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground leading-snug">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3.5 bg-muted border-t border-border flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "primary"}
            size="md"
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
