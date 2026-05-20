import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[8px] border-2 border-[#E2E8F0] bg-[#F1F5F9] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}
