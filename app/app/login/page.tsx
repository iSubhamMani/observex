"use client";

import { AuthShell } from "@/components/AuthShell";
import Field from "@/components/ui/Field";
import { useToast } from "@/hooks/useToast";
import axios, { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RiLoader5Line } from "react-icons/ri";

export default function LoginPage() {
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Observex dashboard."
      footer={
        <>
          No account?{" "}
          <Link
            href={"/signup"}
            className="text-primary hover:underline font-medium"
          >
            Create one
          </Link>
        </>
      }
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (!loginDetails.email.trim() || !loginDetails.password.trim()) {
            return;
          }

          setIsLoading(true);

          try {
            const res = await axios.post("/api/auth/login", {
              email: loginDetails.email.trim(),
              password: loginDetails.password.trim(),
            });

            if (res.status === 200) {
              showToast("success", "Logged in successfully!");
              router.replace("/dashboard");
            }
          } catch (error) {
            if (isAxiosError(error)) {
              showToast(
                "error",
                error.response?.data?.error ||
                  "Login failed. Please try again.",
              );
            }
          } finally {
            setIsLoading(false);
          }
        }}
        className="space-y-4"
      >
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          onChange={(e) =>
            setLoginDetails((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          onChange={(e) =>
            setLoginDetails((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <button
          disabled={isLoading}
          className="w-full flex items-center justify-center rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {isLoading ? (
            <RiLoader5Line className="animate-spin size-4" />
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
