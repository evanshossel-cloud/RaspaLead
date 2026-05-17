-- =============================================
-- XGryd Leads — Schema Completo Fase 1
-- Execute no SQL Editor do Supabase na ordem abaixo
-- =============================================

-- 5.1 Extensões
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================
-- 5.2 Tabela profiles
-- =============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  preferred_theme text default 'dark' check (preferred_theme in ('dark', 'light', 'yellow')),
  locale text default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_email on public.profiles(email);

-- =============================================
-- 5.3 Tabela workspaces
-- =============================================
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  brand_name text,
  brand_logo_url text,
  brand_primary_color text,

  default_offer text,
  default_target_audience text,

  plan_id uuid,
  current_period_starts_at timestamptz not null default date_trunc('month', now()),
  current_period_ends_at timestamptz not null default (date_trunc('month', now()) + interval '1 month'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_workspaces_owner on public.workspaces(owner_id);
create index idx_workspaces_slug on public.workspaces(slug);

-- =============================================
-- 5.4 Tabela workspace_members
-- =============================================
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member', 'viewer')),
  invited_by uuid references auth.users(id),
  joined_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index idx_workspace_members_workspace on public.workspace_members(workspace_id);
create index idx_workspace_members_user on public.workspace_members(user_id);

-- =============================================
-- 5.5 Tabela plans + Seeds
-- =============================================
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  price_brl integer not null default 0,
  monthly_credit_quota integer not null,
  auto_enrich_top_n integer not null default 0,
  max_searches_per_month integer,
  features jsonb default '[]'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.plans (code, name, description, price_brl, monthly_credit_quota, auto_enrich_top_n, max_searches_per_month, display_order, features) values
  ('free', 'Free / Beta', 'Para testar a plataforma', 0, 100, 10, 5, 1,
    '["Busca local", "10 leads enriquecidos por busca", "Exportação CSV"]'::jsonb),
  ('starter', 'Starter', 'Para freelancers e profissionais autônomos', 4700, 500, 25, 30, 2,
    '["Tudo do Free", "25 leads enriquecidos por busca", "Mensagens com IA", "Exportação XLSX"]'::jsonb),
  ('pro', 'Pro', 'Para consultores e pequenas operações', 9700, 2000, 100, 100, 3,
    '["Tudo do Starter", "100 leads enriquecidos por busca", "Score avançado", "CRM completo"]'::jsonb),
  ('agency', 'Agency', 'Para agências e operações maiores', 39700, 20000, 300, 500, 4,
    '["Tudo do Pro", "300 leads enriquecidos por busca", "Multi-cliente", "White label", "API"]'::jsonb);

alter table public.workspaces
  add constraint workspaces_plan_id_fkey
  foreign key (plan_id) references public.plans(id);

-- =============================================
-- 5.6 Tabela subscriptions
-- =============================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  started_at timestamptz not null default now(),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '1 month'),
  canceled_at timestamptz,
  external_provider text,
  external_subscription_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_workspace on public.subscriptions(workspace_id);
create index idx_subscriptions_status on public.subscriptions(status);

-- =============================================
-- 5.7 Tabela lead_searches
-- =============================================
create table public.lead_searches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  name text not null,
  state text,
  city text,
  neighborhood text,
  niche text,
  keyword text,
  quantity_requested integer not null default 100,
  user_offer text,
  target_customer_profile text,
  scoring_strategy text not null default 'default',
  status text not null default 'pending' check (status in ('pending', 'processing', 'enriching', 'completed', 'failed', 'canceled')),
  progress integer not null default 0 check (progress between 0 and 100),
  quantity_found integer not null default 0,
  quantity_enriched integer not null default 0,
  inngest_run_id text,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index idx_lead_searches_workspace on public.lead_searches(workspace_id);
create index idx_lead_searches_status on public.lead_searches(status);
create index idx_lead_searches_created on public.lead_searches(created_at desc);

-- =============================================
-- 5.8 Tabela leads
-- =============================================
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  search_id uuid references public.lead_searches(id) on delete set null,
  place_id text,
  company_name text not null,
  category text,
  phone text,
  phone_normalized text,
  whatsapp text,
  email text,
  website text,
  google_maps_url text,
  address text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  latitude numeric,
  longitude numeric,
  rating numeric,
  review_count integer,
  raw_score integer not null default 0,
  final_score integer not null default 0,
  status text not null default 'new' check (status in ('new', 'selected', 'message_ready', 'message_sent', 'replied', 'interested', 'meeting_scheduled', 'closed_won', 'closed_lost')),
  enrichment_status text not null default 'not_enriched' check (enrichment_status in ('not_enriched', 'queued', 'processing', 'enriched', 'failed', 'skipped')),
  enrichment_requested_at timestamptz,
  enriched_at timestamptz,
  enrichment_error text,
  ai_summary text,
  ai_first_message text,
  ai_followup_message text,
  ai_message_status text not null default 'not_generated' check (ai_message_status in ('not_generated', 'queued', 'processing', 'generated', 'failed')),
  ai_message_requested_at timestamptz,
  ai_message_generated_at timestamptz,
  ai_message_error text,
  source text,
  source_keyword text,
  dedup_hash text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_workspace on public.leads(workspace_id);
create index idx_leads_search on public.leads(search_id);
create index idx_leads_place_id on public.leads(place_id);
create index idx_leads_dedup_hash on public.leads(dedup_hash);
create index idx_leads_status on public.leads(status);
create index idx_leads_enrichment_status on public.leads(enrichment_status);
create index idx_leads_final_score on public.leads(final_score desc);

create unique index idx_leads_workspace_dedup on public.leads(workspace_id, dedup_hash) where dedup_hash is not null;

alter table public.leads
  add column if not exists enrichment_error text;

alter table public.leads
  add column if not exists ai_message_status text not null default 'not_generated';

alter table public.leads
  add column if not exists ai_message_requested_at timestamptz;

alter table public.leads
  add column if not exists ai_message_generated_at timestamptz;

alter table public.leads
  add column if not exists ai_message_error text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_ai_message_status_check'
  ) then
    alter table public.leads
      add constraint leads_ai_message_status_check
      check (ai_message_status in ('not_generated', 'queued', 'processing', 'generated', 'failed'));
  end if;
end
$$;

-- =============================================
-- 5.9 Tabela lead_enrichments
-- =============================================
create table public.lead_enrichments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  website_status integer,
  website_response_time_ms integer,
  website_final_url text,
  website_has_ssl boolean,
  website_has_meta_viewport boolean,
  website_title text,
  website_description text,
  website_copyright_year integer,
  website_quality_score integer,
  phone_valid boolean,
  whatsapp_likely boolean,
  last_google_review_at timestamptz,
  review_recency_score integer,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id)
);

create index idx_lead_enrichments_workspace on public.lead_enrichments(workspace_id);

-- =============================================
-- 5.10 Tabela usage_logs
-- =============================================
create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id),
  action_type text not null check (action_type in (
    'lead_search_created',
    'lead_search_result',
    'lead_enrichment',
    'ai_message',
    'export',
    'campaign_message_sent'
  )),
  credits_consumed integer not null default 0,
  related_search_id uuid references public.lead_searches(id) on delete set null,
  related_lead_id uuid references public.leads(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_usage_logs_workspace on public.usage_logs(workspace_id);
create index idx_usage_logs_created on public.usage_logs(created_at desc);
create index idx_usage_logs_action on public.usage_logs(action_type);
create index idx_usage_logs_workspace_created on public.usage_logs(workspace_id, created_at desc);

-- =============================================
-- 5.11 Trigger: criação automática de profile + workspace no signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
  free_plan_id uuid;
  workspace_slug text;
  user_name text;
begin
  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, full_name, preferred_theme)
  values (new.id, new.email, user_name, 'dark');

  select id into free_plan_id from public.plans where code = 'free' limit 1;

  workspace_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(new.id::text, 1, 6);

  insert into public.workspaces (owner_id, name, slug, plan_id)
  values (new.id, user_name || '''s workspace', workspace_slug, free_plan_id)
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  insert into public.subscriptions (workspace_id, plan_id, status)
  values (new_workspace_id, free_plan_id, 'active');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- 5.12 Trigger: updated_at automático
-- =============================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger set_leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger set_lead_enrichments_updated_at before update on public.lead_enrichments for each row execute function public.set_updated_at();
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

-- =============================================
-- 5.13 Função utilitária: saldo de créditos
-- =============================================
create or replace function public.get_workspace_credits_balance(p_workspace_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_quota integer;
  period_start timestamptz;
  period_end timestamptz;
  consumed integer;
begin
  select p.monthly_credit_quota, w.current_period_starts_at, w.current_period_ends_at
    into plan_quota, period_start, period_end
  from public.workspaces w
  join public.plans p on p.id = w.plan_id
  where w.id = p_workspace_id;

  if plan_quota is null then
    return 0;
  end if;

  select coalesce(sum(credits_consumed), 0) into consumed
  from public.usage_logs
  where workspace_id = p_workspace_id
    and created_at >= period_start
    and created_at < period_end;

  return greatest(plan_quota - consumed, 0);
end;
$$;

-- =============================================
-- 6. RLS — Row Level Security
-- =============================================

-- Helper function
create or replace function public.user_workspace_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select workspace_id
  from public.workspace_members
  where user_id = auth.uid();
$$;

-- profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- workspaces
alter table public.workspaces enable row level security;

create policy "Members can view their workspaces"
  on public.workspaces for select
  using (id in (select public.user_workspace_ids()));

create policy "Owners can update their workspaces"
  on public.workspaces for update
  using (owner_id = auth.uid());

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

-- workspace_members
alter table public.workspace_members enable row level security;

create policy "Members can view their memberships"
  on public.workspace_members for select
  using (user_id = auth.uid() or workspace_id in (select public.user_workspace_ids()));

create policy "Owners can manage memberships"
  on public.workspace_members for all
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

-- plans (público)
alter table public.plans enable row level security;

create policy "Anyone can view active plans"
  on public.plans for select
  using (is_active = true);

-- subscriptions
alter table public.subscriptions enable row level security;

create policy "Members can view their workspace subscriptions"
  on public.subscriptions for select
  using (workspace_id in (select public.user_workspace_ids()));

-- lead_searches
alter table public.lead_searches enable row level security;

create policy "Members can view workspace searches"
  on public.lead_searches for select
  using (workspace_id in (select public.user_workspace_ids()));

create policy "Members can create searches in their workspaces"
  on public.lead_searches for insert
  with check (workspace_id in (select public.user_workspace_ids()));

create policy "Members can update workspace searches"
  on public.lead_searches for update
  using (workspace_id in (select public.user_workspace_ids()));

create policy "Members can delete workspace searches"
  on public.lead_searches for delete
  using (workspace_id in (select public.user_workspace_ids()));

-- leads
alter table public.leads enable row level security;

create policy "Members can view workspace leads"
  on public.leads for select
  using (workspace_id in (select public.user_workspace_ids()));

create policy "Members can insert workspace leads"
  on public.leads for insert
  with check (workspace_id in (select public.user_workspace_ids()));

create policy "Members can update workspace leads"
  on public.leads for update
  using (workspace_id in (select public.user_workspace_ids()));

create policy "Members can delete workspace leads"
  on public.leads for delete
  using (workspace_id in (select public.user_workspace_ids()));

-- lead_enrichments
alter table public.lead_enrichments enable row level security;

create policy "Members can view workspace enrichments"
  on public.lead_enrichments for select
  using (workspace_id in (select public.user_workspace_ids()));

create policy "Members can insert workspace enrichments"
  on public.lead_enrichments for insert
  with check (workspace_id in (select public.user_workspace_ids()));

create policy "Members can update workspace enrichments"
  on public.lead_enrichments for update
  using (workspace_id in (select public.user_workspace_ids()));

-- usage_logs
alter table public.usage_logs enable row level security;

create policy "Members can view workspace usage"
  on public.usage_logs for select
  using (workspace_id in (select public.user_workspace_ids()));
-- Inserts em usage_logs sempre via service_role (jobs do Inngest)

-- =============================================
-- Diagnóstico de processamento de busca
-- =============================================
alter table public.lead_searches
  add column if not exists provider text,
  add column if not exists processing_metadata jsonb;
