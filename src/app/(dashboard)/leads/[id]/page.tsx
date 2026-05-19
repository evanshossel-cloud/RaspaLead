import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Globe,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Search,
  Shield,
  ShieldOff,
  Sparkles,
  Star,
  Target,
  TimerReset,
} from "lucide-react";
import { notFound } from "next/navigation";
import { CopyToClipboardButton } from "@/components/shared/copy-to-clipboard-button";
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
import { SearchesAutoRefresh } from "@/features/searches/components/searches-auto-refresh";
import { RequestLeadAiMessageButton } from "@/features/leads/components/request-lead-ai-message-button";
import { RequestLeadEnrichmentButton } from "@/features/leads/components/request-lead-enrichment-button";
import type {
  LeadEnrichmentRecord,
  LeadRecord,
  LeadStatus,
} from "@/features/leads/types";
import type {
  LeadSearchRecord,
  LeadSearchStatus,
} from "@/features/searches/types";
import { normalizeBrazilianPhoneForWhatsApp } from "@/lib/phone";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import { createClient } from "@/lib/supabase/server";

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

const enrichmentStatusLabels: Record<
  LeadRecord["enrichment_status"],
  string
> = {
  not_enriched: "Nao enriquecido",
  queued: "Na fila",
  processing: "Processando",
  enriched: "Enriquecido",
  failed: "Falhou",
  skipped: "Ignorado",
};

const enrichmentStatusVariants: Record<
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

const aiMessageStatusLabels: Record<LeadRecord["ai_message_status"], string> = {
  not_generated: "Nao gerada",
  queued: "Na fila",
  processing: "Gerando",
  generated: "Gerada",
  failed: "Falhou",
};

const aiMessageStatusVariants: Record<
  LeadRecord["ai_message_status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  not_generated: "outline",
  queued: "secondary",
  processing: "secondary",
  generated: "default",
  failed: "destructive",
};

function formatNullable(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Nao informado";
  }

  return String(value);
}

function formatCityState(city: string | null, state: string | null) {
  const value = [city, state].filter(Boolean).join("/");
  return value || "Nao informado";
}

function formatDate(value: string | null) {
  if (!value) return "Nao informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRating(value: number | null) {
  return value === null ? "Nao informado" : value.toFixed(1);
}

function getLeadScore(lead: LeadRecord) {
  return lead.final_score ?? lead.raw_score;
}

function getLeadTemperature(score: number) {
  if (score >= 80) {
    return {
      label: "Lead quente",
      description: "Prioridade alta para abordagem comercial.",
      variant: "default" as const,
    };
  }

  if (score >= 50) {
    return {
      label: "Lead medio",
      description: "Bom potencial, vale qualificar com mais contexto.",
      variant: "secondary" as const,
    };
  }

  return {
    label: "Lead frio",
    description: "Baixa prioridade inicial, acompanhe sinais futuros.",
    variant: "outline" as const,
  };
}

function parseEnrichmentSource(
  rawData: unknown,
): "google_place_details" | "mock_enrichment" | null {
  if (typeof rawData !== "object" || rawData === null) return null;
  const source = (rawData as Record<string, unknown>).source;
  if (source === "google_place_details") return "google_place_details";
  if (source === "mock_enrichment") return "mock_enrichment";
  return null;
}

function parseWebsiteError(rawData: unknown): string | null {
  if (typeof rawData !== "object" || rawData === null) return null;
  const err = (rawData as Record<string, unknown>).website_error;
  return typeof err === "string" ? err : null;
}

function parseWebsiteAnalysisUsed(rawData: unknown): boolean {
  if (typeof rawData !== "object" || rawData === null) return false;
  return (rawData as Record<string, unknown>).website_analysis_used === true;
}

function normalizeExternalUrl(value: string | null) {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="text-sm leading-6 text-foreground">{value}</div>
    </div>
  );
}

function SignalCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
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

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    notFound();
  }

  const supabase = await createClient();

  const { data: leadData } = await supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .maybeSingle();

  const lead = leadData as LeadRecord | null;

  if (!lead) {
    notFound();
  }

  const { data: searchData } = lead.search_id
    ? await supabase
        .from("lead_searches")
        .select("*")
        .eq("workspace_id", workspace.id)
        .eq("id", lead.search_id)
        .maybeSingle()
    : { data: null };

  const { data: enrichmentData } = await supabase
    .from("lead_enrichments")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("lead_id", lead.id)
    .maybeSingle();

  const relatedSearch = searchData as LeadSearchRecord | null;
  const enrichment = enrichmentData as LeadEnrichmentRecord | null;
  const enrichmentSource = enrichment ? parseEnrichmentSource(enrichment.raw_data) : null;
  const primaryScore = getLeadScore(lead);
  const leadTemperature = getLeadTemperature(primaryScore);
  const websiteUrl = normalizeExternalUrl(lead.website);
  const mapsUrl = normalizeExternalUrl(lead.google_maps_url);
  const isEnrichmentRunning =
    lead.enrichment_status === "queued" || lead.enrichment_status === "processing";
  const isAiMessageRunning =
    lead.ai_message_status === "queued" || lead.ai_message_status === "processing";
  const shouldAutoRefresh = isEnrichmentRunning || isAiMessageRunning;
  const aiSequenceText = lead.ai_followup_message
    ? `Mensagem inicial:\n${lead.ai_first_message ?? ""}\n\nFollow-up:\n${lead.ai_followup_message}`
    : lead.ai_first_message ?? "";
  const whatsappPhone = lead.phone
    ? normalizeBrazilianPhoneForWhatsApp(lead.phone)
    : null;
  const whatsappHref =
    whatsappPhone && lead.ai_first_message
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(lead.ai_first_message)}`
      : null;
  const websiteError = enrichment ? parseWebsiteError(enrichment.raw_data) : null;
  const websiteAnalysisUsed = enrichment ? parseWebsiteAnalysisUsed(enrichment.raw_data) : false;
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <SearchesAutoRefresh hasRunningSearches={shouldAutoRefresh} />

      <PageHeader
        eyebrow="RaspaLead // Detalhe do lead"
        title={lead.company_name}
        description={`${formatNullable(lead.category)} • ${formatCityState(lead.city, lead.state)}`}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/leads">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            {lead.search_id && (
              <Button asChild>
                <Link href={`/searches/${lead.search_id}`}>
                  <Search className="h-4 w-4" />
                  Ver busca relacionada
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <Card className="overflow-hidden">
        <CardContent className="relative p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-primary/14 blur-3xl" />
          <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:items-start">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={leadStatusVariants[lead.status]}>
                  {leadStatusLabels[lead.status]}
                </Badge>
                <Badge variant={leadTemperature.variant}>{leadTemperature.label}</Badge>
                <Badge variant={enrichmentStatusVariants[lead.enrichment_status]}>
                  {enrichmentStatusLabels[lead.enrichment_status]}
                </Badge>
                <Badge variant={aiMessageStatusVariants[lead.ai_message_status]}>
                  {aiMessageStatusLabels[lead.ai_message_status]}
                </Badge>
                <Badge variant="outline">{formatNullable(lead.category)}</Badge>
              </div>

              <div>
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Empresa monitorada
                </p>
                <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground md:text-4xl">
                  {lead.company_name}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Lead pronto para evoluir nas proximas fases de enriquecimento, mensagem sugerida por IA e historico de acoes comerciais.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Score principal
                  </p>
                  <p className="font-display mt-2 text-5xl font-bold tracking-[-0.05em] text-foreground">
                    {primaryScore}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                  <Target className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {leadTemperature.description}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                  <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Cidade / UF
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {formatCityState(lead.city, lead.state)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                  <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Enriquecimento
                  </p>
                  <div className="mt-2">
                    <Badge variant={enrichmentStatusVariants[lead.enrichment_status]}>
                      {enrichmentStatusLabels[lead.enrichment_status]}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <RequestLeadEnrichmentButton
                  leadId={lead.id}
                  enrichmentStatus={lead.enrichment_status}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(isEnrichmentRunning || isAiMessageRunning) && (
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
                  {isAiMessageRunning ? (
                    <Badge variant={aiMessageStatusVariants[lead.ai_message_status]}>
                      {aiMessageStatusLabels[lead.ai_message_status]}
                    </Badge>
                  ) : (
                    <Badge variant={enrichmentStatusVariants[lead.enrichment_status]}>
                      {enrichmentStatusLabels[lead.enrichment_status]}
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    {isAiMessageRunning
                      ? "Estamos criando uma abordagem personalizada para este lead."
                      : "Estamos buscando, organizando e priorizando seus sinais comerciais."}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {isAiMessageRunning
                      ? "A geracao da mensagem vai montar uma abordagem inicial e um follow-up com base no contexto comercial deste lead."
                      : "O enriquecimento manual em background vai atualizar score final, validacao de telefone e os primeiros indicadores do site deste lead."}
                  </p>
                </div>
              </div>

              <div className="min-w-full max-w-xl flex-1 lg:min-w-[320px]">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {isAiMessageRunning
                      ? "Processamento da mensagem"
                      : "Processamento do enriquecimento"}
                  </span>
                  <span className="font-data text-foreground">
                    {isAiMessageRunning
                      ? lead.ai_message_status === "queued"
                        ? "Fila"
                        : "Executando"
                      : lead.enrichment_status === "queued"
                        ? "Fila"
                        : "Executando"}
                  </span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted/70">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-primary via-secondary to-secondary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <SignalCard title="Telefone" value={formatNullable(lead.phone)} icon={Phone} />
        <SignalCard title="Site" value={lead.website ? "Disponivel" : "Nao informado"} icon={Globe} />
        <SignalCard title="Cidade/UF" value={formatCityState(lead.city, lead.state)} icon={MapPin} />
        <SignalCard title="Avaliacao" value={formatRating(lead.rating)} icon={Star} />
        <SignalCard title="Reviews" value={formatNullable(lead.review_count)} icon={Sparkles} />
        <SignalCard title="Score" value={primaryScore} icon={Target} />
        <SignalCard
          title="Enriquecimento"
          value={enrichmentStatusLabels[lead.enrichment_status]}
          icon={TimerReset}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da empresa</CardTitle>
            <CardDescription>
              Informacoes base capturadas e prontas para uso operacional.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem label="Nome da empresa" value={lead.company_name} />
            <InfoItem label="Categoria" value={formatNullable(lead.category)} />
            <InfoItem label="Telefone" value={formatNullable(lead.phone)} />
            <InfoItem
              label="Site"
              value={websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80"
                >
                  Abrir site
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                "Nao informado"
              )}
            />
            <InfoItem
              label="Google Maps"
              value={mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80"
                >
                  Abrir no Maps
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                "Nao informado"
              )}
            />
            <InfoItem label="Endereco" value={formatNullable(lead.address)} />
            <InfoItem label="Cidade" value={formatNullable(lead.city)} />
            <InfoItem label="Estado" value={formatNullable(lead.state)} />
            <InfoItem label="Origem" value={formatNullable(lead.source)} />
            <InfoItem
              label="Palavra-chave de origem"
              value={formatNullable(lead.source_keyword)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Origem da busca</CardTitle>
            <CardDescription>
              Contexto da busca que gerou este lead dentro do workspace ativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {relatedSearch ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoItem label="Nome da busca" value={relatedSearch.name} />
                <InfoItem label="Nicho" value={formatNullable(relatedSearch.niche)} />
                <InfoItem
                  label="Palavra-chave"
                  value={formatNullable(relatedSearch.keyword)}
                />
                <InfoItem
                  label="Oferta usada"
                  value={formatNullable(relatedSearch.user_offer)}
                />
                <InfoItem
                  label="Perfil de cliente ideal"
                  value={formatNullable(relatedSearch.target_customer_profile)}
                />
                <InfoItem
                  label="Quantidade solicitada"
                  value={relatedSearch.quantity_requested.toLocaleString("pt-BR")}
                />
                <InfoItem
                  label="Quantidade encontrada"
                  value={relatedSearch.quantity_found.toLocaleString("pt-BR")}
                />
                <InfoItem
                  label="Status da busca"
                  value={
                    <Badge variant={searchStatusVariants[relatedSearch.status]}>
                      {searchStatusLabels[relatedSearch.status]}
                    </Badge>
                  }
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
                Este lead nao possui uma busca relacionada registrada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score e sinais comerciais</CardTitle>
            <CardDescription>
              Leitura inicial do potencial comercial antes do enriquecimento aprofundado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Raw score
                </p>
                <p className="font-display mt-3 text-4xl font-bold tracking-[-0.04em] text-foreground">
                  {lead.raw_score}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Final score
                </p>
                <p className="font-display mt-3 text-4xl font-bold tracking-[-0.04em] text-foreground">
                  {lead.final_score}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={leadTemperature.variant}>{leadTemperature.label}</Badge>
              <Badge variant="outline">Score principal: {primaryScore}</Badge>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              O score final sera aprimorado conforme o lead for enriquecido.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enriquecimento</CardTitle>
            <CardDescription>
              Sinais comerciais capturados no enriquecimento do lead.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {enrichment ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={enrichmentStatusVariants[lead.enrichment_status]}>
                    {enrichmentStatusLabels[lead.enrichment_status]}
                  </Badge>
                  {enrichmentSource === "google_place_details" && (
                    <Badge variant="outline">Google Place Details</Badge>
                  )}
                  {enrichmentSource === "mock_enrichment" && (
                    <Badge variant="outline">Enrichment simulado</Badge>
                  )}
                  {/* Badges de website */}
                  {!lead.website && !enrichment.website_final_url && (
                    <Badge variant="outline">Sem site informado</Badge>
                  )}
                  {enrichment.website_status !== null && enrichment.website_status >= 200 && enrichment.website_status < 300 && (
                    <Badge variant="default">Site online</Badge>
                  )}
                  {enrichment.website_status !== null && enrichment.website_status >= 400 && (
                    <Badge variant="destructive">Erro ao acessar</Badge>
                  )}
                  {websiteError && !enrichment.website_status && (
                    <Badge variant="destructive">Erro ao acessar</Badge>
                  )}
                  {enrichment.website_has_ssl === false && (
                    <Badge variant="outline" className="border-yellow-600/40 text-yellow-600">Sem HTTPS</Badge>
                  )}
                  {enrichment.website_has_meta_viewport === true && (
                    <Badge variant="outline" className="border-emerald-600/40 text-emerald-600">Mobile-friendly</Badge>
                  )}
                  {enrichment.website_copyright_year !== null && enrichment.website_copyright_year < currentYear - 5 && (
                    <Badge variant="outline" className="border-orange-600/40 text-orange-600">Site antigo</Badge>
                  )}
                </div>

                {/* Seção: Análise do site */}
                {websiteAnalysisUsed && (
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Análise do site (Website Enrichment v1)
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InfoItem
                        label="Status HTTP"
                        value={
                          enrichment.website_status !== null ? (
                            <span className={
                              enrichment.website_status >= 200 && enrichment.website_status < 300
                                ? "text-emerald-600"
                                : enrichment.website_status >= 400
                                  ? "text-destructive"
                                  : "text-foreground"
                            }>
                              {enrichment.website_status}
                            </span>
                          ) : "Nao informado"
                        }
                      />
                      <InfoItem
                        label="URL final"
                        value={
                          enrichment.website_final_url ? (
                            <a
                              href={normalizeExternalUrl(enrichment.website_final_url) ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-secondary hover:text-secondary/80 truncate max-w-[200px]"
                            >
                              <span className="truncate">{enrichment.website_final_url}</span>
                              <ArrowRight className="h-3 w-3 shrink-0" />
                            </a>
                          ) : "Nao informado"
                        }
                      />
                      <InfoItem
                        label="HTTPS"
                        value={
                          <span className="flex items-center gap-1.5">
                            {enrichment.website_has_ssl === true ? (
                              <><Shield className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-600">Sim</span></>
                            ) : enrichment.website_has_ssl === false ? (
                              <><ShieldOff className="h-3.5 w-3.5 text-yellow-600" /><span className="text-yellow-600">Nao</span></>
                            ) : "Nao informado"}
                          </span>
                        }
                      />
                      <InfoItem
                        label="Mobile / viewport"
                        value={
                          enrichment.website_has_meta_viewport === true
                            ? <span className="text-emerald-600">Sim</span>
                            : enrichment.website_has_meta_viewport === false
                              ? <span className="text-muted-foreground">Nao</span>
                              : "Nao informado"
                        }
                      />
                      <InfoItem
                        label="Ano de copyright"
                        value={
                          enrichment.website_copyright_year !== null ? (
                            <span className={
                              enrichment.website_copyright_year < currentYear - 5
                                ? "text-orange-600"
                                : "text-foreground"
                            }>
                              {enrichment.website_copyright_year}
                              {enrichment.website_copyright_year < currentYear - 5 && " (antigo)"}
                            </span>
                          ) : "Nao informado"
                        }
                      />
                      <InfoItem
                        label="Score qualidade do site"
                        value={
                          enrichment.website_quality_score !== null ? (
                            <span className={
                              enrichment.website_quality_score >= 70
                                ? "text-emerald-600 font-semibold"
                                : enrichment.website_quality_score >= 45
                                  ? "text-foreground"
                                  : "text-orange-600"
                            }>
                              {enrichment.website_quality_score}/100
                            </span>
                          ) : "Nao informado"
                        }
                      />
                      <InfoItem
                        label="Tempo de resposta"
                        value={
                          enrichment.website_response_time_ms !== null ? (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className={
                                enrichment.website_response_time_ms < 3000
                                  ? "text-emerald-600"
                                  : "text-orange-600"
                              }>
                                {enrichment.website_response_time_ms} ms
                              </span>
                            </span>
                          ) : "Nao informado"
                        }
                      />
                      {websiteError && (
                        <InfoItem
                          label="Erro ao acessar"
                          value={
                            <span className="flex items-center gap-1.5 text-destructive">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              <span className="text-xs">{websiteError}</span>
                            </span>
                          }
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Outros sinais do enrichment */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {!websiteAnalysisUsed && (
                    <>
                      <InfoItem
                        label="Status do site"
                        value={formatNullable(enrichment.website_status)}
                      />
                      <InfoItem
                        label="Score de qualidade do site"
                        value={formatNullable(enrichment.website_quality_score)}
                      />
                    </>
                  )}
                  <InfoItem
                    label="Telefone valido"
                    value={enrichment.phone_valid === null ? "Nao informado" : enrichment.phone_valid ? "Sim" : "Nao"}
                  />
                  <InfoItem
                    label="WhatsApp provavel"
                    value={enrichment.whatsapp_likely === null ? "Nao informado" : enrichment.whatsapp_likely ? "Sim" : "Nao"}
                  />
                  <InfoItem
                    label="Score de recencia"
                    value={formatNullable(enrichment.review_recency_score)}
                  />
                  <InfoItem
                    label="Atualizado em"
                    value={formatDate(enrichment.updated_at)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={enrichmentStatusVariants[lead.enrichment_status]}>
                    {enrichmentStatusLabels[lead.enrichment_status]}
                  </Badge>
                  <Badge variant="outline">Dados comerciais em preparacao</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Na proxima fase, esta area mostrara qualidade do site, presenca digital, recencia de avaliacoes e sinais de oportunidade comercial.
                </p>
              </>
            )}
            {lead.enrichment_error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {lead.enrichment_error}
              </div>
            )}
            <RequestLeadEnrichmentButton
              leadId={lead.id}
              enrichmentStatus={lead.enrichment_status}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mensagem sugerida</CardTitle>
            <CardDescription>
              Area reservada para a abordagem comercial personalizada por IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isAiMessageRunning ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={aiMessageStatusVariants[lead.ai_message_status]}>
                    {aiMessageStatusLabels[lead.ai_message_status]}
                  </Badge>
                  <Badge variant="outline">Geracao em andamento</Badge>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-foreground">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Preview da mensagem</p>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Estamos criando uma abordagem personalizada para este lead.
                  </p>
                </div>
              </>
            ) : lead.ai_message_status === "generated" && lead.ai_first_message ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={aiMessageStatusVariants[lead.ai_message_status]}>
                    {aiMessageStatusLabels[lead.ai_message_status]}
                  </Badge>
                  <Badge variant="outline">Abordagem pronta</Badge>
                </div>
                <div className="grid gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <CopyToClipboardButton
                      text={aiSequenceText}
                      label="Copiar ambas"
                      copiedLabel="Sequencia copiada"
                      toastMessage="Sequencia copiada"
                      variant="secondary"
                    />
                    {whatsappHref ? (
                      <Button asChild className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] shadow-[0_12px_26px_rgba(74,222,128,0.22)] hover:bg-[hsl(var(--success))]/90 hover:text-[hsl(var(--success-foreground))]">
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4" />
                          Abrir no WhatsApp
                        </a>
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          disabled
                          variant="outline"
                          className="border-[hsl(var(--success))]/30 text-[hsl(var(--success))] disabled:opacity-50"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Abrir no WhatsApp
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          {lead.phone ? "Telefone indisponivel para WhatsApp" : "Telefone nao informado"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-2 text-foreground">
                        <MessageSquareText className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Mensagem inicial</p>
                      </div>
                      <CopyToClipboardButton text={lead.ai_first_message} />
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {lead.ai_first_message}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-2 text-foreground">
                        <MessageSquareText className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Follow-up</p>
                      </div>
                      <CopyToClipboardButton
                        text={lead.ai_followup_message ?? ""}
                        label="Copiar"
                      />
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {lead.ai_followup_message ?? "Follow-up nao informado."}
                    </p>
                  </div>
                </div>
              </>
            ) : lead.ai_message_status === "failed" ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={aiMessageStatusVariants[lead.ai_message_status]}>
                    {aiMessageStatusLabels[lead.ai_message_status]}
                  </Badge>
                </div>
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {lead.ai_message_error ??
                    "Nao foi possivel gerar a mensagem sugerida deste lead."}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={aiMessageStatusVariants[lead.ai_message_status]}>
                    {aiMessageStatusLabels[lead.ai_message_status]}
                  </Badge>
                  <Badge variant="outline">Aguardando geracao</Badge>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-foreground">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Preview da mensagem</p>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    A mensagem personalizada por IA sera gerada na proxima fase com base na oferta da busca e nos sinais comerciais do lead.
                  </p>
                </div>
              </>
            )}

            <RequestLeadAiMessageButton
              leadId={lead.id}
              aiMessageStatus={lead.ai_message_status}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historico de acoes</CardTitle>
            <CardDescription>
              Linha do tempo inicial do lead dentro da operacao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Lead criado",
                description: `Registrado em ${formatDate(lead.created_at)}.`,
              },
              {
                title: "Origem: busca",
                description: relatedSearch
                  ? `Gerado pela busca ${relatedSearch.name}.`
                  : "Sem busca relacionada registrada.",
              },
              {
                title: "Status atual",
                description: `O lead esta marcado como ${leadStatusLabels[lead.status].toLowerCase()}.`,
              },
              {
                title: "Proximas fases",
                description:
                  "Futuramente: enriquecimentos, mensagens, exportacoes e movimentacoes no CRM.",
              },
              {
                title: "Mensagem sugerida",
                description: `Status atual: ${aiMessageStatusLabels[lead.ai_message_status].toLowerCase()}.`,
              },
            ].map((event, index) => (
              <div
                key={event.title}
                className="flex gap-4 rounded-2xl border border-border/70 bg-background/60 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 font-data text-xs text-primary">
                  0{index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
