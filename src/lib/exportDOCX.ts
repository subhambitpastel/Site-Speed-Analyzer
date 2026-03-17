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
  ShadingType,
  PageNumber,
  Footer,
  Header,
  Tab,
  TabStopPosition,
  TabStopType,
  VerticalAlignTable,
  PageBreak,
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
  if (score >= 50) return "D97706";
  return "DC2626";
}

function getScoreBgHex(score: number): string {
  if (score >= 90) return "DCFCE7"; // light green
  if (score >= 50) return "FEF3C7"; // light amber
  return "FEE2E2"; // light red
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Good";
  if (score >= 50) return "Needs Work";
  return "Poor";
}

const HEADER_BG = "1E2952"; // dark indigo
const HEADER_TEXT = "FFFFFF";
const BORDER_COLOR = "D1D5DB"; // gray-300
const ALT_ROW_BG = "F5F7FA";

function cellBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
    left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
    right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  };
}

function createHeaderCell(
  text: string,
  width?: number
): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: HEADER_TEXT,
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    borders: cellBorders(),
    shading: {
      type: ShadingType.CLEAR,
      fill: HEADER_BG,
      color: HEADER_BG,
    },
    verticalAlign: VerticalAlignTable.CENTER,
  });
}

function createDataCell(
  text: string,
  options?: {
    bold?: boolean;
    color?: string;
    bgColor?: string;
    width?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    isAltRow?: boolean;
  }
): TableCell {
  const shadingFill = options?.bgColor
    ? options.bgColor
    : options?.isAltRow
      ? ALT_ROW_BG
      : "FFFFFF";

  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: options?.bold ?? false,
            color: options?.color ?? "333333",
            size: 20,
          }),
        ],
        alignment: options?.alignment ?? AlignmentType.LEFT,
      }),
    ],
    width: options?.width
      ? { size: options.width, type: WidthType.DXA }
      : undefined,
    borders: cellBorders(),
    shading: {
      type: ShadingType.CLEAR,
      fill: shadingFill,
      color: shadingFill,
    },
  });
}

function createScoreCell(
  score: number,
  width: number,
  isAltRow: boolean
): TableCell {
  return createDataCell(String(score), {
    bold: true,
    color: getScoreColorHex(score),
    bgColor: getScoreBgHex(score),
    width,
    alignment: AlignmentType.CENTER,
    isAltRow,
  });
}

export function exportDOCX(reports: LighthouseReport[]): void {
  try {
  const validReports = reports.filter(isValidReport);

  if (validReports.length === 0) {
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  // -- Summary score cards table --
  const summaryScores = [
    { label: "Performance", value: avgPerformance },
    { label: "Accessibility", value: avgAccessibility },
    { label: "SEO", value: avgSEO },
    { label: "Best Practices", value: avgBestPractices },
  ];

  const summaryHeaderRow = new TableRow({
    children: summaryScores.map((s) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: s.label,
                bold: true,
                color: "4B5563",
                size: 18,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
        borders: cellBorders(),
        shading: {
          type: ShadingType.CLEAR,
          fill: "F3F4F6",
          color: "F3F4F6",
        },
      })
    ),
  });

  const summaryValueRow = new TableRow({
    children: summaryScores.map((s) => {
      const rounded = Math.round(s.value);
      return new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: s.value.toFixed(1),
                bold: true,
                color: getScoreColorHex(rounded),
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 20 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: getScoreLabel(rounded),
                color: getScoreColorHex(rounded),
                size: 16,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
          }),
        ],
        borders: cellBorders(),
        shading: {
          type: ShadingType.CLEAR,
          fill: getScoreBgHex(rounded),
          color: getScoreBgHex(rounded),
        },
      });
    }),
  });

  const summaryTable = new Table({
    rows: [summaryHeaderRow, summaryValueRow],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // -- Header row for scores table --
  const headerRow = new TableRow({
    children: [
      createHeaderCell("URL", 4000),
      createHeaderCell("Performance", 1500),
      createHeaderCell("Accessibility", 1500),
      createHeaderCell("SEO", 1200),
      createHeaderCell("Best Practices", 1500),
      createHeaderCell("Strategy", 1300),
    ],
  });

  // -- Data rows for scores table --
  const dataRows = validReports.map(
    (report, idx) => {
      const isAlt = idx % 2 === 1;
      return new TableRow({
        children: [
          createDataCell(report.url, { width: 4000, isAltRow: isAlt }),
          createScoreCell(report.scores.performance, 1500, isAlt),
          createScoreCell(report.scores.accessibility, 1500, isAlt),
          createScoreCell(report.scores.seo, 1200, isAlt),
          createScoreCell(report.scores.bestPractices, 1500, isAlt),
          createDataCell(report.strategy, {
            width: 1300,
            alignment: AlignmentType.CENTER,
            isAltRow: isAlt,
          }),
        ],
      });
    }
  );

  const scoresTable = new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // -- Core Web Vitals table --
  const vitalsHeaderRow = new TableRow({
    children: [
      createHeaderCell("URL", 3500),
      createHeaderCell("FCP", 1200),
      createHeaderCell("LCP", 1200),
      createHeaderCell("TBT", 1200),
      createHeaderCell("CLS", 1200),
      createHeaderCell("TTI", 1200),
      createHeaderCell("Strategy", 1200),
    ],
  });

  const vitalsDataRows = validReports.map(
    (report, idx) => {
      const isAlt = idx % 2 === 1;
      return new TableRow({
        children: [
          createDataCell(report.url, { width: 3500, isAltRow: isAlt }),
          createDataCell(report.coreWebVitals.fcp.displayValue, {
            width: 1200,
            alignment: AlignmentType.CENTER,
            isAltRow: isAlt,
          }),
          createDataCell(report.coreWebVitals.lcp.displayValue, {
            width: 1200,
            alignment: AlignmentType.CENTER,
            isAltRow: isAlt,
          }),
          createDataCell(report.coreWebVitals.tbt.displayValue, {
            width: 1200,
            alignment: AlignmentType.CENTER,
            isAltRow: isAlt,
          }),
          createDataCell(report.coreWebVitals.cls.displayValue, {
            width: 1200,
            alignment: AlignmentType.CENTER,
            isAltRow: isAlt,
          }),
          createDataCell(report.coreWebVitals.tti.displayValue, {
            width: 1200,
            alignment: AlignmentType.CENTER,
            isAltRow: isAlt,
          }),
          createDataCell(report.strategy, {
            width: 1200,
            alignment: AlignmentType.CENTER,
            isAltRow: isAlt,
          }),
        ],
      });
    }
  );

  const vitalsTable = new Table({
    rows: [vitalsHeaderRow, ...vitalsDataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // -- Divider paragraph --
  const divider = new Paragraph({
    children: [],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "4F46E5" },
    },
    spacing: { before: 300, after: 200 },
  });

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Lighthouse Bulk Reporter",
                    color: "6B7280",
                    size: 16,
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Generated by Lighthouse Bulk Reporter",
                    color: "9CA3AF",
                    size: 16,
                  }),
                  new TextRun({
                    children: [new Tab()],
                  }),
                  new TextRun({
                    text: "Page ",
                    color: "9CA3AF",
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    color: "9CA3AF",
                    size: 16,
                  }),
                ],
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
              }),
            ],
          }),
        },
        children: [
          // -- Title page section --
          new Paragraph({
            children: [
              new TextRun({
                text: "Lighthouse",
                bold: true,
                size: 56,
                color: "1E2952",
              }),
            ],
            spacing: { before: 600, after: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Performance Report",
                bold: true,
                size: 56,
                color: "4F46E5",
              }),
            ],
            spacing: { after: 200 },
          }),

          // Accent line
          new Paragraph({
            children: [],
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: "4F46E5" },
            },
            spacing: { after: 300 },
          }),

          // Date and stats
          new Paragraph({
            children: [
              new TextRun({
                text: formattedDate,
                color: "6B7280",
                size: 24,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${validReports.length} URLs analyzed`,
                color: "6B7280",
                size: 22,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Summary heading
          new Paragraph({
            children: [
              new TextRun({
                text: "Average Scores",
                bold: true,
                size: 30,
                color: "1E2952",
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),

          // Summary score cards
          summaryTable,

          // Divider
          divider,

          // Results heading
          new Paragraph({
            children: [
              new TextRun({
                text: "Detailed Results",
                bold: true,
                size: 30,
                color: "1E2952",
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),

          // Scores table
          scoresTable,

          // Score color legend with colored indicators
          new Paragraph({
            children: [
              new TextRun({
                text: "Score Legend:  ",
                color: "4B5563",
                size: 18,
                bold: true,
              }),
              new TextRun({
                text: "\u25CF Green \u226590 (Good)",
                color: "008000",
                size: 18,
                bold: true,
              }),
              new TextRun({
                text: "  |  ",
                color: "6B7280",
                size: 18,
              }),
              new TextRun({
                text: "\u25CF Orange \u226550 (Needs Work)",
                color: "D97706",
                size: 18,
                bold: true,
              }),
              new TextRun({
                text: "  |  ",
                color: "6B7280",
                size: 18,
              }),
              new TextRun({
                text: "\u25CF Red <50 (Poor)",
                color: "DC2626",
                size: 18,
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 100 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
            },
          }),

          // Page break before Core Web Vitals
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Divider
          new Paragraph({
            children: [],
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "4F46E5" },
            },
            spacing: { before: 100, after: 200 },
          }),

          // Core Web Vitals heading
          new Paragraph({
            children: [
              new TextRun({
                text: "Core Web Vitals",
                bold: true,
                size: 30,
                color: "1E2952",
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),

          // Core Web Vitals table
          vitalsTable,

          // Bottom spacing
          new Paragraph({
            children: [],
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });

  const filename = `lighthouse-report-${today}.docx`;

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, filename);
  }).catch((error) => {
    console.error("Failed to export DOCX:", error);
  });
  } catch (error) {
    console.error("Failed to export DOCX:", error);
  }
}
