import { useEffect } from "react";

const toastIcons = {
  success: "ri-checkbox-circle-fill text-success",
  error: "ri-error-warning-fill text-error",
  warning: "ri-alert-fill text-warning",
  info: "ri-information-fill text-info",
};

const toastBorderColors = {
  success: "border-l-4 border-l-success",
  error: "border-l-4 border-l-error",
  warning: "border-l-4 border-l-warning",
  info: "border-l-4 border-l-info",
};

export const Toast = ({
  id,
  type = "info",
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 w-80 max-w-full p-3.5 bg-card text-card-foreground border border-border ${toastBorderColors[type] || toastBorderColors.info} rounded shadow-sm`}
    >
      <i
        className={`${toastIcons[type] || toastIcons.info} text-lg leading-none mt-0.5 shrink-0`}
      />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-foreground leading-snug">
            {title}
          </h4>
        )}
        {message && (
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            {message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded transition-colors shrink-0"
        aria-label="Close notification"
      >
        <i className="ri-close-line text-base leading-none" />
      </button>
    </div>
  );
};
