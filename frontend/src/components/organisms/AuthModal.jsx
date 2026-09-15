import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export const AuthModal = ({ isOpen, onClose, defaultMode = "login", onSuccess }) => {
  const [mode, setMode] = useState(defaultMode);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, signup } = useAuth();
  const toast = useToast();

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // Handle ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setIdentifier("");
    setUsername("");
    setEmail("");
    setFullName("");
    setPassword("");
    setShowPassword(false);
    setErrors({});
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const validate = () => {
    const errs = {};

    if (mode === "login") {
      if (!identifier.trim()) {
        errs.identifier = "Email or username is required";
      }
    } else {
      if (!fullName.trim()) {
        errs.fullName = "Full name is required";
      } else if (fullName.trim().length < 2) {
        errs.fullName = "Must be at least 2 characters";
      }

      if (!username.trim()) {
        errs.username = "Username is required";
      } else if (username.length < 3 || username.length > 20) {
        errs.username = "Must be 3-20 characters";
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errs.username = "Letters, numbers, and underscores only";
      }

      if (!email.trim()) {
        errs.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errs.email = "Please enter a valid email address";
      }
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Must be at least 6 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === "login") {
        const result = await login({ identifier, password });
        if (result.success) {
          toast.success(`Welcome back, ${result.user.fullName || result.user.username}`);
          resetForm();
          onClose();
          if (onSuccess) onSuccess();
        } else {
          toast.error(result.message || "Invalid credentials");
          setErrors({ form: result.message });
        }
      } else {
        const result = await signup({
          username,
          email: email.trim().toLowerCase(),
          fullName,
          password,
        });
        if (result.success) {
          toast.success("Account created successfully!");
          resetForm();
          onClose();
          if (onSuccess) onSuccess();
        } else {
          toast.error(result.message || "Registration failed");
          setErrors({ form: result.message });
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] rounded-lg border-0 bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - borderless */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-md border-0 text-muted-foreground hover:text-foreground hover:bg-muted/70 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <i className="ri-close-line text-lg leading-none" />
        </button>

        {/* Brand & Heading - Logo icon with NO background */}
        <div className="space-y-2">
          <i className="ri-link-m text-2xl text-primary leading-none block" />

          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "login"
                ? "Enter your credentials to access your dashboard"
                : "Start shortening and tracking links in seconds"}
            </p>
          </div>
        </div>

        {/* Switcher with Underline Indicator - NO box-shadow or pill backgrounds */}
        <div className="flex items-center gap-6 pt-1">
          <button
            type="button"
            onClick={() => handleModeSwitch("login")}
            className={`relative pb-2 text-sm transition-colors cursor-pointer border-0 bg-transparent ${
              mode === "login"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground font-normal"
            }`}
          >
            Sign In
            {mode === "login" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("signup")}
            className={`relative pb-2 text-sm transition-colors cursor-pointer border-0 bg-transparent ${
              mode === "signup"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground font-normal"
            }`}
          >
            Create Account
            {mode === "signup" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Form Error Alert - borderless */}
        {errors.form && (
          <div className="p-2.5 bg-error-subtle text-error-subtle-foreground rounded-md border-0 text-xs flex items-center gap-2">
            <i className="ri-error-warning-fill text-base text-error shrink-0" />
            <span className="font-medium">{errors.form}</span>
          </div>
        )}

        {/* Auth Form with borderless inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "login" ? (
            /* Login Identifier (Email or Username) */
            <div className="space-y-1">
              <label
                htmlFor="auth-identifier"
                className="text-xs font-medium text-foreground block"
              >
                Email or Username
              </label>
              <div
                className={`relative flex items-center rounded-md bg-muted/60 hover:bg-muted/80 border-0 transition-all ${
                  errors.identifier
                    ? "ring-1 ring-error bg-error/5"
                    : "focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/25"
                }`}
              >
                <i className="ri-user-line text-muted-foreground/60 text-base ml-3 shrink-0" />
                <input
                  id="auth-identifier"
                  type="text"
                  placeholder="mohitdevx@proton.me or mohitdevx"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors({ ...errors, identifier: null });
                  }}
                  className="w-full bg-transparent border-0 py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground/45 outline-none font-sans"
                  autoComplete="username email"
                  autoCapitalize="none"
                />
              </div>
              {errors.identifier && (
                <p className="text-2xs text-error flex items-center gap-1 pl-1">
                  <i className="ri-error-warning-fill" />
                  <span>{errors.identifier}</span>
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="auth-fullname"
                  className="text-xs font-medium text-foreground block"
                >
                  Full Name
                </label>
                <div
                  className={`relative flex items-center rounded-md bg-muted/60 hover:bg-muted/80 border-0 transition-all ${
                    errors.fullName
                      ? "ring-1 ring-error bg-error/5"
                      : "focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/25"
                  }`}
                >
                  <i className="ri-user-line text-muted-foreground/60 text-base ml-3 shrink-0" />
                  <input
                    id="auth-fullname"
                    type="text"
                    placeholder="mohit kumar"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: null });
                    }}
                    className="w-full bg-transparent border-0 py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground/45 outline-none font-sans"
                    autoComplete="name"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-2xs text-error flex items-center gap-1 pl-1">
                    <i className="ri-error-warning-fill" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label
                  htmlFor="auth-username"
                  className="text-xs font-medium text-foreground block"
                >
                  Username
                </label>
                <div
                  className={`relative flex items-center rounded-md bg-muted/60 hover:bg-muted/80 border-0 transition-all ${
                    errors.username
                      ? "ring-1 ring-error bg-error/5"
                      : "focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/25"
                  }`}
                >
                  <i className="ri-at-line text-muted-foreground/60 text-base ml-3 shrink-0" />
                  <input
                    id="auth-username"
                    type="text"
                    placeholder="mohitdevx"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""));
                      if (errors.username) setErrors({ ...errors, username: null });
                    }}
                    className="w-full bg-transparent border-0 py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground/45 outline-none font-sans"
                    autoComplete="username"
                    autoCapitalize="none"
                  />
                </div>
                {errors.username && (
                  <p className="text-2xs text-error flex items-center gap-1 pl-1">
                    <i className="ri-error-warning-fill" />
                    <span>{errors.username}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="auth-email"
                  className="text-xs font-medium text-foreground block"
                >
                  Email Address
                </label>
                <div
                  className={`relative flex items-center rounded-md bg-muted/60 hover:bg-muted/80 border-0 transition-all ${
                    errors.email
                      ? "ring-1 ring-error bg-error/5"
                      : "focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/25"
                  }`}
                >
                  <i className="ri-mail-line text-muted-foreground/60 text-base ml-3 shrink-0" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="mohitdevx@proton.me"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    className="w-full bg-transparent border-0 py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground/45 outline-none font-sans"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-2xs text-error flex items-center gap-1 pl-1">
                    <i className="ri-error-warning-fill" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </>
          )}

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="auth-password"
                className="text-xs font-medium text-foreground block"
              >
                Password
              </label>
              {mode === "signup" && (
                <span className="text-2xs text-muted-foreground">Min. 6 chars</span>
              )}
            </div>
            <div
              className={`relative flex items-center rounded-md bg-muted/60 hover:bg-muted/80 border-0 transition-all ${
                errors.password
                  ? "ring-1 ring-error bg-error/5"
                  : "focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/25"
              }`}
            >
              <i className="ri-lock-line text-muted-foreground/60 text-base ml-3 shrink-0" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                className="w-full bg-transparent border-0 py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground/45 outline-none font-sans"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="p-1.5 text-muted-foreground/60 hover:text-foreground mr-1 cursor-pointer transition-colors border-0"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={`${
                    showPassword ? "ri-eye-off-line" : "ri-eye-line"
                  } text-base leading-none`}
                />
              </button>
            </div>
            {errors.password && (
              <p className="text-2xs text-error flex items-center gap-1 pl-1">
                <i className="ri-error-warning-fill" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Borderless Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md border-0 font-medium text-sm bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base" />
                  <span>
                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                  </span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                  <i className="ri-arrow-right-line text-base leading-none" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Switcher without borders */}
        <div className="text-center text-xs text-muted-foreground pt-1">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("signup")}
                className="font-medium text-foreground hover:underline cursor-pointer border-0 bg-transparent"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                className="font-medium text-foreground hover:underline cursor-pointer border-0 bg-transparent"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
