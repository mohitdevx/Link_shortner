export const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon = null,
  description = null,
  className = "",
}) => {
  // Infer changeType if not explicitly passed
  const isPositive =
    changeType === "positive" || (change && change.trim().startsWith("+"));
  const isNegative =
    changeType === "negative" || (change && change.trim().startsWith("-"));

  return (
    <div
      className={`p-4 bg-card text-card-foreground border border-border rounded-lg flex flex-col justify-between gap-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </span>
        {icon && (
          <div className="w-7 h-7 rounded border border-border bg-muted flex items-center justify-center text-foreground shrink-0">
            <i className={`${icon} text-sm leading-none`} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {value}
          </span>
          {change && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded border inline-flex items-center gap-0.5 ${
                isPositive
                  ? "bg-success-subtle text-success-subtle-foreground border-success/30"
                  : isNegative
                    ? "bg-error-subtle text-error-subtle-foreground border-error/30"
                    : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <i
                className={`text-[10px] leading-none ${
                  isPositive
                    ? "ri-arrow-up-line"
                    : isNegative
                      ? "ri-arrow-down-line"
                      : "ri-subtract-line"
                }`}
              />
              {change}
            </span>
          )}
        </div>

        {description && (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
