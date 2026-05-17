import type { RawLeadResult } from "@/features/leads/providers/types";

export function calculateRawLeadScore(input: RawLeadResult): number {
  let score = 0;

  if (input.category) score += 20;

  if (input.phone) {
    score += 20;
  } else {
    score -= 20;
  }

  if (input.website) score += 15;
  if (input.address) score += 10;
  if (input.googleMapsUrl) score += 10;

  if (!input.city && !input.state) score -= 10;

  if (input.rating != null) {
    if (input.rating >= 4.2) score += 10;
  }

  if (input.reviewCount != null) {
    if (input.reviewCount >= 30) score += 10;
    else if (input.reviewCount >= 10) score += 5;
  }

  return Math.min(Math.max(score, 0), 100);
}
