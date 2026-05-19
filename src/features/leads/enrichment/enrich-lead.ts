import type { LeadEnrichmentInsert, LeadRecord } from "@/features/leads/types";
import { getGooglePlaceDetails } from "./google-place-details";
import { analyzeWebsite } from "./website-enrichment";
import type { WebsiteEnrichmentResult } from "./website-enrichment";

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

/**
 * Calcula o final_score para leads com dados reais (Google Place Details + Website Analysis).
 *
 * Regras:
 * - Parte do raw_score como base
 * - Bônus por telefone, rating, reviewCount
 * - Bônus moderado por website de qualidade
 * - Site ruim NÃO penaliza o score — pode ser sinal de oportunidade comercial
 */
function computeRealFinalScore(params: {
  baseScore: number;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  websiteQualityScore?: number | null;
  websiteStatus?: number | null;
  websiteHasSsl?: boolean | null;
  websiteHasMetaViewport?: boolean | null;
}): number {
  const {
    baseScore,
    phone,
    website,
    rating,
    reviewCount,
    websiteQualityScore,
    websiteStatus,
    websiteHasSsl,
    websiteHasMetaViewport,
  } = params;

  let score = baseScore;

  // Telefone válido: sinal forte de contato direto
  score += phone ? 8 : -3;

  // Website: presença digital
  if (website) {
    score += 3;

    // SSL: site moderno e seguro
    if (websiteHasSsl === true) score += 2;

    // Qualidade técnica: bônus moderado para site bom
    // Site ruim não penaliza — pode indicar oportunidade para quem vende marketing/site/tráfego
    if (websiteQualityScore !== null && websiteQualityScore !== undefined) {
      if (websiteQualityScore >= 75) score += 3;
      else if (websiteQualityScore >= 55) score += 1;
      // Nota: qualityScore < 55 não penaliza — é sinal de oportunidade
    }

    // Site online (HTTP 2xx): confirmação de presença ativa
    if (websiteStatus !== null && websiteStatus !== undefined) {
      if (websiteStatus >= 200 && websiteStatus < 300) score += 2;
      // Nota: 4xx/5xx não penalizam — site fora pode ser motivo de abordagem
    }

    // Mobile-friendly: site preparado para mobile
    if (websiteHasMetaViewport === true) score += 2;
  }

  // Rating alto: prova social
  if (rating !== null && rating >= 4.2) score += 5;

  // Número de reviews: volume de clientes ativos
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
  // 1. Obter dados reais do Google Place Details
  const details = await getGooglePlaceDetails(lead.place_id!);

  const resolvedPhone = details.phone ?? lead.phone;
  const resolvedWebsite = details.website ?? lead.website;
  const resolvedGoogleMapsUrl = details.googleMapsUrl ?? lead.google_maps_url;
  const resolvedAddress = details.address ?? lead.address;
  const resolvedRating = details.rating ?? lead.rating;
  const resolvedReviewCount = details.reviewCount ?? lead.review_count;
  const phoneValid = Boolean(resolvedPhone);

  // 2. Analisar website se disponível
  let websiteAnalysis: WebsiteEnrichmentResult | null = null;
  const websiteAnalysisUsed = Boolean(resolvedWebsite);

  if (resolvedWebsite) {
    try {
      websiteAnalysis = await analyzeWebsite(resolvedWebsite);
    } catch {
      // Nunca deixa falha do website quebrar o enrichment
      websiteAnalysis = null;
    }
  }

  console.log(
    `[website-enrichment] lead_id=${lead.id} website_analysis_used=${websiteAnalysisUsed} status=${websiteAnalysis?.websiteStatus ?? "n/a"} quality=${websiteAnalysis?.websiteQualityScore ?? "n/a"} ok=${!websiteAnalysis?.error}`,
  );

  // 3. Calcular final_score com todos os sinais disponíveis
  const finalScore = computeRealFinalScore({
    baseScore: lead.raw_score ?? 50,
    phone: resolvedPhone,
    website: resolvedWebsite,
    rating: resolvedRating,
    reviewCount: resolvedReviewCount,
    websiteQualityScore: websiteAnalysis?.websiteQualityScore ?? null,
    websiteStatus: websiteAnalysis?.websiteStatus ?? null,
    websiteHasSsl: websiteAnalysis?.websiteHasSsl ?? null,
    websiteHasMetaViewport: websiteAnalysis?.websiteHasMetaViewport ?? null,
  });

  // 4. Montar raw_data com metadados de enrichment
  const rawDataExtra: Record<string, unknown> = {
    source: "google_place_details",
    place_id: details.placeId,
    business_status: details.businessStatus ?? null,
    enriched_at: new Date().toISOString(),
    place_details_used: true,
    website_analysis_used: websiteAnalysisUsed,
  };

  if (websiteAnalysis?.error) {
    rawDataExtra.website_error = websiteAnalysis.error;
  }
  if (websiteAnalysis?.websiteResponseTimeMs !== null && websiteAnalysis?.websiteResponseTimeMs !== undefined) {
    rawDataExtra.response_time_ms = websiteAnalysis.websiteResponseTimeMs;
  }
  if (websiteAnalysis?.websiteFinalUrl) {
    rawDataExtra.website_final_url = websiteAnalysis.websiteFinalUrl;
  }
  if (websiteAnalysis?.websiteQualityScore !== null && websiteAnalysis?.websiteQualityScore !== undefined) {
    rawDataExtra.website_quality_score = websiteAnalysis.websiteQualityScore;
  }

  // 5. Determinar valores finais dos campos de website para o enrichment
  const websiteStatus = websiteAnalysis?.websiteStatus ?? (resolvedWebsite ? null : null);
  const websiteFinalUrl = websiteAnalysis?.websiteFinalUrl ?? resolvedWebsite ?? null;
  const websiteHasSsl =
    websiteAnalysis?.websiteHasSsl ??
    (resolvedWebsite ? resolvedWebsite.startsWith("https://") : null);

  return {
    enrichment: {
      lead_id: lead.id,
      workspace_id: lead.workspace_id,
      website_status: websiteStatus,
      website_final_url: websiteFinalUrl,
      website_has_ssl: websiteHasSsl,
      website_has_meta_viewport: websiteAnalysis?.websiteHasMetaViewport ?? null,
      website_copyright_year: websiteAnalysis?.websiteCopyrightYear ?? null,
      website_quality_score: websiteAnalysis?.websiteQualityScore ?? null,
      website_response_time_ms: websiteAnalysis?.websiteResponseTimeMs ?? null,
      phone_valid: phoneValid,
      whatsapp_likely: phoneValid,
      review_recency_score: null,
      raw_data: rawDataExtra,
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
      website_response_time_ms: hasWebsite ? pickDeterministicNumber(seed + 3, 480, 4200) : null,
      phone_valid: phoneValid,
      whatsapp_likely: phoneValid,
      review_recency_score: reviewRecencyScore,
      raw_data: {
        source: "mock_enrichment",
        generated_at: new Date().toISOString(),
        seed,
        place_details_used: false,
        website_analysis_used: false,
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
