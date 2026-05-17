import type { Database } from "@/types/database";
import type { CreateLeadSearchInput } from "./schemas/create-lead-search-schema";

export interface SearchProcessingMetadata {
  provider: string;
  providerReturned: number;
  afterLocalDedupe: number;
  afterExistingFilter: number;
  inserted: number;
  maxResultsLimit?: number;
  queryUsed?: string | null;
  error?: string | null;
}

export type LeadSearchRecord = Database["public"]["Tables"]["lead_searches"]["Row"];
export type LeadSearchInsert = Database["public"]["Tables"]["lead_searches"]["Insert"];
export type LeadSearchStatus = LeadSearchRecord["status"];

export type CreateLeadSearchFieldErrors = Partial<
  Record<keyof CreateLeadSearchInput, string[]>
>;

export interface CreateLeadSearchActionState {
  error?: string;
  fieldErrors?: CreateLeadSearchFieldErrors;
}
