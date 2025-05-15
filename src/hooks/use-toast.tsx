
import * as React from "react";
import { type ToastActionElement } from "@/components/ui/toast";

type ToastPosition = "top" | "bottom" | "top-right" | "top-left" | "bottom-right" | "bottom-left";

// Update ToastType to match what the Toast component expects
type ToastType = "default" | "destructive";

const TOAST_LIFETIME = 5000; // 5 seconds

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: ToastType;
  position?: ToastPosition;
};

type ToasterToast = Toast & {
  onDismiss: () => void;
};

type ToastContextValue = {
  toasts: ToasterToast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = generateId();
  
      const newToast: ToasterToast = {
        ...toast,
        id,
        onDismiss: () => dismissToast(id),
      };
  
      setToasts((prevToasts) => [...prevToasts, newToast]);
  
      // Auto dismiss after lifetime
      setTimeout(() => {
        dismissToast(id);
      }, TOAST_LIFETIME);
    },
    []
  );

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, dismissToast, dismissAll }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const toast = (props: Omit<Toast, "id">) => {
    context.addToast(props);
  };

  return {
    toast,
    toasts: context.toasts,
    dismiss: context.dismissToast,
    dismissAll: context.dismissAll,
  };
}

export const toast = (props: Omit<Toast, "id">) => {
  const { toast: addToast } = useToast();
  addToast(props);
};
