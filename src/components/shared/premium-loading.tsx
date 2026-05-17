import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index}>
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-2 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({
  columns = 6,
  rows = 5,
  mobileCards = 3,
}: {
  columns?: number;
  rows?: number;
  mobileCards?: number;
}) {
  return (
    <>
      <div className="space-y-4 md:hidden">
        {Array.from({ length: mobileCards }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden md:block">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border/70">
                  {Array.from({ length: columns }, (_, index) => (
                    <th key={index} className="px-4 py-3">
                      <Skeleton className="h-3 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rows }, (_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border/60 last:border-b-0">
                    {Array.from({ length: columns }, (_, columnIndex) => (
                      <td key={columnIndex} className="px-4 py-4">
                        <Skeleton className={columnIndex === 0 ? "h-4 w-40" : "h-4 w-20"} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export function DetailHeroSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-6 p-6 xl:grid-cols-[1.3fr_0.85fr]">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-4/5 max-w-2xl" />
        </div>
        <div className="space-y-4 rounded-2xl border border-border/70 bg-background/60 p-5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
