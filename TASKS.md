# TASKS

## Atualizacao 2026-05-20

- Identidade visual unificada concluida: landing, auth e app interno seguem brutalist SaaS B2B clean
- `/login`, `/register`, dashboard, buscas, leads, billing, settings e CRM foram alinhados com a landing aprovada
- Base visual antiga dark command center removida das rotas principais
- App fixado no tema claro para evitar retorno da paleta antiga
- Nenhuma logica de negocio, Supabase, Inngest, providers, schema, RLS ou Server Actions foi alterada

## Atualizacao 2026-05-19

- Landing publica brutalist SaaS B2B concluida em `src/app/page.tsx`
- Componentes de marketing criados em `src/components/marketing/`
- Implementados: ticker, header, hero, mockup de busca, prova dark, cards coloridos, como funciona, comparacao, pricing preview, FAQ, CTA final e footer
- Copy ajustada para nao prometer OpenAI real, CRM avancado ou Google Places automatico como recursos totalmente ativos
- Paleta refinada para SaaS B2B clean: azul forte, navy, branco/off-white, verde e amarelo suave; rosa/neon reduzido/removido
- Proxima etapa de marketing: validar conversao e criar `/pricing` real quando planos estiverem definidos

## Concluidas

- Auth SSR com middleware e workspaces multi-tenant
- App interno alinhado com a identidade brutalist SaaS B2B clean
- Criacao real de buscas com Server Action + Inngest
- Geracao de leads mockados por busca
- Detalhe da busca com auto-refresh
- Enriquecimento manual mockado por lead
- Geracao de mensagem sugerida mockada por lead
- Copia individual, copia sequencial e abertura no WhatsApp
- Exportacao XLSX por workspace ou por busca
- Camada de providers de leads com interface `LeadProvider`
- Provider mock implementado
- Inngest refatorado para usar provider
- Normalizacao centralizada (phone, website, nome, endereco)
- Deduplicacao dentro do lote e contra o banco
- Raw score v1 centralizado
- `dedup_hash` gerado via chave normalizada
- Google Places provider em modo busca rasa
- Selecao de provider via `LEAD_PROVIDER` no ambiente
- Diagnostico da busca: `processing_metadata` salvo no banco
- Secao "Diagnostico da busca" em `/searches/[id]` com metricas do pipeline

## Em andamento

- Validacao da qualidade dos resultados reais do Google Places

## Concluidas (recentes)

- Website Enrichment v1 implementado
  - `src/features/leads/enrichment/website-enrichment.ts` (novo servico)
  - `analyzeWebsite()`: HTTP status, URL final, HTTPS, meta viewport, copyright year, tempo de resposta
  - `websiteQualityScore` v1 calculado (0-100)
  - Integrado em `enrich-lead.ts` — executa apos Place Details, antes de calcular final_score
  - `final_score` atualizado com sinais de website (bonus moderado, site ruim = oportunidade)
  - `website_response_time_ms` salvo em `lead_enrichments` (campo ja existia no schema)
  - `raw_data` enriquecido: `website_analysis_used`, `website_error`, `response_time_ms`
  - Frontend `/leads/[id]` com badges contextuais e bloco "Analise do site"
  - Exportacao XLSX com coluna "Tempo resposta (ms)"

- Place Details sob demanda no enrichment manual por lead
  - `src/features/leads/enrichment/google-place-details.ts`
  - `src/features/leads/enrichment/enrich-lead.ts`
  - `place_id` salvo em `map-raw-lead-to-insert.ts`
  - `leadEnrichmentRequested` atualiza `leads` com dados reais
  - Badge de fonte em `/leads/[id]`
  - Coluna de fonte na exportacao XLSX

## Proximas tarefas recomendadas

### Produto / pipeline

1. Calibrar websiteQualityScore e final_score com leads reais
2. OpenAI real para mensagens e score contextual
3. Edicao e aprovacao de mensagem antes de enviar
4. Beta fechado com 3 nichos/cidades reais (validar funil completo)
5. Refinar conversao da landing brutalist SaaS B2B existente
6. Checkout e planos reais

### Landing page e identidade visual

Status: landing e identidade unificada ja implementadas. A lista abaixo fica como historico da direcao inicial; novas tarefas devem preservar a linguagem clean/brutalist atual.

1. Revisar landing atual (`/` em `src/app/page.tsx`) e mapear o que precisa mudar
2. Criar nova landing no estilo brutalist SaaS B2B (baseado nas referencias: Combustivel Justo + dadospremium.com)
   - Hero com headline grande + marca-texto colorido + badge pill + blob shapes
   - Ticker de prova social
   - Secao dark com metricas grandes
   - CTA principal preto + CTA secundario outlined
3. Criar componentes publicos reutilizaveis em `src/components/public/`:
   - `hero-section.tsx`
   - `stats-ticker.tsx`
   - `dark-proof-section.tsx`
   - `feature-card-colorful.tsx`
   - `cta-button-brutalist.tsx`
4. Criar pagina `/pricing` com planos e tabela comparativa no estilo publico
5. Revisar FAQ e CTA de conversao
6. Garantir separacao de contexto visual (landing ≠ dashboard)

## Backlog tecnico

- Paginacao em `/leads` para workspaces com muitos leads
- Testes automatizados para providers, dedupe, scorer, route handlers
- Controle de cota/custo da Google Places API por workspace
- Centralizar calculo de final_score apos enrichment em funcao reutilizavel
- Repositorios/selectors para reduzir repeticao de queries

## Backlog de produto

- CRM funcional com estagios reais
- Campanhas outbound
- Score comercial mais rico
- Enriquecimento em lote por busca
- White-label e multi-cliente avancado

## Prioridades sugeridas

- Alta: validar Google Places real, landing nova no estilo brutalist, beta controlado
- Media: OpenAI real, pricing publico, exportacao avancada, paginacao
- Baixa: white-label, automacoes outbound
