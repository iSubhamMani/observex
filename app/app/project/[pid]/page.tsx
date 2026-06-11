"use client";

import { AppHeader } from "@/components/AppHeader";
import { type Project } from "@/lib/projects";
import { useParams, useRouter } from "next/navigation";
import {
  FiGlobe,
  FiEdit2,
  FiCopy,
  FiChevronLeft,
  FiX,
  FiCheck,
  FiTrash,
} from "react-icons/fi";
import AnalyticsCard from "@/components/AnalyticsCard";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RiLoader5Line } from "react-icons/ri";
import { RxExternalLink } from "react-icons/rx";
import { HiOutlineFaceFrown } from "react-icons/hi2";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";

export default function ProjectPage() {
  const { pid } = useParams() as { pid: string };
  const queryClient = useQueryClient();
  // Modal and Form States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [testingLocally, setTestingLocally] = useState(false); // Toggle state
  const [editPort, setEditPort] = useState(""); // Dedicated port tracking state
  const router = useRouter();
  const { showToast } = useToast();

  const {
    data: project,
    isFetching,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["project", pid],
    queryFn: async () => {
      const res = await fetch(`/api/project/${pid}`);
      if (!res.ok) {
        throw new Error("Failed to fetch project data");
      }
      const data = await res.json();
      return data.project as Project;
    },
    staleTime: Infinity,
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (updatedData: { name: string; domain: string }) => {
      const res = await fetch(`/api/project/${pid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        throw new Error("Failed to update project!");
      }
      return res.json();
    },
    onSuccess: () => {
      // Refresh the query cache instantly across the UI
      queryClient.invalidateQueries({ queryKey: ["project", pid] });
      setIsEditModalOpen(false);
      showToast("success", "Project updated successfully!");
    },
    onError: (error) => {
      if (error instanceof Error) {
        showToast(
          "error",
          error.message || "Failed to update project. Please try again.",
        );
      }
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/project/${pid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete project!");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showToast("success", "Project deleted successfully!");
      setIsDeleteModalOpen(false);
      router.replace("/dashboard");
    },
    onError: (error) => {
      if (error instanceof Error) {
        showToast(
          "error",
          error.message || "Failed to delete project. Please try again.",
        );
      }
    },
  });

  const openEditModal = () => {
    if (project) {
      setEditName(project.name);

      const isLocal =
        project.domain.startsWith("localhost:") ||
        project.domain === "localhost";
      setTestingLocally(isLocal);

      if (isLocal) {
        // Isolate and extract just the port suffix digits (e.g. "localhost:3000" -> "3000")
        const extractedPort = project.domain.split(":")[1] || "";
        setEditPort(extractedPort);
        setEditDomain("");
      } else {
        setEditDomain(project.domain);
        setEditPort("");
      }

      setIsEditModalOpen(true);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    // Build the final combined target payload string
    const finalDomainValue = testingLocally
      ? `localhost:${editPort.trim()}`
      : editDomain.trim();

    // Validation validation safety assertions
    if (testingLocally && !editPort.trim()) return;
    if (!testingLocally && !editDomain.trim()) return;

    updateProjectMutation.mutate({
      name: editName,
      domain: finalDomainValue,
    });
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    deleteProjectMutation.mutate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <RiLoader5Line className="animate-spin mx-auto size-5 text-primary/70" />
        </main>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-muted-foreground text-lg font-medium">
            <HiOutlineFaceFrown className="mx-auto mb-2 size-6" />
            <span>Project not found!</span>
          </p>
          <Link
            href={"/dashboard"}
            className="flex items-center gap-1 mt-4 group w-max mx-auto"
          >
            <FiChevronLeft className="group-hover:-translate-x-0.5 transition" />
            <span className="underline underline-offset-2">
              Back to dashboard
            </span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    !isFetching &&
    !isError &&
    isSuccess &&
    project && (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* Project Info Card */}
          <Link
            href={"/dashboard"}
            className="flex items-center gap-1 mb-4 group w-max"
          >
            <FiChevronLeft className="group-hover:-translate-x-0.5 transition" />
            <span>Back</span>
          </Link>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <FiGlobe className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    {project.name}
                  </h1>
                  {project && (
                    <Link
                      href={
                        project.domain.startsWith("localhost")
                          ? project.domain
                          : `https://${project.domain}`
                      }
                      target="_blank"
                      className="hover:text-foreground transition-colors"
                      title="Copy domain"
                    >
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {project.domain}
                        <RxExternalLink className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">ID:</span>
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {project.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(pid)}
                      className="hover:text-foreground transition-colors text-muted-foreground"
                      title="Copy website ID"
                    >
                      <FiCopy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <button
                  onClick={openEditModal}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <FiEdit2 className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={openDeleteModal}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-red-600 px-3 text-white py-2 text-sm font-medium hover:bg-red-500 transition-colors"
                >
                  <FiTrash className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
          {/* Analytics Section */}
          <AnalyticsCard
            pid={pid}
            projectCreatedAt={project.createdAt.toString()}
          />
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg relative">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FiX className="size-4" />
                </button>

                <h2 className="text-lg font-bold tracking-tight mb-4">
                  Edit Project Settings
                </h2>

                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-muted/20 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                      placeholder="My Production App"
                    />
                  </div>

                  {/* Local Environment Context Toggle Button Indicator */}
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

                  {/* Conditional Field Context Handler Layout */}
                  <div className="space-y-1.5">
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
                          value={editPort}
                          onChange={(e) =>
                            setEditPort(e.target.value.replace(/\D/g, ""))
                          } // Only allow digits for clean port mapping
                          className="flex-1 bg-muted/20 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                          placeholder="3000"
                        />
                      </div>
                    ) : (
                      /* ──► PRODUCTION TESTING: Render regular text domain field ◄── */
                      <input
                        type="text"
                        required
                        value={editDomain}
                        onChange={(e) => setEditDomain(e.target.value)}
                        className="w-full bg-muted/20 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors animate-fade-in"
                        placeholder="example.com"
                      />
                    )}
                  </div>

                  {/* Submit Action Block */}
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateProjectMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground font-medium px-4 py-2 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {updateProjectMutation.isPending && (
                        <RiLoader5Line className="animate-spin size-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg relative">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FiX className="size-4" />
                </button>

                <h2 className="text-lg font-bold tracking-tight mb-4">
                  Delete {project.name}?
                </h2>
                <p className="text-muted-foreground">
                  Are you sure you want to delete this project? This action
                  cannot be undone
                </p>

                <form onSubmit={handleDeleteSubmit} className="space-y-4">
                  {/* Submit Action Block */}
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={deleteProjectMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-600 text-white font-medium px-4 py-2 text-sm hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleteProjectMutation.isPending && (
                        <RiLoader5Line className="animate-spin size-4" />
                      )}
                      Yes, Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  );
}
