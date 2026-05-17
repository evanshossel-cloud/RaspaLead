import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { RawLeadResult } from "@/features/leads/providers/types";
import { createLeadDedupeKey } from "@/features/leads/utils/normalize-lead";

export async function filterExistingLeads(params: {
  supabase: SupabaseClient<Database>;
  workspaceId: string;
  searchId: string;
  rawLeads: RawLeadResult[];
}): Promise<RawLeadResult[]> {
  const { supabase, workspaceId, searchId, rawLeads } = params;

  if (rawLeads.length === 0) return [];

  const { data: existingLeads } = await supabase
    .from("leads")
    .select("phone, website, company_name, city, state, address, dedup_hash")
    .eq("workspace_id", workspaceId)
    .neq("search_id", searchId)
    .limit(2000);

  if (!existingLeads || existingLeads.length === 0) return rawLeads;

  const existingKeys = new Set<string>();

  for (const lead of existingLeads) {
    const computedKey = createLeadDedupeKey({
      phone: lead.phone,
      website: lead.website,
      companyName: lead.company_name,
      city: lead.city,
      state: lead.state,
      address: lead.address,
    });
    existingKeys.add(computedKey);

    if (lead.dedup_hash) {
      existingKeys.add(lead.dedup_hash);
    }
  }

  return rawLeads.filter((raw) => {
    const key = createLeadDedupeKey({
      phone: raw.phone,
      website: raw.website,
      externalId: raw.externalId,
      companyName: raw.companyName,
      city: raw.city,
      state: raw.state,
      address: raw.address,
    });
    return !existingKeys.has(key);
  });
}
