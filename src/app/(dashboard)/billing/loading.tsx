import { MetricsSkeleton } from "@/components/shared/premium-loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-full max-w-3xl" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[280px] rounded-2xl" />
        <MetricsSkeleton count={3} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[320px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
