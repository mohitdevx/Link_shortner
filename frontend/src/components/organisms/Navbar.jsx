import { ThemeToggle } from "../atoms/ThemeToggle.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export const Navbar = ({ activeView, onViewChange, onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => onViewChange("home")}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none select-none"
          >
            {/* Large link icon without background */}
            <i className="ri-link-m text-3xl font-semibold text-primary leading-none transition-transform duration-200 group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-foreground font-sans">
              shortlink
            </span>
          </button>

          {/* Clean, minimal nav links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <button
              type="button"
              onClick={() => onViewChange("home")}
              className={`font-medium transition-colors cursor-pointer ${
                activeView === "home"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => onViewChange("dashboard")}
                className={`font-medium transition-colors cursor-pointer ${
                  activeView === "dashboard"
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="h-4 w-px bg-border/50 hidden sm:block" />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onViewChange("dashboard")}
                className="hidden md:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Go to dashboard"
              >
                <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-medium text-xs">
                  {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground max-w-[120px] truncate">
                  {user?.fullName || user?.username}
                </span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/60 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth("login")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth("signup")}
                className="text-sm font-medium bg-foreground text-background hover:opacity-90 px-3.5 py-1.5 rounded-lg transition-opacity shadow-xs cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
