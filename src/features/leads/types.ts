import type { Database } from "@/types/database";

export type LeadRecord = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadStatus = LeadRecord["status"];
export type LeadAiMessageStatus = LeadRecord["ai_message_status"];
export type LeadEnrichmentRecord = Database["public"]["Tables"]["lead_enrichments"]["Row"];
export type LeadEnrichmentInsert = Database["public"]["Tables"]["lead_enrichments"]["Insert"];
