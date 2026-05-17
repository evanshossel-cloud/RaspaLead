import type { LeadProvider, LeadProviderInput, RawLeadResult } from "./types";

const MOCK_MAX_COUNT = 5;
const MOCK_SUFFIXES = ["Prime", "Atlas", "Pulse", "Norte", "Viva"];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function searchPhonePrefix(searchId: string): string {
  const hex = searchId.replace(/-/g, "").slice(0, 4);
  const num = parseInt(hex, 16) % 9000;
  return String(num).padStart(4, "0");
}

export const mockLeadProvider: LeadProvider = {
  async search(input: LeadProviderInput): Promise<RawLeadResult[]> {
    const count = Math.min(input.quantity, MOCK_MAX_COUNT);
    const niche = titleCase(input.niche.trim() || "Negocio local");
    const city = input.city.trim() || "Cidade";
    const state = input.state.trim() || "UF";
    const neighborhood = input.neighborhood?.trim() || "Centro";
    const sourceKeyword = input.keyword?.trim() || input.niche.trim() || null;
    const businessSlug = slugify(`${input.niche || input.keyword || input.searchId}-${city}`);
    const phonePrefix = searchPhonePrefix(input.searchId);

    return Array.from({ length: count }, (_, index) => {
      const position = index + 1;
      const suffix = MOCK_SUFFIXES[index] ?? `Lead ${position}`;
      const companyName = `${niche} ${suffix} ${city}`;

      return {
        externalId: `mock-${input.searchId}-${position}`,
        companyName,
        category: input.niche,
        phone: `(11) 9${phonePrefix}-${String(position).padStart(4, "0")}`,
        website: `https://${businessSlug}-${position}.exemplo.com.br`,
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(`${companyName}, ${city}`)}`,
        address: `Rua ${suffix}, ${120 + position} - ${neighborhood}`,
        neighborhood,
        city,
        state,
        rating: Number((3.8 + index * 0.2).toFixed(1)),
        reviewCount: 12 + index * 9,
        source: "mock" as const,
        sourceKeyword,
      };
    });
  },
};
