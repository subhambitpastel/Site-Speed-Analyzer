import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { LighthouseReport } from "@/types/report";

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

function getScoreColorHex(score: number): string {
  if (score >= 90) return "008000";
  if (score >= 50) return "FFA500";
  return "FF0000";
}

function createBorderedCell(text: string, options?: { bold?: boolean; color?: string; width?: number }): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: options?.bold ?? false,
            color: options?.color ?? "000000",
            size: 20,
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
    width: options?.width
      ? { size: options.width, type: WidthType.DXA }
      : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
  });
}

export function exportDOCX(reports: LighthouseReport[]): void {
  const validReports = reports.filter(isValidReport);

  if (validReports.length === 0) {
    return;
  }

  const today = new Date().toISOString().split("T")[0];

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

  // Header row for scores table
  const headerRow = new TableRow({
    children: [
      createBorderedCell("URL", { bold: true, width: 4000 }),
      createBorderedCell("Performance", { bold: true, width: 1500 }),
      createBorderedCell("Accessibility", { bold: true, width: 1500 }),
      createBorderedCell("SEO", { bold: true, width: 1200 }),
      createBorderedCell("Best Practices", { bold: true, width: 1500 }),
      createBorderedCell("Strategy", { bold: true, width: 1300 }),
    ],
  });

  // Data rows for scores table
  const dataRows = validReports.map(
    (report) =>
      new TableRow({
        children: [
          createBorderedCell(report.url, { width: 4000 }),
          createBorderedCell(String(report.scores.performance), {
            color: getScoreColorHex(report.scores.performance),
            bold: true,
            width: 1500,
          }),
          createBorderedCell(String(report.scores.accessibility), {
            color: getScoreColorHex(report.scores.accessibility),
            bold: true,
            width: 1500,
          }),
          createBorderedCell(String(report.scores.seo), {
            color: getScoreColorHex(report.scores.seo),
            bold: true,
            width: 1200,
          }),
          createBorderedCell(String(report.scores.bestPractices), {
            color: getScoreColorHex(report.scores.bestPractices),
            bold: true,
            width: 1500,
          }),
          createBorderedCell(report.strategy, { width: 1300 }),
        ],
      })
  );

  const scoresTable = new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // Core Web Vitals sections
  const vitalsSections: Paragraph[] = [];

  for (const report of validReports) {
    vitalsSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: report.url,
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: `  (${report.strategy})`,
            italics: true,
            size: 20,
            color: "666666",
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    const vitalsLines = [
      `First Contentful Paint (FCP): ${report.coreWebVitals.fcp.displayValue}`,
      `Largest Contentful Paint (LCP): ${report.coreWebVitals.lcp.displayValue}`,
      `Total Blocking Time (TBT): ${report.coreWebVitals.tbt.displayValue}`,
      `Cumulative Layout Shift (CLS): ${report.coreWebVitals.cls.displayValue}`,
      `Time to Interactive (TTI): ${report.coreWebVitals.tti.displayValue}`,
    ];

    for (const line of vitalsLines) {
      vitalsSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 20,
            }),
          ],
          spacing: { before: 40, after: 40 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "Lighthouse Performance Report",
                bold: true,
                size: 36,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 },
          }),

          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on ${today}`,
                color: "666666",
                size: 22,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Summary heading
          new Paragraph({
            children: [
              new TextRun({
                text: "Summary",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 120 },
          }),

          // Summary content
          new Paragraph({
            children: [
              new TextRun({
                text: `URLs Analyzed: ${validReports.length}`,
                size: 22,
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Average Scores — Performance: ${avgPerformance.toFixed(1)} | Accessibility: ${avgAccessibility.toFixed(1)} | SEO: ${avgSEO.toFixed(1)} | Best Practices: ${avgBestPractices.toFixed(1)}`,
                size: 22,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Results heading
          new Paragraph({
            children: [
              new TextRun({
                text: "Results",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 120 },
          }),

          // Scores table
          scoresTable,

          // Core Web Vitals heading
          new Paragraph({
            children: [
              new TextRun({
                text: "Core Web Vitals",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 120 },
          }),

          // Core Web Vitals details
          ...vitalsSections,
        ],
      },
    ],
  });

  const filename = `lighthouse-report-${today}.docx`;

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, filename);
  });
}
