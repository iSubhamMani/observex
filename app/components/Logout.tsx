"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        try {
          await axios.post("/api/auth/logout");
          router.replace("/login");
        } catch (error) {
          console.log("Logout failed", error);
        }
      }}
      className="hover:cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      Sign out
    </button>
  );
};

export default Logout;
