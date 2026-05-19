import { FileSpreadsheet, MessageCircle, Timer, Trophy } from "lucide-react";

const stats = [
  { label: "Leads por busca demo", value: "5", icon: Timer },
  { label: "Exportavel para Excel", value: "100%", icon: FileSpreadsheet },
  { label: "Mensagens para WhatsApp manual", value: "Prontas", icon: MessageCircle },
  { label: "Score para priorizar oportunidades", value: "Ativo", icon: Trophy },
];

export function StatsSection() {
  return (
    <section className="bg-[#0B1220] px-4 py-16 text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#93C5FD]">Impacto operacional</p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-normal md:text-6xl">
            O que sua operacao ganha
          </h2>
          <p className="mt-4 text-base font-bold leading-7 text-white/65">
            Nada de numeros inflados de producao. Esta secao mostra ganhos reais do fluxo atual de produto e demo.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-[18px] border-[3px] border-[#93C5FD] bg-[#101828] p-6 shadow-[7px_7px_0_#1D4ED8]">
              <Icon className="h-8 w-8 text-[#93C5FD]" />
              <p className="mt-8 font-display text-4xl font-black tracking-normal text-[#EAF2FF]">{value}</p>
              <p className="mt-3 text-sm font-black uppercase leading-5 tracking-[0.08em] text-white/72">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
