import { ConfirmProvider } from "./ConfirmContext.jsx";
import { ToastProvider } from "./ToastContext.jsx";

export const GlobalProvider = ({ children }) => {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
};
