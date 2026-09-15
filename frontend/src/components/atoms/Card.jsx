export const Card = ({ children, className = "", hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-card text-card-foreground border border-border rounded-lg overflow-hidden ${
        hoverable ? "transition-colors hover:border-primary/50 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", action = null }) => {
  return (
    <div
      className={`px-5 py-4 border-b border-border flex items-center justify-between gap-3 ${className}`}
    >
      <div className="space-y-0.5">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardTitle = ({ children, className = "" }) => {
  return (
    <h3
      className={`text-base font-semibold text-foreground tracking-tight leading-tight ${className}`}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = "" }) => {
  return (
    <p className={`text-xs text-muted-foreground leading-normal ${className}`}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = "" }) => {
  return (
    <div
      className={`px-5 py-3.5 bg-muted border-t border-border flex items-center justify-between gap-3 text-xs text-muted-foreground ${className}`}
    >
      {children}
    </div>
  );
};
