import { MetricsSkeleton, TableSkeleton } from "@/components/shared/premium-loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-full max-w-3xl" />
      </div>
      <MetricsSkeleton count={4} />
      <TableSkeleton columns={9} rows={6} mobileCards={3} />
    </div>
  );
}
