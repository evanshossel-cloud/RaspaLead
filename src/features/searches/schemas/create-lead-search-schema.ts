import { z } from "zod";

export const createLeadSearchSchema = z.object({
  name: z.string().trim().min(3, "Informe um nome com pelo menos 3 caracteres"),
  state: z.string().trim().min(1, "Informe o estado"),
  city: z.string().trim().min(1, "Informe a cidade"),
  neighborhood: z.string().trim().optional(),
  niche: z.string().trim().min(1, "Informe o nicho"),
  keyword: z.string().trim().optional(),
  quantity_requested: z.coerce
    .number({ invalid_type_error: "Informe a quantidade de leads" })
    .min(10, "A busca deve pedir pelo menos 10 leads")
    .max(300, "A busca pode pedir no maximo 300 leads"),
  user_offer: z.string().trim().optional(),
  target_customer_profile: z.string().trim().optional(),
});

export type CreateLeadSearchInput = z.infer<typeof createLeadSearchSchema>;
