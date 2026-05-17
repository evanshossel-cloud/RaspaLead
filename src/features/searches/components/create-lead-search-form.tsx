"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Radar, Search, Sparkles, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLeadSearchAction } from "../actions/create-lead-search";
import {
  createLeadSearchSchema,
  type CreateLeadSearchInput,
} from "../schemas/create-lead-search-schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-sm text-destructive">{message}</p>;
}

export function CreateLeadSearchForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateLeadSearchInput>({
    resolver: zodResolver(createLeadSearchSchema),
    defaultValues: {
      name: "",
      state: "",
      city: "",
      neighborhood: "",
      niche: "",
      keyword: "",
      quantity_requested: 50,
      user_offer: "",
      target_customer_profile: "",
    },
  });

  const quantity = form.watch("quantity_requested") || 0;
  const niche = form.watch("niche") || "Nicho";
  const city = form.watch("city") || "Cidade";
  const offer = form.watch("user_offer") || "Sua oferta padrao sera usada como contexto da operacao.";

  function onSubmit(data: CreateLeadSearchInput) {
    form.clearErrors();

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", data.name);
      formData.set("state", data.state);
      formData.set("city", data.city);
      formData.set("neighborhood", data.neighborhood ?? "");
      formData.set("niche", data.niche);
      formData.set("keyword", data.keyword ?? "");
      formData.set("quantity_requested", String(data.quantity_requested));
      formData.set("user_offer", data.user_offer ?? "");
      formData.set(
        "target_customer_profile",
        data.target_customer_profile ?? "",
      );

      const result = await createLeadSearchAction(formData);

      if (result?.fieldErrors) {
        for (const [field, errors] of Object.entries(result.fieldErrors)) {
          const message = errors?.[0];
          if (!message) continue;

          form.setError(field as keyof CreateLeadSearchInput, { message });
        }
      }

      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-primary" />
                Parametros da busca
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm leading-6">
                Configure o territorio, o nicho e o contexto comercial. Assim que a busca for criada, o processamento acontecera em background e os leads mockados aparecerao automaticamente nas telas de operacao.
              </CardDescription>
            </div>
            <Badge variant="secondary">Processamento em segundo plano</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da busca</Label>
              <Input
                id="name"
                placeholder="Ex: Restaurantes em Campinas - Maio"
                {...form.register("name")}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="SP" {...form.register("state")} />
                <FieldError message={form.formState.errors.state?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Campinas" {...form.register("city")} />
                <FieldError message={form.formState.errors.city?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro opcional</Label>
              <Input
                id="neighborhood"
                placeholder="Cambui"
                {...form.register("neighborhood")}
              />
              <FieldError message={form.formState.errors.neighborhood?.message} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="niche">Nicho</Label>
                <Input
                  id="niche"
                  placeholder="Clinica odontologica"
                  {...form.register("niche")}
                />
                <FieldError message={form.formState.errors.niche?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyword">Palavra-chave opcional</Label>
                <Input
                  id="keyword"
                  placeholder="dentista infantil"
                  {...form.register("keyword")}
                />
                <FieldError message={form.formState.errors.keyword?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_requested">Quantidade de leads</Label>
              <Input
                id="quantity_requested"
                type="number"
                min={10}
                max={300}
                {...form.register("quantity_requested", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Escolha entre 10 e 300 leads por operacao.
              </p>
              <FieldError message={form.formState.errors.quantity_requested?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_offer">O que voce vende?</Label>
              <Textarea
                id="user_offer"
                rows={4}
                placeholder="Descreva sua oferta para dar contexto a busca."
                {...form.register("user_offer")}
              />
              <FieldError message={form.formState.errors.user_offer?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_customer_profile">Perfil de cliente ideal</Label>
              <Textarea
                id="target_customer_profile"
                rows={4}
                placeholder="Ex: negocios com pouca presenca digital e potencial de contratacao."
                {...form.register("target_customer_profile")}
              />
              <FieldError message={form.formState.errors.target_customer_profile?.message} />
            </div>

            <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando busca...
                  </>
                ) : (
                  <>
                    Criar busca
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/searches")}
                disabled={isPending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview operacional</CardTitle>
            <CardDescription>
              Um resumo do alvo atual antes de disparar o job de prospeccao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Nicho / Regiao
              </p>
              <p className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {niche} em {city}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Radar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Volume pedido</p>
                    <p className="text-xs text-muted-foreground">Saida inicial</p>
                  </div>
                </div>
                <p className="font-display mt-4 text-3xl font-bold tracking-[-0.04em] text-foreground">
                  {quantity || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/12 text-secondary">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Perfil desejado</p>
                    <p className="text-xs text-muted-foreground">Contexto comercial</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {form.watch("target_customer_profile") || "Descreva o perfil ideal para aumentar a qualidade dos leads gerados."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Oferta usada na operacao</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{offer}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">O que acontece depois</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "A busca e salva no workspace ativo.",
              "O evento e enviado para o Inngest em background.",
              "O status vai de pendente para processando automaticamente.",
              "Cinco leads mockados sao criados e vinculados a busca.",
            ].map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl border border-border/70 bg-background/60 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 font-data text-xs text-primary">
                  0{index + 1}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
