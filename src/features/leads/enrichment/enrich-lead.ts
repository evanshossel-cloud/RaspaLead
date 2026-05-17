import type { LeadEnrichmentInsert, LeadRecord } from "@/features/leads/types";
import { getGooglePlaceDetails } from "./google-place-details";

export interface EnrichLeadResult {
  enrichment: LeadEnrichmentInsert;
  finalScore: number;
  leadFields: {
    phone: string | null;
    website: string | null;
    google_maps_url: string | null;
    address: string | null;
    rating: number | null;
    review_count: number | null;
  };
  enrichmentSource: "google_place_details" | "mock_enrichment";
}

const MOCK_COPYRIGHT_YEARS = [2018, 2020, 2022, 2024] as const;

function getSeed(value: string): number {
  return Array.from(value).reduce((total, char, index) => {
    return total + char.charCodeAt(0) * (index + 1);
  }, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function pickDeterministicNumber(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

function computeRealFinalScore(params: {
  baseScore: number;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
}): number {
  const { baseScore, phone, website, rating, reviewCount } = params;
  let score = baseScore;

  score += phone ? 8 : -3;

  if (website) {
    score += 3;
    if (website.startsWith("https://")) score += 2;
  }

  if (rating !== null && rating >= 4.2) score += 5;

  if (reviewCount !== null) {
    if (reviewCount >= 50) score += 8;
    else if (reviewCount >= 20) score += 5;
    else if (reviewCount >= 10) score += 3;
  }

  return clamp(score, 0, 100);
}

function computeMockFinalScore(params: {
  baseScore: number;
  phoneValid: boolean;
  websiteQualityScore: number;
  reviewRecencyScore: number;
}): number {
  const { baseScore, phoneValid, websiteQualityScore, reviewRecencyScore } = params;
  const scoreFromPhone = phoneValid ? 8 : -3;
  const scoreFromWebsite =
    websiteQualityScore === 0
      ? 10
      : websiteQualityScore < 55
        ? 6
        : websiteQualityScore > 82
          ? 2
          : 0;
  const scoreFromReviews = Math.round(reviewRecencyScore / 12) - 2;
  return clamp(baseScore + scoreFromPhone + scoreFromWebsite + scoreFromReviews, 0, 100);
}

async function enrichWithGooglePlaceDetails(lead: LeadRecord): Promise<EnrichLeadResult> {
  const details = await getGooglePlaceDetails(lead.place_id!);

  const resolvedPhone = details.phone ?? lead.phone;
  const resolvedWebsite = details.website ?? lead.website;
  const resolvedGoogleMapsUrl = details.googleMapsUrl ?? lead.google_maps_url;
  const resolvedAddress = details.address ?? lead.address;
  const resolvedRating = details.rating ?? lead.rating;
  const resolvedReviewCount = details.reviewCount ?? lead.review_count;

  const websiteHasSsl = resolvedWebsite?.startsWith("https://") ?? false;
  const phoneValid = Boolean(resolvedPhone);

  const finalScore = computeRealFinalScore({
    baseScore: lead.raw_score ?? 50,
    phone: resolvedPhone,
    website: resolvedWebsite,
    rating: resolvedRating,
    reviewCount: resolvedReviewCount,
  });

  return {
    enrichment: {
      lead_id: lead.id,
      workspace_id: lead.workspace_id,
      website_status: resolvedWebsite ? 200 : null,
      website_final_url: resolvedWebsite ?? null,
      website_has_ssl: resolvedWebsite ? websiteHasSsl : null,
      website_has_meta_viewport: null,
      website_copyright_year: null,
      website_quality_score: null,
      phone_valid: phoneValid,
      whatsapp_likely: phoneValid,
      review_recency_score: null,
      raw_data: {
        source: "google_place_details",
        place_id: details.placeId,
        business_status: details.businessStatus ?? null,
        enriched_at: new Date().toISOString(),
      },
    },
    finalScore,
    leadFields: {
      phone: details.phone,
      website: details.website,
      google_maps_url: resolvedGoogleMapsUrl,
      address: resolvedAddress,
      rating: resolvedRating,
      review_count: resolvedReviewCount,
    },
    enrichmentSource: "google_place_details",
  };
}

function enrichWithMock(lead: LeadRecord): EnrichLeadResult {
  const seed = getSeed(`${lead.id}-${lead.company_name}-${lead.city ?? "cidade"}`);
  const hasWebsite = Boolean(lead.website);
  const phoneValid = Boolean(lead.phone);
  const websiteQualityScore = hasWebsite
    ? pickDeterministicNumber(seed, 46, 91)
    : 0;
  const reviewRecencyScore = pickDeterministicNumber(seed + 7, 28, 94);
  const websiteHasMetaViewport = hasWebsite ? seed % 3 !== 0 : false;
  const websiteHasSsl = lead.website?.startsWith("https://") ?? false;
  const copyrightYear = MOCK_COPYRIGHT_YEARS[seed % MOCK_COPYRIGHT_YEARS.length];

  const finalScore = computeMockFinalScore({
    baseScore: lead.raw_score ?? 50,
    phoneValid,
    websiteQualityScore,
    reviewRecencyScore,
  });

  return {
    enrichment: {
      lead_id: lead.id,
      workspace_id: lead.workspace_id,
      website_status: hasWebsite ? 200 : null,
      website_final_url: lead.website ?? null,
      website_has_ssl: websiteHasSsl,
      website_has_meta_viewport: websiteHasMetaViewport,
      website_copyright_year: copyrightYear,
      website_quality_score: hasWebsite ? websiteQualityScore : pickDeterministicNumber(seed, 18, 42),
      phone_valid: phoneValid,
      whatsapp_likely: phoneValid,
      review_recency_score: reviewRecencyScore,
      raw_data: {
        source: "mock_enrichment",
        generated_at: new Date().toISOString(),
        seed,
      },
    },
    finalScore,
    leadFields: {
      phone: null,
      website: null,
      google_maps_url: null,
      address: null,
      rating: null,
      review_count: null,
    },
    enrichmentSource: "mock_enrichment",
  };
}

export async function enrichLeadWithAvailableSources(
  lead: LeadRecord,
): Promise<EnrichLeadResult> {
  if (lead.source === "google_places" && lead.place_id) {
    return enrichWithGooglePlaceDetails(lead);
  }
  return enrichWithMock(lead);
}
