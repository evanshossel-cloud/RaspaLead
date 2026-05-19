import { Workbook } from "exceljs";
import { NextResponse } from "next/server";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import type {
  LeadEnrichmentRecord,
  LeadRecord,
} from "@/features/leads/types";
import type { LeadSearchRecord } from "@/features/searches/types";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const leadStatusLabels: Record<LeadRecord["status"], string> = {
  new: "Novo",
  selected: "Selecionado",
  message_ready: "Mensagem pronta",
  message_sent: "Mensagem enviada",
  replied: "Respondeu",
  interested: "Interessado",
  meeting_scheduled: "Reuniao marcada",
  closed_won: "Ganho",
  closed_lost: "Perdido",
};

const enrichmentStatusLabels: Record<LeadRecord["enrichment_status"], string> = {
  not_enriched: "Nao enriquecido",
  queued: "Na fila",
  processing: "Processando",
  enriched: "Enriquecido",
  failed: "Falhou",
  skipped: "Ignorado",
};

const aiMessageStatusLabels: Record<LeadRecord["ai_message_status"], string> = {
  not_generated: "Nao gerada",
  queued: "Na fila",
  processing: "Gerando",
  generated: "Gerada",
  failed: "Falhou",
};

function formatNullable(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return value ? "Sim" : "Nao";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

type OptionalLeadExportsClient = {
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => Promise<{
      error: { message?: string } | null;
    }>;
  };
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "Workspace ativo nao encontrado" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const searchId = searchParams.get("search_id");

  let requestedSearch: LeadSearchRecord | null = null;

  if (searchId) {
    const { data: searchData, error: searchError } = await supabase
      .from("lead_searches")
      .select("*")
      .eq("workspace_id", workspace.id)
      .eq("id", searchId)
      .maybeSingle();

    requestedSearch = searchData as LeadSearchRecord | null;

    if (searchError || !requestedSearch) {
      return NextResponse.json({ error: "Busca nao encontrada" }, { status: 404 });
    }
  }

  let leadsQuery = supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (searchId) {
    leadsQuery = leadsQuery.eq("search_id", searchId);
  }

  const { data: leadsData, error: leadsError } = await leadsQuery;

  if (leadsError) {
    return NextResponse.json({ error: "Nao foi possivel carregar os leads" }, { status: 500 });
  }

  const leads = (leadsData ?? []) as LeadRecord[];
  const leadIds = leads.map((lead) => lead.id);
  const relatedSearchIds = Array.from(
    new Set(leads.map((lead) => lead.search_id).filter((value): value is string => Boolean(value))),
  );

  const [{ data: enrichmentsData }, { data: searchesData }] = await Promise.all([
    leadIds.length > 0
      ? supabase
          .from("lead_enrichments")
          .select("*")
          .eq("workspace_id", workspace.id)
          .in("lead_id", leadIds)
      : Promise.resolve({ data: [] as LeadEnrichmentRecord[] }),
    relatedSearchIds.length > 0
      ? supabase
          .from("lead_searches")
          .select("*")
          .eq("workspace_id", workspace.id)
          .in("id", relatedSearchIds)
      : Promise.resolve({ data: [] as LeadSearchRecord[] }),
  ]);

  const enrichments = (enrichmentsData ?? []) as LeadEnrichmentRecord[];
  const searches = (searchesData ?? []) as LeadSearchRecord[];
  const enrichmentByLeadId = new Map(enrichments.map((item) => [item.lead_id, item]));
  const searchById = new Map(searches.map((item) => [item.id, item]));

  const workbook = new Workbook();
  workbook.creator = "RaspaLead";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Leads", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Empresa", key: "company_name", width: 28 },
    { header: "Categoria", key: "category", width: 24 },
    { header: "Telefone", key: "phone", width: 18 },
    { header: "WhatsApp provavel", key: "whatsapp_likely", width: 18 },
    { header: "Site", key: "website", width: 34 },
    { header: "Google Maps", key: "google_maps_url", width: 34 },
    { header: "Endereco", key: "address", width: 34 },
    { header: "Cidade", key: "city", width: 18 },
    { header: "Estado", key: "state", width: 12 },
    { header: "Avaliacao", key: "rating", width: 12 },
    { header: "Reviews", key: "review_count", width: 12 },
    { header: "Status comercial", key: "status", width: 18 },
    { header: "Status enriquecimento", key: "enrichment_status", width: 20 },
    { header: "Status mensagem IA", key: "ai_message_status", width: 18 },
    { header: "Raw score", key: "raw_score", width: 12 },
    { header: "Final score", key: "final_score", width: 12 },
    { header: "Score qualidade site", key: "website_quality_score", width: 20 },
    { header: "Site online/status", key: "website_status", width: 18 },
    { header: "HTTPS", key: "website_has_ssl", width: 12 },
    { header: "Mobile/meta viewport", key: "website_has_meta_viewport", width: 20 },
    { header: "Ano copyright", key: "website_copyright_year", width: 16 },
    { header: "Tempo resposta (ms)", key: "website_response_time_ms", width: 20 },
    { header: "Mensagem inicial", key: "ai_first_message", width: 56 },
    { header: "Follow-up", key: "ai_followup_message", width: 56 },
    { header: "Origem", key: "source", width: 16 },
    { header: "Palavra-chave origem", key: "source_keyword", width: 24 },
    { header: "Busca", key: "search_name", width: 28 },
    { header: "Oferta usada", key: "user_offer", width: 36 },
    { header: "Perfil cliente ideal", key: "target_customer_profile", width: 36 },
    { header: "Fonte do enrichment", key: "enrichment_source", width: 22 },
    { header: "Criado em", key: "created_at", width: 20 },
    { header: "Enriquecido em", key: "enriched_at", width: 20 },
    { header: "Mensagem gerada em", key: "ai_message_generated_at", width: 20 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: "FFE0E2ED" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111827" },
  };

  leads.forEach((lead) => {
    const enrichment = enrichmentByLeadId.get(lead.id);
    const search = lead.search_id ? searchById.get(lead.search_id) : requestedSearch;

    sheet.addRow({
      company_name: lead.company_name,
      category: formatNullable(lead.category),
      phone: formatNullable(lead.phone),
      whatsapp_likely: formatBoolean(enrichment?.whatsapp_likely ?? null),
      website: formatNullable(lead.website),
      google_maps_url: formatNullable(lead.google_maps_url),
      address: formatNullable(lead.address),
      city: formatNullable(lead.city),
      state: formatNullable(lead.state),
      rating: formatNullable(lead.rating),
      review_count: formatNullable(lead.review_count),
      status: leadStatusLabels[lead.status],
      enrichment_status: enrichmentStatusLabels[lead.enrichment_status],
      ai_message_status: aiMessageStatusLabels[lead.ai_message_status],
      raw_score: lead.raw_score,
      final_score: lead.final_score,
      website_quality_score: formatNullable(enrichment?.website_quality_score),
      website_status: formatNullable(enrichment?.website_status),
      website_has_ssl: formatBoolean(enrichment?.website_has_ssl ?? null),
      website_has_meta_viewport: formatBoolean(
        enrichment?.website_has_meta_viewport ?? null,
      ),
      website_copyright_year: formatNullable(enrichment?.website_copyright_year),
      website_response_time_ms: formatNullable(enrichment?.website_response_time_ms),
      ai_first_message: formatNullable(lead.ai_first_message),
      ai_followup_message: formatNullable(lead.ai_followup_message),
      source: formatNullable(lead.source),
      source_keyword: formatNullable(lead.source_keyword),
      search_name: formatNullable(search?.name),
      user_offer: formatNullable(search?.user_offer),
      target_customer_profile: formatNullable(search?.target_customer_profile),
      enrichment_source: formatNullable(
        (() => {
          const raw = enrichment?.raw_data;
          if (typeof raw !== "object" || raw === null) return null;
          return (raw as Record<string, unknown>).source as string | null ?? null;
        })(),
      ),
      created_at: formatDate(lead.created_at),
      enriched_at: formatDate(lead.enriched_at),
      ai_message_generated_at: formatDate(lead.ai_message_generated_at),
    });
  });

  sheet.eachRow((row, rowNumber) => {
    row.alignment = { vertical: "top", wrapText: true };

    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: "thin", color: { argb: "FF1E293B" } },
        };
      });
    }
  });

  const filename = requestedSearch
    ? `raspalead-${slugify(requestedSearch.name || "busca")}-leads.xlsx`
    : "raspalead-leads.xlsx";

  const optionalLeadExportsClient = supabase as unknown as OptionalLeadExportsClient;

  try {
    await optionalLeadExportsClient.from("lead_exports").insert({
      workspace_id: workspace.id,
      user_id: user.id,
      search_id: requestedSearch?.id ?? null,
      format: "xlsx",
      total_leads: leads.length,
      file_url: null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Registro opcional: ignorar quando a tabela nao existir ou exigir colunas adicionais.
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
