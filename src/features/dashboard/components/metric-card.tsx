import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden border-2 border-border shadow-[3px_3px_0_#0a0a0a]", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="font-data text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center border border-border/40 bg-[#EAF2FF] text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="font-display text-3xl font-black tracking-tight text-foreground">
          {value}
        </div>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={cn("mt-2 text-xs font-bold uppercase tracking-wide", trend.value >= 0 ? "text-success" : "text-destructive")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
