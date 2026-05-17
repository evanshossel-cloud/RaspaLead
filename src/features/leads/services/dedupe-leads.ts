import type { RawLeadResult } from "@/features/leads/providers/types";
import { createLeadDedupeKey } from "@/features/leads/utils/normalize-lead";

function completenessScore(lead: RawLeadResult): number {
  let score = 0;
  if (lead.phone) score++;
  if (lead.website) score++;
  if (lead.address) score++;
  if (lead.rating != null) score++;
  if (lead.reviewCount != null) score++;
  if (lead.googleMapsUrl) score++;
  return score;
}

export function dedupeRawLeads(rawLeads: RawLeadResult[]): RawLeadResult[] {
  const seen = new Map<string, RawLeadResult>();

  for (const lead of rawLeads) {
    const key = createLeadDedupeKey({
      phone: lead.phone,
      website: lead.website,
      externalId: lead.externalId,
      companyName: lead.companyName,
      city: lead.city,
      state: lead.state,
      address: lead.address,
    });

    const existing = seen.get(key);
    if (!existing || completenessScore(lead) > completenessScore(existing)) {
      seen.set(key, lead);
    }
  }

  return Array.from(seen.values());
}
