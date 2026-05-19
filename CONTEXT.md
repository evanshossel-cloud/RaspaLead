# CONTEXT

## Produto

RaspaLead e um SaaS de prospeccao local para gerar listas de empresas, enriquecer sinais comerciais, sugerir mensagens e operar os leads dentro de uma interface command center.

## Stack atual

- Next.js 16 App Router
- React 19 + TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- Supabase SSR para auth e banco
- Inngest para jobs em background
- exceljs para exportacao XLSX

## Arquitetura de leads

```
src/features/leads/
  providers/
    types.ts                       # LeadProvider, LeadProviderInput, RawLeadResult, ProviderName
    mock-provider.ts               # provider mock
    google-places-provider.ts      # provider Google Places Text Search (busca rasa)
    map-raw-lead-to-insert.ts      # RawLeadResult -> LeadInsert (scorer + dedup key)
    index.ts                       # getLeadProvider(ProviderName)

  scoring/
    calculate-raw-score.ts         # raw score v1 centralizado

  services/
    dedupe-leads.ts                # deduplicacao dentro do lote
    filter-existing-leads.ts       # filtra leads ja existentes no workspace

  utils/
    normalize-lead.ts              # normalizePhone/Website/Name/Address + createLeadDedupeKey

src/features/searches/
  types.ts                         # SearchProcessingMetadata, LeadSearchRecord, ...
```

## Diagnostico de busca (processing_metadata)

Cada busca processada salva em `lead_searches`:
- `provider` — nome do provider usado ("mock" | "google_places")
- `processing_metadata` — jsonb com:

```typescript
interface SearchProcessingMetadata {
  provider: string;
  providerReturned: number;    // total retornado pelo provider
  afterLocalDedupe: number;    // apos dedupeRawLeads()
  afterExistingFilter: number; // apos filterExistingLeads()
  inserted: number;            // efetivamente inseridos no banco
  maxResultsLimit?: number;    // limite aplicado (ex: 20 para google_places)
  queryUsed?: string | null;   // query textual enviada ao provider
  error?: string | null;       // mensagem de erro, se houver
}
```

Em caso de falha, apenas `{ provider, error }` e salvo. Buscas antigas (sem metadata) mostram placeholder na UI.

A secao "Diagnostico da busca" em `/searches/[id]` exibe essas informacoes com:
- Badges de provider e limite
- Grid de metricas: retornados, apos dedupe, apos filtro banco, inseridos, descartados
- Query usada (monospace)
- Erro (destructive), se houver

## Pipeline de criacao de leads (leadSearchCreated)

1. `providerName = resolveProviderName()` — le `LEAD_PROVIDER` do ambiente
2. `markFailed` configurado para salvar `provider` e `processing_metadata.error`
3. Carrega `lead_search` do banco
4. Marca status como `processing`
5. `provider.search(input)` → `RawLeadResult[]`
6. `dedupeRawLeads()` — remove duplicados dentro do lote
7. `filterExistingLeads()` — remove leads ja existentes no workspace
8. Exclui todos os leads anteriores da busca atual
9. `mapRawLeadToInsert()` — calcula raw_score e dedup_hash
10. Insere leads
11. Salva `provider`, `processing_metadata` e `quantity_found` no `mark-completed`

## Providers de leads

### Selecao

```env
LEAD_PROVIDER=mock           # padrao
LEAD_PROVIDER=google_places  # requer GOOGLE_PLACES_API_KEY
```

### mock-provider

Gera leads plausíveis sem chamadas externas. Phones unicos por busca (hash do searchId).

### google-places-provider (busca rasa)

- Endpoint: `POST https://places.googleapis.com/v1/places:searchText`
- Auth: `X-Goog-Api-Key` (server-side only)
- FieldMask: id, displayName, formattedAddress, primaryType, primaryTypeDisplayName, rating, userRatingCount, googleMapsUri
- Limite: 20 resultados por busca
- Telefone/website: null nesta fase (Place Details — fase futura)
- Query: `{niche} {keyword?} em {neighborhood?} {city} {state}`

## Rotas existentes

- `/dashboard`, `/searches`, `/searches/new`, `/searches/[id]` (com diagnostico)
- `/leads`, `/leads/[id]`
- `/billing`, `/settings`, `/crm`
- `/api/inngest`, `/api/exports/leads`

## Fluxo de enriquecimento

Job mockado: cria/atualiza `lead_enrichments` e recalcula `final_score`.

## Fluxo de mensagem sugerida

Job mockado: gera `ai_first_message` e `ai_followup_message` via template.

## Fluxo de exportacao XLSX

`GET /api/exports/leads?search_id=opcional` — retorna XLSX completo.

## Enriquecimento sob demanda (Place Details)

O enriquecimento manual dispara o job `leadEnrichmentRequested`. A logica e centralizada em `src/features/leads/enrichment/enrich-lead.ts`:

```
enrichLeadWithAvailableSources(lead)
  → se lead.source === "google_places" && lead.place_id:
      getGooglePlaceDetails(placeId)                    # Place Details API
      → atualiza leads.phone, website, google_maps_url, address, rating, review_count
      → cria lead_enrichments com source = "google_place_details"
      → recalcula final_score com dados reais
  → senao:
      fallback mock deterministico
      → cria lead_enrichments com source = "mock_enrichment"
      → recalcula final_score com pesos mock
```

### google-place-details.ts

- Endpoint: `GET https://places.googleapis.com/v1/places/{placeId}`
- Auth: `X-Goog-Api-Key` (server-side only)
- FieldMask econômico: id, nationalPhoneNumber, internationalPhoneNumber, websiteUri, googleMapsUri, formattedAddress, businessStatus, rating, userRatingCount, primaryType, primaryTypeDisplayName
- Sem reviews detalhados, sem fotos, sem horarios nesta fase

### Diferenca entre busca rasa e Place Details

| | Busca rasa (Text Search) | Enriquecimento (Place Details) |
|---|---|---|
| Quando | Ao criar busca | Ao clicar "Enriquecer lead" |
| Custo | 1 chamada / busca | 1 chamada / lead |
| Telefone | null | nationalPhoneNumber |
| Website | null | websiteUri |
| Horarios | nao | nao (fase futura) |

### place_id

O `place_id` do Google Places e salvo em `leads.place_id` no momento da insercao (via `map-raw-lead-to-insert.ts`). Leads antigos sem `place_id` usam fallback mock no enrichment.

## Status atual

- Funcional: auth, workspaces, RLS, buscas, leads, dedupe, scoring, enrichment real (google_places) + fallback mock, mensagens mockadas, exportacao XLSX, diagnostico de processamento
- Mockado: enrichment de leads sem place_id, mensagens com OpenAI, website enrichment real
- Google Places: busca rasa + Place Details no enrichment sob demanda

## Identidade visual — duas camadas separadas

O RaspaLead possui dois contextos visuais distintos que NAO devem ser misturados:

### Dashboard interno — command center dark premium

- Tema: dark, sofisticado, command center
- Paleta: fundo escuro, bordas sutis, acentos em primario/secundario
- Componentes: shadcn/ui com Tailwind v4 customizado
- Tipografia: hierarquica, data-driven, sem exageros visuais
- Tom: ferramenta profissional, discreta, de alto desempenho

### Landing page e paginas publicas — brutalist SaaS B2B

Decisao tomada em 2026-05-18.

Inspiracoes visuais documentadas:
- dadospremium.com (referencia principal de tom comercial B2B)
- Combustivel Justo (landing page e interior do app — referencia direta de layout e tipografia)

#### Anatomia da landing (baseada nas referencias)

**Hero section:**
- Fundo off-white / creme (nao branco puro)
- Badge superior com emoji + texto curto em pill colorido (rosa, amarelo) — ex: "🔥 Novo — Funcionalidade X"
- Headline gigante, uppercase, muito bold, 3 linhas maximas
- Palavras-chave destacadas com marca-texto colorido: amarelo para dados, rosa/magenta para impacto emocional
- Subheadline curta e direta
- Dois botoes: CTA principal preto preenchido (com icone) + CTA secundario outlined neutro
- Barra de prova social abaixo dos botoes: ⭐ rating • quantidade de usuarios • certificacao • beneficio gratuito
- Formas organicas de fundo (blobs): circulo rosa e amarelo, sem borda, opacity baixa

**Header:**
- Branco ou off-white
- Logo a esquerda (sem borda inferior pesada necessaria)
- Unico botao de CTA a direita: preto preenchido, texto direto ("Abrir o App →")
- Menu central minimo

**Ticker / marquee:**
- Linha horizontal logo abaixo do header
- Fundo amarelo ou rosa com texto escuro
- Atualizacoes em tempo real ou social proof em scroll continuo

**Secao dark (prova social / numeros):**
- Fundo preto ou quase preto
- Titulo em uppercase, branco
- Cards de metrica com borda discreta e fundo ligeiramente mais claro que o bg
- Numeros grandes em amarelo/dourado (display muito bold)
- Labels pequenos em cinza claro abaixo dos numeros

**Interior do app (referencia colorida — Combustivel Justo):**
- Fundo branco/claro
- Cards com fundo solido colorido: laranja, verde, roxo, azul, amarelo, rosa
- Borda preta em todos os cards
- Numeros muito grandes e bold dentro dos cards
- Indicadores de variacao com setas e badges coloridos
- Layout em grid denso, data-rich

#### Paleta de cores publicas

| Cor | Uso |
|---|---|
| Amarelo (#FFE600 ou similar) | Destaques de headline, numeros de prova social, marca-texto |
| Rosa/Magenta (#FF3CAC ou similar) | Badges de novidade, palavras de impacto emocional |
| Preto (#000 ou #111) | CTA principal, bordas, texto hero |
| Off-white (#FAF9F6 ou similar) | Background base da landing |
| Azul forte | CTA secundario, destaque de features tecnicas |
| Verde | Resultados, dados locais, mapas, aprovacao |
| Roxo | CRM, IA, inteligencia de dados |

#### Tom e linguagem

- Direto, agressivo, comercial — "produto que vende"
- Headlines interrogativas ou provocativas: "Voce esta perdendo leads todos os dias?"
- Numeros grandes e concretos: "1.200 empresas prospectadas em 3 minutos"
- Sem termos tecnicos no hero — foco no resultado do usuario

### Regra de separacao

```
/app/*        → dark premium command center (dashboard interno)
/             → brutalist SaaS B2B (landing publica)
/pricing      → brutalist SaaS B2B
/features     → brutalist SaaS B2B
paginas auth  → neutras, transicao entre os dois contextos
```

Nunca usar o estilo brutalist dentro do dashboard.
Nunca usar o estilo dark command center na landing publica.

## Decisoes importantes

- `GOOGLE_PLACES_API_KEY` usada SOMENTE server-side (job Inngest)
- Service role restrito aos jobs do Inngest
- Dedupe e scoring centralizados — qualquer provider os herda
- `processing_metadata` e salvo em todos os cenarios (sucesso e falha) para facilitar diagnostico
- Identidade visual dual: dashboard dark premium (app) + brutalist SaaS (landing)
