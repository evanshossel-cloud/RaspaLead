"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema";
import { registerAction } from "../actions/register";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("full_name", data.full_name);
      formData.set("email", data.email);
      formData.set("password", data.password);

      const result = await registerAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="w-full max-w-md border-2 border-border bg-card shadow-[6px_6px_0_#0a0a0a]">
      {/* Header */}
      <div className="border-b-2 border-border bg-[#E9FBEF] px-6 py-5">
        <p className="font-data text-[10px] font-bold uppercase tracking-[0.22em] text-success">
          Onboarding do workspace
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-foreground">
          Criar conta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comece gratuitamente, sem cartão de crédito
        </p>
      </div>

      {/* Form body */}
      <div className="px-6 py-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="font-semibold uppercase text-[11px] tracking-wide">
              Nome completo
            </Label>
            <Input
              id="full_name"
              type="text"
              placeholder="João Silva"
              autoComplete="name"
              className="border-2 border-input focus-visible:border-primary focus-visible:ring-0"
              {...form.register("full_name")}
            />
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-semibold uppercase text-[11px] tracking-wide">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              className="border-2 border-input focus-visible:border-primary focus-visible:ring-0"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-semibold uppercase text-[11px] tracking-wide">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className="border-2 border-input focus-visible:border-primary focus-visible:ring-0"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full border-2 border-border font-black uppercase shadow-[3px_3px_0_#0a0a0a] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#0a0a0a]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta grátis"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-bold text-primary underline underline-offset-4 hover:text-primary/80">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
