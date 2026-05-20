import type { Metadata } from "next";
import { FileSpreadsheet, MapPinned, MessageCircle, ShieldCheck, Target } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Acesso",
};

const benefits = [
  {
    title: "Busca local",
    description: "Configure cidade, nicho e palavra-chave em um fluxo simples.",
    icon: MapPinned,
    accent: "bg-[#EAF2FF] text-[#155EEF]",
  },
  {
    title: "Score comercial",
    description: "Priorize oportunidades antes de abordar.",
    icon: Target,
    accent: "bg-[#E9FBEF] text-[#059669]",
  },
  {
    title: "Exportacao Excel",
    description: "Baixe listas organizadas em XLSX quando precisar.",
    icon: FileSpreadsheet,
    accent: "bg-[#FFF3B0] text-[#0F172A]",
  },
  {
    title: "WhatsApp manual",
    description: "Use mensagens sugeridas e links wa.me, sem disparo automatico.",
    icon: MessageCircle,
    accent: "bg-white text-[#0F172A]",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] px-4 py-8 text-[#0F172A] md:py-12">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-100" />
      <div className="pointer-events-none absolute right-[-72px] top-24 h-40 w-40 rotate-12 border-4 border-[#050505] bg-[#EAF2FF]" />
      <div className="pointer-events-none absolute bottom-10 left-[-48px] h-28 w-28 rotate-[-10deg] border-4 border-[#050505] bg-[#FFF3B0]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 xl:grid-cols-[1fr_0.82fr]">
        <section className="hidden xl:block">
          <div className="space-y-8">
            <Logo className="w-fit" />

            <div className="space-y-4">
              <p className="font-data text-[11px] font-black uppercase tracking-[0.24em] text-[#155EEF]">
                Prospecao local B2B
              </p>
              <h1 className="font-display max-w-2xl text-5xl font-black uppercase leading-[1.02] tracking-normal text-[#0F172A]">
                Entre para operar leads com a mesma identidade da landing.
              </h1>
              <p className="max-w-xl text-base font-bold leading-7 text-[#475569]">
                O RaspaLead une busca, score, enrichment, mensagem sugerida e exportacao em uma experiencia clara, forte e comercial.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map(({ title, description, icon: Icon, accent }) => (
                <article
                  key={title}
                  className="border-4 border-[#050505] bg-white p-5 shadow-[6px_6px_0_#050505]"
                >
                  <div className={`flex h-11 w-11 items-center justify-center border-[3px] border-[#050505] ${accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-lg font-black uppercase tracking-normal text-[#0F172A]">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#475569]">{description}</p>
                </article>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 border-[3px] border-[#050505] bg-[#E9FBEF] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#050505]">
              <ShieldCheck className="h-5 w-5 text-[#059669]" />
              Auth Supabase e workspaces isolados
            </div>
          </div>
        </section>

        <section className="flex justify-center xl:justify-end">{children}</section>
      </div>
    </div>
  );
}
