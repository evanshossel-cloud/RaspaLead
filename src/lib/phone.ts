export function normalizeBrazilianPhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return null;

  if (digits.startsWith("55")) {
    return digits.length === 12 || digits.length === 13 ? digits : null;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return null;
}
