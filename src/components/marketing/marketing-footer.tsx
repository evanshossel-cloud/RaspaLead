import Link from "next/link";

const columns = [
  { title: "Produto", links: ["Landing", "Dashboard", "Buscas", "Leads"] },
  { title: "Recursos", links: ["Score", "Enrichment", "WhatsApp manual", "Exportacao XLSX"] },
  { title: "Legal", links: ["LGPD", "Privacidade", "Termos", "Uso responsavel"] },
  { title: "Contato", links: ["Beta", "Suporte", "Parcerias", "Roadmap"] },
];

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "RaspaLead";

export function MarketingFooter() {
  return (
    <footer className="border-t-4 border-black bg-black px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1.9fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[10px] border-[3px] border-white bg-[#ffe34f] text-black shadow-[4px_4px_0_#fff]">
              <span className="font-display text-2xl font-black tracking-normal">R</span>
            </span>
            <span className="font-display text-2xl font-black uppercase tracking-normal">{brandName}</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm font-bold leading-6 text-white/60">
            Prospecao local com busca, score, enrichment, mensagem sugerida e exportacao para equipes que querem operar sem bagunca.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#ffe34f]">{column.title}</h3>
              <div className="mt-4 space-y-3">
                {column.links.map((item) => (
                  <p key={item} className="text-sm font-bold text-white/65">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
