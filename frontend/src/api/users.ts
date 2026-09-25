import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { Role, User } from "@/types";

export function useUsers(role?: Role) {
  return useQuery({
    queryKey: queryKeys.users(role),
    queryFn: async () =>
      (await apiClient.get<User[]>("/users", { params: role ? { role } : {} })).data,
  });
}
