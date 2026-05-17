"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateWorkspaceSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  brand_name: z.string().optional(),
  default_offer: z.string().optional(),
  default_target_audience: z.string().optional(),
});

export async function updateWorkspaceAction(workspaceId: string, formData: FormData) {
  const parsed = updateWorkspaceSchema.safeParse({
    name: formData.get("name"),
    brand_name: formData.get("brand_name") || undefined,
    default_offer: formData.get("default_offer") || undefined,
    default_target_audience: formData.get("default_target_audience") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const updateData = {
    name: parsed.data.name,
    brand_name: parsed.data.brand_name ?? null,
    default_offer: parsed.data.default_offer ?? null,
    default_target_audience: parsed.data.default_target_audience ?? null,
  };

  // Type cast needed because supabase-js infers 'never' for update when using
  // manually-written Database types (vs Supabase CLI-generated types).
  // At runtime, this is correct — will be removed when using generated types.
  const { error } = await supabase
    .from("workspaces")
    .update(updateData as unknown as never)
    .eq("id", workspaceId)
    .eq("owner_id", user.id);

  if (error) return { error: "Erro ao atualizar workspace" };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
