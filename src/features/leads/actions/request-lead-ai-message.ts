"use server";

import { revalidatePath } from "next/cache";
import type { LeadRecord } from "@/features/leads/types";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";

interface RequestLeadAiMessageResult {
  success?: boolean;
  error?: string;
}

export async function requestLeadAiMessageAction(
  leadId: string,
): Promise<RequestLeadAiMessageResult> {
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
    .select("id, workspace_id, ai_message_status")
    .eq("workspace_id", workspace.id)
    .eq("id", leadId)
    .maybeSingle();

  const lead = leadData as Pick<
    LeadRecord,
    "id" | "workspace_id" | "ai_message_status"
  > | null;

  if (leadError || !lead) {
    return { error: "Lead nao encontrado no workspace atual." };
  }

  if (
    lead.ai_message_status === "queued" ||
    lead.ai_message_status === "processing"
  ) {
    return { error: "Ja existe uma geracao de mensagem em andamento para este lead." };
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({
      ai_message_status: "queued",
      ai_message_requested_at: new Date().toISOString(),
      ai_message_generated_at: null,
      ai_message_error: null,
    } as never)
    .eq("workspace_id", workspace.id)
    .eq("id", leadId);

  if (updateError) {
    return {
      error: "Nao foi possivel colocar a geracao de mensagem na fila.",
    };
  }

  try {
    await inngest.send({
      name: "lead.ai-message.requested",
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
        ai_message_status: "failed",
        ai_message_error: "Falha ao enviar a geracao da mensagem para processamento.",
      } as never)
      .eq("workspace_id", workspace.id)
      .eq("id", leadId);

    return {
      error:
        "O pedido foi registrado, mas nao conseguimos iniciar a geracao da mensagem agora.",
    };
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");

  return { success: true };
}
