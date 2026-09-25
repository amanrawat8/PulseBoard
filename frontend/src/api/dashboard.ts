import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { Dashboard } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => (await apiClient.get<Dashboard>("/dashboard")).data,
  });
}
