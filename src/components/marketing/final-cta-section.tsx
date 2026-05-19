import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="bg-[#FFFDF3] px-4 py-16 text-[#0F172A] md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[24px] border-4 border-[#050505] bg-[#EAF2FF] p-8 shadow-[10px_10px_0_#050505] md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-none tracking-normal md:text-6xl">
              Pare de cacar leads no escuro.
            </h2>
            <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-black/72">
              Crie sua primeira busca, veja os leads, gere abordagens e exporte sua lista em poucos minutos.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border-4 border-[#050505] bg-[#155EEF] px-7 py-4 text-base font-black uppercase text-white shadow-[6px_6px_0_#050505]"
            >
              Comecar gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border-4 border-[#050505] bg-white px-7 py-4 text-base font-black uppercase shadow-[6px_6px_0_#050505]"
            >
              <LogIn className="h-5 w-5" />
              Acessar login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
