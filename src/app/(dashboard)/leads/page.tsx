import Link from "next/link";
import { Eye, Phone, Plus, Sparkles, Target, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportLeadsButton } from "@/features/leads/components/export-leads-button";
import type { LeadRecord, LeadStatus } from "@/features/leads/types";
import type { LeadSearchRecord } from "@/features/searches/types";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<LeadStatus, string> = {
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

const statusVariants: Record<
  LeadStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  new: "secondary",
  selected: "default",
  message_ready: "outline",
  message_sent: "outline",
  replied: "default",
  interested: "default",
  meeting_scheduled: "default",
  closed_won: "default",
  closed_lost: "destructive",
};

const enrichmentLabels: Record<LeadRecord["enrichment_status"], string> = {
  not_enriched: "Nao enriquecido",
  queued: "Na fila",
  processing: "Processando",
  enriched: "Enriquecido",
  failed: "Falhou",
  skipped: "Ignorado",
};

const enrichmentVariants: Record<
  LeadRecord["enrichment_status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  not_enriched: "outline",
  queued: "secondary",
  processing: "secondary",
  enriched: "default",
  failed: "destructive",
  skipped: "outline",
};

const aiMessageLabels: Record<LeadRecord["ai_message_status"], string> = {
  not_generated: "Nao gerada",
  queued: "Na fila",
  processing: "Gerando",
  generated: "Gerada",
  failed: "Falhou",
};

const aiMessageVariants: Record<
  LeadRecord["ai_message_status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  not_generated: "outline",
  queued: "secondary",
  processing: "secondary",
  generated: "default",
  failed: "destructive",
};

interface LeadsPageProps {
  searchParams: Promise<{ search_id?: string }>;
}

function formatCityState(lead: LeadRecord) {
  return [lead.city, lead.state].filter(Boolean).join("/") || "-";
}

function formatRating(value: number | null) {
  return value === null ? "-" : value.toFixed(1);
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const { search_id: searchId } = await searchParams;
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  let leadsQuery = supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspace?.id ?? "")
    .order("created_at", { ascending: false });

  if (searchId) {
    leadsQuery = leadsQuery.eq("search_id", searchId);
  }

  const [{ data: leadsData }, { data: searchData }] = await Promise.all([
    workspace ? leadsQuery : Promise.resolve({ data: [] as LeadRecord[] | null }),
    workspace && searchId
      ? supabase
          .from("lead_searches")
          .select("*")
          .eq("workspace_id", workspace.id)
          .eq("id", searchId)
          .maybeSingle()
      : Promise.resolve({ data: null as LeadSearchRecord | null }),
  ]);

  const leads = (leadsData ?? []) as LeadRecord[];
  const filteredSearch = searchData as LeadSearchRecord | null;
  const leadsWithPhone = leads.filter((lead) => Boolean(lead.phone)).length;
  const hotLeads = leads.filter((lead) => lead.final_score >= 80).length;
  const averageScore =
    leads.length > 0
      ? leads.reduce((total, lead) => total + lead.final_score, 0) / leads.length
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RaspaLead // Leads"
        title="Leads"
        description={
          filteredSearch
            ? `Exibindo leads da busca ${filteredSearch.name}`
            : "Visualize e gerencie os leads do workspace atual"
        }
        action={
          <>
            <ExportLeadsButton
              searchId={searchId}
              label={searchId ? "Exportar busca" : "Exportar leads"}
            />
            <Button asChild className="border-2 border-border font-black uppercase shadow-[2px_2px_0_#0a0a0a]">
              <Link href="/searches/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova busca
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Leads visíveis", value: leads.length, icon: Users, accent: "bg-card" },
          { label: "Com telefone", value: leadsWithPhone, icon: Phone, accent: "bg-[#EAF2FF]" },
          { label: "Score 80+", value: hotLeads, icon: Target, accent: "bg-[#E9FBEF]" },
          {
            label: "Score médio",
            value: averageScore === null ? "-" : averageScore.toFixed(1),
            icon: Sparkles,
            accent: "bg-[#FFF3B0]",
          },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className={`flex items-center justify-between gap-4 border-2 border-border p-5 shadow-[3px_3px_0_#0a0a0a] ${accent}`}>
            <div>
              <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </p>
              <p className="font-display mt-3 text-4xl font-black tracking-tight text-foreground">
                {value}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center border border-border/40 bg-white text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum lead encontrado ainda"
          description={
            filteredSearch
              ? "Essa busca ainda nao gerou leads. Acompanhe o processamento ou crie uma nova operacao."
              : "Crie uma nova busca para encontrar empresas locais qualificadas e gerar seus primeiros leads."
          }
          action={
            <Button asChild className="border-2 border-border font-black uppercase shadow-[2px_2px_0_#0a0a0a]">
              <Link href="/searches/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar nova busca
              </Link>
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden border-2 border-border shadow-[4px_4px_0_#0a0a0a]">
          <CardHeader className="border-b-2 border-border pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="font-black uppercase tracking-tight">Lista operacional de leads</CardTitle>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {filteredSearch
                    ? `Leads vinculados a ${filteredSearch.name}.`
                    : "Todos os leads gerados no workspace atual."}
                </p>
              </div>
              {filteredSearch && <Badge variant="secondary">Filtro por busca ativo</Badge>}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3 p-4 md:hidden">
              {leads.map((lead) => (
                <div key={lead.id} className="border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{lead.company_name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatCityState(lead)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={statusVariants[lead.status]}>
                        {statusLabels[lead.status]}
                      </Badge>
                      <Badge variant={enrichmentVariants[lead.enrichment_status]}>
                        {enrichmentLabels[lead.enrichment_status]}
                      </Badge>
                      <Badge variant={aiMessageVariants[lead.ai_message_status]}>
                        {aiMessageLabels[lead.ai_message_status]}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="border border-border bg-muted/40 p-3">
                      <p className="font-data text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Categoria</p>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">{lead.category ?? "-"}</p>
                    </div>
                    <div className="border border-border bg-[#EAF2FF] p-3">
                      <p className="font-data text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Score</p>
                      <p className="mt-1.5 text-sm font-black text-primary">{lead.final_score}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>Telefone: {lead.phone ?? "-"}</p>
                    <p>Avaliação: {formatRating(lead.rating)}</p>
                    <p>Origem: {lead.source ?? "-"}</p>
                  </div>

                  <Button asChild size="sm" variant="outline" className="mt-3 w-full border-2 border-border">
                    <Link href={`/leads/${lead.id}`}>
                      <Eye className="h-4 w-4" />
                      Ver detalhes
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="data-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Categoria</th>
                    <th>Telefone</th>
                    <th>Cidade/UF</th>
                    <th>Avaliacao</th>
                    <th>Reviews</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Mensagem</th>
                    <th>Origem</th>
                    <th className="text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div className="font-medium text-foreground">{lead.company_name}</div>
                        {lead.website && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {lead.website}
                          </div>
                        )}
                      </td>
                      <td className="text-muted-foreground">{lead.category ?? "-"}</td>
                      <td className="text-muted-foreground">{lead.phone ?? "-"}</td>
                      <td className="text-muted-foreground">{formatCityState(lead)}</td>
                      <td>{formatRating(lead.rating)}</td>
                      <td className="font-data text-xs">
                        {lead.review_count?.toLocaleString("pt-BR") ?? "-"}
                      </td>
                      <td className="font-data font-medium text-foreground">{lead.final_score}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={statusVariants[lead.status]}>
                            {statusLabels[lead.status]}
                          </Badge>
                          <Badge variant={enrichmentVariants[lead.enrichment_status]}>
                            {enrichmentLabels[lead.enrichment_status]}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <Badge variant={aiMessageVariants[lead.ai_message_status]}>
                          {aiMessageLabels[lead.ai_message_status]}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground">
                        <div>{lead.source ?? "-"}</div>
                        {lead.source_keyword && (
                          <div className="mt-1 text-xs">{lead.source_keyword}</div>
                        )}
                      </td>
                      <td className="text-right">
                        <Button asChild size="sm" variant="outline" className="border-2 border-border">
                          <Link href={`/leads/${lead.id}`}>
                            <Eye className="h-4 w-4" />
                            Ver detalhes
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
