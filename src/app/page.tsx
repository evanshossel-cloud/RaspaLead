import Link from "next/link";
import { ArrowRight, Radar, Sparkles, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "RaspaLead";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-primary/16 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-secondary/12 blur-3xl" />
        <div className="grid-overlay absolute inset-0 opacity-20" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 md:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="font-display text-2xl font-bold tracking-[-0.04em] text-foreground">
              {brandName}
            </p>
            <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Central de prospeccao local
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Fazer login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Comecar gratis</Link>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <div className="space-y-5">
              <Badge variant="secondary">Command center de prospeccao</Badge>
              <h1 className="font-display max-w-4xl text-5xl font-bold tracking-[-0.06em] text-foreground md:text-7xl">
                Prospecção local com estética premium e densidade operacional.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                Crie buscas reais, acompanhe o processamento em background, centralize seus leads e opere com a mesma clareza visual de um cockpit executivo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Iniciar workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Acessar central</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Buscas locais",
                  description: "Prospecao por cidade, bairro e nicho em estrutura multi-tenant.",
                  icon: Radar,
                },
                {
                  title: "Score tatico",
                  description: "Leitura imediata de prioridades com visual de command center.",
                  icon: Target,
                },
                {
                  title: "Pipeline pronto",
                  description: "Motor de background, dashboard em tempo real e proximo passo para CRM.",
                  icon: Sparkles,
                },
              ].map(({ title, description, icon: Icon }) => (
                <Card key={title}>
                  <CardContent className="p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-foreground">
                      {title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <Card className="overflow-hidden">
              <CardContent className="relative p-6">
                <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-primary/16 blur-3xl" />
                <div className="relative space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-data text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Preview da central
                      </p>
                      <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground">
                        Operacao em tempo real
                      </h2>
                    </div>
                    <Badge>Live</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: "Buscas ativas", value: "12", icon: Radar },
                      { label: "Creditos restantes", value: "2.480", icon: Zap },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="rounded-2xl border border-border/70 bg-background/60 p-5">
                        <div className="flex items-center justify-between">
                          <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </p>
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <p className="font-display mt-4 text-4xl font-bold tracking-[-0.04em] text-foreground">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Restaurantes em Campinas</span>
                      <span>84%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/70">
                      <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-primary to-secondary" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {["Lead score priorizado", "Atualizacao automatica", "Background jobs ativos"].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-xl border border-border/70 bg-card/75 px-4 py-3">
                          <span className="text-sm text-foreground">{item}</span>
                          <Badge variant="outline">OK</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
