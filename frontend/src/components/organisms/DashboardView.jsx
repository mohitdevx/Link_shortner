import { useCallback, useEffect, useState } from "react";
import { Button } from "../atoms/Button.jsx";
import { CopyButton } from "../molecules/CopyButton.jsx";
import { EmptyState } from "../molecules/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export const DashboardView = () => {
  const { token, user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  const fetchLinks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinks(data.data || []);
      } else {
        toast.error(data.message || "Failed to load links");
      }
    } catch {
      toast.error("Network error fetching links");
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setUrlError("Please enter a destination URL");
      return;
    }

    setUrlError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/v1/newurl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Short link created!");
        setUrlInput("");
        fetchLinks();
      } else {
        toast.error(data.message || "Failed to create short link");
        setUrlError(data.message || "Failed to create link");
      }
    } catch {
      toast.error("Network error while creating link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (redirectKey, shortUrl) => {
    const isConfirmed = await confirm({
      title: "Delete Short Link?",
      message: `Delete ${shortUrl}? Traffic to this address will immediately receive a 404.`,
      confirmText: "Delete Link",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/${redirectKey}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Short link deleted");
        setLinks((prev) => prev.filter((l) => l.redirectKey !== redirectKey));
      } else {
        toast.error(data.message || "Failed to delete link");
      }
    } catch {
      toast.error("Network error deleting link");
    }
  };

  const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 sm:py-14 space-y-10">
      {/* 1. Dashboard Header & Live Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Links
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Logged in as <span className="font-medium text-foreground">{user?.fullName || user?.username}</span>
          </p>
        </div>

        {/* Minimalist Inline Counters */}
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-muted-foreground block text-2xs uppercase tracking-wider">
              Total Links
            </span>
            <span className="text-lg font-bold text-foreground">
              {links.length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-2xs uppercase tracking-wider">
              Total Clicks
            </span>
            <span className="text-lg font-bold text-foreground">
              {totalClicks.toLocaleString()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon="ri-refresh-line"
            loading={loading}
            onClick={fetchLinks}
            title="Refresh links"
          />
        </div>
      </div>

      {/* 2. Unified Shorten Input Bar */}
      <div className="space-y-2">
        <form
          onSubmit={handleShorten}
          className="group relative rounded-lg border-0 bg-card p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2.5 shadow-md hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/25 transition-all duration-200"
        >
          <div className="flex items-center gap-3 w-full pl-3 pr-2">
            <i className="ri-link text-muted-foreground text-lg shrink-0" />
            <span className="text-xs text-muted-foreground/60 select-none font-mono hidden sm:inline-block">
              https://
            </span>
            <input
              type="text"
              placeholder="example.com/very/long/destination/url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (urlError) setUrlError("");
              }}
              className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 text-sm outline-none focus:outline-none tracking-normal font-sans"
              autoComplete="off"
              spellCheck="false"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput("")}
                className="p-1 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer shrink-0"
                title="Clear input"
              >
                <i className="ri-close-line text-base leading-none" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto shrink-0 rounded-md px-6 h-10 font-medium text-sm bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {submitting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm" />
                <span>Creating</span>
              </>
            ) : (
              <>
                <i className="ri-add-line text-sm" />
                <span>Create Link</span>
              </>
            )}
          </button>
        </form>

        {urlError && (
          <p className="text-xs text-error pl-3 flex items-center gap-1.5">
            <i className="ri-error-warning-fill text-sm" />
            <span>{urlError}</span>
          </p>
        )}
      </div>

      {/* 3. Links Stream / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
          <span>Active Endpoints ({links.length})</span>
          <span>Click Count</span>
        </div>

        {loading && links.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            <i className="ri-loader-4-line text-2xl animate-spin inline-block mb-2 text-primary" />
            <p>Fetching your links...</p>
          </div>
        ) : links.length > 0 ? (
          <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden divide-y divide-border">
            {links.map((link) => (
              <div
                key={link._id || link.redirectKey}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono font-semibold text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {link.shortUrl}
                      <i className="ri-arrow-right-up-line text-xs opacity-60" />
                    </a>
                    <span className="text-2xs text-muted-foreground">
                      • {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-muted-foreground truncate max-w-md text-xs font-mono">
                    {link.originalUrl}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground font-mono text-xs font-semibold">
                    {link.clicks || 0} {link.clicks === 1 ? "click" : "clicks"}
                  </div>

                  <CopyButton text={link.shortUrl} />

                  <button
                    type="button"
                    onClick={() => handleDelete(link.redirectKey, link.shortUrl)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-error hover:bg-error-subtle transition-colors cursor-pointer"
                    title="Delete link"
                    aria-label="Delete link"
                  >
                    <i className="ri-delete-bin-line text-sm leading-none" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <EmptyState
              icon="ri-links-line"
              title="No links yet"
              description="Paste a URL above to create your first short link and start tracking clicks."
            />
          </div>
        )}
      </div>
    </div>
  );
};
