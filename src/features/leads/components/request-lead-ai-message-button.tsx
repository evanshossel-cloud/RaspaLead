"use client";

import { useTransition } from "react";
import { Loader2, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { requestLeadAiMessageAction } from "@/features/leads/actions/request-lead-ai-message";
import type { LeadAiMessageStatus } from "@/features/leads/types";

interface RequestLeadAiMessageButtonProps {
  leadId: string;
  aiMessageStatus: LeadAiMessageStatus;
}

export function RequestLeadAiMessageButton({
  leadId,
  aiMessageStatus,
}: RequestLeadAiMessageButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isQueued = aiMessageStatus === "queued";
  const isProcessing = aiMessageStatus === "processing";
  const isGenerated = aiMessageStatus === "generated";
  const isDisabled = isPending || isQueued || isProcessing || isGenerated;

  const label = isQueued || isProcessing
    ? "Gerando mensagem..."
    : isGenerated
      ? "Gerar novamente"
      : aiMessageStatus === "failed"
        ? "Tentar novamente"
        : "Gerar mensagem";

  function handleClick() {
    if (isDisabled) return;

    startTransition(async () => {
      const result = await requestLeadAiMessageAction(leadId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Geracao de mensagem iniciada.");
      router.refresh();
    });
  }

  return (
    <Button disabled={isDisabled} onClick={handleClick} variant={isGenerated ? "outline" : "default"}>
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enfileirando...
        </>
      ) : (
        <>
          <MessageSquareText className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
