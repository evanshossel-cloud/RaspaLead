import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { SearchAgentMockup } from "./search-agent-mockup";

const trustItems = ["Score comercial", "Exportacao Excel", "WhatsApp manual", "Enrichment", "Google Places ready"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] px-4 py-14 text-[#0F172A] md:px-6 md:py-20 lg:px-8">
      <div className="absolute left-0 top-24 h-12 w-32 rotate-[-12deg] border-4 border-[#050505] bg-[#EAF2FF]" />
      <div className="absolute right-[-32px] top-28 h-28 w-28 rotate-12 border-4 border-[#050505] bg-[#FFF3B0]" />
      <div className="absolute bottom-10 left-[8%] hidden h-20 w-20 rotate-6 border-4 border-[#050505] bg-[#E9FBEF] lg:block" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-6 inline-flex rounded-full border-[3px] border-[#050505] bg-[#EAF2FF] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#155EEF] shadow-[4px_4px_0_#050505]">
            Novo painel comercial para prospeccao local
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.88] tracking-normal">
            Voce ainda procura leads no escuro.
          </h1>

          <p className="mt-6 font-display text-3xl font-black leading-tight tracking-normal md:text-5xl">
            O RaspaLead mostra{" "}
            <span className="box-decoration-clone bg-[#FFF3B0] px-2">quem abordar primeiro.</span>
          </p>

          <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-black/72">
            Crie buscas por cidade, nicho e palavra-chave. O RaspaLead gera leads, calcula score,
            enriquece dados, cria mensagens sugeridas e exporta tudo para Excel.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border-4 border-[#050505] bg-[#155EEF] px-7 py-4 text-base font-black uppercase text-white shadow-[6px_6px_0_#050505] transition-transform hover:-translate-y-1"
            >
              Comecar gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border-4 border-[#050505] bg-white px-7 py-4 text-base font-black uppercase shadow-[6px_6px_0_#050505] transition-transform hover:-translate-y-1"
            >
              <PlayCircle className="h-5 w-5" />
              Ver como funciona
            </Link>
          </div>

          <div className="mt-8 flex max-w-3xl flex-wrap gap-2 rounded-[18px] border-4 border-[#050505] bg-white p-3 shadow-[6px_6px_0_#050505]">
            {trustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border-2 border-[#050505] bg-[#F8FAFC] px-3 py-2 text-xs font-black uppercase">
                <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <SearchAgentMockup />
      </div>
    </section>
  );
}
