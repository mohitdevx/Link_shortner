export const EmptyState = ({
  icon = "ri-inbox-line",
  title = "No data available",
  description = "Get started by creating your first item.",
  action = null,
  className = "",
}) => {
  return (
    <div
      className={`p-8 text-center flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-card/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full border border-border bg-muted flex items-center justify-center text-muted-foreground mb-3 shrink-0">
        <i className={`${icon} text-2xl leading-none`} />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
