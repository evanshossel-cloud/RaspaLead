import Link from "next/link";
import { Activity, Eye, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoRefreshBadge } from "@/features/searches/components/auto-refresh-badge";
import { SearchesAutoRefresh } from "@/features/searches/components/searches-auto-refresh";
import type {
  LeadSearchRecord,
  LeadSearchStatus,
} from "@/features/searches/types";
import { getCurrentWorkspace } from "@/features/workspace/actions/get-current-workspace";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<LeadSearchStatus, string> = {
  pending: "Pendente",
  processing: "Processando",
  enriching: "Enriquecendo",
  completed: "Concluida",
  failed: "Falhou",
  canceled: "Cancelada",
};

const statusVariants: Record<
  LeadSearchStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  processing: "default",
  enriching: "default",
  completed: "outline",
  failed: "destructive",
  canceled: "outline",
};

function formatLocation(search: LeadSearchRecord) {
  const cityState = [search.city, search.state].filter(Boolean).join("/");
  return [cityState, search.neighborhood].filter(Boolean).join(" - ") || "-";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function SearchesPage() {
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  const { data } = workspace
    ? await supabase
        .from("lead_searches")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
    : { data: [] as LeadSearchRecord[] };

  const searches = (data ?? []) as LeadSearchRecord[];
  const hasRunningSearches = searches.some(
    (search) => search.status === "pending" || search.status === "processing",
  );
  const completedCount = searches.filter((search) => search.status === "completed").length;
  const runningCount = searches.filter(
    (search) => search.status === "pending" || search.status === "processing",
  ).length;
  const failedCount = searches.filter((search) => search.status === "failed").length;

  return (
    <div className="space-y-6">
      <SearchesAutoRefresh hasRunningSearches={hasRunningSearches} />

      <PageHeader
        eyebrow="RaspaLead // Operacao"
        title="Buscas"
        description="Monitore a esteira de extracao, acompanhe o progresso em tempo real e abra cada busca como uma operacao independente."
        action={
          <Button asChild>
            <Link href="/searches/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova busca
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Buscas totais", value: searches.length, tone: "text-foreground" },
          { label: "Em processamento", value: runningCount, tone: "text-secondary" },
          { label: "Concluidas", value: completedCount, tone: "text-[hsl(var(--success))]" },
          { label: "Falharam", value: failedCount, tone: "text-destructive" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {item.label}
              </p>
              <p className={`font-display mt-3 text-4xl font-bold tracking-[-0.04em] ${item.tone}`}>
                {item.value.toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {searches.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhuma busca criada ainda"
          description="Crie sua primeira busca para encontrar empresas locais qualificadas e iniciar sua operacao de prospeccao."
          action={
            <Button asChild>
              <Link href="/searches/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar nova busca
              </Link>
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base">Fila de buscas</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cada busca representa uma operacao de prospeccao com processamento e leads vinculados.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasRunningSearches ? <AutoRefreshBadge /> : (
                  <Badge variant="outline">
                    <Activity className="h-3.5 w-3.5" />
                    Sem filas ativas
                  </Badge>
                )}
                <Badge variant="outline">Workspace ativo</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 p-4 md:hidden">
              {searches.map((search) => (
                <Card key={search.id} className="overflow-hidden bg-background/60">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{search.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatLocation(search)}</p>
                      </div>
                      <Badge variant={statusVariants[search.status]}>
                        {statusLabels[search.status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border/70 bg-card/75 p-3">
                        <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Solicitados</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{search.quantity_requested}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-card/75 p-3">
                        <p className="font-data text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Encontrados</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{search.quantity_found}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{search.niche ?? "Nicho nao definido"}</span>
                        <span className="font-data text-foreground">{search.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                          style={{ width: `${search.progress}%` }}
                        />
                      </div>
                      <p className="font-data text-[11px] text-muted-foreground">
                        Criada em {formatDate(search.created_at)}
                      </p>
                    </div>

                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`/searches/${search.id}`}>
                        <Eye className="h-4 w-4" />
                        Abrir detalhes
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="data-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Local</th>
                    <th>Nicho</th>
                    <th>Quantidade solicitada</th>
                    <th>Encontrados</th>
                    <th>Status</th>
                    <th>Progresso</th>
                    <th>Criada em</th>
                    <th className="text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {searches.map((search) => (
                    <tr key={search.id}>
                      <td>
                        <div className="font-medium text-foreground">{search.name}</div>
                        {search.keyword && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Palavra-chave: {search.keyword}
                          </div>
                        )}
                      </td>
                      <td className="text-muted-foreground">{formatLocation(search)}</td>
                      <td className="text-muted-foreground">{search.niche ?? "-"}</td>
                      <td className="font-data">
                        {search.quantity_requested.toLocaleString("pt-BR")}
                      </td>
                      <td className="font-data">
                        {search.quantity_found.toLocaleString("pt-BR")}
                      </td>
                      <td>
                        <Badge variant={statusVariants[search.status]}>
                          {statusLabels[search.status]}
                        </Badge>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-data text-sm text-foreground">
                            {search.progress}%
                          </div>
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-muted/70">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                              style={{ width: `${search.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="font-data text-xs text-muted-foreground">
                        {formatDate(search.created_at)}
                      </td>
                      <td className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/searches/${search.id}`}>
                            <Eye className="h-4 w-4" />
                            Detalhes
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
