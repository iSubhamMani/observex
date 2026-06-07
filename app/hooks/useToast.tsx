import { ToastContext } from "@/lib/ToastContext";
import { useContext } from "react";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      "useToasts must be used within a ToastProvider context layer.",
    );
  }
  return context;
}
