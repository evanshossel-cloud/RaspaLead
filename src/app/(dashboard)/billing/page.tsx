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
        eyebrow="RaspaLead // Receita"
        title="Faturamento"
        description="Acompanhe o plano atual, a franquia de creditos e a estrutura de assinatura do seu workspace."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="relative p-6">
            <div className="pointer-events-none absolute left-0 top-0 h-36 w-36 rounded-full bg-primary/16 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Plano ativo
                  </p>
                  <h2 className="font-display mt-2 text-4xl font-bold tracking-[-0.04em] text-foreground">
                    {currentPlan?.name ?? "Plano base"}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                    Creditos renovados mensalmente para sustentar a prospeccao local e o enriquecimento progressivo da operacao.
                  </p>
                </div>
                <Badge variant="secondary">Workspace ativo</Badge>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Consumo de creditos
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
            title="Creditos restantes"
            value={creditsBalance.toLocaleString("pt-BR")}
            description={`de ${quota.toLocaleString("pt-BR")} este mes`}
            icon={Zap}
          />
          <MetricCard
            title="Renovacao"
            value="Todo mes"
            description="Creditos renovam no dia 1"
            icon={CreditCard}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Planos disponiveis
        </h2>
        {plans.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Nenhum plano disponivel no momento"
            description="Assim que os planos forem publicados, voce podera comparar creditos, limites e recursos desta central."
            action={
              <Button asChild variant="outline">
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
                <Card key={plan.id} className={isCurrent ? "glow-primary border-primary/30" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      {isCurrent && <Badge>Atual</Badge>}
                    </div>
                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="font-display text-3xl font-bold tracking-[-0.04em]">
                        {plan.price_brl === 0 ? "Gratis" : `R$ ${(plan.price_brl / 100).toFixed(0)}`}
                      </span>
                      {plan.price_brl > 0 && (
                        <span className="text-muted-foreground text-sm">/mes</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{plan.monthly_credit_quota.toLocaleString("pt-BR")} creditos/mes</p>
                      <p>{plan.auto_enrich_top_n} leads enriquecidos/busca</p>
                      {plan.max_searches_per_month !== null && (
                        <p>Ate {plan.max_searches_per_month} buscas/mes</p>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
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
