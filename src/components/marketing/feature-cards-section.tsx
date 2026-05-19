import { Bot, FileSpreadsheet, Globe2, MapPinned, MessageSquareText, Radar } from "lucide-react";

const features = [
  {
    title: "Busca local",
    description: "Cidade, nicho, bairro e palavra-chave viram uma busca estruturada.",
    icon: MapPinned,
    color: "bg-[#5ca8ff]",
  },
  {
    title: "Score comercial",
    description: "Priorize oportunidades com score bruto e score final apos enrichment.",
    icon: Radar,
    color: "bg-[#4fdf82]",
  },
  {
    title: "Enriquecimento",
    description: "Telefone, website, Maps URL e outros sinais quando a fonte permite.",
    icon: Bot,
    color: "bg-[#ffe34f]",
  },
  {
    title: "Website signals",
    description: "HTTPS, viewport, status HTTP, ano de copyright e tempo de resposta.",
    icon: Globe2,
    color: "bg-[#a984ff]",
  },
  {
    title: "Mensagem pronta",
    description: "Texto sugerido para abordagem manual, ainda sem OpenAI real na demo.",
    icon: MessageSquareText,
    color: "bg-[#ff4fa3]",
  },
  {
    title: "Exportacao XLSX",
    description: "Leads do workspace ou de uma busca saem organizados em Excel.",
    icon: FileSpreadsheet,
    color: "bg-[#ff9a3d]",
  },
];

export function FeatureCardsSection() {
  return (
    <section id="solucoes" className="bg-[#f5f1e8] px-4 py-16 text-black md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#6c35ff]">Stack de prospeccao</p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-normal md:text-6xl">
            Seis blocos para tirar lead da planilha morta
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon, color }) => (
            <article key={title} className={`${color} rounded-[18px] border-4 border-black p-6 shadow-[8px_8px_0_#000]`}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-3xl font-black uppercase tracking-normal">{title}</h3>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] border-black bg-white">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
              <p className="mt-8 text-base font-bold leading-7 text-black/72">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
