import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

function getScoreColor(score: number): [number, number, number] {
  if (score >= 90) return [0, 128, 0];
  if (score >= 50) return [255, 165, 0];
  return [255, 0, 0];
}

export function exportPDF(reports: LighthouseReport[]): void {
  const validReports = reports.filter(isValidReport);

  if (validReports.length === 0) {
    return;
  }

  const doc = new jsPDF({ orientation: "landscape" });
  const today = new Date().toISOString().split("T")[0];

  // Title
  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text("Lighthouse Performance Report", 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${today}`, 14, 28);

  // Summary section
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

  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text("Summary", 14, 40);

  doc.setFontSize(10);
  doc.setTextColor(66, 66, 66);
  doc.text(`URLs Analyzed: ${validReports.length}`, 14, 48);
  doc.text(
    `Average Scores — Performance: ${avgPerformance.toFixed(1)} | Accessibility: ${avgAccessibility.toFixed(1)} | SEO: ${avgSEO.toFixed(1)} | Best Practices: ${avgBestPractices.toFixed(1)}`,
    14,
    54
  );

  // Main scores table
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text("Scores Overview", 14, 66);

  const scoreColumns = ["URL", "Perf", "A11y", "SEO", "BP"];
  const scoreRows = validReports.map((report) => [
    report.url.length > 50 ? report.url.substring(0, 47) + "..." : report.url,
    String(report.scores.performance),
    String(report.scores.accessibility),
    String(report.scores.seo),
    String(report.scores.bestPractices),
  ]);

  autoTable(doc, {
    startY: 70,
    head: [scoreColumns],
    body: scoreRows,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 25, halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index >= 1) {
        const score = parseInt(data.cell.raw as string, 10);
        if (!isNaN(score)) {
          const [r, g, b] = getScoreColor(score);
          data.cell.styles.textColor = [r, g, b];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // Core Web Vitals section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docAny = doc as any;
  const lastTableY: number =
    docAny.lastAutoTable?.finalY ?? docAny.previousAutoTable?.finalY ?? 120;

  let currentY = lastTableY + 15;

  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);

  if (currentY > 170) {
    doc.addPage();
    currentY = 20;
  }

  doc.text("Core Web Vitals", 14, currentY);
  currentY += 6;

  const vitalsColumns = ["URL", "FCP", "LCP", "TBT", "CLS", "TTI", "Strategy"];
  const vitalsRows = validReports.map((report) => [
    report.url.length > 40 ? report.url.substring(0, 37) + "..." : report.url,
    report.coreWebVitals.fcp.displayValue,
    report.coreWebVitals.lcp.displayValue,
    report.coreWebVitals.tbt.displayValue,
    report.coreWebVitals.cls.displayValue,
    report.coreWebVitals.tti.displayValue,
    report.strategy,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [vitalsColumns],
    body: vitalsRows,
    theme: "grid",
    headStyles: {
      fillColor: [39, 174, 96],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 80 },
    },
  });

  const filename = `lighthouse-report-${today}.pdf`;
  doc.save(filename);
}
