import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive";
  hint?: string;
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/15 text-destructive",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  hint,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            ACCENT_STYLES[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-2xl leading-none font-bold">{value}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
