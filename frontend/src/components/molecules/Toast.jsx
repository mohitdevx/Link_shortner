import { useEffect } from "react";

const toastConfig = {
  success: {
    icon: "ri-checkbox-circle-line text-emerald-500",
  },
  error: {
    icon: "ri-error-warning-line text-red-500",
  },
  warning: {
    icon: "ri-alert-line text-amber-500",
  },
  info: {
    icon: "ri-information-line text-blue-500",
  },
};

export const Toast = ({
  id,
  type = "info",
  title,
  message,
  duration = 3500,
  onClose,
}) => {
  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const config = toastConfig[type] || toastConfig.info;

  // Don't display redundant stacked title if it is just "Success", "Error", or "Information"
  const hasCustomTitle =
    title &&
    title.toLowerCase() !== type.toLowerCase() &&
    title.toLowerCase() !== "information";

  return (
    <div
      role="alert"
      className="flex items-center gap-2.5 min-w-[260px] max-w-sm px-3.5 py-2.5 rounded-lg border border-border/40 bg-card/95 backdrop-blur-md text-foreground shadow-lg shadow-black/5 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <i className={`${config.icon} text-base shrink-0 leading-none`} />

      <div className="flex-1 min-w-0 pr-1">
        {hasCustomTitle ? (
          <>
            <h4 className="text-xs font-semibold text-foreground leading-tight">
              {title}
            </h4>
            {message && (
              <p className="text-2xs text-muted-foreground mt-0.5 leading-snug break-words">
                {message}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs font-medium text-foreground leading-snug break-words">
            {message || title}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-muted-foreground/60 hover:text-foreground p-1 rounded transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss"
      >
        <i className="ri-close-line text-sm leading-none" />
      </button>
    </div>
  );
};

