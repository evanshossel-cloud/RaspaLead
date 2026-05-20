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
          <Button asChild className="border-2 border-border font-black uppercase shadow-[2px_2px_0_#0a0a0a]">
            <Link href="/searches/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova busca
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Buscas totais", value: searches.length, tone: "text-foreground", accent: "bg-card" },
          { label: "Em processamento", value: runningCount, tone: "text-primary", accent: "bg-[#EAF2FF]" },
          { label: "Concluídas", value: completedCount, tone: "text-success", accent: "bg-[#E9FBEF]" },
          { label: "Falharam", value: failedCount, tone: "text-destructive", accent: "bg-red-50" },
        ].map((item) => (
          <div key={item.label} className={`border-2 border-border p-5 shadow-[3px_3px_0_#0a0a0a] ${item.accent}`}>
            <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {item.label}
            </p>
            <p className={`font-display mt-3 text-4xl font-black tracking-tight ${item.tone}`}>
              {item.value.toLocaleString("pt-BR")}
            </p>
          </div>
        ))}
      </div>

      {searches.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhuma busca criada ainda"
          description="Crie sua primeira busca para encontrar empresas locais qualificadas e iniciar sua operação de prospecção."
          action={
            <Button asChild className="border-2 border-border font-black uppercase shadow-[2px_2px_0_#0a0a0a]">
              <Link href="/searches/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar nova busca
              </Link>
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden border-2 border-border shadow-[4px_4px_0_#0a0a0a]">
          <CardHeader className="border-b-2 border-border pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="font-black uppercase tracking-tight">Fila de buscas</CardTitle>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Cada busca representa uma operação de prospecção com processamento e leads vinculados.
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
            {/* Mobile cards */}
            <div className="space-y-3 p-4 md:hidden">
              {searches.map((search) => (
                <div key={search.id} className="border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{search.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatLocation(search)}</p>
                    </div>
                    <Badge variant={statusVariants[search.status]}>
                      {statusLabels[search.status]}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="border border-border bg-muted/40 p-3">
                      <p className="font-data text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Solicitados</p>
                      <p className="mt-1.5 text-lg font-black text-foreground">{search.quantity_requested}</p>
                    </div>
                    <div className="border border-border bg-[#EAF2FF] p-3">
                      <p className="font-data text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Encontrados</p>
                      <p className="mt-1.5 text-lg font-black text-primary">{search.quantity_found}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{search.niche ?? "Nicho não definido"}</span>
                      <span className="font-bold text-foreground">{search.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${search.progress}%` }}
                      />
                    </div>
                    <p className="font-data text-[11px] text-muted-foreground">
                      Criada em {formatDate(search.created_at)}
                    </p>
                  </div>

                  <Button asChild size="sm" variant="outline" className="mt-3 w-full border-2 border-border">
                    <Link href={`/searches/${search.id}`}>
                      <Eye className="h-4 w-4" />
                      Abrir detalhes
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Local</th>
                    <th>Nicho</th>
                    <th>Solicitados</th>
                    <th>Encontrados</th>
                    <th>Status</th>
                    <th>Progresso</th>
                    <th>Criada em</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {searches.map((search) => (
                    <tr key={search.id}>
                      <td>
                        <div className="font-semibold text-foreground">{search.name}</div>
                        {search.keyword && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            Palavra-chave: {search.keyword}
                          </div>
                        )}
                      </td>
                      <td className="text-muted-foreground">{formatLocation(search)}</td>
                      <td className="text-muted-foreground">{search.niche ?? "-"}</td>
                      <td className="font-data font-semibold">
                        {search.quantity_requested.toLocaleString("pt-BR")}
                      </td>
                      <td className="font-data font-bold text-primary">
                        {search.quantity_found.toLocaleString("pt-BR")}
                      </td>
                      <td>
                        <Badge variant={statusVariants[search.status]}>
                          {statusLabels[search.status]}
                        </Badge>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-data text-sm font-bold text-foreground">
                            {search.progress}%
                          </div>
                          <div className="h-1.5 w-28 overflow-hidden bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${search.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="font-data text-xs text-muted-foreground">
                        {formatDate(search.created_at)}
                      </td>
                      <td className="text-right">
                        <Button asChild size="sm" variant="outline" className="border-2 border-border">
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
