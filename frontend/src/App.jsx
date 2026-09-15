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
      <footer className="border-t border-border py-6 px-4 text-center text-xs text-muted-foreground bg-card/40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ShortLink Engine. Ultra-fast, privacy-first link shortening.</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleViewChange("home")}
              className="hover:text-foreground cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("dashboard")}
              className="hover:text-foreground cursor-pointer"
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
