export const Spinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-sm",
    lg: "w-8 h-8 text-lg",
  };

  return (
    <i
      className={`ri-loader-4-line animate-spin inline-block text-current ${sizeClasses[size] || sizeClasses.md} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
};
