export const Kbd = ({ children, className = "" }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono text-[11px] font-medium px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground shadow-2xs select-none ${className}`}
    >
      {children}
    </kbd>
  );
};
