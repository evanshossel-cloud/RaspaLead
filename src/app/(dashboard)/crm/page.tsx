import Link from "next/link";
import { Bell, Kanban, MessageSquareText, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const futureFeatures = [
  "Kanban por etapa",
  "Historico de contatos",
  "Alertas e follow-ups",
  "Pipeline customizavel",
];

export default function CrmPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RaspaLead / Pipeline"
        title="CRM visual em breve"
        description="O CRM avancado ainda e roadmap. Por enquanto, use leads, mensagens sugeridas e exportacao para operar a prospeccao."
        action={
          <Button asChild className="border-[3px] border-[#050505] bg-[#155EEF] font-black uppercase text-white shadow-[4px_4px_0_#050505]">
            <Link href="/leads">Voltar aos leads</Link>
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-5">
              <div className="flex h-16 w-16 items-center justify-center border-4 border-[#050505] bg-[#EAF2FF] shadow-[4px_4px_0_#050505]">
                <Kanban className="h-8 w-8 text-[#155EEF]" />
              </div>
              <div>
                <Badge className="border-[3px] border-[#050505] bg-[#FFF3B0] font-black uppercase text-[#0F172A]">
                  Em breve
                </Badge>
                <h2 className="font-display mt-4 text-3xl font-black uppercase tracking-normal text-[#0F172A]">
                  Pipeline visual para fechar o ciclo comercial.
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[#475569]">
                  A base operacional ja esta pronta: buscas, leads, score, enrichment, mensagens e exportacao. O CRM visual entra como a proxima camada.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="border-[3px] border-[#050505] bg-[#155EEF] font-black uppercase text-white shadow-[3px_3px_0_#050505]">
                  <Link href="/searches/new">Criar nova busca</Link>
                </Button>
                <Button asChild variant="outline" className="border-[3px] border-[#050505] bg-white font-black uppercase shadow-[3px_3px_0_#050505]">
                  <Link href="/leads">Ver leads atuais</Link>
                </Button>
              </div>
            </div>

            <div className="border-4 border-[#050505] bg-[#FFFDF3] p-5 shadow-[6px_6px_0_#050505]">
              <div className="flex items-center gap-2 font-black uppercase text-[#0F172A]">
                <Sparkles className="h-5 w-5 text-[#155EEF]" />
                Recursos planejados
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {futureFeatures.map((feature) => (
                  <div key={feature} className="border-[3px] border-[#050505] bg-white p-4">
                    <p className="font-data text-[10px] font-black uppercase tracking-[0.18em] text-[#155EEF]">
                      Roadmap
                    </p>
                    <p className="mt-2 font-black text-[#0F172A]">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { column: "Entrada", icon: MessageSquareText, accent: "bg-[#EAF2FF]" },
          { column: "Qualificacao", icon: Bell, accent: "bg-[#FFF3B0]" },
          { column: "Fechamento", icon: Kanban, accent: "bg-[#E9FBEF]" },
        ].map(({ column, icon: Icon, accent }) => (
          <Card key={column} className={accent}>
            <CardHeader className="border-b-4 border-[#050505]">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-normal">
                <Icon className="h-4 w-4" />
                {column}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border-[3px] border-[#050505] bg-white p-4 opacity-70">
                  <div className="h-3 w-24 bg-[#CBD5E1]" />
                  <div className="mt-3 h-2 w-40 bg-[#E2E8F0]" />
                  <div className="mt-2 h-2 w-28 bg-[#E2E8F0]" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
