import { Kanban, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CrmPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RaspaLead // Pipeline"
        title="CRM"
        description="O modulo de pipeline esta em preparacao para conectar prospeccao, abordagem e fechamento em uma unica visao."
      />

      <Card className="overflow-hidden">
        <CardContent className="relative p-6 md:p-8">
          <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full bg-primary/14 blur-3xl" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="glow-primary flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Kanban className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <Badge variant="secondary">Em breve</Badge>
                  <h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground">
                    Pipeline visual para a sua operacao comercial.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    O CRM da RaspaLead vai acompanhar cada lead desde a captura ate o fechamento, com visao kanban, lembretes e historico de abordagem.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button asChild>
                      <Link href="/searches/new">Criar nova busca</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/leads">Ver leads atuais</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Preparando a proxima camada do command center
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
              {[
                "Kanban por etapa",
                "Historico de contatos",
                "Alertas e follow-ups",
                "Pipeline customizavel",
              ].map((feature) => (
                <div key={feature} className="rounded-2xl border border-border/70 bg-background/55 p-4">
                  <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Modulo futuro
                  </p>
                  <p className="mt-3 font-medium text-foreground">{feature}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {["Entrada", "Qualificacao", "Fechamento"].map((column) => (
                <Card key={column} className="bg-background/55">
                  <CardHeader>
                    <CardTitle className="text-sm">{column}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="rounded-xl border border-border/70 bg-card/80 p-4 opacity-70 blur-[0.4px]">
                        <div className="h-3 w-24 rounded-full bg-muted/70" />
                        <div className="mt-3 h-2 w-40 rounded-full bg-muted/60" />
                        <div className="mt-2 h-2 w-28 rounded-full bg-muted/60" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
