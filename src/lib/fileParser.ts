import * as xlsx from "xlsx";
import type { LighthouseReport } from "@/types/report";

export const SUPPORTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export const SUPPORTED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", // .csv
  "application/csv",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_URLS = 500;

const URL_HEADER_KEYWORDS = ["url", "website", "site", "domain", "link"];

const URL_PATTERN = /https?:\/\/[^\s,;"'<>]+/gi;

/** Columns that indicate this is an exported Lighthouse report file */
const REPORT_COLUMNS = ["performance", "accessibility", "seo", "best practices"];

/** All expected export header names (lowercased for matching) */
const EXPORT_HEADERS_MAP: Record<string, string> = {
  url: "url",
  performance: "performance",
  accessibility: "accessibility",
  seo: "seo",
  "best practices": "bestPractices",
  fcp: "fcp",
  lcp: "lcp",
  tbt: "tbt",
  cls: "cls",
  tti: "tti",
  strategy: "strategy",
  "fetched at": "fetchedAt",
};

export type ParseUrlsResult = {
  kind: "urls";
  urls: string[];
  truncated: boolean;
};

export type ParseReportsResult = {
  kind: "reports";
  completedReports: LighthouseReport[];
  incompleteUrls: string[];
};

export type ParseFileResult = ParseUrlsResult | ParseReportsResult;

/**
 * Parse a File object (xlsx, xls, or csv) and return either extracted URLs
 * or reconstructed LighthouseReport objects (if the file is an exported report).
 */
export async function parseFile(file: File): Promise<ParseFileResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File exceeds the 10 MB size limit (${(file.size / 1024 / 1024).toFixed(1)} MB). Please use a smaller file.`
    );
  }

  const extension = getFileExtension(file.name);

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Unsupported file type "${extension}". Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}`
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("The uploaded file is empty.");
  }

  let workbook: xlsx.WorkBook;
  try {
    workbook = xlsx.read(arrayBuffer, { type: "array" });
  } catch {
    throw new Error(
      "Failed to parse the file. Please ensure it is a valid spreadsheet or CSV."
    );
  }

  if (!workbook.SheetNames.length) {
    throw new Error("The file contains no sheets.");
  }

  // Check if this is an exported report file by inspecting headers of the first sheet
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (firstSheet && isExportedReportSheet(firstSheet)) {
    return parseReportsFromWorkbook(workbook);
  }

  // Fallback: extract URLs only (original behavior)
  const allUrls: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (sheet) {
      const urls = extractURLsFromSheet(sheet);
      allUrls.push(...urls);
    }
  }

  const unique = Array.from(new Set(allUrls));

  if (unique.length === 0) {
    throw new Error("No valid URLs found in the file.");
  }

  const truncated = unique.length > MAX_URLS;
  return {
    kind: "urls",
    urls: truncated ? unique.slice(0, MAX_URLS) : unique,
    truncated,
  };
}

/**
 * Detect whether a sheet has the columns of an exported Lighthouse report.
 */
function isExportedReportSheet(sheet: xlsx.WorkSheet): boolean {
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  if (rows.length === 0) return false;

  const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim());

  // Must have at least 3 of the 4 report score columns AND a URL column
  const hasUrl = headers.some((h) =>
    URL_HEADER_KEYWORDS.some((kw) => h.includes(kw))
  );
  const matchedScoreCols = REPORT_COLUMNS.filter((col) =>
    headers.some((h) => h === col)
  );

  return hasUrl && matchedScoreCols.length >= 3;
}

/**
 * Parse an exported report workbook into completed reports and incomplete URLs.
 */
function parseReportsFromWorkbook(workbook: xlsx.WorkBook): ParseReportsResult {
  const completedReports: LighthouseReport[] = [];
  const incompleteUrls: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
    if (rows.length === 0) continue;

    // Build a column mapping from actual header names to our canonical keys
    const rawHeaders = Object.keys(rows[0]);
    const colMap = buildColumnMapping(rawHeaders);

    if (!colMap.url) continue; // No URL column found, skip this sheet

    for (const row of rows) {
      const urlValue = String(row[colMap.url] ?? "").trim();

      // Skip AVERAGE summary rows
      if (!urlValue || urlValue.toUpperCase() === "AVERAGE") continue;

      // Skip title/spacer rows: check if the URL looks like a title or is not a valid URL
      const validatedUrl = validateUrl(urlValue);
      if (!validatedUrl) continue;

      // Extract scores
      const performance = safeNumber(row[colMap.performance ?? ""]);
      const accessibility = safeNumber(row[colMap.accessibility ?? ""]);
      const seo = safeNumber(row[colMap.seo ?? ""]);
      const bestPractices = safeNumber(row[colMap.bestPractices ?? ""]);

      // A row is "completed" if it has at least one non-zero score
      const hasScores =
        performance > 0 || accessibility > 0 || seo > 0 || bestPractices > 0;

      if (!hasScores) {
        incompleteUrls.push(validatedUrl);
        continue;
      }

      // Extract web vitals display values
      const fcp = String(row[colMap.fcp ?? ""] ?? "").trim() || "N/A";
      const lcp = String(row[colMap.lcp ?? ""] ?? "").trim() || "N/A";
      const tbt = String(row[colMap.tbt ?? ""] ?? "").trim() || "N/A";
      const cls = String(row[colMap.cls ?? ""] ?? "").trim() || "N/A";
      const tti = String(row[colMap.tti ?? ""] ?? "").trim() || "N/A";

      // Extract strategy and fetchedAt
      const strategyRaw = String(row[colMap.strategy ?? ""] ?? "").trim().toLowerCase();
      const strategyValue: "mobile" | "desktop" =
        strategyRaw === "mobile" ? "mobile" : "desktop";

      const fetchedAt = String(row[colMap.fetchedAt ?? ""] ?? "").trim() || new Date().toISOString();

      const report: LighthouseReport = {
        url: validatedUrl,
        scores: {
          performance,
          accessibility,
          seo,
          bestPractices,
        },
        coreWebVitals: {
          fcp: { value: 0, displayValue: fcp },
          lcp: { value: 0, displayValue: lcp },
          tbt: { value: 0, displayValue: tbt },
          cls: { value: 0, displayValue: cls },
          tti: { value: 0, displayValue: tti },
        },
        fetchedAt,
        strategy: strategyValue,
        loadedFromFile: true,
      };

      completedReports.push(report);
    }
  }

  // If we found nothing at all, throw
  if (completedReports.length === 0 && incompleteUrls.length === 0) {
    throw new Error("No valid URLs found in the exported report file.");
  }

  return {
    kind: "reports",
    completedReports,
    incompleteUrls: Array.from(new Set(incompleteUrls)),
  };
}

/**
 * Build a mapping from our canonical field keys to actual column header names.
 */
function buildColumnMapping(headers: string[]): Record<string, string | undefined> {
  const map: Record<string, string | undefined> = {};

  for (const header of headers) {
    const lower = header.toLowerCase().trim();

    // Check exact match in EXPORT_HEADERS_MAP
    if (EXPORT_HEADERS_MAP[lower]) {
      const canonicalKey = EXPORT_HEADERS_MAP[lower];
      map[canonicalKey] = header;
      continue;
    }

    // Fuzzy match for URL column
    if (!map.url && URL_HEADER_KEYWORDS.some((kw) => lower.includes(kw))) {
      map.url = header;
    }
  }

  return map;
}

/**
 * Safely parse a numeric value from a cell. Returns 0 for non-numeric values.
 */
function safeNumber(value: unknown): number {
  if (typeof value === "number") {
    return isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Extract URLs from a single worksheet.
 *
 * Strategy:
 * 1. If a column header matches a URL-related keyword, extract values from that column.
 * 2. Otherwise, scan every cell for values matching an http/https pattern.
 */
function extractURLsFromSheet(sheet: xlsx.WorkSheet): string[] {
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (rows.length === 0) {
    return [];
  }

  const headers = Object.keys(rows[0]);

  // Check if any header matches a URL-related keyword
  const urlHeader = headers.find((header) =>
    URL_HEADER_KEYWORDS.some((keyword) =>
      header.toLowerCase().includes(keyword)
    )
  );

  const urls: string[] = [];

  if (urlHeader) {
    // Extract from the identified URL column
    for (const row of rows) {
      const value = row[urlHeader];
      if (typeof value === "string" && value.trim()) {
        const validated = validateUrl(value.trim());
        if (validated) {
          urls.push(validated);
        }
      }
    }
  } else {
    // Scan all cells for URL patterns
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        const cellValue = row[key];
        if (typeof cellValue === "string") {
          const matches = cellValue.match(URL_PATTERN);
          if (matches) {
            for (const match of matches) {
              const validated = validateUrl(match);
              if (validated) {
                urls.push(validated);
              }
            }
          }
        }
      }
    }
  }

  return urls;
}

/**
 * Validate a string as a URL using the URL constructor.
 * Returns the href if valid, or null otherwise.
 */
function validateUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract the file extension (lowercase, including the dot) from a filename.
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) {
    return "";
  }
  return filename.slice(lastDot).toLowerCase();
}
