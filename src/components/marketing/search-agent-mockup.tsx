import { ArrowUpRight, Download, MapPin, MessageSquareText, Search, Star, Target } from "lucide-react";

const filters = [
  ["Nicho", "Restaurante"],
  ["Cidade", "Brasilia/DF"],
  ["Fonte", "Mock / Google Places ready"],
  ["Objetivo", "Prospeccao comercial"],
];

const results = [
  { label: "Leads encontrados", value: "5", color: "bg-[#4fdf82]" },
  { label: "Score medio", value: "89", color: "bg-[#ffe34f]" },
  { label: "Com telefone", value: "5", color: "bg-[#ff9a3d]" },
  { label: "Exportacao", value: "XLSX", color: "bg-[#a984ff]" },
];

const leads = [
  { name: "Bistro Norte", score: 94, tag: "Site lento" },
  { name: "Cantina Solar", score: 88, tag: "WhatsApp pronto" },
  { name: "Casa do Sabor", score: 85, tag: "Enrichment OK" },
];

export function SearchAgentMockup() {
  return (
    <div className="rounded-[22px] border-4 border-black bg-white p-3 shadow-[10px_10px_0_#000] sm:p-5">
      <div className="flex items-center justify-between border-b-4 border-black pb-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-black bg-[#ff4fa3]" />
          <span className="h-3 w-3 rounded-full border-2 border-black bg-[#ffe34f]" />
          <span className="h-3 w-3 rounded-full border-2 border-black bg-[#4fdf82]" />
        </div>
        <span className="rounded-full border-2 border-black bg-[#111] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
          Demo ativa
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-[16px] border-[3px] border-black bg-[#fff8dc] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-black/60">
            <Search className="h-4 w-4" />
            Busca inteligente
          </div>
          <p className="font-display text-xl font-black leading-tight tracking-normal sm:text-2xl">
            Quero restaurantes em Brasilia com presenca digital fraca
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filters.map(([label, value]) => (
            <div key={label} className="rounded-[14px] border-[3px] border-black bg-white px-4 py-3 shadow-[4px_4px_0_#000]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/50">{label}</p>
              <p className="mt-1 text-sm font-black text-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {results.map((item) => (
            <div key={item.label} className={`${item.color} rounded-[14px] border-[3px] border-black p-3 shadow-[4px_4px_0_#000]`}>
              <p className="text-[10px] font-black uppercase leading-tight tracking-[0.12em] text-black/60">{item.label}</p>
              <p className="mt-2 font-display text-2xl font-black tracking-normal">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[18px] border-[3px] border-black bg-[#111] p-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">Fila priorizada</p>
            <Target className="h-5 w-5 text-[#ffe34f]" />
          </div>
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.name} className="flex items-center justify-between gap-3 rounded-[12px] border-2 border-white/25 bg-white px-3 py-3 text-black">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{lead.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-bold text-black/60">
                    <MapPin className="h-3 w-3" />
                    {lead.tag}
                  </p>
                </div>
                <span className="inline-flex min-w-14 items-center justify-center gap-1 rounded-full border-2 border-black bg-[#ffe34f] px-2 py-1 text-sm font-black">
                  <Star className="h-3 w-3 fill-black" />
                  {lead.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-[14px] border-[3px] border-black bg-[#4fdf82] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#000]">
            <MessageSquareText className="h-4 w-4" />
            Preparar abordagem
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-[14px] border-[3px] border-black bg-[#4f7cff] px-4 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0_#000]">
            <Download className="h-4 w-4" />
            Exportar lista
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
