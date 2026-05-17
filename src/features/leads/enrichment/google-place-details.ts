const PLACES_API_BASE = "https://places.googleapis.com/v1/places";

const FIELD_MASK = [
  "id",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "formattedAddress",
  "businessStatus",
  "rating",
  "userRatingCount",
  "primaryType",
  "primaryTypeDisplayName",
].join(",");

export interface GooglePlaceDetailsResult {
  placeId: string;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  address: string | null;
  businessStatus: string | null;
  rating: number | null;
  reviewCount: number | null;
  primaryType: string | null;
  primaryTypeDisplayName: string | null;
}

interface PlaceDetailsResponse {
  id?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  formattedAddress?: string;
  businessStatus?: string;
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
}

export async function getGooglePlaceDetails(
  placeId: string,
): Promise<GooglePlaceDetailsResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY não configurada. Necessária para enriquecimento via Google Places.",
    );
  }

  const response = await fetch(
    `${PLACES_API_BASE}/${encodeURIComponent(placeId)}`,
    {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(
      `Google Place Details retornou ${response.status}: ${errorText.slice(0, 200)}`,
    );
  }

  const data = (await response.json()) as PlaceDetailsResponse;

  return {
    placeId: data.id ?? placeId,
    phone: data.nationalPhoneNumber ?? data.internationalPhoneNumber ?? null,
    website: data.websiteUri ?? null,
    googleMapsUrl: data.googleMapsUri ?? null,
    address: data.formattedAddress ?? null,
    businessStatus: data.businessStatus ?? null,
    rating: data.rating ?? null,
    reviewCount: data.userRatingCount ?? null,
    primaryType: data.primaryType ?? null,
    primaryTypeDisplayName: data.primaryTypeDisplayName?.text ?? null,
  };
}
