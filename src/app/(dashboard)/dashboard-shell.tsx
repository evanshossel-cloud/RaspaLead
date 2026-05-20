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
        {/* Subtle grid — barely visible in light mode */}
        <div className="pointer-events-none absolute inset-0 grid-overlay" />

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
