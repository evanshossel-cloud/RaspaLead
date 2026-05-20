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
  completed: "Concluída",
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
        eyebrow="RaspaLead · Motor de Prospecção"
        title="Central de Prospecção"
        description={`Monitore buscas, leads e créditos do workspace ${workspace?.name ?? "ativo"} em tempo real.`}
        action={
          <>
            <Button asChild variant="outline" className="border-2 border-border shadow-[2px_2px_0_#0a0a0a]">
              <Link href="/searches">Ver operação</Link>
            </Button>
            <Button asChild className="border-2 border-border font-black uppercase shadow-[2px_2px_0_#0a0a0a]">
              <Link href="/searches/new">
                Nova busca
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      {/* Top hero + credits grid */}
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        {/* Pipeline hero */}
        <Card className="overflow-hidden border-2 border-border shadow-[4px_4px_0_#0a0a0a]">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <Badge className="border border-border font-bold uppercase">
                    Motor de prospecção
                  </Badge>
                  <div>
                    <h2 className="font-display text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
                      Pipeline operacional sob controle.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Acompanhe a criação de listas, o processamento em background e a
                      conversão dos leads do seu workspace em uma única visão tática.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-right md:min-w-[240px]">
                  <div className="border border-border bg-muted/40 p-4 text-left">
                    <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Buscas ativas
                    </p>
                    <p className="font-display mt-2 text-3xl font-black tracking-tight text-foreground">
                      {pendingSearches + processingSearches}
                    </p>
                  </div>
                  <div className="border border-border bg-muted/40 p-4 text-left">
                    <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Falhas
                    </p>
                    <p className="font-display mt-2 text-3xl font-black tracking-tight text-foreground">
                      {failedSearches}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    label: "Leads no mês",
                    value: leadsThisMonth.toLocaleString("pt-BR"),
                    accent: "bg-[#EAF2FF]",
                    textColor: "text-primary",
                  },
                  {
                    label: "Concluídas",
                    value: completedSearches.toLocaleString("pt-BR"),
                    accent: "bg-[#E9FBEF]",
                    textColor: "text-success",
                  },
                  {
                    label: "Leads totais",
                    value: totalLeads.toLocaleString("pt-BR"),
                    accent: "bg-[#FFF3B0]",
                    textColor: "text-foreground",
                  },
                ].map((item) => (
                  <div key={item.label} className={`border border-border p-4 ${item.accent}`}>
                    <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className={`font-display mt-3 text-3xl font-black tracking-tight ${item.textColor}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credits card */}
        <Card className="border-2 border-border shadow-[4px_4px_0_#0a0a0a]">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="font-data text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Reserva de créditos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-end justify-between gap-3 border border-border bg-[#EAF2FF] p-4">
              <div>
                <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Plano atual
                </p>
                <p className="font-display mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
                  {plan?.name ?? "Plano base"}
                </p>
              </div>
              <Badge className="border border-border font-bold uppercase">Live</Badge>
            </div>

            <div className="border border-border bg-muted/40 p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Créditos restantes
                  </p>
                  <p className="font-display mt-2 text-4xl font-black tracking-tight text-foreground">
                    {creditsBalance.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Utilização
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">{usagePercent}%</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{usedCredits.toLocaleString("pt-BR")} consumidos</span>
                <span>{quota.toLocaleString("pt-BR")} na franquia</span>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-1">
              {[
                { label: "Pendentes", value: pendingSearches, icon: Clock3 },
                { label: "Processando", value: processingSearches, icon: Search },
                { label: "Concluídas", value: completedSearches, icon: CheckCircle2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between border border-border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center bg-[#EAF2FF] text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                  </div>
                  <span className="font-display text-2xl font-black tracking-tight text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metric cards row */}
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
          description="Leads disponíveis no workspace"
          icon={Users}
        />
        <MetricCard
          title="Créditos restantes"
          value={creditsBalance.toLocaleString("pt-BR")}
          description={`Plano: ${plan?.name ?? "Plano base"}`}
          icon={Zap}
        />
        <MetricCard
          title="Leads no mês"
          value={leadsThisMonth.toLocaleString("pt-BR")}
          description={`Quota: ${quota.toLocaleString("pt-BR")}`}
          icon={Users}
        />
        <MetricCard
          title="Buscas concluídas"
          value={completedSearches.toLocaleString("pt-BR")}
          description="Concluídas com sucesso"
          icon={CheckCircle2}
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline breakdown */}
        <Card className="border-2 border-border shadow-[3px_3px_0_#0a0a0a]">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="font-data text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Panorama das buscas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {[
              { label: "Pendentes", value: pendingSearches, icon: Clock3, accent: "bg-[#FFF3B0]" },
              { label: "Processando", value: processingSearches, icon: Search, accent: "bg-[#EAF2FF]" },
              { label: "Concluídas", value: completedSearches, icon: CheckCircle2, accent: "bg-[#E9FBEF]" },
              { label: "Falharam", value: failedSearches, icon: Clock3, accent: "bg-red-50" },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div key={label} className={`border border-border p-4 ${accent}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">Resumo em tempo real</p>
                    </div>
                  </div>
                  <span className="font-display text-2xl font-black tracking-tight text-foreground">
                    {value.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="mt-3 h-1 overflow-hidden bg-black/10">
                  <div
                    className="h-full bg-foreground/60"
                    style={{ width: `${Math.min(value * 18, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent searches */}
        <Card className="border-2 border-border shadow-[3px_3px_0_#0a0a0a]">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="font-data text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Buscas recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {recentSearches.length === 0 ? (
              <EmptyState
                title="Nenhuma busca ainda"
                description="Crie sua primeira busca para ver o pipeline real de processamento neste dashboard."
                action={
                  <Button asChild className="border-2 border-border font-black uppercase shadow-[2px_2px_0_#0a0a0a]">
                    <Link href="/searches/new">Criar busca</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="border border-border bg-muted/20 p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{search.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Criada em {formatDate(search.created_at)}
                        </p>
                      </div>
                      <Badge variant={searchStatusVariants[search.status]}>
                        {searchStatusLabels[search.status]}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{search.quantity_found} leads encontrados</span>
                      <span className="font-bold">{search.progress}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden bg-black/10">
                      <div
                        className="h-full bg-primary"
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
