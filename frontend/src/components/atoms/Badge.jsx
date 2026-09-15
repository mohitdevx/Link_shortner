export const Badge = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}) => {
  const variantClasses = {
    neutral: "bg-secondary text-secondary-foreground border-border",
    primary: "bg-primary text-primary-foreground border-primary",
    success:
      "bg-success-subtle text-success-subtle-foreground border-success/30",
    error: "bg-error-subtle text-error-subtle-foreground border-error/30",
    warning:
      "bg-warning-subtle text-warning-subtle-foreground border-warning/30",
    info: "bg-info-subtle text-info-subtle-foreground border-info/30",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${variantClasses[variant] || variantClasses.neutral} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {children}
    </span>
  );
};
