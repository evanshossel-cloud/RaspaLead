"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { WorkspaceWithPlan } from "@/types/workspace";

export async function getCurrentWorkspace(): Promise<WorkspaceWithPlan | null> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const activeId = cookieStore.get("active_workspace")?.value;

  const { data } = await supabase
    .from("workspaces")
    .select("*, plans(*)")
    .order("created_at", { ascending: true });

  const workspaces = (data ?? []) as WorkspaceWithPlan[];
  if (workspaces.length === 0) return null;

  const active = activeId ? workspaces.find((w) => w.id === activeId) : null;
  return active ?? workspaces[0] ?? null;
}

export async function getAllWorkspaces(): Promise<WorkspaceWithPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspaces")
    .select("*, plans(*)")
    .order("created_at", { ascending: true });

  return (data ?? []) as WorkspaceWithPlan[];
}
