import { RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AutoRefreshBadge() {
  return (
    <Badge variant="secondary" className="gap-2 border-secondary/30 bg-secondary/12 text-secondary shadow-[0_0_0_1px_rgba(59,130,246,0.14),0_0_18px_rgba(59,130,246,0.12)]">
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary/55 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
      </span>
      <RefreshCcw className="h-3.5 w-3.5 animate-[spin_6s_linear_infinite]" />
      Atualizando automaticamente
    </Badge>
  );
}
