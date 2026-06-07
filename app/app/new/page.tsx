"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import Link from "next/link";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import Field from "@/components/ui/Field";
import { RiLoader5Line } from "react-icons/ri";
import axios, { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function NewProject() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [testingLocally, setTestingLocally] = useState<boolean | null>(null);
  const [port, setPort] = useState("3000");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showToast } = useToast();

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; domain: string }) => {
      const res = await axios.post("/api/project/create", {
        name: data.name,
        domain: data.domain,
      });

      if (res.status === 201) {
        return res.data.project;
      }
    },
    onSuccess: ({ websiteId }) => {
      // Refresh the query cache instantly across the UI
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showToast("success", "Project created successfully!");
      router.replace(`/project/${websiteId}`); // Redirect to the new project's page
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        showToast(
          "error",
          error.response?.data.error ||
            "Failed to create project. Please try again.",
        );
      }
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validation validation safety assertions
    if (testingLocally && !port.trim()) return;
    if (!testingLocally && !domain.trim()) return;

    // Build the final combined target payload string
    const finalDomainValue = testingLocally
      ? `localhost:${port.trim()}`
      : domain.trim();

    let cleanedDomain;
    if (finalDomainValue) {
      // remove any protocol prefixes if the user included them, we only want the raw domain for consistency
      cleanedDomain = finalDomainValue.replace(/(^\w+:|^)\/\//, "");
    }

    createProjectMutation.mutate({
      name: name.trim(),
      domain: cleanedDomain!,
    });
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

          <form onSubmit={handleCreateSubmit} className="mt-8 space-y-5">
            <Field
              label="Project name"
              placeholder="Marketing site"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Testing locally?
              </label>
              <button
                type="button"
                onClick={() => setTestingLocally(!testingLocally)}
                className={`hover:cursor-pointer flex items-center gap-1 w-fit rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  testingLocally === true
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background hover:bg-accent text-foreground"
                }`}
              >
                {testingLocally && (
                  <FiCheck className="size-3.5 transition ease-in-out" />
                )}
                <span>Yes</span>
              </button>
            </div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {testingLocally ? "Local Port Number" : "Domain Address"}
            </label>

            {testingLocally ? (
              /* ──► LOCAL TESTING ACTIVE: Render prefix append block ◄── */
              <div className="flex items-center gap-1.5 animate-fade-in">
                <span className="text-sm text-muted-foreground bg-muted/50 border border-border rounded-md px-3 py-2 select-none">
                  localhost:
                </span>
                <input
                  type="text"
                  required
                  value={port}
                  onChange={(e) => setPort(e.target.value.replace(/\D/g, ""))} // Only allow digits for clean port mapping
                  className="flex-1 bg-muted/20 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  placeholder="3000"
                />
              </div>
            ) : (
              /* ──► PRODUCTION TESTING: Render regular text domain field ◄── */
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-muted/20 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors animate-fade-in"
                placeholder="example.com"
              />
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Link
                href={"/dashboard"}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground font-medium px-4 py-2 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {createProjectMutation.isPending && (
                  <RiLoader5Line className="animate-spin size-4" />
                )}
                Create
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
