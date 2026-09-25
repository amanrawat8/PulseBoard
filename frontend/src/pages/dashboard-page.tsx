import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  ListChecks,
  Users,
} from "lucide-react";

import { ActivityFeed } from "@/components/activity/activity-feed";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskRow } from "@/components/tasks/task-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/api/dashboard";
import { useAuth } from "@/context/auth-context";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { STATUS_LABELS } from "@/lib/format";
import type { DashboardAdmin, DashboardPm, DashboardDeveloper, TaskStatus } from "@/types";

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">
          Welcome back, {user?.name.split(" ")[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          Here's what's happening across your work right now.
        </p>
      </div>

      {data.role === "ADMIN" && <AdminDashboard data={data} />}
      {data.role === "PM" && <PmDashboard data={data} />}
      {data.role === "DEVELOPER" && <DeveloperDashboard data={data} />}
    </div>
  );
}

function AdminDashboard({ data }: { data: DashboardAdmin }) {
  const [onlineCount, setOnlineCount] = useState(data.onlineUserCount);
  useSocketEvent<{ onlineCount: number }>("presence:update", (payload) => {
    setOnlineCount(payload.onlineCount);
  });

  const totalTasks = Object.values(data.totalTasksByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={data.totalProjects} icon={FolderKanban} />
        <StatCard label="Total Tasks" value={totalTasks} icon={ListChecks} accent="primary" />
        <StatCard
          label="Overdue Tasks"
          value={data.overdueTaskCount}
          icon={AlertTriangle}
          accent="destructive"
        />
        <StatCard
          label="Online Now"
          value={onlineCount}
          icon={Users}
          accent="success"
          hint="Live via WebSocket presence"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => {
              const count = data.totalTasksByStatus[status] ?? 0;
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <ActivityFeed title="Global Activity" maxHeight="h-72" />
      </div>
    </div>
  );
}

function PmDashboard({ data }: { data: DashboardPm }) {
  const totalTasks = Object.values(data.tasksByPriority).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="My Projects" value={data.projectsSummary.length} icon={FolderKanban} />
        <StatCard label="Total Tasks" value={totalTasks} icon={ListChecks} />
        <StatCard
          label="Due This Week"
          value={data.upcomingDueThisWeek.length}
          icon={CalendarClock}
          accent="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.projectsSummary.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No projects yet
              </p>
            ) : (
              data.projectsSummary.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <span className="font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {project.taskCount} tasks
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <ActivityFeed title="Your Projects' Activity" maxHeight="h-72" />
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">
          Upcoming Due This Week
        </h3>
        <div className="space-y-2">
          {data.upcomingDueThisWeek.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing due this week
            </p>
          ) : (
            data.upcomingDueThisWeek.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      </div>
    </div>
  );
}

function DeveloperDashboard({ data }: { data: DashboardDeveloper }) {
  const overdueCount = data.assignedTasks.filter((t) => t.isOverdue).length;
  const doneCount = data.assignedTasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned to You" value={data.assignedTasks.length} icon={ListChecks} />
        <StatCard label="Overdue" value={overdueCount} icon={AlertTriangle} accent="destructive" />
        <StatCard label="Completed" value={doneCount} icon={CheckCircle2} accent="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-display text-sm font-semibold">
            Your Tasks · by priority
          </h3>
          <div className="space-y-2">
            {data.assignedTasks.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No tasks assigned to you yet
              </p>
            ) : (
              data.assignedTasks.map((task) => <TaskRow key={task.id} task={task} />)
            )}
          </div>
        </div>

        <ActivityFeed title="Your Activity" maxHeight="h-96" />
      </div>
    </div>
  );
}
