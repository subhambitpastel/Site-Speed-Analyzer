import type {
  CategoryScores,
  CoreWebVitals,
  LighthouseReport,
  WebVitalMetric,
} from "@/types/report";

const DEFAULT_METRIC: WebVitalMetric = { value: 0, displayValue: "N/A" };

/**
 * Safely extracts a category score (0-100) from the API response.
 * Lighthouse scores are 0-1 floats; we multiply by 100 and round.
 */
function extractCategoryScore(
  categories: Record<string, any> | undefined,
  key: string,
): number {
  const score = categories?.[key]?.score;
  if (typeof score !== "number") return 0;
  return Math.round(score * 100);
}

/**
 * Safely extracts a Web Vital metric from the audits map.
 */
function extractMetric(
  audits: Record<string, any> | undefined,
  auditId: string,
): WebVitalMetric {
  const audit = audits?.[auditId];
  if (!audit) return { ...DEFAULT_METRIC };

  return {
    value: typeof audit.numericValue === "number" ? audit.numericValue : 0,
    displayValue:
      typeof audit.displayValue === "string" ? audit.displayValue : "N/A",
  };
}

/**
 * Parses a raw PageSpeed Insights API response into a structured LighthouseReport.
 */
export function parseReport(
  url: string,
  apiResponse: any,
  strategy: "mobile" | "desktop",
): LighthouseReport {
  const lighthouseResult = apiResponse?.lighthouseResult;

  if (!lighthouseResult) {
    return {
      url,
      scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
      coreWebVitals: {
        fcp: { ...DEFAULT_METRIC },
        lcp: { ...DEFAULT_METRIC },
        tbt: { ...DEFAULT_METRIC },
        cls: { ...DEFAULT_METRIC },
        tti: { ...DEFAULT_METRIC },
      },
      fetchedAt: new Date().toISOString(),
      strategy,
      error: "No Lighthouse result found in API response.",
    };
  }

  const categories = lighthouseResult.categories;
  const audits = lighthouseResult.audits;

  const scores: CategoryScores = {
    performance: extractCategoryScore(categories, "performance"),
    accessibility: extractCategoryScore(categories, "accessibility"),
    seo: extractCategoryScore(categories, "seo"),
    bestPractices: extractCategoryScore(categories, "best-practices"),
  };

  const coreWebVitals: CoreWebVitals = {
    fcp: extractMetric(audits, "first-contentful-paint"),
    lcp: extractMetric(audits, "largest-contentful-paint"),
    tbt: extractMetric(audits, "total-blocking-time"),
    cls: extractMetric(audits, "cumulative-layout-shift"),
    tti: extractMetric(audits, "interactive"),
  };

  return {
    url,
    scores,
    coreWebVitals,
    fetchedAt: new Date().toISOString(),
    strategy,
  };
}
