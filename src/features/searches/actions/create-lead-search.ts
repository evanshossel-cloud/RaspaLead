"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import {
  createLeadSearchSchema,
  type CreateLeadSearchInput,
} from "../schemas/create-lead-search-schema";
import type {
  CreateLeadSearchActionState,
  LeadSearchRecord,
  LeadSearchInsert,
} from "../types";

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getSearchInput(formData: FormData): CreateLeadSearchInput {
  return {
    name: String(formData.get("name") ?? ""),
    state: String(formData.get("state") ?? ""),
    city: String(formData.get("city") ?? ""),
    neighborhood: String(formData.get("neighborhood") ?? ""),
    niche: String(formData.get("niche") ?? ""),
    keyword: String(formData.get("keyword") ?? ""),
    quantity_requested: Number(formData.get("quantity_requested") ?? 0),
    user_offer: String(formData.get("user_offer") ?? ""),
    target_customer_profile: String(
      formData.get("target_customer_profile") ?? "",
    ),
  };
}

export async function createLeadSearchAction(
  formData: FormData,
): Promise<CreateLeadSearchActionState | void> {
  const parsed = createLeadSearchSchema.safeParse(getSearchInput(formData));

  if (!parsed.success) {
    return {
      error: "Revise os campos do formulario e tente novamente.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

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

  const userOffer =
    normalizeOptionalString(parsed.data.user_offer) ?? workspace.default_offer ?? null;

  const searchToInsert: LeadSearchInsert = {
    workspace_id: workspace.id,
    user_id: user.id,
    name: parsed.data.name,
    state: parsed.data.state,
    city: parsed.data.city,
    neighborhood: normalizeOptionalString(parsed.data.neighborhood),
    niche: parsed.data.niche,
    keyword: normalizeOptionalString(parsed.data.keyword),
    quantity_requested: parsed.data.quantity_requested,
    quantity_found: 0,
    status: "pending",
    progress: 0,
    user_offer: userOffer,
    target_customer_profile: normalizeOptionalString(
      parsed.data.target_customer_profile,
    ),
  };

  const insertResult = await supabase
    .from("lead_searches")
    .insert(searchToInsert as never)
    .select("id, workspace_id, user_id")
    .single();

  const createdSearch = insertResult.data as Pick<
    LeadSearchRecord,
    "id" | "workspace_id" | "user_id"
  > | null;
  const insertError = insertResult.error;

  if (insertError || !createdSearch) {
    return {
      error: "Nao foi possivel criar a busca agora. Tente novamente em instantes.",
    };
  }

  try {
    await inngest.send({
      name: "lead-search.created",
      data: {
        search_id: createdSearch.id,
        workspace_id: createdSearch.workspace_id,
        user_id: createdSearch.user_id,
      },
    });
  } catch {
    await supabase
      .from("lead_searches")
      .update({
        status: "failed",
        error_message: "Falha ao enviar a busca para processamento.",
      } as never)
      .eq("id", createdSearch.id)
      .eq("workspace_id", workspace.id);

    return {
      error:
        "A busca foi criada, mas nao conseguimos iniciar o processamento em background.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/searches");
  revalidatePath("/leads");

  redirect("/searches");
}
