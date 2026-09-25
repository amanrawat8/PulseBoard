import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUsers } from "@/api/users";
import { useCreateTask } from "@/api/tasks";
import { extractErrorMessage } from "@/lib/api-client";
import { PRIORITY_LABELS } from "@/lib/format";
import type { TaskPriority } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignedToId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string().min(1, "Due date is required"),
});
type FormValues = z.infer<typeof schema>;

const PRIORITY_OPTIONS: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function CreateTaskDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const { data: developers = [] } = useUsers("DEVELOPER");
  const createTask = useCreateTask();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createTask.mutateAsync({
        projectId,
        title: values.title,
        description: values.description || undefined,
        assignedToId: values.assignedToId || undefined,
        priority: values.priority,
        dueDate: new Date(values.dueDate).toISOString(),
      });
      toast.success("Task created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description (optional)</Label>
            <Textarea id="task-description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {PRIORITY_LABELS[priority]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input id="task-due-date" type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-xs text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assign to (optional)</Label>
            <Controller
              control={control}
              name="assignedToId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {developers.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
