import { DetailHeroSkeleton, MetricsSkeleton, TableSkeleton } from "@/components/shared/premium-loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-3xl" />
      </div>
      <DetailHeroSkeleton />
      <MetricsSkeleton count={6} />
      <Skeleton className="h-[220px] rounded-2xl" />
      <TableSkeleton columns={9} rows={5} mobileCards={2} />
    </div>
  );
}
