import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Building2, ListChecks } from "lucide-react";

import { ActivityFeed } from "@/components/activity/activity-feed";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskRow } from "@/components/tasks/task-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/api/projects";
import { useAuth } from "@/context/auth-context";
import { canManageProject } from "@/lib/permissions";
import { STATUS_LABELS } from "@/lib/format";
import type { TaskStatus } from "@/types";

const TABS: Array<{ value: "ALL" | TaskStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: STATUS_LABELS.TODO },
  { value: "IN_PROGRESS", label: STATUS_LABELS.IN_PROGRESS },
  { value: "IN_REVIEW", label: STATUS_LABELS.IN_REVIEW },
  { value: "DONE", label: STATUS_LABELS.DONE },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: project, isLoading } = useProject(id);
  const [tab, setTab] = useState<"ALL" | TaskStatus>("ALL");

  const tasks = useMemo(() => {
    const all = project?.tasks ?? [];
    if (tab === "ALL") return all;
    return all.filter((task) => task.status === tab);
  }, [project, tab]);

  if (isLoading || !project) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const canManage = user ? canManageProject(user, project) : false;

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl font-bold">{project.name}</h2>
          {project.client && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="size-3.5" /> {project.client.name}
            </div>
          )}
          {project.description && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        {canManage && <CreateTaskDialog projectId={project.id} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "ALL" | TaskStatus)}>
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ListChecks className="size-3.5" />
              {tasks.length} task{tasks.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                No tasks in this view
              </div>
            ) : (
              tasks.map((task) => (
                <TaskRow key={task.id} task={{ ...task, project }} showProject={false} />
              ))
            )}
          </div>
        </div>

        <ActivityFeed projectId={project.id} title="Project Activity" />
      </div>
    </div>
  );
}
