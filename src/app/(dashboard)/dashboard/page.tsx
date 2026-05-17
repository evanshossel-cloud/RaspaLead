import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Search,
  Users,
  Zap,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import type { LeadSearchRecord, LeadSearchStatus } from "@/features/searches/types";
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  let creditsBalance = 0;
  if (workspace) {
    const { data } = await supabase.rpc(
      "get_workspace_credits_balance",
      { p_workspace_id: workspace.id } as never,
    );
    creditsBalance = (data as number | null) ?? 0;
  }

  const plan = workspace?.plans;
  const quota = plan?.monthly_credit_quota ?? 0;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    totalSearchesResult,
    totalLeadsResult,
    leadsThisMonthResult,
    completedSearchesResult,
    pendingSearchesResult,
    processingSearchesResult,
    failedSearchesResult,
    recentSearchesResult,
  ] = workspace
    ? await Promise.all([
        supabase
          .from("lead_searches")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id)
          .gte("created_at", monthStart.toISOString()),
        supabase
          .from("lead_searches")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id)
          .eq("status", "completed"),
        supabase
          .from("lead_searches")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id)
          .eq("status", "pending"),
        supabase
          .from("lead_searches")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id)
          .eq("status", "processing"),
        supabase
          .from("lead_searches")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id)
          .eq("status", "failed"),
        supabase
          .from("lead_searches")
          .select("id, name, status, created_at, progress, quantity_found")
          .eq("workspace_id", workspace.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ])
    : [
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { data: [] as LeadSearchRecord[] },
      ];

  const totalSearches = totalSearchesResult.count ?? 0;
  const totalLeads = totalLeadsResult.count ?? 0;
  const leadsThisMonth = leadsThisMonthResult.count ?? 0;
  const completedSearches = completedSearchesResult.count ?? 0;
  const pendingSearches = pendingSearchesResult.count ?? 0;
  const processingSearches = processingSearchesResult.count ?? 0;
  const failedSearches = failedSearchesResult.count ?? 0;
  const usedCredits = Math.max(quota - creditsBalance, 0);
  const usagePercent = quota > 0 ? Math.min(100, Math.round((usedCredits / quota) * 100)) : 0;
  const recentSearches = (recentSearchesResult.data ?? []) as Pick<
    LeadSearchRecord,
    "id" | "name" | "status" | "created_at" | "progress" | "quantity_found"
  >[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RaspaLead // Command Center"
        title="Central de Prospecção"
        description={`Monitore buscas, leads e creditos do workspace ${workspace?.name ?? "ativo"} em tempo real.`}
        action={
          <>
            <Button asChild variant="outline">
              <Link href="/searches">Ver operacao</Link>
            </Button>
            <Button asChild>
              <Link href="/searches/new">
                Nova busca
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card className="overflow-hidden">
          <CardContent className="relative p-6">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/16 blur-3xl" />
            <div className="relative space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <Badge>Motor de prospeccao</Badge>
                  <div>
                    <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-foreground md:text-4xl">
                      Pipeline operacional sob controle.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Acompanhe a criacao de listas, o processamento em background e a conversao dos leads do seu workspace em uma unica visao tatica.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-right md:min-w-[240px]">
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-left">
                    <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Buscas ativas
                    </p>
                    <p className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground">
                      {pendingSearches + processingSearches}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-left">
                    <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Falhas
                    </p>
                    <p className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground">
                      {failedSearches}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    label: "Leads no mes",
                    value: leadsThisMonth.toLocaleString("pt-BR"),
                    tone: "text-secondary",
                  },
                  {
                    label: "Concluidas",
                    value: completedSearches.toLocaleString("pt-BR"),
                    tone: "text-[hsl(var(--success))]",
                  },
                  {
                    label: "Leads totais",
                    value: totalLeads.toLocaleString("pt-BR"),
                    tone: "text-primary",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                    <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className={`font-display mt-3 text-3xl font-bold tracking-[-0.04em] ${item.tone}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reserva de creditos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-end justify-between gap-3 rounded-2xl border border-border/70 bg-background/60 p-5">
              <div>
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Plano atual
                </p>
                <p className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground">
                  {plan?.name ?? "Plano base"}
                </p>
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Creditos restantes
                  </p>
                  <p className="font-display mt-2 text-4xl font-bold tracking-[-0.04em] text-foreground">
                    {creditsBalance.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Utilizacao
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{usagePercent}% usados</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{usedCredits.toLocaleString("pt-BR")} consumidos</span>
                <span>{quota.toLocaleString("pt-BR")} na franquia</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
              {[
                { label: "Pendentes", value: pendingSearches, icon: Clock3 },
                { label: "Processando", value: processingSearches, icon: Search },
                { label: "Concluidas", value: completedSearches, icon: CheckCircle2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">Estado atual</p>
                    </div>
                  </div>
                  <span className="font-display text-2xl font-bold tracking-[-0.04em] text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total de buscas"
          value={totalSearches.toLocaleString("pt-BR")}
          description="Buscas criadas neste workspace"
          icon={Search}
        />
        <MetricCard
          title="Total de leads"
          value={totalLeads.toLocaleString("pt-BR")}
          description="Leads disponiveis no workspace"
          icon={Users}
        />
        <MetricCard
          title="Creditos restantes"
          value={creditsBalance.toLocaleString("pt-BR")}
          description={`Plano: ${plan?.name ?? "Plano base"}`}
          icon={Zap}
        />
        <MetricCard
          title="Leads encontrados no mes"
          value={leadsThisMonth.toLocaleString("pt-BR")}
          description={`Quota atual: ${quota.toLocaleString("pt-BR")}`}
          icon={Users}
        />
        <MetricCard
          title="Buscas concluidas"
          value={completedSearches.toLocaleString("pt-BR")}
          description="Concluidas com sucesso"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Panorama das buscas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Pendentes", value: pendingSearches, icon: Clock3 },
              { label: "Processando", value: processingSearches, icon: Search },
              { label: "Concluidas", value: completedSearches, icon: CheckCircle2 },
              { label: "Falharam", value: failedSearches, icon: Clock3 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-border/70 bg-background/55 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">Resumo em tempo real</p>
                    </div>
                  </div>
                  <span className="font-display text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    {value.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${Math.min(value * 18, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buscas recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSearches.length === 0 ? (
              <EmptyState
                title="Nenhuma busca ainda"
                description="Crie sua primeira busca para ver o pipeline real de processamento neste dashboard."
                action={
                  <Button asChild>
                    <Link href="/searches/new">Criar busca</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {recentSearches.map((search) => (
                  <div key={search.id} className="rounded-2xl border border-border/70 bg-background/55 p-4 transition-colors hover:bg-background/80">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{search.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Criada em {formatDate(search.created_at)}
                        </p>
                      </div>
                      <Badge variant={searchStatusVariants[search.status]}>
                        {searchStatusLabels[search.status]}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{search.quantity_found} leads encontrados</span>
                      <span>{search.progress}% concluido</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/70">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${search.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
