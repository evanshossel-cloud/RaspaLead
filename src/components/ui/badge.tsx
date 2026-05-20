import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-2.5 py-1 font-data text-[11px] font-black uppercase tracking-[0.14em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default: "border-[#050505] bg-[#EAF2FF] text-[#155EEF]",
        secondary: "border-[#050505] bg-[#E9FBEF] text-[#059669]",
        destructive: "border-destructive bg-red-50 text-destructive",
        outline: "border-[#050505] bg-white text-[#334155]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
