import { Check, Minus, X } from "lucide-react";

const spreadsheetItems = ["Dados soltos", "Sem score", "Sem mensagem", "Sem diagnostico", "Trabalho manual"];
const raspaleadItems = ["Leads organizados", "Score comercial", "Enrichment", "Mensagem sugerida", "Exportacao pronta"];

export function EnrichmentSection() {
  return (
    <section className="bg-[#0B1220] px-4 py-16 text-white md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#93C5FD]">Comparacao honesta</p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-normal md:text-6xl">
            Nao e so uma lista. E uma operacao de prospeccao.
          </h2>
          <p className="mt-5 text-base font-bold leading-7 text-white/68">
            O RaspaLead organiza a coleta, mostra o contexto do lead e prepara o proximo passo sem fingir que o CRM avancado ja esta completo.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[20px] border-4 border-white bg-[#101828] p-5 shadow-[8px_8px_0_#CBD5E1]">
            <h3 className="font-display text-3xl font-black uppercase tracking-normal">Planilha comum</h3>
            <div className="mt-6 space-y-3">
              {spreadsheetItems.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-[12px] border-2 border-white/30 bg-black px-3 py-3">
                  {index === 0 ? <Minus className="h-5 w-5 text-[#FFF3B0]" /> : <X className="h-5 w-5 text-[#93C5FD]" />}
                  <span className="text-sm font-black uppercase text-white/76">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border-4 border-[#050505] bg-[#E9FBEF] p-5 text-[#0F172A] shadow-[8px_8px_0_#93C5FD]">
            <h3 className="font-display text-3xl font-black uppercase tracking-normal">RaspaLead</h3>
            <div className="mt-6 space-y-3">
              {raspaleadItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[12px] border-[3px] border-[#050505] bg-white px-3 py-3">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-black uppercase">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
