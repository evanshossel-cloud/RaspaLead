# CHANGELOG

## 2026-05-19 - Redesign brutalist da landing publica

### Adicionado

- `src/components/marketing/marketing-header.tsx`
- `src/components/marketing/hero-section.tsx`
- `src/components/marketing/search-agent-mockup.tsx`
- `src/components/marketing/stats-section.tsx`
- `src/components/marketing/feature-cards-section.tsx`
- `src/components/marketing/how-it-works-section.tsx`
- `src/components/marketing/enrichment-section.tsx`
- `src/components/marketing/pricing-preview-section.tsx`
- `src/components/marketing/faq-section.tsx`
- `src/components/marketing/final-cta-section.tsx`
- `src/components/marketing/marketing-footer.tsx`

### Alterado

- `src/app/page.tsx` agora compoe a landing publica com visual brutalist SaaS B2B
- Landing passou a usar fundo off-white, secoes dark, cards coloridos, bordas pretas, sombras offset, CTAs fortes e mockup de produto
- Copy ajustada para vender o fluxo atual sem prometer OpenAI real, CRM avancado ou Google Places automatico como recursos totalmente ativos

### Nao alterado

- Dashboard interno dark command center
- Rotas privadas
- Supabase, Inngest, providers, schema e Server Actions
- `/login` e `/register`

### Validacoes

- `pnpm typecheck` passou
- `pnpm build` deve ser registrado no relatorio final desta tarefa

---

## 2026-05-19 - Refinamento da paleta da landing

### Alterado

- Paleta da landing publica refinada para uma estetica SaaS B2B mais limpa, proxima de Dados Premium
- Ticker, header, hero, mockup, cards, secoes dark, pricing, FAQ, CTA final e footer passaram a usar azul forte, navy, branco/off-white, verde e amarelo suave
- Rosa/neon e excesso de cores saturadas foram removidos ou reduzidos
- Cards brutalist mantiveram bordas pretas, sombras offset, tipografia bold e estrutura visual forte

### Nao alterado

- Dashboard interno
- Rotas privadas
- Auth, Supabase, Inngest, providers, schema e Server Actions

## 2026-05-18 — Direcao visual da landing page registrada

### Decisao

Definida identidade visual publica do RaspaLead separada do dashboard interno.

Duas camadas visuais definitivas:
- **Dashboard interno** (`/app/*`): dark premium command center — mantido, nao alterado
- **Landing publica** (`/`, `/pricing`, paginas de marketing): brutalist SaaS B2B — a implementar

### Referencias visuais documentadas

- Combustivel Justo (landing page): hero em off-white, headline uppercase gigante, marca-texto amarelo/rosa, badge pill, blobs organicos, ticker de social proof, secao dark com numeros amarelos, botao CTA preto
- Combustivel Justo (interior do app): cards com fundo solido colorido (laranja, verde, roxo, azul), bordas pretas, numeros grandes, layout data-rich vibrante
- dadospremium.com: tom comercial B2B brasileiro, alto contraste, produto que "vende" sem parecer generico

### Documentado em

- `CONTEXT.md` — secao "Identidade visual — duas camadas separadas" com anatomia detalhada, paleta e regras de separacao
- `TASKS.md` — novas tarefas de landing: revisao atual, implementacao nova, componentes publicos, pricing, FAQ
- `PROJECT_STATUS.md` — tabela de status visual e proximos passos atualizados

### Nao implementado neste momento

Nenhuma alteracao de codigo. Apenas registro de decisao de produto e design.

---

## 2026-05-17 — Place Details no enriquecimento sob demanda

### Adicionado

- `src/features/leads/enrichment/google-place-details.ts`
  - Servico que chama `GET https://places.googleapis.com/v1/places/{placeId}`
  - FieldMask: id, nationalPhoneNumber, internationalPhoneNumber, websiteUri, googleMapsUri, formattedAddress, businessStatus, rating, userRatingCount, primaryType, primaryTypeDisplayName
  - Lanca erro controlado se `GOOGLE_PLACES_API_KEY` ausente
  - Retorna `GooglePlaceDetailsResult` tipado

- `src/features/leads/enrichment/enrich-lead.ts`
  - Funcao `enrichLeadWithAvailableSources(lead)` — decide entre Place Details real e fallback mock
  - `enrichWithGooglePlaceDetails`: chama Place Details, computa final_score com dados reais, retorna `leadFields` para atualizar a tabela `leads`
  - `enrichWithMock`: logica deterministico preexistente (preservada)
  - `EnrichLeadResult` com `enrichment`, `finalScore`, `leadFields`, `enrichmentSource`

### Alterado

- `src/features/leads/providers/map-raw-lead-to-insert.ts`
  - Adicionado `place_id: raw.externalId ?? null` para salvar o Google Place ID nos leads

- `src/types/database.ts`
  - `leads.Update` agora inclui `phone`, `website`, `google_maps_url`, `address`, `rating`, `review_count`, `raw_score`, `final_score`, `place_id` como campos atualizaveis

- `src/lib/inngest/functions/index.ts`
  - `leadEnrichmentRequested` agora usa `enrichLeadWithAvailableSources` em vez de `buildMockEnrichment`
  - Removidos `buildMockEnrichment`, `MOCK_COPYRIGHT_YEARS`, `getSeed`, `clamp`, `pickDeterministicNumber` (movidos para `enrich-lead.ts`)
  - Adicionado step `update-lead-data` que atualiza `leads` com campos reais quando Place Details retornar dados
  - Removido step `simulate-processing` (delay artificial substituido pelo tempo real da chamada API)
  - Log: `lead_id`, `source`, `phone=true/false`, `website=true/false`
  - `update` em `mark-enrichment-processing` e `markLeadFailed` sem `as never` (tipos agora corretos)

- `src/app/(dashboard)/leads/[id]/page.tsx`
  - Adicionado `parseEnrichmentSource(rawData)` para ler `raw_data.source`
  - Calculado `enrichmentSource` a partir de `enrichment.raw_data`
  - Badge "Google Place Details" exibido quando fonte for `google_place_details`
  - Badge "Enrichment simulado" exibido quando fonte for `mock_enrichment`
  - Descricao do card de enriquecimento atualizada (removido "Placeholder pronto para a proxima fase")

- `src/app/api/exports/leads/route.ts`
  - Adicionada coluna "Fonte do enrichment" no XLSX, lida de `enrichment.raw_data.source`

### Validacoes executadas

- `pnpm typecheck` passou sem erros
- `pnpm build` passou com todas as paginas geradas

### Observacoes

- `GOOGLE_PLACES_API_KEY` usada apenas server-side (job Inngest); nunca exposta no client
- Leads sem `place_id` (mock ou legados) continuam usando fallback mock no enrichment sem quebras
- Botao "Abrir no WhatsApp" passa a funcionar apos enrichment retornar telefone real (a pagina auto-atualiza)
- Coluna `place_id` ja existia na tabela `leads`; apenas o mapper nao estava preenchendo — corrigido

---

## 2026-05-17 — Google Places provider (busca rasa)

### Adicionado

- `src/features/leads/providers/google-places-provider.ts`
  - Implementa `LeadProvider` via Google Places Text Search API (nova API v1)
  - Autenticacao via `X-Goog-Api-Key` (server-side only)
  - FieldMask econômico: id, displayName, formattedAddress, primaryType, primaryTypeDisplayName, rating, userRatingCount, googleMapsUri
  - Limite de 20 resultados por busca
  - Query construida como: `{niche} {keyword?} em {neighborhood?} {city} {state}`
  - Retorna `source = "google_places"`; telefone e website retornam null nesta fase

- `.env.example`: adicionado `LEAD_PROVIDER=mock` e comentarios de uso

### Alterado

- `src/features/leads/providers/index.ts`
  - Registrado `googlePlacesProvider` em `getLeadProvider`
  - Exportado tipo `ProviderName = "mock" | "google_places"`
  - Adicionado exhaustive check para tipos desconhecidos

- `src/lib/inngest/functions/index.ts`
  - Adicionada funcao `resolveProviderName()` que le `process.env.LEAD_PROVIDER`
  - `leadSearchCreated` agora usa o provider resolvido via env em vez de hardcode `"mock"`
  - Log `[lead-search] provider: {nome}` adicionado ao inicio do step
  - Delete de leads antigos removeu filtro `eq("source", "mock")` — apaga todos os leads anteriores da busca (independente de source) para permitir reprocessamento limpo com qualquer provider

### Validacoes executadas

- `pnpm typecheck` passou sem erros
- `pnpm build` passou com 16/16 paginas geradas
- `LEAD_PROVIDER=mock` continua funcionando exatamente como antes

### Observacoes

- `GOOGLE_PLACES_API_KEY` nunca e exposta no client; usada apenas no job Inngest
- Se a key nao existir com `LEAD_PROVIDER=google_places`, a busca falha com `error_message` amigavel
- OpenAI e Place Details ainda nao implementados

---

## 2026-05-17 — Deduplicacao centralizada e raw score v1

### Adicionado

- `src/features/leads/utils/normalize-lead.ts` — normalizacao e `createLeadDedupeKey`
- `src/features/leads/scoring/calculate-raw-score.ts` — raw score v1
- `src/features/leads/services/dedupe-leads.ts` — dedupe dentro do lote
- `src/features/leads/services/filter-existing-leads.ts` — filtro contra o banco

### Alterado

- `src/features/leads/providers/mock-provider.ts` — phones unicos por busca; sem rawScore inline
- `src/features/leads/providers/map-raw-lead-to-insert.ts` — usa scorer + dedup key
- `src/lib/inngest/functions/index.ts` — pipeline completo com dedupe, filtro e logs

---

## 2026-05-17 — Camada de providers de leads

### Adicionado

- `src/features/leads/providers/types.ts`, `mock-provider.ts`, `map-raw-lead-to-insert.ts`, `index.ts`

### Alterado

- `src/lib/inngest/functions/index.ts` — refatorado para usar provider

---

## 2026-05-14 — Exportacao XLSX

### Adicionado

- `GET /api/exports/leads`, `export-leads-button.tsx`, integracao em `/leads` e `/searches/[id]`
- Documentacao inicial (CONTEXT, TASKS, PROJECT_STATUS, CHANGELOG, README)

---

## 2026-05-19 — Website Enrichment v1

### Adicionado

- `src/features/leads/enrichment/website-enrichment.ts` (novo)
  - Servico `analyzeWebsite(url: string): Promise<WebsiteEnrichmentResult>`
  - Normaliza URL (adiciona https:// se ausente; fallback para http:// se https falhar)
  - Fetch server-side com timeout de 7 segundos via AbortController
  - Segue redirects automaticamente
  - Captura: status HTTP, URL final, HTTPS, meta viewport, copyright year, tempo de resposta
  - Leitura do HTML limitada a 50 KB para evitar payload gigante
  - Detecta meta viewport via regex em atributos
  - Detecta copyright year procurando por © / &copy; / copyright + ano no range 2000–atual
  - Calcula `websiteQualityScore` v1 (0–100):
    - base 50
    - +15 se HTTP 200–299
    - +10 se HTTPS
    - +15 se meta viewport presente
    - +10 se tempo de resposta < 3000 ms
    - +10 se copyright year >= ano atual - 2
    - -20 se HTTP >= 400
    - -10 se sem meta viewport
    - -10 se copyright year < ano atual - 5
  - Nunca lança erro que quebre o fluxo — retorna `error` descritivo em caso de falha

### Alterado

- `src/features/leads/enrichment/enrich-lead.ts`
  - Importa e usa `analyzeWebsite` na funcao `enrichWithGooglePlaceDetails`
  - Determina website final: Place Details > lead.website
  - Se website disponivel: executa `analyzeWebsite`, inclui resultados no enrichment e no final_score
  - Se website ausente: mantem campos como null, registra `website_analysis_used: false`
  - `computeRealFinalScore` atualizado com novos parametros:
    - `websiteQualityScore`, `websiteStatus`, `websiteHasSsl`, `websiteHasMetaViewport`
    - Bonus moderado por site de qualidade (max +7 pts); site ruim NAO penaliza (oportunidade)
  - `enrichWithMock` preservado sem alteracoes no comportamento (adiciona `website_analysis_used: false` ao raw_data)
  - Log melhorado: inclui `website_analysis_used`, `http status`, `quality`, `final_score`
  - `website_response_time_ms` incluido no `LeadEnrichmentInsert` (campo ja existia no schema)
  - `raw_data` do Google Place Details agora inclui:
    - `place_details_used: true`
    - `website_analysis_used: true/false`
    - `website_error` (se houver)
    - `response_time_ms`
    - `website_final_url`
    - `website_quality_score`

- `src/lib/inngest/functions/index.ts`
  - Log do step `enrich-lead` atualizado para incluir:
    - `website_analysis`, `http`, `quality`, `final_score`

- `src/app/(dashboard)/leads/[id]/page.tsx`
  - Importados icones: `AlertTriangle`, `Clock`, `Shield`, `ShieldOff`
  - Adicionadas funcoes helper: `parseWebsiteError`, `parseWebsiteAnalysisUsed`
  - Variaveis computadas: `websiteError`, `websiteAnalysisUsed`, `currentYear`
  - Card de Enriquecimento expandido com:
    - Badges contextuais: "Site online", "Sem HTTPS", "Mobile-friendly", "Site antigo", "Erro ao acessar", "Sem site informado"
    - Bloco "Analise do site (Website Enrichment v1)" visivel quando `websiteAnalysisUsed = true`:
      - Status HTTP com cor contextual (verde/vermelho)
      - URL final clicavel
      - HTTPS com icone Shield (verde) ou ShieldOff (amarelo)
      - Mobile/viewport com cor contextual
      - Ano copyright com destaque laranja se antigo
      - Score qualidade do site com cor contextual
      - Tempo de resposta com icone Clock e cor contextual
      - Erro ao acessar, se houver
    - Sinais de telefone/whatsapp/recencia mantidos abaixo
  - Campos null tratados graciosamente em todo o card

- `src/app/api/exports/leads/route.ts`
  - Adicionada coluna "Tempo resposta (ms)" (key: `website_response_time_ms`) apos "Ano copyright"
  - Valor lido de `enrichment?.website_response_time_ms`

### Validacoes executadas

- `pnpm typecheck`: ver relatorio final
- `pnpm build`: ver relatorio final

### Observacoes

- Sem Lighthouse, sem Wappalyzer, sem crawler profundo
- Sem alteracao de schema (website_response_time_ms ja existia no schema e nos tipos)
- Sem nova variavel de ambiente
- .env.example nao alterado
- Fallback mock continua funcionando sem mudancas de comportamento
- Place Details continua funcionando; website analysis e executado depois, sem interferir
- Site ruim NAO derruba o final_score — e tratado como sinal de oportunidade comercial
