export const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  icon = null,
  iconRight = null,
  className = "",
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <i
          className={`${icon} absolute left-3 text-muted-foreground text-base pointer-events-none leading-none`}
        />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full text-sm rounded border bg-background text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
          icon ? "pl-9" : "pl-3.5"
        } ${iconRight ? "pr-9" : "pr-3.5"} py-2 ${
          error
            ? "border-error focus:ring-error focus:border-error"
            : "border-border focus:ring-ring focus:border-ring"
        } ${className}`}
        {...props}
      />
      {iconRight && (
        <div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground text-base">
          <i className={`${iconRight} leading-none`} />
        </div>
      )}
    </div>
  );
};
