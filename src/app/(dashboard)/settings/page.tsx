"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Palette, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateWorkspaceAction } from "@/features/workspace/actions/update-workspace";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome muito curto"),
});

const workspaceSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  brand_name: z.string().optional(),
  default_offer: z.string().optional(),
  default_target_audience: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;
type WorkspaceInput = z.infer<typeof workspaceSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export default function SettingsPage() {
  const [isPendingProfile, startProfile] = useTransition();
  const [isPendingWorkspace, startWorkspace] = useTransition();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "" },
  });

  const workspaceForm = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      brand_name: "",
      default_offer: "",
      default_target_audience: "",
    },
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        const currentProfile = profile as Profile;
        profileForm.reset({ full_name: currentProfile.full_name ?? "" });
      }

      const { data: workspaces } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1);

      const currentWorkspace = (workspaces as Workspace[] | null)?.[0];
      if (currentWorkspace) {
        setWorkspaceId(currentWorkspace.id);
        workspaceForm.reset({
          name: currentWorkspace.name,
          brand_name: currentWorkspace.brand_name ?? "",
          default_offer: currentWorkspace.default_offer ?? "",
          default_target_audience: currentWorkspace.default_target_audience ?? "",
        });
      }
    });
  }, [profileForm, workspaceForm]);

  function onProfileSubmit(data: ProfileInput) {
    startProfile(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: data.full_name } as unknown as never)
        .eq("id", user.id);

      if (error) {
        toast.error("Erro ao atualizar perfil");
      } else {
        toast.success("Perfil atualizado com sucesso!");
      }
    });
  }

  function onWorkspaceSubmit(data: WorkspaceInput) {
    if (!workspaceId) return;
    startWorkspace(async () => {
      const formData = new FormData();
      formData.set("name", data.name);
      if (data.brand_name) formData.set("brand_name", data.brand_name);
      if (data.default_offer) formData.set("default_offer", data.default_offer);
      if (data.default_target_audience) {
        formData.set("default_target_audience", data.default_target_audience);
      }

      const result = await updateWorkspaceAction(workspaceId, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Workspace atualizado com sucesso!");
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RaspaLead / Preferencias"
        title="Configuracoes"
        description="Atualize seu perfil e refine o contexto padrao do workspace."
      />

      <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <Card>
          <CardHeader className="border-b-4 border-[#050505]">
            <CardTitle>Identidade visual</CardTitle>
            <CardDescription>
              Todo o produto segue a mesma identidade brutalist SaaS B2B clean da landing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="border-[3px] border-[#050505] bg-[#EAF2FF] p-4 shadow-[3px_3px_0_#050505]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border-[3px] border-[#050505] bg-white text-[#155EEF]">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-black uppercase text-[#0F172A]">
                    Brutalist SaaS B2B clean
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#475569]">
                    Fundo claro, CTA azul, sucesso em verde, amarelo suave e bordas pretas fortes.
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="outline">Tema unificado</Badge>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b-4 border-[#050505]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border-[3px] border-[#050505] bg-[#EAF2FF] text-[#155EEF]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Perfil</CardTitle>
                  <CardDescription>Seus dados de operador.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-[11px] font-black uppercase tracking-wide">
                    Nome completo
                  </Label>
                  <Input id="full_name" {...profileForm.register("full_name")} />
                  <FieldError message={profileForm.formState.errors.full_name?.message} />
                </div>
                <Button type="submit" disabled={isPendingProfile}>
                  {isPendingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar perfil"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-4 border-[#050505]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border-[3px] border-[#050505] bg-[#E9FBEF] text-[#059669]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Workspace</CardTitle>
                  <CardDescription>Contexto padrao usado para buscas futuras.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ws_name" className="text-[11px] font-black uppercase tracking-wide">
                    Nome do workspace
                  </Label>
                  <Input id="ws_name" {...workspaceForm.register("name")} />
                  <FieldError message={workspaceForm.formState.errors.name?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_name" className="text-[11px] font-black uppercase tracking-wide">
                    Marca ou empresa
                  </Label>
                  <Input
                    id="brand_name"
                    placeholder="Minha agencia"
                    {...workspaceForm.register("brand_name")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_offer" className="text-[11px] font-black uppercase tracking-wide">
                    Oferta padrao
                  </Label>
                  <Textarea
                    id="default_offer"
                    placeholder="Descreva o que voce oferece aos seus clientes..."
                    rows={4}
                    {...workspaceForm.register("default_offer")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_target_audience" className="text-[11px] font-black uppercase tracking-wide">
                    Publico-alvo padrao
                  </Label>
                  <Textarea
                    id="default_target_audience"
                    placeholder="Descreva o perfil do seu cliente ideal..."
                    rows={4}
                    {...workspaceForm.register("default_target_audience")}
                  />
                </div>

                <Button type="submit" disabled={isPendingWorkspace}>
                  {isPendingWorkspace ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar workspace"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
