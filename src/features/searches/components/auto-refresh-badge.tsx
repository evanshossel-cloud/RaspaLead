import { RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AutoRefreshBadge() {
  return (
    <Badge variant="secondary" className="gap-2 border-[#050505] bg-[#EAF2FF] text-[#155EEF]">
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#155EEF]/55 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#155EEF]" />
      </span>
      <RefreshCcw className="h-3.5 w-3.5 animate-[spin_6s_linear_infinite]" />
      Atualizando automaticamente
    </Badge>
  );
}
