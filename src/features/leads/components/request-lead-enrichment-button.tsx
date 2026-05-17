"use client";

import { useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { requestLeadEnrichmentAction } from "@/features/leads/actions/request-lead-enrichment";
import type { LeadRecord } from "@/features/leads/types";

interface RequestLeadEnrichmentButtonProps {
  leadId: string;
  enrichmentStatus: LeadRecord["enrichment_status"];
}

export function RequestLeadEnrichmentButton({
  leadId,
  enrichmentStatus,
}: RequestLeadEnrichmentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isQueued = enrichmentStatus === "queued";
  const isProcessing = enrichmentStatus === "processing";
  const isEnriched = enrichmentStatus === "enriched";
  const isDisabled = isPending || isQueued || isProcessing || isEnriched;

  const label = isQueued || isProcessing
    ? "Enriquecimento em andamento"
    : isEnriched
      ? "Reenriquecer"
      : enrichmentStatus === "failed"
        ? "Tentar novamente"
        : "Enriquecer lead";

  function handleClick() {
    if (isDisabled) return;

    startTransition(async () => {
      const result = await requestLeadEnrichmentAction(leadId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Lead enviado para enriquecimento.");
      router.refresh();
    });
  }

  return (
    <Button disabled={isDisabled} onClick={handleClick}>
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enfileirando...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
