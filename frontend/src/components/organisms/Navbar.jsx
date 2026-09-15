import { Button } from "../atoms/Button.jsx";
import { ThemeToggle } from "../atoms/ThemeToggle.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export const Navbar = ({ activeView, onViewChange, onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => onViewChange("home")}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            {/* Logo icon with NO background */}
            <i className="ri-link-m text-2xl text-primary leading-none transition-transform group-hover:scale-105" />
            <span className="text-base font-semibold tracking-tight text-foreground">
              shortlink
            </span>
          </button>

          {/* Clean Nav Links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <button
              type="button"
              onClick={() => onViewChange("home")}
              className={`transition-colors cursor-pointer ${
                activeView === "home"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => onViewChange("dashboard")}
                className={`transition-colors cursor-pointer ${
                  activeView === "dashboard"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onViewChange("dashboard")}
                className="hidden md:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-foreground font-medium text-xs">
                  {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground max-w-[120px] truncate">
                  {user?.fullName || user?.username}
                </span>
              </button>

              <Button
                variant="ghost"
                size="sm"
                icon="ri-logout-box-r-line"
                onClick={logout}
                title="Sign out"
              >
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAuth("login")}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuth("signup")}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
