"use client";

import { AuthShell } from "@/components/AuthShell";
import Field from "@/components/ui/Field";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RiLoader5Line } from "react-icons/ri";

export default function VerifyEmail() {
  const email = useSearchParams().get("email") ?? ""; // Get email from query params, passed from signup page after registration
  const router = useRouter();
  const [typedEmail, setTypedEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (!email.trim()) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="Type in your email to receive a verification code."
        footer={
          <>
            Don&apos;t have an account?{" "}
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
            // send otp

            if (!typedEmail.trim()) {
              return;
            }

            setIsLoading(true);

            try {
              const res = await axios.post("/api/auth/sendOtp", {
                email: typedEmail.trim(),
              });

              if (res.status === 201) {
                setTypedEmail("");
                router.replace(`/verify-email?email=${typedEmail.trim()}`);
              }
            } catch (error) {
              // TODO: show error to user
              console.error("Verification failed", error);
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
            onChange={(e) => setTypedEmail(e.target.value)}
          />

          <button
            disabled={isLoading}
            className="w-full flex items-center justify-center rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {isLoading ? (
              <RiLoader5Line className="animate-spin size-4" />
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="A verification code has been sent to your email address. Please enter it below to verify your account."
      footer={
        <>
          Didn&apos;t receive the OTP?{" "}
          <button
            onClick={async () => {
              try {
                const res = await axios.post("/api/auth/sendOtp", {
                  email,
                });
                if (res.status === 200) {
                  // Optionally show a success message or toast here
                  console.log("OTP resent successfully");
                }
              } catch (error) {
                console.log("OTP resend failed", error);
                //TODO: show error to user
              }
            }}
            className="text-primary hover:underline font-medium"
          >
            Resend OTP
          </button>
        </>
      }
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (!otp.trim()) {
            return;
          }

          setIsLoading(true);

          try {
            const res = await axios.post("/api/auth/verify-email", {
              email,
              otp,
            });

            if (res.status === 200) {
              router.replace("/dashboard");
            }
          } catch (error) {
            // TODO: show error to user
            console.error("Verification failed", error);
          } finally {
            setIsLoading(false);
          }
        }}
        className="space-y-4"
      >
        <Field
          onChange={(e) => setOtp(e.target.value)}
          label="Verification Code"
          type="text"
          required
        />
        <button
          disabled={isLoading}
          className="flex items-center justify-center w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {isLoading ? (
            <RiLoader5Line className="animate-spin size-4" />
          ) : (
            "Verify"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
