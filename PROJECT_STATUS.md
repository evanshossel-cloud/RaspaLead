# PROJECT STATUS

## Atualizacao 2026-05-19 - Landing publica brutalist SaaS B2B

Concluido:
- Landing publica (`/`) redesenhada para estetica brutalist SaaS B2B
- Componentes de marketing criados em `src/components/marketing/`
- Secoes implementadas: ticker, header, hero, mockup, prova dark, cards coloridos, como funciona, comparacao, pricing preview, FAQ, CTA final e footer
- Copy comercial mantida honesta: provider mock na demo, Google Places opcional via API key, WhatsApp manual, OpenAI real e CRM avancado como roadmap
- Dashboard interno dark command center e rotas privadas nao foram alterados
- Paleta refinada apos revisao visual: menos neon/rosa, mais SaaS B2B clean com azul, verde, navy, branco/off-white e amarelo suave

Proximo passo visual:
- Validar responsividade e conversao da landing com beta fechado
- Criar `/pricing` publico real quando os planos comerciais estiverem definidos

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
- Enriquecimento manual mockado com persistencia real (dados deterministicos)
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

## O que ja funciona — Website Enrichment v1 (NOVO)

- Quando lead tiver website (Place Details ou campo lead.website):
  - `analyzeWebsite()` executa via fetch server-side com timeout de 7 segundos
  - Captura: status HTTP, URL final apos redirect, HTTPS, meta viewport, copyright year, tempo de resposta
  - Calcula `website_quality_score` (0–100) com base nos sinais tecnicos
  - Salva em `lead_enrichments`: `website_status`, `website_final_url`, `website_has_ssl`, `website_has_meta_viewport`, `website_copyright_year`, `website_quality_score`, `website_response_time_ms`
  - Salva metadados em `raw_data`: `website_analysis_used`, `website_error` (se houver), `response_time_ms`, `website_final_url`, `website_quality_score`
  - Frontend `/leads/[id]` exibe:
    - Badges contextuais: Site online, Sem HTTPS, Mobile-friendly, Site antigo, Erro ao acessar, Sem site informado
    - Bloco "Analise do site" com todos os sinais (cor contextual em cada campo)
  - Exportacao XLSX inclui coluna "Tempo resposta (ms)"
  - Site ruim NAO penaliza o final_score — e tratado como sinal de oportunidade

## O que segue mockado

- Enrichment de leads sem `place_id` (leads mock ou legados): dados de website, SSL, viewport sao gerados por algoritmo deterministico
- Geracao de mensagem: texto construido por template, sem IA real
- Website analysis para leads mock: simulado, nao faz fetch real

## Limitacoes atuais

- Website Enrichment sem Lighthouse, sem Wappalyzer, sem crawler profundo
- Analise de site limitada a HTTP + HTML superficial (50 KB)
- Copyright year detectado apenas em proximitade de simbolo de copyright (© / &copy; / "copyright")
- Sem paginacao em `/leads`: workspaces com muitos leads podem ter listagem lenta
- `filterExistingLeads` limita a 2000 leads por consulta (suficiente para MVP)
- `place_id` preenchido apenas em leads gerados apos a correcao de `map-raw-lead-to-insert.ts`; leads antigos sem place_id usarao fallback mock no enrichment

## Riscos tecnicos

- Custo da Google Places API: cada enriquecimento consome 1 chamada Place Details; definir modelo de creditos por workspace antes de escalar
- Timeout de 7s no website analysis: sites muito lentos retornarao campos null sem erro
- Alguns sites bloqueiam fetch de bots mesmo com User-Agent realista
- Score tecnico do site (websiteQualityScore) nao reflete valor comercial do lead

## Proximos passos recomendados

1. Calibrar websiteQualityScore e final_score com leads reais (comparar resultados)
2. OpenAI real para mensagens contextualizadas
3. Edicao e aprovacao de mensagem antes de enviar
4. Beta fechado com 3 nichos/cidades reais
5. Nova landing no estilo brutalist SaaS B2B (referencias: Combustivel Justo + dadospremium.com)
6. Checkout e planos reais

## Identidade visual — decisao registrada (2026-05-18)

Duas camadas visuais separadas e definitivas:
- **Dashboard interno** (`/app/*`): dark premium command center — mantido, nao alterado
- **Landing publica** (`/`, `/pricing`, paginas de marketing): brutalist SaaS B2B — a implementar
