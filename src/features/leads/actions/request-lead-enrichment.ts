"use server";

import { revalidatePath } from "next/cache";
import type { LeadRecord } from "@/features/leads/types";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";

interface RequestLeadEnrichmentResult {
  success?: boolean;
  error?: string;
}

export async function requestLeadEnrichmentAction(
  leadId: string,
): Promise<RequestLeadEnrichmentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sua sessao expirou. Faca login novamente." };
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Nao foi possivel identificar o workspace ativo." };
  }

  const { data: leadData, error: leadError } = await supabase
    .from("leads")
    .select("id, workspace_id, search_id, enrichment_status")
    .eq("workspace_id", workspace.id)
    .eq("id", leadId)
    .maybeSingle();

  const lead = leadData as Pick<
    LeadRecord,
    "id" | "workspace_id" | "search_id" | "enrichment_status"
  > | null;

  if (leadError || !lead) {
    return { error: "Lead nao encontrado no workspace atual." };
  }

  if (
    lead.enrichment_status === "queued" ||
    lead.enrichment_status === "processing"
  ) {
    return { error: "Este lead ja esta em processo de enriquecimento." };
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({
      enrichment_status: "queued",
      enrichment_requested_at: new Date().toISOString(),
      enriched_at: null,
      enrichment_error: null,
    } as never)
    .eq("workspace_id", workspace.id)
    .eq("id", leadId);

  if (updateError) {
    return {
      error: "Nao foi possivel colocar o lead na fila de enriquecimento.",
    };
  }

  try {
    await inngest.send({
      name: "lead.enrichment.requested",
      data: {
        lead_id: leadId,
        workspace_id: workspace.id,
        user_id: user.id,
      },
    } as never);
  } catch {
    await supabase
      .from("leads")
      .update({
        enrichment_status: "failed",
        enrichment_error: "Falha ao enviar o enriquecimento para processamento.",
      } as never)
      .eq("workspace_id", workspace.id)
      .eq("id", leadId);

    return {
      error:
        "O lead foi colocado na fila, mas nao conseguimos iniciar o processamento agora.",
    };
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");

  if (lead.search_id) {
    revalidatePath(`/searches/${lead.search_id}`);
  }

  return { success: true };
}
