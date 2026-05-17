import type { Database } from "./database";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadSearch = Database["public"]["Tables"]["lead_searches"]["Row"];
export type LeadEnrichment = Database["public"]["Tables"]["lead_enrichments"]["Row"];

export type LeadStatus = Lead["status"];
export type EnrichmentStatus = Lead["enrichment_status"];
export type SearchStatus = LeadSearch["status"];
