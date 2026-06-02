"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import Link from "next/link";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import Field from "@/components/ui/Field";
import { RiLoader5Line } from "react-icons/ri";
import axios from "axios";

export default function NewProject() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [testingLocally, setTestingLocally] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProject = async () => {
    if (!name.trim()) {
      return;
    }

    const finalDomain = testingLocally === true ? "localhost:3000" : domain;
    if (!finalDomain.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post("/api/project/create", {
        name,
        domain: finalDomain,
      });

      if (res.status === 201) {
        console.log("Project created:", res.data.project);
      }
    } catch (error) {
      console.log("Error creating project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href={"/dashboard"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Add a new site</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Give the site a friendly name and the domain you want to observe.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createProject();
            }}
            className="mt-8 space-y-5"
          >
            <Field
              label="Project name"
              placeholder="Marketing site"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="text-sm font-medium">Testing locally?</label>
              <button
                type="button"
                onClick={() => {
                  setTestingLocally(!testingLocally);
                }}
                className={`hover:cursor-pointer flex items-center gap-1 w-fit rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  testingLocally === true
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background hover:bg-accent"
                }`}
              >
                {testingLocally && (
                  <FiCheck className="size-4 transition ease-in-out" />
                )}
                <span>Yes</span>
              </button>
            </div>
            <Field
              label="Domain"
              placeholder="example.com"
              value={testingLocally === true ? "localhost:3000" : domain}
              onChange={(e) => {
                if (testingLocally !== true) {
                  setDomain(e.target.value);
                }
              }}
              disabled={testingLocally === true}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href={"/dashboard"}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="hover:cursor-pointer flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {isSubmitting ? (
                  <RiLoader5Line className="animate-spin size-4" />
                ) : (
                  "Create project"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
