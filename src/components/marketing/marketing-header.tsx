import Link from "next/link";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "RaspaLead";

const menuItems = [
  { label: "Solucoes", href: "#solucoes" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

const tickerItems = [
  "Busca local com provider configuravel",
  "Leads prontos para WhatsApp manual e Excel",
  "Score comercial para priorizar oportunidades",
  "Demo com dados simulados, pronta para Google Places via API key",
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#050505] bg-[#FFFDF3] text-[#0F172A]">
      <div className="border-b-4 border-[#050505] bg-[#EAF2FF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#0B1220] sm:text-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-7 gap-y-2 overflow-hidden">
          {tickerItems.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 whitespace-nowrap">
              <Sparkles className="h-4 w-4 text-[#155EEF]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <Link href="/" className="flex min-w-fit items-center gap-3" aria-label="RaspaLead home">
          <span className="grid h-12 w-12 place-items-center rounded-[10px] border-4 border-[#050505] bg-[#155EEF] text-white shadow-[5px_5px_0_#050505]">
            <span className="font-display text-2xl font-black tracking-normal">R</span>
          </span>
          <span>
            <span className="block font-display text-xl font-black uppercase leading-none tracking-normal sm:text-2xl">
              {brandName}
            </span>
            <span className="hidden text-[10px] font-black uppercase tracking-[0.22em] text-black/60 sm:block">
              Prospecao local B2B
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-black uppercase tracking-[0.08em] lg:flex">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#155EEF]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden items-center justify-center gap-2 rounded-[10px] border-[3px] border-[#050505] bg-white px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#050505] transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border-[3px] border-[#050505] bg-[#155EEF] px-4 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0_#050505] transition-transform hover:-translate-y-0.5 sm:px-5"
          >
            Testar gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
