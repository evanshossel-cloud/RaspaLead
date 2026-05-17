import { calculateRawLeadScore } from "@/features/leads/scoring/calculate-raw-score";
import { createLeadDedupeKey } from "@/features/leads/utils/normalize-lead";
import type { LeadInsert } from "@/features/leads/types";
import type { RawLeadResult } from "./types";

export function mapRawLeadToInsert(
  raw: RawLeadResult,
  workspaceId: string,
  searchId: string,
): LeadInsert {
  const rawScore = raw.rawScore ?? calculateRawLeadScore(raw);
  const finalScore = raw.finalScore ?? rawScore;

  const dedupHash = createLeadDedupeKey({
    phone: raw.phone,
    website: raw.website,
    externalId: raw.externalId,
    companyName: raw.companyName,
    city: raw.city,
    state: raw.state,
    address: raw.address,
  });

  return {
    workspace_id: workspaceId,
    search_id: searchId,
    place_id: raw.externalId ?? null,
    company_name: raw.companyName,
    category: raw.category ?? null,
    phone: raw.phone ?? null,
    website: raw.website ?? null,
    google_maps_url: raw.googleMapsUrl ?? null,
    address: raw.address ?? null,
    neighborhood: raw.neighborhood ?? null,
    city: raw.city ?? null,
    state: raw.state ?? null,
    rating: raw.rating ?? null,
    review_count: raw.reviewCount ?? null,
    source: raw.source,
    source_keyword: raw.sourceKeyword ?? null,
    raw_score: rawScore,
    final_score: finalScore,
    status: "new",
    enrichment_status: "not_enriched",
    dedup_hash: dedupHash,
  };
}
