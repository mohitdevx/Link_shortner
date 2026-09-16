import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export const ProfileView = ({ onBack }) => {
  const { user, token, updateUser } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [fullName, setFullName] = useState(user?.fullName || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim()) {
      setError("Username and email are required");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError("Current password is required to change password");
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        return;
      }
    }

    setIsSaving(true);

    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        fullName: fullName.trim(),
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        updateUser(data.user, data.token);
        toast.success("Profile updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch {
      setError("Network error while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-8 animate-in fade-in duration-150">
      {/* 1. Header & Back Navigation */}
      <div className="space-y-4 pb-6 border-b border-border/20">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
        >
          <i className="ri-arrow-left-line text-sm" />
          <span>Back to dashboard</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Account Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your personal credentials, contact email, and authentication details.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Flat Summary Strip */}
      <div className="pb-6 border-b border-border/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground text-[11px] block">Username</span>
          <span className="font-mono font-medium text-foreground truncate block mt-0.5">
            @{user?.username}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground text-[11px] block">Registered Email</span>
          <span className="font-medium text-foreground truncate block mt-0.5">
            {user?.email}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground text-[11px] block">Member Since</span>
          <span className="font-medium text-foreground block mt-0.5">
            {new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* 3. Settings Form */}
      <form onSubmit={handleSave} className="space-y-8 pb-8 border-b border-border/20">
        {error && (
          <div className="p-3 rounded-md bg-error-subtle text-error text-xs flex items-center gap-2">
            <i className="ri-error-warning-fill text-sm shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section: Profile Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold">
              Profile Information
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your public handle and display name.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium block">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  className="w-full h-9 pl-7 pr-3 rounded-md border border-border/40 bg-transparent text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/40 outline-none"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium block">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-border/40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/40 outline-none"
                placeholder="Full Name"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-muted-foreground font-medium block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                className="w-full h-9 px-3 rounded-md border border-border/40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/40 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Section: Change Password */}
        <div className="space-y-4 pt-2">
          <div>
            <h2 className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold">
              Change Password
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Leave blank if you do not wish to update your password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-muted-foreground font-medium block">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-border/40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/40 outline-none font-mono"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium block">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-border/40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/40 outline-none font-mono"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-border/40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/40 outline-none font-mono"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="h-8.5 px-4 rounded-md border border-border/40 bg-transparent hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="h-8.5 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <i className="ri-loader-4-line animate-spin text-xs" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
