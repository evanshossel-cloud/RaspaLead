export interface LeadProviderInput {
  searchId: string;
  workspaceId: string;
  userId: string;
  city: string;
  state: string;
  neighborhood?: string | null;
  niche: string;
  keyword?: string | null;
  quantity: number;
  userOffer?: string | null;
  targetCustomerProfile?: string | null;
}

export interface RawLeadResult {
  externalId?: string | null;
  companyName: string;
  category?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  googleMapsUrl?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  source: "mock" | "google_places";
  sourceKeyword?: string | null;
  rawScore?: number | null;
  finalScore?: number | null;
}

export interface LeadProvider {
  search(input: LeadProviderInput): Promise<RawLeadResult[]>;
}
