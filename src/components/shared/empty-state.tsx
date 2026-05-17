import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-panel relative overflow-hidden rounded-2xl px-6 py-14 text-center",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {Icon && (
        <div className="glow-primary mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      )}
      <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}
