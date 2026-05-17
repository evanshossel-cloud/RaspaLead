import type { Database } from "./database";

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

export type WorkspaceWithPlan = Workspace & {
  plans: Plan | null;
};

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
