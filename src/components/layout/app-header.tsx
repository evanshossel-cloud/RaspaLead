import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { logoutAction } from "@/features/auth/actions/logout";
import type { WorkspaceWithPlan } from "@/types/workspace";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AppHeaderProps {
  profile: Profile | null;
  workspaces: WorkspaceWithPlan[];
  currentWorkspaceId: string;
  onMenuClick?: () => void;
}

export function AppHeader({
  profile,
  workspaces,
  currentWorkspaceId,
  onMenuClick,
}: AppHeaderProps) {
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile?.email?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 border-b-4 border-[#050505] bg-[#FFFDF3] text-[#0F172A]">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 border-[3px] border-[#050505] bg-white shadow-[3px_3px_0_#050505] lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="hidden md:block">
            <p className="font-data text-[10px] font-black uppercase tracking-[0.22em] text-[#155EEF]">
              RaspaLead
            </p>
            <p className="font-display text-base font-black uppercase tracking-normal text-[#0F172A]">
              Central de Prospecao
            </p>
          </div>
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspaceId={currentWorkspaceId}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className="hidden border-[3px] border-[#050505] bg-[#155EEF] font-black uppercase text-white shadow-[3px_3px_0_#050505] sm:inline-flex"
          >
            <Link href="/searches/new">
              <Plus className="h-4 w-4" />
              Nova busca
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-11 w-11 border-[3px] border-[#050505] bg-white p-0 shadow-[3px_3px_0_#050505]"
                aria-label="Menu do usuario"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? "Usuario"} />
                  <AvatarFallback className="bg-[#EAF2FF] text-xs font-black text-[#155EEF]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-[3px] border-[#050505] bg-white shadow-[5px_5px_0_#050505]">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black leading-none">{profile?.full_name ?? "Usuario"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Configuracoes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing">Faturamento</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logoutAction}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer text-left text-destructive">
                    Sair
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
