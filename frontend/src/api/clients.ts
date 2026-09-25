import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { Client } from "@/types";

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: async () => (await apiClient.get<Client[]>("/clients")).data,
  });
}

interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateClientInput) =>
      (await apiClient.post<Client>("/clients", data)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}
