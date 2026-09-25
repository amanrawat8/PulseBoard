import { Link } from "react-router-dom";
import { FolderKanban, ListChecks } from "lucide-react";

import { CreateClientDialog } from "@/components/clients/create-client-dialog";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/api/projects";
import { useAuth } from "@/context/auth-context";
import { canManageProjectsAndTasks } from "@/lib/permissions";

export function ProjectsPage() {
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useProjects();
  const canManage = user ? canManageProjectsAndTasks(user) : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </p>
        {canManage && (
          <div className="flex items-center gap-2">
            <CreateClientDialog />
            <CreateProjectDialog />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <FolderKanban className="mb-3 size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage
              ? "Create your first project to get started."
              : "You'll see projects here once you're assigned a task."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FolderKanban className="size-4" />
                    </div>
                  </div>
                  <p className="pt-2 font-display font-semibold">{project.name}</p>
                  {project.client && (
                    <p className="text-xs text-muted-foreground">{project.client.name}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ListChecks className="size-3.5" />
                    {project._count?.tasks ?? 0} tasks
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
