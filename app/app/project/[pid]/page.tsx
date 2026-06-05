"use client";

import { AppHeader } from "@/components/AppHeader";
import { type Project } from "@/lib/projects";
import { useParams } from "next/navigation";
import { FiGlobe, FiEdit2, FiCopy, FiChevronLeft } from "react-icons/fi";
import AnalyticsCard from "@/components/AnalyticsCard";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { RiLoader5Line } from "react-icons/ri";
import { RxExternalLink } from "react-icons/rx";
import { HiOutlineFaceFrown } from "react-icons/hi2";

export default function ProjectPage() {
  const { pid } = useParams() as { pid: string };

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
                    <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
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
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
                <FiEdit2 className="h-4 w-4" /> Edit
              </button>
            </div>
          </div>
          {/* Analytics Section */}
          <AnalyticsCard pid={pid} />
        </main>
      </div>
    )
  );
}
