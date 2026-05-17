function removeAccents(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

export function normalizeWebsite(url?: string | null): string | null {
  if (!url) return null;
  const cleaned = url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .toLowerCase()
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function normalizeCompanyName(name: string): string {
  return removeAccents(name)
    .toLowerCase()
    .replace(/[.,\-_'"!?@#$%&*()[\]{}|\\/<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAddress(address?: string | null): string | null {
  if (!address) return null;
  const cleaned = removeAccents(address)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function createLeadDedupeKey(input: {
  phone?: string | null;
  website?: string | null;
  externalId?: string | null;
  companyName: string;
  city?: string | null;
  state?: string | null;
  address?: string | null;
}): string {
  const phone = normalizePhone(input.phone);
  if (phone) return `phone:${phone}`;

  const website = normalizeWebsite(input.website);
  if (website) return `website:${website}`;

  if (input.externalId) return `ext:${input.externalId}`;

  const name = normalizeCompanyName(input.companyName);
  const city = removeAccents(input.city ?? "").toLowerCase().trim();
  const state = (input.state ?? "").toLowerCase().trim();
  if (city || state) return `name:${name}|${city}|${state}`;

  const address = normalizeAddress(input.address);
  return `name:${name}|addr:${address ?? ""}`;
}
