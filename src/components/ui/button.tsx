import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(139,92,246,0.22),0_12px_28px_rgba(139,92,246,0.32)] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.26),0_16px_34px_rgba(139,92,246,0.38)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_12px_26px_rgba(236,72,153,0.22)] hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border-border/90 bg-card/75 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:-translate-y-0.5 hover:border-secondary/50 hover:bg-secondary/10 hover:text-secondary",
        secondary:
          "bg-secondary/90 text-secondary-foreground shadow-[0_12px_26px_rgba(59,130,246,0.22)] hover:-translate-y-0.5 hover:bg-secondary",
        ghost:
          "text-muted-foreground hover:border-border/80 hover:bg-accent/80 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
