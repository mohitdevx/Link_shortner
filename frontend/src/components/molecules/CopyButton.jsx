import { useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";

export const CopyButton = ({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  showToast = true,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (showToast) {
        toast.success("Copied to clipboard!");
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (showToast) {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer select-none ${
        copied
          ? "bg-success-subtle text-success-subtle-foreground border-success/30"
          : "bg-secondary text-secondary-foreground border-border hover:bg-secondary-hover"
      } ${className}`}
      title={copied ? copiedLabel : label}
    >
      <i
        className={`${copied ? "ri-check-line text-success" : "ri-file-copy-line"} text-sm leading-none`}
      />
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
};
