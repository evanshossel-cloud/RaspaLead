import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Gauge,
  ListChecks,
  Phone,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExportLeadsButton } from "@/features/leads/components/export-leads-button";
import type { LeadRecord, LeadStatus } from "@/features/leads/types";
import { AutoRefreshBadge } from "@/features/searches/components/auto-refresh-badge";
import { SearchesAutoRefresh } from "@/features/searches/components/searches-auto-refresh";
import type {
  LeadSearchRecord,
  LeadSearchStatus,
  SearchProcessingMetadata,
} from "@/features/searches/types";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import { createClient } from "@/lib/supabase/server";

const searchStatusLabels: Record<LeadSearchStatus, string> = {
  pending: "Pendente",
  processing: "Processando",
  enriching: "Enriquecendo",
  completed: "Concluida",
  failed: "Falhou",
  canceled: "Cancelada",
};

const searchStatusVariants: Record<
  LeadSearchStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  processing: "default",
  enriching: "default",
  completed: "outline",
  failed: "destructive",
  canceled: "outline",
};

const leadStatusLabels: Record<LeadStatus, string> = {
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

const leadStatusVariants: Record<
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

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLocation(search: LeadSearchRecord) {
  return [search.city, search.state].filter(Boolean).join("/") || "-";
}

function formatLeadLocation(lead: LeadRecord) {
  return [lead.city, lead.state].filter(Boolean).join("/") || "-";
}

function formatRating(value: number | null) {
  return value === null ? "-" : value.toFixed(1);
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="text-sm leading-6 text-foreground">{value}</div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-display text-3xl font-bold tracking-[-0.04em] text-foreground">
          {value}
        </div>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function parseProcessingMetadata(raw: unknown): SearchProcessingMetadata | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const meta = raw as Record<string, unknown>;
  if (typeof meta.provider !== "string") return null;
  return {
    provider: meta.provider,
    providerReturned: typeof meta.providerReturned === "number" ? meta.providerReturned : 0,
    afterLocalDedupe: typeof meta.afterLocalDedupe === "number" ? meta.afterLocalDedupe : 0,
    afterExistingFilter: typeof meta.afterExistingFilter === "number" ? meta.afterExistingFilter : 0,
    inserted: typeof meta.inserted === "number" ? meta.inserted : 0,
    maxResultsLimit: typeof meta.maxResultsLimit === "number" ? meta.maxResultsLimit : undefined,
    queryUsed: typeof meta.queryUsed === "string" ? meta.queryUsed : null,
    error: typeof meta.error === "string" ? meta.error : null,
  };
}

function DiagItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 p-3">
      <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

interface SearchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SearchDetailPage({
  params,
}: SearchDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    notFound();
  }

  const supabase = await createClient();

  const [{ data: searchData }, { data: leadsData }] = await Promise.all([
    supabase
      .from("lead_searches")
      .select("*")
      .eq("workspace_id", workspace.id)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("leads")
      .select("*")
      .eq("workspace_id", workspace.id)
      .eq("search_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const search = searchData as LeadSearchRecord | null;
  const leads = (leadsData ?? []) as LeadRecord[];

  if (!search) {
    notFound();
  }

  const leadsWithPhone = leads.filter((lead) => Boolean(lead.phone)).length;
  const averageScore =
    leads.length > 0
      ? leads.reduce((total, lead) => total + lead.final_score, 0) / leads.length
      : null;
  const isRunning =
    search.status === "pending" || search.status === "processing";
  const locationLabel = [search.city, search.state].filter(Boolean).join(" / ");
  const processingMeta = parseProcessingMetadata(search.processing_metadata);

  return (
    <div className="space-y-6">
      <SearchesAutoRefresh hasRunningSearches={isRunning} />

      <PageHeader
        eyebrow="RaspaLead // Detalhe da busca"
        title={search.name}
        description="Acompanhe o andamento da operacao, verifique o contexto utilizado e monitore os leads vinculados a este processamento."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/searches">
                <ArrowLeft className="h-4 w-4" />
                Voltar para buscas
              </Link>
            </Button>
            <ExportLeadsButton searchId={search.id} label="Exportar leads" />
            <Button asChild>
              <Link href={`/leads?search_id=${search.id}`}>
                <Users className="h-4 w-4" />
                Abrir leads
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden">
        <CardContent className="relative p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-secondary/14 blur-3xl" />
          <div className="relative grid gap-6 xl:grid-cols-[1.3fr_0.85fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={searchStatusVariants[search.status]}>
                  {searchStatusLabels[search.status]}
                </Badge>
                {isRunning && <AutoRefreshBadge />}
                <Badge variant="outline">{search.niche ?? "Nicho indefinido"}</Badge>
              </div>
              <div>
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Operacao ativa
                </p>
                <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground md:text-4xl">
                  {locationLabel || "Cobertura regional configurada"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Palavra-chave: {search.keyword ?? "sem filtro adicional"}. Oferta usada: {search.user_offer ?? "oferta nao definida"}.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Progresso da extração
                  </p>
                  <p className="font-display mt-2 text-4xl font-bold tracking-[-0.04em] text-foreground">
                    {search.progress}%
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/leads?search_id=${search.id}`}>
                    Abrir leads
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${search.progress}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                  <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Solicitados
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-foreground">
                    {search.quantity_requested}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                  <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Encontrados
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-foreground">
                    {search.quantity_found}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isRunning && (
        <Card className="overflow-hidden">
          <CardContent className="relative p-6">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-secondary/10 to-transparent" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary/70" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-secondary" />
                  </span>
                  <Badge variant={searchStatusVariants[search.status]}>
                    {searchStatusLabels[search.status]}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    Estamos buscando, organizando e priorizando seus leads.
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    O job em background esta executando a fila desta busca. Assim que a operacao concluir, os leads relacionados aparecerao automaticamente nesta tela.
                  </p>
                </div>
              </div>

              <div className="min-w-full max-w-xl flex-1 lg:min-w-[320px]">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Processamento em andamento</span>
                  <span className="font-data text-foreground">{search.progress}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted/70">
                  <div
                    className="h-full animate-pulse rounded-full bg-gradient-to-r from-primary via-secondary to-secondary"
                    style={{ width: `${Math.max(search.progress, 8)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          title="Quantidade solicitada"
          value={search.quantity_requested.toLocaleString("pt-BR")}
          description="Volume pedido nesta busca"
          icon={Search}
        />
        <StatCard
          title="Quantidade encontrada"
          value={search.quantity_found.toLocaleString("pt-BR")}
          description="Leads gerados ate agora"
          icon={Users}
        />
        <StatCard
          title="Status"
          value={
            <Badge variant={searchStatusVariants[search.status]}>
              {searchStatusLabels[search.status]}
            </Badge>
          }
          description="Situacao atual do processamento"
          icon={ListChecks}
        />
        <StatCard
          title="Progresso"
          value={`${search.progress}%`}
          description="Execucao do pipeline atual"
          icon={Gauge}
        />
        <StatCard
          title="Leads com telefone"
          value={leadsWithPhone.toLocaleString("pt-BR")}
          description="Contatos prontos para abordagem"
          icon={Phone}
        />
        <StatCard
          title="Score medio"
          value={averageScore === null ? "-" : averageScore.toFixed(1)}
          description="Media do score final dos leads"
          icon={Sparkles}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da busca</CardTitle>
          <CardDescription>
            Informacoes usadas para gerar os leads deste processamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Nome" value={search.name} />
          <DetailItem label="Cidade / Estado" value={formatLocation(search)} />
          <DetailItem label="Nicho" value={search.niche ?? "-"} />
          <DetailItem label="Palavra-chave" value={search.keyword ?? "-"} />
          <DetailItem label="Oferta usada" value={search.user_offer ?? "-"} />
          <DetailItem
            label="Perfil de cliente"
            value={search.target_customer_profile ?? "-"}
          />
          <DetailItem label="Criada em" value={formatDate(search.created_at)} />
          <DetailItem label="Finalizada em" value={formatDate(search.finished_at)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Diagnostico da busca</CardTitle>
          <CardDescription>
            Metricas internas do pipeline de geracao de leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!processingMeta ? (
            <p className="text-sm text-muted-foreground">
              Diagnostico disponivel nas proximas buscas processadas.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={processingMeta.provider === "google_places" ? "default" : "secondary"}>
                  {processingMeta.provider === "google_places" ? "Google Places" : "Mock"}
                </Badge>
                {processingMeta.maxResultsLimit && (
                  <Badge variant="outline">
                    Limite: {processingMeta.maxResultsLimit} resultados
                  </Badge>
                )}
                {processingMeta.error && (
                  <Badge variant="destructive">Erro no processamento</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <DiagItem
                  label="Retornados"
                  value={processingMeta.providerReturned.toLocaleString("pt-BR")}
                />
                <DiagItem
                  label="Apos dedupe local"
                  value={processingMeta.afterLocalDedupe.toLocaleString("pt-BR")}
                />
                <DiagItem
                  label="Apos filtro banco"
                  value={processingMeta.afterExistingFilter.toLocaleString("pt-BR")}
                />
                <DiagItem
                  label="Inseridos"
                  value={
                    <span className="text-primary">
                      {processingMeta.inserted.toLocaleString("pt-BR")}
                    </span>
                  }
                />
                <DiagItem
                  label="Descartados"
                  value={
                    <span className="text-muted-foreground">
                      {(processingMeta.providerReturned - processingMeta.inserted).toLocaleString("pt-BR")}
                    </span>
                  }
                />
              </div>

              {processingMeta.queryUsed && (
                <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                  <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Query usada
                  </p>
                  <p className="mt-2 font-mono text-xs text-foreground break-all">
                    {processingMeta.queryUsed}
                  </p>
                </div>
              )}

              {processingMeta.error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/8 p-3">
                  <p className="font-data text-[10px] uppercase tracking-[0.16em] text-destructive/80">
                    Erro
                  </p>
                  <p className="mt-2 text-sm text-destructive">
                    {processingMeta.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum lead vinculado ainda"
          description="Assim que a busca concluir o processamento, os leads relacionados aparecerao automaticamente aqui."
          action={
            <Button asChild>
              <Link href="/searches">
                <ArrowLeft className="h-4 w-4" />
                Voltar para buscas
              </Link>
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Leads da busca</CardTitle>
            <CardDescription>
              Lista compacta dos leads associados a este processamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 p-4 md:hidden">
              {leads.map((lead) => (
                <Card key={lead.id} className="overflow-hidden bg-background/60">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{lead.company_name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatLeadLocation(lead)}</p>
                      </div>
                      <Badge variant={leadStatusVariants[lead.status]}>
                        {leadStatusLabels[lead.status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border/70 bg-card/75 p-3">
                        <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Categoria</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{lead.category ?? "-"}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-card/75 p-3">
                        <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Score</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{lead.final_score}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Telefone: {lead.phone ?? "-"}</p>
                      <p>Avaliacao: {formatRating(lead.rating)}</p>
                      <p>Origem: {lead.source ?? "-"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="data-table min-w-[900px]">
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
                    <th>Origem</th>
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
                      <td className="text-muted-foreground">{formatLeadLocation(lead)}</td>
                      <td>{formatRating(lead.rating)}</td>
                      <td className="font-data text-xs">
                        {lead.review_count?.toLocaleString("pt-BR") ?? "-"}
                      </td>
                      <td className="font-data font-medium text-foreground">{lead.final_score}</td>
                      <td>
                        <Badge variant={leadStatusVariants[lead.status]}>
                          {leadStatusLabels[lead.status]}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground">
                        <div>{lead.source ?? "-"}</div>
                        {lead.source_keyword && (
                          <div className="mt-1 text-xs">{lead.source_keyword}</div>
                        )}
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
