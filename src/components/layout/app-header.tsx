import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
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
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center gap-3 px-4 md:px-6 lg:px-8">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="hidden md:block">
          <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            RaspaLead
          </p>
          <p className="font-display text-lg font-semibold tracking-[-0.03em] text-foreground">
            Central de Prospecção
          </p>
        </div>
        <WorkspaceSwitcher
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/searches/new">
            <Plus className="h-4 w-4" />
            Nova busca
          </Link>
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative h-11 w-11 rounded-full p-0" aria-label="Menu do usuário">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? "Usuário"} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name ?? "Usuário"}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing">Faturamento</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-pointer text-destructive focus:text-destructive">
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
