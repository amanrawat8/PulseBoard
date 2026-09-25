import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { Task, TaskFilters, TaskPriority, TaskStatus } from "@/types";

function buildFilterParams(filters: TaskFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.dueFrom) params.dueFrom = filters.dueFrom;
  if (filters.dueTo) params.dueTo = filters.dueTo;
  return params;
}

export function useTasks(filters: TaskFilters = {}) {
  const params = buildFilterParams(filters);
  return useQuery({
    queryKey: queryKeys.tasks(params),
    queryFn: async () => (await apiClient.get<Task[]>("/tasks", { params })).data,
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.task(id ?? ""),
    queryFn: async () => (await apiClient.get<Task>(`/tasks/${id}`)).data,
    enabled: Boolean(id),
  });
}

interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  assignedToId?: string;
  priority?: TaskPriority;
  dueDate: string;
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...data }: CreateTaskInput) =>
      (await apiClient.post<Task>(`/projects/${projectId}/tasks`, data)).data,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.project(variables.projectId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  assignedToId?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTaskInput) =>
      (await apiClient.patch<Task>(`/tasks/${id}`, data)).data,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(data.id) });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) =>
      (await apiClient.patch<Task>(`/tasks/${id}/status`, { status })).data,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(data.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
