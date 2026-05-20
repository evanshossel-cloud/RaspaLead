import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  eyebrow?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
  eyebrow = "Central de Prospeccao",
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="space-y-2">
        <p className="font-data text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground md:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex flex-wrap gap-3 lg:justify-end">{action}</div>}
    </div>
  );
}
