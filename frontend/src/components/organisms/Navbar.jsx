import { ThemeToggle } from "../atoms/ThemeToggle.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";

export const Navbar = ({ activeView, onViewChange, onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const confirm = useConfirm();

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: "Sign Out",
      message: "Are you sure you want to sign out of your account?",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (isConfirmed) {
      logout();
      onViewChange("home");
    }
  };

  return (
    <header className="w-full bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo only (nav links removed) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onViewChange(isAuthenticated ? "dashboard" : "home")}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none select-none"
          >
            <i className="ri-link-m text-3xl font-semibold text-primary leading-none transition-transform duration-200 group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-foreground font-sans">
              shortlink
            </span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="h-4 w-px bg-border/50 hidden sm:block" />

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {/* Profile Tab */}
              <button
                type="button"
                onClick={() => onViewChange("profile")}
                className={`flex items-center gap-2 text-xs transition-colors cursor-pointer py-1 px-2 rounded-md ${
                  activeView === "profile"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title="Account Settings"
              >
                <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-medium text-xs shrink-0">
                  {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground max-w-[120px] truncate hidden sm:inline-block">
                  {user?.fullName || user?.username}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
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
