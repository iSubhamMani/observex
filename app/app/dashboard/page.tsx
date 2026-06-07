"use client";

import { AppHeader } from "@/components/AppHeader";
import {
  ProjectsGridSkeleton,
  ProjectCardSkeleton,
} from "@/components/ui/ProjectSkeleton";
import { useInfiniteProjects } from "@/hooks/useInfiniteProjects";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FiArrowUpRight, FiGlobe, FiPlus } from "react-icons/fi";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProjects({ search, limit: 10 });

  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const projects = data?.pages.flatMap((page) => page.projects) ?? [];
  const total = data?.pages[0]?.pagination.total ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your sites</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} site{total === 1 ? "" : "s"} under observation
            </p>
          </div>
          <Link
            href={"/new"}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <FiPlus className="h-4 w-4" /> New project
          </Link>
        </div>

        {/* Search Input */}
        <div className="mt-6 flex items-center gap-2 w-full md:w-1/2 rounded-lg border-2 border-input bg-background px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
          <CiSearch className="size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent focus:outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <ProjectsGridSkeleton count={6} />
        ) : projects.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              {search
                ? "No projects found matching your search."
                : "No projects yet. Create your first project!"}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/project/${p.id}`}
                  className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/60 animate-fade-in"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <FiGlobe className="h-5 w-5" />
                    </div>
                    <FiArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.domain}</p>
                </Link>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasNextPage && (
              <div ref={observerTarget} className="mt-8 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <ProjectCardSkeleton key={i} />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
