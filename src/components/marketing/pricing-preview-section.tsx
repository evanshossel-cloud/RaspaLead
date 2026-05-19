import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Free / Beta",
    price: "R$ 0",
    note: "Demo atual com provider mock",
    features: ["Busca demo", "Leads simulados", "Exportacao XLSX", "Mensagem sugerida"],
    highlight: "bg-[#EAF2FF] text-[#155EEF]",
  },
  {
    name: "Starter",
    price: "Validacao",
    note: "Plano comercial em desenho",
    features: ["Mais buscas", "Workspace unico", "Fluxo manual", "Google Places opcional"],
    highlight: "bg-white",
  },
  {
    name: "Pro",
    price: "Validacao",
    note: "Para times pequenos",
    features: ["Mais volume", "Enrichment sob demanda", "Exportacao por busca", "Score calibrado"],
    highlight: "bg-[#155EEF] text-white",
  },
  {
    name: "Agency",
    price: "Validacao",
    note: "Para operacao multi-cliente",
    features: ["Workspaces", "Relatorios", "Controle de custo", "Roadmap white-label"],
    highlight: "bg-[#E9FBEF] text-[#059669]",
  },
];

export function PricingPreviewSection() {
  return (
    <section id="planos" className="bg-white px-4 py-16 text-[#0F172A] md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#155EEF]">Planos</p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-normal md:text-6xl">
              Pricing preview sem promessa torta
            </h2>
          </div>
          <p className="max-w-md text-base font-bold leading-7 text-black/70">
            Planos comerciais estao em validacao. Google Places pode ser ativado na versao real com API key.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-[20px] border-4 border-[#050505] bg-white p-5 shadow-[8px_8px_0_#050505]">
              <div className={`${plan.highlight} inline-flex rounded-full border-[3px] border-black px-3 py-1 text-xs font-black uppercase`}>
                {plan.name}
              </div>
              <p className="mt-6 font-display text-4xl font-black uppercase tracking-normal">{plan.price}</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-black/58">{plan.note}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 className="h-5 w-5 text-[#059669]" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[12px] border-[3px] border-[#050505] bg-[#155EEF] px-4 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0_#050505]"
              >
                Entrar na beta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
