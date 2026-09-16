export const EmptyState = ({
  icon = "ri-inbox-line",
  title = "No data available",
  description = "Get started by creating your first item.",
  action = null,
  className = "",
}) => {
  return (
    <div
      className={`py-12 px-4 text-center flex flex-col items-center justify-center bg-transparent ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3 shrink-0">
        <i className={`${icon} text-lg leading-none`} />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-3 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
