"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { WorkspaceWithPlan } from "@/types/workspace";

export function useWorkspace(workspaceId: string | undefined) {
  const [workspace, setWorkspace] = useState<WorkspaceWithPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("workspaces")
      .select("*, plans(*)")
      .eq("id", workspaceId)
      .single()
      .then(({ data }) => {
        setWorkspace(data);
        setLoading(false);
      });
  }, [workspaceId]);

  return { workspace, loading };
}
