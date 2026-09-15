import { useEffect, useState } from "react";

export const ThemeToggle = ({ className = "" }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((prev) => !prev)}
      className={`inline-flex items-center justify-center p-2 rounded border border-border bg-secondary text-secondary-foreground hover:bg-secondary-hover transition-colors cursor-pointer select-none ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <i
        className={`${isDark ? "ri-sun-line text-warning" : "ri-moon-line text-foreground"} text-base leading-none`}
      />
    </button>
  );
};
