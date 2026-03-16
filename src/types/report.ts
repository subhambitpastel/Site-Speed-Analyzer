export interface CategoryScores {
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
}

export interface WebVitalMetric {
  value: number;
  displayValue: string;
}

export interface CoreWebVitals {
  fcp: WebVitalMetric;
  lcp: WebVitalMetric;
  tbt: WebVitalMetric;
  cls: WebVitalMetric;
  tti: WebVitalMetric;
}

export interface LighthouseReport {
  url: string;
  scores: CategoryScores;
  coreWebVitals: CoreWebVitals;
  fetchedAt: string;
  strategy: "mobile" | "desktop";
  error?: string;
}
