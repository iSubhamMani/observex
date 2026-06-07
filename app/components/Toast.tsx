"use client";

import { useEffect } from "react";
import { FiCheckCircle, FiInfo, FiXCircle, FiX } from "react-icons/fi";

export type ToastType = "success" | "info" | "error";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const { id, type, message, duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // ──► ACCENT COLOR MAPS WITH HIGH-CONTRAST LIGHT MODE & GLOWING DARK MODE ◄──
  const themes = {
    success: {
      icon: (
        <FiCheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
      ),
      styles:
        "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-100/50 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-200 dark:shadow-emerald-950/20",
    },
    info: {
      icon: <FiInfo className="size-5 text-violet-600 dark:text-violet-400" />,
      styles:
        "border-violet-200 bg-violet-50 text-violet-900 shadow-violet-100/50 dark:border-violet-500/30 dark:bg-violet-950/20 dark:text-violet-200 dark:shadow-violet-950/20",
    },
    error: {
      icon: <FiXCircle className="size-5 text-rose-600 dark:text-pink-400" />,
      styles:
        "border-rose-200 bg-rose-50 text-rose-900 shadow-rose-100/50 dark:border-pink-500/30 dark:bg-pink-950/20 dark:text-pink-200 dark:shadow-pink-950/20",
    },
  };

  const currentTheme = themes[type];

  return (
    <div
      className={`flex items-start gap-3 w-80 rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-slide-in-right ${currentTheme.styles}`}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{currentTheme.icon}</div>
      <div className="flex-1 text-sm font-semibold leading-5 wrap-break-words">
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 ml-2 p-0.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <FiX className="size-4" />
      </button>
    </div>
  );
}
