import type { LeadProvider, LeadProviderInput, RawLeadResult } from "./types";

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";
const MAX_RESULTS_PER_REQUEST = 20;
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
].join(",");

interface PlacesApiDisplayName {
  text: string;
  languageCode?: string;
}

interface PlacesApiPlace {
  id?: string;
  displayName?: PlacesApiDisplayName;
  formattedAddress?: string;
  primaryType?: string;
  primaryTypeDisplayName?: PlacesApiDisplayName;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

interface PlacesApiResponse {
  places?: PlacesApiPlace[];
}

function buildQuery(input: LeadProviderInput): string {
  const terms: string[] = [input.niche];
  if (input.keyword) terms.push(input.keyword);

  const locationParts: string[] = [];
  if (input.neighborhood) locationParts.push(input.neighborhood);
  locationParts.push(input.city);
  locationParts.push(input.state);

  terms.push("em", locationParts.join(" "));
  return terms.join(" ");
}

export const googlePlacesProvider: LeadProvider = {
  async search(input: LeadProviderInput): Promise<RawLeadResult[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_PLACES_API_KEY não configurada. Adicione ao .env.local para usar o provider google_places.",
      );
    }

    const query = buildQuery(input);
    const maxResults = Math.min(input.quantity, MAX_RESULTS_PER_REQUEST);

    const response = await fetch(PLACES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: maxResults,
        languageCode: "pt-BR",
        regionCode: "BR",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Google Places API retornou ${response.status}: ${errorText.slice(0, 200)}`,
      );
    }

    const data = (await response.json()) as PlacesApiResponse;
    const places = data.places ?? [];

    return places.map((place): RawLeadResult => ({
      externalId: place.id ?? null,
      companyName: place.displayName?.text ?? "Empresa sem nome",
      category:
        place.primaryTypeDisplayName?.text ?? place.primaryType ?? null,
      address: place.formattedAddress ?? null,
      city: input.city,
      state: input.state,
      rating: place.rating ?? null,
      reviewCount: place.userRatingCount ?? null,
      googleMapsUrl: place.googleMapsUri ?? null,
      website: null,
      phone: null,
      source: "google_places",
      sourceKeyword: query,
    }));
  },
};
