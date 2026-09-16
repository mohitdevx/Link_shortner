import { useState } from "react";
import { AuthModal } from "./components/organisms/AuthModal.jsx";
import { DashboardView } from "./components/organisms/DashboardView.jsx";
import { HomePage } from "./components/organisms/HomePage.jsx";
import { Navbar } from "./components/organisms/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState("home");
  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: "login",
  });

  const handleOpenAuth = (mode = "login") => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleViewChange = (view) => {
    if (view === "dashboard" && !isAuthenticated) {
      handleOpenAuth("login");
      return;
    }
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        onViewChange={handleViewChange}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col">
        {activeView === "home" ? (
          <HomePage
            onOpenAuth={handleOpenAuth}
            onGoToDashboard={() => setActiveView("dashboard")}
          />
        ) : (
          <DashboardView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6 text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 font-medium text-foreground/80">
            <span>© 2026 mohitdevx</span>
          </div>

          {/* Contact & Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <a
              href="mailto:mohitdevx@proton.me"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Email: mohitdevx@proton.me"
            >
              <i className="ri-mail-line text-sm leading-none" />
              <span>mohitdevx@proton.me</span>
            </a>

            <a
              href="https://portfolio.h4x.co.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Portfolio"
            >
              <i className="ri-global-line text-sm leading-none" />
              <span>portfolio.h4x.co.in</span>
            </a>

            <a
              href="https://linkedin.com/in/mohitdevx"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="LinkedIn: mohitdevx"
            >
              <i className="ri-linkedin-fill text-sm leading-none" />
              <span>mohitdevx</span>
            </a>

            <a
              href="https://github.com/mohitdevx"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="GitHub: mohitdevx"
            >
              <i className="ri-github-fill text-sm leading-none" />
              <span>mohitdevx</span>
            </a>
          </div>

          {/* Views */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleViewChange("home")}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("dashboard")}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Login / Signup) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={handleCloseAuth}
        defaultMode={authModalState.mode}
        onSuccess={() => {
          setActiveView("dashboard");
        }}
      />
    </div>
  );
}
