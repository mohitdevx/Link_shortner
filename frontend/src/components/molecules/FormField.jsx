import { Input } from "../atoms/Input.jsx";

export const FormField = ({
  id,
  label,
  error,
  hint,
  required = false,
  className = "",
  ...inputProps
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="text-xs font-semibold text-foreground select-none"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          {hint && !error && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
        </div>
      )}
      <Input id={id} error={!!error} {...inputProps} />
      {error && (
        <p className="text-xs text-error flex items-center gap-1 mt-1 leading-none">
          <i className="ri-error-warning-line text-xs" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
