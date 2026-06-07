"use client";

import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/lib/ToastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default Providers;
