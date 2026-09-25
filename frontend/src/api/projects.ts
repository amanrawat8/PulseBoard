import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { Project } from "@/types";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => (await apiClient.get<Project[]>("/projects")).data,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.project(id ?? ""),
    queryFn: async () => (await apiClient.get<Project>(`/projects/${id}`)).data,
    enabled: Boolean(id),
  });
}

interface CreateProjectInput {
  name: string;
  description?: string;
  clientId: string;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProjectInput) =>
      (await apiClient.post<Project>("/projects", data)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
