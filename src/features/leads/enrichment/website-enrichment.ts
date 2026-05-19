/**
 * Website Enrichment v1
 *
 * Analisa o site de um lead via fetch server-side.
 * - Sem Lighthouse, sem Wappalyzer, sem crawler profundo
 * - Timeout máximo de 7 segundos
 * - Leitura limitada do HTML (50 KB)
 * - Nunca lança erro que quebre o fluxo de enrichment
 */

export interface WebsiteEnrichmentResult {
  websiteStatus: number | null;
  websiteFinalUrl: string | null;
  websiteHasSsl: boolean | null;
  websiteHasMetaViewport: boolean | null;
  websiteCopyrightYear: number | null;
  websiteResponseTimeMs: number | null;
  websiteQualityScore: number | null;
  error: string | null;
}

const HTML_READ_LIMIT = 50_000; // 50 KB máximo
const FETCH_TIMEOUT_MS = 7_000; // 7 segundos

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function calculateWebsiteQualityScore(params: {
  status: number | null;
  hasSsl: boolean | null;
  hasMetaViewport: boolean | null;
  responseTimeMs: number | null;
  copyrightYear: number | null;
}): number {
  const { status, hasSsl, hasMetaViewport, responseTimeMs, copyrightYear } = params;
  const currentYear = new Date().getFullYear();
  let score = 50;

  // Status HTTP
  if (status !== null) {
    if (status >= 200 && status < 300) score += 15;
    if (status >= 400) score -= 20;
  }

  // HTTPS
  if (hasSsl === true) score += 10;

  // Meta viewport / mobile-friendly
  if (hasMetaViewport === true) score += 15;
  else if (hasMetaViewport === false) score -= 10;

  // Tempo de resposta
  if (responseTimeMs !== null && responseTimeMs < 3000) score += 10;

  // Ano do copyright
  if (copyrightYear !== null) {
    if (copyrightYear >= currentYear - 2) score += 10;
    if (copyrightYear < currentYear - 5) score -= 10;
  }

  return Math.min(Math.max(score, 0), 100);
}

function detectMetaViewport(html: string): boolean {
  // Procura por <meta ... name="viewport" ...> em qualquer ordem de atributos
  return (
    /meta[^>]+name=["']viewport["']/i.test(html) ||
    /meta[^>]+name=viewport/i.test(html)
  );
}

function detectCopyrightYear(html: string): number | null {
  const currentYear = new Date().getFullYear();

  // Procura por seções com símbolo de copyright e extrai o ano mais recente
  const copyrightSections =
    html.match(/(?:©|&copy;|copyright)[^<\n]{0,120}/gi) ?? [];

  let bestYear: number | null = null;

  for (const section of copyrightSections) {
    const yearMatches = section.match(/\b(20\d{2})\b/g) ?? [];
    for (const y of yearMatches) {
      const year = parseInt(y, 10);
      if (year >= 2000 && year <= currentYear) {
        if (bestYear === null || year > bestYear) {
          bestYear = year;
        }
      }
    }
  }

  return bestYear;
}

async function attemptFetch(
  fetchUrl: string,
): Promise<WebsiteEnrichmentResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const startTime = Date.now();

  try {
    const response = await fetch(fetchUrl, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RaspaLead/1.0; +https://raspalead.com.br)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    const responseTimeMs = Date.now() - startTime;
    clearTimeout(timeoutId);

    const finalUrl = response.url || fetchUrl;
    const hasSsl = finalUrl.startsWith("https://");

    // Lê HTML apenas se for texto (evita baixar binários)
    const contentType = response.headers.get("content-type") ?? "";
    let html = "";
    if (contentType.includes("text/html") || contentType.includes("text/plain")) {
      const fullText = await response.text();
      html = fullText.slice(0, HTML_READ_LIMIT);
    }

    const hasMetaViewport = html.length > 0 ? detectMetaViewport(html) : null;
    const copyrightYear = html.length > 0 ? detectCopyrightYear(html) : null;

    const qualityScore = calculateWebsiteQualityScore({
      status: response.status,
      hasSsl,
      hasMetaViewport,
      responseTimeMs,
      copyrightYear,
    });

    return {
      websiteStatus: response.status,
      websiteFinalUrl: finalUrl,
      websiteHasSsl: hasSsl,
      websiteHasMetaViewport: hasMetaViewport,
      websiteCopyrightYear: copyrightYear,
      websiteResponseTimeMs: responseTimeMs,
      websiteQualityScore: qualityScore,
      error: null,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // Retorna null para tentar fallback (http), não propaga o erro
    return null;
  }
}

/**
 * Analisa um site e retorna sinais técnicos de qualidade.
 * Nunca lança exceção — retorna objeto com error preenchido em caso de falha.
 */
export async function analyzeWebsite(
  url: string,
): Promise<WebsiteEnrichmentResult> {
  try {
    const normalizedUrl = normalizeUrl(url);
    const isAlreadyHttp = url.trim().startsWith("http://");
    const isAlreadyHttps = url.trim().startsWith("https://");

    // Tentativa 1: URL normalizada (https por padrão)
    const result = await attemptFetch(normalizedUrl);
    if (result) return result;

    // Tentativa 2: se não tinha protocolo e https falhou, tenta http
    if (!isAlreadyHttp && !isAlreadyHttps) {
      const httpUrl = `http://${url.trim()}`;
      const httpResult = await attemptFetch(httpUrl);
      if (httpResult) return httpResult;
    }

    // Ambas as tentativas falharam
    return {
      websiteStatus: null,
      websiteFinalUrl: null,
      websiteHasSsl: null,
      websiteHasMetaViewport: null,
      websiteCopyrightYear: null,
      websiteResponseTimeMs: null,
      websiteQualityScore: null,
      error: "Nao foi possivel acessar o site (timeout ou conexao recusada)",
    };
  } catch (err) {
    // Proteção extra: nunca deixa o enrichment quebrar por falha no site
    return {
      websiteStatus: null,
      websiteFinalUrl: null,
      websiteHasSsl: null,
      websiteHasMetaViewport: null,
      websiteCopyrightYear: null,
      websiteResponseTimeMs: null,
      websiteQualityScore: null,
      error:
        err instanceof Error
          ? err.message.slice(0, 200)
          : "Erro desconhecido ao analisar o site",
    };
  }
}
