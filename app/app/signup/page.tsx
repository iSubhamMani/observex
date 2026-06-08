"use client";

import { AuthShell } from "@/components/AuthShell";
import Field from "@/components/ui/Field";
import { useToast } from "@/hooks/useToast";
import axios, { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RiLoader5Line } from "react-icons/ri";

export default function SignupPage() {
  const [signupDetails, setSignupDetails] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <AuthShell
      title="Start for free"
      subtitle="Create an account and get your ObservEx dashboard up and running in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={"/login"}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);

          if (
            !signupDetails.fullname.trim() ||
            !signupDetails.email.trim() ||
            !signupDetails.password.trim()
          ) {
            return;
          }

          try {
            const res = await axios.post("/api/auth/signup", {
              fullname: signupDetails.fullname.trim(),
              email: signupDetails.email.trim(),
              password: signupDetails.password.trim(),
            });

            if (res.status === 201) {
              showToast(
                "success",
                "Account created successfully! Please verify your email.",
              );
              router.replace(
                `/verify-email?email=${signupDetails.email.trim()}`,
              );
            }
          } catch (error) {
            console.error("Signup failed", error);
            if (isAxiosError(error)) {
              showToast(
                "error",
                error.response?.data?.error ||
                  "Signup failed. Please try again.",
              );
            }
          } finally {
            setIsLoading(false);
          }
        }}
        className="space-y-4"
      >
        <Field
          label="Full name"
          placeholder="Ada Lovelace"
          required
          onChange={(e) =>
            setSignupDetails((prev) => ({ ...prev, fullname: e.target.value }))
          }
        />
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          onChange={(e) =>
            setSignupDetails((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <Field
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          required
          onChange={(e) =>
            setSignupDetails((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {isLoading ? (
            <RiLoader5Line className="animate-spin size-4" />
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
