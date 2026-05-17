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

## Decisoes importantes

- `GOOGLE_PLACES_API_KEY` usada SOMENTE server-side (job Inngest)
- Service role restrito aos jobs do Inngest
- Dedupe e scoring centralizados — qualquer provider os herda
- `processing_metadata` e salvo em todos os cenarios (sucesso e falha) para facilitar diagnostico
