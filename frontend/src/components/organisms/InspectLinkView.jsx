import { useCallback, useEffect, useState } from "react";
import { CopyButton } from "../molecules/CopyButton.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getApiUrl } from "../../config/api.js";

export const InspectLinkView = ({ redirectKey, onBack }) => {
  const { token } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshingClicks, setRefreshingClicks] = useState(false);

  const fetchInspection = useCallback(async () => {
    if (!redirectKey) return;
    setLoading(true);
    setError("");

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(getApiUrl(`/api/v1/inspect/${redirectKey}`), { headers });
      const json = await res.json();

      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.message || "Unable to inspect this link");
      }
    } catch {
      setError("Network error while loading link details");
    } finally {
      setLoading(false);
    }
  }, [redirectKey, token]);

  useEffect(() => {
    fetchInspection();
  }, [fetchInspection]);

  // Real-time click tracking: auto-poll Redis every 5 seconds
  useEffect(() => {
    if (!redirectKey) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(getApiUrl(`/api/v1/clicks/${redirectKey}`));
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setData((prev) => {
            if (!prev || prev.clicks === json.data.clicks) return prev;
            return { ...prev, clicks: json.data.clicks };
          });
        }
      } catch {
        // silent background polling error
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [redirectKey]);

  const handleRefreshClicks = async () => {
    if (!redirectKey || refreshingClicks) return;
    setRefreshingClicks(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/clicks/${redirectKey}`));
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setData((prev) =>
          prev ? { ...prev, clicks: json.data.clicks } : prev
        );
        toast.success(`Clicks updated: ${json.data.clicks.toLocaleString()}`);
      }
    } catch {
      toast.error("Failed to refresh clicks");
    } finally {
      setRefreshingClicks(false);
    }
  };

  const handleDownloadQr = () => {
    if (!data?.qrCode) return;
    const a = document.createElement("a");
    a.href = data.qrCode;
    a.download = `qr-${redirectKey}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR code downloaded");
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center space-y-2.5">
        <i className="ri-loader-4-line text-2xl animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-mono">
          Loading /{redirectKey}...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center space-y-3">
        <p className="text-sm font-semibold text-foreground">
          {error || "Link not found"}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
        >
          <i className="ri-arrow-left-line text-xs" />
          <span>Back to links</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 sm:py-14 space-y-8 animate-in fade-in duration-150">
      {/* 1. Header: Back Navigation & Primary Actions */}
      <div className="space-y-4 pb-6 border-b border-border/20">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
        >
          <i className="ri-arrow-left-line text-sm" />
          <span>Back to links</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-foreground">
              /{data.redirectKey}
            </h1>
            <p className="text-xs text-muted-foreground font-mono truncate max-w-lg">
              {data.shortUrl}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CopyButton text={data.shortUrl} label="Copy link" />
            <a
              href={data.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="h-8 px-3 rounded-md border border-border/40 bg-transparent hover:bg-muted text-xs font-medium text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Visit</span>
              <i className="ri-arrow-right-up-line text-xs" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Flat Summary Bar - only bottom line where section ends */}
      <div className="pb-6 border-b border-border/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground text-[11px] block">Destination</span>
          <span className="font-mono font-medium text-foreground truncate block mt-0.5">
            {data.analysis.domain}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground text-[11px] block">Security</span>
          <span className="font-medium text-foreground block mt-0.5">
            {data.analysis.isSecure ? "HTTPS (Encrypted)" : "HTTP (Unencrypted)"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground text-[11px] block">Created</span>
          <span className="font-medium text-foreground block mt-0.5">
            {new Date(data.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-[11px]">Clicks</span>
            <button
              type="button"
              onClick={handleRefreshClicks}
              disabled={refreshingClicks}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5 rounded"
              title="Refresh click count from Redis"
              aria-label="Refresh clicks"
            >
              <i
                className={`ri-refresh-line text-xs ${
                  refreshingClicks ? "animate-spin text-primary" : ""
                }`}
              />
            </button>
          </div>
          <span className="font-mono font-medium text-foreground block mt-0.5">
            {data.clicks.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Details & QR Code - matched height, only bottom line where section ends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pb-8 border-b border-border/20">
        {/* Left 2 Cols: Key-value routing details (no dividing lines between rows) */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <h2 className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold">
            Route Details
          </h2>

          <div className="space-y-3.5 text-xs flex-1 flex flex-col justify-between">
            {/* Short Link */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
              <span className="text-muted-foreground shrink-0 w-28 font-mono text-[11px]">
                Short URL
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <a
                  href={data.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-foreground hover:text-primary transition-colors truncate"
                >
                  {data.shortUrl}
                </a>
                <CopyButton text={data.shortUrl} title="Copy short URL" />
              </div>
            </div>

            {/* Destination */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
              <span className="text-muted-foreground shrink-0 w-28 font-mono text-[11px]">
                Destination
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-mono text-muted-foreground break-all"
                  title={data.originalUrl}
                >
                  {data.originalUrl}
                </span>
                <CopyButton text={data.originalUrl} title="Copy destination URL" />
              </div>
            </div>

            {/* Hostname */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground shrink-0 w-28 font-mono text-[11px]">
                Host
              </span>
              <span className="font-mono text-foreground truncate">
                {data.analysis.domain}
              </span>
            </div>

            {/* Path */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground shrink-0 w-28 font-mono text-[11px]">
                Path
              </span>
              <span className="font-mono text-foreground truncate">
                {data.analysis.pathname || "/"}
              </span>
            </div>

            {/* Parameters */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground shrink-0 w-28 font-mono text-[11px]">
                Query Params
              </span>
              <span className="font-mono text-foreground">
                {data.analysis.paramsCount > 0
                  ? `${data.analysis.paramsCount} ${
                      data.analysis.paramsCount === 1 ? "param" : "params"
                    }`
                  : "None"}
              </span>
            </div>

            {/* Redirect Status */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground shrink-0 w-28 font-mono text-[11px]">
                Status Code
              </span>
              <span className="font-mono text-foreground">302 Found</span>
            </div>

            {/* Account */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground shrink-0 w-28 font-mono text-[11px]">
                Account
              </span>
              <span className="text-foreground">
                {data.isSaved
                  ? data.owner?.username
                    ? `@${data.owner.username}`
                    : "Saved to your account"
                  : "Guest link (unclaimed)"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Clean QR Code (Matched Height) */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold">
            QR Code
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4 px-4">
            {data.qrCode ? (
              <div className="p-2.5 bg-white rounded-md border border-border/40">
                <img
                  src={data.qrCode}
                  alt={`QR code for ${data.shortUrl}`}
                  className="w-36 h-36 block"
                />
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleDownloadQr}
              className="h-8 px-3 rounded-md border border-border/40 bg-transparent hover:bg-muted text-xs font-medium text-foreground transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <i className="ri-download-2-line text-xs" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
