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

function formatScore(score: number): string {
  return score.toFixed(1);
}

export function exportCSV(reports: LighthouseReport[]): void {
  try {
  const validReports = reports.filter(isValidReport);

  if (validReports.length === 0) {
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  // Compute averages
  const avgPerformance =
    validReports.reduce((sum, r) => sum + r.scores.performance, 0) /
    validReports.length;
  const avgAccessibility =
    validReports.reduce((sum, r) => sum + r.scores.accessibility, 0) /
    validReports.length;
  const avgSEO =
    validReports.reduce((sum, r) => sum + r.scores.seo, 0) /
    validReports.length;
  const avgBestPractices =
    validReports.reduce((sum, r) => sum + r.scores.bestPractices, 0) /
    validReports.length;

  // Metadata comment rows
  const metadataRows = [
    `# Lighthouse Bulk Performance Report`,
    `# Generated: ${today}`,
    `# URLs Analyzed: ${validReports.length}`,
    `# Average Scores - Performance: ${formatScore(avgPerformance)} | Accessibility: ${formatScore(avgAccessibility)} | SEO: ${formatScore(avgSEO)} | Best Practices: ${formatScore(avgBestPractices)}`,
    `#`,
  ];

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
    escapeCSVField(formatScore(report.scores.performance)),
    escapeCSVField(formatScore(report.scores.accessibility)),
    escapeCSVField(formatScore(report.scores.seo)),
    escapeCSVField(formatScore(report.scores.bestPractices)),
    escapeCSVField(report.coreWebVitals.fcp.displayValue),
    escapeCSVField(report.coreWebVitals.lcp.displayValue),
    escapeCSVField(report.coreWebVitals.tbt.displayValue),
    escapeCSVField(report.coreWebVitals.cls.displayValue),
    escapeCSVField(report.coreWebVitals.tti.displayValue),
    escapeCSVField(report.strategy),
    escapeCSVField(report.fetchedAt),
  ]);

  // Summary/averages row
  const summaryRow = [
    escapeCSVField("AVERAGE"),
    escapeCSVField(formatScore(avgPerformance)),
    escapeCSVField(formatScore(avgAccessibility)),
    escapeCSVField(formatScore(avgSEO)),
    escapeCSVField(formatScore(avgBestPractices)),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];

  const csvContent = [
    ...metadataRows,
    headers.join(","),
    ...rows.map((row) => row.join(",")),
    "",
    summaryRow.join(","),
  ].join("\r\n");

  // Add UTF-8 BOM for proper Excel handling
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const filename = `lighthouse-report-${today}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export CSV:", error);
    alert("Failed to export CSV. Please try again.");
  }
}
