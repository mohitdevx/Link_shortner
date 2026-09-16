import { useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";

export const CopyButton = ({
  text,
  label = null,
  copiedLabel = "Copied",
  showToast = true,
  className = "",
  title = "Copy to clipboard",
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

  const isIconOnly = !label;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none bg-transparent ${
        isIconOnly
          ? "w-7 h-7 rounded-md"
          : "gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border/40"
      } ${
        copied
          ? "text-emerald-500 bg-emerald-500/15 border-emerald-500/30"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      } ${className}`}
      title={copied ? copiedLabel : title}
      aria-label={copied ? copiedLabel : title}
    >
      <i
        className={`${
          copied
            ? "ri-check-line text-emerald-500 scale-110"
            : "ri-clipboard-line"
        } text-sm leading-none transition-transform duration-150`}
      />
      {label && <span>{copied ? copiedLabel : label}</span>}
    </button>
  );
};

