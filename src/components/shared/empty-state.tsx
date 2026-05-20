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
        "border-2 border-border bg-card px-6 py-14 text-center shadow-[4px_4px_0_#0a0a0a]",
        className
      )}
    >
      {Icon && (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-2 border-border bg-[#EAF2FF] shadow-[3px_3px_0_#0a0a0a]">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      )}
      <h3 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}
