import { Spinner } from "./Spinner.jsx";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon = null,
  iconRight = null,
  onClick,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none rounded border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
    icon: "p-2 aspect-square",
  };

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground border-primary hover:bg-primary-hover active:bg-primary-hover",
    secondary:
      "bg-secondary text-secondary-foreground border-border hover:bg-secondary-hover active:bg-secondary-hover",
    destructive:
      "bg-error text-error-foreground border-error hover:bg-error/90 active:bg-error/90",
    outline:
      "bg-transparent text-foreground border-border hover:bg-muted active:bg-secondary",
    ghost:
      "bg-transparent text-foreground border-transparent hover:bg-muted active:bg-secondary",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "lg" ? "md" : "sm"} />
      ) : (
        icon && <i className={`${icon} text-base leading-none`} />
      )}
      {children}
      {!loading && iconRight && (
        <i className={`${iconRight} text-base leading-none`} />
      )}
    </button>
  );
};
