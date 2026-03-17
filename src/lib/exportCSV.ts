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

function formatScore(score: number): string {
  return score.toFixed(1);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getScoreStyleId(score: number): string {
  if (score >= 90) return "sGreen";
  if (score >= 50) return "sOrange";
  return "sRed";
}

function dataCell(value: string, styleId?: string): string {
  const sAttr = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `      <Cell${sAttr}><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function numberCell(value: number, styleId?: string): string {
  const sAttr = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `      <Cell${sAttr}><Data ss:Type="Number">${value}</Data></Cell>`;
}

export function exportCSV(reports: LighthouseReport[]): void {
  try {
    const validReports = reports.filter(isValidReport);

    if (validReports.length === 0) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const colCount = 12;

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

    // Build SpreadsheetML XML
    const lines: string[] = [];
    lines.push(`<?xml version="1.0"?>`);
    lines.push(`<?mso-application progid="Excel.Sheet"?>`);
    lines.push(`<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"`);
    lines.push(` xmlns:o="urn:schemas-microsoft-com:office:office"`);
    lines.push(` xmlns:x="urn:schemas-microsoft-com:office:excel"`);
    lines.push(` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`);

    // Styles
    lines.push(`  <Styles>`);

    // Default
    lines.push(`    <Style ss:ID="Default" ss:Name="Normal">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11"/>`);
    lines.push(`    </Style>`);

    // Title
    lines.push(`    <Style ss:ID="sTitle">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#1E2952"/>`);
    lines.push(`      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>`);
    lines.push(`    </Style>`);

    // Header
    lines.push(`    <Style ss:ID="sHeader">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>`);
    lines.push(`      <Interior ss:Color="#1E2952" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
    lines.push(`      <Borders>`);
    lines.push(`        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>`);
    lines.push(`        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>`);
    lines.push(`        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>`);
    lines.push(`        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>`);
    lines.push(`      </Borders>`);
    lines.push(`    </Style>`);

    // Green score
    lines.push(`    <Style ss:ID="sGreen">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1B5E20"/>`);
    lines.push(`      <Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
    lines.push(`      <NumberFormat ss:Format="0.0"/>`);
    lines.push(`    </Style>`);

    // Orange score
    lines.push(`    <Style ss:ID="sOrange">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#E65100"/>`);
    lines.push(`      <Interior ss:Color="#FFF3E0" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
    lines.push(`      <NumberFormat ss:Format="0.0"/>`);
    lines.push(`    </Style>`);

    // Red score
    lines.push(`    <Style ss:ID="sRed">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#B71C1C"/>`);
    lines.push(`      <Interior ss:Color="#FFEBEE" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
    lines.push(`      <NumberFormat ss:Format="0.0"/>`);
    lines.push(`    </Style>`);

    // Even row
    lines.push(`    <Style ss:ID="sRowEven">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11"/>`);
    lines.push(`      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Vertical="Center"/>`);
    lines.push(`    </Style>`);

    // Odd row
    lines.push(`    <Style ss:ID="sRowOdd">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11"/>`);
    lines.push(`      <Interior ss:Color="#F5F7FA" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Vertical="Center"/>`);
    lines.push(`    </Style>`);

    // Even row center-aligned (for non-score data cells)
    lines.push(`    <Style ss:ID="sRowEvenCenter">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11"/>`);
    lines.push(`      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
    lines.push(`    </Style>`);

    // Odd row center-aligned
    lines.push(`    <Style ss:ID="sRowOddCenter">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11"/>`);
    lines.push(`      <Interior ss:Color="#F5F7FA" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
    lines.push(`    </Style>`);

    // Summary row
    lines.push(`    <Style ss:ID="sSummary">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>`);
    lines.push(`      <Interior ss:Color="#E8EAF0" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Vertical="Center"/>`);
    lines.push(`    </Style>`);

    // Summary score (inherits summary bg but with score number format)
    lines.push(`    <Style ss:ID="sSummaryCenter">`);
    lines.push(`      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>`);
    lines.push(`      <Interior ss:Color="#E8EAF0" ss:Pattern="Solid"/>`);
    lines.push(`      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>`);
    lines.push(`      <NumberFormat ss:Format="0.0"/>`);
    lines.push(`    </Style>`);

    lines.push(`  </Styles>`);

    // Worksheet
    lines.push(`  <Worksheet ss:Name="Lighthouse Report">`);
    lines.push(`    <Table ss:DefaultColumnWidth="100">`);

    // Column widths
    lines.push(`      <Column ss:Width="280"/>`); // URL
    lines.push(`      <Column ss:Width="100"/>`); // Performance
    lines.push(`      <Column ss:Width="100"/>`); // Accessibility
    lines.push(`      <Column ss:Width="80"/>`);  // SEO
    lines.push(`      <Column ss:Width="110"/>`); // Best Practices
    lines.push(`      <Column ss:Width="90"/>`);  // FCP
    lines.push(`      <Column ss:Width="90"/>`);  // LCP
    lines.push(`      <Column ss:Width="90"/>`);  // TBT
    lines.push(`      <Column ss:Width="80"/>`);  // CLS
    lines.push(`      <Column ss:Width="90"/>`);  // TTI
    lines.push(`      <Column ss:Width="90"/>`);  // Strategy
    lines.push(`      <Column ss:Width="140"/>`); // Fetched At

    // Title row (merged across all columns)
    lines.push(`    <Row ss:Height="30">`);
    lines.push(`      <Cell ss:StyleID="sTitle" ss:MergeAcross="${colCount - 1}"><Data ss:Type="String">Lighthouse Bulk Performance Report — ${escapeXml(today)} — ${validReports.length} URLs</Data></Cell>`);
    lines.push(`    </Row>`);

    // Empty spacer row
    lines.push(`    <Row ss:Height="8">`);
    lines.push(`      <Cell><Data ss:Type="String"></Data></Cell>`);
    lines.push(`    </Row>`);

    // Header row
    lines.push(`    <Row>`);
    for (const h of headers) {
      lines.push(`      <Cell ss:StyleID="sHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`);
    }
    lines.push(`    </Row>`);

    // Data rows
    validReports.forEach((report, idx) => {
      const isEven = idx % 2 === 0;
      const rowStyle = isEven ? "sRowEven" : "sRowOdd";
      const rowCenterStyle = isEven ? "sRowEvenCenter" : "sRowOddCenter";

      lines.push(`    <Row>`);
      lines.push(dataCell(report.url, rowStyle));
      lines.push(numberCell(report.scores.performance, getScoreStyleId(report.scores.performance)));
      lines.push(numberCell(report.scores.accessibility, getScoreStyleId(report.scores.accessibility)));
      lines.push(numberCell(report.scores.seo, getScoreStyleId(report.scores.seo)));
      lines.push(numberCell(report.scores.bestPractices, getScoreStyleId(report.scores.bestPractices)));
      lines.push(dataCell(report.coreWebVitals.fcp.displayValue, rowCenterStyle));
      lines.push(dataCell(report.coreWebVitals.lcp.displayValue, rowCenterStyle));
      lines.push(dataCell(report.coreWebVitals.tbt.displayValue, rowCenterStyle));
      lines.push(dataCell(report.coreWebVitals.cls.displayValue, rowCenterStyle));
      lines.push(dataCell(report.coreWebVitals.tti.displayValue, rowCenterStyle));
      lines.push(dataCell(report.strategy, rowCenterStyle));
      lines.push(dataCell(report.fetchedAt, rowCenterStyle));
      lines.push(`    </Row>`);
    });

    // Empty spacer row
    lines.push(`    <Row ss:Height="6">`);
    lines.push(`      <Cell><Data ss:Type="String"></Data></Cell>`);
    lines.push(`    </Row>`);

    // Summary/Average row
    lines.push(`    <Row>`);
    lines.push(dataCell("AVERAGE", "sSummary"));
    lines.push(numberCell(parseFloat(formatScore(avgPerformance)), "sSummaryCenter"));
    lines.push(numberCell(parseFloat(formatScore(avgAccessibility)), "sSummaryCenter"));
    lines.push(numberCell(parseFloat(formatScore(avgSEO)), "sSummaryCenter"));
    lines.push(numberCell(parseFloat(formatScore(avgBestPractices)), "sSummaryCenter"));
    lines.push(dataCell("", "sSummary"));
    lines.push(dataCell("", "sSummary"));
    lines.push(dataCell("", "sSummary"));
    lines.push(dataCell("", "sSummary"));
    lines.push(dataCell("", "sSummary"));
    lines.push(dataCell("", "sSummary"));
    lines.push(dataCell("", "sSummary"));
    lines.push(`    </Row>`);

    lines.push(`    </Table>`);
    lines.push(`  </Worksheet>`);
    lines.push(`</Workbook>`);

    const xmlContent = lines.join("\n");
    const blob = new Blob([xmlContent], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const filename = `lighthouse-report-${today}.xls`;

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export CSV:", error);
  }
}

function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function exportPlainCSV(reports: LighthouseReport[]) {
  try {
    const valid = reports.filter(isValidReport);
    if (valid.length === 0) return;

    const date = new Date().toISOString().split("T")[0];
    const headers = ["URL", "Performance", "Accessibility", "SEO", "Best Practices", "FCP", "LCP", "TBT", "CLS", "TTI", "Strategy", "Fetched At"];

    const rows: string[][] = [];

    // Header row
    rows.push(headers);

    // Data rows
    for (const r of valid) {
      rows.push([
        r.url,
        r.scores.performance.toString(),
        r.scores.accessibility.toString(),
        r.scores.seo.toString(),
        r.scores.bestPractices.toString(),
        r.coreWebVitals.fcp.displayValue,
        r.coreWebVitals.lcp.displayValue,
        r.coreWebVitals.tbt.displayValue,
        r.coreWebVitals.cls.displayValue,
        r.coreWebVitals.tti.displayValue,
        r.strategy,
        r.fetchedAt,
      ]);
    }

    // Average row
    const avgPerf = valid.reduce((s, r) => s + r.scores.performance, 0) / valid.length;
    const avgA11y = valid.reduce((s, r) => s + r.scores.accessibility, 0) / valid.length;
    const avgSeo = valid.reduce((s, r) => s + r.scores.seo, 0) / valid.length;
    const avgBp = valid.reduce((s, r) => s + r.scores.bestPractices, 0) / valid.length;
    rows.push(["AVERAGE", avgPerf.toFixed(1), avgA11y.toFixed(1), avgSeo.toFixed(1), avgBp.toFixed(1), "", "", "", "", "", "", ""]);

    const csvContent = "\uFEFF" + rows.map(row => row.map(escapeCSVField).join(",")).join("\n");

    const filename = `lighthouse-report-${date}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export plain CSV:", error);
  }
}
