import type { LighthouseReport } from "@/types/report";

function escapeCSVField(field: string): string {
  if (
    field.includes(",") ||
    field.includes('"') ||
    field.includes("\n") ||
    field.includes("\r")
  ) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function isValidReport(report: LighthouseReport): boolean {
  if (report.error) return false;
  const { performance, accessibility, seo, bestPractices } = report.scores;
  if (
    performance === 0 &&
    accessibility === 0 &&
    seo === 0 &&
    bestPractices === 0
  ) {
    return false;
  }
  return true;
}

export function exportCSV(reports: LighthouseReport[]): void {
  const validReports = reports.filter(isValidReport);

  if (validReports.length === 0) {
    return;
  }

  const headers = [
    "URL",
    "Performance",
    "Accessibility",
    "SEO",
    "Best Practices",
    "FCP",
    "LCP",
    "TBT",
    "CLS",
    "TTI",
    "Strategy",
    "Fetched At",
  ];

  const rows = validReports.map((report) => [
    escapeCSVField(report.url),
    escapeCSVField(String(report.scores.performance)),
    escapeCSVField(String(report.scores.accessibility)),
    escapeCSVField(String(report.scores.seo)),
    escapeCSVField(String(report.scores.bestPractices)),
    escapeCSVField(report.coreWebVitals.fcp.displayValue),
    escapeCSVField(report.coreWebVitals.lcp.displayValue),
    escapeCSVField(report.coreWebVitals.tbt.displayValue),
    escapeCSVField(report.coreWebVitals.cls.displayValue),
    escapeCSVField(report.coreWebVitals.tti.displayValue),
    escapeCSVField(report.strategy),
    escapeCSVField(report.fetchedAt),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split("T")[0];
  const filename = `lighthouse-report-${today}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
