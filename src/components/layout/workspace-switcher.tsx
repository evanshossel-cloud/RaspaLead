"use client";

import { useTransition } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { switchWorkspaceAction } from "@/features/workspace/actions/switch-workspace";
import type { WorkspaceWithPlan } from "@/types/workspace";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceWithPlan[];
  currentWorkspaceId: string;
}

export function WorkspaceSwitcher({ workspaces, currentWorkspaceId }: WorkspaceSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const current = workspaces.find((w) => w.id === currentWorkspaceId);

  function handleSwitch(id: string) {
    if (id === currentWorkspaceId) return;
    startTransition(async () => {
      await switchWorkspaceAction(id);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-11 max-w-[280px] justify-start gap-3 rounded-xl px-3"
          disabled={isPending}
          aria-label="Trocar workspace"
        >
          <div className="glow-primary flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shrink-0">
            <span className="font-display text-xs font-bold text-primary">
              {current?.name?.charAt(0)?.toUpperCase() ?? "W"}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="font-data text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Workspace ativo
            </span>
            <span className="truncate text-sm font-medium text-foreground">
              {current?.name ?? "Workspace"}
            </span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>
          Workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => handleSwitch(ws.id)}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shrink-0">
              <span className="font-display text-xs font-bold text-primary">
                {ws.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{ws.name}</p>
              <p className="truncate text-xs text-muted-foreground">{ws.plans?.name ?? "Plano base"}</p>
            </div>
            {ws.id === currentWorkspaceId && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
