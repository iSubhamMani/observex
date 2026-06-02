import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Project } from "@/lib/projects";

interface FetchProjectsParams {
  search?: string;
  limit?: number;
}

interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export function useInfiniteProjects({
  search = "",
  limit = 10,
}: FetchProjectsParams = {}) {
  return useInfiniteQuery({
    queryKey: ["projects", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ProjectsResponse>("/api/project", {
        params: {
          page: pageParam,
          limit,
          search,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : null;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
