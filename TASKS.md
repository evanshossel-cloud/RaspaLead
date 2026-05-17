# TASKS

## Concluidas

- Auth SSR com middleware e workspaces multi-tenant
- Dashboard command center dark premium
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

- Place Details sob demanda no enrichment manual por lead
  - `src/features/leads/enrichment/google-place-details.ts`
  - `src/features/leads/enrichment/enrich-lead.ts`
  - `place_id` salvo em `map-raw-lead-to-insert.ts`
  - `leadEnrichmentRequested` atualiza `leads` com dados reais
  - Badge de fonte em `/leads/[id]`
  - Coluna de fonte na exportacao XLSX

## Proximas tarefas recomendadas

1. Testar resultados reais do Google Places e calibrar queries por nicho/cidade
2. Website enrichment real (status HTTP, SSL, meta viewport) via fetch
3. OpenAI real para mensagens e score contextual
4. Edicao e aprovacao de mensagem antes de enviar
5. Calibracao do score com buscas reais (comparar raw vs final apos Place Details)
6. Beta controlado com usuarios reais

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

- Alta: validar Google Places real, Place Details, notas, CRM basico
- Media: OpenAI real, exportacao avancada, historico operacional, paginacao
- Baixa: white-label, automacoes outbound
