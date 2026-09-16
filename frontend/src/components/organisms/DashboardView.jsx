import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../atoms/Button.jsx";
import { CopyButton } from "../molecules/CopyButton.jsx";
import { EmptyState } from "../molecules/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const PAGE_LIMIT = 8;

export const DashboardView = () => {
  const { token, user } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  const confirm = useConfirm();

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  const [offset, setOffset] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLinks = useCallback(
    async (targetOffset = offset) => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(
          `/api/profile?offset=${targetOffset}&limit=${PAGE_LIMIT}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setLinks(data.data || []);
          if (data.pagination) {
            setTotalLinks(data.pagination.total || 0);
            setTotalClicks(data.pagination.totalClicks || 0);
            setHasMore(Boolean(data.pagination.hasMore));
          } else {
            setTotalLinks(data.data?.length || 0);
            setTotalClicks(
              (data.data || []).reduce((acc, l) => acc + (l.clicks || 0), 0)
            );
          }
        } else {
          toastRef.current.error(data.message || "Failed to load links");
        }
      } catch {
        toastRef.current.error("Network error fetching links");
      } finally {
        setLoading(false);
      }
    },
    [token, offset]
  );

  useEffect(() => {
    fetchLinks(offset);
  }, [offset, token]);

  const handlePrevPage = () => {
    if (offset <= 0 || loading) return;
    const prevOffset = Math.max(0, offset - PAGE_LIMIT);
    setOffset(prevOffset);
  };

  const handleNextPage = () => {
    if (!hasMore || loading) return;
    const nextOffset = offset + PAGE_LIMIT;
    setOffset(nextOffset);
  };

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
        setOffset(0);
        fetchLinks(0);
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
        fetchLinks(offset);
      } else {
        toast.error(data.message || "Failed to delete link");
      }
    } catch {
      toast.error("Network error deleting link");
    }
  };

  const filteredLinks = links.filter((link) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      link.shortUrl?.toLowerCase().includes(q) ||
      link.originalUrl?.toLowerCase().includes(q) ||
      link.redirectKey?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalLinks / PAGE_LIMIT));
  const currentPage = Math.floor(offset / PAGE_LIMIT) + 1;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 sm:py-14 space-y-8">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Links
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {totalLinks} active {totalLinks === 1 ? "endpoint" : "endpoints"} •{" "}
            {totalClicks.toLocaleString()} total clicks recorded
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {totalLinks > 0 && (
            <div className="relative">
              <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-xs" />
              <input
                type="text"
                placeholder="Search page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-44 sm:w-52 h-8 pl-8 pr-7 rounded-md border border-border/40 bg-card text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-sans"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <i className="ri-close-line text-xs" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => fetchLinks(offset)}
            disabled={loading}
            className="h-8 px-2.5 rounded-md border border-border/40 bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh links"
          >
            <i className={`ri-refresh-line text-xs ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Compact URL Input */}
      <div className="space-y-1.5">
        <form
          onSubmit={handleShorten}
          className="group relative rounded-lg border border-border/40 bg-card p-1.5 flex flex-col sm:flex-row items-center gap-2 shadow-md hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200"
        >
          <div className="flex items-center gap-2.5 w-full pl-3 pr-2">
            <i className="ri-link text-muted-foreground text-base shrink-0" />
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
              className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 text-sm outline-none focus:outline-none tracking-normal font-sans py-1"
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
                <i className="ri-close-line text-sm leading-none" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto shrink-0 rounded-md px-4 h-8.5 font-medium text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            {submitting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-xs" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <i className="ri-add-line text-xs" />
                <span>Shorten URL</span>
              </>
            )}
          </button>
        </form>

        {urlError && (
          <p className="text-xs text-error pl-2 flex items-center gap-1">
            <i className="ri-error-warning-fill text-xs" />
            <span>{urlError}</span>
          </p>
        )}
      </div>

      {/* 3. Transparent Links Table (No background, paginated with < > buttons) */}
      <div className="space-y-3 pt-2">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-b border-border/40 text-muted-foreground font-mono uppercase text-[11px] select-none">
              <tr>
                <th className="py-3 px-2 font-semibold">Short Link</th>
                <th className="py-3 px-2 font-semibold">Destination</th>
                <th className="py-3 px-2 font-semibold text-center w-24">Clicks</th>
                <th className="py-3 px-2 font-semibold text-right w-28">Created</th>
                <th className="py-3 px-2 font-semibold text-right w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/20">
              {loading && links.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground">
                    <i className="ri-loader-4-line text-2xl animate-spin text-primary inline-block mb-2" />
                    <p className="text-xs font-medium">Loading links...</p>
                  </td>
                </tr>
              ) : filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <tr
                    key={link._id || link.redirectKey}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* Short Link */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-sm font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{link.shortUrl}</span>
                        <i className="ri-arrow-right-up-line text-xs opacity-0 group-hover:opacity-80 transition-opacity" />
                      </a>
                    </td>

                    {/* Destination URL */}
                    <td className="py-3 px-2 max-w-xs sm:max-w-md truncate">
                      <span
                        className="font-sans text-xs text-muted-foreground truncate block"
                        title={link.originalUrl}
                      >
                        {link.originalUrl}
                      </span>
                    </td>

                    {/* Clicks */}
                    <td className="py-3 px-2 font-mono font-semibold text-center text-foreground whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary/60 text-foreground font-mono text-[11px]">
                        {link.clicks || 0}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-2 text-muted-foreground whitespace-nowrap text-right font-sans text-xs">
                      {new Date(link.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <CopyButton text={link.shortUrl} title="Copy short link" />

                        <button
                          type="button"
                          onClick={() => handleDelete(link.redirectKey, link.shortUrl)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-error hover:bg-error-subtle transition-colors cursor-pointer"
                          title="Delete link"
                        >
                          <i className="ri-delete-bin-line text-sm leading-none" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <EmptyState
                      icon={searchTerm ? "ri-search-line" : "ri-links-line"}
                      title={searchTerm ? "No matching links" : "No links yet"}
                      description={
                        searchTerm
                          ? `No links matched "${searchTerm}".`
                          : "Enter a destination URL above to create your first short link."
                      }
                      action={
                        searchTerm ? (
                          <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="text-xs text-primary hover:underline cursor-pointer"
                          >
                            Clear search
                          </button>
                        ) : null
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Controls (< > buttons) */}
        {totalLinks > 0 && (
          <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {offset + 1}–{Math.min(offset + links.length, totalLinks)} of{" "}
              {totalLinks} {totalLinks === 1 ? "link" : "links"}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={offset === 0 || loading}
                onClick={handlePrevPage}
                className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title={`Previous ${PAGE_LIMIT} links`}
                aria-label="Previous page"
              >
                <i className="ri-arrow-left-s-line text-lg leading-none" />
              </button>

              <span className="text-xs font-mono text-muted-foreground px-1.5 select-none">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={!hasMore || loading}
                onClick={handleNextPage}
                className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title={`Next ${PAGE_LIMIT} links`}
                aria-label="Next page"
              >
                <i className="ri-arrow-right-s-line text-lg leading-none" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
