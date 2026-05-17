import { googlePlacesProvider } from "./google-places-provider";
import { mockLeadProvider } from "./mock-provider";
import type { LeadProvider } from "./types";

export type ProviderName = "mock" | "google_places";

export type { LeadProvider, LeadProviderInput, RawLeadResult } from "./types";
export { mapRawLeadToInsert } from "./map-raw-lead-to-insert";

export function getLeadProvider(provider: ProviderName): LeadProvider {
  if (provider === "mock") return mockLeadProvider;
  if (provider === "google_places") return googlePlacesProvider;

  const _exhaustive: never = provider;
  throw new Error(`Provider desconhecido: ${_exhaustive}`);
}
