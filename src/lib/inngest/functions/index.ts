import {
  getLeadProvider,
  mapRawLeadToInsert,
} from "@/features/leads/providers";
import type { LeadProviderInput, ProviderName } from "@/features/leads/providers";
import { dedupeRawLeads } from "@/features/leads/services/dedupe-leads";
import { filterExistingLeads } from "@/features/leads/services/filter-existing-leads";
import { enrichLeadWithAvailableSources } from "@/features/leads/enrichment/enrich-lead";
import type {
  LeadEnrichmentRecord,
  LeadRecord,
} from "@/features/leads/types";
import type { LeadSearchRecord } from "@/features/searches/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { inngest } from "../client";

function buildMockAiMessages({
  lead,
  search,
  enrichment,
}: {
  lead: LeadRecord;
  search: LeadSearchRecord | null;
  enrichment: LeadEnrichmentRecord | null;
}) {
  const empresa = lead.company_name;
  const categoria = lead.category ?? "negocio local";
  const local = [lead.city, lead.state].filter(Boolean).join("/") || "sua regiao";
  const oferta = search?.user_offer ?? "solucoes para gerar mais oportunidades comerciais";
  const perfil = search?.target_customer_profile ?? "empresas que podem vender mais sem complicar a rotina";
  const score = lead.final_score || lead.raw_score;

  let dorContextual = "a conversao de interesse em oportunidades comerciais";

  if (enrichment) {
    if (enrichment.website_quality_score !== null && enrichment.website_quality_score < 55) {
      dorContextual = "a experiencia digital do site e a captura de novos contatos";
    } else if (enrichment.review_recency_score !== null && enrichment.review_recency_score < 45) {
      dorContextual = "a consistencia da presenca digital e a geracao de confianca";
    } else if (enrichment.phone_valid === true) {
      dorContextual = "a transformacao do atendimento atual em mais oportunidades qualificadas";
    }
  }

  if (score >= 80) {
    dorContextual = `${dorContextual} com uma abordagem mais direta e previsivel`;
  }

  const firstMessage = `Ola, tudo bem? Vi que a ${empresa} atua em ${local} no segmento de ${categoria}. Trabalho com ${oferta} e percebi que pode existir uma oportunidade de melhorar ${dorContextual}. Faz sentido eu te mostrar uma ideia rapida pensada para ${perfil}?`;

  const followupMessage = `Passando so para reforcar: a ideia e ajudar empresas como a ${empresa} a transformar mais atendimentos em oportunidades, sem complicar a rotina. Se fizer sentido, posso te enviar um exemplo pratico alinhado ao momento de ${categoria} em ${local}.`;

  return { firstMessage, followupMessage };
}

function resolveProviderName(): ProviderName {
  const raw = process.env.LEAD_PROVIDER ?? "mock";
  if (raw === "google_places") return "google_places";
  return "mock";
}

export const leadSearchCreated = inngest.createFunction(
  { id: "lead-search-created" },
  { event: "lead-search.created" },
  async ({ event, step }) => {
    const supabase = createAdminClient();
    const { search_id, workspace_id, user_id } = event.data;
    const providerName = resolveProviderName();

    const markFailed = async (message: string) => {
      await supabase
        .from("lead_searches")
        .update({
          status: "failed",
          error_message: message,
          finished_at: new Date().toISOString(),
          provider: providerName,
          processing_metadata: { provider: providerName, error: message } as never,
        } as never)
        .eq("id", search_id)
        .eq("workspace_id", workspace_id);
    };

    try {
      const search = await step.run("load-search", async () => {
        const { data, error } = await supabase
          .from("lead_searches")
          .select("*")
          .eq("id", search_id)
          .eq("workspace_id", workspace_id)
          .eq("user_id", user_id)
          .maybeSingle();

        if (error) throw new Error(error.message);
        return data as LeadSearchRecord | null;
      });

      if (!search) return { skipped: true, reason: "search_not_found" };
      if (search.status === "completed") return { skipped: true, reason: "already_completed" };

      await step.run("mark-processing", async () => {
        const { error } = await supabase
          .from("lead_searches")
          .update({
            status: "processing",
            started_at: new Date().toISOString(),
            progress: 10,
            error_message: null,
          } as never)
          .eq("id", search_id)
          .eq("workspace_id", workspace_id);

        if (error) throw new Error(error.message);
      });

      const fetchStats = await step.run("fetch-and-insert-leads", async () => {
        const input: LeadProviderInput = {
          searchId: search.id,
          workspaceId: search.workspace_id,
          userId: user_id,
          city: search.city ?? "Cidade",
          state: search.state ?? "UF",
          neighborhood: search.neighborhood,
          niche: search.niche ?? search.name,
          keyword: search.keyword,
          quantity: search.quantity_requested,
          userOffer: search.user_offer,
          targetCustomerProfile: search.target_customer_profile,
        };

        const provider = getLeadProvider(providerName);
        console.log(`[lead-search] provider: ${providerName}`);
        const rawLeads = await provider.search(input);
        console.log(`[lead-search] provider retornou ${rawLeads.length} leads`);

        const dedupedLeads = dedupeRawLeads(rawLeads);
        console.log(`[lead-search] apos dedupe local: ${dedupedLeads.length} leads`);

        const newLeads = await filterExistingLeads({
          supabase,
          workspaceId: workspace_id,
          searchId: search_id,
          rawLeads: dedupedLeads,
        });
        console.log(`[lead-search] apos filtro banco: ${newLeads.length} leads`);

        const { error: deleteError } = await supabase
          .from("leads")
          .delete()
          .eq("workspace_id", workspace_id)
          .eq("search_id", search_id);

        if (deleteError) throw new Error(deleteError.message);

        const queryUsed = rawLeads[0]?.sourceKeyword ?? null;

        if (newLeads.length === 0) {
          console.log(`[lead-search] nenhum lead novo para inserir`);
          return {
            providerReturned: rawLeads.length,
            afterLocalDedupe: dedupedLeads.length,
            afterExistingFilter: 0,
            inserted: 0,
            queryUsed,
          };
        }

        const inserts = newLeads.map((raw) =>
          mapRawLeadToInsert(raw, workspace_id, search_id),
        );

        const { error: insertError } = await supabase
          .from("leads")
          .insert(inserts as never);

        if (insertError) throw new Error(insertError.message);

        console.log(`[lead-search] inseridos ${newLeads.length} leads`);
        return {
          providerReturned: rawLeads.length,
          afterLocalDedupe: dedupedLeads.length,
          afterExistingFilter: newLeads.length,
          inserted: newLeads.length,
          queryUsed,
        };
      });

      await step.run("mark-completed", async () => {
        const processingMetadata = {
          provider: providerName,
          providerReturned: fetchStats.providerReturned,
          afterLocalDedupe: fetchStats.afterLocalDedupe,
          afterExistingFilter: fetchStats.afterExistingFilter,
          inserted: fetchStats.inserted,
          ...(providerName === "google_places" ? { maxResultsLimit: 20 } : {}),
          queryUsed: fetchStats.queryUsed ?? null,
          error: null,
        };

        const { error } = await supabase
          .from("lead_searches")
          .update({
            quantity_found: fetchStats.inserted,
            progress: 100,
            status: "completed",
            finished_at: new Date().toISOString(),
            error_message: null,
            provider: providerName,
            processing_metadata: processingMetadata as never,
          } as never)
          .eq("id", search_id)
          .eq("workspace_id", workspace_id);

        if (error) throw new Error(error.message);
      });

      return { searchId: search_id, leadsCreated: fetchStats.inserted };
    } catch (error) {
      await markFailed(
        error instanceof Error ? error.message : "Falha ao processar a busca.",
      );
      throw error;
    }
  },
);

export const leadEnrichmentRequested = inngest.createFunction(
  { id: "lead-enrichment-requested" },
  { event: "lead.enrichment.requested" },
  async ({ event, step }) => {
    const supabase = createAdminClient();
    const { lead_id, workspace_id } = event.data;

    const markLeadFailed = async (message: string) => {
      await supabase
        .from("leads")
        .update({
          enrichment_status: "failed",
          enrichment_error: message,
        })
        .eq("id", lead_id)
        .eq("workspace_id", workspace_id);
    };

    try {
      const lead = await step.run("load-lead", async () => {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("id", lead_id)
          .eq("workspace_id", workspace_id)
          .maybeSingle();

        if (error) throw new Error(error.message);
        return data as LeadRecord | null;
      });

      if (!lead) return { skipped: true, reason: "lead_not_found" };

      await step.run("mark-enrichment-processing", async () => {
        const { error } = await supabase
          .from("leads")
          .update({ enrichment_status: "processing", enrichment_error: null })
          .eq("id", lead_id)
          .eq("workspace_id", workspace_id);

        if (error) throw new Error(error.message);
      });

      const enrichResult = await step.run("enrich-lead", async () => {
        const result = await enrichLeadWithAvailableSources(lead);
        console.log(
          `[lead-enrichment] lead_id=${lead_id} source=${result.enrichmentSource} phone=${Boolean(result.leadFields.phone)} website=${Boolean(result.leadFields.website)} website_analysis=${(result.enrichment.raw_data as Record<string,unknown>|null)?.website_analysis_used ?? false} http=${result.enrichment.website_status ?? "n/a"} quality=${result.enrichment.website_quality_score ?? "n/a"} final_score=${result.finalScore}`,
        );
        return result;
      });

      await step.run("upsert-lead-enrichment", async () => {
        const { error } = await supabase
          .from("lead_enrichments")
          .upsert(enrichResult.enrichment as never, { onConflict: "lead_id" });

        if (error) throw new Error(error.message);
      });

      await step.run("update-lead-data", async () => {
        const { phone, website, google_maps_url, address, rating, review_count } =
          enrichResult.leadFields;

        const fieldsToUpdate: Record<string, unknown> = {
          final_score: enrichResult.finalScore,
          enrichment_status: "enriched",
          enriched_at: new Date().toISOString(),
          enrichment_error: null,
        };

        if (phone !== null) fieldsToUpdate.phone = phone;
        if (website !== null) fieldsToUpdate.website = website;
        if (google_maps_url !== null) fieldsToUpdate.google_maps_url = google_maps_url;
        if (address !== null) fieldsToUpdate.address = address;
        if (rating !== null) fieldsToUpdate.rating = rating;
        if (review_count !== null) fieldsToUpdate.review_count = review_count;

        const { error } = await supabase
          .from("leads")
          .update(fieldsToUpdate as never)
          .eq("id", lead_id)
          .eq("workspace_id", workspace_id);

        if (error) throw new Error(error.message);
      });

      return {
        leadId: lead_id,
        finalScore: enrichResult.finalScore,
        source: enrichResult.enrichmentSource,
      };
    } catch (error) {
      await markLeadFailed(
        error instanceof Error ? error.message : "Falha ao enriquecer o lead.",
      );
      throw error;
    }
  },
);

export const leadAiMessageRequested = inngest.createFunction(
  { id: "lead-ai-message-requested" },
  { event: "lead.ai-message.requested" },
  async ({ event, step }) => {
    const supabase = createAdminClient();
    const { lead_id, workspace_id } = event.data;

    const markLeadFailed = async (message: string) => {
      await supabase
        .from("leads")
        .update({ ai_message_status: "failed", ai_message_error: message } as never)
        .eq("id", lead_id)
        .eq("workspace_id", workspace_id);
    };

    try {
      const lead = await step.run("load-message-lead", async () => {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("id", lead_id)
          .eq("workspace_id", workspace_id)
          .maybeSingle();

        if (error) throw new Error(error.message);
        return data as LeadRecord | null;
      });

      if (!lead) return { skipped: true, reason: "lead_not_found" };

      const search = await step.run("load-related-search", async () => {
        if (!lead.search_id) return null;

        const { data, error } = await supabase
          .from("lead_searches")
          .select("*")
          .eq("id", lead.search_id)
          .eq("workspace_id", workspace_id)
          .maybeSingle();

        if (error) throw new Error(error.message);
        return data as LeadSearchRecord | null;
      });

      const enrichment = await step.run("load-related-enrichment", async () => {
        const { data, error } = await supabase
          .from("lead_enrichments")
          .select("*")
          .eq("lead_id", lead.id)
          .eq("workspace_id", workspace_id)
          .maybeSingle();

        if (error) throw new Error(error.message);
        return data as LeadEnrichmentRecord | null;
      });

      await step.run("mark-message-processing", async () => {
        const { error } = await supabase
          .from("leads")
          .update({ ai_message_status: "processing", ai_message_error: null } as never)
          .eq("id", lead_id)
          .eq("workspace_id", workspace_id);

        if (error) throw new Error(error.message);
      });

      await step.run("simulate-message-processing", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1400));
      });

      const { firstMessage, followupMessage } = await step.run(
        "build-mock-messages",
        async () => buildMockAiMessages({ lead, search, enrichment }),
      );

      await step.run("mark-message-generated", async () => {
        const { error } = await supabase
          .from("leads")
          .update({
            ai_first_message: firstMessage,
            ai_followup_message: followupMessage,
            ai_message_status: "generated",
            ai_message_generated_at: new Date().toISOString(),
            ai_message_error: null,
          } as never)
          .eq("id", lead_id)
          .eq("workspace_id", workspace_id);

        if (error) throw new Error(error.message);
      });

      return { leadId: lead_id, generated: true };
    } catch (error) {
      await markLeadFailed(
        error instanceof Error
          ? error.message
          : "Falha ao gerar a mensagem sugerida do lead.",
      );
      throw error;
    }
  },
);

export const functions = [
  leadSearchCreated,
  leadEnrichmentRequested,
  leadAiMessageRequested,
];
