"use client";

import { useToast } from "@/hooks/useToast";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <button
      onClick={async () => {
        try {
          await axios.post("/api/auth/logout");
          showToast("success", "Logged out successfully!");
          router.replace("/login");
        } catch (error) {
          if (isAxiosError(error)) {
            showToast(
              "error",
              error.response?.data.error || "Logout failed. Please try again.",
            );
          }
        }
      }}
      className="hover:cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      Sign out
    </button>
  );
};

export default Logout;
