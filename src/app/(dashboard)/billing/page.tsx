import Link from "next/link";
import { CreditCard, Check, Zap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Plan = Database["public"]["Tables"]["plans"]["Row"];

export default async function BillingPage() {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();

  let creditsBalance = 0;
  if (workspace) {
    const { data } = await supabase.rpc(
      "get_workspace_credits_balance",
      { p_workspace_id: workspace.id } as never,
    );
    creditsBalance = (data as number | null) ?? 0;
  }

  const { data: plansData } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const plans = (plansData ?? []) as Plan[];
  const currentPlan = workspace?.plans as Plan | null | undefined;
  const quota = currentPlan?.monthly_credit_quota ?? 0;
  const usedCredits = Math.max(quota - creditsBalance, 0);
  const usagePercent = quota > 0 ? Math.min(100, Math.round((usedCredits / quota) * 100)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RaspaLead · Receita"
        title="Faturamento"
        description="Acompanhe o plano atual, a franquia de créditos e a estrutura de assinatura do seu workspace."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Current plan hero */}
        <Card className="border-2 border-border shadow-[4px_4px_0_#0a0a0a]">
          <CardContent className="p-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Plano ativo
                  </p>
                  <h2 className="font-display mt-2 text-4xl font-black uppercase tracking-tight text-foreground">
                    {currentPlan?.name ?? "Plano base"}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                    Créditos renovados mensalmente para sustentar a prospecção local e o enriquecimento progressivo da operação.
                  </p>
                </div>
                <Badge className="border border-border font-bold uppercase">Workspace ativo</Badge>
              </div>

              <div className="border border-border bg-[#EAF2FF] p-5">
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
                <div className="mt-4 h-2 overflow-hidden bg-white/60">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{usedCredits.toLocaleString("pt-BR")} consumidos</span>
                  <span>{quota.toLocaleString("pt-BR")} de franquia mensal</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard
            title="Plano atual"
            value={currentPlan?.name ?? "Plano base"}
            description="Ativo"
            icon={CreditCard}
          />
          <MetricCard
            title="Créditos restantes"
            value={creditsBalance.toLocaleString("pt-BR")}
            description={`de ${quota.toLocaleString("pt-BR")} este mês`}
            icon={Zap}
          />
          <MetricCard
            title="Renovação"
            value="Todo mês"
            description="Créditos renovam no dia 1"
            icon={CreditCard}
          />
        </div>
      </div>

      {/* Plans grid */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">
          Planos disponíveis
        </h2>
        {plans.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Nenhum plano disponível no momento"
            description="Assim que os planos forem publicados, você poderá comparar créditos, limites e recursos desta central."
            action={
              <Button asChild variant="outline" className="border-2 border-border shadow-[2px_2px_0_#0a0a0a]">
                <Link href="/dashboard">Voltar ao dashboard</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan?.id;
              const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];

              return (
                <Card
                  key={plan.id}
                  className={
                    isCurrent
                      ? "border-2 border-primary bg-[#EAF2FF] shadow-[4px_4px_0_#155EEF]"
                      : "border-2 border-border shadow-[3px_3px_0_#0a0a0a]"
                  }
                >
                  <CardHeader className="border-b border-border/20 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-black uppercase tracking-tight">{plan.name}</CardTitle>
                      {isCurrent && <Badge className="border border-border font-bold uppercase">Atual</Badge>}
                    </div>
                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="font-display text-3xl font-black tracking-tight">
                        {plan.price_brl === 0 ? "Grátis" : `R$ ${(plan.price_brl / 100).toFixed(0)}`}
                      </span>
                      {plan.price_brl > 0 && (
                        <span className="text-sm text-muted-foreground">/mês</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-1 border border-border/20 bg-muted/30 p-3 text-xs text-muted-foreground">
                      <p className="font-bold">{plan.monthly_credit_quota.toLocaleString("pt-BR")} créditos/mês</p>
                      <p>{plan.auto_enrich_top_n} leads enriquecidos/busca</p>
                      {plan.max_searches_per_month !== null && (
                        <p>Até {plan.max_searches_per_month} buscas/mês</p>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full border-2 border-border font-black uppercase"
                      variant={isCurrent ? "outline" : "default"}
                      size="sm"
                      disabled
                    >
                      {isCurrent ? "Plano atual" : "Assinar em breve"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}