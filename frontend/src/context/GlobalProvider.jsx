import { AuthProvider } from "./AuthContext.jsx";
import { ConfirmProvider } from "./ConfirmContext.jsx";
import { ToastProvider } from "./ToastContext.jsx";

export const GlobalProvider = ({ children }) => {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>{children}</AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
};
