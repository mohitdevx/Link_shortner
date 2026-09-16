import { useState, useEffect } from "react";
import { Button } from "../atoms/Button.jsx";
import { CopyButton } from "../molecules/CopyButton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export const HomePage = ({ onOpenAuth, onGoToDashboard }) => {
  const { isAuthenticated, token } = useAuth();
  const toast = useToast();

  const [inputUrl, setInputUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);

  // Auto-claim guest link if user logs in / signs up while viewing it
  useEffect(() => {
    const claimLinkIfGuest = async () => {
      if (
        isAuthenticated &&
        token &&
        generatedLink?.redirectKey &&
        !generatedLink.isSaved
      ) {
        try {
          const res = await fetch("/api/v1/claim", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ redirectKey: generatedLink.redirectKey }),
          });
          if (res.ok) {
            setGeneratedLink((prev) => (prev ? { ...prev, isSaved: true } : null));
            toast.success("Guest link saved to your account!");
          }
        } catch {
          // ignore
        }
      }
    };

    claimLinkIfGuest();
  }, [isAuthenticated, token, generatedLink?.redirectKey]);

  const handleClear = () => {
    setInputUrl("");
    setUrlError("");
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setUrlError("Please enter a destination URL");
      return;
    }

    setUrlError("");
    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/v1/newurl", {
        method: "POST",
        headers,
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const origin = window.location.origin;
        setGeneratedLink({
          shortUrl: `${origin}/api/v1/${data.redirectKey}`,
          redirectKey: data.redirectKey,
          originalUrl: data.originalUrl || inputUrl.trim(),
          isSaved: Boolean(data.isSaved || isAuthenticated),
        });
        toast.success(
          data.isSaved || isAuthenticated
            ? "Short link generated and saved!"
            : "Short link generated! Redirect is live."
        );
        setInputUrl("");
      } else {
        toast.error(data.message || "Failed to create short link");
        setUrlError(data.message || "Failed to create link");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-24">
      {/* 1. Hero Section */}
      <section className="text-center space-y-8 max-w-3xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Short links with superpowers.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Transform long, cluttered URLs into crisp, lightning-fast redirects.
            Real-time analytics, instant sharing, zero clutter.
          </p>
        </div>

        {/* Aesthetic & Professional Hero Shortener Bar */}
        <div className="w-full max-w-3xl mx-auto space-y-3">
          <form
            onSubmit={handleShorten}
            className="group relative rounded-lg border border-border/40 bg-card p-1.5 flex flex-col sm:flex-row items-center gap-2 shadow-sm hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200"
          >
            {/* Left Protocol / Icon Group */}
            <div className="flex items-center gap-2.5 w-full pl-3 pr-2">
              <i className="ri-link text-muted-foreground text-base shrink-0" />
              <span className="text-xs text-muted-foreground/60 select-none font-mono hidden sm:inline-block">
                https://
              </span>

              {/* Input Field */}
              <input
                id="hero-url-input"
                type="text"
                placeholder="example.com/very/long/destination/url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (urlError) setUrlError("");
                }}
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 text-sm outline-none focus:outline-none tracking-normal font-sans py-1"
                autoComplete="off"
                spellCheck="false"
              />

              {/* Clear Action when text exists */}
              {inputUrl && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer shrink-0"
                  title="Clear input"
                >
                  <i className="ri-close-line text-sm leading-none" />
                </button>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto shrink-0 rounded-md px-4 h-8.5 font-medium text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-xs" />
                  <span>Processing</span>
                </>
              ) : (
                <>
                  <span>Shorten</span>
                  <i className="ri-arrow-right-line text-xs leading-none" />
                </>
              )}
            </button>
          </form>

          {/* Validation Error */}
          {urlError && (
            <div className="flex items-center gap-1.5 text-xs text-error pl-3 animate-in fade-in">
              <i className="ri-error-warning-fill text-sm" />
              <span>{urlError}</span>
            </div>
          )}

          {/* Aesthetic Result Card */}
          {generatedLink && (
            <div className="rounded-lg border-0 bg-card p-5 text-left shadow-lg space-y-4 transition-all animate-in fade-in slide-in-from-top-1">
              {/* Clean Header: Status and Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ri-check-line text-sm text-foreground/70" />
                  <span className="text-xs font-semibold text-foreground tracking-tight">
                    Link ready
                  </span>
                </div>
                <span className="text-2xs font-medium px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {generatedLink.isSaved ? "Saved to Dashboard" : "Guest Link"}
                </span>
              </div>

              {/* Main Link Display & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={generatedLink.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-base font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span>{generatedLink.shortUrl}</span>
                      <i className="ri-arrow-right-up-line text-sm text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                  <p
                    className="text-xs text-muted-foreground truncate max-w-lg font-sans"
                    title={generatedLink.originalUrl}
                  >
                    {generatedLink.originalUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton text={generatedLink.shortUrl} label="Copy" />
                  {generatedLink.isSaved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onGoToDashboard}
                      icon="ri-dashboard-line"
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenAuth("signup")}
                      icon="ri-user-add-line"
                    >
                      Sign Up to Save
                    </Button>
                  )}
                </div>
              </div>

              {/* Guest Footer Hint */}
              {!generatedLink.isSaved && (
                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Guest link is live and active. Create a free account to track clicks & analytics.</span>
                  <button
                    type="button"
                    onClick={() => onOpenAuth("signup")}
                    className="font-medium text-foreground hover:underline cursor-pointer flex items-center gap-1 border-0 bg-transparent shrink-0 ml-3"
                  >
                    <span>Sign up</span>
                    <i className="ri-arrow-right-s-line text-sm" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Three Editorial Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border/40">
        <div className="space-y-2">
          <div className="w-8 h-8 rounded-md bg-secondary text-foreground flex items-center justify-center text-sm font-semibold">
            01
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Sub-millisecond 302 redirects
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Direct server routing without intermediate interstitial screens, countdowns, or annoying advertiser delays.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-8 h-8 rounded-md bg-secondary text-foreground flex items-center justify-center text-sm font-semibold">
            02
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Live click tracking
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Monitor real-time visitor counts the moment a link is opened. Clean metrics without invasive surveillance.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-8 h-8 rounded-md bg-secondary text-foreground flex items-center justify-center text-sm font-semibold">
            03
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Complete link control
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage your personal portfolio of links, instantly copy clean URLs to clipboard, or revoke routes at any time.
          </p>
        </div>
      </section>

      {/* 3. Understated Minimal CTA */}
      <section className="text-center py-10 space-y-4 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Ready to clean up your links?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Create an account in seconds to manage, track, and share high-converting URLs.
        </p>
        <div className="pt-2">
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="md"
              onClick={onGoToDashboard}
              icon="ri-dashboard-line"
            >
              Go to Your Dashboard
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => onOpenAuth("signup")}
              icon="ri-arrow-right-line"
              iconRight
            >
              Get Started Free
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};
