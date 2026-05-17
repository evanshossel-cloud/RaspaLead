"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Search,
  Users,
  Kanban,
  CreditCard,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Central", icon: LayoutDashboard },
  { href: "/searches", label: "Buscas", icon: Search },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/crm", label: "CRM", icon: Kanban, soon: true },
  { href: "/billing", label: "Faturamento", icon: CreditCard },
  { href: "/settings", label: "Configurações", icon: Settings },
];

interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r border-sidebar-border/80 bg-sidebar/95 backdrop-blur-xl transition-all duration-300 lg:static lg:z-auto lg:w-[72px] lg:hover:w-60",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-sidebar-border/70 px-4">
          <div className="overflow-hidden lg:w-[40px] lg:group-hover/sidebar:w-full lg:transition-all lg:duration-300">
            <Logo href="/dashboard" className="min-w-max" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-sidebar-foreground lg:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-3 pt-4 lg:px-2">
          <div className="glow-secondary flex items-center gap-3 rounded-2xl border border-secondary/15 bg-secondary/10 px-3 py-3 text-secondary lg:justify-center lg:px-0 lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:px-3">
            <Activity className="h-4 w-4 shrink-0" />
            <div className="overflow-hidden lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100 lg:transition-all">
              <p className="font-data text-[10px] uppercase tracking-[0.22em] text-secondary/80">
                Sistema
              </p>
              <p className="text-sm font-medium text-secondary">Operacional</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5 lg:px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 lg:justify-center lg:px-0 lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:px-3",
                  isActive
                    ? "glow-primary bg-sidebar-primary/14 text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 overflow-hidden lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100 lg:transition-all">
                  {item.label}
                </span>
                {item.soon && (
                  <Badge variant="secondary" className="hidden lg:group-hover/sidebar:inline-flex">
                    Em breve
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border/70 px-3 py-4 lg:px-2">
          <div className="rounded-2xl border border-border/70 bg-card/65 px-3 py-3 lg:px-0 lg:text-center lg:group-hover/sidebar:px-3 lg:group-hover/sidebar:text-left">
            <p className="font-data text-[10px] uppercase tracking-[0.22em] text-muted-foreground lg:hidden lg:group-hover/sidebar:block">
              RaspaLead
            </p>
            <p className="text-xs text-muted-foreground lg:hidden lg:group-hover/sidebar:block">
              Command center ativo
            </p>
            <span className="mx-auto mt-2 block h-2.5 w-2.5 rounded-full bg-[hsl(var(--success))] shadow-[0_0_16px_rgba(74,222,128,0.55)]" />
          </div>
        </div>
      </aside>
    </>
  );
}
