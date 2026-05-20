"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CreditCard,
  Kanban,
  LayoutDashboard,
  Search,
  Settings,
  Users,
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
  { href: "/settings", label: "Configuracoes", icon: Settings },
];

interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0B1220]/45 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r-4 border-[#050505] bg-white transition-all duration-300 lg:static lg:z-auto lg:w-[82px] lg:hover:w-64",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b-4 border-[#050505] px-4">
          <div className="overflow-hidden lg:w-[42px] lg:transition-all lg:duration-300 lg:group-hover/sidebar:w-full">
            <Logo href="/dashboard" className="min-w-max" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 lg:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-3 pt-4 lg:px-2">
          <div className="flex items-center gap-3 border-[3px] border-[#050505] bg-[#E9FBEF] px-3 py-3 text-[#059669] shadow-[3px_3px_0_#050505] lg:justify-center lg:px-0 lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:px-3">
            <Activity className="h-4 w-4 shrink-0" />
            <div className="overflow-hidden lg:w-0 lg:opacity-0 lg:transition-all lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100">
              <p className="font-data text-[10px] font-black uppercase tracking-[0.22em] text-[#059669]">
                Sistema
              </p>
              <p className="text-sm font-black text-[#0F172A]">Operacional</p>
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
                  "flex items-center gap-3 border-[3px] px-3 py-3 text-sm font-black uppercase transition-all duration-150 lg:justify-center lg:px-0 lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:px-3",
                  isActive
                    ? "border-[#050505] bg-[#EAF2FF] text-[#155EEF] shadow-[3px_3px_0_#050505]"
                    : "border-transparent text-[#334155] hover:border-[#050505] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 overflow-hidden lg:w-0 lg:opacity-0 lg:transition-all lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100">
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

        <div className="border-t-4 border-[#050505] px-3 py-4 lg:px-2">
          <div className="border-[3px] border-[#050505] bg-[#FFFDF3] px-3 py-3 lg:px-0 lg:text-center lg:group-hover/sidebar:px-3 lg:group-hover/sidebar:text-left">
            <p className="font-data text-[10px] font-black uppercase tracking-[0.22em] text-[#155EEF] lg:hidden lg:group-hover/sidebar:block">
              RaspaLead
            </p>
            <p className="text-xs font-bold text-[#475569] lg:hidden lg:group-hover/sidebar:block">
              Motor ativo
            </p>
            <span className="mx-auto mt-2 block h-2.5 w-2.5 bg-[#059669]" />
          </div>
        </div>
      </aside>
    </>
  );
}
