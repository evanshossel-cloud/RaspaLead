"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { Loader2, Moon, Sparkles, Sun, UserRound, Zap } from "lucide-react";
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

const themes = [
  { value: "dark", label: "Noturno", icon: Moon, tone: "text-primary" },
  { value: "light", label: "Claro", icon: Sun, tone: "text-secondary" },
  { value: "yellow", label: "Destaque", icon: Zap, tone: "text-[hsl(var(--warning))]" },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-sm text-destructive">{message}</p>;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
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

  function onThemeChange(newTheme: string) {
    setTheme(newTheme);
    startProfile(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ preferred_theme: newTheme as "dark" | "light" | "yellow" } as unknown as never)
        .eq("id", user.id);
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
        eyebrow="RaspaLead // Preferencias"
        title="Configurações"
        description="Ajuste o visual da central, atualize seu perfil e refine o contexto padrao do workspace."
      />

      <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tema da interface</CardTitle>
            <CardDescription>
              Escolha a leitura visual da sua central de prospeccao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {themes.map(({ value, label, icon: Icon, tone }) => {
              const isActive = theme === value;

              return (
                <button
                  key={value}
                  onClick={() => onThemeChange(value)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? "glow-primary border-primary/30 bg-primary/10"
                      : "border-border/70 bg-background/60 hover:border-primary/20 hover:bg-background/80"
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/60 ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {value === "dark"
                        ? "Visual premium com foco operacional."
                        : value === "light"
                          ? "Leitura clara para ambientes luminosos."
                          : "Modo com foco em destaque visual."}
                    </p>
                  </div>
                  {isActive && <Badge>Ativo</Badge>}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Perfil</CardTitle>
                  <CardDescription>Seus dados de operador.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome completo</Label>
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
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Workspace</CardTitle>
                  <CardDescription>
                    Contexto padrao usado para buscas futuras.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ws_name">Nome do workspace</Label>
                  <Input id="ws_name" {...workspaceForm.register("name")} />
                  <FieldError message={workspaceForm.formState.errors.name?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_name">Marca ou empresa</Label>
                  <Input
                    id="brand_name"
                    placeholder="Minha agencia"
                    {...workspaceForm.register("brand_name")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_offer">Oferta padrao</Label>
                  <Textarea
                    id="default_offer"
                    placeholder="Descreva o que voce oferece aos seus clientes..."
                    rows={4}
                    {...workspaceForm.register("default_offer")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_target_audience">Publico-alvo padrao</Label>
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
