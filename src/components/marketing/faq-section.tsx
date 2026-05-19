const faqs = [
  {
    question: "O que e o RaspaLead?",
    answer: "E um SaaS de prospeccao local para criar buscas, organizar leads, priorizar oportunidades, preparar abordagem manual e exportar listas.",
  },
  {
    question: "De onde vem os leads?",
    answer: "A demo pode rodar com provider mock. O projeto tambem ja possui provider Google Places, que depende de API key configurada no servidor.",
  },
  {
    question: "A demo usa dados reais?",
    answer: "Por padrao, a demo usa dados simulados deterministicos para testar o fluxo sem custo externo. Dados reais dependem da configuracao do provider.",
  },
  {
    question: "Posso conectar Google Places?",
    answer: "Sim, a arquitetura suporta Google Places via variavel de ambiente e API key. A landing nao ativa nem consome essa integracao sozinha.",
  },
  {
    question: "Posso exportar para Excel?",
    answer: "Sim. O produto ja exporta leads em XLSX por workspace ou por busca especifica.",
  },
  {
    question: "O WhatsApp envia mensagens automaticamente?",
    answer: "Nao. O fluxo atual prepara mensagens e abre o link wa.me para envio manual, sem disparo automatico.",
  },
  {
    question: "O que significa enriquecer um lead?",
    answer: "E buscar ou consolidar sinais como telefone, website, Google Maps URL, status do site, responsividade e score tecnico quando disponiveis.",
  },
  {
    question: "O CRM ja esta pronto?",
    answer: "O app possui base para operar leads, mas CRM avancado, campanhas e automacoes outbound ainda estao no roadmap.",
  },
  {
    question: "Esta em conformidade com LGPD?",
    answer: "O produto deve ser usado com base legal adequada, respeito a opt-out e boas praticas de contato B2B. A validacao juridica final depende da operacao de cada cliente.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-[#fff8dc] px-4 py-16 text-black md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4fa3]">FAQ</p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-normal md:text-6xl">
            Perguntas que evitam confusao antes da demo
          </h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-[18px] border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
              <h3 className="font-display text-xl font-black uppercase leading-tight tracking-normal">{faq.question}</h3>
              <p className="mt-4 text-sm font-bold leading-6 text-black/68">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
