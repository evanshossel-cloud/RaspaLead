"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import type { WorkspaceWithPlan } from "@/types/workspace";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface DashboardShellProps {
  children: React.ReactNode;
  profile: Profile | null;
  workspaces: WorkspaceWithPlan[];
  currentWorkspaceId: string;
}

export function DashboardShell({
  children,
  profile,
  workspaces,
  currentWorkspaceId,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-foreground">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden lg:ml-0">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-[-12rem] h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute right-[-8rem] top-32 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
          <div className="grid-overlay absolute inset-0 opacity-20" />
        </div>

        <AppHeader
          profile={profile}
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="scrollbar-thin relative flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
