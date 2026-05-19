import { ArrowRight, ClipboardList, DatabaseZap, FileDown, SlidersHorizontal } from "lucide-react";

const steps = [
  {
    title: "Configure a busca",
    description: "Cidade, nicho, palavra-chave e oferta entram como briefing comercial.",
    icon: SlidersHorizontal,
  },
  {
    title: "RaspaLead gera leads",
    description: "A busca roda em background com provider configuravel e diagnostico salvo.",
    icon: DatabaseZap,
  },
  {
    title: "Enriqueca e priorize",
    description: "Telefone, site, score e sinais de oportunidade ficam no detalhe do lead.",
    icon: ClipboardList,
  },
  {
    title: "Aborde e exporte",
    description: "Use mensagem sugerida para WhatsApp manual ou baixe XLSX.",
    icon: FileDown,
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-[#F8FAFC] px-4 py-16 text-[#0F172A] md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#059669]">Como funciona</p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-normal md:text-6xl">
              Da ideia de cliente ideal para uma fila de abordagem
            </h2>
          </div>
          <p className="max-w-md text-base font-bold leading-7 text-black/70">
            O fluxo ja existe no produto: busca, processamento, lead, enrichment, mensagem e exportacao.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <article key={title} className="relative rounded-[18px] border-4 border-[#050505] bg-white p-6 shadow-[8px_8px_0_#050505]">
              <div className="mb-8 flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#050505] bg-[#EAF2FF] font-display text-2xl font-black text-[#155EEF]">
                  {index + 1}
                </span>
                {index < steps.length - 1 ? <ArrowRight className="hidden h-7 w-7 lg:block" /> : null}
              </div>
              <Icon className="h-8 w-8" />
              <h3 className="mt-4 font-display text-2xl font-black uppercase tracking-normal">{title}</h3>
              <p className="mt-3 text-sm font-bold leading-6 text-black/68">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
