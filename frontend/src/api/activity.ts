import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { TaskActivityLog } from "@/types";

export function useActivityFeed() {
  return useQuery({
    queryKey: queryKeys.activityFeed,
    queryFn: async () =>
      (await apiClient.get<TaskActivityLog[]>("/activity/feed")).data,
  });
}
