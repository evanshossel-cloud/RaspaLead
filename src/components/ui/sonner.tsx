"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-[3px] group-[.toaster]:border-[#050505] group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:rounded-[8px] group-[.toaster]:shadow-[5px_5px_0_#050505]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:shadow-[0_10px_24px_rgba(139,92,246,0.26)]",
          cancelButton:
            "group-[.toast]:bg-muted/80 group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
