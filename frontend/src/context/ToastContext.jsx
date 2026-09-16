import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ToastContainer } from "../components/organisms/ToastContainer.jsx";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      return id;
    },
    []
  );

  const success = useCallback(
    (message, title = "Success") =>
      showToast({ type: "success", title, message }),
    [showToast]
  );

  const error = useCallback(
    (message, title = "Error") => showToast({ type: "error", title, message }),
    [showToast]
  );

  const warning = useCallback(
    (message, title = "Warning") =>
      showToast({ type: "warning", title, message }),
    [showToast]
  );

  const info = useCallback(
    (message, title = "Information") =>
      showToast({ type: "info", title, message }),
    [showToast]
  );

  const value = useMemo(
    () => ({ showToast, removeToast, success, error, warning, info }),
    [showToast, removeToast, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
