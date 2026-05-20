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
import { loginSchema, type LoginInput } from "../schemas/auth.schema";
import { loginAction } from "../actions/login";

export function LoginForm({ registered }: { registered?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", data.email);
      formData.set("password", data.password);

      const result = await loginAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="w-full max-w-md border-4 border-[#050505] bg-white shadow-[8px_8px_0_#050505]">
      <div className="border-b-4 border-[#050505] bg-[#EAF2FF] px-6 py-5">
        <p className="font-data text-[10px] font-black uppercase tracking-[0.22em] text-[#155EEF]">
          Acesso seguro
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-normal text-[#0F172A]">
          Entrar
        </h1>
        <p className="mt-1 text-sm font-bold text-[#475569]">
          {registered
            ? "Conta criada. Confirme seu e-mail e faca login."
            : "Acesse sua conta para continuar"}
        </p>
      </div>

      <div className="px-6 py-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-wide">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              className="border-[3px] border-[#050505] bg-white focus-visible:ring-[#155EEF]"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-wide">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              className="border-[3px] border-[#050505] bg-white focus-visible:ring-[#155EEF]"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full border-[3px] border-[#050505] bg-[#155EEF] font-black uppercase text-white shadow-[4px_4px_0_#050505]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm font-bold text-[#475569]">
          Nao tem uma conta?{" "}
          <Link href="/register" className="font-black text-[#155EEF] underline underline-offset-4">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
