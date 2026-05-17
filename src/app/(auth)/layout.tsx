import type { Metadata } from "next";
import { ShieldCheck, Sparkles, Target } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Acesso",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/16 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/12 blur-3xl" />
        <div className="grid-overlay absolute inset-0 opacity-20" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 xl:grid-cols-[1fr_0.92fr]">
        <div className="hidden xl:block">
          <div className="space-y-6">
            <Logo className="w-fit" />
            <div className="space-y-4">
              <p className="font-data text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Command center de prospeccao
              </p>
              <h1 className="font-display max-w-2xl text-5xl font-bold tracking-[-0.05em] text-foreground">
                Prospecção local com densidade de cockpit e leitura executiva.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Entre para monitorar buscas reais, leads priorizados e a operacao em background do seu workspace com visual premium e foco B2B.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Motor ativo",
                  description: "Buscas reais com processamento em background.",
                  icon: Sparkles,
                },
                {
                  title: "Score tatico",
                  description: "Leads mockados com priorizacao pronta para evoluir.",
                  icon: Target,
                },
                {
                  title: "Acesso seguro",
                  description: "Auth Supabase, workspaces e isolamento por tenant.",
                  icon: ShieldCheck,
                },
              ].map(({ title, description, icon: Icon }) => (
                <div key={title} className="surface-panel rounded-2xl p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center xl:justify-end">{children}</div>
      </div>
    </div>
  );
}
