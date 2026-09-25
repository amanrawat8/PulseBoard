export const queryKeys = {
  clients: ["clients"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  tasks: (filters?: Record<string, string | undefined>) =>
    ["tasks", filters ?? {}] as const,
  task: (id: string) => ["tasks", id] as const,
  activityFeed: ["activity", "feed"] as const,
  notifications: ["notifications"] as const,
  dashboard: ["dashboard"] as const,
  users: (role?: string) => ["users", role ?? "all"] as const,
};
