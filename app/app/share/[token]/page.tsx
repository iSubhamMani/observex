"use client";

import { type Project } from "@/lib/projects";
import { useParams } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";
import AnalyticsCard from "@/components/AnalyticsCard";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { RiLoader5Line } from "react-icons/ri";
import { HiOutlineFaceFrown } from "react-icons/hi2";
import { SiteHeader } from "@/components/SiteHeader";

export default function ShareProjectPage() {
  const { token } = useParams() as { token: string };

  const {
    data: project,
    isFetching,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["project", token],
    queryFn: async () => {
      const res = await fetch(`/api/share/${token}`);
      if (!res.ok) {
        throw new Error("Failed to fetch project data");
      }
      const data = await res.json();
      return data.project as Project;
    },
    enabled: !!token,
    staleTime: Infinity,
  });

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <RiLoader5Line className="animate-spin mx-auto size-5 text-primary/70" />
        </main>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
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
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* Analytics Section */}
          <AnalyticsCard
            isPublic={true}
            shareToken={token}
            pid={project.id}
            projectCreatedAt={project.createdAt.toString()}
          />
        </main>
      </div>
    )
  );
}
