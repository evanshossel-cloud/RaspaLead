# PROJECT STATUS

## O que ja funciona com mock (LEAD_PROVIDER=mock)

- Login, cadastro e sessao com Supabase SSR
- Workspace ativo com isolamento por RLS
- Dashboard com metricas reais
- Criacao real de buscas
- Pipeline Inngest: provider → dedupe → filtro banco → scorer → insert
- Leads mockados com nome, categoria, telefone, site, endereco, rating e score
- Deduplicacao dentro do lote e contra leads existentes no workspace
- Raw score v1 calculado de forma centralizada
- Detalhe de busca e detalhe de lead
- Enriquecimento manual mockado com persistencia real
- Geracao de mensagem mockada com persistencia real
- Exportacao XLSX de leads do workspace ou de uma busca especifica

## O que ja funciona com Google Places (LEAD_PROVIDER=google_places)

- Busca rasa via Google Places Text Search API
- Retorna: nome da empresa, categoria, endereco formatado, rating, numero de reviews, link Google Maps
- Deduplicacao e scoring aplicados automaticamente (mesma camada do mock)
- Inseridos com `source = "google_places"` e `dedup_hash` normalizado
- Exportacao XLSX funciona normalmente para leads reais

## O que ja funciona com Google Places — enriquecimento real

- Quando usuario clica em "Enriquecer lead" em `/leads/[id]` para um lead com `source = "google_places"` e `place_id` preenchido:
  - Job Inngest chama Google Place Details API (nova API v1)
  - Busca: `nationalPhoneNumber`, `websiteUri`, `googleMapsUri`, `formattedAddress`, `businessStatus`, `rating`, `userRatingCount`
  - Atualiza `leads.phone`, `leads.website`, `leads.google_maps_url`, `leads.address`, `leads.rating`, `leads.review_count` com dados reais
  - Cria/atualiza `lead_enrichments` com `raw_data.source = "google_place_details"`
  - Recalcula `final_score` com base nos dados reais
  - Botao "Abrir no WhatsApp" passa a funcionar quando telefone real for retornado
  - Badge "Google Place Details" exibido no card de enriquecimento em `/leads/[id]`
- Exportacao XLSX inclui coluna "Fonte do enrichment" com `google_place_details` ou `mock_enrichment`

## Limitacoes atuais do Google Places

- Busca rasa: telefone e website sao null ate o enriquecimento manual ser disparado
- Maximo 20 resultados por busca (limite da API + controle de custo)
- Se `GOOGLE_PLACES_API_KEY` nao estiver configurada, busca e enriquecimento falham com mensagem amigavel

## O que segue mockado

- Enrichment de leads sem `place_id` (leads mock ou legados): dados de website, SSL, viewport sao gerados por algoritmo deterministico
- Geracao de mensagem: texto construido por template, sem IA real
- Website enrichment (HTTP status, SSL real, meta viewport): mock deterministico

## Riscos e pendencias

- Custo da Google Places API: cada enriquecimento consome 1 chamada Place Details; definir modelo de creditos por workspace antes de escalar
- Sem paginacao em `/leads`: workspaces com muitos leads podem ter listagem lenta
- `filterExistingLeads` limita a 2000 leads por consulta (suficiente para MVP)
- `place_id` preenchido apenas em leads gerados apos a correcao de `map-raw-lead-to-insert.ts`; leads antigos sem place_id usarao fallback mock no enrichment

## Proximo passo sugerido

1. Website enrichment real: verificar HTTP status, SSL e meta viewport via fetch
2. OpenAI real para mensagens e score contextual
3. Calibrar queries do Google Places por nicho e cidade com dados reais
4. Beta controlado com usuarios reais
