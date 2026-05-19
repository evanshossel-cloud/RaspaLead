# RaspaLead

## Atualizacao 2026-05-19 - Landing publica brutalist

A landing publica (`/`) foi redesenhada para uma estetica brutalist SaaS B2B inspirada em Dados Premium e nas imagens de referencia do projeto.

- Nova camada de marketing em `src/components/marketing/`
- Secoes implementadas: header com ticker, hero, mockup de busca, prova dark, cards coloridos, como funciona, comparacao, pricing preview, FAQ, CTA final e footer
- Separacao visual preservada: landing publica clara/brutalist; dashboard interno dark command center
- Copy honesta: demo pode rodar com provider mock; Google Places depende de API key; WhatsApp e manual via `wa.me`; OpenAI real e CRM avancado seguem como roadmap
- Nao houve alteracao em Supabase, Inngest, providers, schema, Server Actions ou rotas privadas

SaaS multi-tenant de prospeccao local com dashboard estilo command center, auth via Supabase, jobs em background com Inngest, deduplicacao centralizada e exportacao XLSX de leads.

## Visao geral

- Stack: `Next.js 16`, `React 19`, `TypeScript`, `Tailwind CSS v4`, `shadcn/ui`, `Supabase SSR`, `Inngest`, `exceljs`
- Tema do dashboard: dark premium command center (app interno)
- Tema da landing: brutalist SaaS B2B — off-white, headlines uppercase, marca-texto colorido, secoes dark (a implementar)
- Multi-tenant com workspace ativo, RLS e rotas protegidas por middleware
- Provider de leads configuravel via `LEAD_PROVIDER` (default: `mock`)
- Google Places em modo busca rasa para criacao de leads; Place Details acionado sob demanda no enriquecimento
- OpenAI ainda nao implementado; mensagens continuam mockadas

## Principais fluxos

- **Busca real:** usuario cria busca em `/searches/new` → Inngest busca leads via provider (mock ou Google Places) → dedupe local → filtro contra banco → scoring → insercao
- **Enriquecimento manual:** usuario dispara em `/leads/[id]` → se lead vier do Google Places com place_id, usa Place Details para buscar telefone, website e endereco reais; caso contrario usa fallback mock → atualiza `lead_enrichments` e `leads`, recalcula `final_score`
- **Mensagem sugerida:** usuario dispara em `/leads/[id]` → job preenche `ai_first_message` e `ai_followup_message`
- **Exportacao XLSX:** usuario exporta leads do workspace inteiro ou de uma busca especifica

## Pipeline de leads (Inngest)

```
resolveProviderName()          # le LEAD_PROVIDER do ambiente
  → provider.search(input)     # mock ou google_places
  → dedupeRawLeads()           # remove duplicados dentro do lote
  → filterExistingLeads()      # remove leads ja no workspace
  → mapRawLeadToInsert()       # calcula raw_score e dedup_hash
  → insert em leads
```

## Providers disponíveis

### mock (padrao)

- Gera 5 leads plausíveis por busca sem chamadas externas
- Ideal para desenvolvimento e testes

### google_places (busca rasa)

- Usa Google Places Text Search API (nova API v1)
- Retorna: nome, categoria, endereco, rating, reviews, link Maps
- Telefone e website sao null na busca rasa (economiza cota); preenchidos no enriquecimento sob demanda via Place Details
- Limite: 20 resultados por busca

## Enriquecimento sob demanda (Place Details)

- Ativado quando usuario clica em "Enriquecer lead" em `/leads/[id]`
- Se o lead veio do Google Places e tem `place_id`: chama Place Details API para buscar telefone, website, Google Maps URL, endereco, rating, status do negocio
- Se o lead nao tem `place_id` (mock ou lead sem external ID): usa fallback com enriquecimento simulado (deterministico, sem chamadas externas)
- Campos atualizados na tabela `leads`: `phone`, `website`, `google_maps_url`, `address`, `rating`, `review_count`
- `GOOGLE_PLACES_API_KEY` necessaria para busca e enriquecimento real; nunca exposta no client
- Fonte do enrichment registrada em `lead_enrichments.raw_data.source`: `"google_place_details"` ou `"mock_enrichment"`

### Alternar entre providers

```env
LEAD_PROVIDER=mock           # padrao, nao requer configuracao adicional
LEAD_PROVIDER=google_places  # requer GOOGLE_PLACES_API_KEY no .env.local
```

## Rotas principais

- `/` landing page
- `/login` / `/register`
- `/dashboard` central de prospeccao
- `/searches` / `/searches/new` / `/searches/[id]`
- `/leads` / `/leads/[id]`
- `/billing` / `/settings` / `/crm`
- `/api/inngest` endpoint do Inngest
- `/api/exports/leads` exportacao XLSX

## Como rodar

### Requisitos

- Node.js 20+
- pnpm 9+
- projeto Supabase configurado
- Inngest Dev Server para testar jobs localmente

### Instalar dependencias

```bash
pnpm install
```

### Variaveis de ambiente

Crie `.env.local` com base em `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=RaspaLead
INNGEST_EVENT_KEY=local
INNGEST_SIGNING_KEY=signkey-test-qualquer

# Provider de leads
LEAD_PROVIDER=mock
# LEAD_PROVIDER=google_places  # descomentar para usar Google Places
GOOGLE_PLACES_API_KEY=         # obrigatorio se LEAD_PROVIDER=google_places
```

Variaveis futuras (ainda nao usadas):

```env
OPENAI_API_KEY=
```

### Banco

1. Crie o projeto no Supabase
2. Execute `supabase/schema.sql` no SQL Editor
3. Configure `http://localhost:3000/auth/callback` como redirect URL

### Desenvolvimento

```bash
pnpm dev
```

### Inngest local

```bash
npx inngest-cli@latest dev
```

## Scripts

- `pnpm dev` inicia o app
- `pnpm build` gera build de producao
- `pnpm start` sobe o build
- `pnpm typecheck` gera tipos do Next e roda `tsc --noEmit`
- `pnpm lint` roda lint do Next

## Estrutura relevante

```text
src/
  app/
    (auth)/         # login, register, callback
    (dashboard)/    # rotas protegidas — estilo dark premium
    page.tsx        # landing publica — estilo brutalist SaaS (a refatorar)
  components/
    layout/         # sidebar, header, theme toggle (dashboard)
    shared/         # componentes reutilizaveis internos
    public/         # (a criar) componentes da landing publica
    ui/             # shadcn/ui
  features/leads/
    providers/      # LeadProvider, mock, google-places, mapper
    enrichment/     # google-place-details.ts, enrich-lead.ts
    scoring/        # calculate-raw-score.ts
    services/       # dedupe-leads.ts, filter-existing-leads.ts
    utils/          # normalize-lead.ts
  lib/inngest/      # jobs de background
supabase/           # schema.sql com RLS
```

## Estado atual

- Ja funciona: auth, workspaces, dashboard, buscas reais, dedupe, scoring, exportacao XLSX
- Provider mock: leads completos (nome, telefone, site, endereco, rating, score)
- Provider Google Places (busca rasa): nome, categoria, endereco, rating, reviews, Maps URL — sem telefone/site na busca
- Enriquecimento real: Place Details sob demanda — preenche telefone, website, Maps URL nos leads do Google Places
- Ainda mockado: enrichment de leads sem place_id, mensagens com IA real
- Fases futuras: website enrichment real, OpenAI, CRM, cobranca real

## Website Enrichment v1

O enriquecimento de leads com `source = "google_places"` agora inclui análise real do site.

### Sinais detectados

| Sinal | Descrição |
|-------|-----------|
| Status HTTP | Código de resposta do site (200, 404, 500...) |
| URL final | URL após seguir todos os redirects |
| HTTPS | Site serve conteúdo via HTTPS |
| Meta viewport | Site é responsivo / mobile-friendly |
| Copyright year | Ano mais recente encontrado próximo de © |
| Tempo de resposta | Milissegundos até receber o HTML |
| Score qualidade | Nota técnica 0–100 calculada com base nos sinais acima |

### Limitações

- Sem Lighthouse (sem análise de performance profunda)
- Sem Wappalyzer (sem detecção de tecnologias)
- Sem crawler profundo (analisa apenas o HTML da página inicial)
- Timeout de 7 segundos: sites muito lentos retornam campos null
- Alguns sites bloqueiam fetches automatizados mesmo com User-Agent realista

### Como testar o fluxo de enriquecimento

1. Configure `LEAD_PROVIDER=mock` no `.env.local`
2. Crie uma busca em `/searches/new`
3. Abra um lead em `/leads`
4. Clique em "Enriquecer lead"
5. Aguarde o job Inngest processar (auto-refresh ativo)
6. Com `LEAD_PROVIDER=mock`: dados simulados deterministicos (sem fetch real)
7. Com `LEAD_PROVIDER=google_places` e lead com `place_id`: Place Details + website analysis real

### Score técnico vs score comercial

`websiteQualityScore` é a qualidade técnica do site, não o score comercial do lead.
Um site ruim é tratado como **sinal de oportunidade** para quem vende marketing, redesign, tráfego ou automação.
O `final_score` recebe apenas bônus moderado por site de qualidade — nunca penalização pesada por site ruim.
